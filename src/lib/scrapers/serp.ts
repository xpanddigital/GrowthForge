// Google SERP Scraper — uses SerpAPI instead of Apify.
// SerpAPI is cheaper and more reliable than Apify for SERP scraping.
// Free tier: 100 searches/month. Paid: $50/mo for 5,000 searches.

import type { DiscoveredThread } from "@/lib/agents/interfaces";

const SERPAPI_URL = "https://serpapi.com/search.json";
const REQUEST_DELAY_MS = 1500; // Rate limit between requests

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

interface SerpApiResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  displayed_link?: string;
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

/**
 * Search Google via SerpAPI for a single query.
 * Returns organic results matching our target platforms.
 */
async function searchGoogle(
  query: string,
  apiKey: string
): Promise<SerpApiResult[]> {
  const params = new URLSearchParams({
    q: query,
    api_key: apiKey,
    engine: "google",
    num: "20", // 20 results per query
    gl: "us",
    hl: "en",
  });

  const response = await fetch(`${SERPAPI_URL}?${params}`);

  if (response.status === 429) {
    throw new Error("SerpAPI rate limit hit");
  }

  if (response.status === 401) {
    throw new Error("SerpAPI API key invalid or expired");
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown");
    throw new Error(`SerpAPI error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return (data.organic_results || []) as SerpApiResult[];
}

/**
 * Discover threads across Google SERPs for a set of keywords.
 * Replaces Apify's google-search-scraper — cheaper and more reliable.
 */
export async function discoverThreadsViaSerpApi(
  keywords: Array<{ id: string; keyword: string; platforms: string[] }>
): Promise<DiscoveredThread[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY not set — required for SERP discovery");
  }

  // Build all queries
  const allQueries: Array<{
    query: string;
    keywordId: string;
    keyword: string;
  }> = [];

  for (const kw of keywords) {
    const queries = generateSearchQueries(kw.keyword, kw.platforms);
    for (const query of queries) {
      allQueries.push({
        query,
        keywordId: kw.id,
        keyword: kw.keyword,
      });
    }
  }

  const allThreads: DiscoveredThread[] = [];
  const seenUrls = new Set<string>();

  for (let i = 0; i < allQueries.length; i++) {
    const { query, keywordId, keyword } = allQueries[i];

    try {
      const results = await searchGoogle(query, apiKey);

      for (const result of results) {
        if (!result.link || !result.title) continue;

        const platform = detectPlatform(result.link);
        if (!platform) continue;
        if (shouldSkipUrl(result.link)) continue;
        if (seenUrls.has(result.link)) continue;

        seenUrls.add(result.link);
        allThreads.push({
          url: result.link,
          title: result.title,
          snippet: result.snippet || "",
          position: result.position,
          platform,
          keyword,
          keywordId,
        });
      }
    } catch (err) {
      // Log but continue — don't let one failed query kill the whole scan
      console.error(`[SerpAPI] Query failed: "${query}":`, err);
    }

    // Rate limit between requests (skip after last)
    if (i < allQueries.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return allThreads;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
