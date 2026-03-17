// Press Release Generator Agent — Claude Opus for high-quality press release generation.
// Wraps the battle-tested PressForge press release prompt.

import { callOpus, parseClaudeJson } from "@/lib/ai/claude";
import { buildPressReleasePrompt } from "./prompts/press-release";
import type {
  PressReleaseGeneratorAgent,
  PressReleaseResult,
} from "@/lib/agents/interfaces";
import type { Client, Spokesperson } from "@/types/database";

export class PressReleaseAgent implements PressReleaseGeneratorAgent {
  name = "PressReleaseAgent";

  async generate(input: {
    headline: string;
    angle: string;
    type: "expert_commentary" | "data_driven";
    client: Client;
    spokesperson: Spokesperson;
    region: string;
    length: "short" | "standard" | "detailed";
    researchData?: string;
  }): Promise<PressReleaseResult> {
    const { system, user } = buildPressReleasePrompt({
      headline: input.headline,
      angle: input.angle,
      type: input.type,
      clientName: input.client.name,
      clientType: (input.client.client_type as "business" | "thought_leader") ?? "business",
      websiteUrl: input.client.website_url ?? "",
      spokespersonName: input.spokesperson.name,
      spokespersonTitle: input.spokesperson.title,
      spokespersonBio: input.spokesperson.bio ?? undefined,
      voiceProfile: input.spokesperson.voice_profile ?? undefined,
      region: input.region,
      length: input.length,
      researchData: input.researchData,
    });

    const response = await callOpus(user, {
      systemPrompt: system,
      maxTokens: 8192,
      temperature: 0.7,
    });

    return parseClaudeJson<PressReleaseResult>(response.text);
  }
}
