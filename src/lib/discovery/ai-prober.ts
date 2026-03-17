import OpenAI from "openai";
import type { DiscoveredThread } from "@/lib/agents/interfaces";
import type { Platform } from "@/types/enums";
import { withRetry } from "@/lib/utils/retry";
import { AIGenerationError, RateLimitError } from "@/lib/utils/errors";
import { rateLimit } from "@/lib/utils/rate-limit";
import { detectPlatform } from "@/lib/apify/parsers";

// ============================================
// Configuration
// ============================================

/** Perplexity API uses the OpenAI-compatible chat completions endpoint */
const PERPLEXITY_BASE_URL = "https://api.perplexity.ai";
const PERPLEXITY_MODEL = "sonar-pro";

const OPENAI_MODEL = "gpt-4o";

/** Max keywords to probe per run (top 20 as per spec) */
const MAX_KEYWORDS_TO_PROBE = 20;

/** Rate limit: 20 requests/minute for Perplexity */
const PERPLEXITY_RATE_LIMIT = { maxRequests: 20, windowMs: 60_000 };

/** Templates for generating buying-intent questions from keywords */
const BUYING_INTENT_TEMPLATES = [
  "What are the best {keyword} options?",
  "Can anyone recommend a good {keyword} service?",
  "I need help with {keyword} — what do people suggest?",
];

// ============================================
// Client Singletons
// ============================================

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
      baseURL: PERPLEXITY_BASE_URL,
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

// ============================================
// Main Entry Point
// ============================================

interface ProbeInput {
  id: string;
  keyword: string;
}

interface ProbeResult {
  threads: DiscoveredThread[];
  stats: {
    keywordsProbed: number;
    perplexityQueries: number;
    openaiQueries: number;
    totalUrlsFound: number;
    totalThreadsFound: number;
    durationMs: number;
  };
  errors: Array<{
    source: string;
    keyword: string;
    error: string;
  }>;
}

/**
 * Probes AI models (Perplexity + OpenAI) with buying-intent questions
 * derived from the client's keywords. Extracts Reddit, Quora, and
 * Facebook Group URLs from the AI responses.
 *
 * This discovers threads that AI models already reference — making them
 * high-value targets for citation seeding.
 *
 * NOTE: This is NOT about checking if the client's brand is mentioned.
 * That is the AI Monitor module. This discovers THREADS to seed INTO.
 *
 * @param keywords - Array of keywords with IDs (top 20 used)
 * @param brandBrief - Client's brand brief for context (used to craft better prompts)
 * @returns Discovered threads with AI probe metadata
 */
