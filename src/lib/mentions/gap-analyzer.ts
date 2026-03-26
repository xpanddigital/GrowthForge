// =============================================================================
// Mention Gap Analyzer — Core Engine
// Compares brand presence vs competitor presence across platforms.
// Identifies gaps where competitors are mentioned but the client is not.
// Generates a prioritized action plan via Claude Sonnet.
// =============================================================================

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import type { MentionScanResult } from "@/lib/agents/interfaces";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface MentionGap {
  platform: string;
  gapType:
    | "competitor_present_client_absent"
    | "unlinked_mention"
    | "missing_profile"
    | "low_review_count"
    | "no_youtube_presence"
    | "no_linkedin_articles"
    | "review_gap";
  competitorName: string | null;
  opportunityUrl: string | null;
  opportunityTitle: string | null;
  recommendedAction: string;
  actionModule: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  opportunityScore: number;
}

export interface PlatformCoverage {
  platform: string;
  clientMentions: number;
  competitorMentions: number;
  totalSources: number;
  coveragePercent: number;
  profileExists: boolean;
}

export interface MentionGapAnalysis {
  totalSourcesScanned: number;
  clientPresent: number;
  competitorPresent: number;
  gaps: MentionGap[];
  platformBreakdown: PlatformCoverage[];
  coverageScore: number;
  actionPlan: Array<{
    priority: number;
    action: string;
    platform: string;
    module: string;
    impact: string;
    effort: string;
  }>;
}

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function analyzeMentionGaps(
  brandName: string,
  scanResults: MentionScanResult[],
  competitors: string[]
): Promise<MentionGapAnalysis> {
  // Aggregate across all platform scans
  const platformBreakdown: PlatformCoverage[] = [];
  const gaps: MentionGap[] = [];
  let totalSourcesScanned = 0;
  let clientPresent = 0;
  let competitorPresent = 0;

  for (const scan of scanResults) {
    const brandSources = scan.sources.filter(
      (s) => s.mentionType === "brand" || s.mentionType === "both"
    );
    const competitorSources = scan.sources.filter(
      (s) => s.mentionType === "competitor" || s.mentionType === "both"
    );

    totalSourcesScanned += scan.sources.length;
    clientPresent += brandSources.length;
    competitorPresent += competitorSources.length;

    // Platform coverage
    platformBreakdown.push({
      platform: scan.platform,
      clientMentions: brandSources.length,
      competitorMentions: competitorSources.length,
      totalSources: scan.sources.length,
      coveragePercent:
        scan.sources.length > 0
          ? Math.round((brandSources.length / scan.sources.length) * 100)
          : 0,
      profileExists: scan.profileExists,
    });

    // Identify gaps: places where competitors are but client is not
    const competitorOnlySources = scan.sources.filter(
      (s) => s.mentionType === "competitor"
    );

    for (const source of competitorOnlySources) {
      gaps.push({
        platform: scan.platform,
        gapType: "competitor_present_client_absent",
        competitorName: source.mentionedEntity,
        opportunityUrl: source.url,
        opportunityTitle: source.title,
        recommendedAction: `Get mentioned alongside ${source.mentionedEntity} on this ${scan.platform} source`,
        actionModule: getModuleForPlatform(scan.platform),
        impact: source.authorityEstimate === "high" ? "high" : "medium",
        effort: "medium",
        opportunityScore: getOpportunityScore(source.authorityEstimate),
      });
    }

    // Missing profile gap
    if (!scan.profileExists) {
      gaps.push({
        platform: scan.platform,
        gapType: "missing_profile",
        competitorName: null,
        opportunityUrl: null,
        opportunityTitle: null,
        recommendedAction: `Create a ${scan.platform} profile for ${brandName}`,
        actionModule: "entity_sync",
        impact: "high",
        effort: "low",
        opportunityScore: 90,
      });
    }

    // Review gap: if review platform and client has few reviews but competitors have many
    if (
      scan.platform === "review_sites" &&
      scan.reviewCount !== undefined &&
      scan.reviewCount < 10
    ) {
      gaps.push({
        platform: scan.platform,
        gapType: "review_gap",
        competitorName: null,
        opportunityUrl: scan.profileUrl || null,
        opportunityTitle: null,
        recommendedAction: `Increase review volume on review sites — currently only ${scan.reviewCount} reviews`,
        actionModule: "review_engine",
        impact: "high",
        effort: "medium",
        opportunityScore: 85,
      });
    }
  }

  // Sort gaps by opportunity score
  gaps.sort((a, b) => b.opportunityScore - a.opportunityScore);

  // Calculate coverage score
  const coverageScore = calculateCoverageScore(platformBreakdown);

  // Generate AI action plan
  let actionPlan: MentionGapAnalysis["actionPlan"] = [];
  if (gaps.length > 0) {
    try {
      actionPlan = await generateActionPlan(
        brandName,
        platformBreakdown,
        gaps.slice(0, 20),
        competitors
      );
    } catch {
      // Fallback: static action plan from gap data
      actionPlan = gaps.slice(0, 8).map((gap, i) => ({
        priority: i + 1,
        action: gap.recommendedAction,
        platform: gap.platform,
        module: gap.actionModule,
        impact: gap.impact,
        effort: gap.effort,
      }));
    }
  }

  return {
    totalSourcesScanned,
    clientPresent,
    competitorPresent,
    gaps: gaps.slice(0, 50), // Cap at 50 gaps
    platformBreakdown,
    coverageScore,
    actionPlan,
  };
}

