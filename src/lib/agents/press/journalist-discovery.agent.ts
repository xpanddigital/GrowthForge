// Journalist Discovery Agent — two-phase, database-first discovery.
// Phase A: Extract keywords from press release → query journalists DB → batch score.
// Phase B: Perplexity gap-fill (only if DB results < target) → parse → dedup → insert → score.
//
// Follows the Perplexity call pattern from src/lib/ai/probe-ai-models.ts.

import OpenAI from "openai";
import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import { buildKeywordExtractPrompt } from "./prompts/keyword-extract";
import type { ExtractedCriteria } from "./prompts/keyword-extract";
import { JournalistScorerAgent } from "./journalist-scorer.agent";
import { withRetry } from "@/lib/utils/retry";
import { AIGenerationError } from "@/lib/utils/errors";
import { createAdminClient } from "@/lib/inngest/admin-client";
import type {
  PressJournalistDiscoveryAgent,
  JournalistDiscoveryResult,
  JournalistScoreResult,
  DiscoveredJournalist,
} from "@/lib/agents/interfaces";
import type { Journalist } from "@/types/database";

const DEFAULT_TARGET_COUNT = 30;

export class JournalistDiscoveryAgent implements PressJournalistDiscoveryAgent {
  name = "JournalistDiscoveryAgent";

  private scorer = new JournalistScorerAgent();

  async discover(
    pressRelease: { title: string; body: string; region: string; type: string },
    agencyId: string,
    targetCount?: number
  ): Promise<JournalistDiscoveryResult> {
    const target = targetCount ?? DEFAULT_TARGET_COUNT;

    // Phase A: Extract search criteria from press release
    const criteria = await this.extractCriteria(pressRelease.body, pressRelease.region);

    // Phase A: Query journalists DB
    const dbJournalists = await this.queryDatabase(agencyId, criteria);

    // Phase A: Score DB journalists
    const dbScored = await this.scoreJournalists(dbJournalists, pressRelease);

    // Phase B: Perplexity gap-fill if we need more
    let discoveredJournalists: Array<DiscoveredJournalist & { score?: JournalistScoreResult }> = [];
    let perplexityCount = 0;

    if (dbScored.length < target) {
      const gap = target - dbScored.length;
      const raw = await this.perplexityDiscover(criteria, pressRelease, gap);

      // Dedup against DB journalists
      const dbNames = new Set(dbJournalists.map((j) => j.name.toLowerCase()));
      const deduped = raw.filter((j) => !dbNames.has(j.name.toLowerCase()));

      // Insert discovered journalists into DB for compounding
      const inserted = await this.insertDiscoveredJournalists(agencyId, deduped);

      // Score the newly discovered journalists
      if (inserted.length > 0) {
        const scorable = inserted.map((j, i) => ({
          index: i,
          name: j.name,
          publication: j.publication,
          region: j.region ?? pressRelease.region,
          recentArticlesSummary: j.recent_articles
            .map((a) => `${a.title} (${a.date})`)
            .join("; "),
        }));

        const scores = await this.scorer.scoreBatch(scorable, pressRelease);
        discoveredJournalists = inserted.map((j, i) => ({
          ...j,
          score: scores.find((s) => s.journalist_index === i),
        }));
      }

      perplexityCount = deduped.length;
    }

    return {
      db_journalists: dbScored,
      discovered_journalists: discoveredJournalists,
      total_found: dbScored.length + discoveredJournalists.length,
      db_count: dbScored.length,
      perplexity_count: perplexityCount,
    };
  }

  /**
   * Phase A: Use Sonnet to extract search criteria from the press release.
   */
  private async extractCriteria(
    pressReleaseBody: string,
    targetRegion: string
  ): Promise<ExtractedCriteria> {
    const { system, user } = buildKeywordExtractPrompt(pressReleaseBody, targetRegion);

    const response = await callSonnet(user, {
      systemPrompt: system,
      maxTokens: 2048,
      temperature: 0.2,
    });

    return parseClaudeJson<ExtractedCriteria>(response.text);
  }

