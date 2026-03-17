// Gemini Test Agent — tests Google Gemini (gemini-2.0-flash) for brand mentions.
// Gemini does NOT natively return source citations in the standard API.
// Relies on inline URL extraction + MonitorAnalyzerAgent.

import { createHash } from "crypto";
import { withRetry } from "@/lib/utils/retry";
import { MonitorAnalyzerAgent } from "./response-analyzer.agent";
import type {
  MonitorTestAgent,
  MonitorTestInput,
  MonitorTestResult,
} from "@/lib/agents/interfaces";

const GEMINI_MODEL = "gemini-2.0-flash";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function hashResponse(text: string): string {
  return createHash("sha256").update(normalizeText(text)).digest("hex");
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text?: string }>;
    };
  }>;
  error?: { message: string };
}

export class GeminiTestAgent implements MonitorTestAgent {
  name = "GeminiTestAgent";
  model = GEMINI_MODEL;

  private analyzer = new MonitorAnalyzerAgent();

  async test(input: MonitorTestInput): Promise<MonitorTestResult> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_GEMINI_API_KEY environment variable is not set"
      );
    }

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const data = await withRetry(
      async () => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2000,
            },
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Gemini API error ${res.status}: ${errorText}`);
        }

        return (await res.json()) as GeminiResponse;
      },
      { maxRetries: 3, baseDelayMs: 2000 }
    );

    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    const responseText =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("") || "";

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
      aiModel: "gemini",
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
    };
  }
}
