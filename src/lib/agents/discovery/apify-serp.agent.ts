// SERP Discovery Agent — discovers threads by scanning Google SERPs.
// Uses Apify's google-search-scraper actor to find Reddit, Quora,
// and Facebook Group threads ranking for client keywords.

import { ApifyClient } from "apify-client";
import type { DiscoveryAgent, DiscoveredThread } from "../interfaces";
import { ApifyActorError } from "@/lib/utils/errors";
import { withRetry } from "@/lib/utils/retry";

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
  /reddit\.com\/?$/i, // Reddit homepage
  /reddit\.com\/r\/[^/]+\/?$/i, // Subreddit homepages (no thread)
  /reddit\.com\/user\//i, // User profiles
  /quora\.com\/?$/i, // Quora homepage
  /quora\.com\/profile\//i, // Quora profiles
  /quora\.com\/topic\//i, // Quora topic pages (not threads)
  /facebook\.com\/groups\/[^/]+\/?$/i, // Group homepages (no thread)
];

interface ApifySerpResult {
  url: string;
  title: string;
  description: string;
  position: number;
}

/**
 * Detect which platform a URL belongs to.
 */
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

/**
 * Check if a URL should be skipped (not a real thread).
 */
function shouldSkipUrl(url: string): boolean {
  return SKIP_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Extract subreddit name from a Reddit URL.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractSubreddit(url: string): string | undefined {
  const match = url.match(/reddit\.com\/r\/([^/]+)/i);
  return match ? match[1] : undefined;
}

/**
 * Generate search queries for a keyword across target platforms.
 */
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

let _apifyClient: ApifyClient | null = null;

function getApifyClient(): ApifyClient {
  if (!_apifyClient) {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      throw new ApifyActorError(
        GOOGLE_SEARCH_ACTOR,
        "APIFY_API_TOKEN environment variable is not set"
      );
    }
    _apifyClient = new ApifyClient({ token });
  }
  return _apifyClient;
}

export class ApifySerpAgent implements DiscoveryAgent {
  name = "ApifySerpAgent";

  /**
   * Discover threads across platforms by scanning Google SERPs for keyword matches.
   *
   * For each keyword, generates site:platform queries and general queries,
   * runs them through Apify's Google search scraper, and filters results
   * to only include real thread URLs from Reddit, Quora, and Facebook Groups.
   */
  async discover(
    _clientId: string,
    keywords: Array<{ id: string; keyword: string; platforms: string[] }>
  ): Promise<DiscoveredThread[]> {
    // Generate all search queries
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

  /**
   * Run a single Apify actor batch for a set of search queries.
   */
  private async runSerpBatch(
    queries: Array<{ query: string; keywordId: string; keyword: string }>
  ): Promise<DiscoveredThread[]> {
    return withRetry(
      async () => {
        const client = getApifyClient();

        const searchQueries = queries.map((q) => ({
          term: q.query,
          // Google search region — US results
          countryCode: "us",
          languageCode: "en",
        }));

        // Run the Apify actor
        const run = await client
          .actor(GOOGLE_SEARCH_ACTOR)
          .call(
            {
              queries: searchQueries.map((q) => q.term).join("\n"),
              maxPagesPerQuery: MAX_PAGES_PER_QUERY,
              resultsPerPage: RESULTS_PER_PAGE,
              countryCode: "us",
              languageCode: "en",
              mobileResults: false,
            },
            {
              waitSecs: 600, // 10 minute timeout
            }
          );

        if (!run || run.status !== "SUCCEEDED") {
          throw new ApifyActorError(
            GOOGLE_SEARCH_ACTOR,
            `Actor run failed with status: ${run?.status || "unknown"}`,
            { runId: run?.id }
          );
        }

        // Fetch results from the actor's dataset
        const { items } = await client
          .dataset(run.defaultDatasetId)
          .listItems();

        // Parse results and match back to keywords
        const threads: DiscoveredThread[] = [];

        for (const item of items) {
          const serpResult = item as unknown as {
            organicResults?: ApifySerpResult[];
            searchQuery?: { term?: string };
          };

          // Find which keyword/query this result belongs to
          const searchTerm = serpResult.searchQuery?.term || "";
          const matchedQuery = queries.find(
            (q) => q.query.toLowerCase() === searchTerm.toLowerCase()
          );

          if (!serpResult.organicResults || !matchedQuery) continue;

          for (const result of serpResult.organicResults) {
            if (!result.url || !result.title) continue;

            // Detect platform
            const platform = detectPlatform(result.url);
            if (!platform) continue;

            // Skip non-thread URLs
            if (shouldSkipUrl(result.url)) continue;

            threads.push({
              url: result.url,
              title: result.title,
              snippet: result.description || "",
              position: result.position,
              platform,
              keyword: matchedQuery.keyword,
              keywordId: matchedQuery.keywordId,
            });
          }
        }

        return threads;
      },
      {
        maxRetries: 1,
        baseDelayMs: 30000, // 30 seconds between retries for Apify
        maxDelayMs: 60000,
      }
    );
  }
}
