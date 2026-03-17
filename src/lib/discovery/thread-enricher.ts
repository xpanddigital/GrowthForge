import type { EnrichedThread } from "@/lib/agents/interfaces";
import type { Platform } from "@/types/enums";
import { runActor } from "@/lib/apify/client";
import {
  ACTOR_IDS,
  buildRedditInput,
  buildQuoraInput,
  type RedditScraperResult,
  type QuoraScraperResult,
} from "@/lib/apify/actors";
import { parseRedditThread, parseQuoraThread } from "@/lib/apify/parsers";
import { withRetry } from "@/lib/utils/retry";

// ============================================
// Configuration
// ============================================

/** Maximum threads to enrich per Apify actor run */
const MAX_THREADS_PER_BATCH = 25;

/** Timeout for enrichment actor runs (5 minutes) */
const ENRICHMENT_TIMEOUT_SECS = 300;

// ============================================
// Types
// ============================================

export interface EnrichmentInput {
  /** The thread URL to enrich */
  url: string;
  /** The platform of the thread */
  platform: Platform;
  /** Optional thread ID for tracking */
  threadId?: string;
}

export interface EnrichmentResult {
  url: string;
  platform: Platform;
  threadId?: string;
  enriched: EnrichedThread | null;
  error: string | null;
  status: "success" | "expired" | "failed";
}

interface EnrichBatchResult {
  results: EnrichmentResult[];
  stats: {
    total: number;
    succeeded: number;
    failed: number;
    expired: number;
    durationMs: number;
  };
}

// ============================================
// Main Entry Point
// ============================================

/**
 * Enriches an array of discovered threads by fetching their full content,
 * including post body, comments, vote counts, and dates.
 *
 * Groups threads by platform and runs platform-specific Apify actors.
 * Handles errors gracefully: if a thread is deleted or locked, it
 * returns with status='expired' rather than failing the entire batch.
 *
 * @param threads - Array of threads to enrich (URL + platform)
 * @returns Enrichment results with full content or error details
 */
export async function enrichThreads(
  threads: EnrichmentInput[]
): Promise<EnrichBatchResult> {
  const startTime = Date.now();

  if (threads.length === 0) {
    return {
      results: [],
      stats: {
        total: 0,
        succeeded: 0,
        failed: 0,
        expired: 0,
        durationMs: 0,
      },
    };
  }

  // Group threads by platform
  const grouped = groupByPlatform(threads);
  const allResults: EnrichmentResult[] = [];

  // Process each platform group
  const platformPromises: Promise<EnrichmentResult[]>[] = [];

  if (grouped.reddit.length > 0) {
    platformPromises.push(enrichRedditThreads(grouped.reddit));
  }

  if (grouped.quora.length > 0) {
    platformPromises.push(enrichQuoraThreads(grouped.quora));
  }

  if (grouped.facebook_groups.length > 0) {
    // Facebook Groups enrichment is fragile — return basic results
    platformPromises.push(enrichFacebookThreads(grouped.facebook_groups));
  }

  // Run all platform enrichments in parallel
  const platformResults = await Promise.allSettled(platformPromises);

  for (const result of platformResults) {
    if (result.status === "fulfilled") {
      allResults.push(...result.value);
    } else {
      // Platform-level failure: all threads in this group failed
      console.error(
        `[Thread Enricher] Platform batch failed: ${result.reason}`
      );
    }
  }

  // Calculate stats
  const succeeded = allResults.filter((r) => r.status === "success").length;
  const failed = allResults.filter((r) => r.status === "failed").length;
  const expired = allResults.filter((r) => r.status === "expired").length;

  return {
    results: allResults,
    stats: {
      total: threads.length,
      succeeded,
      failed,
      expired,
      durationMs: Date.now() - startTime,
    },
  };
}

/**
 * Enriches a single thread by URL and platform.
 * Convenience wrapper for enriching one thread at a time.
 */
export async function enrichSingleThread(
  url: string,
  platform: Platform
): Promise<EnrichmentResult> {
  const batchResult = await enrichThreads([{ url, platform }]);
  return (
    batchResult.results[0] ?? {
      url,
      platform,
      enriched: null,
      error: "No result returned",
      status: "failed" as const,
    }
  );
}

// ============================================
// Platform-Specific Enrichment
// ============================================

/**
 * Enriches Reddit threads using the Apify Reddit Scraper.
 * Fetches full post body, top 15 comments (2 levels deep), sorted by top.
 */
