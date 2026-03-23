// Reddit Enrichment Agent — fetches full thread content from Reddit.
// Uses Apify actors via REST API (no SDK) to get full post body, comments, metadata.
// Also handles Quora and Facebook Groups with appropriate scrapers.

import { runActor } from "@/lib/apify/client";
import type { EnrichmentAgent, EnrichedThread } from "../interfaces";
import { ApifyActorError } from "@/lib/utils/errors";

// Apify actors per platform
const ACTORS = {
  reddit: "apify/reddit-scraper",
  quora: "apify/quora-scraper",
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
    const result = await runActor(
      ACTORS.reddit,
      {
        startUrls: [{ url: threadUrl }],
        maxComments: 15,
        maxCommentsDepth: 2,
        sort: "TOP",
        proxy: { useApifyProxy: true },
      },
      { timeoutSecs: 300 }
    );

    if (result.items.length === 0) {
      throw new ApifyActorError(ACTORS.reddit, "No data returned for thread", {
        url: threadUrl,
      });
    }

    const post = result.items[0] as Record<string, unknown>;

    const rawComments = (post.comments || []) as Array<Record<string, unknown>>;
    const topComments = rawComments
      .slice(0, 15)
      .map((comment) => ({
        author: String(comment.author || comment.username || "anonymous"),
        body: String(comment.body || comment.text || ""),
        upvotes: Number(comment.upVotes || comment.score || 0),
      }))
      .filter((c) => c.body.length > 0);

    return {
      body_text: String(post.body || post.selftext || post.text || ""),
      author: String(post.author || post.username || "unknown"),
      comment_count: Number(post.numberOfComments || post.numComments || rawComments.length || 0),
      upvote_count: Number(post.upVotes || post.score || 0),
      thread_date: String(post.createdAt || post.created || new Date().toISOString()),
      top_comments: topComments,
    };
  }

  private async enrichQuora(threadUrl: string): Promise<EnrichedThread> {
    const result = await runActor(
      ACTORS.quora,
      {
        startUrls: [{ url: threadUrl }],
        maxAnswers: 10,
        proxy: { useApifyProxy: true },
      },
      { timeoutSecs: 300 }
    );

    if (result.items.length === 0) {
      throw new ApifyActorError(ACTORS.quora, "No data returned for question", {
        url: threadUrl,
      });
    }

    const question = result.items[0] as Record<string, unknown>;

    const rawAnswers = (question.answers || []) as Array<Record<string, unknown>>;
    const topComments = rawAnswers
      .slice(0, 10)
      .map((answer) => ({
        author: String(answer.author || answer.authorName || "anonymous"),
        body: String(answer.body || answer.text || answer.content || ""),
        upvotes: Number(answer.upvotes || answer.upVotes || 0),
      }))
      .filter((a) => a.body.length > 0);

    return {
      body_text: String(question.body || question.text || question.question || ""),
      author: String(question.author || question.authorName || "unknown"),
      comment_count: rawAnswers.length,
      upvote_count: Number(question.upvotes || question.views || 0),
      thread_date: String(question.createdAt || question.datePublished || new Date().toISOString()),
      top_comments: topComments,
    };
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
        return {
          body_text: "",
          author: "unknown",
          comment_count: 0,
          upvote_count: 0,
          thread_date: new Date().toISOString(),
          top_comments: [],
        };
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
}
