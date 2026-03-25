// =============================================================================
// Mention Gap Analyzer — Review Site Scanner Agent
// Checks for brand presence on B2B review platforms (G2, Capterra, GetApp,
// Clutch, TrustRadius) that AI models heavily cite.
//
// Critical data: 100% of tools mentioned by ChatGPT had Capterra reviews.
// 99% had G2 reviews. GetApp commands 47.6% of B2B software review citations.
// =============================================================================

import type { MentionScanAgent, MentionScanResult } from "../interfaces";

const SERPAPI_URL = "https://serpapi.com/search.json";
const REQUEST_DELAY_MS = 1500;

// Review platforms that AI crawlers can access
const REVIEW_PLATFORMS = [
  {
    name: "G2",
    domain: "g2.com",
    aiCrawlable: true,
    weight: 95,
  },
  {
    name: "Capterra",
    domain: "capterra.com",
    aiCrawlable: true,
    weight: 90,
  },
  {
    name: "GetApp",
    domain: "getapp.com",
    aiCrawlable: true,
    weight: 85,
  },
  {
    name: "Clutch",
    domain: "clutch.co",
    aiCrawlable: true,
    weight: 80,
  },
  {
    name: "TrustRadius",
    domain: "trustradius.com",
    aiCrawlable: true,
    weight: 75,
  },
  {
    name: "Trustpilot",
    domain: "trustpilot.com",
    aiCrawlable: false, // Blocks GPTBot
    weight: 70,
  },
] as const;

export class ReviewSiteScannerAgent implements MentionScanAgent {
  name = "ReviewSiteScannerAgent";
  platform = "review_sites";

  async scan(
    brandName: string,
    brandUrl: string,
    keywords: string[],
    competitors: string[]
  ): Promise<MentionScanResult> {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return this.emptyResult();
    }

    const sources: MentionScanResult["sources"] = [];
    let totalReviews = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    let profileExists = false;
    let profileUrl: string | null = null;

    // Check each review platform for brand presence
    for (const platform of REVIEW_PLATFORMS) {
      try {
        const results = await this.searchGoogle(
          `site:${platform.domain} "${brandName}"`,
          apiKey
        );

        const platformSources = results.map((result) => {
          const isProfilePage = this.isProfileUrl(result.link, platform.domain);
          const reviewInfo = this.extractReviewInfo(result.snippet);

          if (isProfilePage) {
            profileExists = true;
            if (!profileUrl) profileUrl = result.link;
            if (reviewInfo.count) totalReviews += reviewInfo.count;
            if (reviewInfo.rating) {
              ratingSum += reviewInfo.rating;
              ratingCount++;
            }
          }

          return {
            url: result.link,
            title: `[${platform.name}] ${result.title}`,
            mentionType: "brand" as const,
            mentionedEntity: brandName,
            contextSnippet: result.snippet || null,
            authorityEstimate: (platform.aiCrawlable ? "high" : "medium") as
              | "high"
              | "medium"
              | "low",
          };
        });

        sources.push(...platformSources);

        // If no results, record the gap
        if (results.length === 0) {
          sources.push({
            url: `https://${platform.domain}`,
            title: `${platform.name} — No profile found`,
            mentionType: "neither",
            mentionedEntity: null,
            contextSnippet: `${brandName} has no presence on ${platform.name}`,
            authorityEstimate: "high",
          });
        }
      } catch {
        // Continue on failure
      }
      await sleep(REQUEST_DELAY_MS);
    }

    // Check competitor presence on top 3 platforms
    for (const competitor of competitors.slice(0, 3)) {
      for (const platform of REVIEW_PLATFORMS.slice(0, 3)) {
        try {
          const results = await this.searchGoogle(
            `site:${platform.domain} "${competitor}"`,
            apiKey
          );

          for (const result of results.slice(0, 2)) {
            sources.push({
              url: result.link,
              title: `[${platform.name}] ${result.title}`,
              mentionType: "competitor",
              mentionedEntity: competitor,
              contextSnippet: result.snippet || null,
              authorityEstimate: "high",
            });
          }
        } catch {
          // Continue
        }
        await sleep(REQUEST_DELAY_MS);
      }
    }

    return {
      platform: "review_sites",
      sources,
      profileExists,
      profileUrl,
      reviewCount: totalReviews || undefined,
      averageRating:
        ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : undefined,
    };
  }

  private async searchGoogle(
    query: string,
    apiKey: string
  ): Promise<Array<{ title: string; link: string; snippet: string }>> {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: "google",
      num: "5",
      gl: "us",
      hl: "en",
    });

    const response = await fetch(`${SERPAPI_URL}?${params}`);
    if (!response.ok) return [];

    const data = await response.json();
    return (data.organic_results || []).map(
      (r: Record<string, string>) => ({
        title: r.title || "",
        link: r.link || "",
        snippet: r.snippet || "",
      })
    );
  }

  private isProfileUrl(url: string, domain: string): boolean {
    // Profile URLs typically have a product/company name in the path
    // e.g., g2.com/products/company-name, capterra.com/software/company-name
    const profilePatterns: Record<string, RegExp> = {
      "g2.com": /g2\.com\/products\//i,
      "capterra.com": /capterra\.com\/(?:software|p)\//i,
      "getapp.com": /getapp\.com\/software\//i,
      "clutch.co": /clutch\.co\/(?:profile|company)\//i,
      "trustradius.com": /trustradius\.com\/products\//i,
      "trustpilot.com": /trustpilot\.com\/review\//i,
    };

    return profilePatterns[domain]?.test(url) ?? false;
  }

  private extractReviewInfo(
    snippet: string
  ): { count: number | null; rating: number | null } {
    let count: number | null = null;
    let rating: number | null = null;

    // Try to extract review count (e.g., "123 reviews", "Based on 45 reviews")
    const countMatch = snippet.match(
      /(\d+)\s+reviews?/i
    );
    if (countMatch) {
      count = parseInt(countMatch[1], 10);
    }

    // Try to extract rating (e.g., "4.5/5", "Rating: 4.3", "★ 4.7")
    const ratingMatch = snippet.match(
      /(\d+\.?\d?)\/5|Rating:?\s*(\d+\.?\d?)|★\s*(\d+\.?\d?)/i
    );
    if (ratingMatch) {
      rating = parseFloat(ratingMatch[1] || ratingMatch[2] || ratingMatch[3]);
    }

    return { count, rating };
  }

  private emptyResult(): MentionScanResult {
    return {
      platform: "review_sites",
      sources: [],
      profileExists: false,
      profileUrl: null,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
