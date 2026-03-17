// Review Audit Agent — assesses the client's review presence across platforms
// that AI models weight heavily for trust signals.
//
// Data sources: Google SERP (for review sites), Apify actors
// Conforms to the AuditAgent interface.

import type { AuditAgent, AuditPillarResult } from "../interfaces";
import { runActor } from "@/lib/apify/client";
import { ACTOR_IDS, type GoogleSearchResult } from "@/lib/apify/actors";
import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

interface ReviewClient {
  name: string;
  website_url?: string | null;
  brand_brief: string;
}

interface PlatformReviewData {
  reviews: number;
  rating: number | null;
  velocity: number;
  present: boolean;
  url?: string;
}

// Review platforms and their URL patterns
const REVIEW_PLATFORMS: Record<string, RegExp> = {
  google: /google\.com\/(maps|search).*reviews?|maps\.google/i,
  trustpilot: /trustpilot\.com\/review/i,
  g2: /g2\.com\/products.*reviews/i,
  capterra: /capterra\.com\/(software|reviews)/i,
  yelp: /yelp\.com\/biz/i,
  bbb: /bbb\.org\/us/i,
  glassdoor: /glassdoor\.com/i,
  product_hunt: /producthunt\.com\/products/i,
};

export class ReviewScanAgent implements AuditAgent {
  name = "ReviewScanAgent";
  pillar = "reviews";

