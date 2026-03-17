import type { DiscoveredThread, EnrichedThread } from "@/lib/agents/interfaces";
import type { Platform } from "@/types/enums";
import type {
  GoogleSearchResult,
  RedditScraperResult,
  QuoraScraperResult,
} from "./actors";

// ============================================
// URL Patterns for Platform Detection
// Used to identify which platform a URL belongs to
// and to filter out non-thread pages.
// ============================================

const REDDIT_THREAD_PATTERN =
  /reddit\.com\/r\/[\w]+\/comments\/[\w]+/i;

const REDDIT_NON_THREAD_PATTERNS = [
  /reddit\.com\/r\/[\w]+\/?$/i,           // Subreddit homepage
  /reddit\.com\/r\/[\w]+\/wiki/i,          // Wiki pages
  /reddit\.com\/user\//i,                   // User profiles
  /reddit\.com\/r\/[\w]+\/about/i,         // About pages
  /reddit\.com\/r\/[\w]+\/search/i,        // Search within subreddit
  /reddit\.com\/?$/i,                       // Reddit homepage
];

const QUORA_THREAD_PATTERN =
  /quora\.com\/.+/i;

const QUORA_NON_THREAD_PATTERNS = [
  /quora\.com\/profile\//i,                 // User profiles
  /quora\.com\/topic\//i,                   // Topic pages
  /quora\.com\/search/i,                    // Search pages
  /quora\.com\/?$/i,                        // Quora homepage
  /quora\.com\/spaces\//i,                  // Spaces
];

const FACEBOOK_GROUP_PATTERN =
  /facebook\.com\/groups\/.+/i;

const FACEBOOK_NON_THREAD_PATTERNS = [
  /facebook\.com\/groups\/[\w.-]+\/?$/i,   // Group homepage (just the group, no post)
  /facebook\.com\/groups\/discover/i,       // Discover groups
  /facebook\.com\/groups\/feed/i,           // Feed page
  /facebook\.com\/?$/i,                     // Facebook homepage
];

// ============================================
// SERP Result Parser
// Parses Google Search results into DiscoveredThread format.
// ============================================

/**
 * Parses raw Google Search Scraper output into DiscoveredThread objects.
 *
 * Filters results to only include actual thread URLs from supported platforms.
 * Associates each result with the keyword and keywordId that triggered the search.
 *
 * @param items - Raw Apify Google Search Scraper output items
 * @param keyword - The keyword that was searched
 * @param keywordId - The database ID of the keyword
 * @returns Array of discovered threads with platform and position metadata
 */
export function parseSerpResults(
  items: GoogleSearchResult[],
  keyword: string,
  keywordId: string
): DiscoveredThread[] {
  const threads: DiscoveredThread[] = [];
  const seenUrls = new Set<string>();

  for (const item of items) {
    const organicResults = item.organicResults ?? [];

    for (const result of organicResults) {
      const url = result.url;
      const title = result.title;

      if (!url || !title) continue;

      // Normalize URL to avoid duplicates from the same SERP
      const normalizedUrl = normalizeUrl(url);
      if (seenUrls.has(normalizedUrl)) continue;

      // Detect platform from URL
      const platform = detectPlatform(url);
      if (!platform) continue;

      // Filter out non-thread URLs (subreddit homepages, user profiles, etc.)
      if (isNonThreadUrl(url, platform)) continue;

      seenUrls.add(normalizedUrl);

      threads.push({
        url: cleanUrl(url),
        title: title.trim(),
        snippet: (result.description ?? "").trim(),
        position: result.position,
        platform,
        keyword,
        keywordId,
      });
    }
  }

  return threads;
}

/**
 * Parses a batch of SERP results where each result may correspond to a
 * different keyword. Uses the search query to match results back to keywords.
 *
 * @param items - Raw Apify Google Search Scraper output items
 * @param keywordMap - Map of keyword text to { id, keyword, platforms }
 * @returns Array of discovered threads
 */
