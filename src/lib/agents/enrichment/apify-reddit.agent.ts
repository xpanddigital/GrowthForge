// Enrichment Agent — fetches full thread content from Reddit, Quora, Facebook.
// Reddit: Uses Reddit's free JSON API (no Apify, zero cost).
// Quora: Uses Apify crawlerbros/quora-scraper (batched for cost efficiency).
// Facebook: Uses Apify with graceful fallback.

import { scrapeRedditThread } from "@/lib/scrapers/reddit";
import { scrapeQuoraQuestion } from "@/lib/scrapers/quora";
import { runActor } from "@/lib/apify/client";
import type { EnrichmentAgent, EnrichedThread } from "../interfaces";
import { ApifyActorError } from "@/lib/utils/errors";

const ACTORS = {
  facebook_groups: "apify/facebook-posts-scraper",
} as const;

export class ApifyRedditAgent implements EnrichmentAgent {
  name = "ApifyRedditAgent";

  async enrich(threadUrl: string, platform: string): Promise<EnrichedThread> {
    switch (platform) {
      case "reddit":
        return this.enrichReddit(threadUrl);
      case "quora":
        return this.enrichQuora(threadUrl);
      case "facebook_groups":
        return this.enrichFacebook(threadUrl);
      default:
        throw new ApifyActorError(
          "enrichment",
          `Unsupported platform: ${platform}`
        );
    }
  }

  private async enrichReddit(threadUrl: string): Promise<EnrichedThread> {
    // Free! Uses Reddit's public JSON API — no Apify needed.
    return scrapeRedditThread(threadUrl);
  }

  private async enrichQuora(threadUrl: string): Promise<EnrichedThread> {
    // Try free scraping first, fall back to Apify if blocked
    return scrapeQuoraQuestion(threadUrl);
  }

  private async enrichFacebook(threadUrl: string): Promise<EnrichedThread> {
    try {
      const result = await runActor(
        ACTORS.facebook_groups,
        {
          startUrls: [{ url: threadUrl }],
          maxComments: 10,
          proxy: { useApifyProxy: true },
        },
        { timeoutSecs: 300 }
      );

      if (result.items.length === 0) {
        return this.emptyResult();
      }

      const post = result.items[0] as Record<string, unknown>;

      const rawComments = (post.comments || []) as Array<Record<string, unknown>>;
      const topComments = rawComments
        .slice(0, 10)
        .map((comment) => ({
          author: String(comment.author || comment.profileName || "anonymous"),
          body: String(comment.text || comment.message || ""),
          upvotes: Number(comment.likesCount || comment.reactions || 0),
        }))
        .filter((c) => c.body.length > 0);

      return {
        body_text: String(post.text || post.message || post.content || ""),
        author: String(post.author || post.profileName || "unknown"),
        comment_count: Number(post.commentsCount || rawComments.length || 0),
        upvote_count: Number(post.likesCount || post.reactions || 0),
        thread_date: String(post.time || post.timestamp || post.date || new Date().toISOString()),
        top_comments: topComments,
      };
    } catch {
      // FB scraping is fragile — return minimal data
      return this.emptyResult();
    }
  }

  private emptyResult(): EnrichedThread {
    return {
      body_text: "",
      author: "unknown",
      comment_count: 0,
      upvote_count: 0,
      thread_date: new Date().toISOString(),
      top_comments: [],
    };
  }
}
