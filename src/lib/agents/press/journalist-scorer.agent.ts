// Journalist Scorer Agent — Claude Sonnet for batch classification.
// Scores 8 journalists per API call against a press release.
// Evaluates: beat alignment, publication fit, regional match, recency, engagement likelihood.

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import { buildJournalistScorePrompt } from "./prompts/journalist-score";
import type {
  PressJournalistScorerAgent,
  JournalistScoreResult,
} from "@/lib/agents/interfaces";

const BATCH_SIZE = 8;

export class JournalistScorerAgent implements PressJournalistScorerAgent {
  name = "JournalistScorerAgent";

  async scoreBatch(
    journalists: Array<{
      index: number;
      name: string;
      publication: string;
      region: string;
      recentArticlesSummary: string;
    }>,
    pressRelease: { title: string; body: string; region: string; type: string }
  ): Promise<JournalistScoreResult[]> {
    // Split into batches of 8
    const batches: typeof journalists[] = [];
    for (let i = 0; i < journalists.length; i += BATCH_SIZE) {
      batches.push(journalists.slice(i, i + BATCH_SIZE));
    }

    const allResults: JournalistScoreResult[] = [];

    for (const batch of batches) {
      const summary = `${pressRelease.title}\n\n${pressRelease.body}`;
      const { system, user } = buildJournalistScorePrompt(
        batch,
        summary,
        pressRelease.region
      );

      const response = await callSonnet(user, {
        systemPrompt: system,
        maxTokens: 4096,
        temperature: 0.2,
      });

      const batchResults = parseClaudeJson<JournalistScoreResult[]>(response.text);
      allResults.push(...batchResults);
    }

    return allResults;
  }
}
