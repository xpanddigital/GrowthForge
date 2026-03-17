import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscoveredThread } from "@/lib/agents/interfaces";
import { generateContentHash } from "@/lib/utils/hash";

// ============================================
// Thread Deduplication
//
// Uses SHA256 content hashes to prevent duplicate thread entries.
// Dedup is scoped per-client: the same thread URL discovered for
// different clients creates separate thread records (since each
// client represents a different citation opportunity).
// ============================================

/**
 * Filters out threads that have already been discovered for a given client.
 *
 * Computes a content hash for each thread (SHA256 of normalized title + URL),
 * checks the database for existing threads with matching hashes for the
 * specified client, and returns only the new (unseen) threads.
 *
 * @param threads - Array of discovered threads to deduplicate
 * @param clientId - The client ID to scope dedup against
 * @param supabase - Supabase client instance (service role for background jobs)
 * @returns Filtered array containing only threads not yet in the database
 */
export async function deduplicateThreads(
  threads: DiscoveredThread[],
  clientId: string,
  supabase: SupabaseClient
): Promise<DiscoveredThread[]> {
  if (threads.length === 0) return [];

  // Compute content hashes for all incoming threads
  const threadHashes = threads.map((thread) => ({
    thread,
    hash: generateContentHash(thread.title, thread.url),
  }));

  // Collect all hashes to check
  const hashesToCheck = threadHashes.map((t) => t.hash);

  // Query existing hashes for this client in batches
  // (Supabase .in() has a practical limit, so we batch)
  const existingHashes = await fetchExistingHashes(
    hashesToCheck,
    clientId,
    supabase
  );

  // Filter to only new threads
  const newThreads = threadHashes
    .filter((item) => !existingHashes.has(item.hash))
    .map((item) => item.thread);

  return newThreads;
}

/**
 * Computes the content hash for a discovered thread.
 * Exposed for use when inserting threads into the database.
 *
 * @param title - Thread title
 * @param url - Thread URL
 * @returns SHA256 content hash
 */
export function computeThreadHash(title: string, url: string): string {
  return generateContentHash(title, url);
}

/**
 * Deduplicates threads within a single batch (in-memory).
 * Removes threads with duplicate content hashes, keeping the first occurrence
 * (or the one with the better SERP position if positions are available).
 *
 * This does NOT check the database — use deduplicateThreads() for
 * database-aware dedup.
 *
 * @param threads - Array of threads to deduplicate in-memory
 * @returns Deduplicated array
 */
export function deduplicateInMemory(
  threads: DiscoveredThread[]
): DiscoveredThread[] {
  const hashMap = new Map<string, DiscoveredThread>();

  for (const thread of threads) {
    const hash = generateContentHash(thread.title, thread.url);
    const existing = hashMap.get(hash);

    if (!existing) {
      hashMap.set(hash, thread);
    } else {
      // Keep the thread with the better (lower) SERP position
      const existingPos = existing.position ?? Infinity;
      const newPos = thread.position ?? Infinity;
      if (newPos < existingPos) {
        hashMap.set(hash, thread);
      }
    }
  }

  return Array.from(hashMap.values());
}

// ============================================
// Database Queries
// ============================================

/** Maximum hashes to check per database query */
const HASH_BATCH_SIZE = 200;

/**
 * Fetches existing content hashes from the threads table for a given client.
 * Batches queries to stay within Supabase parameter limits.
 *
 * @param hashes - Array of content hashes to check
 * @param clientId - Client ID to scope the search
 * @param supabase - Supabase client instance
 * @returns Set of existing hashes found in the database
 */
async function fetchExistingHashes(
  hashes: string[],
  clientId: string,
  supabase: SupabaseClient
): Promise<Set<string>> {
  const existingHashes = new Set<string>();

  // Remove duplicate hashes before querying
  const uniqueHashes = Array.from(new Set(hashes));

  // Batch queries to avoid exceeding parameter limits
  for (let i = 0; i < uniqueHashes.length; i += HASH_BATCH_SIZE) {
    const batch = uniqueHashes.slice(i, i + HASH_BATCH_SIZE);

    const { data, error } = await supabase
      .from("threads")
      .select("content_hash")
      .eq("client_id", clientId)
      .in("content_hash", batch);

    if (error) {
      console.error(
        `[Dedup] Error checking existing hashes (batch ${Math.floor(i / HASH_BATCH_SIZE) + 1}):`,
        error.message
      );
      // On error, skip this batch rather than failing entirely.
      // This means some duplicates may slip through, which is safe —
      // the UNIQUE constraint on (client_id, content_hash) will catch them.
      continue;
    }

    if (data) {
      for (const row of data) {
        existingHashes.add(row.content_hash);
      }
    }
  }

  return existingHashes;
}

/**
 * Checks if a single thread already exists for a client.
 * Useful for manual thread addition flows.
 *
 * @param title - Thread title
 * @param url - Thread URL
 * @param clientId - Client ID
 * @param supabase - Supabase client instance
 * @returns True if the thread already exists
 */
export async function threadExists(
  title: string,
  url: string,
  clientId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const hash = generateContentHash(title, url);

  const { data, error } = await supabase
    .from("threads")
    .select("id")
    .eq("client_id", clientId)
    .eq("content_hash", hash)
    .limit(1);

  if (error) {
    console.error("[Dedup] Error checking thread existence:", error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}
