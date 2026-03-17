// Platform Reviews Agent — generic scraper for non-Google review platforms.
// Uses Apify actors per platform with fallback to Google Search + Claude extraction.
// Each platform failure is isolated and never blocks the scan.

import { runActor } from "@/lib/apify/client";
import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import type {
  ReviewScanAgent,
  ReviewScanInput,
  ReviewScanResult,
} from "@/lib/agents/interfaces";

// BBB letter grade to numeric conversion
const BBB_GRADE_MAP: Record<string, number> = {
  "A+": 100, A: 90, "A-": 85,
  "B+": 80, B: 70, "B-": 65,
  "C+": 60, C: 50, "C-": 45,
  "D+": 40, D: 30, "D-": 25,
  F: 10,
};

// Apify actor IDs per platform
const PLATFORM_ACTORS: Record<string, string> = {
  trustpilot: "apify/trustpilot-scraper",
  yelp: "apify/yelp-scraper",
  facebook: "apify/facebook-reviews-scraper",
};

export class PlatformReviewsAgent implements ReviewScanAgent {
  name = "PlatformReviewsAgent";

  async scan(input: ReviewScanInput): Promise<ReviewScanResult> {
    try {
      // Route to platform-specific handler
      switch (input.platform) {
        case "trustpilot":
          return await this.scanWithActor(input, "trustpilot");
        case "yelp":
          return await this.scanWithActor(input, "yelp");
        case "facebook":
          return await this.scanWithActor(input, "facebook");
        case "g2":
        case "capterra":
        case "product_hunt":
        case "trustradius":
          return await this.scanSaasReviewSite(input);
        case "bbb":
          return await this.scanBBB(input);
        case "avvo":
        case "super_lawyers":
        case "martindale":
        case "lawyers_com":
          return await this.scanLegalPlatform(input);
        case "homeadvisor":
        case "angi":
        case "houzz":
          return await this.scanHomeServicesPlatform(input);
        default:
          return await this.scanGenericWithClaude(input);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ...this.emptyResult(input.platform),
        scrapeError: `${input.platform} scan failed: ${message}`,
      };
    }
  }

  /**
   * Scan using a dedicated Apify actor (Trustpilot, Yelp, Facebook).
   */
  private async scanWithActor(
    input: ReviewScanInput,
    platform: string
  ): Promise<ReviewScanResult> {
    const actorId = PLATFORM_ACTORS[platform];
    if (!actorId) return this.scanGenericWithClaude(input);

    const actorInput = this.buildActorInput(input, platform);
    const result = await runActor(actorId, actorInput, {
      timeoutSecs: 300,
      maxItems: 1,
    });

    if (!result.items.length) {
      return this.emptyResult(input.platform);
    }

    return this.parseActorResult(result.items[0] as Record<string, unknown>, input.platform);
  }

  /**
   * Scan SaaS review sites (G2, Capterra, etc.) via web scraper + Claude extraction.
   */
  private async scanSaasReviewSite(input: ReviewScanInput): Promise<ReviewScanResult> {
    return this.scanViaSearchAndExtract(input);
  }

  /**
   * Scan BBB — uses letter grade system, not star ratings.
   */
  private async scanBBB(input: ReviewScanInput): Promise<ReviewScanResult> {
    const result = await this.scanViaSearchAndExtract(input);

    // If Claude extracted a letter grade, convert to numeric
    if (result.found && result.averageRating !== null) {
      const gradeStr = String(result.averageRating);
      if (BBB_GRADE_MAP[gradeStr] !== undefined) {
        result.averageRating = BBB_GRADE_MAP[gradeStr];
        result.ratingScale = 100;
      }
    }

    return result;
  }

  /**
   * Scan legal platform (Avvo, Super Lawyers, etc.).
   */
  private async scanLegalPlatform(input: ReviewScanInput): Promise<ReviewScanResult> {
    const result = await this.scanViaSearchAndExtract(input);

    // Avvo uses 1-10 scale
    if (input.platform === "avvo" && result.found) {
      result.ratingScale = 10;
    }

    return result;
  }

