// Coverage Scanner Agent — monitors press coverage and backlinks.
// Uses Apify Google News actor for discovery, Claude Sonnet for classification.
// Follows the pattern from src/lib/agents/audit/press-scan.agent.ts.

import { runActor } from "@/lib/apify/client";
import { ACTOR_IDS, type GoogleSearchResult } from "@/lib/apify/actors";
import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import type {
  PressCoverageScannerAgent,
  CoverageItem,
} from "@/lib/agents/interfaces";

export class CoverageScannerAgent implements PressCoverageScannerAgent {
  name = "CoverageScannerAgent";

  async scan(
    clientName: string,
    clientUrl: string,
    _campaignIds?: string[] // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<CoverageItem[]> {
    const clientDomain = extractDomain(clientUrl);

    // Step 1: Search Google News + Web for brand mentions
    const queries = [
      `"${clientName}" news`,
      `"${clientName}" press release`,
      `"${clientName}" -site:${clientDomain}`,
    ];

    const serpInput = {
      queries: queries.join("\n"),
      maxPagesPerQuery: 2,
      resultsPerPage: 10,
      languageCode: "en",
      countryCode: "us",
      mobileResults: false,
      includeUnfilteredResults: false,
      saveHtml: false,
      saveHtmlToKeyValueStore: false,
    };

    const serpResult = await runActor<typeof serpInput, GoogleSearchResult>(
      ACTOR_IDS.GOOGLE_SEARCH_SCRAPER,
      serpInput,
      { timeoutSecs: 300, maxItems: 100 }
    );

    // Step 2: Collect third-party mentions
    const allMentions: Array<{
      url: string;
      title: string;
      snippet: string;
      position: number;
    }> = [];
    const seenUrls = new Set<string>();

    for (const page of serpResult.items) {
      for (const result of page.organicResults || []) {
        if (!result.url) continue;
        if (clientDomain && result.url.includes(clientDomain)) continue;
        if (seenUrls.has(result.url)) continue;

        seenUrls.add(result.url);
        allMentions.push({
          url: result.url,
          title: result.title || "",
          snippet: result.description || "",
          position: result.position || 0,
        });
      }
    }

    if (allMentions.length === 0) return [];

    // Step 3: Use Claude Sonnet to classify coverage items
    const classified = await this.classifyCoverage(
      clientName,
      clientUrl,
      allMentions.slice(0, 30)
    );

    return classified;
  }

  /**
   * Use Claude Sonnet to classify raw search results into structured coverage items.
   */
  private async classifyCoverage(
    clientName: string,
    clientUrl: string,
    mentions: Array<{
      url: string;
      title: string;
      snippet: string;
      position: number;
    }>
  ): Promise<CoverageItem[]> {
    const mentionList = mentions
      .map(
        (m, i) =>
          `${i + 1}. URL: ${m.url}\n   Title: ${m.title}\n   Snippet: ${m.snippet}`
      )
      .join("\n\n");

    const prompt = `Classify these web results as press coverage for "${clientName}" (${clientUrl}):

${mentionList}

For each result that is genuine press coverage (not ads, not social media posts, not the client's own content), extract:
- title: article title
- url: article URL
- publication: publication name
- author: author name if visible in snippet (or null)
- publish_date: date if visible (YYYY-MM-DD format, or null)
- coverage_type: "feature" | "mention" | "quote" | "syndication" | "backlink_only"
- has_backlink: whether the article likely links to ${clientUrl}
- backlink_url: the specific URL linked (or null)
- is_dofollow: null (cannot determine from SERP)
- estimated_domain_authority: estimate based on publication reputation (0-100 scale, null if unknown)
- sentiment: "positive" | "neutral" | "negative" | null

Return JSON array. Only include genuine coverage — skip irrelevant results.
Return ONLY valid JSON, no other text.`;

    const response = await callSonnet(prompt, {
      systemPrompt:
        "You are a PR analyst classifying press coverage results. Be accurate with coverage type classification. Only include results that are genuine third-party coverage.",
      maxTokens: 4096,
      temperature: 0.2,
    });

    return parseClaudeJson<CoverageItem[]>(response.text);
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}
