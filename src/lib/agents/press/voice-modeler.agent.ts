// Voice Modeler Agent — Claude Opus for quality voice profile generation.
// Analyzes spokesperson quotes and generates a voice profile for press release writing.

import { callOpus, parseClaudeJson } from "@/lib/ai/claude";
import { buildVoiceModelPrompt } from "./prompts/voice-model";
import type {
  PressVoiceModelerAgent,
  VoiceModelResult,
} from "@/lib/agents/interfaces";

export class VoiceModelerAgent implements PressVoiceModelerAgent {
  name = "VoiceModelerAgent";

  async model(
    spokesperson: { name: string; title: string; clientName: string },
    voiceSamples: string[]
  ): Promise<VoiceModelResult> {
    const { system, user } = buildVoiceModelPrompt({
      spokespersonName: spokesperson.name,
      spokespersonTitle: spokesperson.title,
      clientName: spokesperson.clientName,
      voiceSamples,
    });

    const response = await callOpus(user, {
      systemPrompt: system,
      maxTokens: 4096,
      temperature: 0.6,
    });

    return parseClaudeJson<VoiceModelResult>(response.text);
  }
}
