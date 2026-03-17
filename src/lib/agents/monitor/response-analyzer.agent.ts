// Response Analyzer Agent — the brain that parses ANY AI model's response
// for brand/competitor mentions, sentiment, and prominence.
// Uses Claude Sonnet for classification (deterministic, temp 0).

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import type {
  MonitorAnalyzerInput,
  MonitorAnalyzerOutput,
} from "@/lib/agents/interfaces";

const SYSTEM_PROMPT = `You are a precise text analyzer. Your job is to analyze an AI model's response for brand and competitor mentions. Return ONLY valid JSON — no explanation, no markdown.

Scoring rules:
- prominence_score: 100 = brand is #1 recommendation, 75 = top 3, 50 = mentioned among several, 25 = mentioned in passing, 0 = not mentioned
- brand_recommended: true ONLY if the response actively suggests or recommends the brand (not just a passing mention)
- mention_position: 1 = first option/brand mentioned in the response, 2 = second, etc. null if not mentioned
- mention_context: Extract 1-2 sentences where the brand appears. null if not mentioned
- sentiment: positive (recommends/praises), neutral (just lists/mentions), negative (warns against/criticizes). null if not mentioned
- For competitors, apply the same analysis rules

Brand mentions can be:
- Exact name match (case-insensitive)
- Partial match (e.g. just the first word of a multi-word brand)
- Possessive form (e.g. "RUN's catalog")
- Contextual reference (e.g. "a company called Run that does music licensing")
- URL-only mention (e.g. "runmusic.com" without naming the brand)
- Misspelled variations`;

function buildUserPrompt(input: MonitorAnalyzerInput): string {
  const competitorList = input.competitors
    .map(
      (c) =>
        `- ${c.name}${c.aliases.length > 0 ? ` (also known as: ${c.aliases.join(", ")})` : ""}`
    )
    .join("\n");

  return `Analyze this AI model response for brand and competitor mentions.

BRAND TO DETECT:
Name: ${input.clientName}
${input.clientAliases.length > 0 ? `Aliases: ${input.clientAliases.join(", ")}` : ""}
URLs: ${input.clientUrls.join(", ")}

COMPETITORS TO DETECT:
${competitorList || "None specified"}

AI MODEL RESPONSE TO ANALYZE:
"""
${input.response}
"""

Return valid JSON matching this exact structure:
{
  "brandMentioned": boolean,
  "brandRecommended": boolean,
  "brandLinked": boolean,
  "brandSourceUrls": string[],
  "mentionContext": string | null,
  "mentionPosition": number | null,
  "prominenceScore": number,
  "sentiment": "positive" | "neutral" | "negative" | null,
  "competitorDetails": [
    {
      "name": string,
      "mentioned": boolean,
      "recommended": boolean,
      "sentiment": "positive" | "neutral" | "negative" | null,
      "context": string | null
    }
  ]
}`;
}

export class MonitorAnalyzerAgent {
  name = "MonitorAnalyzerAgent";

  async analyze(input: MonitorAnalyzerInput): Promise<MonitorAnalyzerOutput> {
    const result = await callSonnet(buildUserPrompt(input), {
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0, // Deterministic analysis
      maxTokens: 2000,
    });

    const parsed = parseClaudeJson<MonitorAnalyzerOutput>(result.text);

    // Ensure all competitors have entries even if not found in response
    const competitorMap = new Map(
      parsed.competitorDetails.map((c) => [c.name.toLowerCase(), c])
    );

    const normalizedCompetitors = input.competitors.map((c) => {
      const found = competitorMap.get(c.name.toLowerCase());
      if (found) return found;
      return {
        name: c.name,
        mentioned: false,
        recommended: false,
        sentiment: null,
        context: null,
      };
    });

    return {
      ...parsed,
      competitorDetails: normalizedCompetitors,
    };
  }
}