export function parseBatchSerpResults(
  items: GoogleSearchResult[],
  keywordMap: Map<string, { id: string; keyword: string }>
): DiscoveredThread[] {
  const threads: DiscoveredThread[] = [];
  const seenUrls = new Set<string>();

  for (const item of items) {
    const organicResults = item.organicResults ?? [];
    const searchTerm = item.searchQuery?.term ?? "";

    // Find the keyword that matches this search query
    const matchedKeyword = findMatchingKeyword(searchTerm, keywordMap);
    if (!matchedKeyword) continue;

    for (const result of organicResults) {
      const url = result.url;
      const title = result.title;

      if (!url || !title) continue;

      const normalizedUrl = normalizeUrl(url);
      if (seenUrls.has(normalizedUrl)) continue;

      const platform = detectPlatform(url);
      if (!platform) continue;

      if (isNonThreadUrl(url, platform)) continue;

      seenUrls.add(normalizedUrl);

      threads.push({
        url: cleanUrl(url),
        title: title.trim(),
        snippet: (result.description ?? "").trim(),
        position: result.position,
        platform,
        keyword: matchedKeyword.keyword,
        keywordId: matchedKeyword.id,
      });
    }
  }

  return threads;
}

// ============================================
// Reddit Thread Parser
// Parses Reddit Scraper output into EnrichedThread format.
// ============================================

/**
 * Parses a single Reddit Scraper result into an EnrichedThread.
 *
 * Extracts the post body, author, vote/comment counts, date,
 * and flattens the top comments (including one level of replies)
 * into a sorted array by upvotes.
 */
export function parseRedditThread(item: RedditScraperResult): EnrichedThread {
  // Flatten comments: top-level + one level of replies, sorted by upvotes desc
  const flatComments: Array<{ author: string; body: string; upvotes: number }> = [];

  for (const comment of item.comments ?? []) {
    if (comment.body && comment.body.trim().length > 0) {
      flatComments.push({
        author: comment.username ?? "[deleted]",
        body: comment.body.trim(),
        upvotes: comment.upVotes ?? 0,
      });
    }

    // Include one level of replies
    for (const reply of comment.replies ?? []) {
      if (reply.body && reply.body.trim().length > 0) {
        flatComments.push({
          author: reply.username ?? "[deleted]",
          body: reply.body.trim(),
          upvotes: reply.upVotes ?? 0,
        });
      }
    }
  }

  // Sort by upvotes descending, take top 15
  flatComments.sort((a, b) => b.upvotes - a.upvotes);
  const topComments = flatComments.slice(0, 15);

  return {
    body_text: (item.body ?? "").trim(),
    author: item.username ?? "[deleted]",
    comment_count: item.numberOfComments ?? 0,
    upvote_count: item.upVotes ?? 0,
    thread_date: item.createdAt ?? new Date().toISOString(),
    top_comments: topComments,
  };
}

// ============================================
// Quora Thread Parser
// Parses Quora Scraper output into EnrichedThread format.
// ============================================

/**
 * Parses a single Quora Scraper result into an EnrichedThread.
 *
 * Uses the question text as the body (Quora questions are self-contained),
 * and maps answers to the top_comments format sorted by upvotes.
 */