  /**
   * Scan home services platforms (HomeAdvisor, Angi, Houzz).
   */
  private async scanHomeServicesPlatform(input: ReviewScanInput): Promise<ReviewScanResult> {
    return this.scanViaSearchAndExtract(input);
  }

  /**
   * Fallback: Google Search to find the profile, then Claude to extract data.
   */
  private async scanViaSearchAndExtract(input: ReviewScanInput): Promise<ReviewScanResult> {
    const platformDomains: Record<string, string> = {
      g2: "g2.com",
      capterra: "capterra.com",
      product_hunt: "producthunt.com",
      trustradius: "trustradius.com",
      bbb: "bbb.org",
      avvo: "avvo.com",
      super_lawyers: "superlawyers.com",
      martindale: "martindale.com",
      lawyers_com: "lawyers.com",
      homeadvisor: "homeadvisor.com",
      angi: "angi.com",
      houzz: "houzz.com",
      amazon: "amazon.com",
      sitejabber: "sitejabber.com",
      reseller_ratings: "resellerratings.com",
      glassdoor: "glassdoor.com",
      allmusic: "allmusic.com",
    };

    const domain = platformDomains[input.platform] || input.platform;
    const searchQuery = input.existingProfileUrl
      ? input.existingProfileUrl
      : `${input.clientName} site:${domain}`;

    // Use Apify Google Search to find the profile page
    const serpResult = await runActor(
      "apify/google-search-scraper",
      {
        queries: searchQuery,
        maxPagesPerQuery: 1,
        resultsPerPage: 3,
      },
      { timeoutSecs: 120, maxItems: 3 }
    );

    const items = serpResult.items as Array<Record<string, unknown>>;
    if (!items.length) return this.emptyResult(input.platform);

    // Find the most relevant result
    const profileItem = items.find(
      (item) =>
        typeof item.url === "string" &&
        item.url.includes(domain)
    ) || items[0];

    if (!profileItem?.url) return this.emptyResult(input.platform);

    // Scrape the page content
    let pageContent: string;
    try {
      const scrapeResult = await runActor(
        "apify/cheerio-scraper",
        {
          startUrls: [{ url: profileItem.url as string }],
          maxRequestsPerCrawl: 1,
          pageFunction: `async function pageFunction(context) {
            return { text: context.$('body').text().substring(0, 8000), url: context.request.url };
          }`,
        },
        { timeoutSecs: 60, maxItems: 1 }
      );

      const scraped = scrapeResult.items[0] as Record<string, unknown> | undefined;
      pageContent = (scraped?.text as string) || "";
    } catch {
      // If scraping fails, use the SERP snippet
      pageContent = (profileItem.description as string) || (profileItem.snippet as string) || "";
    }

    if (!pageContent) return this.emptyResult(input.platform);

    // Use Claude Sonnet to extract structured review data from page content
    const extraction = await callSonnet(
      `Extract review data from this ${input.platform} page for "${input.clientName}".

PAGE CONTENT:
${pageContent.substring(0, 6000)}

PAGE URL: ${profileItem.url}

Return ONLY valid JSON:
{
  "found": true/false,
  "profile_url": "the profile URL",
  "total_reviews": number or 0,
  "average_rating": number or null (use the platform's native scale),
  "rating_scale": number (typically 5, Avvo uses 10, BBB uses letter grades like "A+"),
  "most_recent_review_date": "ISO date string" or null,
  "rating_distribution": { "5": count, "4": count, ... } or {},
  "recent_reviews": [
    {
      "reviewer_name": "name" or null,
      "review_text": "first 500 chars of review" or null,
      "rating": number,
      "review_date": "ISO date" or null,
      "has_owner_response": boolean
    }
  ]
}

If this page is NOT a review/profile page for the business, return { "found": false }.
For BBB, return the letter grade as average_rating (e.g. "A+").`,
      { systemPrompt: "Extract structured review data from web pages. Return ONLY valid JSON.", temperature: 0.1 }
    );

    const parsed = parseClaudeJson<Record<string, unknown>>(extraction.text);

    if (!parsed.found) return this.emptyResult(input.platform);

    const recentReviews = ((parsed.recent_reviews as Array<Record<string, unknown>>) || []).map(
      (r) => ({
        reviewerName: (r.reviewer_name as string) || null,
        reviewText: (r.review_text as string) || null,
        rating: (r.rating as number) || 0,
        reviewDate: (r.review_date as string) || null,
        reviewUrl: null,
        hasOwnerResponse: (r.has_owner_response as boolean) || false,
        ownerResponseText: null,
      })
    );

    return {
      platform: input.platform,
      found: true,
      profileUrl: (parsed.profile_url as string) || (profileItem.url as string) || null,
      isClaimed: null,
      totalReviews: (parsed.total_reviews as number) || 0,
      averageRating: (parsed.average_rating as number | string) !== null
        ? Number(parsed.average_rating) || null
        : null,
      ratingScale: (parsed.rating_scale as number) || 5,
      mostRecentReviewDate: (parsed.most_recent_review_date as string) || null,
      ratingDistribution: (parsed.rating_distribution as Record<string, number>) || {},
      totalResponded: recentReviews.filter((r) => r.hasOwnerResponse).length,
      recentReviews,
      scrapeError: null,
    };
  }

