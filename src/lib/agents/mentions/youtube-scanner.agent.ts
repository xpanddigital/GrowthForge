// =============================================================================
// Mention Gap Analyzer — YouTube Scanner Agent
// Searches YouTube (via SerpAPI YouTube engine) for brand and competitor
// mentions in video titles, descriptions, and channel names.
// =============================================================================

import type { MentionScanAgent, MentionScanResult } from "../interfaces";

const SERPAPI_URL = "https://serpapi.com/search.json";
const REQUEST_DELAY_MS = 1500;

interface YouTubeVideoResult {
  title: string;
  link: string;
  description_snippet?: string;
  channel?: {
    name: string;
    link: string;
  };
  views?: number;
  published_date?: string;
}

export class YouTubeScannerAgent implements MentionScanAgent {
  name = "YouTubeScannerAgent";
  platform = "youtube";

  async scan(
    brandName: string,
    brandUrl: string,
    keywords: string[],
    competitors: string[]
  ): Promise<MentionScanResult> {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return this.emptyResult();
    }

    const sources: MentionScanResult["sources"] = [];
    const seenUrls = new Set<string>();

    // Search YouTube for brand mentions
    const brandQueries = [
      brandName,
      ...keywords.slice(0, 5).map((kw) => `${kw} ${brandName}`),
    ];

    for (const query of brandQueries) {
      try {
        const results = await this.searchYouTube(query, apiKey);
        for (const video of results) {
          if (seenUrls.has(video.link)) continue;
          seenUrls.add(video.link);

          const text = `${video.title} ${video.description_snippet || ""} ${video.channel?.name || ""}`;
          const hasBrand = this.containsBrand(text, brandName);
          const mentionedCompetitor = this.findCompetitor(text, competitors);

          sources.push({
            url: video.link,
            title: video.title,
            mentionType: hasBrand && mentionedCompetitor
              ? "both"
              : hasBrand
                ? "brand"
                : mentionedCompetitor
                  ? "competitor"
                  : "neither",
            mentionedEntity: hasBrand
              ? brandName
              : mentionedCompetitor || null,
            contextSnippet: video.description_snippet || null,
            authorityEstimate: this.estimateAuthority(video),
          });
        }
      } catch {
        // Continue on failure
      }
      await sleep(REQUEST_DELAY_MS);
    }

    // Search for competitor videos on the same topics
    for (const competitor of competitors.slice(0, 3)) {
      for (const kw of keywords.slice(0, 3)) {
        try {
          const results = await this.searchYouTube(
            `${kw} ${competitor}`,
            apiKey
          );
          for (const video of results) {
            if (seenUrls.has(video.link)) continue;
            seenUrls.add(video.link);

            const text = `${video.title} ${video.description_snippet || ""}`;
            const hasBrand = this.containsBrand(text, brandName);

            sources.push({
              url: video.link,
              title: video.title,
              mentionType: hasBrand ? "both" : "competitor",
              mentionedEntity: competitor,
              contextSnippet: video.description_snippet || null,
              authorityEstimate: this.estimateAuthority(video),
            });
          }
        } catch {
          // Continue
        }
        await sleep(REQUEST_DELAY_MS);
      }
    }

    // Check if brand has its own YouTube channel
    let profileExists = false;
    let profileUrl: string | null = null;

    const brandChannelResults = sources.filter(
      (s) =>
        s.mentionType === "brand" &&
        s.url.includes("youtube.com/@")
    );
    if (brandChannelResults.length > 0) {
      profileExists = true;
      profileUrl = brandChannelResults[0].url;
    }

    return {
      platform: "youtube",
      sources,
      profileExists,
      profileUrl,
    };
  }

  private async searchYouTube(
    query: string,
    apiKey: string
  ): Promise<YouTubeVideoResult[]> {
    const params = new URLSearchParams({
      search_query: query,
      api_key: apiKey,
      engine: "youtube",
    });

    const response = await fetch(`${SERPAPI_URL}?${params}`);
    if (!response.ok) return [];

    const data = await response.json();
    return (data.video_results || []) as YouTubeVideoResult[];
  }

  private containsBrand(text: string, brandName: string): boolean {
    return text.toLowerCase().includes(brandName.toLowerCase());
  }

  private findCompetitor(
    text: string,
    competitors: string[]
  ): string | null {
    const lower = text.toLowerCase();
    for (const comp of competitors) {
      if (lower.includes(comp.toLowerCase())) return comp;
    }
    return null;
  }

  private estimateAuthority(
    video: YouTubeVideoResult
  ): "high" | "medium" | "low" {
    if (video.views && video.views > 100000) return "high";
    if (video.views && video.views > 10000) return "medium";
    return "low";
  }

  private emptyResult(): MentionScanResult {
    return {
      platform: "youtube",
      sources: [],
      profileExists: false,
      profileUrl: null,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
