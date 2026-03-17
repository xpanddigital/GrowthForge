// =============================================================================
// Entity Sync — Schema Auditor Agent (Step 5)
// Audits schema markup, robots.txt, and llms.txt for AI visibility readiness.
// =============================================================================

import type {
  EntitySchemaAuditorAgent,
  EntitySchemaAuditResult,
} from "../interfaces";
import {
  AI_CRAWLERS,
  getExpectedSchemas,
  type Vertical,
} from "@/lib/entity/platform-config";
import { withRetry } from "@/lib/utils/retry";

// -----------------------------------------------------------------------------
// Types (internal)
// -----------------------------------------------------------------------------

interface SchemaPageResult {
  pageUrl: string;
  pageType: string;
  schemasFound: Array<{ type: string; valid: boolean; errors: string[] }>;
  schemasMissing: string[];
  schemaScore: number;
  rawJsonld: unknown[];
  rawMicrodata: unknown[];
  rawRdfa: unknown[];
  sameasValidation: {
    urlsInSchema: string[];
    expectedFromProfiles: string[];
    missing: string[];
    score: number;
  } | null;
}

interface RobotsResult {
  pageUrl: string;
  crawlerAccess: Record<string, { allowed: boolean; rule: string | null }>;
  robotsScore: number;
  blanketBlock: boolean;
}

interface LlmsTxtResult {
  pageUrl: string;
  exists: boolean;
  content: string | null;
  score: number;
  issues: string[];
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const FETCH_USER_AGENT =
  "Mozilla/5.0 (compatible; GrowthForge/1.0; +https://growthforge.io)";

const FETCH_TIMEOUT_MS = 15_000;

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

export class SchemaAuditorAgent implements EntitySchemaAuditorAgent {
  name = "SchemaAuditorAgent";

  async audit(
    websiteUrl: string,
    vertical: string | null,
    claimedProfileUrls: string[]
  ): Promise<EntitySchemaAuditResult> {
    // Normalize the base URL (strip trailing slash)
    const baseUrl = websiteUrl.replace(/\/+$/, "");

    // Run all three audits in parallel, each wrapped in try/catch
    const [schemaResults, robotsResult, llmsTxtResult] = await Promise.all([
      this.auditSchemaMarkup(baseUrl, vertical, claimedProfileUrls).catch(
        () => []
      ),
      this.auditRobotsTxt(baseUrl).catch(() => null),
      this.auditLlmsTxt(baseUrl).catch(() => null),
    ]);

    return { schemaResults, robotsResult, llmsTxtResult };
  }

  // ---------------------------------------------------------------------------
  // Schema Markup Audit
  // ---------------------------------------------------------------------------

