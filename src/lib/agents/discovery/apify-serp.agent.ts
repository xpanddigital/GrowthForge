// SERP Discovery Agent — discovers threads by scanning Google SERPs.
// Uses SerpAPI (free/cheap) instead of Apify's google-search-scraper.

import { discoverThreadsViaSerpApi } from "@/lib/scrapers/serp";
import type { DiscoveryAgent, DiscoveredThread } from "../interfaces";

export class ApifySerpAgent implements DiscoveryAgent {
  // Keep the class name for registry compatibility
  name = "SerpApiDiscoveryAgent";

  async discover(
    _clientId: string,
    keywords: Array<{ id: string; keyword: string; platforms: string[] }>
  ): Promise<DiscoveredThread[]> {
    return discoverThreadsViaSerpApi(keywords);
  }
}