export async function probeAIModels(
  keywords: ProbeInput[],
  _brandBrief: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<ProbeResult> {
  const startTime = Date.now();
  const allThreads: DiscoveredThread[] = [];
  const errors: Array<{ source: string; keyword: string; error: string }> = [];

  // Limit to top 20 keywords
  const keywordsToProbe = keywords.slice(0, MAX_KEYWORDS_TO_PROBE);

  let perplexityQueries = 0;
  let openaiQueries = 0;

  // Generate buying-intent questions for each keyword
  const questionsPerKeyword = keywordsToProbe.map((kw) => ({
    keyword: kw,
    questions: generateBuyingIntentQuestions(kw.keyword),
  }));

  // Probe each keyword with each AI model
  for (const { keyword, questions } of questionsPerKeyword) {
    // Pick one question per keyword per model to stay within rate limits
    const question = questions[0]; // Primary question format

    // Probe Perplexity (primary — returns source URLs natively)
    try {
      rateLimit("perplexity-probe", PERPLEXITY_RATE_LIMIT);
      const perplexityThreads = await probePerplexity(
        question,
        keyword.id,
        keyword.keyword
      );
      allThreads.push(...perplexityThreads);
      perplexityQueries++;
    } catch (error) {
      if (error instanceof RateLimitError) {
        // Wait for rate limit to reset, then skip this keyword for Perplexity
        console.warn(
          `[AI Prober] Perplexity rate limited for keyword: ${keyword.keyword}`
        );
      }
      const message = error instanceof Error ? error.message : String(error);
      errors.push({
        source: "perplexity",
        keyword: keyword.keyword,
        error: message,
      });
    }

    // Probe OpenAI (secondary — for ChatGPT citation detection)
    try {
      const openaiThreads = await probeOpenAI(
        question,
        keyword.id,
        keyword.keyword
      );
      allThreads.push(...openaiThreads);
      openaiQueries++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({
        source: "openai",
        keyword: keyword.keyword,
        error: message,
      });
    }
  }

  // Deduplicate threads by URL
  const dedupedThreads = deduplicateProbeResults(allThreads);

  return {
    threads: dedupedThreads,
    stats: {
      keywordsProbed: keywordsToProbe.length,
      perplexityQueries,
      openaiQueries,
      totalUrlsFound: allThreads.length,
      totalThreadsFound: dedupedThreads.length,
      durationMs: Date.now() - startTime,
    },
    errors,
  };
}

// ============================================
// Perplexity Probing
// ============================================

/**
 * Probes Perplexity's sonar-pro model with a buying-intent question.
 * Perplexity natively returns source URLs in its responses, making it
 * ideal for discovering which threads AI models reference.
 */
async function probePerplexity(
  question: string,
  keywordId: string,
  keyword: string
): Promise<DiscoveredThread[]> {
  return withRetry(
    async () => {
      const client = getPerplexityClient();

      const response = await client.chat.completions.create({
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful research assistant. When answering questions about products, services, or recommendations, always cite your sources with full URLs. Include links to relevant Reddit threads, Quora answers, and forum discussions where you found information.",
          },
          {
            role: "user",
            content: question,
          },
        ],
        max_tokens: 2000,
      });

      const content = response.choices?.[0]?.message?.content ?? "";

      // Extract URLs from the response text
      const urls = extractUrls(content);

      // Also check for citations in the response metadata
      // Perplexity returns citations in the response object
      const citations = extractPerplexityCitations(response);
      const allUrls = Array.from(new Set([...urls, ...citations]));

      // Filter to only platform-specific thread URLs
      return urlsToDiscoveredThreads(
        allUrls,
        keyword,
        keywordId,
        "ai_probe_perplexity",
        question
      );
    },
    {
      maxRetries: 2,
      baseDelayMs: 2000,
      maxDelayMs: 15000,
    }
  );
}

// ============================================
// OpenAI Probing
// ============================================

/**
 * Probes OpenAI's GPT-4o with a buying-intent question.
 * ChatGPT doesn't natively return source URLs like Perplexity,
 * but it does sometimes mention Reddit/Quora threads and
 * include URLs when asked for sources.
 */
async function probeOpenAI(
  question: string,
  keywordId: string,
  keyword: string
): Promise<DiscoveredThread[]> {
  return withRetry(
    async () => {
      const client = getOpenAIClient();

      const response = await client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful research assistant. When making recommendations, reference specific Reddit threads, Quora answers, or forum discussions that support your suggestions. Include full URLs to those sources when possible.",
          },
          {
            role: "user",
            content: `${question}\n\nPlease include links to relevant Reddit threads, Quora answers, or other community discussions that discuss this topic.`,
          },
        ],
        max_tokens: 2000,
      });

      const content = response.choices?.[0]?.message?.content ?? "";

      // Extract URLs from the response text
      const urls = extractUrls(content);

      // Filter to only platform-specific thread URLs
      return urlsToDiscoveredThreads(
        urls,
        keyword,
        keywordId,
        "ai_probe_chatgpt",
        question
      );
    },
    {
      maxRetries: 2,
      baseDelayMs: 2000,
      maxDelayMs: 15000,
    }
  );
}

// ============================================
// URL Extraction Helpers
// ============================================

/**
 * Extracts all URLs from a text string using a regex pattern.
 * Handles URLs in markdown links, plain text, and parenthetical references.
 */
