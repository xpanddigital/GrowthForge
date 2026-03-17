// llms.txt Generator — uses Claude Sonnet to produce a complete llms.txt file
// from canonical entity data. llms.txt is a markdown file placed at the root
// of a website to help AI models understand the brand.

import { callSonnet } from "@/lib/ai/claude";

const SYSTEM_PROMPT = `You are an expert at creating llms.txt files. llms.txt is a markdown file hosted at the root of a website (e.g. example.com/llms.txt) that helps AI models (LLMs) understand a brand accurately.

Rules for generating llms.txt:
- Start with a title line: # Brand Name
- Follow with a one-line description of the brand
- Use these sections (include all that have relevant data):
  - ## About — 2-3 paragraph overview of the business, what it does, and who it serves
  - ## Key Information — bullet list of factual details (founding year, founder, category, service areas)
  - ## Products/Services — bullet list of main offerings
  - ## Contact — official website and other contact URLs
  - ## Links — links to official profiles and pages
- Be factual, concise, and structured. Do not use marketing superlatives.
- Do not wrap the output in code fences. Return raw markdown only.
- Include a "Last updated:" line at the very end with the provided date.
- If keywords are provided, weave them naturally into the About section without keyword-stuffing.
- Only include information that is provided — never fabricate details.`;

export async function generateLlmsTxt(
  canonical: {
    canonicalName: string;
    canonicalDescription: string;
    canonicalTagline: string | null;
    canonicalCategory: string;
    canonicalSubcategories: string[];
    canonicalServiceAreas: string[];
    canonicalFoundingYear: number | null;
    canonicalFounderName: string | null;
    canonicalUrls: Record<string, unknown>;
  },
  brandBrief?: string,
  keywords?: string[]
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  const urlEntries = Object.entries(canonical.canonicalUrls)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");

  const userPrompt = `Generate a complete llms.txt file for the following brand.

Brand Name: ${canonical.canonicalName}
Description: ${canonical.canonicalDescription}
${canonical.canonicalTagline ? `Tagline: ${canonical.canonicalTagline}` : ""}
Category: ${canonical.canonicalCategory}
${canonical.canonicalSubcategories.length > 0 ? `Subcategories: ${canonical.canonicalSubcategories.join(", ")}` : ""}
${canonical.canonicalServiceAreas.length > 0 ? `Service Areas: ${canonical.canonicalServiceAreas.join(", ")}` : ""}
${canonical.canonicalFoundingYear ? `Founded: ${canonical.canonicalFoundingYear}` : ""}
${canonical.canonicalFounderName ? `Founder: ${canonical.canonicalFounderName}` : ""}

URLs:
${urlEntries || "None provided"}

${brandBrief ? `Brand Brief:\n${brandBrief}` : ""}

${keywords && keywords.length > 0 ? `Relevant Keywords (weave naturally into the About section):\n${keywords.join(", ")}` : ""}

Today's date for the "Last updated" line: ${today}`;

  const result = await callSonnet(userPrompt, {
    systemPrompt: SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.4,
  });

  return result.text;
}