  /**
   * Generic fallback using Google Search + Claude.
   */
  private async scanGenericWithClaude(input: ReviewScanInput): Promise<ReviewScanResult> {
    return this.scanViaSearchAndExtract(input);
  }

  private buildActorInput(
    input: ReviewScanInput,
    platform: string
  ): Record<string, unknown> {
    switch (platform) {
      case "trustpilot":
        return {
          startUrls: input.existingProfileUrl
            ? [{ url: input.existingProfileUrl }]
            : [],
          searchQuery: input.existingProfileUrl ? undefined : input.clientName,
          maxReviews: 50,
        };
      case "yelp":
        return {
          searchTerms: [input.clientName],
          location: input.location || "",
          maxReviews: 50,
          proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
        };
      case "facebook":
        return {
          startUrls: input.existingProfileUrl
            ? [{ url: input.existingProfileUrl }]
            : [],
          maxReviews: 50,
        };
      default:
        return {};
    }
  }

  private parseActorResult(
    item: Record<string, unknown>,
    platform: string
  ): ReviewScanResult {
    // Generic parsing — actor outputs vary but share common patterns
    const reviews = (item.reviews as Array<Record<string, unknown>>) || [];
    const totalReviews =
      (item.reviewsCount as number) ||
      (item.totalReviews as number) ||
      reviews.length;
    const averageRating =
      (item.rating as number) ||
      (item.score as number) ||
      (item.totalScore as number) ||
      null;

    let totalResponded = 0;
    const recentReviews = reviews.slice(0, 50).map((r) => {
      const hasResponse = !!(r.responseFromOwner || r.ownerResponse || r.businessResponse);
      if (hasResponse) totalResponded++;
      return {
        reviewerName: (r.name as string) || (r.author as string) || null,
        reviewText: (r.text as string) || (r.reviewText as string) || null,
        rating: (r.stars as number) || (r.rating as number) || 0,
        reviewDate: (r.date as string) || (r.publishedAt as string) || null,
        reviewUrl: (r.url as string) || null,
        hasOwnerResponse: hasResponse,
        ownerResponseText:
          (r.responseFromOwner as string) ||
          (r.ownerResponse as string) ||
          null,
      };
    });

    const mostRecentDate = recentReviews
      .filter((r) => r.reviewDate)
      .sort(
        (a, b) =>
          new Date(b.reviewDate!).getTime() - new Date(a.reviewDate!).getTime()
      )[0]?.reviewDate || null;

    return {
      platform,
      found: true,
      profileUrl: (item.url as string) || (item.profileUrl as string) || null,
      isClaimed: (item.isClaimed as boolean) || null,
      totalReviews,
      averageRating,
      ratingScale: 5,
      mostRecentReviewDate: mostRecentDate,
      ratingDistribution: (item.reviewsDistribution as Record<string, number>) || {},
      totalResponded,
      recentReviews,
      scrapeError: null,
    };
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
