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
  promptCount?: number; // Defaults to 5, configurable per plan
}

const SYSTEM_PROMPT = `You are a prompt variation generator for AI monitoring. Your job is to create realistic, diverse search queries that someone might type into an AI assistant when looking for products or services related to a keyword.

Rules:
- Each prompt must be semantically equivalent (asking about the same topic) but differently phrased
- Sound like REAL human queries, not SEO templates
- No two prompts should start with the same word
- Mix formality levels (casual, professional, specific, broad)
- One prompt should reference a competitor by name (if competitors provided)
- Include location naturally in about half the prompts (if location provided)
- Return ONLY valid JSON — no explanation, no markdown`;

const PROMPT_TYPES = [
  { type: "recommendation", example: '"What are the best..." / "Can you recommend..."' },
  { type: "comparison", example: '"Compare the top..." / "Which is better..."' },
  { type: "how_to", example: '"How do I find a good..." / "What should I look for..."' },
  { type: "cost", example: '"How much does..." / "Most affordable..."' },
  { type: "review", example: '"Reviews of..." / "What do people say about..."' },
];

function buildUserPrompt(input: GeneratePromptsInput): string {
  const count = input.promptCount || 5;
  const typesToUse = PROMPT_TYPES.slice(0, count);
  const typeList = typesToUse
    .map((t, i) => `${i + 1}. ${t.type} — ${t.example}`)
    .join("\n");
  const jsonExamples = typesToUse
    .map((t) => `    { "text": "...", "type": "${t.type}" }`)
    .join(",\n");

  return `Generate exactly ${count} prompt variations for monitoring this keyword across AI models.

KEYWORD: ${input.keyword}
BRAND (do NOT mention in prompts): ${input.clientName}
INDUSTRY CONTEXT: ${input.brandBrief.substring(0, 300)}
${input.competitors.length > 0 ? `COMPETITORS (reference ONE in one prompt): ${input.competitors.join(", ")}` : ""}
${input.location ? `LOCATION (include naturally in about half the prompts): ${input.location}` : ""}

Generate prompts across these types:
${typeList}

Return JSON:
{
  "prompts": [
${jsonExamples}
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
