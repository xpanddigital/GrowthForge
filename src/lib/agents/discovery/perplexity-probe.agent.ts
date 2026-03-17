// Perplexity Probe Agent — discovers threads that AI models cite.
// Uses the AI probing module to find Reddit, Quora, and Facebook Group
// threads that are already referenced by Perplexity and OpenAI.
//
// This is NOT about checking if the client's brand is mentioned.
// This is about finding THREADS that AI models already reference,
// so we can place the client's brand IN those threads.

import type { DiscoveryAgent, DiscoveredThread } from "../interfaces";
import { probeAllModels, type ProbeResult } from "@/lib/ai/probe-ai-models";

export class PerplexityProbeAgent implements DiscoveryAgent {
  name = "PerplexityProbeAgent";

  /**
   * Discover threads by probing AI models with buying-intent questions.
   *
   * For each keyword (limited to top 20), generates buying-intent questions
   * and sends them to Perplexity (sonar-pro) and OpenAI (gpt-4o).
   * Extracts Reddit, Quora, and Facebook Group URLs from the responses.
   *
   * Rate limiting: Run top 20 keywords per client per scan.
   */
  async discover(
    _clientId: string,
    keywords: Array<{ id: string; keyword: string; platforms: string[] }>
  ): Promise<DiscoveredThread[]> {
    // Limit to top 20 keywords to respect rate limits
    const keywordsToProbe = keywords.slice(0, 20);
    const allThreads: DiscoveredThread[] = [];
    const seenUrls = new Set<string>();

    for (const kw of keywordsToProbe) {
      const probeResults = await probeAllModels(kw.keyword);

      for (const result of probeResults) {
        const threads = this.extractThreadsFromProbe(result, kw);
        for (const thread of threads) {
          if (!seenUrls.has(thread.url)) {
            seenUrls.add(thread.url);
            allThreads.push(thread);
          }
        }
      }

      // Brief pause between keywords to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return allThreads;
  }

  /**
   * Extract DiscoveredThread objects from a single probe result.
   */
  private extractThreadsFromProbe(
    result: ProbeResult,
    keyword: { id: string; keyword: string; platforms: string[] }
  ): DiscoveredThread[] {
    const threads: DiscoveredThread[] = [];

    for (const extracted of result.extractedUrls) {
      // Only include threads from platforms the keyword targets
      if (!keyword.platforms.includes(extracted.platform)) continue;

      // Try to extract a title from the response text near the URL
      const title = this.extractTitleContext(result.responseText, extracted.url);

      threads.push({
        url: extracted.url,
        title: title || `AI-cited thread for "${keyword.keyword}"`,
        snippet: this.extractSnippet(result.responseText, extracted.url),
        platform: extracted.platform,
        keyword: keyword.keyword,
        keywordId: keyword.id,
        // No position for AI-probed threads — they come from AI, not SERPs
      });
    }

    return threads;
  }

  /**
   * Try to extract a meaningful title from the AI response near where the URL appears.
   * Returns null if no meaningful title can be extracted.
   */
  private extractTitleContext(
    responseText: string,
    url: string
  ): string | null {
    const urlIndex = responseText.indexOf(url);
    if (urlIndex === -1) return null;

    // Look for text in the surrounding context (200 chars before the URL)
    const contextStart = Math.max(0, urlIndex - 200);
    const context = responseText.substring(contextStart, urlIndex).trim();

    // Try to find the last sentence or phrase before the URL
    const sentences = context.split(/[.!?]\s+/);
    const lastSentence = sentences[sentences.length - 1]?.trim();

    if (lastSentence && lastSentence.length > 10 && lastSentence.length < 200) {
      return lastSentence;
    }

    return null;
  }

  /**
   * Extract a snippet of context from the AI response around a URL.
   */
  private extractSnippet(responseText: string, url: string): string {
    const urlIndex = responseText.indexOf(url);
    if (urlIndex === -1) return "";

    // Get surrounding context
    const snippetStart = Math.max(0, urlIndex - 100);
    const snippetEnd = Math.min(responseText.length, urlIndex + url.length + 100);
    let snippet = responseText.substring(snippetStart, snippetEnd).trim();

    // Clean up and truncate
    if (snippetStart > 0) snippet = "..." + snippet;
    if (snippetEnd < responseText.length) snippet = snippet + "...";

    return snippet.substring(0, 300);
  }
}
