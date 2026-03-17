import type { Platform } from "@/types/enums";

// ============================================
// Apify Actor IDs
// These are the official Apify store actor identifiers.
// ============================================

export const ACTOR_IDS = {
  /** Google Search Results Scraper — scrapes Google SERP pages */
  GOOGLE_SEARCH_SCRAPER: "apify/google-search-scraper",

  /** Reddit Scraper — scrapes Reddit posts and comments */
  REDDIT_SCRAPER: "apify/reddit-scraper",

  /** Quora Scraper — scrapes Quora questions and answers */
  QUORA_SCRAPER: "trudax/quora-scraper",
} as const;

// ============================================
// Input Schema Builders
// Each function constructs the correct input object for the
// corresponding Apify actor, following their expected schemas.
// ============================================

/**
 * Builds a Google Search Scraper input for a keyword + platform combination.
 *
 * Generates a site-scoped search query (e.g., "site:reddit.com music licensing")
 * to discover platform-specific threads ranking in Google.
 */
export function buildSerpInput(
  keyword: string,
  platform: Platform
): GoogleSearchScraperInput {
  const queries = buildSerpQueries(keyword, platform);

  return {
    queries: queries.join("\n"),
    maxPagesPerQuery: 2,
    resultsPerPage: 10,
    languageCode: "en",
    countryCode: "us",
    mobileResults: false,
    includeUnfilteredResults: false,
    saveHtml: false,
    saveHtmlToKeyValueStore: false,
  };
}

/**
 * Builds search queries for a keyword + platform.
 * Returns multiple query variations for better coverage.
 */
export function buildSerpQueries(keyword: string, platform: Platform): string[] {
  switch (platform) {
    case "reddit":
      return [
        `site:reddit.com ${keyword}`,
        `${keyword} reddit`,
      ];
    case "quora":
      return [
        `site:quora.com ${keyword}`,
        `${keyword} quora`,
      ];
    case "facebook_groups":
      return [
        `${keyword} facebook group`,
        `site:facebook.com/groups ${keyword}`,
      ];
    default: {
      // Exhaustive check
      const _exhaustive: never = platform;
      throw new Error(`Unknown platform: ${_exhaustive}`);
    }
  }
}

/**
 * Builds a batch SERP input for multiple keyword-platform combinations.
 * Batches all queries into a single actor run (max 100 queries per run).
 */
export function buildBatchSerpInput(
  keywords: Array<{ keyword: string; platforms: Platform[] }>
): GoogleSearchScraperInput {
  const allQueries: string[] = [];

  for (const { keyword, platforms } of keywords) {
    for (const platform of platforms) {
      const queries = buildSerpQueries(keyword, platform);
      allQueries.push(...queries);
    }
  }

  // Apify google-search-scraper accepts queries as newline-separated string
  return {
    queries: allQueries.join("\n"),
    maxPagesPerQuery: 2,
    resultsPerPage: 10,
    languageCode: "en",
    countryCode: "us",
    mobileResults: false,
    includeUnfilteredResults: false,
    saveHtml: false,
    saveHtmlToKeyValueStore: false,
  };
}

/**
 * Builds a Reddit Scraper input for fetching full thread content + comments.
 *
 * @param urls - Array of Reddit thread URLs to scrape
 */
export function buildRedditInput(urls: string[]): RedditScraperInput {
  return {
    startUrls: urls.map((url) => ({ url })),
    maxComments: 15,
    maxCommunitiesCount: 0,
    maxItems: urls.length,
    maxPostCount: urls.length,
    maxUserCount: 0,
    proxy: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
    },
    scrollTimeout: 40,
    searchComments: false,
    searchCommunities: false,
    searchPosts: false,
    searchUsers: false,
    skipComments: false,
    sort: "top",
  };
}

/**
 * Builds a Quora Scraper input for fetching full question content + answers.
 *
 * @param urls - Array of Quora question URLs to scrape
 */
export function buildQuoraInput(urls: string[]): QuoraScraperInput {
  return {
    startUrls: urls.map((url) => ({ url })),
    maxAnswers: 10,
    maxItems: urls.length,
    proxy: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
    },
  };
}

// ============================================
// Input Type Definitions
// Match the Apify actor input schemas.
// ============================================

export interface GoogleSearchScraperInput {
  /** Newline-separated search queries */
  queries: string;
  /** Maximum pages to scrape per query (1-10) */
  maxPagesPerQuery: number;
  /** Results per page (10, 20, 50, 100) */
  resultsPerPage: number;
  /** Language code for results */
  languageCode: string;
  /** Country code for geo-targeting */
  countryCode: string;
  /** Whether to scrape mobile results */
  mobileResults: boolean;
  /** Include unfiltered results */
  includeUnfilteredResults: boolean;
  /** Save raw HTML */
  saveHtml: boolean;
  /** Save HTML to key-value store */
  saveHtmlToKeyValueStore: boolean;
}

export interface RedditScraperInput {
  startUrls: Array<{ url: string }>;
  maxComments: number;
  maxCommunitiesCount: number;
  maxItems: number;
  maxPostCount: number;
  maxUserCount: number;
  proxy: {
    useApifyProxy: boolean;
    apifyProxyGroups: string[];
  };
  scrollTimeout: number;
  searchComments: boolean;
  searchCommunities: boolean;
  searchPosts: boolean;
  searchUsers: boolean;
  skipComments: boolean;
  sort: string;
}

export interface QuoraScraperInput {
  startUrls: Array<{ url: string }>;
  maxAnswers: number;
  maxItems: number;
  proxy: {
    useApifyProxy: boolean;
    apifyProxyGroups: string[];
  };
}

// ============================================
// Output Type Definitions (raw Apify output)
// These types represent the raw output from Apify actors.
// Parsing into domain types happens in parsers.ts.
// ============================================

export interface GoogleSearchResult {
  searchQuery?: {
    term?: string;
    page?: number;
    type?: string;
    countryCode?: string;
    languageCode?: string;
    resultsPerPage?: number;
  };
  organicResults?: Array<{
    title?: string;
    url?: string;
    displayedUrl?: string;
    description?: string;
    position?: number;
    emphasizedKeywords?: string[];
    siteLinks?: unknown[];
    productInfo?: unknown;
    date?: string;
  }>;
}

export interface RedditScraperResult {
  id?: string;
  url?: string;
  title?: string;
  body?: string;
  username?: string;
  communityName?: string;
  upVotes?: number;
  numberOfComments?: number;
  createdAt?: string;
  comments?: Array<{
    id?: string;
    body?: string;
    username?: string;
    upVotes?: number;
    createdAt?: string;
    replies?: Array<{
      id?: string;
      body?: string;
      username?: string;
      upVotes?: number;
      createdAt?: string;
    }>;
  }>;
  over18?: boolean;
  isLocked?: boolean;
  isArchived?: boolean;
}

export interface QuoraScraperResult {
  url?: string;
  question?: string;
  questionText?: string;
  answers?: Array<{
    author?: string;
    authorUrl?: string;
    text?: string;
    upvotes?: number;
    date?: string;
    isTopAnswer?: boolean;
  }>;
  answerCount?: number;
  followers?: number;
  createdAt?: string;
}
