// =============================================================================
// Journalist Query Matcher
// Monitors journalist query feeds (Source of Sources, #JournoRequest) and
// matches them against client expertise using Claude Sonnet.
// For high-relevance matches, auto-drafts expert responses using the
// spokesperson voice model from PressForge.
// =============================================================================

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface JournalistQuery {
  queryText: string;
  source: "source_of_sources" | "journorequest" | "featured" | "qwoted" | "manual";
  journalistName: string | null;
  publication: string | null;
  deadline: string | null;
}

export interface MatchedQuery {
  query: JournalistQuery;
  relevanceScore: number;
  matchReason: string;
  draftResponse: string | null;
}

export interface QueryMatchResult {
  totalQueries: number;
  matchedQueries: MatchedQuery[];
  highRelevanceCount: number;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const SERPAPI_URL = "https://serpapi.com/search.json";
const RELEVANCE_THRESHOLD = 70;

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function scanJournalistQueries(
  brandName: string,
  brandBrief: string,
  spokespersonName: string | null,
  spokespersonTitle: string | null,
  voiceProfile: string | null,
  keywords: string[]
): Promise<QueryMatchResult> {
  // Step 1: Discover journalist queries from available sources
  const queries = await discoverQueries(keywords.slice(0, 5));

  if (queries.length === 0) {
    return {
      totalQueries: 0,
      matchedQueries: [],
      highRelevanceCount: 0,
    };
  }

  // Step 2: Score relevance of each query against client expertise
  const matchedQueries = await scoreQueries(
    queries,
    brandName,
    brandBrief,
    keywords
  );

  // Step 3: Draft responses for high-relevance queries
  const highRelevance = matchedQueries.filter(
    (q) => q.relevanceScore >= RELEVANCE_THRESHOLD
  );

  for (const match of highRelevance) {
    try {
      match.draftResponse = await draftResponse(
        match.query,
        brandName,
        brandBrief,
        spokespersonName,
        spokespersonTitle,
        voiceProfile
      );
    } catch {
      // Draft generation is non-fatal
    }
  }

  return {
    totalQueries: queries.length,
    matchedQueries,
    highRelevanceCount: highRelevance.length,
  };
}

// -----------------------------------------------------------------------------
// Query Discovery
// -----------------------------------------------------------------------------

async function discoverQueries(
  keywords: string[]
): Promise<JournalistQuery[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return [];

  const queries: JournalistQuery[] = [];
  const seenTexts = new Set<string>();

  // Search for #JournoRequest tweets via Google
  for (const keyword of keywords.slice(0, 3)) {
    try {
      const params = new URLSearchParams({
        q: `#journorequest ${keyword}`,
        api_key: apiKey,
        engine: "google",
        num: "5",
        tbs: "qdr:w", // Last week
      });

      const response = await fetch(`${SERPAPI_URL}?${params}`);
      if (!response.ok) continue;

      const data = await response.json();
      for (const result of (data.organic_results || []).slice(0, 3)) {
        const text = `${result.title || ""} ${result.snippet || ""}`;
        if (seenTexts.has(text)) continue;
        seenTexts.add(text);

        // Extract journalist name from tweet-like results
        const nameMatch = text.match(
          /(?:@(\w+)|by\s+([A-Z][a-z]+ [A-Z][a-z]+))/
        );

        queries.push({
          queryText: result.snippet || result.title || "",
          source: "journorequest",
          journalistName: nameMatch
            ? nameMatch[1] || nameMatch[2] || null
            : null,
          publication: null,
          deadline: null,
        });
      }
    } catch {
      // Continue on failure
    }

    await sleep(1500);
  }

  // Search for Source of Sources queries
  try {
    const params = new URLSearchParams({
      q: `site:sourceofsources.com ${keywords[0] || ""}`,
      api_key: apiKey,
      engine: "google",
      num: "5",
      tbs: "qdr:m", // Last month
    });

    const response = await fetch(`${SERPAPI_URL}?${params}`);
    if (response.ok) {
      const data = await response.json();
      for (const result of (data.organic_results || []).slice(0, 3)) {
        const text = result.snippet || result.title || "";
        if (seenTexts.has(text)) continue;
        seenTexts.add(text);

        queries.push({
          queryText: text,
          source: "source_of_sources",
          journalistName: null,
          publication: null,
          deadline: null,
        });
      }
    }
  } catch {
    // Continue
  }

  return queries;
}

// -----------------------------------------------------------------------------
// Relevance Scoring
// -----------------------------------------------------------------------------

async function scoreQueries(
  queries: JournalistQuery[],
  brandName: string,
  brandBrief: string,
  keywords: string[]
): Promise<MatchedQuery[]> {
  if (queries.length === 0) return [];

  const queryDescriptions = queries
    .map(
      (q, i) =>
        `Query ${i + 1} [${q.source}]: "${q.queryText}"${q.journalistName ? ` (from ${q.journalistName}${q.publication ? `, ${q.publication}` : ""})` : ""}`
    )
    .join("\n\n");

  const result = await callSonnet(
    `You are a PR matchmaker. Score how relevant each journalist query is to this brand:\n\nBrand: ${brandName}\nBrief: ${brandBrief}\nKeywords: ${keywords.join(", ")}\n\nJournalist Queries:\n${queryDescriptions}\n\nFor each query, rate relevance 0-100 and explain why it matches (or doesn't).\n\nReturn JSON array:\n[\n  { "queryIndex": 0, "relevanceScore": 85, "matchReason": "why this matches the brand expertise" }\n]`,
    { maxTokens: 1536 }
  );

  const scores = parseClaudeJson<
    Array<{ queryIndex: number; relevanceScore: number; matchReason: string }>
  >(result.text);

  return scores.map((score) => ({
    query: queries[score.queryIndex] || queries[0],
    relevanceScore: score.relevanceScore,
    matchReason: score.matchReason,
    draftResponse: null,
  }));
}

// -----------------------------------------------------------------------------
// Response Drafting
// -----------------------------------------------------------------------------

async function draftResponse(
  query: JournalistQuery,
  brandName: string,
  brandBrief: string,
  spokespersonName: string | null,
  spokespersonTitle: string | null,
  voiceProfile: string | null
): Promise<string> {
  const voiceContext = voiceProfile
    ? `Use this voice profile to match the spokesperson's communication style:\n${voiceProfile}\n\n`
    : "";

  const spokesperson = spokespersonName
    ? `${spokespersonName}, ${spokespersonTitle || "spokesperson"} at ${brandName}`
    : `A spokesperson at ${brandName}`;

  const result = await callSonnet(
    `${voiceContext}You are drafting a response to a journalist query on behalf of ${spokesperson}.\n\nBrand: ${brandName}\nBrief: ${brandBrief}\n\nJournalist Query: "${query.queryText}"\n${query.journalistName ? `Journalist: ${query.journalistName}` : ""}\n${query.publication ? `Publication: ${query.publication}` : ""}\n\nDraft a concise expert response (150-250 words) that:\n1. Directly addresses the journalist's question\n2. Positions ${brandName} as a credible expert\n3. Includes a specific quote attribution to ${spokesperson}\n4. Provides actionable insights, not marketing fluff\n5. Mentions ${brandName} naturally (not in the first sentence)\n\nReturn just the response text, ready to submit.`,
    { maxTokens: 1024 }
  );

  return result.text;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
