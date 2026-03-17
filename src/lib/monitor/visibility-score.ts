// AI Visibility Score — the hero metric on client reports and dashboard.
// Composite 0-100 score combining multiple signals.
//
// Weights:
//   SoM (Share of Model):  40% — core metric
//   Recommendation rate:   25% — quality of mentions
//   Prominence:            15% — how prominently brand appears
//   Model coverage:        10% — breadth across AI models
//   Trend direction:       10% — momentum (positive delta = bonus)

export interface VisibilityScoreInput {
  overall_som: number;
  total_brand_mentions: number;
  total_brand_recommendations: number;
  avg_prominence: number | null;
  model_breakdown: Record<string, { mentioned: number; total: number }>;
  som_delta: number | null;
}

const WEIGHTS = {
  som: 0.4,
  recommend: 0.25,
  prominence: 0.15,
  coverage: 0.1,
  trend: 0.1,
} as const;

const TOTAL_MODELS = 5; // chatgpt, perplexity, gemini, claude, google_ai_overview

export function calculateAIVisibilityScore(
  snapshot: VisibilityScoreInput
): number {
  // SoM component (0-100)
  const somScore = snapshot.overall_som;

  // Recommendation component: of mentions, what % were recommendations?
  const recommendScore =
    snapshot.total_brand_mentions > 0
      ? (snapshot.total_brand_recommendations / snapshot.total_brand_mentions) *
        100
      : 0;

  // Prominence component (already 0-100)
  const prominenceScore = snapshot.avg_prominence || 0;

  // Coverage: mentioned in how many of the 5 models?
  const modelsMentionedIn = Object.values(snapshot.model_breakdown).filter(
    (m) => m.mentioned > 0
  ).length;
  const coverageScore = (modelsMentionedIn / TOTAL_MODELS) * 100;

  // Trend component: positive delta = bonus, negative = penalty
  // 50 is neutral, +delta pushes toward 100, -delta pushes toward 0
  const trendScore = snapshot.som_delta
    ? Math.min(100, Math.max(0, 50 + snapshot.som_delta * 2))
    : 50;

  const raw =
    somScore * WEIGHTS.som +
    recommendScore * WEIGHTS.recommend +
    prominenceScore * WEIGHTS.prominence +
    coverageScore * WEIGHTS.coverage +
    trendScore * WEIGHTS.trend;

  return Math.round(Math.max(0, Math.min(100, raw)));
}
