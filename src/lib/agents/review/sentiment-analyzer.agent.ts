// Sentiment Analyzer Agent — batch Claude Sonnet analysis of review text.
// Processes reviews in batches of 20 for efficiency.
// Extracts sentiment, topics, key phrases, and auto-flag logic.

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import type {
  ReviewSentimentAgent,
  SentimentAnalysisInput,
  SentimentAnalysisResult,
} from "@/lib/agents/interfaces";

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

interface ParsedReviewAnalysis {
  id: string;
  sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  topics: string[];
  key_phrases: string[];
  should_flag: boolean;
  flag_reason: string | null;
}

export class SentimentAnalyzerAgent implements ReviewSentimentAgent {
  name = "SentimentAnalyzerAgent";

  async analyze(input: SentimentAnalysisInput): Promise<SentimentAnalysisResult> {
    const batches = chunk(input.reviews, 20);
    const allResults: ParsedReviewAnalysis[] = [];

    for (const batch of batches) {
      const reviewsList = batch
        .map(
          (r) =>
            `[${r.id}] (${r.platform}, ${r.rating} stars): "${r.reviewText || "(no text)"}"`
        )
        .join("\n\n");

      const response = await callSonnet(
        `Analyze these ${input.clientName} reviews (${input.clientVertical} industry).

REVIEWS:
${reviewsList}

For each review, return:
{
  "reviews": [
    {
      "id": "the review id",
      "sentiment": "positive|neutral|negative",
      "sentiment_score": -1.0 to 1.0,
      "topics": ["topic1", "topic2"],
      "key_phrases": ["notable phrase 1"],
      "should_flag": boolean,
      "flag_reason": "string or null"
    }
  ]
}

Topic extraction guidance for ${input.clientVertical} industry:
- Look for themes like: customer service, pricing, quality, communication, expertise, results, value, wait time, professionalism
- Extract 1-3 topics per review
- Key phrases should be quotable snippets (3-10 words) useful for marketing or flagging

Flag reviews that: are strongly negative (1-2 stars with specific complaints), contain actionable feedback the business should address, mention competitor advantages, or suggest a service failure.`,
        {
          systemPrompt:
            "Analyze review sentiment, extract topics and key phrases. Return ONLY valid JSON.",
          temperature: 0.1,
        }
      );

      const parsed = parseClaudeJson<{ reviews: ParsedReviewAnalysis[] }>(response.text);
      allResults.push(...(parsed.reviews || []));
    }

    // Aggregate topics across all reviews
    const topicCounts: Record<string, { count: number; sentiments: number[] }> = {};
    for (const review of allResults) {
      for (const topic of review.topics) {
        const normalized = topic.toLowerCase().trim();
        if (!topicCounts[normalized]) {
          topicCounts[normalized] = { count: 0, sentiments: [] };
        }
        topicCounts[normalized].count++;
        topicCounts[normalized].sentiments.push(review.sentiment_score);
      }
    }

    const aggregateTopics = Object.entries(topicCounts)
      .map(([topic, data]) => {
        const avgScore =
          data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length;
        return {
          topic,
          count: data.count,
          avgSentiment:
            avgScore > 0.2
              ? ("positive" as const)
              : avgScore < -0.2
                ? ("negative" as const)
                : ("neutral" as const),
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      reviews: allResults.map((r) => ({
        id: r.id,
        sentiment: r.sentiment,
        sentimentScore: r.sentiment_score,
        topics: r.topics,
        keyPhrases: r.key_phrases,
        shouldFlag: r.should_flag,
        flagReason: r.flag_reason,
      })),
      aggregateTopics,
    };
  }
}
