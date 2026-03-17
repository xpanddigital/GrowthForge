// Classification pipeline for GrowthForge.
// Batches threads into groups of 20, calls Claude Sonnet for classification,
// and returns typed ClassificationResult arrays.

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import {
  buildClassifyPrompt,
  type ThreadForClassification,
} from "@/lib/ai/prompts/classify-thread";
import type { ClassificationResult } from "@/lib/agents/interfaces";
import { AIGenerationError } from "@/lib/utils/errors";

const BATCH_SIZE = 20;

interface ClassificationApiResponse {
  classifications: Array<{
    thread_id: string;
    intent: string;
    relevance_score: number;
    can_mention_brand: boolean;
    suggested_angle: string;
    tags: string[];
  }>;
}

/**
 * Validate and normalize a single classification result from the AI response.
 * Clamps scores, validates enums, and fills defaults for missing fields.
 */
function normalizeClassification(
  raw: ClassificationApiResponse["classifications"][number]
): ClassificationResult {
  const validIntents = [
    "informational",
    "transactional",
    "commercial",
    "navigational",
  ] as const;

  const intent = validIntents.includes(raw.intent as (typeof validIntents)[number])
    ? (raw.intent as ClassificationResult["intent"])
    : "informational";

  const relevanceScore = Math.max(0, Math.min(100, Math.round(raw.relevance_score ?? 50)));

  return {
    intent,
    relevance_score: relevanceScore,
    can_mention_brand: Boolean(raw.can_mention_brand),
    suggested_angle: raw.suggested_angle || "No specific angle suggested",
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t): t is string => typeof t === "string").slice(0, 10)
      : [],
  };
}

/**
 * Classify a single batch of threads (up to 20) using Claude Sonnet.
 * Returns classifications in the same order as the input threads.
 */
async function classifyBatch(
  threads: ThreadForClassification[],
  brandBrief: string
): Promise<Map<string, ClassificationResult>> {
  const { systemPrompt, userPrompt } = buildClassifyPrompt(threads, brandBrief);

  const result = await callSonnet(userPrompt, {
    systemPrompt,
    maxTokens: 4096,
    temperature: 0.2, // Low temperature for deterministic classification
  });

  const parsed = parseClaudeJson<ClassificationApiResponse>(result.text);

  if (!parsed.classifications || !Array.isArray(parsed.classifications)) {
    throw new AIGenerationError(
      "claude-sonnet",
      "Classification response missing 'classifications' array",
      { rawResponse: result.text.substring(0, 500) }
    );
  }

  // Build a map from thread_id to classification result
  const classificationMap = new Map<string, ClassificationResult>();

  for (const raw of parsed.classifications) {
    if (raw.thread_id) {
      classificationMap.set(raw.thread_id, normalizeClassification(raw));
    }
  }

  return classificationMap;
}

/**
 * Classify an array of threads using Claude Sonnet.
 *
 * Batches threads into groups of 20, runs each batch through the classification
 * pipeline, and returns results in the same order as the input.
 *
 * If a thread fails to classify (missing from AI response), a default
 * low-relevance classification is returned.
 *
 * @param threads - Array of threads to classify
 * @param brandBrief - The client's brand brief for context
 * @returns Array of ClassificationResult in the same order as input threads
 */
export async function classifyThreads(
  threads: ThreadForClassification[],
  brandBrief: string
): Promise<ClassificationResult[]> {
  if (threads.length === 0) {
    return [];
  }

  // Split threads into batches of BATCH_SIZE
  const batches: ThreadForClassification[][] = [];
  for (let i = 0; i < threads.length; i += BATCH_SIZE) {
    batches.push(threads.slice(i, i + BATCH_SIZE));
  }

  // Process all batches (sequentially to respect rate limits)
  const allClassifications = new Map<string, ClassificationResult>();

  for (const batch of batches) {
    const batchResults = await classifyBatch(batch, brandBrief);
    batchResults.forEach((classification, threadId) => {
      allClassifications.set(threadId, classification);
    });
  }

  // Return results in the same order as input threads.
  // For any thread that wasn't in the AI response, return a default.
  return threads.map((thread) => {
    const classification = allClassifications.get(thread.id);
    if (classification) {
      return classification;
    }

    // Default classification for threads the AI missed
    return {
      intent: "informational" as const,
      relevance_score: 30,
      can_mention_brand: false,
      suggested_angle: "Thread could not be automatically classified. Manual review recommended.",
      tags: ["unclassified"],
    };
  });
}
