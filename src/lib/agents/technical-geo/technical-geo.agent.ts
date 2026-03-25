// =============================================================================
// Technical GEO Agent
// Orchestrates all 4 Technical GEO sub-scans: robots.txt audit, content
// freshness tracking, citability scoring, and schema SSR verification.
// =============================================================================

import type {
  TechnicalGeoAgent,
  TechnicalGeoScanResult,
} from "../interfaces";
import { auditRobotsTxt } from "@/lib/technical-geo/robots-auditor";
import { scanContentFreshness } from "@/lib/technical-geo/freshness-tracker";
import { scoreContentCitability } from "@/lib/technical-geo/citability-scorer";
import { checkSchemaSSR } from "@/lib/technical-geo/schema-ssr-checker";

// Weights for composite score
const WEIGHTS = {
  robots: 0.2,
  freshness: 0.3,
  citability: 0.3,
  schemaSSR: 0.2,
};

export class TechnicalGeoScanAgent implements TechnicalGeoAgent {
  name = "TechnicalGeoScanAgent";

  async scan(
    websiteUrl: string,
    scanType:
      | "full"
      | "robots_only"
      | "freshness_only"
      | "citability_only"
      | "schema_ssr_only",
    aiCitations?: Record<string, string[]>
  ): Promise<TechnicalGeoScanResult> {
    const runRobots =
      scanType === "full" || scanType === "robots_only";
    const runFreshness =
      scanType === "full" || scanType === "freshness_only";
    const runCitability =
      scanType === "full" || scanType === "citability_only";
    const runSchemaSSR =
      scanType === "full" || scanType === "schema_ssr_only";

    // Run applicable sub-scans in parallel
    const [robotsResult, freshnessResult, schemaSSRResult] =
      await Promise.all([
        runRobots
          ? auditRobotsTxt(websiteUrl).catch(() => null)
          : Promise.resolve(null),
        runFreshness
          ? scanContentFreshness(websiteUrl, aiCitations).catch(() => null)
          : Promise.resolve(null),
        runSchemaSSR
          ? checkSchemaSSR(websiteUrl).catch(() => null)
          : Promise.resolve(null),
      ]);

    // Citability scoring runs on the homepage (can extend to more pages)
    let citabilityResult = null;
    if (runCitability) {
      try {
        citabilityResult = await scoreContentCitability(websiteUrl);
      } catch {
        // Citability scan failed
      }
    }

    // Calculate composite score
    const scores: Array<{ score: number; weight: number }> = [];
    if (robotsResult) {
      scores.push({ score: robotsResult.score, weight: WEIGHTS.robots });
    }
    if (freshnessResult) {
      scores.push({
        score: freshnessResult.overallScore,
        weight: WEIGHTS.freshness,
      });
    }
    if (citabilityResult) {
      scores.push({
        score: citabilityResult.compositeScore,
        weight: WEIGHTS.citability,
      });
    }
    if (schemaSSRResult) {
      scores.push({
        score: schemaSSRResult.score,
        weight: WEIGHTS.schemaSSR,
      });
    }

    let compositeScore = 0;
    if (scores.length > 0) {
      const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
      compositeScore = Math.round(
        scores.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight
      );
    }

    // Aggregate recommendations
    const recommendations: TechnicalGeoScanResult["recommendations"] = [];

    if (robotsResult) {
      for (const rec of robotsResult.recommendations) {
        recommendations.push({ ...rec, module: "technical_geo" });
      }
    }

    if (freshnessResult) {
      const atRisk = freshnessResult.pages.filter((p) => p.citationAtRisk);
      if (atRisk.length > 0) {
        recommendations.push({
          action: `${atRisk.length} page(s) currently cited by AI models are going stale — update content immediately to maintain citations`,
          impact: "high",
          effort: "medium",
          module: "technical_geo",
        });
      }

      const expired = freshnessResult.summary.expired;
      if (expired > 0) {
        recommendations.push({
          action: `${expired} page(s) have not been updated in 90+ days — refresh with current data and statistics`,
          impact: "medium",
          effort: "medium",
          module: "technical_geo",
        });
      }
    }

    if (citabilityResult && citabilityResult.compositeScore < 60) {
      const lowDims = citabilityResult.dimensions.filter(
        (d) => d.score < 50
      );
      for (const dim of lowDims.slice(0, 3)) {
        recommendations.push({
          action: `Improve ${dim.name}: ${dim.details}`,
          impact: dim.weight >= 0.15 ? "high" : "medium",
          effort: "medium",
          module: "technical_geo",
        });
      }
    }

    if (schemaSSRResult) {
      for (const issue of schemaSSRResult.issues) {
        recommendations.push({
          action: issue,
          impact: "high",
          effort: schemaSSRResult.schemasOnlyInJs.length > 0 ? "high" : "low",
          module: "entity_sync",
        });
      }
    }

    // Sort recommendations by impact
    const impactOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort(
      (a, b) => impactOrder[a.impact] - impactOrder[b.impact]
    );

    return {
      robotsResult,
      freshnessResult,
      citabilityResult,
      schemaSSRResult,
      compositeScore,
      recommendations: recommendations.slice(0, 10),
    };
  }
}
