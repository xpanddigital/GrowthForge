// Prompt Fan-Out Generator — generates prompt variations from a keyword + client context.
// Uses Claude Sonnet with temperature 0.7 (higher for variation).
//
// For each keyword, generates 5 variations across:
// 1. Question type: recommendation, comparison, how-to, cost, review
// 2. Phrasing style: formal, casual, specific, broad
// 3. Location inclusion: ~60% with location qualifier, ~40% without
// 4. Competitor references: 1 prompt per keyword mentioning a known competitor

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

export interface PromptVariation {
  text: string;
  type: string;
  last_used_at: string | null;
}

interface GeneratePromptsInput {
  keyword: string;
  clientName: string;
  brandBrief: string;
  competitors: string[];
  location?: string;
}

const SYSTEM_PROMPT = `You are a prompt variation generator for AI monitoring. Your job is to create realistic, diverse search queries that someone might type into an AI assistant when looking for products or services related to a keyword.

Rules:
- Each prompt must be semantically equivalent (asking about the same topic) but differently phrased
- Sound like REAL human queries, not SEO templates
- No two prompts should start with the same word
- Mix formality levels (casual, professional, specific, broad)
- One prompt should reference a competitor by name (if competitors provided)
- Include location naturally in ~3 out of 5 prompts (if location provided)
- Return ONLY valid JSON — no explanation, no markdown`;

function buildUserPrompt(input: GeneratePromptsInput): string {
  return `Generate exactly 5 prompt variations for monitoring this keyword across AI models.

KEYWORD: ${input.keyword}
BRAND (do NOT mention in prompts): ${input.clientName}
INDUSTRY CONTEXT: ${input.brandBrief.substring(0, 300)}
${input.competitors.length > 0 ? `COMPETITORS (reference ONE in one prompt): ${input.competitors.join(", ")}` : ""}
${input.location ? `LOCATION (include naturally in ~3 prompts): ${input.location}` : ""}

Generate prompts across these types:
1. recommendation — "What are the best..." / "Can you recommend..."
2. comparison — "Compare the top..." / "Which is better..."
3. how_to — "How do I find a good..." / "What should I look for..."
4. cost — "How much does..." / "Most affordable..."
5. review — "Reviews of..." / "What do people say about..."

Return JSON:
{
  "prompts": [
    { "text": "the full prompt query", "type": "recommendation" },
    { "text": "...", "type": "comparison" },
    { "text": "...", "type": "how_to" },
    { "text": "...", "type": "cost" },
    { "text": "...", "type": "review" }
  ]
}`;
}

export async function generatePromptVariations(
  input: GeneratePromptsInput
): Promise<PromptVariation[]> {
  const result = await callSonnet(buildUserPrompt(input), {
    systemPrompt: SYSTEM_PROMPT,
    temperature: 0.7, // Higher for variation
    maxTokens: 1500,
  });

  const parsed = parseClaudeJson<{
    prompts: Array<{ text: string; type: string }>;
  }>(result.text);

  return parsed.prompts.map((p) => ({
    text: p.text,
    type: p.type,
    last_used_at: null,
  }));
}
