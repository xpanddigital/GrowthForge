interface PressReleaseInput {
  headline: string;
  angle: string;
  type: "expert_commentary" | "data_driven";
  clientName: string;
  clientType?: "business" | "thought_leader";
  websiteUrl: string;
  spokespersonName: string;
  spokespersonTitle: string;
  spokespersonBio?: string;
  voiceProfile?: string;
  region: string;
  length: "short" | "standard" | "detailed";
  researchData?: string;
}

const WORD_TARGETS: Record<string, number> = {
  short: 300,
  standard: 500,
  detailed: 800,
};

export function buildPressReleasePrompt(input: PressReleaseInput): {
  system: string;
  user: string;
} {
  const {
    headline,
    angle,
    type,
    clientName,
    clientType = "business",
    websiteUrl,
    spokespersonName,
    spokespersonTitle,
    spokespersonBio,
    voiceProfile,
    region,
    length,
    researchData,
  } = input;

  const wordTarget = WORD_TARGETS[length] || 500;
  const isThoughtLeader = clientType === "thought_leader";

  const system = isThoughtLeader
    ? `You are an experienced digital PR writer. You write thought leadership press releases that get published in mainstream Australian, UK, and US press. Your style is journalistic — factual, authoritative, and newsy. You never sound like a press release. You sound like an article a journalist would write.

The subject of this press release is a thought leader — an individual expert, not a company. Write the piece centering THEM as the authority. Their name should appear prominently and naturally throughout. Think "expert says" not "company announces".

IMPORTANT VOICE INSTRUCTIONS: Write all quotes in this specific voice:
${voiceProfile || "Professional, authoritative, and direct. Speaks plainly without jargon."}`
    : `You are an experienced digital PR writer. You write press releases that get published in mainstream Australian, UK, and US press. Your style is journalistic — factual, authoritative, and newsy. You never sound like a press release. You sound like an article a journalist would write.

IMPORTANT VOICE INSTRUCTIONS: Write all spokesperson quotes in this specific voice:
${voiceProfile || "Professional, authoritative, and direct. Speaks plainly without jargon."}`;

  const clientBlock = isThoughtLeader
    ? `THOUGHT LEADER:
- Name: ${spokespersonName}
- Title/Credentials: ${spokespersonTitle}
- Website: ${websiteUrl}
${spokespersonBio ? `- Bio: ${spokespersonBio}` : ""}`
    : `CLIENT INFO:
- Business: ${clientName} (${websiteUrl})
- Spokesperson: ${spokespersonName}, ${spokespersonTitle}
${spokespersonBio ? `- Bio: ${spokespersonBio}` : ""}`;

  const rulesBlock = isThoughtLeader
    ? `RULES:
- Lead with the news hook in paragraph 1. Make it sound like a news story, not a pitch.
- Include the backlink to ${websiteUrl} naturally in paragraph 2 or 3 (as "according to ${spokespersonName}" or "as ${spokespersonName} explains on their website").
- Include 2-3 direct quotes from ${spokespersonName}. Write them in their voice (see voice instructions). Make quotes feel like real spoken language, not corporate speak.
- Frame ${spokespersonName} as THE expert on this topic — the person journalists would call for commentary.
- Reference their credentials or experience to establish authority.
${type === "data_driven" ? "- Lead with the most surprising data point. Include specific numbers." : ""}
- Final paragraph: a forward-looking quote with a call to action.
- DO NOT use: innovative, groundbreaking, game-changing, cutting-edge, delighted, thrilled, passionate.
- DO NOT use bullet points or numbered lists. Write in flowing paragraphs like a news article.
- Use ${region} spelling (e.g., "recognise" for AU/UK, "recognize" for US).`
    : `RULES:
- Lead with the news hook in paragraph 1. Make it sound like a news story, not a pitch.
- Include the backlink to ${websiteUrl} naturally in paragraph 2 or 3 (as "according to ${clientName}" or "a case study published by ${clientName}").
- Include 2-3 direct quotes from ${spokespersonName}. Write them in their voice (see voice instructions). Make quotes feel like real spoken language, not corporate speak.
${type === "data_driven" ? "- Lead with the most surprising data point. Include specific numbers." : ""}
- Final paragraph: a forward-looking quote from the spokesperson with a call to action.
- DO NOT use: innovative, groundbreaking, game-changing, cutting-edge, delighted, thrilled, passionate.
- DO NOT use bullet points or numbered lists. Write in flowing paragraphs like a news article.
- Use ${region} spelling (e.g., "recognise" for AU/UK, "recognize" for US).`;

  const user = `Write a ${wordTarget}-word press release in ${region} English.

CAMPAIGN CONCEPT:
Headline: ${headline}
Angle: ${angle}
Type: ${type}

${clientBlock}

${researchData ? `ADDITIONAL DATA/RESEARCH:\n${researchData}` : ""}

${rulesBlock}

Return ONLY the press release text, no other text or formatting.`;

  return { system, user };
}
