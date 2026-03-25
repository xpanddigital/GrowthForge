// =============================================================================
// Technical GEO — robots.txt AI Crawler Auditor
// Fetches a site's robots.txt and checks whether critical AI crawlers are
// allowed. Generates an optimized robots.txt recommendation via Claude Sonnet.
// =============================================================================

import { AI_CRAWLERS } from "@/lib/entity/platform-config";
import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import { withRetry } from "@/lib/utils/retry";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CrawlerCheckResult {
  name: string;
  userAgent: string;
  company: string;
  criticality: "critical" | "non_critical";
  allowed: boolean;
  rule: string | null;
}

export interface RobotsAuditResult {
  rawContent: string | null;
  found: boolean;
  crawlerResults: CrawlerCheckResult[];
  score: number;
  blanketBlock: boolean;
  optimizedRobotsTxt: string | null;
  recommendations: Array<{
    action: string;
    impact: "high" | "medium" | "low";
    effort: "high" | "medium" | "low";
  }>;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const FETCH_USER_AGENT =
  "Mozilla/5.0 (compatible; GrowthForge/1.0; +https://growthforge.io)";

const FETCH_TIMEOUT_MS = 15_000;

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function auditRobotsTxt(
  websiteUrl: string
): Promise<RobotsAuditResult> {
  const baseUrl = websiteUrl.replace(/\/+$/, "");
  const robotsUrl = `${baseUrl}/robots.txt`;

  // Fetch robots.txt
  let rawContent: string | null = null;
  let found = false;

  try {
    const response = await withRetry(
      () =>
        fetch(robotsUrl, {
          headers: { "User-Agent": FETCH_USER_AGENT },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        }),
      { maxRetries: 2, baseDelayMs: 1000 }
    );

    if (response.ok) {
      rawContent = await response.text();
      found = true;
    }
  } catch {
    // robots.txt not accessible — treat as not found
  }

  if (!found || !rawContent) {
    // No robots.txt = all crawlers allowed by default
    const crawlerResults: CrawlerCheckResult[] = AI_CRAWLERS.map((c) => ({
      name: c.name,
      userAgent: c.userAgent,
      company: c.company,
      criticality: c.criticality,
      allowed: true,
      rule: null,
    }));

    return {
      rawContent: null,
      found: false,
      crawlerResults,
      score: 100,
      blanketBlock: false,
      optimizedRobotsTxt: null,
      recommendations: [
        {
          action:
            "Consider creating a robots.txt file with explicit AI crawler rules for better control",
          impact: "low",
          effort: "low",
        },
      ],
    };
  }

  // Parse robots.txt
  const lines = rawContent.split("\n").map((l) => l.trim());
  const blocks = parseRobotsTxt(lines);

  // Check for blanket block
  const wildcardBlock = blocks.get("*");
  const blanketBlock = wildcardBlock
    ? wildcardBlock.some((rule) => rule === "/")
    : false;

  // Check each AI crawler
  const crawlerResults: CrawlerCheckResult[] = AI_CRAWLERS.map((crawler) => {
    const crawlerRules = blocks.get(crawler.userAgent.toLowerCase());

    if (crawlerRules) {
      const isBlocked = crawlerRules.some((rule) => rule === "/");
      return {
        name: crawler.name,
        userAgent: crawler.userAgent,
        company: crawler.company,
        criticality: crawler.criticality,
        allowed: !isBlocked,
        rule: isBlocked
          ? `User-agent: ${crawler.userAgent} / Disallow: /`
          : null,
      };
    }

    if (blanketBlock) {
      return {
        name: crawler.name,
        userAgent: crawler.userAgent,
        company: crawler.company,
        criticality: crawler.criticality,
        allowed: false,
        rule: "User-agent: * / Disallow: /",
      };
    }

    return {
      name: crawler.name,
      userAgent: crawler.userAgent,
      company: crawler.company,
      criticality: crawler.criticality,
      allowed: true,
      rule: null,
    };
  });

  // Score: 100 base, -20 per blocked critical, -5 per blocked non-critical
  let score = 100;
  for (const result of crawlerResults) {
    if (!result.allowed) {
      score -= result.criticality === "critical" ? 20 : 5;
    }
  }
  score = Math.max(0, score);

  // Generate recommendations + optimized robots.txt if there are issues
  let optimizedRobotsTxt: string | null = null;
  const recommendations: RobotsAuditResult["recommendations"] = [];

  const blockedCritical = crawlerResults.filter(
    (r) => !r.allowed && r.criticality === "critical"
  );
  const blockedNonCritical = crawlerResults.filter(
    (r) => !r.allowed && r.criticality === "non_critical"
  );

  if (blockedCritical.length > 0 || blanketBlock) {
    // Generate optimized robots.txt via Claude
    try {
      const aiResult = await callSonnet(
        `You are an AI SEO technical specialist. A website has the following robots.txt:\n\n${rawContent}\n\nThe following critical AI crawlers are currently BLOCKED:\n${blockedCritical.map((c) => `- ${c.name} (${c.userAgent}) by ${c.company}`).join("\n")}\n\n${blockedNonCritical.length > 0 ? `These non-critical AI crawlers are also blocked:\n${blockedNonCritical.map((c) => `- ${c.name} (${c.userAgent}) by ${c.company}`).join("\n")}` : ""}\n\nGenerate:\n1. An optimized robots.txt that allows all AI crawlers while preserving any non-AI-related rules (e.g., blocking /admin/, /api/ paths)\n2. 2-4 specific recommendations\n\nReturn JSON:\n{\n  "optimized_robots_txt": "the full optimized robots.txt content",\n  "recommendations": [\n    { "action": "specific action", "impact": "high|medium|low", "effort": "high|medium|low" }\n  ]\n}`,
        { maxTokens: 2048 }
      );

      const parsed = parseClaudeJson<{
        optimized_robots_txt: string;
        recommendations: Array<{
          action: string;
          impact: "high" | "medium" | "low";
          effort: "high" | "medium" | "low";
        }>;
      }>(aiResult.text);

      optimizedRobotsTxt = parsed.optimized_robots_txt;
      recommendations.push(...parsed.recommendations);
    } catch {
      // AI generation failed — provide static recommendations
      if (blanketBlock) {
        recommendations.push({
          action:
            "Remove blanket 'Disallow: /' under 'User-agent: *' — this blocks ALL AI crawlers from indexing your content",
          impact: "high",
          effort: "low",
        });
      }
      for (const c of blockedCritical) {
        recommendations.push({
          action: `Unblock ${c.name} (${c.userAgent}) — this ${c.company} crawler feeds AI models that cite content`,
          impact: "high",
          effort: "low",
        });
      }
    }
  }

  return {
    rawContent,
    found,
    crawlerResults,
    score,
    blanketBlock,
    optimizedRobotsTxt,
    recommendations,
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Parses robots.txt lines into a map of lowercased user-agent → disallow paths.
 */
function parseRobotsTxt(lines: string[]): Map<string, string[]> {
  const blocks = new Map<string, string[]>();
  let currentAgents: string[] = [];

  for (const line of lines) {
    const stripped = line.replace(/#.*$/, "").trim();
    if (!stripped) {
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
