// Claude Test Agent — tests Anthropic Claude (claude-sonnet-4) for brand mentions.
// IMPORTANT: We're using Claude to test Claude. This bias is documented in the UI:
// "Claude monitoring results may differ from end-user experiences. Cross-reference with other models."

import { createHash } from "crypto";
import { callSonnet } from "@/lib/ai/claude";
import { MonitorAnalyzerAgent } from "./response-analyzer.agent";
import type {
  MonitorTestAgent,
  MonitorTestInput,
  MonitorTestResult,
} from "@/lib/agents/interfaces";

const NEUTRAL_SYSTEM_PROMPT =
  "You are a helpful assistant. Answer thoroughly and cite sources where possible.";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function hashResponse(text: string): string {
  return createHash("sha256").update(normalizeText(text)).digest("hex");
}

export class ClaudeTestAgent implements MonitorTestAgent {
  name = "ClaudeTestAgent";
  model = "claude-sonnet-4-20250514";

  private analyzer = new MonitorAnalyzerAgent();

  async test(input: MonitorTestInput): Promise<MonitorTestResult> {
    // Append location context if provided
    let promptText = input.promptText;
    if (input.location?.locationString) {
      if (
        !promptText
          .toLowerCase()
          .includes(input.location.locationString.toLowerCase())
      ) {
        promptText += ` (I'm based in ${input.location.locationString})`;
      }
    }

    // Use existing callSonnet wrapper — it handles retries and error handling
    const result = await callSonnet(promptText, {
      systemPrompt: NEUTRAL_SYSTEM_PROMPT,
      temperature: 0.3,
      maxTokens: 2000,
    });

    const responseText = result.text;
    const responseHash = hashResponse(responseText);

    // Analyze with MonitorAnalyzerAgent
    const analysis = await this.analyzer.analyze({
      response: responseText,
      clientName: input.clientName,
      clientAliases: input.clientAliases || [],
      clientUrls: input.clientUrls,
      competitors: input.competitors.map((c) => ({
        name: c.name,
        aliases: c.aliases,
      })),
    });

    // Extract any inline URLs from the response
    const urlRegex = /https?:\/\/[^\s)>\]]+/g;
    const inlineUrls = responseText.match(urlRegex) || [];

    return {
      aiModel: "claude",
      fullResponse: responseText,
      responseHash,
      brandMentioned: analysis.brandMentioned,
      brandRecommended: analysis.brandRecommended,
      brandLinked: analysis.brandLinked,
      brandSourceUrls: analysis.brandSourceUrls,
      mentionContext: analysis.mentionContext,
      mentionPosition: analysis.mentionPosition,
      prominenceScore: analysis.prominenceScore,
      sentiment: analysis.sentiment,
      sourcesCited: inlineUrls,
      competitorDetails: analysis.competitorDetails,
      metadata: {
        input_tokens: result.inputTokens,
        output_tokens: result.outputTokens,
        claude_self_test_bias: true,
      },
    };
  }
}