async function enrichRedditThreads(
  threads: EnrichmentInput[]
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = [];
  const batches = splitIntoBatches(threads, MAX_THREADS_PER_BATCH);

  for (const batch of batches) {
    const urls = batch.map((t) => t.url);

    try {
      const actorResult = await withRetry(
        () =>
          runActor<ReturnType<typeof buildRedditInput>, RedditScraperResult>(
            ACTOR_IDS.REDDIT_SCRAPER,
            buildRedditInput(urls),
            { timeoutSecs: ENRICHMENT_TIMEOUT_SECS }
          ),
        {
          maxRetries: 2,
          baseDelayMs: 5000,
          retryableErrors: ["APIFY_ACTOR_ERROR"],
        }
      );

      // Map results back to input threads by URL matching
      const itemsByUrl = new Map<string, RedditScraperResult>();
      for (const item of actorResult.items) {
        if (item.url) {
          const normalized = normalizeUrlForMatch(item.url);
          itemsByUrl.set(normalized, item);
        }
      }

      for (const thread of batch) {
        const normalized = normalizeUrlForMatch(thread.url);
        const item = itemsByUrl.get(normalized);

        if (item) {
          // Check if thread is locked or archived
          if (item.isLocked || item.isArchived) {
            results.push({
              url: thread.url,
              platform: "reddit",
              threadId: thread.threadId,
              enriched: parseRedditThread(item),
              error: item.isLocked
                ? "Thread is locked"
                : "Thread is archived",
              status: "expired",
            });
          } else {
            results.push({
              url: thread.url,
              platform: "reddit",
              threadId: thread.threadId,
              enriched: parseRedditThread(item),
              error: null,
              status: "success",
            });
          }
        } else {
          // Thread not found in results — may have been deleted
          results.push({
            url: thread.url,
            platform: "reddit",
            threadId: thread.threadId,
            enriched: null,
            error: "Thread not found in scraper results (may be deleted)",
            status: "expired",
          });
        }
      }
    } catch (error) {
      // Entire batch failed — mark all threads as failed
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[Thread Enricher] Reddit batch failed (${batch.length} threads): ${message}`
      );

      for (const thread of batch) {
        results.push({
          url: thread.url,
          platform: "reddit",
          threadId: thread.threadId,
          enriched: null,
          error: `Enrichment failed: ${message}`,
          status: "failed",
        });
      }
    }
  }

  return results;
}

/**
 * Enriches Quora threads using the Apify Quora Scraper.
 * Fetches question body + top 10 answers with upvote counts.
 */
async function enrichQuoraThreads(
  threads: EnrichmentInput[]
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = [];
  const batches = splitIntoBatches(threads, MAX_THREADS_PER_BATCH);

  for (const batch of batches) {
    const urls = batch.map((t) => t.url);

    try {
      const actorResult = await withRetry(
        () =>
          runActor<ReturnType<typeof buildQuoraInput>, QuoraScraperResult>(
            ACTOR_IDS.QUORA_SCRAPER,
            buildQuoraInput(urls),
            { timeoutSecs: ENRICHMENT_TIMEOUT_SECS }
          ),
        {
          maxRetries: 2,
          baseDelayMs: 5000,
          retryableErrors: ["APIFY_ACTOR_ERROR"],
        }
      );

      // Map results back to input threads by URL matching
      const itemsByUrl = new Map<string, QuoraScraperResult>();
      for (const item of actorResult.items) {
        if (item.url) {
          const normalized = normalizeUrlForMatch(item.url);
          itemsByUrl.set(normalized, item);
        }
      }

      for (const thread of batch) {
        const normalized = normalizeUrlForMatch(thread.url);
        const item = itemsByUrl.get(normalized);

        if (item) {
          results.push({
            url: thread.url,
            platform: "quora",
            threadId: thread.threadId,
            enriched: parseQuoraThread(item),
            error: null,
            status: "success",
          });
        } else {
          results.push({
            url: thread.url,
            platform: "quora",
            threadId: thread.threadId,
            enriched: null,
            error: "Question not found in scraper results (may be deleted or merged)",
            status: "expired",
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[Thread Enricher] Quora batch failed (${batch.length} threads): ${message}`
      );

      for (const thread of batch) {
        results.push({
          url: thread.url,
          platform: "quora",
          threadId: thread.threadId,
          enriched: null,
          error: `Enrichment failed: ${message}`,
          status: "failed",
        });
      }
    }
  }

  return results;
}

/**
 * Facebook Groups enrichment.
 *
 * Facebook scraping is inherently fragile due to frequent anti-scraping
 * measures and DOM changes. We return minimal enrichment results and
 * flag failures gracefully rather than blocking the pipeline.
 *
 * In the future, this could be replaced with a browser agent or
 * Claude Computer Use for more reliable extraction.
 */
async function enrichFacebookThreads(
  threads: EnrichmentInput[]
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = [];

  for (const thread of threads) {
    // For now, Facebook threads get minimal enrichment.
    // The thread title from SERP discovery is retained, and we
    // mark the enrichment as successful with partial data.
    results.push({
      url: thread.url,
      platform: "facebook_groups",
      threadId: thread.threadId,
      enriched: {
        body_text: "",
        author: "unknown",
        comment_count: 0,
        upvote_count: 0,
        thread_date: new Date().toISOString(),
        top_comments: [],
      },
      error: "Facebook Group enrichment limited — partial data only",
      status: "success",
    });
  }

  return results;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Groups threads by platform for batch processing.
 */
function groupByPlatform(threads: EnrichmentInput[]): Record<Platform, EnrichmentInput[]> {
  const grouped: Record<Platform, EnrichmentInput[]> = {
    reddit: [],
    quora: [],
    facebook_groups: [],
  };

  for (const thread of threads) {
    if (thread.platform in grouped) {
      grouped[thread.platform].push(thread);
    }
  }

  return grouped;
}

/**
 * Splits an array into batches of the specified size.
 */
function splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Normalizes a URL for matching between input and output.
 * Strips scheme, www, trailing slashes, and query parameters.
 */
function normalizeUrlForMatch(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${host}${path}`.toLowerCase();
  } catch {
    return url.toLowerCase().replace(/\/+$/, "").trim();
  }
}