  /**
   * Phase A: Query the journalists table using extracted criteria.
   */
  private async queryDatabase(
    agencyId: string,
    criteria: ExtractedCriteria
  ): Promise<Journalist[]> {
    const supabase = createAdminClient();

    // Build search terms from criteria
    const searchTerms = [
      ...criteria.primary_keywords,
      ...criteria.relevant_beats,
      ...criteria.relevant_industries,
    ];

    // Search journalists by beats and publications, scoped to agency
    const { data, error } = await supabase
      .from("journalists")
      .select("*")
      .eq("agency_id", agencyId)
      .or(
        searchTerms
          .slice(0, 5) // Limit OR clauses
          .map((term) => `beats.cs.{${term}}`)
          .join(",")
      )
      .limit(50);

    if (error) {
      // Fall back to broader search on failure
      const { data: fallback } = await supabase
        .from("journalists")
        .select("*")
        .eq("agency_id", agencyId)
        .limit(50);

      return (fallback as Journalist[]) ?? [];
    }

    // Also search by target publications if we got few results
    if ((data?.length ?? 0) < 10 && criteria.target_publications.length > 0) {
      const { data: pubData } = await supabase
        .from("journalists")
        .select("*")
        .eq("agency_id", agencyId)
        .in("publication", criteria.target_publications.slice(0, 10))
        .limit(30);

      if (pubData) {
        const existingIds = new Set((data ?? []).map((j: Journalist) => j.id));
        const newJournalists = pubData.filter(
          (j: Journalist) => !existingIds.has(j.id)
        );
        return [...(data ?? []), ...newJournalists] as Journalist[];
      }
    }

    return (data as Journalist[]) ?? [];
  }

  /**
   * Score DB journalists using the scorer agent and attach scores.
   */
  private async scoreJournalists(
    journalists: Journalist[],
    pressRelease: { title: string; body: string; region: string; type: string }
  ): Promise<Array<Journalist & { score?: JournalistScoreResult }>> {
    if (journalists.length === 0) return [];

    const scorable = journalists.map((j, i) => ({
      index: i,
      name: j.name,
      publication: j.publication,
      region: j.region ?? "",
      recentArticlesSummary: Array.isArray(j.recent_articles)
        ? (j.recent_articles as Array<{ title: string; date: string }>)
            .slice(0, 3)
            .map((a) => `${a.title} (${a.date})`)
            .join("; ")
        : "",
    }));

    const scores = await this.scorer.scoreBatch(scorable, pressRelease);

    return journalists.map((j, i) => ({
      ...j,
      score: scores.find((s) => s.journalist_index === i),
    }));
  }

