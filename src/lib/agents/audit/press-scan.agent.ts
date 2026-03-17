// Press / Earned Media Audit Agent — measures the client's third-party media
// footprint — the signals that AI models use to determine brand authority.
//
// Data sources: Google News, Google web search, Apify actors
// Conforms to the AuditAgent interface.

import type { AuditAgent, AuditPillarResult } from "../interfaces";
import { runActor } from "@/lib/apify/client";
import { ACTOR_IDS, type GoogleSearchResult } from "@/lib/apify/actors";
import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

interface PressClient {
  name: string;
  website_url?: string | null;
  brand_brief: string;
}

type MentionType =
  | "news_article"
  | "press_release"
  | "guest_post"
  | "podcast"
  | "award_or_list"
  | "social_mention"
  | "directory_listing"
  | "other";

interface PressMention {
  title: string;
  url: string;
  publication: string;
  date: string | null;
  type: MentionType;
  has_link: boolean;
  estimated_authority: "high" | "medium" | "low";
}

export class PressScanAgent implements AuditAgent {
  name = "PressScanAgent";
  pillar = "press";

  async scan(
    client: Record<string, unknown>,
    _keywords: Array<Record<string, unknown>> // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<AuditPillarResult> {
    const c = client as unknown as PressClient;
    const clientDomain = c.website_url ? extractDomain(c.website_url) : "";

    // Step 1: Search Google News for brand mentions (last 12 months)
    // Step 2: Search Google for third-party mentions
    // Step 3: Search for founder/team mentions (thought leadership)
    const queries = [
      `"${c.name}" news`,
      `"${c.name}" -site:${clientDomain}`,
      `"${c.name}" press release OR featured OR interview`,
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

    // Collect all third-party mentions (exclude client's own domain)
    const allMentions: Array<{ url: string; title: string; snippet: string; position: number }> = [];
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

    // Step 4: Use Claude to classify mentions
    let classifiedMentions: PressMention[] = [];
    if (allMentions.length > 0) {
      try {
        classifiedMentions = await classifyMentions(
          c.name,
          allMentions.slice(0, 30) // Limit for Claude context
        );
      } catch {
        // Fall back to basic classification
        classifiedMentions = allMentions.map((m) => ({
          title: m.title,
          url: m.url,
          publication: extractPublication(m.url),
          date: null,
          type: "other" as MentionType,
          has_link: true,
          estimated_authority: estimateAuthority(m.position) as "high" | "medium" | "low",
        }));
      }
    }

    // Step 5: Search for competitor mentions for comparison
    const competitors = extractCompetitors(c.brand_brief);
    const competitorMentions: Record<string, number> = {};

    if (competitors.length > 0) {
      for (const comp of competitors.slice(0, 2)) {
        try {
          const compInput = {
            queries: `"${comp}" press release OR news OR featured`,
            maxPagesPerQuery: 1,
            resultsPerPage: 10,
            languageCode: "en",
            countryCode: "us",
            mobileResults: false,
            includeUnfilteredResults: false,
            saveHtml: false,
            saveHtmlToKeyValueStore: false,
          };

          const compResult = await runActor<typeof compInput, GoogleSearchResult>(
            ACTOR_IDS.GOOGLE_SEARCH_SCRAPER,
            compInput,
            { timeoutSecs: 120, maxItems: 20 }
          );

          let count = 0;
          for (const page of compResult.items) {
            count += (page.organicResults || []).length;
          }
          competitorMentions[comp] = count;
        } catch {
          // Skip competitor on failure
        }
      }
    }

    // Step 6: Aggregate metrics
    const mentionTypes: Record<string, number> = {};
    let highAuthorityMentions = 0;
    let mentionsWithLinks = 0;
    let unlinkedMentions = 0;
    const publications = new Set<string>();

    for (const mention of classifiedMentions) {
      mentionTypes[mention.type] = (mentionTypes[mention.type] || 0) + 1;
      if (mention.estimated_authority === "high") highAuthorityMentions++;
      if (mention.has_link) mentionsWithLinks++;
      else unlinkedMentions++;
      publications.add(mention.publication);
    }

    const totalMentions = classifiedMentions.length;
    const uniquePublications = publications.size;
    const mostRecentMention = classifiedMentions
      .filter((m) => m.date)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0]?.date || null;

    // Estimate thought leadership from mentions containing personal names
    const thoughtLeadershipScore = classifiedMentions.filter(
      (m) => m.type === "guest_post" || m.type === "podcast"
    ).length * 5;

    // Calculate velocity (approximate)
    const mentionVelocity = totalMentions > 0 ? Math.round((totalMentions / 12) * 10) / 10 : 0;

    // Calculate score
    const score = calculatePressScore(
      totalMentions,
      highAuthorityMentions,
      mentionTypes,
      mostRecentMention,
      mentionsWithLinks,
      totalMentions,
      thoughtLeadershipScore
    );

    const findings = {
      total_mentions: totalMentions,
      mention_types: mentionTypes,
      high_authority_mentions: highAuthorityMentions,
      unique_publications: uniquePublications,
      mentions_with_links: mentionsWithLinks,
      unlinked_mentions: unlinkedMentions,
      most_recent_mention: mostRecentMention,
      mention_velocity: mentionVelocity,
      top_mentions: classifiedMentions
        .filter((m) => m.estimated_authority === "high")
        .slice(0, 5),
      competitor_mentions: competitorMentions,
      thought_leadership_score: thoughtLeadershipScore,
    };

    return {
      score,
      findings,
      summary: generatePressSummary(findings, c.name, score),
      recommendations: generatePressRecommendations(findings, c.name),
    };
  }
}

