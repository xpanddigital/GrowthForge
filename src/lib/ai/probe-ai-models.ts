// AI model probing for citation detection.
// Used by the AI prober discovery agent to find threads that AI models
// already reference, so we can place the client's brand IN those threads.
//
// Uses the openai npm package for both Perplexity (OpenAI-compatible API)
// and OpenAI (gpt-4o).

import OpenAI from "openai";
import { withRetry } from "@/lib/utils/retry";
import { AIGenerationError } from "@/lib/utils/errors";

// Platform URL patterns for extracting thread URLs from AI responses
const PLATFORM_URL_PATTERNS: Record<string, RegExp> = {
  reddit: /https?:\/\/(?:www\.)?(?:old\.)?reddit\.com\/r\/[^\s)\],"']+/g,
  quora: /https?:\/\/(?:www\.)?quora\.com\/[^\s)\],"']+/g,
  facebook_groups:
    /https?:\/\/(?:www\.)?facebook\.com\/groups\/[^\s)\],"']+/g,
};

export interface ProbeResult {
  query: string;
  model: string;
  responseText: string;
  extractedUrls: Array<{
    url: string;
    platform: "reddit" | "quora" | "facebook_groups";
  }>;
  sourcesFromApi: string[]; // URLs returned natively by the API (Perplexity)
}

/**
 * Extract Reddit, Quora, and Facebook Group URLs from a text response.
 */
function extractPlatformUrls(
  text: string
): Array<{ url: string; platform: "reddit" | "quora" | "facebook_groups" }> {
  const results: Array<{
    url: string;
    platform: "reddit" | "quora" | "facebook_groups";
  }> = [];
  const seenUrls = new Set<string>();

  for (const [platform, pattern] of Object.entries(PLATFORM_URL_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches) {
      for (const url of matches) {
        // Clean up trailing punctuation that might have been captured
        const cleanUrl = url.replace(/[.,;:!?)>\]]+$/, "");

        if (!seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          results.push({
            url: cleanUrl,
            platform: platform as "reddit" | "quora" | "facebook_groups",
          });
        }
      }
    }
  }

  return results;
}

// Singleton clients — initialized on first use
let _perplexityClient: OpenAI | null = null;
let _openaiClient: OpenAI | null = null;

function getPerplexityClient(): OpenAI {
  if (!_perplexityClient) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new AIGenerationError(
        "perplexity",
        "PERPLEXITY_API_KEY environment variable is not set"
      );
    }
    _perplexityClient = new OpenAI({
      apiKey,
      baseURL: "https://api.perplexity.ai",
    });
  }
  return _perplexityClient;
}

function getOpenAIClient(): OpenAI {
  if (!_openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AIGenerationError(
        "openai",
        "OPENAI_API_KEY environment variable is not set"
      );
    }
    _openaiClient = new OpenAI({ apiKey });
  }
  return _openaiClient;
}

/**
 * Probe Perplexity API (sonar-pro model) with a query.
 * Perplexity is ideal for citation detection because it returns source URLs natively.
 *
 * @param query - The buying-intent question to ask
 * @returns ProbeResult with response text, extracted platform URLs, and API-provided sources
 */
