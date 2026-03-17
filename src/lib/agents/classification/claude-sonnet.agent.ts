// Claude Sonnet Classification Agent — classifies threads using Claude Sonnet.
// Wraps the classification pipeline from src/lib/ai/classify.ts to conform
// to the ClassificationAgent interface.

import type { ClassificationAgent, ClassificationResult } from "../interfaces";
import { classifyThreads } from "@/lib/ai/classify";
import type { ThreadForClassification } from "@/lib/ai/prompts/classify-thread";

export class ClaudeSonnetClassifier implements ClassificationAgent {
  name = "ClaudeSonnetClassifier";

  /**
   * Classify a single thread using Claude Sonnet.
   *
   * The interface accepts a single thread, but internally this uses the batch
   * classification pipeline (with a batch size of 1) to maintain consistency.
   *
   * @param thread - Thread content to classify
   * @param brandBrief - The client's brand brief for context
   * @returns ClassificationResult with intent, relevance score, etc.
   */
  async classify(
    thread: { title: string; body_text: string; platform: string },
    brandBrief: string
  ): Promise<ClassificationResult> {
    // Convert to the format expected by the classification pipeline
    const threadForClassification: ThreadForClassification = {
      id: "single-thread", // Temporary ID for single classification
      title: thread.title,
      body_text: thread.body_text,
      platform: thread.platform,
      url: "", // Not needed for classification
    };

    const results = await classifyThreads(
      [threadForClassification],
      brandBrief
    );

    return results[0];
  }

  /**
   * Classify multiple threads in a batch.
   * This is the preferred method for bulk classification as it uses
   * the batching optimization (up to 20 threads per API call).
   *
   * @param threads - Array of threads to classify
   * @param brandBrief - The client's brand brief
   * @returns Array of ClassificationResult in the same order as input
   */
  async classifyBatch(
    threads: Array<{
      id: string;
      title: string;
      body_text: string | null;
      platform: string;
      subreddit?: string | null;
      group_name?: string | null;
      url: string;
    }>,
    brandBrief: string
  ): Promise<ClassificationResult[]> {
    return classifyThreads(threads, brandBrief);
  }
}
