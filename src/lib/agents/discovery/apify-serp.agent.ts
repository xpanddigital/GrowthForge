// SERP Discovery Agent — discovers threads by scanning Google SERPs.
// Uses Apify's google-search-scraper actor via REST API (no SDK).

import { runActor } from "@/lib/apify/client";
import type { DiscoveryAgent, DiscoveredThread } from "../interfaces";

// Apify actor for Google SERP scraping
const GOOGLE_SEARCH_ACTOR = "apify/google-search-scraper";

// Max queries per Apify run to avoid timeout
const MAX_QUERIES_PER_RUN = 100;

// Max pages per query
const MAX_PAGES_PER_QUERY = 2;
const RESULTS_PER_PAGE = 10;

// Platform detection patterns
const PLATFORM_PATTERNS: Record<string, RegExp> = {
  reddit: /(?:^|\.)reddit\.com/i,
  quora: /(?:^|\.)quora\.com/i,
  facebook_groups: /(?:^|\.)facebook\.com\/groups/i,
};

// URL filters — skip non-thread URLs
const SKIP_PATTERNS: RegExp[] = [
  /reddit\.com\/?$/i,
  /reddit\.com\/r\/[^/]+\/?$/i,
  /reddit\.com\/user\//i,
  /quora\.com\/?$/i,
  /quora\.com\/profile\//i,
  /quora\.com\/topic\//i,
  /facebook\.com\/groups\/[^/]+\/?$/i,
];

interface ApifySerpResult {
  url: string;
  title: string;
  description: string;
  position: number;
}

function detectPlatform(url: string): "reddit" | "quora" | "facebook_groups" | null {
  try {
    const hostname = new URL(url).hostname;
    for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
      if (pattern.test(hostname) || pattern.test(url)) {
        return platform as "reddit" | "quora" | "facebook_groups";
      }
    }
  } catch {
    // Invalid URL
  }
  return null;
}

function shouldSkipUrl(url: string): boolean {
  return SKIP_PATTERNS.some((pattern) => pattern.test(url));
}

function generateSearchQueries(
  keyword: string,
  platforms: string[]
): string[] {
  const queries: string[] = [];

  if (platforms.includes("reddit")) {
    queries.push(`site:reddit.com ${keyword}`);
    queries.push(`${keyword} reddit`);
  }

  if (platforms.includes("quora")) {
    queries.push(`site:quora.com ${keyword}`);
  }

  if (platforms.includes("facebook_groups")) {
    queries.push(`${keyword} facebook group`);
  }

  return queries;
}

export class ApifySerpAgent implements DiscoveryAgent {
  name = "ApifySerpAgent";

  async discover(
    _clientId: string,
    keywords: Array<{ id: string; keyword: string; platforms: string[] }>
  ): Promise<DiscoveredThread[]> {
    const queryBatches: Array<{
      query: string;
      keywordId: string;
      keyword: string;
    }> = [];

    for (const kw of keywords) {
      const queries = generateSearchQueries(kw.keyword, kw.platforms);
      for (const query of queries) {
        queryBatches.push({
          query,
          keywordId: kw.id,
          keyword: kw.keyword,
        });
      }
    }

    // Split into Apify runs if too many queries
    const runs: Array<typeof queryBatches> = [];
    for (let i = 0; i < queryBatches.length; i += MAX_QUERIES_PER_RUN) {
      runs.push(queryBatches.slice(i, i + MAX_QUERIES_PER_RUN));
    }

    const allThreads: DiscoveredThread[] = [];
    const seenUrls = new Set<string>();

    for (const runBatch of runs) {
      const threads = await this.runSerpBatch(runBatch);
      for (const thread of threads) {
        if (!seenUrls.has(thread.url)) {
          seenUrls.add(thread.url);
          allThreads.push(thread);
        }
      }
    }

    return allThreads;
  }

  private async runSerpBatch(
    queries: Array<{ query: string; keywordId: string; keyword: string }>
  ): Promise<DiscoveredThread[]> {
    const result = await runActor<Record<string, unknown>, {
      organicResults?: ApifySerpResult[];
      searchQuery?: { term?: string };
    }>(
      GOOGLE_SEARCH_ACTOR,
      {
        queries: queries.map((q) => q.query).join("\n"),
        maxPagesPerQuery: MAX_PAGES_PER_QUERY,
        resultsPerPage: RESULTS_PER_PAGE,
        countryCode: "us",
        languageCode: "en",
        mobileResults: false,
      },
      { timeoutSecs: 600 }
    );

    const threads: DiscoveredThread[] = [];

    for (const item of result.items) {
      const searchTerm = item.searchQuery?.term || "";
      const matchedQuery = queries.find(
        (q) => q.query.toLowerCase() === searchTerm.toLowerCase()
      );

      if (!item.organicResults || !matchedQuery) continue;

      for (const serpResult of item.organicResults) {
        if (!serpResult.url || !serpResult.title) continue;

        const platform = detectPlatform(serpResult.url);
        if (!platform) continue;
        if (shouldSkipUrl(serpResult.url)) continue;

        threads.push({
          url: serpResult.url,
          title: serpResult.title,
          snippet: serpResult.description || "",
          position: serpResult.position,
          platform,
          keyword: matchedQuery.keyword,
          keywordId: matchedQuery.keywordId,
        });
      }
    }

    return threads;
  }
}
