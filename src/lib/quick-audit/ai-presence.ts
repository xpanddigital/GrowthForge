// AI Presence Checker — probes AI models for brand mentions.
// Reuses existing probePerplexity/probeOpenAI from the main codebase.
// For VIP tier, adds Gemini and Claude probing.

import { probePerplexity, probeOpenAI } from "@/lib/ai/probe-ai-models";
import { isBrandMentioned, isUrlMentioned, findCompetitorMentions } from "./mention-parser";
import type { AITestResult, AuditTier } from "./types";
import { TIER_CONFIGS } from "./types";

// Prompt templates — buying-intent questions that should surface brand recommendations
const PROMPT_TEMPLATES = [
  "What are the best {keyword} options? Can you recommend specific companies?",
  "I need {keyword} — what companies do people recommend and why?",
  "Compare the top {keyword} providers. Which ones stand out?",
];

/**
 * Run AI presence checks for a business across configured models.
 * Returns individual test results with brand/competitor mention detection.
 */
export async function checkAIPresence(params: {
  businessName: string;
  websiteUrl: string;
  keywords: string[];
  competitors: string[];
  tier: AuditTier;
}): Promise<AITestResult[]> {
  const config = TIER_CONFIGS[params.tier];
  const keywords = params.keywords.slice(0, config.maxKeywords);
  const results: AITestResult[] = [];

  for (const keyword of keywords) {
    const prompts = PROMPT_TEMPLATES.slice(0, config.promptsPerKeyword);

    for (const template of prompts) {
      const prompt = template.replace(/\{keyword\}/g, keyword);

      // Run enabled models in parallel for this prompt
      const modelPromises = config.models.map((model) =>
        probeModel(model, prompt, params.businessName, params.websiteUrl, params.competitors)
      );

      const modelResults = await Promise.allSettled(modelPromises);

      for (const result of modelResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        }
        // Silently skip failed models — don't block the audit
      }
    }
  }

  return results;
}

async function probeModel(
  model: string,
  prompt: string,
  brandName: string,
  websiteUrl: string,
  competitors: string[]
): Promise<AITestResult> {
  let responseText = "";

  switch (model) {
    case "perplexity": {
      const result = await probePerplexity(prompt);
      responseText = result.responseText;
      return {
        model: "Perplexity",
        prompt,
        responseText,
        brandMentioned: isBrandMentioned(responseText, brandName),
        brandLinked: isUrlMentioned(responseText, websiteUrl) ||
          result.sourcesFromApi.some((url) => isUrlMentioned(url, websiteUrl)),
        competitorsMentioned: findCompetitorMentions(responseText, competitors),
        sourcesCited: result.sourcesFromApi,
      };
    }

    case "openai": {
      const result = await probeOpenAI(prompt);
      responseText = result.responseText;
      return {
        model: "ChatGPT",
        prompt,
        responseText,
        brandMentioned: isBrandMentioned(responseText, brandName),
        brandLinked: isUrlMentioned(responseText, websiteUrl),
        competitorsMentioned: findCompetitorMentions(responseText, competitors),
        sourcesCited: [],
      };
    }

    case "gemini": {
      responseText = await probeGemini(prompt);
      return {
        model: "Gemini",
        prompt,
        responseText,
        brandMentioned: isBrandMentioned(responseText, brandName),
        brandLinked: isUrlMentioned(responseText, websiteUrl),
        competitorsMentioned: findCompetitorMentions(responseText, competitors),
        sourcesCited: [],
      };
    }

    case "claude": {
      responseText = await probeClaude(prompt);
      return {
        model: "Claude",
        prompt,
        responseText,
        brandMentioned: isBrandMentioned(responseText, brandName),
        brandLinked: isUrlMentioned(responseText, websiteUrl),
        competitorsMentioned: findCompetitorMentions(responseText, competitors),
        sourcesCited: [],
      };
    }

    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

// VIP-only: Gemini probing
async function probeGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return "[Gemini API key not configured]";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.5 },
        }),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    console.warn("[Gemini] Probe failed:", err);
    return "";
  }
}

// VIP-only: Claude probing
async function probeClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "[Claude API key not configured]";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "";
  } catch (err) {
    console.warn("[Claude] Probe failed:", err);
    return "";
  }
}
