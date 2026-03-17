// Citation Audit Agent — discovers high-authority threads for the client's
// keywords and checks whether the client (or competitors) are mentioned.
//
// Data sources: Google SERPs (via Apify), thread content
// Conforms to the AuditAgent interface.

import type { AuditAgent, AuditPillarResult } from "../interfaces";
import { runActor } from "@/lib/apify/client";
import {
  ACTOR_IDS,
  buildBatchSerpInput,
  type GoogleSearchResult,
} from "@/lib/apify/actors";
import { parseSerpResults } from "@/lib/apify/parsers";

interface CitationScanClient {
  name: string;
  website_url?: string | null;
  urls_to_mention?: string[];
  brand_brief: string;
}

interface CitationScanKeyword {
  id: string;
  keyword: string;
  scan_platforms?: string[];
}

interface PlatformBreakdown {
  total: number;
  client_present: number;
  competitor_present: number;
}

interface TopOpportunity {
  url: string;
  title: string;
  google_position: number;
  snippet: string;
  platform: string;
  client_mentioned: boolean;
  competitors_mentioned: string[];
}

export class CitationScanAgent implements AuditAgent {
  name = "CitationScanAgent";
  pillar = "citations";

  async scan(
    client: Record<string, unknown>,
    keywords: Array<Record<string, unknown>>
  ): Promise<AuditPillarResult> {
    const c = client as unknown as CitationScanClient;
    const kws = keywords as unknown as CitationScanKeyword[];

    // Limit to top 20 keywords for the audit
    const activeKeywords = kws.slice(0, 20);

    // Build keyword-platform pairs for SERP scan
    const keywordInputs = activeKeywords.map((kw) => ({
      keyword: kw.keyword,
      platforms: (kw.scan_platforms || ["reddit", "quora", "facebook_groups"]) as Array<
        "reddit" | "quora" | "facebook_groups"
      >,
    }));

    // Run SERP scan via Apify
    const serpInput = buildBatchSerpInput(keywordInputs);
    const serpResult = await runActor<typeof serpInput, GoogleSearchResult>(
      ACTOR_IDS.GOOGLE_SEARCH_SCRAPER,
      serpInput,
      { timeoutSecs: 600, maxItems: 500 }
    );

    // Parse SERP results into discovered threads
    // parseSerpResults expects (items, keyword, keywordId), so we call it
    // with a generic keyword since the batch contains multiple keywords
    const discoveredThreads = parseSerpResults(
      serpResult.items,
      activeKeywords[0]?.keyword || "audit",
      activeKeywords[0]?.id || "audit"
    );

    // Build search terms for mention detection
    const brandTerms = buildBrandSearchTerms(c);
    // Competitors are extracted from brand brief (simple heuristic)
    const competitors = extractCompetitorNames(c.brand_brief);

    // Analyze each discovered thread for mentions
    const platformBreakdown: Record<string, PlatformBreakdown> = {
      reddit: { total: 0, client_present: 0, competitor_present: 0 },
      quora: { total: 0, client_present: 0, competitor_present: 0 },
      facebook_groups: { total: 0, client_present: 0, competitor_present: 0 },
    };

    let threadsWithClientMention = 0;
    let threadsWithCompetitorMention = 0;
    let threadsWithNoMention = 0;
    const competitorShareMap: Record<string, number> = {};
    const topOpportunities: TopOpportunity[] = [];

    for (const thread of discoveredThreads) {
      const platform = thread.platform;
      const searchableText = `${thread.title} ${thread.snippet}`.toLowerCase();

      if (platformBreakdown[platform]) {
        platformBreakdown[platform].total++;
      }

      const clientMentioned = brandTerms.some((term) =>
        searchableText.includes(term.toLowerCase())
      );

      const mentionedCompetitors: string[] = [];
      for (const comp of competitors) {
        if (searchableText.includes(comp.toLowerCase())) {
          mentionedCompetitors.push(comp);
          competitorShareMap[comp] = (competitorShareMap[comp] || 0) + 1;
          if (platformBreakdown[platform]) {
            platformBreakdown[platform].competitor_present++;
          }
        }
      }

      if (clientMentioned) {
        threadsWithClientMention++;
        if (platformBreakdown[platform]) {
          platformBreakdown[platform].client_present++;
        }
      } else if (mentionedCompetitors.length > 0) {
        threadsWithCompetitorMention++;
      } else {
        threadsWithNoMention++;
      }

      // Track top opportunities (high position, not yet mentioned)
      if (!clientMentioned && (thread.position ?? 100) <= 20) {
        topOpportunities.push({
          url: thread.url,
          title: thread.title,
          google_position: thread.position ?? 0,
          snippet: thread.snippet,
          platform: thread.platform,
          client_mentioned: false,
          competitors_mentioned: mentionedCompetitors,
        });
      }
    }

    // Sort opportunities by Google position
    topOpportunities.sort((a, b) => a.google_position - b.google_position);
    const topOps = topOpportunities.slice(0, 10);

    const totalThreads = discoveredThreads.length;
    const gapPercentage =
      totalThreads > 0
        ? Math.round(((totalThreads - threadsWithClientMention) / totalThreads) * 1000) / 10
        : 100;

    // Calculate score
    const score = calculateCitationScore(
      threadsWithClientMention,
      totalThreads,
      competitorShareMap,
      topOpportunities.length
    );

    const findings = {
      total_threads_found: totalThreads,
      threads_with_client_mention: threadsWithClientMention,
      threads_with_competitor_mention: threadsWithCompetitorMention,
      threads_with_no_mentions: threadsWithNoMention,
      platform_breakdown: platformBreakdown,
      top_opportunities: topOps,
      competitor_share: competitorShareMap,
      gap_percentage: gapPercentage,
    };

    const recommendations = generateCitationRecommendations(findings, c.name);

    return {
      score,
      findings,
      summary: generateCitationSummary(findings, c.name),
      recommendations,
    };
  }
}

