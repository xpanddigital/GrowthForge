// =============================================================================
// YouTube GEO — Presence Auditor
// Checks if a client has YouTube videos for each keyword topic.
// Discovers competitor videos on the same topics.
// Uses SerpAPI YouTube engine for search.
// =============================================================================

const SERPAPI_URL = "https://serpapi.com/search.json";
const REQUEST_DELAY_MS = 1500;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface VideoMatch {
  title: string;
  url: string;
  channel: string;
  views: number;
  publishedDate: string | null;
  description: string | null;
}

export interface TopicPresence {
  topic: string;
  keywordId: string | null;
  hasClientVideo: boolean;
  clientVideo: VideoMatch | null;
  competitorVideos: Array<VideoMatch & { competitor: string }>;
  opportunityScore: number;
}

export interface PresenceAuditResult {
  topics: TopicPresence[];
  overallPresenceCoverage: number; // % of topics where client has a video
  totalClientVideos: number;
  totalCompetitorVideos: number;
}

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function auditYouTubePresence(
  brandName: string,
  keywords: Array<{ id: string; keyword: string }>,
  competitors: string[]
): Promise<PresenceAuditResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return {
      topics: [],
      overallPresenceCoverage: 0,
      totalClientVideos: 0,
      totalCompetitorVideos: 0,
    };
  }

  const topics: TopicPresence[] = [];

  for (const kw of keywords.slice(0, 15)) {
    // Search for this topic on YouTube
    const results = await searchYouTube(kw.keyword, apiKey);

    // Check if client has a video
    const clientVideo = results.find((v) =>
      containsBrand(v.title + " " + v.channel + " " + (v.description || ""), brandName)
    );

    // Find competitor videos
    const competitorVideos: Array<VideoMatch & { competitor: string }> = [];
    for (const comp of competitors) {
      const compVideo = results.find((v) =>
        containsBrand(v.title + " " + v.channel + " " + (v.description || ""), comp)
      );
      if (compVideo) {
        competitorVideos.push({ ...compVideo, competitor: comp });
      }
    }

    // Calculate opportunity score
    const opportunityScore = calculateOpportunity(
      !!clientVideo,
      competitorVideos.length,
      results.length
    );

    topics.push({
      topic: kw.keyword,
      keywordId: kw.id,
      hasClientVideo: !!clientVideo,
      clientVideo: clientVideo || null,
      competitorVideos,
      opportunityScore,
    });

    await sleep(REQUEST_DELAY_MS);
  }

  const clientVideoCount = topics.filter((t) => t.hasClientVideo).length;
  const overallPresenceCoverage =
    topics.length > 0
      ? Math.round((clientVideoCount / topics.length) * 100)
      : 0;

  return {
    topics,
    overallPresenceCoverage,
    totalClientVideos: clientVideoCount,
    totalCompetitorVideos: topics.reduce(
      (sum, t) => sum + t.competitorVideos.length,
      0
    ),
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function searchYouTube(
  query: string,
  apiKey: string
): Promise<VideoMatch[]> {
  const params = new URLSearchParams({
    search_query: query,
    api_key: apiKey,
    engine: "youtube",
  });

  try {
    const response = await fetch(`${SERPAPI_URL}?${params}`);
    if (!response.ok) return [];

    const data = await response.json();
    const videoResults = (data.video_results || []) as Array<{
      title?: string;
      link?: string;
      channel?: { name?: string };
      views?: number;
      published_date?: string;
      description_snippet?: string;
    }>;

    return videoResults.slice(0, 10).map((v) => ({
      title: v.title || "",
      url: v.link || "",
      channel: v.channel?.name || "",
      views: v.views || 0,
      publishedDate: v.published_date || null,
      description: v.description_snippet || null,
    }));
  } catch {
    return [];
  }
}

function containsBrand(text: string, name: string): boolean {
  return text.toLowerCase().includes(name.toLowerCase());
}

function calculateOpportunity(
  clientHasVideo: boolean,
  competitorVideoCount: number,
  totalResults: number
): number {
  if (clientHasVideo) return 20; // Already covered — low opportunity
  if (competitorVideoCount === 0 && totalResults < 3) return 30; // Low search interest
  if (competitorVideoCount >= 2) return 95; // Competitors present, client absent — highest
  if (competitorVideoCount === 1) return 80;
  if (totalResults >= 5) return 65; // Active topic, client missing
  return 45;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
