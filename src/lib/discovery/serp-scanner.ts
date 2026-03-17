import type { DiscoveredThread } from "@/lib/agents/interfaces";
import type { Platform } from "@/types/enums";
import { runActor } from "@/lib/apify/client";
import {
  ACTOR_IDS,
  buildBatchSerpInput,
  type GoogleSearchResult,
} from "@/lib/apify/actors";
import { parseBatchSerpResults } from "@/lib/apify/parsers";
import { ApifyActorError } from "@/lib/utils/errors";

// Maximum queries per Apify actor run.
// Each keyword generates ~2 queries per platform, so a client with 100 keywords
// across 3 platforms = 600 queries = 6 batches.
const MAX_QUERIES_PER_RUN = 100;

// Queries per keyword-platform combination (site: + plain)
const QUERIES_PER_KEYWORD_PLATFORM = 2;

interface ScanKeywordsInput {
  id: string;
  keyword: string;
  platforms: string[];
}

interface ScanResult {
  threads: DiscoveredThread[];
  stats: {
    totalQueries: number;
    totalRuns: number;
    totalResults: number;
    totalThreadsFound: number;
    durationMs: number;
  };
  errors: Array<{
    batchIndex: number;
    error: string;
  }>;
}

/**
 * Scans Google SERPs for platform-specific threads matching the client's keywords.
 *
 * For each keyword, generates search queries scoped to each platform
 * (e.g., "site:reddit.com music licensing"). Batches queries into Apify
 * actor runs (max 100 queries per run) and parses results into
 * DiscoveredThread format.
 *
 * @param clientId - The client ID (used for context, not for DB queries)
 * @param keywords - Array of keywords with their IDs and target platforms
 * @returns Discovered threads with SERP metadata + run statistics
 */
export async function scanKeywords(
  clientId: string,
  keywords: ScanKeywordsInput[]
): Promise<ScanResult> {
  const startTime = Date.now();
  const allThreads: DiscoveredThread[] = [];
  const errors: Array<{ batchIndex: number; error: string }> = [];

  if (keywords.length === 0) {
    return {
      threads: [],
      stats: {
        totalQueries: 0,
        totalRuns: 0,
        totalResults: 0,
        totalThreadsFound: 0,
        durationMs: 0,
      },
      errors: [],
    };
  }

  // Build keyword map for matching search results back to keywords
  const keywordMap = new Map<string, { id: string; keyword: string }>();
  for (const kw of keywords) {
    keywordMap.set(kw.keyword, { id: kw.id, keyword: kw.keyword });
  }

  // Split keywords into batches based on query count limits
  const batches = buildKeywordBatches(keywords);

  let totalQueries = 0;
  let totalResults = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const queryCount = batch.reduce(
      (sum, kw) => sum + kw.platforms.length * QUERIES_PER_KEYWORD_PLATFORM,
      0
    );
    totalQueries += queryCount;

    try {
      const input = buildBatchSerpInput(
        batch.map((kw) => ({
          keyword: kw.keyword,
          platforms: kw.platforms as Platform[],
        }))
      );

      const result = await runActor<typeof input, GoogleSearchResult>(
        ACTOR_IDS.GOOGLE_SEARCH_SCRAPER,
        input,
        {
          // Allow longer timeout for large batches
          timeoutSecs: Math.max(600, queryCount * 10),
        }
      );

      totalResults += result.items.length;

      // Parse SERP results into discovered threads
      const threads = parseBatchSerpResults(result.items, keywordMap);
      allThreads.push(...threads);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({
        batchIndex: i,
        error: message,
      });

      // Log but continue with remaining batches
      console.error(
        `[SERP Scanner] Batch ${i + 1}/${batches.length} failed for client ${clientId}: ${message}`
      );
    }
  }

  // If ALL batches failed, throw
  if (errors.length === batches.length && batches.length > 0) {
    throw new ApifyActorError(
      ACTOR_IDS.GOOGLE_SEARCH_SCRAPER,
      `All ${batches.length} SERP scan batches failed`,
      {
        clientId,
        errors,
      }
    );
  }

  // Deduplicate threads across batches (same URL could appear for different queries)
  const dedupedThreads = deduplicateByUrl(allThreads);

  return {
    threads: dedupedThreads,
    stats: {
      totalQueries,
      totalRuns: batches.length,
      totalResults,
      totalThreadsFound: dedupedThreads.length,
      durationMs: Date.now() - startTime,
    },
    errors,
  };
}

/**
 * Runs a SERP scan for a single keyword across its target platforms.
 * Useful for manual, targeted scans triggered from the UI.
 */
export async function scanSingleKeyword(
  keyword: { id: string; keyword: string; platforms: string[] }
): Promise<DiscoveredThread[]> {
  const result = await scanKeywords("single-scan", [keyword]);
  return result.threads;
}

/**
 * Splits keywords into batches that stay within the query-per-run limit.
 *
 * Each keyword generates QUERIES_PER_KEYWORD_PLATFORM queries per platform,
 * so a keyword targeting [reddit, quora] generates 4 queries.
 * We batch keywords so total queries per batch <= MAX_QUERIES_PER_RUN.
 */
function buildKeywordBatches(
  keywords: ScanKeywordsInput[]
): ScanKeywordsInput[][] {
  const batches: ScanKeywordsInput[][] = [];
  let currentBatch: ScanKeywordsInput[] = [];
  let currentQueryCount = 0;

  for (const keyword of keywords) {
    const queryCount =
      keyword.platforms.length * QUERIES_PER_KEYWORD_PLATFORM;

    if (
      currentQueryCount + queryCount > MAX_QUERIES_PER_RUN &&
      currentBatch.length > 0
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentQueryCount = 0;
    }

    currentBatch.push(keyword);
    currentQueryCount += queryCount;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

/**
 * Deduplicates threads by URL within a single scan run.
 * Keeps the thread with the highest SERP position (lowest number).
 */
function deduplicateByUrl(threads: DiscoveredThread[]): DiscoveredThread[] {
  const urlMap = new Map<string, DiscoveredThread>();

  for (const thread of threads) {
    const normalizedUrl = normalizeUrlForDedup(thread.url);
    const existing = urlMap.get(normalizedUrl);

    if (!existing) {
      urlMap.set(normalizedUrl, thread);
    } else {
      // Keep the one with the better (lower) SERP position
      const existingPos = existing.position ?? Infinity;
      const newPos = thread.position ?? Infinity;
      if (newPos < existingPos) {
        urlMap.set(normalizedUrl, thread);
      }
    }
  }

  return Array.from(urlMap.values());
}

/**
 * Normalizes a URL for dedup: strips query params, fragments, trailing slashes.
 */
function normalizeUrlForDedup(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${host}${path}`.toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}
