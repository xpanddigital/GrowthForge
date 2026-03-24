// Reddit JSON Scraper — zero cost, no Apify needed.
// Reddit serves JSON for any thread by appending .json to the URL.
// Rate limit: ~60 requests/minute with proper User-Agent.

import type { EnrichedThread } from "@/lib/agents/interfaces";

const USER_AGENT = "GrowthForge/1.0 (AI SEO Platform; contact: joel@xpanddigital.com)";
const REQUEST_DELAY_MS = 1100; // ~1 req/sec to stay under rate limits

interface RedditComment {
  author: string;
  body: string;
  ups: number;
  created_utc: number;
  replies?: {
    data?: {
      children?: Array<{ data: RedditComment }>;
    };
  };
}

interface RedditPost {
  title: string;
  selftext: string;
  author: string;
  ups: number;
  num_comments: number;
  created_utc: number;
  url: string;
  subreddit: string;
  is_self: boolean;
  locked: boolean;
  archived: boolean;
  over_18: boolean;
}

/**
 * Fetch a single Reddit thread's full content via the JSON API.
 * Appends .json to the thread URL and parses the response.
 */
export async function scrapeRedditThread(threadUrl: string): Promise<EnrichedThread> {
  // Normalize URL: strip query params, ensure no trailing slash before .json
  const cleanUrl = normalizeRedditUrl(threadUrl);
  const jsonUrl = `${cleanUrl}.json?limit=15&sort=top&raw_json=1`;

  const response = await fetch(jsonUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "application/json",
    },
  });

  if (response.status === 429) {
    throw new Error("Reddit rate limit hit — try again in a minute");
  }

  if (!response.ok) {
    throw new Error(`Reddit JSON API returned ${response.status} for ${cleanUrl}`);
  }

  const data = await response.json();

  // Reddit returns an array: [post_listing, comments_listing]
  if (!Array.isArray(data) || data.length < 2) {
    throw new Error(`Unexpected Reddit JSON structure for ${cleanUrl}`);
  }

  const postData = data[0]?.data?.children?.[0]?.data as RedditPost | undefined;
  if (!postData) {
    throw new Error(`No post data found in Reddit JSON for ${cleanUrl}`);
  }

  // Extract top comments (flatten one level of replies)
  const rawComments = (data[1]?.data?.children || []) as Array<{
    kind: string;
    data: RedditComment;
  }>;

  const topComments = rawComments
    .filter((c) => c.kind === "t1") // t1 = comment, skip "more" listings
    .slice(0, 15)
    .map((c) => ({
      author: c.data.author || "deleted",
      body: c.data.body || "",
      upvotes: c.data.ups || 0,
    }))
    .filter((c) => c.body.length > 0 && c.author !== "AutoModerator");

  return {
    body_text: postData.selftext || "",
    author: postData.author || "deleted",
    comment_count: postData.num_comments || 0,
    upvote_count: postData.ups || 0,
    thread_date: new Date(postData.created_utc * 1000).toISOString(),
    top_comments: topComments,
  };
}

/**
 * Batch scrape multiple Reddit threads with rate limiting.
 * Returns results keyed by URL for easy matching.
 */
export async function scrapeRedditThreadsBatch(
  threadUrls: string[]
): Promise<Map<string, EnrichedThread | Error>> {
  const results = new Map<string, EnrichedThread | Error>();

  for (let i = 0; i < threadUrls.length; i++) {
    const url = threadUrls[i];

    try {
      const enriched = await scrapeRedditThread(url);
      results.set(url, enriched);
    } catch (err) {
      results.set(url, err instanceof Error ? err : new Error(String(err)));
    }

    // Rate limit: wait between requests (skip after last one)
    if (i < threadUrls.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return results;
}

/**
 * Normalize a Reddit URL for the JSON API.
 * Handles various Reddit URL formats:
 * - https://www.reddit.com/r/sub/comments/id/title/
 * - https://old.reddit.com/r/sub/comments/id/title
 * - https://reddit.com/r/sub/comments/id/title
 * - https://www.reddit.com/r/sub/comments/id/title/?utm_source=...
 */
function normalizeRedditUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Force www.reddit.com
    parsed.hostname = "www.reddit.com";
    // Strip query params
    parsed.search = "";
    // Strip trailing slash
    let path = parsed.pathname.replace(/\/+$/, "");
    // Remove .json if already present
    path = path.replace(/\.json$/, "");
    return `https://www.reddit.com${path}`;
  } catch {
    // If URL parsing fails, do basic cleanup
    return url
      .replace(/old\.reddit\.com/, "www.reddit.com")
      .replace(/\?.*$/, "")
      .replace(/\/+$/, "")
      .replace(/\.json$/, "");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
