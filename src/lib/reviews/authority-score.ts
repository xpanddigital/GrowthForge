// Review Authority Score — composite metric feeding into the audit AI Visibility Score.
// Weighted average of volume, rating, coverage, velocity, response rate, and competitive gap.

export function calculateReviewAuthorityScore(data: {
  totalReviews: number;
  averageRating: number;
  ratingScale: number;
  platformCount: number;
  totalPlatformsRelevant: number;
  velocity30d: number;
  responseRate: number;
  topCompetitorReviews: number;
  topCompetitorRating: number;
}): number {
  // Volume score (log scale — diminishing returns after ~200)
  // 0 reviews = 0, 10 = 30, 50 = 55, 100 = 70, 200 = 85, 500+ = 100
  const volumeScore = Math.min(
    100,
    Math.round(Math.log10(Math.max(1, data.totalReviews)) * 35)
  );

  // Rating score (normalized to 0-100 from the platform's scale)
  const ratingScore = data.averageRating
    ? Math.round((data.averageRating / data.ratingScale) * 100)
    : 0;

  // Coverage score: % of relevant platforms with presence
  const coverageScore =
    data.totalPlatformsRelevant > 0
      ? Math.round((data.platformCount / data.totalPlatformsRelevant) * 100)
      : 0;

  // Velocity score: review momentum (0 = dead, 5+/month = healthy)
  const velocityScore = Math.min(100, Math.round(data.velocity30d * 20));

  // Response rate score
  const responseScore = Math.round(data.responseRate || 0);

  // Competitive gap: how do we compare to top competitor?
  const competitiveScore =
    data.topCompetitorReviews > 0
      ? Math.min(
          100,
          Math.round((data.totalReviews / data.topCompetitorReviews) * 100)
        )
      : 50; // No competitor data = neutral

  return Math.round(
    volumeScore * 0.25 +
      ratingScore * 0.2 +
      coverageScore * 0.15 +
      velocityScore * 0.15 +
      responseScore * 0.1 +
      competitiveScore * 0.15
  );
}
