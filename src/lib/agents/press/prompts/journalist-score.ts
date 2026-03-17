export interface JournalistScoreInput {
  index: number;
  name: string;
  publication: string;
  region: string;
  recentArticlesSummary: string;
}

export interface JournalistScoreResult {
  journalist_index: number;
  total_score: number;
  tier: "tier_1" | "tier_2" | "tier_3" | "skip";
  breakdown: {
    beat: number;
    publication: number;
    region: number;
    recency: number;
    engagement: number;
  };
  why_selected: string;
  personalization_hook: string;
}

export function buildJournalistScorePrompt(
  journalists: JournalistScoreInput[],
  pressReleaseSummary: string,
  targetRegion: string
): { system: string; user: string } {
  const system = `You are a media relations expert. Your job is to evaluate whether journalists are a good fit to receive a specific press release. You are strict — a score of 80+ means you are confident they would be interested. Score ALL journalists provided in a single response.`;

  const journalistList = journalists
    .map(
      (j) =>
        `${j.index}. ${j.name} at ${j.publication} (Region: ${j.region})\n   Recent articles: ${j.recentArticlesSummary}`
    )
    .join("\n\n");

  const user = `Score each of these journalists' relevance to the press release below.

JOURNALISTS TO SCORE:
${journalistList}

PRESS RELEASE SUMMARY:
${pressReleaseSummary}

TARGET REGION: ${targetRegion}

For EACH journalist, evaluate on:
1. BEAT ALIGNMENT (0-30): Do their recent articles cover this topic area?
2. PUBLICATION FIT (0-25): Is this publication appropriate for this story?
3. REGIONAL MATCH (0-20): Does the journalist cover this geographic area?
4. RECENCY (0-15): Have they written about this topic recently (last 3 months = high, 6 months = medium, 12 months = low)?
5. ENGAGEMENT LIKELIHOOD (0-10): Based on the story angle, would this journalist find it newsworthy?

Tier thresholds: 80+ = tier_1, 50-79 = tier_2, 30-49 = tier_3, <30 = skip

Return a JSON array with one object per journalist (in the same order as input):
[{
  "journalist_index": number,
  "total_score": number,
  "tier": "tier_1" | "tier_2" | "tier_3" | "skip",
  "breakdown": { "beat": number, "publication": number, "region": number, "recency": number, "engagement": number },
  "why_selected": "2-3 sentence explanation",
  "personalization_hook": "A specific reference to their recent work for the pitch email"
}]
Return ONLY valid JSON, no other text.`;

  return { system, user };
}
