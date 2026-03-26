// =============================================================================
// Technical GEO — Schema SSR Verification
// Checks whether a site's JSON-LD schema markup is server-side rendered
// (visible to AI crawlers) or only rendered via JavaScript (invisible).
// AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do NOT execute JavaScript.
// =============================================================================

import { withRetry } from "@/lib/utils/retry";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface SchemaSSRResult {
  pageUrl: string;
  schemasInStaticHtml: string[];
  schemasOnlyInJs: string[];
  allSchemasFound: string[];
  serverSideRendered: boolean;
  score: number;
  issues: string[];
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

// Minimal user agent that signals no JS execution capability
const STATIC_USER_AGENT =
  "Mozilla/5.0 (compatible; MentionLayer-SSR-Check/1.0; no-js)";

const FETCH_TIMEOUT_MS = 15_000;

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function checkSchemaSSR(
  websiteUrl: string
): Promise<SchemaSSRResult> {
  const baseUrl = websiteUrl.replace(/\/+$/, "");

  // Fetch the page as a static HTML request (no JS execution)
  let staticHtml: string;
  try {
    const response = await withRetry(
      () =>
        fetch(baseUrl, {
          headers: {
            "User-Agent": STATIC_USER_AGENT,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          redirect: "follow",
        }),
      { maxRetries: 2, baseDelayMs: 1000 }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    staticHtml = await response.text();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch page";
    return {
      pageUrl: baseUrl,
      schemasInStaticHtml: [],
      schemasOnlyInJs: [],
      allSchemasFound: [],
      serverSideRendered: false,
      score: 0,
      issues: [`Could not fetch page: ${message}`],
    };
  }

  // Extract JSON-LD from static HTML
  const staticSchemas = extractJsonLdTypes(staticHtml);

  // Detect if the page is an SPA that defers rendering
  const isSpaShell = detectSpaShell(staticHtml);

  const issues: string[] = [];

  if (isSpaShell && staticSchemas.length === 0) {
    issues.push(
      "Page appears to be a JavaScript SPA — AI crawlers will see an empty shell with no schema markup"
    );
  }

  // Check for schema in __NEXT_DATA__ or similar SSR payloads
  const ssrDataSchemas = extractSsrDataSchemas(staticHtml);

  // Combine: schemas visible in static HTML
  const allStatic = Array.from(new Set([...staticSchemas, ...ssrDataSchemas]));

  // We can't execute JS to get the full rendered schemas, but we can
  // check for signs that schema might be dynamically injected
  const dynamicSchemaHints = detectDynamicSchemaInjection(staticHtml);

  // Build the result
  const schemasOnlyInJs: string[] = [];
  if (dynamicSchemaHints.length > 0 && allStatic.length === 0) {
    // JS code references schema types but none are in static HTML
    schemasOnlyInJs.push(...dynamicSchemaHints);
    issues.push(
      `Schema types [${dynamicSchemaHints.join(", ")}] appear to be injected via JavaScript and are invisible to AI crawlers`
    );
  }

  // Specific checks
  if (allStatic.length === 0 && schemasOnlyInJs.length === 0) {
    issues.push("No JSON-LD schema markup found on the page");
  }

  if (
    allStatic.length > 0 &&
    !allStatic.includes("Organization") &&
    !allStatic.includes("LocalBusiness")
  ) {
    issues.push(
      "Missing Organization or LocalBusiness schema — this is critical for AI entity recognition"
    );
  }

  // Score calculation
  let score: number;
  if (allStatic.length === 0 && schemasOnlyInJs.length === 0) {
    score = 0;
  } else if (allStatic.length === 0 && schemasOnlyInJs.length > 0) {
    score = 10; // Schema exists but invisible to AI
  } else if (schemasOnlyInJs.length > 0) {
    // Some schemas in static, some only in JS
    score = Math.round(
      (allStatic.length / (allStatic.length + schemasOnlyInJs.length)) * 100
    );
  } else {
    // All schemas are server-side rendered
    score = 100;
  }

  return {
    pageUrl: baseUrl,
    schemasInStaticHtml: allStatic,
    schemasOnlyInJs,
    allSchemasFound: Array.from(new Set([...allStatic, ...schemasOnlyInJs])),
    serverSideRendered: allStatic.length > 0 && schemasOnlyInJs.length === 0,
    score,
    issues,
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Extracts @type values from JSON-LD script blocks in HTML.
 */
function extractJsonLdTypes(html: string): string[] {
  const types = new Set<string>();
  const regex =
    /<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const content = match[1].trim();
    if (!content) continue;

    try {
      const parsed = JSON.parse(content);
      collectTypes(parsed, types);
    } catch {
      // Malformed JSON-LD — skip
    }
  }

  return Array.from(types);
}

function collectTypes(obj: unknown, types: Set<string>): void {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectTypes(item, types);
    }
    return;
  }

  if (obj && typeof obj === "object") {
    const record = obj as Record<string, unknown>;

    if (Array.isArray(record["@graph"])) {
      collectTypes(record["@graph"], types);
    }

    if (typeof record["@type"] === "string") {
      types.add(record["@type"]);
    } else if (Array.isArray(record["@type"])) {
      for (const t of record["@type"]) {
        if (typeof t === "string") types.add(t);
      }
    }

    // Recurse into nested objects
    for (const value of Object.values(record)) {
      if (value && typeof value === "object" && value !== record) {
        collectTypes(value, types);
      }
    }
  }
}

/**
 * Detects if the page is a Single Page Application shell (empty body with JS bundles).
 */
function detectSpaShell(html: string): boolean {
  // Check for common SPA indicators
  const spaPatterns = [
    /<div\s+id\s*=\s*["'](?:root|app|__next|__nuxt)["']\s*><\/div>/i,
    /<div\s+id\s*=\s*["'](?:root|app|__next|__nuxt)["']\s*>\s*<\/div>/i,
  ];

  const isSpa = spaPatterns.some((p) => p.test(html));

  // Also check if body content is suspiciously small relative to scripts
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const bodyContent = bodyMatch[1]
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (bodyContent.length < 100 && html.includes("<script")) {
      return true;
    }
  }

  return isSpa;
}

/**
 * Extracts schema types from __NEXT_DATA__ or similar SSR hydration payloads.
 * These are still server-side rendered and visible to crawlers.
 */
function extractSsrDataSchemas(html: string): string[] {
  const types: string[] = [];

  // Check __NEXT_DATA__ script
  const nextDataMatch = html.match(
    /<script\s+id\s*=\s*["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1]);
      // Look for schema-related data in the props
      const jsonStr = JSON.stringify(data);
      const schemaTypes = jsonStr.match(/"@type"\s*:\s*"([^"]+)"/g);
      if (schemaTypes) {
        for (const st of schemaTypes) {
          const typeMatch = st.match(/"@type"\s*:\s*"([^"]+)"/);
          if (typeMatch) types.push(typeMatch[1]);
        }
      }
    } catch {
      // Not valid JSON
    }
  }

  return Array.from(new Set(types));
}

/**
 * Detects hints that schema markup is being injected via JavaScript
 * (webpack bundles, inline scripts referencing schema types).
 */
function detectDynamicSchemaInjection(html: string): string[] {
  const types = new Set<string>();

  // Look for schema type references in inline scripts (not JSON-LD blocks)
  const inlineScripts = html.match(
    /<script(?!\s+type\s*=\s*["']application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi
  );

  if (inlineScripts) {
    const schemaTypePattern =
      /["']@type["']\s*:\s*["'](Organization|LocalBusiness|WebSite|FAQPage|HowTo|Product|Article|BreadcrumbList|ItemList)["']/gi;

    for (const script of inlineScripts) {
      let match: RegExpExecArray | null;
      while ((match = schemaTypePattern.exec(script)) !== null) {
        types.add(match[1]);
      }
    }
  }

  return Array.from(types);
}
