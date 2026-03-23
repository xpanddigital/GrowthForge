// Response generation pipeline for GrowthForge.
// This is the most critical code in the entire system.
// Response quality is the entire value proposition.
//
// Uses Claude Opus 4 (claude-opus-4-20250514) — do NOT use Sonnet for this.
// Generates all 3 variants (casual, expert, story) in a single API call.

import { callOpus, parseClaudeJson } from "@/lib/ai/claude";
import type { GeneratedResponse } from "@/lib/agents/interfaces";
import type { Client, Thread } from "@/types/database";
import { AIGenerationError } from "@/lib/utils/errors";
import {
  ABSOLUTE_RULES,
  buildThreadContext,
  buildClientContext,
  formatClientContextBlock,
  formatThreadContextBlock,
} from "@/lib/ai/prompts/shared-context";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * The full system prompt for response generation.
 * Copied EXACTLY from the CLAUDE.md specification.
 * This prompt is the key to quality — do not modify without careful testing.
 */
const RESPONSE_GENERATION_SYSTEM_PROMPT = `You are an expert at writing authentic, community-native responses for Reddit, Quora, and Facebook Group discussions. Your responses must be indistinguishable from a real community member who genuinely uses and recommends the brand.

${ABSOLUTE_RULES}

## GENERATE THREE VARIANTS

### Variant 1: Casual Helper
Write as someone who stumbled across this thread and has personal experience.
Short, punchy, conversational. Mentions the brand as "I've been using X" or
"a friend put me onto X". Feels like a quick helpful reply between meetings.

### Variant 2: Expert Authority
Write as someone with deep domain knowledge. Leads with substantial advice --
enough that the response would be helpful even WITHOUT the brand mention.
Positions the brand as one option among several. Structured, thorough, credible.
This variant should have the highest quality_score.

### Variant 3: Story-Based
Write as someone sharing a personal experience that involves the brand.
"I was in the exact same boat as you..." format. The brand mention feels
incidental to the story, not the point of it. Emotionally engaging.

## OUTPUT FORMAT

Return valid JSON:
{
  "variants": [
    {
      "variant": "casual",
      "body_text": "the full response text ready to paste",
      "quality_score": 0-100,
      "tone_match_score": 0-100,
      "mentions_brand": true/false,
      "mentions_url": true/false
    },
    {
      "variant": "expert",
      "body_text": "the full response text ready to paste",
      "quality_score": 0-100,
      "tone_match_score": 0-100,
      "mentions_brand": true/false,
      "mentions_url": true/false
    },
    {
      "variant": "story",
      "body_text": "the full response text ready to paste",
      "quality_score": 0-100,
      "tone_match_score": 0-100,
      "mentions_brand": true/false,
      "mentions_url": true/false
    }
  ]
}

Return ONLY valid JSON. No other text before or after the JSON.`;

interface ResponseGenerationApiResponse {
  variants: Array<{
    variant: string;
    body_text: string;
    quality_score: number;
    tone_match_score: number;
    mentions_brand: boolean;
    mentions_url: boolean;
  }>;
}

/**
 * Validate and normalize a single generated response variant.
 */
function normalizeResponse(
  raw: ResponseGenerationApiResponse["variants"][number]
): GeneratedResponse {
  const validVariants = ["casual", "expert", "story"] as const;

  const variant = validVariants.includes(raw.variant as (typeof validVariants)[number])
    ? (raw.variant as GeneratedResponse["variant"])
    : ("casual" as const);

  if (!raw.body_text || typeof raw.body_text !== "string" || raw.body_text.trim().length === 0) {
    throw new AIGenerationError(
      "claude-opus",
      `Empty body_text for ${raw.variant} variant`,
      { variant: raw.variant }
    );
  }

  return {
    variant,
    body_text: raw.body_text.trim(),
    quality_score: Math.max(0, Math.min(100, Math.round(raw.quality_score ?? 70))),
    tone_match_score: Math.max(0, Math.min(100, Math.round(raw.tone_match_score ?? 70))),
    mentions_brand: Boolean(raw.mentions_brand),
    mentions_url: Boolean(raw.mentions_url),
  };
}

/**
 * Ensure all 3 variants are present in the response.
 * If a variant is missing, throw an error rather than returning incomplete results.
 */
