// Auto-extract competitor brand names from AI monitor scan responses.
// Uses a single Claude Sonnet call with all responses batched.
// Called as a post-scan step in run-monitoring.ts.

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

interface ExtractedCompetitor {
  name: string;
  mentionCount: number;
}

interface ExtractionResult {
  competitors: Array<{ name: string; count: number }>;
}

const SYSTEM_PROMPT = `You extract brand, company, product, and service names from AI model responses.

RULES:
- Return ONLY proper nouns that are real companies, products, brands, or services.
- DO NOT return generic terms like "social media marketing", "SEO tools", "AI platforms", etc.
- DO NOT return technology names like "Python", "React", "WordPress" unless they are the product being recommended.
- DO NOT return the client's brand name or any of its aliases.
- Normalize names to their most common form (e.g., "DistroKid" not "Distro Kid" or "distrokid").
- If the same brand appears multiple times across responses, count each response it appears in (not each mention within a response).
- Return valid JSON only, no markdown.`;

/**
 * Extract all competitor brand names from a batch of AI responses.
 * Uses a single Claude Sonnet call to keep costs minimal (~$0.05).
 */
export async function extractCompetitorsFromResponses(
  responses: string[],
  clientName: string,
  clientAliases: string[],
  existingCompetitors: string[]
): Promise<ExtractedCompetitor[]> {
  if (responses.length === 0) return [];

  // Truncate individual responses if total is too large
  const MAX_TOTAL_CHARS = 100_000;
  const MAX_PER_RESPONSE = 1500;

  let totalChars = responses.reduce((sum, r) => sum + r.length, 0);
  let processedResponses = responses;

  if (totalChars > MAX_TOTAL_CHARS) {
    processedResponses = responses.map((r) =>
      r.length > MAX_PER_RESPONSE ? r.substring(0, MAX_PER_RESPONSE) : r
    );
    totalChars = processedResponses.reduce((sum, r) => sum + r.length, 0);
  }

  // Build the prompt with all responses
  const excludeList = [clientName, ...clientAliases].filter(Boolean);
  const existingList =
    existingCompetitors.length > 0
      ? `\nAlready known competitors (still include these in your output with counts): ${existingCompetitors.join(", ")}`
      : "";

  const responsesText = processedResponses
    .map((r, i) => `---RESPONSE ${i + 1}---\n${r}`)
    .join("\n\n");

  const userPrompt = `Extract ALL brand, company, product, and service names mentioned in these ${responses.length} AI model responses.

Exclude the client brand: "${clientName}"${excludeList.length > 1 ? ` (aliases: ${excludeList.slice(1).join(", ")})` : ""}${existingList}

For each brand found, count how many DIFFERENT responses mention it (not total mentions within a single response).

${responsesText}

Return JSON:
{"competitors": [{"name": "BrandName", "count": 5}, {"name": "OtherBrand", "count": 3}]}

Sort by count descending. Include every brand mentioned in at least 2 responses.`;

  try {
    const result = await callSonnet(userPrompt, {
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 2000,
      temperature: 0,
    });

    const parsed = parseClaudeJson<ExtractionResult>(result.text);

    if (!parsed.competitors || !Array.isArray(parsed.competitors)) {
      return [];
    }

    // Filter out the client's own brand (safety check)
    const clientLower = clientName.toLowerCase();
    const aliasesLower = clientAliases.map((a) => a.toLowerCase());

    return parsed.competitors
      .filter((c) => {
        const nameLower = c.name.toLowerCase();
        return (
          nameLower !== clientLower &&
          !aliasesLower.includes(nameLower) &&
          c.name.trim().length > 0
        );
      })
      .map((c) => ({
        name: c.name.trim(),
        mentionCount: c.count || 1,
      }));
  } catch (error) {
    console.error(
      "[extract-competitors] Failed to extract competitors:",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}