  private async auditSchemaMarkup(
    baseUrl: string,
    vertical: string | null,
    claimedProfileUrls: string[]
  ): Promise<SchemaPageResult[]> {
    const html = await withRetry(
      () => this.fetchPage(baseUrl),
      { maxRetries: 2, baseDelayMs: 1000 }
    );

    // Extract JSON-LD blocks from HTML
    const jsonldBlocks = this.extractJsonLd(html);

    // Identify all @type values found across JSON-LD blocks
    const foundTypes = new Map<string, { valid: boolean; errors: string[] }>();
    const rawJsonld: unknown[] = [];

    for (const block of jsonldBlocks) {
      try {
        const parsed = JSON.parse(block);
        rawJsonld.push(parsed);
        this.extractTypes(parsed, foundTypes);
      } catch {
        // Malformed JSON-LD — record it but continue
        rawJsonld.push({ _raw: block, _parseError: true });
      }
    }

    // Determine expected schemas for the homepage
    const castVertical = vertical as Vertical | null;
    const expectedSchemas = getExpectedSchemas("homepage", castVertical);

    // Calculate which schemas are found vs missing
    const schemasFound: Array<{ type: string; valid: boolean; errors: string[] }> = [];
    const schemasMissing: string[] = [];

    for (const expected of expectedSchemas) {
      const match = foundTypes.get(expected);
      if (match) {
        schemasFound.push({ type: expected, valid: match.valid, errors: match.errors });
      } else {
        schemasMissing.push(expected);
      }
    }

    // Also include any schemas found that weren't expected (bonus)
    for (const [type, info] of Array.from(foundTypes)) {
      if (!expectedSchemas.includes(type)) {
        schemasFound.push({ type, valid: info.valid, errors: info.errors });
      }
    }

    // Schema score: (found expected / total expected) * 100
    const expectedCount = expectedSchemas.length;
    const foundExpectedCount = expectedSchemas.filter((s) =>
      foundTypes.has(s)
    ).length;
    const schemaScore =
      expectedCount > 0
        ? Math.round((foundExpectedCount / expectedCount) * 100)
        : 100;

    // sameAs validation — look for Organization schema's sameAs property
    const sameasValidation = this.validateSameAs(
      rawJsonld,
      claimedProfileUrls
    );

    return [
      {
        pageUrl: baseUrl,
        pageType: "homepage",
        schemasFound,
        schemasMissing,
        schemaScore,
        rawJsonld,
        rawMicrodata: [], // Microdata parsing not implemented yet
        rawRdfa: [], // RDFa parsing not implemented yet
        sameasValidation,
      },
    ];
  }

  /**
   * Extracts JSON-LD script contents from HTML.
   */
  private extractJsonLd(html: string): string[] {
    const blocks: string[] = [];
    const regex =
      /<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      const content = match[1].trim();
      if (content) {
        blocks.push(content);
      }
    }

    return blocks;
  }

