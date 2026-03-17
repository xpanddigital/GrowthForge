// AI Presence Audit Agent — tests whether AI models mention the client's brand
// when asked buying-intent questions about their category.
//
// Data sources: ChatGPT API, Perplexity API, Gemini API, Claude API
// Conforms to the AuditAgent interface.

import type { AuditAgent, AuditPillarResult, MonitorTestInput } from "../interfaces";
import { agents } from "../registry";

interface AIPresenceClient {
  name: string;
  brand_brief: string;
  website_url?: string | null;
  urls_to_mention?: string[];
  key_differentiators?: string | null;
}

interface AIPresenceKeyword {
  keyword: string;
}

interface ModelShareResult {
  mentioned: number;
  recommended: number;
  linked: number;
  total: number;
  percentage: number;
}

interface SampleMention {
  model: string;
  prompt: string;
  mention_context: string | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  sources_cited: string[];
}

const BUYING_INTENT_TEMPLATES = [
  "What are the best {keyword} services?",
  "Can you recommend a {keyword} provider?",
  "I need help with {keyword} — what are my options?",
  "Compare the top {keyword} companies",
  "What {keyword} do you recommend for small businesses?",
];

// Models to test against
const TEST_MODELS = ["chatgpt", "perplexity", "gemini", "claude"] as const;

export class AIPresenceAgent implements AuditAgent {
  name = "AIPresenceAgent";
  pillar = "ai_presence";

  async scan(
    client: Record<string, unknown>,
    keywords: Array<Record<string, unknown>>
  ): Promise<AuditPillarResult> {
    const c = client as unknown as AIPresenceClient;
    const kws = keywords as unknown as AIPresenceKeyword[];

    // Generate buying-intent prompts from top 10 keywords
    const topKeywords = kws.slice(0, 10);
    const prompts = generateBuyingIntentPrompts(topKeywords);

    // Extract competitor names from brand brief
    const competitors = extractCompetitors(c.brand_brief);

    // Build test input
    const baseInput: Omit<MonitorTestInput, "promptText"> = {
      clientName: c.name,
      clientUrls: c.urls_to_mention || (c.website_url ? [c.website_url] : []),
      competitors: competitors.map((name) => ({
        name,
        aliases: [],
      })),
    };

    // Run tests across all models and prompts
    const shareByModel: Record<string, ModelShareResult> = {};
    const competitorShareMap: Record<string, { mentioned: number; total: number; percentage: number }> = {};
    const sampleMentions: SampleMention[] = [];

    let totalTests = 0;
    let brandMentionedCount = 0;
    let brandRecommendedCount = 0;
    let brandLinkedCount = 0;

    // Initialize model results
    for (const model of TEST_MODELS) {
      shareByModel[model] = {
        mentioned: 0,
        recommended: 0,
        linked: 0,
        total: 0,
        percentage: 0,
      };
    }

    // Initialize competitor tracking
    for (const comp of competitors) {
      competitorShareMap[comp] = { mentioned: 0, total: 0, percentage: 0 };
    }

    // Run tests — process each model sequentially, prompts within each model sequentially
    // to respect rate limits
    for (const model of TEST_MODELS) {
      const agent = agents.monitor[model];
      if (!agent) continue;

      for (const prompt of prompts) {
        totalTests++;
        shareByModel[model].total++;

        for (const comp of competitors) {
          competitorShareMap[comp].total++;
        }

        try {
          const result = await agent.test({
            ...baseInput,
            promptText: prompt,
          });

          if (result.brandMentioned) {
            brandMentionedCount++;
            shareByModel[model].mentioned++;
          }
          if (result.brandRecommended) {
            brandRecommendedCount++;
            shareByModel[model].recommended++;
          }
          if (result.brandLinked) {
            brandLinkedCount++;
            shareByModel[model].linked++;
          }

          // Track competitor mentions
          for (const compDetail of result.competitorDetails) {
            if (compDetail.mentioned && competitorShareMap[compDetail.name]) {
              competitorShareMap[compDetail.name].mentioned++;
            }
          }

          // Capture sample mentions
          if (result.brandMentioned && sampleMentions.length < 5) {
            sampleMentions.push({
              model,
              prompt,
              mention_context: result.mentionContext,
              sentiment: result.sentiment,
              sources_cited: result.sourcesCited,
            });
          }
        } catch {
          // Log failure but continue with other tests
          console.error(`AI Presence test failed for ${model}: ${prompt}`);
        }
      }

      // Update model percentage
      if (shareByModel[model].total > 0) {
        shareByModel[model].percentage = Math.round(
          (shareByModel[model].mentioned / shareByModel[model].total) * 100
        );
      }
    }

    // Update competitor percentages
    for (const comp of competitors) {
      if (competitorShareMap[comp].total > 0) {
        competitorShareMap[comp].percentage = Math.round(
          (competitorShareMap[comp].mentioned / competitorShareMap[comp].total) * 100
        );
      }
    }

    // Calculate score
    const overallMentionRate = totalTests > 0 ? brandMentionedCount / totalTests : 0;
    const recommendationRate = totalTests > 0 ? brandRecommendedCount / totalTests : 0;
    const linkRate = totalTests > 0 ? brandLinkedCount / totalTests : 0;

    const score = Math.round(
      overallMentionRate * 50 +
      recommendationRate * 30 +
      linkRate * 20
    );

    const findings = {
      prompts_tested: prompts.length,
      models_tested: TEST_MODELS,
      total_tests: totalTests,
      brand_mentioned_count: brandMentionedCount,
      brand_linked_count: brandLinkedCount,
      brand_recommended_count: brandRecommendedCount,
      share_of_model: shareByModel,
      competitor_share_of_model: competitorShareMap,
      sample_mentions: sampleMentions,
    };

    const recommendations = generateAIPresenceRecommendations(findings, c.name);

    return {
      score,
      findings,
      summary: generateAIPresenceSummary(findings, c.name, score),
      recommendations,
    };
  }
}