function buildBrandSearchTerms(client: CitationScanClient): string[] {
  const terms = [client.name];
  if (client.website_url) {
    // Extract domain from URL
    try {
      const domain = new URL(client.website_url).hostname.replace("www.", "");
      terms.push(domain);
    } catch {
      // Invalid URL, skip
    }
  }
  if (client.urls_to_mention) {
    for (const url of client.urls_to_mention) {
      try {
        const domain = new URL(url).hostname.replace("www.", "");
        terms.push(domain);
      } catch {
        // Invalid URL, skip
      }
    }
  }
  return terms;
}

function extractCompetitorNames(brandBrief: string): string[] {
  // Simple heuristic: look for competitor mentions in brand brief
  // In production, this would be stored explicitly on the client
  const competitorPatterns = [
    /(?:competitor|vs\.?|versus|alternative to|compared to|unlike)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/gi,
  ];
  const names = new Set<string>();
  for (const pattern of competitorPatterns) {
    let match;
    while ((match = pattern.exec(brandBrief)) !== null) {
      names.add(match[1].trim());
    }
  }
  return Array.from(names);
}

function calculateCitationScore(
  clientMentions: number,
  totalThreads: number,
  competitorShare: Record<string, number>,
  opportunityCount: number
): number {
  if (totalThreads === 0) return 0;

  // (threads_with_client_mention / total_threads_found) * 40
  const mentionRate = (clientMentions / totalThreads) * 40;

  // (1 - competitor_dominance_ratio) * 30
  const totalCompetitorMentions = Object.values(competitorShare).reduce(
    (sum, v) => sum + v,
    0
  );
  const competitorDominance =
    totalThreads > 0 ? totalCompetitorMentions / totalThreads : 0;
  const competitorScore = (1 - Math.min(competitorDominance, 1)) * 30;

  // opportunity_density * 30
  const opportunityDensity =
    totalThreads > 0 ? opportunityCount / totalThreads : 0;
  const opportunityScore = Math.min(opportunityDensity, 1) * 30;

  return Math.round(mentionRate + competitorScore + opportunityScore);
}

function generateCitationSummary(
  findings: Record<string, unknown>,
  brandName: string
): string {
  const total = findings.total_threads_found as number;
  const clientMentions = findings.threads_with_client_mention as number;
  const gap = findings.gap_percentage as number;

  if (total === 0) {
    return `No high-authority threads were found for ${brandName}'s target keywords. Consider expanding keyword coverage.`;
  }

  return `Found ${total} high-authority threads across target keywords. ${brandName} is mentioned in ${clientMentions} (${(100 - gap).toFixed(1)}%), leaving a ${gap}% citation gap. ${
    clientMentions === 0
      ? "The brand has zero presence in these conversations — significant untapped opportunity."
      : `Current presence is ${clientMentions < 5 ? "minimal" : "moderate"}, with room for growth.`
  }`;
}

function generateCitationRecommendations(
  findings: Record<string, unknown>,
  brandName: string
): AuditPillarResult["recommendations"] {
  const recommendations: AuditPillarResult["recommendations"] = [];
  const topOps = (findings.top_opportunities as TopOpportunity[]) || [];
  const gap = (findings.gap_percentage as number) || 100;

  if (gap > 80) {
    recommendations.push({
      action: `Seed ${Math.min(topOps.length, 20)} high-authority threads where ${brandName} has no presence`,
      impact: "high",
      effort: "low",
    });
  }

  const competitorShare = (findings.competitor_share as Record<string, number>) || {};
  const topCompetitor = Object.entries(competitorShare).sort(
    ([, a], [, b]) => b - a
  )[0];
  if (topCompetitor) {
    recommendations.push({
      action: `Target threads where ${topCompetitor[0]} is mentioned (${topCompetitor[1]} threads) to establish competitive presence`,
      impact: "high",
      effort: "medium",
    });
  }

  const platformBreakdown = findings.platform_breakdown as Record<
    string,
    PlatformBreakdown
  >;
  if (platformBreakdown) {
    const platforms = Object.entries(platformBreakdown)
      .filter(([, data]) => data.total > 0 && data.client_present === 0)
      .map(([platform]) => platform);
    if (platforms.length > 0) {
      recommendations.push({
        action: `Expand citation presence to ${platforms.join(", ")} where ${brandName} currently has zero mentions`,
        impact: "medium",
        effort: "low",
      });
    }
  }

  if (topOps.length > 0) {
    const highPositionOps = topOps.filter((op) => op.google_position <= 5);
    if (highPositionOps.length > 0) {
      recommendations.push({
        action: `Prioritize ${highPositionOps.length} threads ranking in Google positions 1-5 for maximum visibility impact`,
        impact: "high",
        effort: "low",
      });
    }
  }

  return recommendations;
}