function validateAllVariants(
  responses: GeneratedResponse[]
): GeneratedResponse[] {
  const variantSet = new Set(responses.map((r) => r.variant));
  const requiredVariants = ["casual", "expert", "story"] as const;
  const missing = requiredVariants.filter((v) => !variantSet.has(v));

  if (missing.length > 0) {
    throw new AIGenerationError(
      "claude-opus",
      `Response generation missing variants: ${missing.join(", ")}`,
      { received: Array.from(variantSet), missing }
    );
  }

  // Return in canonical order: casual, expert, story
  return requiredVariants.map(
    (v) => responses.find((r) => r.variant === v)!
  );
}

/**
 * Call Gemini as a fallback for response generation.
 * Used when Claude Opus is unavailable (credit issues, rate limits, etc).
 */
async function callGeminiFallback(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new AIGenerationError(
      "gemini-fallback",
      "GOOGLE_GEMINI_API_KEY not set — cannot fall back to Gemini"
    );
  }

  const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AIGenerationError(
      "gemini-fallback",
      `Gemini API error (${res.status}): ${text.substring(0, 200)}`
    );
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new AIGenerationError(
      "gemini-fallback",
      "No text content in Gemini response"
    );
  }
  return text;
}

/**
 * Check if an error is a billing/credit issue that warrants fallback.
 */
function isBillingError(error: unknown): boolean {
  if (error instanceof AIGenerationError) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("credit balance") ||
      msg.includes("billing") ||
      msg.includes("payment") ||
      msg.includes("insufficient") ||
      (error.details as Record<string, unknown>)?.status === 400 ||
      (error.details as Record<string, unknown>)?.status === 402
    );
  }
  return false;
}

/**
 * Generate 3 response variants (casual, expert, story) for a thread.
 *
 * This is the core value-generating function of GrowthForge.
 * Uses Claude Opus 4 for highest quality output.
 * Falls back to Gemini if Claude is unavailable (billing, rate limits).
 * All 3 variants are requested in a single API call for coherent context.
 *
 * @param thread - The enriched thread with body_text and top_comments
 * @param client - The client with brand_brief, tone_guidelines, etc.
 * @returns Array of 3 GeneratedResponse objects in order: casual, expert, story
 */
export async function generateResponses(
  thread: Thread,
  client: Client
): Promise<GeneratedResponse[]> {
  const threadCtx = buildThreadContext(thread);
  const clientCtx = buildClientContext(client);

  const userPrompt = `${formatClientContextBlock(clientCtx)}

${formatThreadContextBlock(threadCtx)}

Generate all THREE response variants (casual, expert, story) for this thread.

Each variant should be a complete, ready-to-paste response that follows all the ABSOLUTE RULES.
The expert variant should have the highest quality_score.
All three should reference specific details from the thread.
Remember: You are a USER, not the company. Earn the brand mention through value.`;

  let responseText: string;
  let usedFallback = false;

  try {
    const result = await callOpus(userPrompt, {
      systemPrompt: RESPONSE_GENERATION_SYSTEM_PROMPT,
      maxTokens: 8192,
      temperature: 0.8,
    });
    responseText = result.text;
  } catch (opusError) {
    // If it's a billing/credit error, try Gemini as fallback
    if (isBillingError(opusError)) {
      console.warn(
        "[generate-responses] Claude Opus billing error, falling back to Gemini:",
        opusError instanceof Error ? opusError.message : opusError
      );
      responseText = await callGeminiFallback(
        RESPONSE_GENERATION_SYSTEM_PROMPT,
        userPrompt
      );
      usedFallback = true;
    } else {
      throw opusError;
    }
  }

  const parsed = parseClaudeJson<ResponseGenerationApiResponse>(responseText);

  if (!parsed.variants || !Array.isArray(parsed.variants)) {
    throw new AIGenerationError(
      usedFallback ? "gemini-fallback" : "claude-opus",
      "Response generation output missing 'variants' array",
      { rawResponse: responseText.substring(0, 500) }
    );
  }

  // Normalize and validate each variant
  const normalized = parsed.variants.map(normalizeResponse);

  if (usedFallback) {
    console.log("[generate-responses] Successfully generated responses via Gemini fallback");
  }

  // Ensure all 3 variants are present and return in canonical order
  return validateAllVariants(normalized);
}
