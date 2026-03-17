// ChatGPT Test Agent — tests OpenAI gpt-4o for brand mentions.
// No native source URLs — relies on MonitorAnalyzerAgent for inline URL detection.

import OpenAI from "openai";
import { createHash } from "crypto";
import { withRetry } from "@/lib/utils/retry";
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

export class ChatGPTTestAgent implements MonitorTestAgent {
  name = "ChatGPTTestAgent";
  model = "gpt-4o";

  private client: OpenAI | null = null;
  private analyzer = new MonitorAnalyzerAgent();

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

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

    const response = await withRetry(
      async () => {
        const client = this.getClient();
        const completion = await client.chat.completions.create({
          model: this.model,
          temperature: 0.3,
          max_tokens: 2000,
          messages: [
            { role: "system", content: NEUTRAL_SYSTEM_PROMPT },
            { role: "user", content: promptText },
          ],
        });
        return completion.choices[0]?.message?.content || "";
      },
      { maxRetries: 3, baseDelayMs: 2000 }
    );

    const responseHash = hashResponse(response);

    // Analyze with MonitorAnalyzerAgent
    const analysis = await this.analyzer.analyze({
      response,
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
    const inlineUrls = response.match(urlRegex) || [];

    return {
      aiModel: "chatgpt",
      fullResponse: response,
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
    };
  }
}