  /**
   * Phase B: Use Perplexity to discover journalists not in our DB.
   */
  private async perplexityDiscover(
    criteria: ExtractedCriteria,
    pressRelease: { title: string; body: string; region: string; type: string },
    targetGap: number
  ): Promise<DiscoveredJournalist[]> {
    const queries = this.buildPerplexityQueries(criteria, pressRelease);
    const allDiscovered: DiscoveredJournalist[] = [];
    const seenNames = new Set<string>();

    for (const query of queries) {
      if (allDiscovered.length >= targetGap) break;

      try {
        const responseText = await this.callPerplexity(query);
        const parsed = await this.parseJournalistResponse(responseText, pressRelease.region);

        for (const journalist of parsed) {
          const key = journalist.name.toLowerCase();
          if (!seenNames.has(key)) {
            seenNames.add(key);
            allDiscovered.push(journalist);
          }
        }
      } catch {
        // Continue on individual query failure
      }

      // Rate limit pause
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    return allDiscovered.slice(0, targetGap);
  }

  /**
   * Build Perplexity search queries from extracted criteria.
   */
  private buildPerplexityQueries(
    criteria: ExtractedCriteria,
    pressRelease: { title: string; region: string }
  ): string[] {
    const queries: string[] = [];

    // Primary: beat-specific journalist search
    for (const beat of criteria.relevant_beats.slice(0, 2)) {
      queries.push(
        `Who are the top journalists covering ${beat} in ${pressRelease.region}? ` +
        `List their names, publications, email addresses if available, and recent articles. ` +
        `Focus on journalists who write about ${criteria.primary_keywords.join(", ")}.`
      );
    }

    // Secondary: publication-specific search
    if (criteria.target_publications.length > 0) {
      queries.push(
        `Find journalists at ${criteria.target_publications.slice(0, 5).join(", ")} ` +
        `who cover ${criteria.relevant_industries.join(" or ")}. ` +
        `Include their names, beats, and recent article titles.`
      );
    }

    // Tertiary: story-angle specific search
    queries.push(
      `Which journalists would be interested in a press release titled "${pressRelease.title}"? ` +
      `Find reporters covering ${criteria.primary_keywords.slice(0, 3).join(", ")} ` +
      `in ${pressRelease.region}. Include names, publications, and contact details.`
    );

    return queries;
  }

  /**
   * Call Perplexity API for journalist discovery.
   * Uses the same OpenAI-compatible pattern as probe-ai-models.ts.
   */
  private async callPerplexity(query: string): Promise<string> {
    return withRetry(
      async () => {
        const apiKey = process.env.PERPLEXITY_API_KEY;
        if (!apiKey) {
          throw new AIGenerationError(
            "perplexity",
            "PERPLEXITY_API_KEY environment variable is not set"
          );
        }

        const client = new OpenAI({
          apiKey,
          baseURL: "https://api.perplexity.ai",
        });

        const response = await client.chat.completions.create({
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content:
                "You are a media relations researcher. Find real journalists with verifiable details. " +
                "Include full names, publication names, email addresses when available, beats they cover, " +
                "and titles of their recent articles with dates. Be specific and accurate.",
            },
            { role: "user", content: query },
          ],
          max_tokens: 4096,
          temperature: 0.3,
        });

        return response.choices[0]?.message?.content || "";
      },
      { maxRetries: 2, baseDelayMs: 2000, maxDelayMs: 15000 }
    );
  }

  /**
   * Parse Perplexity's unstructured response into DiscoveredJournalist objects.
   * Uses Sonnet for reliable extraction.
   */
  private async parseJournalistResponse(
    responseText: string,
    targetRegion: string
  ): Promise<DiscoveredJournalist[]> {
    const prompt = `Extract journalist information from this text. For each journalist found, extract:
- name (full name)
- email (if mentioned, otherwise null)
- publication (main outlet)
- publication_domain (domain of the publication, e.g. "nytimes.com")
- region (guess from context or default to "${targetRegion}")
- beats (array of topics they cover)
- beat_summary (one-line description of their beat)
- recent_articles (array of {title, url, date, summary} — include what's available)

Text to parse:
${responseText}

Return JSON array of journalist objects. Return ONLY valid JSON, no other text.
If no journalists can be extracted, return an empty array [].`;

    const response = await callSonnet(prompt, {
      systemPrompt: "You extract structured data from text. Return only valid JSON arrays.",
      maxTokens: 4096,
      temperature: 0.1,
    });

    return parseClaudeJson<DiscoveredJournalist[]>(response.text);
  }

  /**
   * Insert discovered journalists into the DB for compounding value.
   */
  private async insertDiscoveredJournalists(
    agencyId: string,
    journalists: DiscoveredJournalist[]
  ): Promise<DiscoveredJournalist[]> {
    if (journalists.length === 0) return [];

    const supabase = createAdminClient();
    const inserted: DiscoveredJournalist[] = [];

    for (const j of journalists) {
      // Skip journalists without a name or publication
      if (!j.name || !j.publication) continue;

      // Check for existing journalist (by name + publication)
      const { data: existing } = await supabase
        .from("journalists")
        .select("id")
        .eq("agency_id", agencyId)
        .eq("name", j.name)
        .eq("publication", j.publication)
        .maybeSingle();

      if (existing) continue; // Already in DB

      const { error } = await supabase.from("journalists").insert({
        agency_id: agencyId,
        name: j.name,
        email: j.email,
        publication: j.publication,
        publication_domain: j.publication_domain,
        region: j.region,
        beats: j.beats,
        beat_summary: j.beat_summary,
        recent_articles: j.recent_articles,
        source: "perplexity_discovery",
      });

      if (!error) {
        inserted.push(j);
      }
    }

    return inserted;
  }
}