  /**
   * Recursively extracts @type values from a JSON-LD object or array.
   * Handles @graph arrays and nested types.
   */
  private extractTypes(
    obj: unknown,
    types: Map<string, { valid: boolean; errors: string[] }>
  ): void {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        this.extractTypes(item, types);
      }
      return;
    }

    if (obj && typeof obj === "object") {
      const record = obj as Record<string, unknown>;

      // Handle @graph property
      if (Array.isArray(record["@graph"])) {
        this.extractTypes(record["@graph"], types);
      }

      // Handle @type
      if (record["@type"]) {
        const typeValue = record["@type"];
        const typeNames = Array.isArray(typeValue) ? typeValue : [typeValue];

        for (const typeName of typeNames) {
          if (typeof typeName === "string") {
            // Basic validation: check that the block has at least @context and @type
            const errors: string[] = [];
            if (!record["@context"]) {
              // Only flag missing @context at the root level — nested objects
              // within @graph inherit context from the parent.
              // Still valid if it's inside a @graph container.
            }
            if (typeName === "Organization" && !record["name"]) {
              errors.push("Organization schema missing 'name' property");
            }
            if (typeName === "WebSite" && !record["url"]) {
              errors.push("WebSite schema missing 'url' property");
            }
            if (typeName === "LocalBusiness" && !record["address"]) {
              errors.push("LocalBusiness schema missing 'address' property");
            }

            types.set(typeName, {
              valid: errors.length === 0,
              errors,
            });
          }
        }

        // Recurse into nested objects (e.g., publisher, author)
        for (const value of Object.values(record)) {
          if (value && typeof value === "object" && value !== record) {
            this.extractTypes(value, types);
          }
        }
      }
    }
  }

  /**
   * Validates sameAs URLs in Organization schema against claimed profile URLs.
   */
  private validateSameAs(
    jsonldBlocks: unknown[],
    claimedProfileUrls: string[]
  ): SchemaPageResult["sameasValidation"] {
    if (claimedProfileUrls.length === 0) return null;

    // Find sameAs arrays across all JSON-LD blocks
    const sameAsUrls = new Set<string>();
    this.collectSameAs(jsonldBlocks, sameAsUrls);

    const urlsInSchema = Array.from(sameAsUrls);
    const normalizedSchemaUrls = urlsInSchema.map((u) =>
      this.normalizeUrl(u)
    );

    const missing: string[] = [];
    for (const profileUrl of claimedProfileUrls) {
      const normalized = this.normalizeUrl(profileUrl);
      if (!normalizedSchemaUrls.includes(normalized)) {
        missing.push(profileUrl);
      }
    }

    const totalExpected = claimedProfileUrls.length;
    const foundCount = totalExpected - missing.length;
    const score =
      totalExpected > 0 ? Math.round((foundCount / totalExpected) * 100) : 100;

    return {
      urlsInSchema,
      expectedFromProfiles: claimedProfileUrls,
      missing,
      score,
    };
  }

  /**
   * Recursively collects sameAs URLs from JSON-LD structures.
   */
  private collectSameAs(obj: unknown, urls: Set<string>): void {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        this.collectSameAs(item, urls);
      }
      return;
    }

    if (obj && typeof obj === "object") {
      const record = obj as Record<string, unknown>;

      // Check for sameAs property
      if (record["sameAs"]) {
        const sameAs = record["sameAs"];
        if (typeof sameAs === "string") {
          urls.add(sameAs);
        } else if (Array.isArray(sameAs)) {
          for (const url of sameAs) {
            if (typeof url === "string") {
              urls.add(url);
            }
          }
        }
      }

      // Recurse into @graph and nested objects
      if (Array.isArray(record["@graph"])) {
        this.collectSameAs(record["@graph"], urls);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Robots.txt Audit
  // ---------------------------------------------------------------------------

  private async auditRobotsTxt(baseUrl: string): Promise<RobotsResult> {
    const robotsUrl = `${baseUrl}/robots.txt`;

    const content = await withRetry(
      () => this.fetchPage(robotsUrl),
      { maxRetries: 2, baseDelayMs: 1000 }
    );

    const lines = content.split("\n").map((l) => l.trim());

    // Parse robots.txt into user-agent blocks
    const blocks = this.parseRobotsTxt(lines);

    // Check for blanket block (User-agent: * with Disallow: /)
    const wildcardBlock = blocks.get("*");
    const blanketBlock = wildcardBlock
      ? wildcardBlock.some((rule) => rule === "/")
      : false;

    // For each AI crawler, determine if it's blocked
    const crawlerAccess: Record<
      string,
      { allowed: boolean; rule: string | null }
    > = {};

    for (const crawler of AI_CRAWLERS) {
      const crawlerRules = blocks.get(crawler.userAgent.toLowerCase());

      if (crawlerRules) {
        // Crawler has a specific block — check if Disallow: / is present
        const isBlocked = crawlerRules.some((rule) => rule === "/");
        crawlerAccess[crawler.name] = {
          allowed: !isBlocked,
          rule: isBlocked
            ? `User-agent: ${crawler.userAgent} / Disallow: /`
            : null,
        };
      } else if (blanketBlock) {
        // No specific block, but wildcard blocks everything
        crawlerAccess[crawler.name] = {
          allowed: false,
          rule: "User-agent: * / Disallow: /",
        };
      } else {
        // Not blocked
        crawlerAccess[crawler.name] = {
          allowed: true,
          rule: null,
        };
      }
    }

    // Calculate robots score
    // Start at 100, -20 per blocked critical crawler, -5 per blocked non-critical
    let robotsScore = 100;
    for (const crawler of AI_CRAWLERS) {
      const access = crawlerAccess[crawler.name];
      if (access && !access.allowed) {
        if (crawler.criticality === "critical") {
          robotsScore -= 20;
        } else {
          robotsScore -= 5;
        }
      }
    }
    robotsScore = Math.max(0, robotsScore);

    return {
      pageUrl: robotsUrl,
      crawlerAccess,
      robotsScore,
      blanketBlock,
    };
  }

  /**
   * Parses robots.txt lines into a map of user-agent → disallow rules.
   * Keys are lowercased user-agent names.
   */
  private parseRobotsTxt(
    lines: string[]
  ): Map<string, string[]> {
    const blocks = new Map<string, string[]>();
    let currentAgents: string[] = [];

    for (const line of lines) {
      // Skip comments and empty lines
      const stripped = line.replace(/#.*$/, "").trim();
      if (!stripped) {
        // Empty line resets current agents
        currentAgents = [];
        continue;
      }

      const colonIdx = stripped.indexOf(":");
      if (colonIdx === -1) continue;

      const directive = stripped.substring(0, colonIdx).trim().toLowerCase();
      const value = stripped.substring(colonIdx + 1).trim();

      if (directive === "user-agent") {
        const agent = value.toLowerCase();
        currentAgents.push(agent);
        if (!blocks.has(agent)) {
          blocks.set(agent, []);
        }
      } else if (directive === "disallow" && value) {
        // Apply this disallow rule to all current agents
        for (const agent of currentAgents) {
          const rules = blocks.get(agent);
          if (rules) {
            rules.push(value);
          }
        }
      }
    }

    return blocks;
  }

  // ---------------------------------------------------------------------------
  // llms.txt Audit
  // ---------------------------------------------------------------------------

  private async auditLlmsTxt(baseUrl: string): Promise<LlmsTxtResult> {
    const llmsUrl = `${baseUrl}/llms.txt`;

    let content: string | null = null;
    let exists = false;

    try {
      const response = await withRetry(
        () =>
          fetch(llmsUrl, {
            headers: { "User-Agent": FETCH_USER_AGENT },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          }),
        { maxRetries: 2, baseDelayMs: 1000 }
      );

      if (response.ok) {
        content = await response.text();
        exists = true;
      } else if (response.status === 404) {
        exists = false;
      } else {
        // Other error — treat as not found
        exists = false;
      }
    } catch {
      // Fetch failed entirely — treat as not found
      exists = false;
    }

    if (!exists || !content) {
      return {
        pageUrl: llmsUrl,
        exists: false,
        content: null,
        score: 0,
        issues: ["llms.txt file not found at the site root"],
      };
    }

    // Quality scoring
    let score = 0;
    const issues: string[] = [];

    // Has title (starts with #): +20
    if (/^#\s+.+/m.test(content)) {
      score += 20;
    } else {
      issues.push("Missing title heading (expected to start with # Title)");
    }

    // Length > 200 chars: +20
    if (content.length > 200) {
      score += 20;
    } else {
      issues.push(
        `Content is too short (${content.length} characters, recommended > 200)`
      );
    }

    // Contains URLs: +20
    if (/https?:\/\/\S+/.test(content)) {
      score += 20;
    } else {
      issues.push("No URLs found in llms.txt — consider linking to key pages");
    }

    // Contains markdown formatting (headers, lists, bold, etc.): +20
    if (/^[#>*\-]\s+.+/m.test(content) || /\*\*.+\*\*/.test(content)) {
      score += 20;
    } else {
      issues.push(
        "No markdown formatting detected — use headers and lists for structure"
      );
    }

    // Contains brand-relevant content (at least 2 sentences): +20
    const sentenceCount = content.split(/[.!?]+/).filter((s) => s.trim().length > 10).length;
    if (sentenceCount >= 2) {
      score += 20;
    } else {
      issues.push(
        "Content appears sparse — include substantive brand description"
      );
    }

    return {
      pageUrl: llmsUrl,
      exists: true,
      content,
      score,
      issues,
    };
  }

  // ---------------------------------------------------------------------------
  // Shared Helpers
  // ---------------------------------------------------------------------------

  /**
   * Fetches a page and returns its text content.
   * Throws on non-OK responses.
   */
  private async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: { "User-Agent": FETCH_USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      );
    }

    return response.text();
  }

  /**
   * Normalizes a URL for comparison purposes.
   * Strips protocol, www prefix, and trailing slashes.
   */
  private normalizeUrl(url: string): string {
    return url
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "");
  }
}
