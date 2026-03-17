// Entity Audit Agent — checks whether the client's brand identity is consistent
// and well-represented across key platforms that AI models reference.
//
// Data sources: Google search (brand name), Apify web scraping, client's website
// Conforms to the AuditAgent interface.

import type { AuditAgent, AuditPillarResult } from "../interfaces";
import { runActor } from "@/lib/apify/client";
import { ACTOR_IDS, type GoogleSearchResult } from "@/lib/apify/actors";
import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

interface EntityClient {
  name: string;
  website_url?: string | null;
  brand_brief: string;
}

interface PlatformDetail {
  present: boolean;
  description_match?: number;
  info_complete?: boolean;
  missing?: string[];
  url?: string;
}

// Key platforms AI models reference for entity information
const ENTITY_PLATFORMS = [
  "google_business",
  "linkedin",
  "crunchbase",
  "wikipedia",
  "g2",
  "capterra",
  "trustpilot",
  "twitter",
  "facebook",
  "instagram",
  "youtube",
  "github",
] as const;

// URL patterns to identify platform presence from SERP results
const PLATFORM_PATTERNS: Record<string, RegExp> = {
  google_business: /google\.com\/maps|business\.google/i,
  linkedin: /linkedin\.com\/company/i,
  crunchbase: /crunchbase\.com\/(organization|company)/i,
  wikipedia: /wikipedia\.org\/wiki/i,
  g2: /g2\.com\/products/i,
  capterra: /capterra\.com\/(software|reviews)/i,
  trustpilot: /trustpilot\.com\/review/i,
  twitter: /(twitter|x)\.com\//i,
  facebook: /facebook\.com\//i,
  instagram: /instagram\.com\//i,
  youtube: /youtube\.com\/(channel|c|@)/i,
  github: /github\.com\//i,
};

export class EntityCheckAgent implements AuditAgent {
  name = "EntityCheckAgent";
  pillar = "entities";

  async scan(
    client: Record<string, unknown>,
    _keywords: Array<Record<string, unknown>>
  ): Promise<AuditPillarResult> {
    const c = client as unknown as EntityClient;

    // Step 1: Search Google for brand name to discover platform presence
    const serpInput = {
      queries: `"${c.name}"`,
      maxPagesPerQuery: 2,
      resultsPerPage: 20,
      languageCode: "en",
      countryCode: "us",
      mobileResults: false,
      includeUnfilteredResults: false,
      saveHtml: false,
      saveHtmlToKeyValueStore: false,
    };

    const serpResult = await runActor<typeof serpInput, GoogleSearchResult>(
      ACTOR_IDS.GOOGLE_SEARCH_SCRAPER,
      serpInput,
      { timeoutSecs: 300, maxItems: 50 }
    );

    // Step 2: Identify which platforms the brand appears on
    const platformDetails: Record<string, PlatformDetail> = {};
    const discoveredUrls: Array<{ platform: string; url: string; title: string; snippet: string }> = [];

    for (const platform of ENTITY_PLATFORMS) {
      platformDetails[platform] = { present: false };
    }

    for (const page of serpResult.items) {
      for (const result of page.organicResults || []) {
        if (!result.url) continue;

        for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
          if (pattern.test(result.url) && !platformDetails[platform].present) {
            platformDetails[platform] = {
              present: true,
              url: result.url,
            };
            discoveredUrls.push({
              platform,
              url: result.url,
              title: result.title || "",
              snippet: result.description || "",
            });
          }
        }
      }
    }

    // Step 3: Check client's website for schema markup indicators
    const schemaPresent: string[] = [];
    const schemaMissing: string[] = [];

    // We check for schema by searching Google for schema-related queries
    const schemaTypes = ["Organization", "Product", "FAQ", "BreadcrumbList", "LocalBusiness"];
    // In production, we'd scrape the website directly; for the audit we use Claude to analyze
    // the SERP snippet + known presence to estimate schema status
    if (c.website_url) {
      // Use SERP rich results as proxy for schema markup
      for (const page of serpResult.items) {
        for (const result of page.organicResults || []) {
          if (result.url && result.url.includes(extractDomain(c.website_url))) {
            // Rich snippets suggest schema markup
            if (result.siteLinks && Array.isArray(result.siteLinks) && result.siteLinks.length > 0) {
              schemaPresent.push("Organization");
            }
          }
        }
      }
    }

    for (const schema of schemaTypes) {
      if (!schemaPresent.includes(schema)) {
        schemaMissing.push(schema);
      }
    }

    // Step 4: Use Claude to analyze consistency across discovered profiles
    let consistencyScore = 50; // Default if Claude analysis fails
    let inconsistencies: Array<{ field: string; platforms: string[]; issue: string }> = [];
    let knowledgePanelExists = false;

    if (discoveredUrls.length >= 2) {
      try {
        const analysisResult = await analyzeEntityConsistency(
          c.name,
          c.brand_brief,
          discoveredUrls
        );
        consistencyScore = analysisResult.consistency_score;
        inconsistencies = analysisResult.inconsistencies;
        knowledgePanelExists = analysisResult.knowledge_panel_exists;
      } catch {
        console.error("Entity consistency analysis failed, using defaults");
      }
    }

    // Step 5: Calculate scores
    const platformsChecked = ENTITY_PLATFORMS.length;
    const platformsPresent = Object.values(platformDetails).filter((p) => p.present).length;
    const platformsMissing = ENTITY_PLATFORMS.filter((p) => !platformDetails[p].present);