async function classifyMentions(
  brandName: string,
  mentions: Array<{ url: string; title: string; snippet: string; position: number }>
): Promise<PressMention[]> {
  const mentionDescriptions = mentions
    .map(
      (m, i) =>
        `${i + 1}. URL: ${m.url}\n   Title: ${m.title}\n   Snippet: ${m.snippet}`
    )
    .join("\n\n");

  const prompt = `Classify these web mentions of "${brandName}":

${mentionDescriptions}

For each mention, determine:
1. Publication name (from URL domain)
2. Type: news_article | press_release | guest_post | podcast | award_or_list | social_mention | directory_listing | other
3. Date mentioned (from snippet or null)
4. Whether it likely links to ${brandName}'s website (has_link)
5. Authority estimate: high (major publication/well-known site), medium (industry site), low (blog/small site)

Return JSON array:
[{
  "title": "...",
  "url": "...",
  "publication": "...",
  "date": "2025-11-15" or null,
  "type": "news_article",
  "has_link": true,
  "estimated_authority": "high"
}]`;

  const result = await callSonnet(prompt, {
    systemPrompt:
      "You are a PR/media analyst. Classify brand mentions by type and authority. Be accurate with classification.",
    maxTokens: 4096,
    temperature: 0.2,
  });

  return parseClaudeJson(result.text);
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function extractPublication(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    // Return the main domain name
    const parts = hostname.split(".");
    return parts.length >= 2 ? parts[parts.length - 2] : hostname;
  } catch {
    return "unknown";
  }
}

function estimateAuthority(position: number): string {
  if (position <= 3) return "high";
  if (position <= 10) return "medium";
  return "low";
}

function extractCompetitors(brandBrief: string): string[] {
  const patterns = [
    /(?:competitor|vs\.?|versus|alternative|compared to)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/gi,
  ];
  const names = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(brandBrief)) !== null) {
      names.add(match[1].trim());
    }
  }
  return Array.from(names).slice(0, 3);
}