function generateBuyingIntentPrompts(
  keywords: AIPresenceKeyword[]
): string[] {
  const prompts: string[] = [];

  for (const kw of keywords) {
    // Pick 1-2 templates per keyword to keep total manageable
    const templateIndex = prompts.length % BUYING_INTENT_TEMPLATES.length;
    const template = BUYING_INTENT_TEMPLATES[templateIndex];
    prompts.push(template.replace("{keyword}", kw.keyword));
  }

  return prompts;
}

function extractCompetitors(brandBrief: string): string[] {
  const patterns = [
    /(?:competitor|vs\.?|versus|alternative|compared to|unlike|instead of)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/gi,
  ];
  const names = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(brandBrief)) !== null) {
      names.add(match[1].trim());
    }
  }
  return Array.from(names).slice(0, 5); // Max 5 competitors
}

function generateAIPresenceSummary(
  findings: Record<string, unknown>,
  brandName: string,
  score: number
): string {
  const totalTests = findings.total_tests as number;
  const mentioned = findings.brand_mentioned_count as number;
  const mentionPct = totalTests > 0 ? Math.round((mentioned / totalTests) * 100) : 0;

  if (mentioned === 0) {
    return `${brandName} is completely invisible to AI models — mentioned in 0 of ${totalTests} buying-intent tests. This represents a critical gap in AI visibility.`;
  }

  return `${brandName} appears in ${mentionPct}% of AI model responses (${mentioned}/${totalTests} tests), scoring ${score}/100 for AI presence. ${
    score < 30
      ? "Significant work needed to improve AI visibility."
      : score < 60
        ? "Moderate presence but room for improvement."
        : "Good AI visibility with continued momentum needed."
  }`;
}

function generateAIPresenceRecommendations(
  findings: Record<string, unknown>,
  brandName: string
): AuditPillarResult["recommendations"] {
  const recommendations: AuditPillarResult["recommendations"] = [];
  const mentioned = findings.brand_mentioned_count as number;
  const totalTests = findings.total_tests as number;

  if (mentioned === 0) {
    recommendations.push({
      action: `Launch citation seeding campaign to get ${brandName} mentioned in threads that AI models already reference`,
      impact: "high",
      effort: "medium",
    });
  }

  const shareByModel = findings.share_of_model as Record<string, ModelShareResult>;
  if (shareByModel) {
    const zeroModels = Object.entries(shareByModel)
      .filter(([, data]) => data.mentioned === 0 && data.total > 0)
      .map(([model]) => model);

    if (zeroModels.length > 0) {
      recommendations.push({
        action: `Target content sources cited by ${zeroModels.join(", ")} — ${brandName} has zero presence on these models`,
        impact: "high",
        effort: "medium",
      });
    }
  }

  const competitorShare = findings.competitor_share_of_model as Record<
    string,
    { mentioned: number; percentage: number }
  >;
  if (competitorShare) {
    const dominantCompetitor = Object.entries(competitorShare).sort(
      ([, a], [, b]) => b.percentage - a.percentage
    )[0];
    if (dominantCompetitor && dominantCompetitor[1].percentage > 50) {
      recommendations.push({
        action: `${dominantCompetitor[0]} dominates at ${dominantCompetitor[1].percentage}% share — create content that positions ${brandName} alongside or above them`,
        impact: "high",
        effort: "high",
      });
    }
  }

  if (mentioned > 0 && (findings.brand_recommended_count as number) === 0) {
    recommendations.push({
      action: `${brandName} is mentioned but never recommended — improve the quality and depth of brand mentions in source content`,
      impact: "medium",
      effort: "medium",
    });
  }

  if ((findings.brand_linked_count as number) === 0 && totalTests > 0) {
    recommendations.push({
      action: "Ensure brand URL appears in high-authority source content so AI models can cite it directly",
      impact: "medium",
      effort: "low",
    });
  }

  return recommendations;
}
