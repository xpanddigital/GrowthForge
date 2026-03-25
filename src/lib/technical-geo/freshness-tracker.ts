// =============================================================================
// Technical GEO — Content Freshness Tracker
// Crawls a client's top pages, detects last-modified dates, classifies
// freshness, cross-references with AI Monitor data to flag "citation at risk"
// pages, and generates AI-powered refresh briefs.
// =============================================================================

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import { withRetry } from "@/lib/utils/retry";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type FreshnessCategory = "fresh" | "aging" | "stale" | "expired";

export interface PageFreshnessResult {
  url: string;
  title: string | null;
  lastModifiedHeader: string | null;
  contentDateDetected: string | null;
  effectiveDate: string | null;
  daysSinceUpdate: number | null;
  category: FreshnessCategory;
  isCitedByAi: boolean;
  citedByModels: string[];
  citationAtRisk: boolean;
  refreshBrief: string | null;
  refreshPriority: "critical" | "high" | "medium" | "low";
}

export interface FreshnessResult {
  pages: PageFreshnessResult[];
  overallScore: number;
  summary: {
    total: number;
    fresh: number;
    aging: number;
    stale: number;
    expired: number;
    atRiskCount: number;
  };
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
}

interface AiCitationMap {
  [url: string]: string[]; // URL → AI model names that cite it
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const FETCH_USER_AGENT =
  "Mozilla/5.0 (compatible; GrowthForge/1.0; +https://growthforge.io)";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_PAGES = 20;

// Freshness thresholds (in days)
const FRESH_DAYS = 30;
const AGING_DAYS = 60;
const STALE_DAYS = 90;

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function scanContentFreshness(
  websiteUrl: string,
  aiCitations?: AiCitationMap
): Promise<FreshnessResult> {
  const baseUrl = websiteUrl.replace(/\/+$/, "");

  // Step 1: Discover pages from sitemap or homepage links
  const pageUrls = await discoverPages(baseUrl);

  // Step 2: Check freshness of each page
  const pages: PageFreshnessResult[] = [];
  const now = new Date();

  for (const url of pageUrls.slice(0, MAX_PAGES)) {
    try {
      const result = await checkPageFreshness(url, now, aiCitations);
      pages.push(result);
    } catch {
      // Skip pages that fail to load
      pages.push({
        url,
        title: null,
        lastModifiedHeader: null,
        contentDateDetected: null,
        effectiveDate: null,
        daysSinceUpdate: null,
        category: "expired",
        isCitedByAi: false,
        citedByModels: [],
        citationAtRisk: false,
        refreshBrief: null,
        refreshPriority: "low",
      });
    }
  }

  // Step 3: Generate refresh briefs for stale/expired pages that are cited
  const atRiskPages = pages.filter((p) => p.citationAtRisk);
  const stalePages = pages.filter(
    (p) =>
      (p.category === "stale" || p.category === "expired") &&
      !p.citationAtRisk
  );

  // Batch generate briefs for at-risk and stale pages
  const pagesNeedingBriefs = [...atRiskPages, ...stalePages.slice(0, 5)];
  if (pagesNeedingBriefs.length > 0) {
    try {
      const briefs = await generateRefreshBriefs(pagesNeedingBriefs);
      for (const brief of briefs) {
        const page = pages.find((p) => p.url === brief.url);
        if (page) {
          page.refreshBrief = brief.brief;
        }
      }
    } catch {
      // Briefs are nice-to-have, don't fail the scan
    }
  }

  // Step 4: Calculate overall score
  const summary = {
    total: pages.length,
    fresh: pages.filter((p) => p.category === "fresh").length,
    aging: pages.filter((p) => p.category === "aging").length,
    stale: pages.filter((p) => p.category === "stale").length,
    expired: pages.filter((p) => p.category === "expired").length,
    atRiskCount: atRiskPages.length,
  };

  const overallScore = calculateFreshnessScore(summary);

  return { pages, overallScore, summary };
}

// -----------------------------------------------------------------------------
// Page Discovery
// -----------------------------------------------------------------------------

async function discoverPages(baseUrl: string): Promise<string[]> {
  // Try sitemap.xml first
  const sitemapUrls = await parseSitemap(baseUrl);
  if (sitemapUrls.length > 0) {
    return sitemapUrls.map((s) => s.loc);
  }

  // Fall back to crawling homepage for internal links
  return await extractHomepageLinks(baseUrl);
}

async function parseSitemap(baseUrl: string): Promise<SitemapUrl[]> {
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  try {
    const response = await withRetry(
      () =>
        fetch(sitemapUrl, {
          headers: { "User-Agent": FETCH_USER_AGENT },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        }),
      { maxRetries: 2, baseDelayMs: 1000 }
    );

    if (!response.ok) return [];

    const xml = await response.text();
    const urls: SitemapUrl[] = [];

    // Simple XML regex parsing (no need for a full XML parser)
    const locRegex = /<loc>\s*(.*?)\s*<\/loc>/g;
    const lastmodRegex = /<lastmod>\s*(.*?)\s*<\/lastmod>/g;

    const locs: string[] = [];
    const lastmods: string[] = [];

    let match: RegExpExecArray | null;
    while ((match = locRegex.exec(xml)) !== null) {
      locs.push(match[1].trim());
    }
    while ((match = lastmodRegex.exec(xml)) !== null) {
      lastmods.push(match[1].trim());
    }

    for (let i = 0; i < locs.length; i++) {
      const loc = locs[i];
      // Filter to same-origin URLs only
      if (loc.startsWith(baseUrl) || loc.startsWith("/")) {
        urls.push({
          loc: loc.startsWith("/") ? `${baseUrl}${loc}` : loc,
          lastmod: lastmods[i] || undefined,
        });
      }
    }

    return urls;
  } catch {
    return [];
  }
}

async function extractHomepageLinks(baseUrl: string): Promise<string[]> {
  try {
    const response = await withRetry(
      () =>
        fetch(baseUrl, {
          headers: { "User-Agent": FETCH_USER_AGENT },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        }),
      { maxRetries: 2, baseDelayMs: 1000 }
    );

    if (!response.ok) return [baseUrl];

    const html = await response.text();
    const links = new Set<string>([baseUrl]);

    // Extract href attributes from anchor tags
    const hrefRegex = /href\s*=\s*["']([^"'#]+?)["']/gi;
    let match: RegExpExecArray | null;

    while ((match = hrefRegex.exec(html)) !== null) {
      const href = match[1].trim();
      let fullUrl: string | null = null;

      if (href.startsWith("http")) {
        // Absolute URL — only keep same-origin
        try {
          const url = new URL(href);
          const base = new URL(baseUrl);
          if (url.hostname === base.hostname) {
            fullUrl = href.split("?")[0].split("#")[0];
          }
        } catch {
          continue;
        }
      } else if (href.startsWith("/") && !href.startsWith("//")) {
        fullUrl = `${baseUrl}${href}`.split("?")[0].split("#")[0];
      }

      if (fullUrl && !isAssetUrl(fullUrl)) {
        links.add(fullUrl);
      }
    }

    return Array.from(links).slice(0, MAX_PAGES);
  } catch {
    return [baseUrl];
  }
}

function isAssetUrl(url: string): boolean {
  const assetExtensions = [
    ".css",
    ".js",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".webp",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".pdf",
    ".zip",
    ".mp4",
    ".mp3",
  ];
  const lower = url.toLowerCase();
  return assetExtensions.some((ext) => lower.endsWith(ext));
}

// -----------------------------------------------------------------------------
// Freshness Checking
// -----------------------------------------------------------------------------

async function checkPageFreshness(
  url: string,
  now: Date,
  aiCitations?: AiCitationMap
): Promise<PageFreshnessResult> {
  // HEAD request first for Last-Modified header
  let lastModifiedHeader: string | null = null;

  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": FETCH_USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });

    const lm = headResponse.headers.get("last-modified");
    if (lm) {
      const parsed = new Date(lm);
      if (!isNaN(parsed.getTime())) {
        lastModifiedHeader = parsed.toISOString();
      }
    }
  } catch {
    // HEAD failed, continue with GET
  }

