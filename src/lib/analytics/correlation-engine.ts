// =============================================================================
// GA4 Correlation Engine
// Correlates AI Monitor Share of Model (SoM) trends with GA4 AI referral
// traffic changes. When SoM goes up for a keyword, checks if AI referral
// sessions for related landing pages also increased.
// =============================================================================

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CorrelationResult {
  dateRange: { start: string; end: string };
  aiSessions: number;
  somAverage: number;
  correlations: KeywordCorrelation[];
  overallTrend: "improving" | "stable" | "declining";
  insightSummary: string;
}

export interface KeywordCorrelation {
  keyword: string;
  somCurrent: number;
  somPrevious: number;
  somChange: number; // percentage change
  trafficCurrent: number;
  trafficPrevious: number;
  trafficChange: number; // percentage change
  correlation: "positive" | "negative" | "neutral";
  insight: string;
}

// -----------------------------------------------------------------------------
// Types for inputs (from DB queries)
// -----------------------------------------------------------------------------

export interface MonitorSnapshot {
  keyword: string;
  currentSom: number; // 0-100
  previousSom: number; // 0-100
}

export interface TrafficData {
  keyword: string;
  currentSessions: number;
  previousSessions: number;
}

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export function calculateCorrelations(
  monitorData: MonitorSnapshot[],
  trafficData: TrafficData[],
  dateRange: { start: string; end: string }
): CorrelationResult {
  const correlations: KeywordCorrelation[] = [];

  // Match monitor data with traffic data by keyword
  for (const monitor of monitorData) {
    const traffic = trafficData.find(
      (t) => t.keyword.toLowerCase() === monitor.keyword.toLowerCase()
    );

    const somChange =
      monitor.previousSom > 0
        ? ((monitor.currentSom - monitor.previousSom) / monitor.previousSom) *
          100
        : monitor.currentSom > 0
          ? 100
          : 0;

    const trafficCurrent = traffic?.currentSessions || 0;
    const trafficPrevious = traffic?.previousSessions || 0;
    const trafficChange =
      trafficPrevious > 0
        ? ((trafficCurrent - trafficPrevious) / trafficPrevious) * 100
        : trafficCurrent > 0
          ? 100
          : 0;

    // Determine correlation direction
    let correlation: "positive" | "negative" | "neutral";
    if (Math.abs(somChange) < 5 && Math.abs(trafficChange) < 10) {
      correlation = "neutral";
    } else if (
      (somChange > 0 && trafficChange > 0) ||
      (somChange < 0 && trafficChange < 0)
    ) {
      correlation = "positive";
    } else {
      correlation = "negative";
    }

    // Generate insight
    const insight = generateInsight(
      monitor.keyword,
      somChange,
      trafficChange,
      correlation
    );

    correlations.push({
      keyword: monitor.keyword,
      somCurrent: monitor.currentSom,
      somPrevious: monitor.previousSom,
      somChange: Math.round(somChange * 10) / 10,
      trafficCurrent,
      trafficPrevious,
      trafficChange: Math.round(trafficChange * 10) / 10,
      correlation,
      insight,
    });
  }

  // Sort by absolute SoM change (most significant first)
  correlations.sort(
    (a, b) => Math.abs(b.somChange) - Math.abs(a.somChange)
  );

  // Calculate aggregates
  const totalAiSessions = correlations.reduce(
    (sum, c) => sum + c.trafficCurrent,
    0
  );
  const somAverage =
    correlations.length > 0
      ? Math.round(
          correlations.reduce((sum, c) => sum + c.somCurrent, 0) /
            correlations.length
        )
      : 0;

  // Determine overall trend
  const positiveCorrelations = correlations.filter(
    (c) => c.correlation === "positive" && c.somChange > 0
  ).length;
  const negativeCorrelations = correlations.filter(
    (c) => c.somChange < -5
  ).length;

  let overallTrend: "improving" | "stable" | "declining";
  if (positiveCorrelations > negativeCorrelations + 1) {
    overallTrend = "improving";
  } else if (negativeCorrelations > positiveCorrelations + 1) {
    overallTrend = "declining";
  } else {
    overallTrend = "stable";
  }

  const insightSummary = generateOverallInsight(
    correlations,
    overallTrend,
    totalAiSessions
  );

  return {
    dateRange,
    aiSessions: totalAiSessions,
    somAverage,
    correlations,
    overallTrend,
    insightSummary,
  };
}

// -----------------------------------------------------------------------------
// Insight Generation
// -----------------------------------------------------------------------------

function generateInsight(
  keyword: string,
  somChange: number,
  trafficChange: number,
  correlation: "positive" | "negative" | "neutral"
): string {
  if (correlation === "positive" && somChange > 10) {
    return `"${keyword}" — SoM up ${Math.round(somChange)}% and AI traffic up ${Math.round(trafficChange)}%. GEO campaign is driving real traffic.`;
  }
  if (correlation === "positive" && somChange < -10) {
    return `"${keyword}" — SoM dropped ${Math.round(Math.abs(somChange))}% and AI traffic dropped ${Math.round(Math.abs(trafficChange))}%. Needs attention.`;
  }
  if (correlation === "negative" && somChange > 10) {
    return `"${keyword}" — SoM up ${Math.round(somChange)}% but traffic flat. Citations may not be driving clicks yet.`;
  }
  if (correlation === "negative" && somChange < -10) {
    return `"${keyword}" — SoM dropped but traffic held. Other channels may be compensating.`;
  }
  return `"${keyword}" — Stable SoM (${Math.round(somChange)}% change) and traffic (${Math.round(trafficChange)}% change).`;
}

function generateOverallInsight(
  correlations: KeywordCorrelation[],
  trend: string,
  totalAiSessions: number
): string {
  const improving = correlations.filter(
    (c) => c.somChange > 5 && c.correlation === "positive"
  );
  const declining = correlations.filter((c) => c.somChange < -5);

  if (trend === "improving") {
    return `AI visibility is trending up across ${improving.length} keywords, driving ${totalAiSessions} AI-referred sessions. Campaign momentum is positive.`;
  }
  if (trend === "declining") {
    return `AI visibility declined on ${declining.length} keywords. Review content freshness and citation quality for these topics.`;
  }
  return `AI visibility is stable with ${totalAiSessions} AI-referred sessions. Continue current campaigns and monitor for changes.`;
}
