import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

export interface AutoCanonicalInput {
  clientName: string;
  brandBrief: string;
  websiteUrl: string | null;
  targetAudience: string | null;
  keyDifferentiators: string | null;
}

export interface AutoCanonicalOutput {
  canonicalName: string;
  canonicalDescription: string;
  canonicalTagline: string | null;
  canonicalCategory: string;
  canonicalSubcategories: string[];
  canonicalFoundingYear: number | null;
  canonicalFounderName: string | null;
  canonicalEmployeeCount: string | null;
  canonicalServiceAreas: string[];
}

export async function generateAutoCanonical(
  input: AutoCanonicalInput
): Promise<AutoCanonicalOutput> {
  const systemPrompt = `You are a brand identity specialist. Extract structured entity data from the provided brand brief. Be precise and factual — only include information that is explicitly stated or strongly implied.

Rules:
- canonicalName: The exact brand name as it should appear everywhere (no Inc, LLC unless part of the brand identity)
- canonicalDescription: Professional 150-250 word description. Factual, no marketing fluff. Focus on what they do, who they serve, what makes them different.
- canonicalTagline: 10-15 word tagline capturing the brand essence. null if the brief doesn't suggest one.
- canonicalCategory: The single best industry category (e.g., "Music Services", "Legal Services", "SaaS", "Home Services")
- canonicalSubcategories: 2-4 specific subcategories
- canonicalFoundingYear: null if not mentioned
- canonicalFounderName: null if not mentioned
- canonicalEmployeeCount: Ranges like "1-10", "11-50", "51-200", "201-500". null if unknown.
- canonicalServiceAreas: Geographic areas served. Empty array if global/not specified.

Return valid JSON matching the exact field names above.`;

  const userPrompt = `Brand Name: ${input.clientName}
Website: ${input.websiteUrl || 'Not provided'}
Target Audience: ${input.targetAudience || 'Not specified'}
Key Differentiators: ${input.keyDifferentiators || 'Not specified'}

Brand Brief:
${input.brandBrief}`;

  const result = await callSonnet(userPrompt, {
    systemPrompt,
    maxTokens: 2048,
    temperature: 0.3,
  });

  return parseClaudeJson<AutoCanonicalOutput>(result.text);
}
