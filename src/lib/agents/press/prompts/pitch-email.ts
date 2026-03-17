export interface PitchEmailInput {
  tier: "tier_1" | "tier_2" | "tier_3";
  journalistName: string;
  publication: string;
  personalizationHook: string;
  headline: string;
  summary: string;
  spokespersonName: string;
  spokespersonTitle: string;
  clientName: string;
  clientType?: "business" | "thought_leader";
  keyQuote: string;
  publicUrl?: string;
}

export interface PitchEmailOutput {
  subject_lines: string[];
  body: string;
}

export function buildPitchEmailPrompt(input: PitchEmailInput): {
  system: string;
  user: string;
} {
  const {
    tier,
    journalistName,
    publication,
    personalizationHook,
    headline,
    summary,
    spokespersonName,
    spokespersonTitle,
    clientName,
    clientType = "business",
    keyQuote,
    publicUrl,
  } = input;

  const isThoughtLeader = clientType === "thought_leader";

  const tierInstructions: Record<string, string> = {
    tier_1: `Open by referencing their recent article (${personalizationHook}). Transition naturally into why this story is relevant to their readers. Include the key quote.${isThoughtLeader ? ` Position ${spokespersonName} as an expert source they should know about.` : ""} Offer an exclusive or early access. 4-5 sentences max.`,
    tier_2: `Open with the story hook. Mention why it's relevant to ${publication} readers. Include the key quote. 3-4 sentences max.`,
    tier_3: `Lead with the headline as the hook. One sentence of context. Link to full press release. 2-3 sentences max.`,
  };

  const system = isThoughtLeader
    ? `You are writing a pitch email from a PR professional to a journalist, introducing them to a thought leader/expert source. Be concise, professional, and newsy. Never sound like spam. Never use "I hope this email finds you well." Position the thought leader as someone the journalist should have in their contacts for expert commentary. Get to their expertise immediately.`
    : `You are writing a pitch email from a PR professional to a journalist. Be concise, professional, and newsy. Never sound like spam. Never use "I hope this email finds you well." Get to the story immediately.`;

  const expertLine = isThoughtLeader
    ? `EXPERT SOURCE: ${spokespersonName}, ${spokespersonTitle}`
    : `SPOKESPERSON: ${spokespersonName}, ${spokespersonTitle} at ${clientName}`;

  const user = `Write a ${tier} pitch email for:

JOURNALIST: ${journalistName} at ${publication}
PERSONALIZATION HOOK: ${personalizationHook}
PRESS RELEASE HEADLINE: ${headline}
PRESS RELEASE SUMMARY: ${summary}
${expertLine}
KEY QUOTE: ${keyQuote}
${publicUrl ? `FULL PRESS RELEASE URL: ${publicUrl}` : ""}

TIER INSTRUCTIONS:
${tierInstructions[tier] || tierInstructions.tier_3}

Also generate 3 subject line variants. Subject lines must sound like news headlines, not marketing. Include a number or specific claim.

Return JSON: { "subject_lines": ["...", "...", "..."], "body": "..." }
Return ONLY valid JSON, no other text.`;

  return { system, user };
}
