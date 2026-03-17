export interface ExtractedCriteria {
  primary_keywords: string[];
  secondary_keywords: string[];
  relevant_beats: string[];
  relevant_industries: string[];
  target_publications: string[];
}

export function buildKeywordExtractPrompt(
  pressReleaseBody: string,
  targetRegion: string
): { system: string; user: string } {
  const system = `You are a media relations expert who specializes in matching press releases to journalists.`;

  const user = `Analyze this press release and extract search criteria for finding relevant journalists.

Press release:
${pressReleaseBody}

Target region: ${targetRegion}

Return JSON:
{
  "primary_keywords": [],     // 3-5 core topic terms
  "secondary_keywords": [],   // 3-5 adjacent terms
  "relevant_beats": [],       // journalist beat categories (e.g., "legal", "workplace_safety", "courts")
  "relevant_industries": [],  // from standard industry list
  "target_publications": []   // known relevant outlets for this region/topic
}

Return ONLY valid JSON, no other text.`;

  return { system, user };
}
