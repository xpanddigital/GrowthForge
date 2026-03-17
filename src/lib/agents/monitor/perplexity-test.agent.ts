// Perplexity Test Agent — tests sonar-pro for brand mentions.
// KEY ADVANTAGE: Returns native source citations in the `citations` field,
// making source detection far more reliable than other models.

import { createHash } from "crypto";
import { withRetry } from "@/lib/utils/retry";
import { MonitorAnalyzerAgent } from "./response-analyzer.agent";
import type {
  MonitorTestAgent,
  MonitorTestInput,
  MonitorTestResult,
} from "@/lib/agents/interfaces";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function hashResponse(text: string): string {
  return createHash("sha256").update(normalizeText(text)).digest("hex");
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

export class PerplexityTestAgent implements MonitorTestAgent {
  name = "PerplexityTestAgent";
  model = "sonar-pro";

  private analyzer = new MonitorAnalyzerAgent();

  async test(input: MonitorTestInput): Promise<MonitorTestResult> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY environment variable is not set");
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

    const data = await withRetry(
      async () => {
        const res = await fetch(PERPLEXITY_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            temperature: 0.3,
            max_tokens: 2000,
            messages: [{ role: "user", content: promptText }],
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Perplexity API error ${res.status}: ${errorText}`
          );
        }

        return (await res.json()) as PerplexityResponse;
      },
      { maxRetries: 3, baseDelayMs: 2000 }
    );

    const responseText = data.choices[0]?.message?.content || "";
    const nativeCitations = data.citations || [];
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

    // Extract inline URLs from the response text
    const urlRegex = /https?:\/\/[^\s)>\]]+/g;
    const inlineUrls = responseText.match(urlRegex) || [];

    // Merge native citations with inline URL extraction (deduped)
    const allSourceUrls = Array.from(
      new Set([...nativeCitations, ...inlineUrls])
    );

    // Check if any native citations point to client's domain
    const brandSourceUrls = allSourceUrls.filter((url) =>
      input.clientUrls.some((clientUrl) => {
        try {
          const citedDomain = new URL(url).hostname.replace("www.", "");
          const clientDomain = new URL(clientUrl).hostname.replace(
            "www.",
            ""
          );
          return citedDomain === clientDomain;
        } catch {
          return false;
        }
      })
    );

    // Merge brand source URLs from analysis + native citations
    const mergedBrandUrls = Array.from(
      new Set([...analysis.brandSourceUrls, ...brandSourceUrls])
    );

    return {
      aiModel: "perplexity",
      fullResponse: responseText,
      responseHash,
      brandMentioned: analysis.brandMentioned || mergedBrandUrls.length > 0,
      brandRecommended: analysis.brandRecommended,
      brandLinked: analysis.brandLinked || mergedBrandUrls.length > 0,
      brandSourceUrls: mergedBrandUrls,
      mentionContext: analysis.mentionContext,
      mentionPosition: analysis.mentionPosition,
      prominenceScore: analysis.prominenceScore,
      sentiment: analysis.sentiment,
      sourcesCited: allSourceUrls,
      competitorDetails: analysis.competitorDetails,
      metadata: {
        native_citations_count: nativeCitations.length,
        native_citations: nativeCitations,
      },
    };
  }
}
