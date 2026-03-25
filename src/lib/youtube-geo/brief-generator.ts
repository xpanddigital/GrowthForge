// =============================================================================
// YouTube GEO — Video Brief Generator
// Generates video content briefs for topics where the client has no presence
// but competitors do. Uses Claude Opus for high-quality creative briefs.
// =============================================================================

import { callOpus, parseClaudeJson } from "@/lib/ai/claude";
import type { TopicPresence } from "./presence-auditor";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface VideoBrief {
  topic: string;
  suggestedTitle: string;
  outline: string[];
  keyPoints: string[];
  seoTags: string[];
  descriptionTemplate: string;
  estimatedLength: string;
  competitorContext: string;
}

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function generateVideoBriefs(
  topics: TopicPresence[],
  brandName: string,
  brandBrief: string,
  targetAudience: string | null
): Promise<VideoBrief[]> {
  // Filter to topics with high opportunity and no client video
  const gapTopics = topics
    .filter((t) => !t.hasClientVideo && t.opportunityScore >= 50)
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 5);

  if (gapTopics.length === 0) return [];

  const topicDescriptions = gapTopics
    .map((t) => {
      const compInfo =
        t.competitorVideos.length > 0
          ? `Competitors with videos: ${t.competitorVideos.map((v) => `${v.competitor} ("${v.title}", ${v.views} views)`).join("; ")}`
          : "No competitor videos found";
      return `- Topic: "${t.topic}" (opportunity: ${t.opportunityScore}/100)\n  ${compInfo}`;
    })
    .join("\n\n");

  const result = await callOpus(
    `You are a YouTube content strategist creating video briefs for "${brandName}".

Brand context: ${brandBrief}
${targetAudience ? `Target audience: ${targetAudience}` : ""}

The following topics have NO videos from this brand but competitors are present:

${topicDescriptions}

For each topic, generate a video content brief that would:
1. Outperform competitor videos by providing more value
2. Be optimized for AI citation (clear structure, data points, expert positioning)
3. Naturally reference the brand without being promotional
4. Target 8-15 minutes of content

Return JSON array:
[
  {
    "topic": "the topic keyword",
    "suggestedTitle": "AI-optimized title with keyword",
    "outline": ["Section 1: ...", "Section 2: ..."],
    "keyPoints": ["key point 1", "key point 2"],
    "seoTags": ["tag1", "tag2"],
    "descriptionTemplate": "optimized description template (200+ words with timestamps placeholder)",
    "estimatedLength": "10-12 minutes",
    "competitorContext": "what competitors are doing and how to differentiate"
  }
]`,
    { maxTokens: 4096, temperature: 0.7 }
  );

  return parseClaudeJson<VideoBrief[]>(result.text);
}
