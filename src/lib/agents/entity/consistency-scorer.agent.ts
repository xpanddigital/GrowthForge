import type {
  EntityConsistencyScorerAgent,
  EntityProfileData,
  EntityCanonical,
  EntityConsistencyResult,
} from "../interfaces";
import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

export class ConsistencyScorerAgent implements EntityConsistencyScorerAgent {
  name = "ConsistencyScorerAgent";

  async score(
    profiles: EntityProfileData[],
    canonical: EntityCanonical
  ): Promise<EntityConsistencyResult[]> {
    // Filter to only profiles that have description or other data to compare
    const scorableProfiles = profiles.filter(
      (p) =>
        p.descriptionText ||
        p.category ||
        Object.keys(p.contactInfo).length > 0
    );

    if (scorableProfiles.length === 0) return [];

    // Batch profiles in groups of 5 for Claude
    const results: EntityConsistencyResult[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < scorableProfiles.length; i += BATCH_SIZE) {
      const batch = scorableProfiles.slice(i, i + BATCH_SIZE);
      const batchResults = await this.scoreBatch(batch, canonical);
      results.push(...batchResults);
    }

    return results;
  }

  private async scoreBatch(
    profiles: EntityProfileData[],
    canonical: EntityCanonical
  ): Promise<EntityConsistencyResult[]> {
    const systemPrompt = `You are an entity consistency auditor. Compare each platform profile against the canonical (source of truth) brand description. Score each field on a 0-100 scale.

Scoring weights:
- name: 20% — exact match required, minor variations (Inc, LLC suffixes) OK
- description: 30% — semantic match, key differentiators present, accurate representation
- category: 15% — same industry/vertical
- contact: 20% — phone, email, address match
- other: 15% — founding year, employee count, URLs, etc.

Severity levels for issues:
- critical: Wrong company name, completely wrong description (different business)
- high: Significantly outdated info, major factual errors
- medium: Missing contact info, category mismatch, partial description
- low: Formatting differences, minor text variations

Return valid JSON.`;

    const userPrompt = `## Canonical (Source of Truth)
Name: ${canonical.canonicalName}
Description: ${canonical.canonicalDescription}
Category: ${canonical.canonicalCategory}
Subcategories: ${canonical.canonicalSubcategories.join(", ") || "N/A"}
Contact: ${JSON.stringify(canonical.canonicalContact)}
URLs: ${JSON.stringify(canonical.canonicalUrls)}
Founding Year: ${canonical.canonicalFoundingYear ?? "N/A"}
Founder: ${canonical.canonicalFounderName ?? "N/A"}
Employee Count: ${canonical.canonicalEmployeeCount ?? "N/A"}
Service Areas: ${canonical.canonicalServiceAreas.join(", ") || "N/A"}
Tagline: ${canonical.canonicalTagline ?? "N/A"}

## Profiles to Score
${profiles
  .map(
    (p, idx) => `
### Profile ${idx + 1}: ${p.platform}
Description: ${p.descriptionText || "(none found)"}
Category: ${p.category || "(none found)"}
Contact: ${JSON.stringify(p.contactInfo)}
URL: ${p.platformProfileUrl || "(none)"}
Claimed: ${p.isClaimed === null ? "unknown" : p.isClaimed ? "yes" : "no"}
Additional Fields: ${Object.keys(p.additionalFields).length > 0 ? JSON.stringify(p.additionalFields) : "(none)"}
`
  )
  .join("\n")}

Score each profile. Return a JSON array with one object per profile:
[{
  "platform": "platform_key",
  "consistencyScore": 0-100,
  "consistencyDetails": {
    "nameMatch": 0-100,
    "descriptionMatch": 0-100,
    "categoryMatch": 0-100,
    "contactMatch": 0-100,
    "otherMatch": 0-100
  },
  "issues": [{
    "field": "description|name|category|contact|other",
    "severity": "critical|high|medium|low",
    "expected": "what canonical says",
    "found": "what platform shows",
    "suggestion": "specific fix"
  }]
}]`;

    const result = await callSonnet(userPrompt, {
      systemPrompt,
      maxTokens: 4096,
      temperature: 0,
    });

    const parsed = parseClaudeJson<EntityConsistencyResult[]>(result.text);

    // Validate and normalize the parsed results
    return parsed.map((item) => ({
      platform: item.platform,
      consistencyScore: clampScore(item.consistencyScore),
      consistencyDetails: {
        nameMatch: clampScore(item.consistencyDetails.nameMatch),
        descriptionMatch: clampScore(item.consistencyDetails.descriptionMatch),
        categoryMatch: clampScore(item.consistencyDetails.categoryMatch),
        contactMatch: clampScore(item.consistencyDetails.contactMatch),
        otherMatch: clampScore(item.consistencyDetails.otherMatch),
      },
      issues: item.issues.map((issue) => ({
        field: issue.field,
        severity: validateSeverity(issue.severity),
        expected: issue.expected,
        found: issue.found,
        suggestion: issue.suggestion,
      })),
    }));
  }
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function validateSeverity(
  severity: string
): "critical" | "high" | "medium" | "low" {
  const valid = ["critical", "high", "medium", "low"] as const;
  if (valid.includes(severity as (typeof valid)[number])) {
    return severity as (typeof valid)[number];
  }
  return "medium";
}