  async scan(
    client: Record<string, unknown>,
    _keywords: Array<Record<string, unknown>> // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<AuditPillarResult> {
    const c = client as unknown as ReviewClient;

    // Step 1: Search Google for brand reviews across platforms
    const reviewQueries = [
      `"${c.name}" reviews`,
      `"${c.name}" review rating`,
      `"${c.name}" trustpilot OR g2 OR capterra`,
    ];

    const serpInput = {
      queries: reviewQueries.join("\n"),
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

    // Step 2: Identify review platforms and extract data from snippets
    const platformData: Record<string, PlatformReviewData> = {};
    const reviewUrls: Array<{ platform: string; url: string; snippet: string }> = [];

    for (const platform of Object.keys(REVIEW_PLATFORMS)) {
      platformData[platform] = {
        reviews: 0,
        rating: null,
        velocity: 0,
        present: false,
      };
    }

    for (const page of serpResult.items) {
      for (const result of page.organicResults || []) {
        if (!result.url) continue;

        for (const [platform, pattern] of Object.entries(REVIEW_PLATFORMS)) {
          if (pattern.test(result.url) && !platformData[platform].present) {
            platformData[platform].present = true;
            platformData[platform].url = result.url;

            // Extract review count and rating from snippet
            const snippet = `${result.title || ""} ${result.description || ""}`;
            const ratingMatch = snippet.match(/(\d+\.?\d*)\s*(?:out of\s*5|\/\s*5|stars?)/i);
            const reviewCountMatch = snippet.match(/(\d[\d,]*)\s*reviews?/i);

            if (ratingMatch) {
              platformData[platform].rating = parseFloat(ratingMatch[1]);
            }
            if (reviewCountMatch) {
              platformData[platform].reviews = parseInt(
                reviewCountMatch[1].replace(/,/g, ""),
                10
              );
            }

            reviewUrls.push({
              platform,
              url: result.url,
              snippet: snippet,
            });
          }
        }
      }
    }

    // Step 3: Use Claude to extract detailed review data from snippets
    let analysisResult: ReviewAnalysis | null = null;
    if (reviewUrls.length > 0) {
      try {
        analysisResult = await analyzeReviewPresence(c.name, c.brand_brief, reviewUrls);
      } catch {
        console.error("Review analysis failed, using SERP-extracted data");
      }
    }

    // Step 4: Search for competitor reviews for comparison
    const competitors = extractTopCompetitors(c.brand_brief);
    const competitorComparison: Record<
      string,
      { total_reviews: number; avg_rating: number; platforms: number }
    > = {};

    if (competitors.length > 0) {
      // Run a single SERP search for top competitor
      const topCompetitor = competitors[0];
      try {
        const compSerpInput = {
          queries: `"${topCompetitor}" reviews trustpilot OR g2 OR capterra`,
          maxPagesPerQuery: 1,
          resultsPerPage: 10,
          languageCode: "en",
          countryCode: "us",
          mobileResults: false,
          includeUnfilteredResults: false,
          saveHtml: false,
          saveHtmlToKeyValueStore: false,
        };

        const compResult = await runActor<typeof compSerpInput, GoogleSearchResult>(
          ACTOR_IDS.GOOGLE_SEARCH_SCRAPER,
          compSerpInput,
          { timeoutSecs: 120, maxItems: 20 }
        );

        let compReviews = 0;
        let compRatingSum = 0;
        let compRatingCount = 0;
        let compPlatforms = 0;

        for (const page of compResult.items) {
          for (const result of page.organicResults || []) {
            const snippet = `${result.title || ""} ${result.description || ""}`;
            const ratingMatch = snippet.match(/(\d+\.?\d*)\s*(?:out of\s*5|\/\s*5|stars?)/i);
            const reviewCountMatch = snippet.match(/(\d[\d,]*)\s*reviews?/i);

            if (reviewCountMatch) {
              compReviews += parseInt(reviewCountMatch[1].replace(/,/g, ""), 10);
              compPlatforms++;
            }
            if (ratingMatch) {
              compRatingSum += parseFloat(ratingMatch[1]);
              compRatingCount++;
            }
          }
        }

        competitorComparison[topCompetitor] = {
          total_reviews: compReviews,
          avg_rating: compRatingCount > 0 ? Math.round((compRatingSum / compRatingCount) * 10) / 10 : 0,
          platforms: compPlatforms,
        };
      } catch {
        // Competitor search failed, continue without comparison
      }
    }

    // Step 5: Calculate aggregate metrics
    const platformsWithReviews = Object.values(platformData).filter((p) => p.present).length;
    const totalReviews = Object.values(platformData).reduce((sum, p) => sum + p.reviews, 0);
    const ratingsArray = Object.values(platformData)
      .filter((p) => p.rating !== null)
      .map((p) => p.rating as number);
    const averageRating =
      ratingsArray.length > 0
        ? Math.round((ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length) * 10) / 10
        : 0;

    // Merge Claude analysis if available
    const sentimentDist = analysisResult?.sentiment_distribution || {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    const mostRecentReview = analysisResult?.most_recent_review || null;
    const reviewVelocity = analysisResult?.review_velocity || 0;

    // Calculate score
    const score = calculateReviewScore(
      platformsWithReviews,
      Object.keys(REVIEW_PLATFORMS).length,
      averageRating,
      totalReviews,
      reviewVelocity,
      competitorComparison
    );

    const topCompetitorReviews = Object.values(competitorComparison)[0]?.total_reviews || 0;

    const findings = {
      platforms_checked: Object.keys(REVIEW_PLATFORMS).length,
      platforms_with_reviews: platformsWithReviews,
      total_reviews: totalReviews,
      average_rating: averageRating,
      review_velocity: reviewVelocity,
      most_recent_review: mostRecentReview,
      platform_breakdown: platformData,
      competitor_comparison: competitorComparison,
      sentiment_distribution: sentimentDist,
      review_gap_vs_top_competitor: Math.max(0, topCompetitorReviews - totalReviews),
    };

    return {
      score,
      findings,
      summary: generateReviewSummary(findings, c.name, score),
      recommendations: generateReviewRecommendations(findings, c.name),
    };
  }
}

interface ReviewAnalysis {
  sentiment_distribution: { positive: number; neutral: number; negative: number };
  most_recent_review: string | null;
  review_velocity: number;
}

async function analyzeReviewPresence(
  brandName: string,
  _brandBrief: string,
  reviewUrls: Array<{ platform: string; url: string; snippet: string }>
): Promise<ReviewAnalysis> {
  const urlDescriptions = reviewUrls
    .map((r) => `${r.platform}: ${r.snippet}`)
    .join("\n");

  const prompt = `Analyze the review presence for "${brandName}" based on these SERP snippets:

${urlDescriptions}

Extract and estimate:
1. Sentiment distribution (positive/neutral/negative count estimates from the snippets)
2. Most recent review date mentioned (ISO format or null)
3. Estimated review velocity (reviews per month, based on any recency clues)

Return JSON:
{
  "sentiment_distribution": { "positive": 0, "neutral": 0, "negative": 0 },
  "most_recent_review": "2026-01-15" or null,
  "review_velocity": 1.5
}`;

  const result = await callSonnet(prompt, {
    systemPrompt: "You are a review data analyst. Extract review metrics from SERP snippets. Be conservative with estimates.",
    temperature: 0.2,
  });

  return parseClaudeJson(result.text);
}

function extractTopCompetitors(brandBrief: string): string[] {
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

function calculateReviewScore(
  platformsWithReviews: number,
  platformsChecked: number,
  averageRating: number,
  totalReviews: number,
  reviewVelocity: number,
  competitorComparison: Record<string, { total_reviews: number }>
): number {
  // platform_coverage * 20
  const coverageScore = platformsChecked > 0
    ? (platformsWithReviews / platformsChecked) * 20
    : 0;

  // rating_score * 25: (avg_rating / 5) * 100
  const ratingScore = (averageRating / 5) * 25;

  // volume_score * 25: log scale
  let volumeScore: number;
  if (totalReviews === 0) volumeScore = 0;
  else if (totalReviews < 10) volumeScore = 7.5;
  else if (totalReviews < 50) volumeScore = 15;
  else if (totalReviews < 200) volumeScore = 20;
  else volumeScore = 25;

  // recency_score * 15: based on velocity
  const recencyScore = Math.min(reviewVelocity * 5, 15);

  // velocity_vs_competitor * 15
  const topCompetitorReviews = Object.values(competitorComparison)[0]?.total_reviews || 0;
  let velocityVsCompetitor: number;
  if (topCompetitorReviews === 0) velocityVsCompetitor = 15;
  else velocityVsCompetitor = Math.min((totalReviews / topCompetitorReviews) * 15, 15);

  return Math.round(coverageScore + ratingScore + volumeScore + recencyScore + velocityVsCompetitor);
}

function generateReviewSummary(
  findings: Record<string, unknown>,
  brandName: string,
  score: number
): string {
  const totalReviews = findings.total_reviews as number;
  const avgRating = findings.average_rating as number;
  const platforms = findings.platforms_with_reviews as number;
  const gap = findings.review_gap_vs_top_competitor as number;

  if (totalReviews === 0) {
    return `${brandName} has no discoverable reviews across major platforms. This is a critical trust signal gap that impacts AI model recommendations. Score: ${score}/100.`;
  }

  return `${brandName} has ${totalReviews} reviews across ${platforms} platforms with an average rating of ${avgRating}/5. Score: ${score}/100. ${
    gap > 100
      ? `Significant review gap of ${gap} reviews vs top competitor.`
      : gap > 0
        ? `Review gap of ${gap} vs top competitor — closeable with a focused campaign.`
        : "Review volume is competitive."
  }`;
}

function generateReviewRecommendations(
  findings: Record<string, unknown>,
  brandName: string
): AuditPillarResult["recommendations"] {
  const recommendations: AuditPillarResult["recommendations"] = [];
  const totalReviews = findings.total_reviews as number;
  const avgRating = findings.average_rating as number;
  const platformBreakdown = findings.platform_breakdown as Record<string, PlatformReviewData>;
  const gap = findings.review_gap_vs_top_competitor as number;

  // Missing from key platforms
  const missingPlatforms = Object.entries(platformBreakdown)
    .filter(([, data]) => !data.present)
    .map(([platform]) => platform)
    .filter((p) => ["google", "trustpilot", "g2"].includes(p));

  if (missingPlatforms.length > 0) {
    recommendations.push({
      action: `Establish ${brandName} review presence on ${missingPlatforms.join(", ")} — these are high-authority review platforms referenced by AI`,
      impact: "high",
      effort: "medium",
    });
  }

  if (totalReviews < 20) {
    recommendations.push({
      action: `Launch a review generation campaign to grow from ${totalReviews} to 50+ reviews across key platforms`,
      impact: "high",
      effort: "medium",
    });
  }

  if (avgRating > 0 && avgRating < 4.0) {
    recommendations.push({
      action: `Address review quality — current average of ${avgRating}/5 is below the 4.0 threshold that AI models favor`,
      impact: "high",
      effort: "high",
    });
  }

  if (gap > 100) {
    recommendations.push({
      action: `Close the review volume gap (${gap} reviews behind top competitor) with a systematic review request workflow`,
      impact: "medium",
      effort: "medium",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      action: "Maintain review momentum with consistent monthly review requests and respond to all negative reviews",
      impact: "medium",
      effort: "low",
    });
  }

  return recommendations;
}