export function parseQuoraThread(item: QuoraScraperResult): EnrichedThread {
  const topComments: Array<{ author: string; body: string; upvotes: number }> = [];

  for (const answer of item.answers ?? []) {
    if (answer.text && answer.text.trim().length > 0) {
      topComments.push({
        author: answer.author ?? "Anonymous",
        body: answer.text.trim(),
        upvotes: answer.upvotes ?? 0,
      });
    }
  }

  // Sort by upvotes descending, take top 10
  topComments.sort((a, b) => b.upvotes - a.upvotes);
  const limitedComments = topComments.slice(0, 10);

  return {
    body_text: (item.questionText ?? item.question ?? "").trim(),
    author: "community", // Quora questions don't always have a clear single author
    comment_count: item.answerCount ?? limitedComments.length,
    upvote_count: item.followers ?? 0,
    thread_date: item.createdAt ?? new Date().toISOString(),
    top_comments: limitedComments,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Detects which platform a URL belongs to.
 * Returns null if the URL doesn't match any supported platform.
 */
export function detectPlatform(url: string): Platform | null {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("reddit.com")) return "reddit";
  if (lowerUrl.includes("quora.com")) return "quora";
  if (lowerUrl.includes("facebook.com/groups")) return "facebook_groups";

  return null;
}

/**
 * Checks if a URL is a non-thread page (homepage, profile, wiki, etc.).
 * These should be filtered out of discovery results.
 */
function isNonThreadUrl(url: string, platform: Platform): boolean {
  switch (platform) {
    case "reddit":
      // Must match the thread pattern (r/sub/comments/id)
      if (!REDDIT_THREAD_PATTERN.test(url)) return true;
      return REDDIT_NON_THREAD_PATTERNS.some((pattern) => pattern.test(url));

    case "quora":
      if (!QUORA_THREAD_PATTERN.test(url)) return true;
      return QUORA_NON_THREAD_PATTERNS.some((pattern) => pattern.test(url));

    case "facebook_groups":
      if (!FACEBOOK_GROUP_PATTERN.test(url)) return true;
      return FACEBOOK_NON_THREAD_PATTERNS.some((pattern) => pattern.test(url));

    default:
      return true;
  }
}

/**
 * Normalizes a URL for dedup comparison within a single SERP batch.
 * Strips query params, hash, trailing slashes, and www prefix.
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${host}${path}`.toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

/**
 * Cleans a URL for storage: removes tracking params but keeps essential path.
 */
function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    const trackingParams = [
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "ref", "ref_source", "fbclid", "gclid", "share_id",
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Extracts a subreddit name from a Reddit URL.
 * e.g., "https://reddit.com/r/WeAreTheMusicMakers/comments/..." → "r/WeAreTheMusicMakers"
 */
export function extractSubreddit(url: string): string | null {
  const match = url.match(/reddit\.com\/(r\/[\w]+)/i);
  return match ? match[1] : null;
}

/**
 * Extracts a Facebook group name from a Facebook URL.
 * e.g., "https://facebook.com/groups/indiemusicians/..." → "indiemusicians"
 */
export function extractFacebookGroup(url: string): string | null {
  const match = url.match(/facebook\.com\/groups\/([\w.-]+)/i);
  if (match && match[1] !== "discover" && match[1] !== "feed") {
    return match[1];
  }
  return null;
}

/**
 * Matches a search query back to a keyword from the keyword map.
 * Handles the fact that search queries are modified versions of keywords
 * (e.g., "site:reddit.com music licensing" → "music licensing").
 */
function findMatchingKeyword(
  searchTerm: string,
  keywordMap: Map<string, { id: string; keyword: string }>
): { id: string; keyword: string } | null {
  // Strip site: operators and platform names from the search term
  const cleaned = searchTerm
    .replace(/site:\S+\s*/gi, "")
    .replace(/\b(reddit|quora|facebook\s+group)\b/gi, "")
    .trim()
    .toLowerCase();

  // Try exact match first
  for (const [key, value] of Array.from(keywordMap.entries())) {
    if (key.toLowerCase() === cleaned) {
      return value;
    }
  }

  // Try substring match (keyword appears in the cleaned search term)
  for (const [key, value] of Array.from(keywordMap.entries())) {
    if (cleaned.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Try reverse: search term appears in keyword
  for (const [key, value] of Array.from(keywordMap.entries())) {
    if (key.toLowerCase().includes(cleaned) && cleaned.length > 3) {
      return value;
    }
  }

  return null;
}