// -----------------------------------------------------------------------------
// Scoring
// -----------------------------------------------------------------------------

function calculateCoverageScore(
  breakdown: PlatformCoverage[]
): number {
  if (breakdown.length === 0) return 0;

  // Weight: profile existence (40%) + coverage percent (40%) + diversity (20%)
  let profileScore = 0;
  let coverageScore = 0;
  let platformsWithPresence = 0;

  for (const platform of breakdown) {
    if (platform.profileExists) profileScore += 1;
    coverageScore += platform.coveragePercent;
    if (platform.clientMentions > 0) platformsWithPresence += 1;
  }

  const profilePct =
    (profileScore / breakdown.length) * 100;
  const coveragePct = coverageScore / breakdown.length;
  const diversityPct =
    (platformsWithPresence / breakdown.length) * 100;

  return Math.round(
    profilePct * 0.4 + coveragePct * 0.4 + diversityPct * 0.2
  );
}

function getOpportunityScore(
  authority: "high" | "medium" | "low"
): number {
  switch (authority) {
    case "high":
      return 85;
    case "medium":
      return 60;
    case "low":
      return 35;
  }
}

function getModuleForPlatform(platform: string): string {
  switch (platform) {
    case "linkedin":
      return "entity_sync";
    case "youtube":
      return "youtube_geo";
    case "review_sites":
      return "review_engine";
    default:
      return "citation_engine";
  }
}

// -----------------------------------------------------------------------------
// AI Action Plan Generation
// -----------------------------------------------------------------------------

async function generateActionPlan(
  brandName: string,
  platformBreakdown: PlatformCoverage[],
  topGaps: MentionGap[],
  competitors: string[]
): Promise<MentionGapAnalysis["actionPlan"]> {
  const platformSummary = platformBreakdown
    .map(
      (p) =>
        `${p.platform}: ${p.clientMentions} brand mentions vs ${p.competitorMentions} competitor mentions (profile: ${p.profileExists ? "yes" : "missing"})`
    )
    .join("\n");

  const gapSummary = topGaps
    .slice(0, 10)
    .map(
      (g) =>
        `[${g.platform}] ${g.gapType}: ${g.competitorName || "N/A"} at ${g.opportunityUrl || "N/A"}`
    )
    .join("\n");

  const result = await callSonnet(
    `You are an AI SEO strategist. Analyze the mention gap data for "${brandName}" vs competitors [${competitors.join(", ")}]:\n\nPlatform Coverage:\n${platformSummary}\n\nTop Gaps:\n${gapSummary}\n\nGenerate a prioritized action plan (5-8 actions) ranked by impact-to-effort ratio. Map each action to a MentionLayer module (citation_engine, entity_sync, review_engine, youtube_geo, press).\n\nReturn JSON array:\n[\n  { "priority": 1, "action": "specific action", "platform": "platform", "module": "module_name", "impact": "high|medium|low", "effort": "high|medium|low" }\n]`,
    { maxTokens: 1536 }
  );

  return parseClaudeJson<MentionGapAnalysis["actionPlan"]>(result.text);
}
