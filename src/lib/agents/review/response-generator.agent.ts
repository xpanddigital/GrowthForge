// Review Response Generator Agent — Claude Opus for quality public-facing responses.
// Human-in-the-loop: generated responses are DRAFTS only, never auto-posted.

import { callOpus } from "@/lib/ai/claude";
import type {
  ReviewResponseGeneratorAgent,
  ReviewResponseInput,
  ReviewResponseResult,
} from "@/lib/agents/interfaces";

export class ReviewResponseAgent implements ReviewResponseGeneratorAgent {
  name = "ReviewResponseAgent";

  async generate(input: ReviewResponseInput): Promise<ReviewResponseResult> {
    const sentimentInstructions = this.getSentimentInstructions(input.sentiment, input.rating);

    const response = await callOpus(
      `Write an owner response to this review of ${input.clientName}.

Review by ${input.reviewerName || "a customer"} (${input.rating} stars):
"${input.reviewText}"

Sentiment: ${input.sentiment}
Topics mentioned: ${input.topics.join(", ") || "none extracted"}

Requirements:
${sentimentInstructions}
- Sound like a real person, not a PR department
- Reference specific details from their review
- Never use these phrases: "we take all feedback seriously", "your satisfaction is our priority", "we apologize for any inconvenience"

Return ONLY the response text, nothing else.`,
      {
        systemPrompt: `You write professional, empathetic review responses for businesses.
Never be defensive. Never use corporate jargon. Be specific to what the reviewer said.
${input.clientToneGuidelines ? `Tone guidelines: ${input.clientToneGuidelines}` : ""}`,
        maxTokens: 1024,
        temperature: 0.7,
      }
    );

    return {
      responseText: response.text.trim(),
      tone: input.sentiment === "negative" ? "empathetic" : "grateful",
    };
  }

  private getSentimentInstructions(
    sentiment: "positive" | "neutral" | "negative",
    rating: number
  ): string {
    switch (sentiment) {
      case "positive":
        return `- Thank them specifically for what they praised. Keep it warm and brief (2-3 sentences).
- Reinforce the specific positive experience they mentioned.
- Subtle invitation to return or refer others.`;

      case "negative":
        return `- Empathize genuinely. Address their specific concern directly.
- Offer a concrete path to resolution — don't just say "reach out".
- Provide a way to continue the conversation offline (invite them to email/call).
- 3-5 sentences. Never be defensive or make excuses.
- Acknowledge what went wrong from their perspective.`;

      case "neutral":
        return `- Acknowledge their experience and any specific points they raised.
- Address any mixed feelings or suggestions they mentioned.
- Invite them back or offer to improve their next experience.
- 2-4 sentences.`;

      default:
        return `- Write a ${rating >= 3 ? "grateful" : "empathetic"} response. 2-4 sentences.`;
    }
  }
}
