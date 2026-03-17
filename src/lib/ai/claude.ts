// Anthropic SDK wrapper for GrowthForge.
// Provides callClaude (generic), callSonnet (classification), and callOpus (generation).

import Anthropic from "@anthropic-ai/sdk";
import { withRetry } from "@/lib/utils/retry";
import { AIGenerationError } from "@/lib/utils/errors";

// Model constants — centralized so swaps are one-line changes
export const MODELS = {
  SONNET: "claude-sonnet-4-20250514" as const,
  OPUS: "claude-opus-4-20250514" as const,
} as const;

export type ClaudeModel = (typeof MODELS)[keyof typeof MODELS];

// Singleton client — initialized on first use
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AIGenerationError(
        "anthropic",
        "ANTHROPIC_API_KEY environment variable is not set"
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export interface CallClaudeParams {
  model: ClaudeModel;
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
}

export interface CallClaudeResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string | null;
}

/**
 * Generic wrapper for calling Claude with retry logic and structured error handling.
 * All AI calls in GrowthForge should flow through this function.
 */
export async function callClaude(
  params: CallClaudeParams
): Promise<CallClaudeResult> {
  const {
    model,
    systemPrompt,
    userPrompt,
    maxTokens = 4096,
    temperature = 0.7,
    stopSequences,
  } = params;

  return withRetry(
    async () => {
      try {
        const client = getClient();

        const messages: Anthropic.MessageParam[] = [
          { role: "user", content: userPrompt },
        ];

        const response = await client.messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          ...(systemPrompt ? { system: systemPrompt } : {}),
          ...(stopSequences ? { stop_sequences: stopSequences } : {}),
          messages,
        });

        // Extract text from response content blocks
        const textBlocks = response.content.filter(
          (block): block is Anthropic.TextBlock => block.type === "text"
        );

        if (textBlocks.length === 0) {
          throw new AIGenerationError(
            model,
            "No text content in Claude response",
            { stopReason: response.stop_reason }
          );
        }

        const text = textBlocks.map((block) => block.text).join("");

        return {
          text,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          stopReason: response.stop_reason,
        };
      } catch (error) {
        // Re-throw our own errors
        if (error instanceof AIGenerationError) {
          throw error;
        }

        // Handle Anthropic SDK errors
        if (error instanceof Anthropic.APIError) {
          const isRetryable =
            error.status === 429 ||
            error.status === 500 ||
            error.status === 502 ||
            error.status === 503;

          throw new AIGenerationError(model, error.message, {
            status: error.status,
            retryable: isRetryable,
          });
        }

        // Unknown errors
        const message =
          error instanceof Error ? error.message : "Unknown error";
        throw new AIGenerationError(model, message);
      }
    },
    {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      retryableErrors: ["AI_GENERATION_ERROR"],
    }
  );
}

/**
 * Shorthand for Claude Sonnet — used for classification tasks.
 * Lower cost, faster, optimized for structured output.
 */
export async function callSonnet(
  prompt: string,
  options?: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<CallClaudeResult> {
  return callClaude({
    model: MODELS.SONNET,
    userPrompt: prompt,
    systemPrompt: options?.systemPrompt,
    maxTokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.3, // Lower temperature for classification
  });
}

/**
 * Shorthand for Claude Opus — used for high-quality response generation.
 * Higher cost, slower, but produces the best output quality.
 * DO NOT use Sonnet for response generation — Opus is required.
 */
export async function callOpus(
  prompt: string,
  options?: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<CallClaudeResult> {
  return callClaude({
    model: MODELS.OPUS,
    userPrompt: prompt,
    systemPrompt: options?.systemPrompt,
    maxTokens: options?.maxTokens ?? 8192,
    temperature: options?.temperature ?? 0.8, // Higher temperature for creative responses
  });
}

/**
 * Parse a JSON response from Claude, handling markdown code fences
 * and common formatting issues.
 */
export function parseClaudeJson<T>(text: string): T {
  // Strip markdown code fences if present
  let cleaned = text.trim();

  // Remove ```json ... ``` wrapping
  const jsonFenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonFenceMatch) {
    cleaned = jsonFenceMatch[1].trim();
  }

  // Try to find JSON object or array if the response has surrounding text
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const jsonObjectMatch = cleaned.match(/(\{[\s\S]*\})/);
    const jsonArrayMatch = cleaned.match(/(\[[\s\S]*\])/);
    if (jsonObjectMatch) {
      cleaned = jsonObjectMatch[1];
    } else if (jsonArrayMatch) {
      cleaned = jsonArrayMatch[1];
    }
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (parseError) {
    throw new AIGenerationError("claude", "Failed to parse JSON from Claude response", {
      rawText: text.substring(0, 500),
      parseError:
        parseError instanceof Error ? parseError.message : "Unknown parse error",
    });
  }
}
