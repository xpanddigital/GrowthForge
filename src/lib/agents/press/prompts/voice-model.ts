interface VoiceModelInput {
  spokespersonName: string;
  spokespersonTitle: string;
  clientName: string;
  voiceSamples: string[];
}

export interface VoiceModelOutput {
  voice_profile: string;
  example_quotes: string[];
}

export function buildVoiceModelPrompt(input: VoiceModelInput): {
  system: string;
  user: string;
} {
  const { spokespersonName, spokespersonTitle, clientName, voiceSamples } = input;

  const system = `You are a linguistics expert specializing in voice analysis and mimicry.`;

  const samplesText = voiceSamples
    .filter((s) => s.trim())
    .map((s, i) => `${i + 1}. "${s}"`)
    .join("\n");

  const user = `Analyze these real quotes from ${spokespersonName} (${spokespersonTitle} at ${clientName}):

${samplesText}

Create a detailed voice profile covering:
1. SENTENCE STRUCTURE: Average length, use of complex vs simple sentences, rhetorical patterns
2. VOCABULARY: Formality level, industry jargon usage, favorite phrases or verbal tics
3. EMOTIONAL REGISTER: How they express concern, authority, empathy, urgency
4. METAPHORS/ANALOGIES: Do they use them? What type?
5. DIRECTNESS: Do they hedge or speak directly? Use qualifiers?
6. PERSONALITY MARKERS: Anything distinctive about how they communicate

Then write 3 example quotes on a generic topic (workplace safety) in their voice, to validate the profile.

Return as JSON: { "voice_profile": "...", "example_quotes": ["...", "...", "..."] }
Return ONLY valid JSON, no other text.`;

  return { system, user };
}
