// Google AI Overviews Test Agent — searches Google for the prompt text and checks
// whether an AI Overview appears, what it says, and what sources it cites.
// Uses SerpApi (serpapi.com) to fetch structured AI Overview data.
//
// This agent directly connects Citation Engine seeding to Google visibility.
// When AIO references include a Reddit thread we've seeded, that's proof.

import { createHash } from "crypto";
import { withRetry } from "@/lib/utils/retry";
import { MonitorAnalyzerAgent } from "./response-analyzer.agent";
import type {
  MonitorTestAgent,
  MonitorTestInput,
  MonitorTestResult,
} from "@/lib/agents/interfaces";

const SERPAPI_BASE_URL = "https://serpapi.com/search";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function hashResponse(text: string): string {
  return createHash("sha256").update(normalizeText(text)).digest("hex");
}

interface SerpApiTextBlock {
  type: string; // paragraph, heading, list, table
  snippet?: string;
  items?: Array<{ snippet: string }>;
  rows?: Array<{ values: string[] }>;
}

interface SerpApiReference {
  title?: string;
  link?: string;
  source?: string;
}

interface SerpApiResponse {
  ai_overview?: {
    text_blocks?: SerpApiTextBlock[];
    references?: SerpApiReference[];
    page_token?: string;
  };
  error?: string;
}

function extractTextFromBlocks(blocks: SerpApiTextBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return block.snippet || "";
        case "heading":
          return `## ${block.snippet || ""}`;
        case "list":
          return (
            block.items?.map((item) => `- ${item.snippet}`).join("\n") ||
            ""
          );
        case "table":
          return (
            block.rows
              ?.map((row) => row.values.join(" | "))
              .join("\n") || ""
          );
        default:
          return block.snippet || "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

export class AIOTestAgent implements MonitorTestAgent {
  name = "AIOTestAgent";
  model = "google_ai_overview";

  private analyzer = new MonitorAnalyzerAgent();

  async test(input: MonitorTestInput): Promise<MonitorTestResult> {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      throw new Error("SERPAPI_API_KEY environment variable is not set");
    }

    // Build SerpApi query params — location handled via API params, not prompt text
    const params = new URLSearchParams({
      engine: "google",
      q: input.promptText,
      api_key: apiKey,
      gl: input.location?.countryCode || "us",
      hl: "en",
    });

    if (input.location?.locationString) {
      params.set("location", input.location.locationString);
    }

    // Step 1: Search Google
    const searchResult = await withRetry(
      async () => {
        const res = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`SerpApi error ${res.status}: ${errorText}`);
        }
        return (await res.json()) as SerpApiResponse;
      },
      { maxRetries: 2, baseDelayMs: 2000 }
    );

    if (searchResult.error) {
      throw new Error(`SerpApi error: ${searchResult.error}`);
    }

    // Step 2: Check if AI Overview exists
    if (!searchResult.ai_overview) {
      // No AI Overview for this query
      return {
        aiModel: "google_ai_overview",
        fullResponse: "",
        responseHash: hashResponse(""),
        brandMentioned: false,
        brandRecommended: false,
        brandLinked: false,
        brandSourceUrls: [],
        mentionContext: null,
        mentionPosition: null,
        prominenceScore: 0,
        sentiment: null,
        sourcesCited: [],
        competitorDetails: input.competitors.map((c) => ({
          name: c.name,
          mentioned: false,
          recommended: false,
          sentiment: null,
          context: null,
        })),
        metadata: { aio_present: false },
      };
    }

    // Step 3: If page_token exists, make follow-up request (token expires within 1 min)
    let aioData = searchResult.ai_overview;
    if (aioData.page_token) {
      try {
        const followUpParams = new URLSearchParams({
          engine: "google_ai_overview",
          page_token: aioData.page_token,
          api_key: apiKey,
        });

        // 1-second delay before follow-up
        await new Promise((r) => setTimeout(r, 1000));

        const followUpRes = await fetch(
          `${SERPAPI_BASE_URL}?${followUpParams.toString()}`
        );
        if (followUpRes.ok) {
          const followUp = (await followUpRes.json()) as SerpApiResponse;
          if (followUp.ai_overview) {
            aioData = followUp.ai_overview;
          }
        }
      } catch {
        // Use partial data from initial response if follow-up fails
      }
    }

    // Step 4: Extract text and references
    const aioText = extractTextFromBlocks(aioData.text_blocks || []);
    const references = aioData.references || [];
    const referenceUrls = references
      .map((r) => r.link)
      .filter((link): link is string => !!link);

    const responseHash = hashResponse(aioText);

    // Step 5: Analyze with MonitorAnalyzerAgent
    const analysis = await this.analyzer.analyze({
      response: aioText,
      clientName: input.clientName,
      clientAliases: input.clientAliases || [],
      clientUrls: input.clientUrls,
      competitors: input.competitors.map((c) => ({
        name: c.name,
        aliases: c.aliases,
      })),
    });

    // Step 6: Check if any AIO references are from client's domain
    const brandSourceUrls = referenceUrls.filter((url) =>
      input.clientUrls.some((clientUrl) => {
        try {
          const refDomain = new URL(url).hostname.replace("www.", "");
          const clientDomain = new URL(clientUrl).hostname.replace(
            "www.",
            ""
          );
          return refDomain === clientDomain;
        } catch {
          return false;
        }
      })
    );

    // Step 7: Check if any references are forum threads (Citation Engine intel)
    const forumUrls = referenceUrls.filter(
      (url) =>
        url.includes("reddit.com/r/") ||
        url.includes("quora.com/") ||
        url.includes("facebook.com/groups/")
    );

    const mergedBrandUrls = Array.from(
      new Set([...analysis.brandSourceUrls, ...brandSourceUrls])
    );

    return {
      aiModel: "google_ai_overview",
      fullResponse: aioText,
      responseHash,
      brandMentioned: analysis.brandMentioned || mergedBrandUrls.length > 0,
      brandRecommended: analysis.brandRecommended,
      brandLinked: analysis.brandLinked || mergedBrandUrls.length > 0,
      brandSourceUrls: mergedBrandUrls,
      mentionContext: analysis.mentionContext,
      mentionPosition: analysis.mentionPosition,
      prominenceScore: analysis.prominenceScore,
      sentiment: analysis.sentiment,
      sourcesCited: referenceUrls,
      competitorDetails: analysis.competitorDetails,
      metadata: {
        aio_present: true,
        reference_count: references.length,
        forum_urls: forumUrls,
        forum_url_count: forumUrls.length,
        had_page_token: !!searchResult.ai_overview?.page_token,
      },
    };
  }
}