function calculatePressScore(
  totalMentions: number,
  highAuthorityMentions: number,
  mentionTypes: Record<string, number>,
  mostRecentMention: string | null,
  mentionsWithLinks: number,
  _totalForLinkRatio: number,
  thoughtLeadershipScore: number
): number {
  // mention_volume_score * 20: log scale
  let volumeScore: number;
  if (totalMentions === 0) volumeScore = 0;
  else if (totalMentions < 5) volumeScore = 5;
  else if (totalMentions < 15) volumeScore = 10;
  else if (totalMentions < 30) volumeScore = 15;
  else volumeScore = 20;

  // authority_score * 25: weighted by publication authority
  const authorityScore =
    totalMentions > 0
      ? (highAuthorityMentions / totalMentions) * 25
      : 0;

  // diversity_score * 20: variety of mention types
  const typeCount = Object.keys(mentionTypes).filter(
    (k) => (mentionTypes[k] || 0) > 0
  ).length;
  const diversityScore = Math.min((typeCount / 5) * 20, 20);

  // recency_score * 15: freshness of most recent mention
  let recencyScore = 0;
  if (mostRecentMention) {
    const daysSinceMention = Math.floor(
      (Date.now() - new Date(mostRecentMention).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceMention < 30) recencyScore = 15;
    else if (daysSinceMention < 90) recencyScore = 10;
    else if (daysSinceMention < 180) recencyScore = 5;
    else recencyScore = 2;
  }

  // link_ratio * 10
  const linkRatio =
    totalMentions > 0 ? (mentionsWithLinks / totalMentions) * 10 : 0;

  // thought_leadership * 10
  const tlScore = Math.min(thoughtLeadershipScore, 10);

  return Math.round(
    volumeScore + authorityScore + diversityScore + recencyScore + linkRatio + tlScore
  );
}

function generatePressSummary(
  findings: Record<string, unknown>,
  brandName: string,
  score: number
): string {
  const total = findings.total_mentions as number;
  const highAuth = findings.high_authority_mentions as number;
  const unique = findings.unique_publications as number;

  if (total === 0) {
    return `${brandName} has no discoverable press or earned media mentions. This significantly limits AI model awareness of the brand. Score: ${score}/100.`;
  }

  return `${brandName} has ${total} press/media mentions across ${unique} publications, with ${highAuth} from high-authority sources. Score: ${score}/100. ${
    total < 10
      ? "Media presence is thin — a targeted PR campaign could significantly boost AI visibility."
      : "Solid media footprint with room for strategic expansion."
  }`;
}

function generatePressRecommendations(
  findings: Record<string, unknown>,
  brandName: string
): AuditPillarResult["recommendations"] {
  const recommendations: AuditPillarResult["recommendations"] = [];
  const total = findings.total_mentions as number;
  const unlinked = findings.unlinked_mentions as number;
  const mentionTypes = findings.mention_types as Record<string, number>;
  const tl = findings.thought_leadership_score as number;

  if (total < 10) {
    recommendations.push({
      action: `Launch a digital PR campaign targeting 5-10 industry publications to establish ${brandName}'s media presence`,
      impact: "high",
      effort: "high",
    });
  }

  if (unlinked > 0) {
    recommendations.push({
      action: `Reach out to ${unlinked} publications with unlinked ${brandName} mentions to request backlink addition`,
      impact: "medium",
      effort: "low",
    });
  }

  if (!mentionTypes["guest_post"] && !mentionTypes["podcast"]) {
    recommendations.push({
      action: `Start guest posting and podcast appearances to build thought leadership signals for ${brandName}`,
      impact: "high",
      effort: "medium",
    });
  }

  if (tl < 5) {
    recommendations.push({
      action: "Build personal brand content for founders/key team members — AI models weight individual expertise signals",
      impact: "medium",
      effort: "medium",
    });
  }

  if (total > 0 && !(mentionTypes["news_article"])) {
    recommendations.push({
      action: `Pursue newsworthy coverage — ${brandName} has mentions but no news articles, which carry the highest authority with AI models`,
      impact: "high",
      effort: "high",
    });
  }

  return recommendations;
}