export async function probePerplexity(query: string): Promise<ProbeResult> {
  return withRetry(
    async () => {
      try {
        const client = getPerplexityClient();

        const response = await client.chat.completions.create({
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful research assistant. When answering questions, provide specific recommendations and include links to relevant discussions on Reddit, Quora, and other forums where people discuss these topics. Cite your sources.",
            },
            {
              role: "user",
              content: query,
            },
          ],
          max_tokens: 2048,
          temperature: 0.5,
        });

        const content = response.choices[0]?.message?.content || "";

        // Extract source URLs from Perplexity's response.
        // Perplexity returns citations in the response object.
        // The OpenAI-compatible API may include them in different ways.
        const sourcesFromApi: string[] = [];

        // Check for citations in the response (Perplexity-specific field)
        const rawResponse = response as unknown as Record<string, unknown>;
        if (rawResponse.citations && Array.isArray(rawResponse.citations)) {
          for (const citation of rawResponse.citations) {
            if (typeof citation === "string") {
              sourcesFromApi.push(citation);
            } else if (
              citation &&
              typeof citation === "object" &&
              "url" in (citation as Record<string, unknown>)
            ) {
              sourcesFromApi.push(
                String((citation as Record<string, unknown>).url)
              );
            }
          }
        }

        // Also extract platform URLs from the response text itself
        const extractedUrls = extractPlatformUrls(content);

        // Add any platform-relevant URLs from the API sources
        for (const sourceUrl of sourcesFromApi) {
          const platformUrls = extractPlatformUrls(sourceUrl);
          for (const pUrl of platformUrls) {
            if (!extractedUrls.some((e) => e.url === pUrl.url)) {
              extractedUrls.push(pUrl);
            }
          }
        }

        return {
          query,
          model: "perplexity-sonar-pro",
          responseText: content,
          extractedUrls,
          sourcesFromApi,
        };
      } catch (error) {
        if (error instanceof AIGenerationError) throw error;

        const message =
          error instanceof Error ? error.message : "Unknown error";
        throw new AIGenerationError("perplexity", message, {
          query,
          retryable: true,
        });
      }
    },
    {
      maxRetries: 2,
      baseDelayMs: 2000,
      maxDelayMs: 15000,
    }
  );
}

/**
 * Probe OpenAI API (gpt-4o) with a query.
 * Used as a secondary source for citation detection.
 * OpenAI doesn't return source URLs natively, so we extract from the response text.
 *
 * @param query - The buying-intent question to ask
 * @returns ProbeResult with response text and extracted platform URLs
 */
export async function probeOpenAI(query: string): Promise<ProbeResult> {
  return withRetry(
    async () => {
      try {
        const client = getOpenAIClient();

        const response = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant. When recommending products or services, reference specific discussions on Reddit, Quora, and other community forums where real users share their experiences. Include links when possible.",
            },
            {
              role: "user",
              content: query,
            },
          ],
          max_tokens: 2048,
          temperature: 0.5,
        });

        const content = response.choices[0]?.message?.content || "";

        // Extract platform URLs from the response text
        const extractedUrls = extractPlatformUrls(content);

        return {
          query,
          model: "gpt-4o",
          responseText: content,
          extractedUrls,
          sourcesFromApi: [], // OpenAI doesn't return sources natively
        };
      } catch (error) {
        if (error instanceof AIGenerationError) throw error;

        const message =
          error instanceof Error ? error.message : "Unknown error";
        throw new AIGenerationError("openai", message, {
          query,
          retryable: true,
        });
      }
    },
    {
      maxRetries: 2,
      baseDelayMs: 2000,
      maxDelayMs: 15000,
    }
  );
}

/**
 * Generate buying-intent questions from a keyword for AI probing.
 * These questions are designed to elicit recommendations that cite forum threads.
 */
export function generateProbeQueries(keyword: string): string[] {
  return [
    `What are the best ${keyword} options?`,
    `Can anyone recommend a good ${keyword} service?`,
    `I need help with ${keyword} -- what do people suggest?`,
    `Compare the top ${keyword} companies`,
    `What are Reddit users saying about ${keyword}?`,
  ];
}

/**
 * Probe both Perplexity and OpenAI for a single keyword.
 * Generates probe queries and runs them against both models.
 * Returns all results from both models combined.
 *
 * @param keyword - The keyword to probe AI models about
 * @returns Array of ProbeResults from all queries across all models
 */
export async function probeAllModels(
  keyword: string
): Promise<ProbeResult[]> {
  const queries = generateProbeQueries(keyword);
  const results: ProbeResult[] = [];

  // Run queries sequentially to respect rate limits
  for (const query of queries) {
    // Run Perplexity and OpenAI in parallel for each query
    const [perplexityResult, openaiResult] = await Promise.allSettled([
      probePerplexity(query),
      probeOpenAI(query),
    ]);

    if (perplexityResult.status === "fulfilled") {
      results.push(perplexityResult.value);
    }

    if (openaiResult.status === "fulfilled") {
      results.push(openaiResult.value);
    }
  }

  return results;
}