    const schemaCompleteness =
      schemaTypes.length > 0 ? schemaPresent.length / schemaTypes.length : 0;

    const score = calculateEntityScore(
      platformsPresent,
      platformsChecked,
      consistencyScore,
      schemaCompleteness,
      knowledgePanelExists
    );

    const findings = {
      platforms_checked: platformsChecked,
      platforms_present: platformsPresent,
      platforms_missing: platformsMissing,
      platform_details: platformDetails,
      consistency_score: consistencyScore,
      inconsistencies,
      schema_markup_present: schemaPresent,
      schema_markup_missing: schemaMissing,
      knowledge_panel_exists: knowledgePanelExists,
    };

    return {
      score,
      findings,
      summary: generateEntitySummary(findings, c.name, score),
      recommendations: generateEntityRecommendations(findings, c.name),
    };
  }
}

async function analyzeEntityConsistency(
  brandName: string,
  brandBrief: string,
  profiles: Array<{ platform: string; url: string; title: string; snippet: string }>
): Promise<{
  consistency_score: number;
  inconsistencies: Array<{ field: string; platforms: string[]; issue: string }>;
  knowledge_panel_exists: boolean;
}> {
  const profileDescriptions = profiles
    .map(
      (p) =>
        `Platform: ${p.platform}\nURL: ${p.url}\nTitle: ${p.title}\nSnippet: ${p.snippet}`
    )
    .join("\n\n");

  const prompt = `Analyze the consistency of brand information across these platforms for "${brandName}".

Brand Brief (ground truth):
${brandBrief}

Discovered Profiles:
${profileDescriptions}

Based on the snippets and titles, assess:
1. Are the descriptions consistent with each other and the brand brief?
2. Are there any obvious inconsistencies in naming, description, or positioning?
3. Does a Google Knowledge Panel appear to exist (indicated by structured results)?

Return JSON:
{
  "consistency_score": 0-100,
  "inconsistencies": [
    { "field": "business_description", "platforms": ["linkedin", "crunchbase"], "issue": "description mismatch" }
  ],
  "knowledge_panel_exists": true/false
}`;

  const result = await callSonnet(prompt, {
    systemPrompt:
      "You are a brand consistency auditor. Analyze the provided platform profiles and assess consistency. Be concise and factual.",
    temperature: 0.2,
  });

  return parseClaudeJson(result.text);
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function calculateEntityScore(
  platformsPresent: number,
  platformsChecked: number,
  consistencyScore: number,
  schemaCompleteness: number,
  knowledgePanelExists: boolean
): number {
  const coverageScore = platformsChecked > 0
    ? (platformsPresent / platformsChecked) * 25
    : 0;
  const consistencyComponent = consistencyScore * 0.35;
  const schemaComponent = schemaCompleteness * 20;
  const knowledgePanelBonus = knowledgePanelExists ? 20 : 0;

  return Math.round(coverageScore + consistencyComponent + schemaComponent + knowledgePanelBonus);
}

function generateEntitySummary(
  findings: Record<string, unknown>,
  brandName: string,
  score: number
): string {
  const present = findings.platforms_present as number;
  const checked = findings.platforms_checked as number;
  const consistency = findings.consistency_score as number;
  const missing = findings.platforms_missing as string[];

  return `${brandName} has presence on ${present} of ${checked} key platforms (${Math.round((present / checked) * 100)}% coverage) with a consistency score of ${consistency}/100. Score: ${score}/100. ${
    missing.length > 3
      ? `Missing from ${missing.length} platforms including ${missing.slice(0, 3).join(", ")}.`
      : missing.length > 0
        ? `Missing from: ${missing.join(", ")}.`
        : "Present on all key platforms."
  }`;
}

function generateEntityRecommendations(
  findings: Record<string, unknown>,
  brandName: string
): AuditPillarResult["recommendations"] {
  const recommendations: AuditPillarResult["recommendations"] = [];
  const missing = findings.platforms_missing as string[];
  const inconsistencies = findings.inconsistencies as Array<{
    field: string;
    platforms: string[];
    issue: string;
  }>;
  const schemaMissing = findings.schema_markup_missing as string[];
  const knowledgePanel = findings.knowledge_panel_exists as boolean;

  // High-priority platforms
  const highPriorityMissing = missing.filter((p) =>
    ["linkedin", "crunchbase", "g2", "wikipedia"].includes(p)
  );
  if (highPriorityMissing.length > 0) {
    recommendations.push({
      action: `Create ${brandName} profiles on ${highPriorityMissing.join(", ")} — these are high-authority platforms referenced by AI models`,
      impact: "high",
      effort: "medium",
    });
  }

  if (inconsistencies && inconsistencies.length > 0) {
    recommendations.push({
      action: `Fix ${inconsistencies.length} brand inconsistencies across platforms to strengthen entity signals`,
      impact: "medium",
      effort: "low",
    });
  }

  if (schemaMissing && schemaMissing.length > 0) {
    recommendations.push({
      action: `Add ${schemaMissing.join(", ")} schema markup to ${brandName}'s website to improve structured data signals`,
      impact: "medium",
      effort: "low",
    });
  }

  if (!knowledgePanel) {
    recommendations.push({
      action: `Work towards establishing a Google Knowledge Panel for ${brandName} through Wikidata, structured data, and authoritative references`,
      impact: "high",
      effort: "high",
    });
  }

  return recommendations;
}
