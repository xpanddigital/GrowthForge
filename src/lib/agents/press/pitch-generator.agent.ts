// Pitch Email Generator Agent — Claude Opus for public-facing quality pitch emails.
// Generates tiered pitch emails with 3 subject line variants per journalist.

import { callOpus, parseClaudeJson } from "@/lib/ai/claude";
import { buildPitchEmailPrompt } from "./prompts/pitch-email";
import type {
  PressPitchGeneratorAgent,
  PitchEmailResult,
} from "@/lib/agents/interfaces";
import type { ClientType } from "@/types/database";

export class PitchGeneratorAgent implements PressPitchGeneratorAgent {
  name = "PitchGeneratorAgent";

  async generate(input: {
    tier: "tier_1" | "tier_2" | "tier_3";
    journalistName: string;
    publication: string;
    personalizationHook: string;
    headline: string;
    summary: string;
    spokespersonName: string;
    spokespersonTitle: string;
    clientName: string;
    clientType?: ClientType;
    keyQuote: string;
    publicUrl?: string;
  }): Promise<PitchEmailResult> {
    const { system, user } = buildPitchEmailPrompt({
      tier: input.tier,
      journalistName: input.journalistName,
      publication: input.publication,
      personalizationHook: input.personalizationHook,
      headline: input.headline,
      summary: input.summary,
      spokespersonName: input.spokespersonName,
      spokespersonTitle: input.spokespersonTitle,
      clientName: input.clientName,
      clientType: input.clientType,
      keyQuote: input.keyQuote,
      publicUrl: input.publicUrl,
    });

    const response = await callOpus(user, {
      systemPrompt: system,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return parseClaudeJson<PitchEmailResult>(response.text);
  }
}
