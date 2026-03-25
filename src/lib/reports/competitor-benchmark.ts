// =============================================================================
// Competitor Benchmarking Reports
// Aggregates data from audit scores, AI Monitor SoM, mention gaps,
// review scores, and press coverage into a comprehensive comparison report.
// Uses Claude Opus for executive summary generation.
// =============================================================================

import { callOpus, parseClaudeJson } from "@/lib/ai/claude";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CompetitorMetric {
  name: string;
  clientValue: number | string;
  competitorValues: Record<string, number | string>;
  unit: string;
  higherIsBetter: boolean;
}

export interface CompetitorReportData {
  clientName: string;
  competitors: string[];
  generatedAt: string;
  dateRange: { start: string; end: string };

  // Pillar scores comparison
  pillarComparison: {
    pillar: string;
    clientScore: number | null;
    competitorScores: Record<string, number | null>;
  }[];

  // Share of Model comparison
  shareOfModel: {
    model: string;
    clientSom: number;
    competitorSom: Record<string, number>;
  }[];

  // Key metrics
  metrics: CompetitorMetric[];

  // AI-generated insights
  executiveSummary: string;
  keyFindings: string[];
  recommendations: Array<{
    priority: number;
    action: string;
    impact: "high" | "medium" | "low";
    relatesTo: string;
  }>;

  // Overall scores
  clientCompositeScore: number | null;
  competitorCompositeScores: Record<string, number | null>;
}

// -----------------------------------------------------------------------------
// Types for DB inputs
// -----------------------------------------------------------------------------

export interface AuditData {
  composite_score: number | null;
  citation_score: number | null;
  ai_presence_score: number | null;
  entity_score: number | null;
  review_score: number | null;
  press_score: number | null;
}

export interface MonitorSomData {
  model: string;
  clientSom: number;
  competitorSom: Record<string, number>;
}

export interface MentionData {
  platform: string;
  clientMentions: number;
  competitorMentions: Record<string, number>;
}

export interface ReviewData {
  clientReviews: number;
  clientRating: number | null;
  competitorReviews: Record<string, number>;
  competitorRatings: Record<string, number | null>;
}

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function generateCompetitorReport(
  clientName: string,
  competitors: string[],
  auditData: AuditData | null,
  somData: MonitorSomData[],
  mentionData: MentionData[],
  reviewData: ReviewData | null
): Promise<CompetitorReportData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Build pillar comparison
  const pillarComparison = buildPillarComparison(auditData, competitors);

  // Build share of model comparison
  const shareOfModel = somData;

  // Build key metrics
  const metrics = buildMetrics(
    clientName,
    competitors,
    somData,
    mentionData,
    reviewData
  );

  // Calculate composite scores
  const clientCompositeScore = auditData?.composite_score ?? null;
  const competitorCompositeScores: Record<string, number | null> = {};
  for (const comp of competitors) {
    competitorCompositeScores[comp] = null; // Competitors don't have audit data (yet)
  }

  // Generate executive summary via Claude Opus
  let executiveSummary = "";
  let keyFindings: string[] = [];
  let recommendations: CompetitorReportData["recommendations"] = [];

  try {
    const aiResult = await generateExecutiveSummary(
      clientName,
      competitors,
      pillarComparison,
      somData,
      metrics
    );
    executiveSummary = aiResult.executiveSummary;
    keyFindings = aiResult.keyFindings;
    recommendations = aiResult.recommendations;
  } catch {
    executiveSummary = `Competitor benchmark report for ${clientName} vs ${competitors.join(", ")}. AI summary generation unavailable.`;
    keyFindings = [];
    recommendations = [];
  }

  return {
    clientName,
    competitors,
    generatedAt: now.toISOString(),
    dateRange: {
      start: thirtyDaysAgo.toISOString().split("T")[0],
      end: now.toISOString().split("T")[0],
    },
    pillarComparison,
    shareOfModel,
    metrics,
    executiveSummary,
    keyFindings,
    recommendations,
    clientCompositeScore,
    competitorCompositeScores,
  };
}

// -----------------------------------------------------------------------------
// Data Building
// -----------------------------------------------------------------------------

function buildPillarComparison(
  auditData: AuditData | null,
  competitors: string[]
): CompetitorReportData["pillarComparison"] {
  const pillars = [
    "citations",
    "ai_presence",
    "entities",
    "reviews",
    "press",
  ] as const;

  const pillarScoreKeys: Record<string, keyof AuditData> = {
    citations: "citation_score",
    ai_presence: "ai_presence_score",
    entities: "entity_score",
    reviews: "review_score",
    press: "press_score",
  };

  return pillars.map((pillar) => {
    const competitorScores: Record<string, number | null> = {};
    for (const comp of competitors) {
      competitorScores[comp] = null;
    }

    return {
      pillar,
      clientScore: auditData
        ? (auditData[pillarScoreKeys[pillar]] as number | null)
        : null,
      competitorScores,
    };
  });
}

