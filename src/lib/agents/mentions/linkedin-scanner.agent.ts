// =============================================================================
// Mention Gap Analyzer — LinkedIn Scanner Agent
// Searches Google (via SerpAPI) for brand and competitor mentions on LinkedIn.
// Covers company pages, LinkedIn Pulse articles, and LinkedIn posts.
// =============================================================================

import type { MentionScanAgent, MentionScanResult } from "../interfaces";

const SERPAPI_URL = "https://serpapi.com/search.json";
const REQUEST_DELAY_MS = 1500;

export class LinkedInScannerAgent implements MentionScanAgent {
  name = "LinkedInScannerAgent";
  platform = "linkedin";

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

    // Search for brand on LinkedIn
    const brandQueries = [
      `site:linkedin.com "${brandName}"`,
      `site:linkedin.com/company "${brandName}"`,
      ...keywords.slice(0, 5).map((kw) => `site:linkedin.com/pulse "${kw}"`),
    ];

    for (const query of brandQueries) {
      try {
        const results = await this.searchGoogle(query, apiKey);
        for (const result of results) {
          if (seenUrls.has(result.link)) continue;
          seenUrls.add(result.link);

          const hasBrand = this.containsBrand(
            `${result.title} ${result.snippet}`,
            brandName
          );
          const mentionedCompetitor = this.findCompetitor(
            `${result.title} ${result.snippet}`,
            competitors
          );

          sources.push({
            url: result.link,
            title: result.title,
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
            contextSnippet: result.snippet || null,
            authorityEstimate: this.estimateAuthority(result.link),
          });
        }
      } catch {
        // Continue on individual query failure
      }
      await sleep(REQUEST_DELAY_MS);
    }

    // Search for competitors on LinkedIn
    for (const competitor of competitors.slice(0, 3)) {
      try {
        const results = await this.searchGoogle(
          `site:linkedin.com "${competitor}"`,
          apiKey
        );
        for (const result of results) {
          if (seenUrls.has(result.link)) continue;
          seenUrls.add(result.link);

          const hasBrand = this.containsBrand(
            `${result.title} ${result.snippet}`,
            brandName
          );

          sources.push({
            url: result.link,
            title: result.title,
            mentionType: hasBrand ? "both" : "competitor",
            mentionedEntity: competitor,
            contextSnippet: result.snippet || null,
            authorityEstimate: this.estimateAuthority(result.link),
          });
        }
      } catch {
        // Continue
      }
      await sleep(REQUEST_DELAY_MS);
    }

    // Check if brand has a LinkedIn company page
    const profileExists = sources.some((s) =>
      s.url.includes("linkedin.com/company/")
    );
    const profileUrl =
      sources.find((s) => s.url.includes("linkedin.com/company/"))?.url ||
      null;

    return {
      platform: "linkedin",
      sources,
      profileExists,
      profileUrl,
    };
  }

  private async searchGoogle(
    query: string,
    apiKey: string
  ): Promise<Array<{ title: string; link: string; snippet: string }>> {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: "google",
      num: "10",
      gl: "us",
      hl: "en",
    });

    const response = await fetch(`${SERPAPI_URL}?${params}`);
    if (!response.ok) return [];

    const data = await response.json();
    return (data.organic_results || []).map(
      (r: Record<string, string>) => ({
        title: r.title || "",
        link: r.link || "",
        snippet: r.snippet || "",
      })
    );
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
    url: string
  ): "high" | "medium" | "low" {
    if (url.includes("/pulse/")) return "high"; // LinkedIn articles
    if (url.includes("/company/")) return "high";
    if (url.includes("/posts/")) return "medium";
    return "medium";
  }

  private emptyResult(): MentionScanResult {
    return {
      platform: "linkedin",
      sources: [],
      profileExists: false,
      profileUrl: null,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
