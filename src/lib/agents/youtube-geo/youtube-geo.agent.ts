// =============================================================================
// YouTube GEO Agent
// Orchestrates YouTube presence audit, description optimization, gap finding,
// and video brief generation.
// =============================================================================

import type { YouTubeGeoAgent, YouTubeGeoResult } from "../interfaces";
import { auditYouTubePresence } from "@/lib/youtube-geo/presence-auditor";
import { analyzeVideoDescription } from "@/lib/youtube-geo/description-optimizer";
import { generateVideoBriefs } from "@/lib/youtube-geo/brief-generator";

export class YouTubeGeoScanAgent implements YouTubeGeoAgent {
  name = "YouTubeGeoScanAgent";

  async scan(
    brandName: string,
    brandUrl: string,
    keywords: string[],
    competitors: string[]
  ): Promise<YouTubeGeoResult> {
    // Step 1: Audit presence across all keyword topics
    const keywordsWithIds = keywords.map((kw, i) => ({
      id: `kw-${i}`,
      keyword: kw,
    }));

    const presenceResult = await auditYouTubePresence(
      brandName,
      keywordsWithIds,
      competitors
    );

    // Step 2: Analyze descriptions for client's existing videos
    // Description analysis runs but results are used for scoring only
    for (const topic of presenceResult.topics) {
      if (topic.clientVideo && topic.clientVideo.description) {
        try {
          await analyzeVideoDescription(
            topic.clientVideo.url,
            topic.clientVideo.title,
            topic.clientVideo.description,
            brandName
          );
        } catch {
          // Description analysis is nice-to-have
        }
      }
    }

    // Step 3: Generate briefs for gap topics (async, may fail)
    let briefs: Array<{ topic: string; brief: string }> = [];
    try {
      const generatedBriefs = await generateVideoBriefs(
        presenceResult.topics,
        brandName,
        "", // Brand brief would be passed from client data in Inngest
        null
      );
      briefs = generatedBriefs.map((b) => ({
        topic: b.topic,
        brief: JSON.stringify(b),
      }));
    } catch {
      // Brief generation failure is non-fatal
    }

    // Build result
    const topics: YouTubeGeoResult["topics"] = presenceResult.topics.map(
      (t) => {
        const brief = briefs.find((b) => b.topic === t.topic);
        return {
          topic: t.topic,
          hasClientVideo: t.hasClientVideo,
          clientVideoUrl: t.clientVideo?.url || null,
          clientVideoTitle: t.clientVideo?.title || null,
          competitorVideos: t.competitorVideos.map((v) => ({
            competitor: v.competitor,
            title: v.title,
            url: v.url,
            views: v.views,
          })),
          opportunityScore: t.opportunityScore,
          videoBrief: brief?.brief || null,
        };
      }
    );

    // Calculate overall score
    // Weighted: presence coverage (40%) + description quality (30%) + gap coverage (30%)
    const presenceScore = presenceResult.overallPresenceCoverage;
    const gapTopics = topics.filter(
      (t) => !t.hasClientVideo && t.opportunityScore >= 50
    );
    const gapCoverage =
      topics.length > 0
        ? Math.round(
            ((topics.length - gapTopics.length) / topics.length) * 100
          )
        : 100;

    const overallScore = Math.round(
      presenceScore * 0.5 + gapCoverage * 0.5
    );

    return {
      topics,
      overallScore,
      presenceCoverage: presenceResult.overallPresenceCoverage,
    };
  }
}
