// Google Reviews Agent — most important review source for local businesses.
// Uses Apify google-maps-scraper to fetch reviews, ratings, and distribution.

import { runActor } from "@/lib/apify/client";
import type {
  ReviewScanAgent,
  ReviewScanInput,
  ReviewScanResult,
} from "@/lib/agents/interfaces";

interface GoogleMapsResult {
  title?: string;
  totalScore?: number;
  reviewsCount?: number;
  reviewsDistribution?: Record<string, number>;
  url?: string;
  isAdvertisement?: boolean;
  reviews?: Array<{
    name?: string;
    text?: string;
    stars?: number;
    publishedAtDate?: string;
    reviewUrl?: string;
    responseFromOwnerText?: string;
    responseFromOwnerDate?: string;
  }>;
}

export class GoogleReviewsAgent implements ReviewScanAgent {
  name = "GoogleReviewsAgent";

  async scan(input: ReviewScanInput): Promise<ReviewScanResult> {
    const searchQuery = input.location
      ? `${input.clientName} ${input.location}`
      : input.clientName;

    try {
      const result = await runActor<Record<string, unknown>, GoogleMapsResult>(
        "compass/crawler-google-places",
        {
          searchStringsArray: [searchQuery],
          maxReviews: 50,
          language: "en",
          maxCrawledPlacesPerSearch: 1,
        },
        { timeoutSecs: 300, maxItems: 1 }
      );

      const place = result.items[0];
      if (!place || !place.reviewsCount) {
        return this.emptyResult(input.platform);
      }

      const ratingDistribution: Record<string, number> = {};
      if (place.reviewsDistribution) {
        for (const [stars, count] of Object.entries(place.reviewsDistribution)) {
          ratingDistribution[stars] = count as number;
        }
      }

      let totalResponded = 0;
      const recentReviews = (place.reviews || []).map((r) => {
        const hasResponse = !!r.responseFromOwnerText;
        if (hasResponse) totalResponded++;
        return {
          reviewerName: r.name || null,
          reviewText: r.text || null,
          rating: r.stars || 0,
          reviewDate: r.publishedAtDate || null,
          reviewUrl: r.reviewUrl || null,
          hasOwnerResponse: hasResponse,
          ownerResponseText: r.responseFromOwnerText || null,
        };
      });

      const mostRecentDate = recentReviews
        .filter((r) => r.reviewDate)
        .sort((a, b) => new Date(b.reviewDate!).getTime() - new Date(a.reviewDate!).getTime())[0]
        ?.reviewDate || null;

      return {
        platform: "google",
        found: true,
        profileUrl: place.url || null,
        isClaimed: null, // Google Maps API doesn't reliably expose this
        totalReviews: place.reviewsCount || 0,
        averageRating: place.totalScore || null,
        ratingScale: 5,
        mostRecentReviewDate: mostRecentDate,
        ratingDistribution,
        totalResponded,
        recentReviews,
        scrapeError: null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ...this.emptyResult(input.platform),
        scrapeError: `Google Reviews scan failed: ${message}`,
      };
    }
  }

  private emptyResult(platform: string): ReviewScanResult {
    return {
      platform,
      found: false,
      profileUrl: null,
      isClaimed: null,
      totalReviews: 0,
      averageRating: null,
      ratingScale: 5,
      mostRecentReviewDate: null,
      ratingDistribution: {},
      totalResponded: 0,
      recentReviews: [],
      scrapeError: null,
    };
  }
}