function buildMetrics(
  clientName: string,
  competitors: string[],
  somData: MonitorSomData[],
  mentionData: MentionData[],
  reviewData: ReviewData | null
): CompetitorMetric[] {
  const metrics: CompetitorMetric[] = [];

  // Average SoM across all models
  if (somData.length > 0) {
    const clientAvgSom =
      somData.reduce((sum, s) => sum + s.clientSom, 0) / somData.length;

    const competitorAvgSom: Record<string, number | string> = {};
    for (const comp of competitors) {
      const compSoms = somData
        .map((s) => s.competitorSom[comp])
        .filter((v) => v !== undefined);
      competitorAvgSom[comp] =
        compSoms.length > 0
          ? Math.round(
              compSoms.reduce((a, b) => a + b, 0) / compSoms.length
            )
          : "N/A";
    }

    metrics.push({
      name: "Average Share of Model",
      clientValue: Math.round(clientAvgSom),
      competitorValues: competitorAvgSom,
      unit: "%",
      higherIsBetter: true,
    });
  }

  // Total mentions across platforms
  if (mentionData.length > 0) {
    const clientMentions = mentionData.reduce(
      (sum, m) => sum + m.clientMentions,
      0
    );

    const competitorMentions: Record<string, number | string> = {};
    for (const comp of competitors) {
      competitorMentions[comp] = mentionData.reduce(
        (sum, m) => sum + (m.competitorMentions[comp] || 0),
        0
      );
    }

    metrics.push({
      name: "Total Brand Mentions",
      clientValue: clientMentions,
      competitorValues: competitorMentions,
      unit: "mentions",
      higherIsBetter: true,
    });
  }

  // Review metrics
  if (reviewData) {
    metrics.push({
      name: "Total Reviews",
      clientValue: reviewData.clientReviews,
      competitorValues: Object.fromEntries(
        Object.entries(reviewData.competitorReviews)
      ),
      unit: "reviews",
      higherIsBetter: true,
    });

    if (reviewData.clientRating !== null) {
      const compRatings: Record<string, number | string> = {};
      for (const [comp, rating] of Object.entries(
        reviewData.competitorRatings
      )) {
        compRatings[comp] = rating !== null ? rating : "N/A";
      }

      metrics.push({
        name: "Average Rating",
        clientValue: reviewData.clientRating,
        competitorValues: compRatings,
        unit: "/5",
        higherIsBetter: true,
      });
    }
  }

  return metrics;
}

// -----------------------------------------------------------------------------
// AI Summary Generation
// -----------------------------------------------------------------------------

async function generateExecutiveSummary(
  clientName: string,
  competitors: string[],
  pillarComparison: CompetitorReportData["pillarComparison"],
  somData: MonitorSomData[],
  metrics: CompetitorMetric[]
): Promise<{
  executiveSummary: string;
  keyFindings: string[];
  recommendations: CompetitorReportData["recommendations"];
}> {
  const pillarSummary = pillarComparison
    .map(
      (p) =>
        `${p.pillar}: Client=${p.clientScore ?? "N/A"}`
    )
    .join(", ");

  const somSummary = somData
    .map(
      (s) =>
        `${s.model}: Client=${s.clientSom}%, ${Object.entries(s.competitorSom).map(([c, v]) => `${c}=${v}%`).join(", ")}`
    )
    .join("\n");

  const metricSummary = metrics
    .map(
      (m) =>
        `${m.name}: Client=${m.clientValue}${m.unit}, ${Object.entries(m.competitorValues).map(([c, v]) => `${c}=${v}${m.unit}`).join(", ")}`
    )
    .join("\n");

  const result = await callOpus(
    `You are an AI SEO analyst writing a competitor benchmark report for "${clientName}" vs [${competitors.join(", ")}].

Data:
Pillar Scores: ${pillarSummary}

Share of Model by AI Platform:
${somSummary || "No SoM data available"}

Key Metrics:
${metricSummary || "Limited metric data available"}

Generate:
1. Executive summary (2-3 paragraphs) — honest assessment of competitive position
2. 3-5 key findings (one sentence each)
3. 4-6 prioritized recommendations

Return JSON:
{
  "executiveSummary": "...",
  "keyFindings": ["finding 1", "finding 2"],
  "recommendations": [
    { "priority": 1, "action": "specific action", "impact": "high|medium|low", "relatesTo": "which metric/pillar" }
  ]
}`,
    { maxTokens: 2048 }
  );

  return parseClaudeJson<{
    executiveSummary: string;
    keyFindings: string[];
    recommendations: CompetitorReportData["recommendations"];
  }>(result.text);
}