function extractUrls(text: string): string[] {
  if (!text) return [];

  const urls: string[] = [];

  // Match markdown links: [text](url)
  const markdownPattern = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi;
  let match;
  while ((match = markdownPattern.exec(text)) !== null) {
    if (match[2]) urls.push(match[2]);
  }

  // Match plain URLs (not already captured in markdown)
  const plainUrlPattern =
    /(?<!\()(https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*)/gi;
  while ((match = plainUrlPattern.exec(text)) !== null) {
    if (match[1] && !urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }

  // Clean up URLs: remove trailing punctuation that might have been captured
  return urls.map((url) => url.replace(/[.,;:!?)]+$/, "")).filter(Boolean);
}

/**
 * Extracts citation URLs from Perplexity's response object.
 * Perplexity includes citations in a custom field of the response.
 */
function extractPerplexityCitations(
  response: OpenAI.Chat.Completions.ChatCompletion
): string[] {
  const citations: string[] = [];

  // Perplexity adds citations to the response object as a custom field
  // The exact field name may vary; check common locations
  const responseAny = response as unknown as Record<string, unknown>;

  // Check for citations array at the top level
  if (Array.isArray(responseAny.citations)) {
    for (const citation of responseAny.citations) {
      if (typeof citation === "string") {
        citations.push(citation);
      } else if (citation && typeof citation === "object" && "url" in citation) {
        const citationObj = citation as { url: string };
        if (typeof citationObj.url === "string") {
          citations.push(citationObj.url);
        }
      }
    }
  }

  // Check for citations in the first choice's message
  const firstChoice = response.choices?.[0];
  if (firstChoice) {
    const messageAny = firstChoice.message as unknown as Record<string, unknown>;
    if (Array.isArray(messageAny?.citations)) {
      for (const citation of messageAny.citations) {
        if (typeof citation === "string") {
          citations.push(citation);
        }
      }
    }

    // Some Perplexity responses include sources in context field
    if (Array.isArray(messageAny?.context)) {
      for (const ctx of messageAny.context) {
        if (ctx && typeof ctx === "object" && "url" in ctx) {
          const ctxObj = ctx as { url: string };
          if (typeof ctxObj.url === "string") {
            citations.push(ctxObj.url);
          }
        }
      }
    }
  }

  return citations;
}

/**
 * Converts a list of raw URLs into DiscoveredThread objects.
 * Only includes URLs from supported platforms (Reddit, Quora, Facebook Groups).
 */
function urlsToDiscoveredThreads(
  urls: string[],
  keyword: string,
  keywordId: string,
  discoveredVia: string,
  aiQuery: string
): DiscoveredThread[] {
  const threads: DiscoveredThread[] = [];
  const seenUrls = new Set<string>();

  for (const url of urls) {
    const platform = detectPlatform(url);
    if (!platform) continue;

    // Normalize for dedup within this result set
    const normalized = url.toLowerCase().replace(/\/+$/, "");
    if (seenUrls.has(normalized)) continue;
    seenUrls.add(normalized);

    // Extract a title from the URL (best effort)
    const title = extractTitleFromUrl(url, platform);

    threads.push({
      url,
      title,
      snippet: `Discovered via ${discoveredVia} for query: "${aiQuery}"`,
      platform,
      keyword,
      keywordId,
    });
  }

  return threads;
}

// ============================================
// Question Generation
// ============================================

/**
 * Generates buying-intent questions from a keyword.
 * These questions simulate what a real user would ask an AI model
 * when looking for products/services in the keyword's category.
 */
function generateBuyingIntentQuestions(keyword: string): string[] {
  return BUYING_INTENT_TEMPLATES.map((template) =>
    template.replace("{keyword}", keyword)
  );
}

// ============================================
// Utility Functions
// ============================================

/**
 * Extracts a rough title from a URL for display purposes.
 * The actual title will be populated during enrichment.
 */
function extractTitleFromUrl(url: string, platform: Platform): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname
      .split("/")
      .filter((p) => p.length > 0);

    switch (platform) {
      case "reddit": {
        // Reddit URLs: /r/{subreddit}/comments/{id}/{slug}
        const slug = pathParts[pathParts.length - 1];
        if (slug) {
          return slug
            .replace(/_/g, " ")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return `Reddit thread in ${pathParts[1] || "unknown subreddit"}`;
      }
      case "quora": {
        // Quora URLs: /{question-slug}
        const slug = pathParts[pathParts.length - 1];
        if (slug) {
          return slug
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return "Quora question";
      }
      case "facebook_groups": {
        const groupName = pathParts[1];
        return `Facebook Group post in ${groupName || "unknown group"}`;
      }
      default:
        return url;
    }
  } catch {
    return url;
  }
}

/**
 * Deduplicates probe results by URL, keeping the first occurrence
 * (which preserves the original source attribution).
 */
function deduplicateProbeResults(threads: DiscoveredThread[]): DiscoveredThread[] {
  const seen = new Map<string, DiscoveredThread>();

  for (const thread of threads) {
    const normalized = thread.url.toLowerCase().replace(/\/+$/, "");
    if (!seen.has(normalized)) {
      seen.set(normalized, thread);
    }
  }

  return Array.from(seen.values());
}