  // GET request for page content (needed for title and content dates)
  let title: string | null = null;
  let contentDateDetected: string | null = null;

  try {
    const response = await withRetry(
      () =>
        fetch(url, {
          headers: { "User-Agent": FETCH_USER_AGENT },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          redirect: "follow",
        }),
      { maxRetries: 1, baseDelayMs: 1000 }
    );

    if (response.ok) {
      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].trim().substring(0, 200);
      }

      // Extract content dates from multiple sources
      contentDateDetected = extractContentDate(html);
    }
  } catch {
    // Page fetch failed
  }

  // Determine effective date (prefer content date, fall back to Last-Modified)
  const effectiveDate = contentDateDetected || lastModifiedHeader;

  // Calculate days since update
  let daysSinceUpdate: number | null = null;
  if (effectiveDate) {
    const lastDate = new Date(effectiveDate);
    daysSinceUpdate = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // Classify freshness
  const category = classifyFreshness(daysSinceUpdate);

  // Check AI citations
  const normalizedUrl = url.toLowerCase().replace(/\/+$/, "");
  const citedByModels: string[] = [];
  if (aiCitations) {
    for (const [citedUrl, models] of Object.entries(aiCitations)) {
      if (
        citedUrl.toLowerCase().replace(/\/+$/, "") === normalizedUrl ||
        normalizedUrl.includes(
          citedUrl.toLowerCase().replace(/\/+$/, "").replace(/^https?:\/\//, "")
        )
      ) {
        citedByModels.push(...models);
      }
    }
  }

  const isCitedByAi = citedByModels.length > 0;
  const citationAtRisk =
    isCitedByAi && (category === "stale" || category === "expired");

  const refreshPriority = citationAtRisk
    ? "critical"
    : category === "expired"
      ? "high"
      : category === "stale"
        ? "medium"
        : "low";

  return {
    url,
    title,
    lastModifiedHeader,
    contentDateDetected,
    effectiveDate,
    daysSinceUpdate,
    category,
    isCitedByAi,
    citedByModels: Array.from(new Set(citedByModels)),
    citationAtRisk,
    refreshBrief: null, // Set later in batch
    refreshPriority,
  };
}

function extractContentDate(html: string): string | null {
  // Try multiple date extraction strategies in priority order

  // 1. <meta> tags with date properties
  const metaDatePatterns = [
    /meta\s+(?:property|name)\s*=\s*["'](?:article:modified_time|article:published_time|og:updated_time|dateModified|date)["']\s+content\s*=\s*["']([^"']+)["']/i,
    /meta\s+content\s*=\s*["']([^"']+)["']\s+(?:property|name)\s*=\s*["'](?:article:modified_time|article:published_time|og:updated_time|dateModified|date)["']/i,
  ];

  for (const pattern of metaDatePatterns) {
    const match = html.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }

  // 2. JSON-LD dateModified / datePublished
  const jsonLdDateMatch = html.match(
    /"dateModified"\s*:\s*"([^"]+)"|"datePublished"\s*:\s*"([^"]+)"/
  );
  if (jsonLdDateMatch) {
    const dateStr = jsonLdDateMatch[1] || jsonLdDateMatch[2];
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // 3. <time> elements with datetime attribute
  const timeMatch = html.match(
    /<time[^>]+datetime\s*=\s*["']([^"']+)["'][^>]*>/i
  );
  if (timeMatch) {
    const parsed = new Date(timeMatch[1]);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
}

function classifyFreshness(daysSinceUpdate: number | null): FreshnessCategory {
  if (daysSinceUpdate === null) return "expired"; // Unknown = treat as expired
  if (daysSinceUpdate <= FRESH_DAYS) return "fresh";
  if (daysSinceUpdate <= AGING_DAYS) return "aging";
  if (daysSinceUpdate <= STALE_DAYS) return "stale";
  return "expired";
}

// -----------------------------------------------------------------------------
// Scoring
// -----------------------------------------------------------------------------

function calculateFreshnessScore(summary: {
  total: number;
  fresh: number;
  aging: number;
  stale: number;
  expired: number;
  atRiskCount: number;
}): number {
  if (summary.total === 0) return 0;

  // Weighted score: fresh=100, aging=60, stale=25, expired=0
  const weightedSum =
    summary.fresh * 100 +
    summary.aging * 60 +
    summary.stale * 25 +
    summary.expired * 0;

  let score = Math.round(weightedSum / summary.total);

  // Penalty for at-risk pages (cited but stale)
  const atRiskPenalty = summary.atRiskCount * 5;
  score = Math.max(0, score - atRiskPenalty);

  return Math.min(100, score);
}

// -----------------------------------------------------------------------------
// Refresh Brief Generation
// -----------------------------------------------------------------------------

async function generateRefreshBriefs(
  pages: PageFreshnessResult[]
): Promise<Array<{ url: string; brief: string }>> {
  const pageDescriptions = pages
    .map(
      (p) =>
        `- URL: ${p.url}\n  Title: ${p.title || "Unknown"}\n  Days since update: ${p.daysSinceUpdate ?? "Unknown"}\n  Category: ${p.category}\n  Cited by AI: ${p.isCitedByAi ? `Yes (${p.citedByModels.join(", ")})` : "No"}\n  At risk: ${p.citationAtRisk}`
    )
    .join("\n\n");

  const result = await callSonnet(
    `You are an AI SEO content strategist. These pages are going stale and may lose their AI citations:\n\n${pageDescriptions}\n\nFor each page, write a brief 2-3 sentence refresh recommendation explaining WHAT to update and WHY. Focus on maintaining/improving AI citation likelihood.\n\nReturn JSON array:\n[\n  { "url": "page url", "brief": "specific refresh recommendation" }\n]`,
    { maxTokens: 2048 }
  );

  return parseClaudeJson<Array<{ url: string; brief: string }>>(result.text);
}
