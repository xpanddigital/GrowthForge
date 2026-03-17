// Reddit Enrichment Agent — fetches full thread content from Reddit.
// Uses Apify's reddit-scraper actor to get full post body, comments, metadata.
// Also handles Quora and Facebook Groups with appropriate scrapers.

import { ApifyClient } from "apify-client";
import type { EnrichmentAgent, EnrichedThread } from "../interfaces";
import { ApifyActorError } from "@/lib/utils/errors";
import { withRetry } from "@/lib/utils/retry";

// Apify actors per platform
const ACTORS = {
  reddit: "apify/reddit-scraper",
  quora: "apify/quora-scraper",
  // Facebook Groups uses a custom approach since scraping is fragile
  facebook_groups: "apify/facebook-posts-scraper",
} as const;

let _apifyClient: ApifyClient | null = null;

function getApifyClient(): ApifyClient {
  if (!_apifyClient) {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      throw new ApifyActorError(
        "enrichment",
        "APIFY_API_TOKEN environment variable is not set"
      );
    }
    _apifyClient = new ApifyClient({ token });
  }
  return _apifyClient;
}

export class ApifyRedditAgent implements EnrichmentAgent {
  name = "ApifyRedditAgent";

  /**
   * Enrich a thread URL by fetching full content from the platform.
   * Supports Reddit (primary), Quora, and Facebook Groups.
   *
   * @param threadUrl - The URL of the thread to enrich
   * @param platform - The platform: "reddit", "quora", or "facebook_groups"
   * @returns EnrichedThread with full content, comments, and metadata
   */
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

  /**
   * Enrich a Reddit thread using the Apify reddit-scraper.
   */
  private async enrichReddit(threadUrl: string): Promise<EnrichedThread> {
    return withRetry(
      async () => {
        const client = getApifyClient();
        const actorId = ACTORS.reddit;

        const run = await client.actor(actorId).call(
          {
            startUrls: [{ url: threadUrl }],
            maxComments: 15,
            maxCommentsDepth: 2,
            sort: "TOP",
            proxy: {
              useApifyProxy: true,
            },
          },
          { waitSecs: 300 } // 5 minute timeout
        );

        if (!run || run.status !== "SUCCEEDED") {
          throw new ApifyActorError(actorId, `Run failed: ${run?.status || "unknown"}`, {
            runId: run?.id,
            url: threadUrl,
          });
        }

        const { items } = await client
          .dataset(run.defaultDatasetId)
          .listItems();

        if (items.length === 0) {
          throw new ApifyActorError(actorId, "No data returned for thread", {
            url: threadUrl,
          });
        }

        const post = items[0] as Record<string, unknown>;

        // Parse comments from the response
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
      },
      {
        maxRetries: 2,
        baseDelayMs: 5000,
        maxDelayMs: 30000,
      }
    );
  }

  /**
   * Enrich a Quora thread.
   */
  private async enrichQuora(threadUrl: string): Promise<EnrichedThread> {
    return withRetry(
      async () => {
        const client = getApifyClient();
        const actorId = ACTORS.quora;

        const run = await client.actor(actorId).call(
          {
            startUrls: [{ url: threadUrl }],
            maxAnswers: 10,
            proxy: {
              useApifyProxy: true,
            },
          },
          { waitSecs: 300 }
        );

        if (!run || run.status !== "SUCCEEDED") {
          throw new ApifyActorError(actorId, `Run failed: ${run?.status || "unknown"}`, {
            runId: run?.id,
            url: threadUrl,
          });
        }

        const { items } = await client
          .dataset(run.defaultDatasetId)
          .listItems();

        if (items.length === 0) {
          throw new ApifyActorError(actorId, "No data returned for question", {
            url: threadUrl,
          });
        }

        const question = items[0] as Record<string, unknown>;

        // Quora "comments" are answers
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
      },
      {
        maxRetries: 2,
        baseDelayMs: 5000,
        maxDelayMs: 30000,
      }
    );
  }

  /**
   * Enrich a Facebook Groups thread.
   * Note: FB scraping is fragile — handle failures gracefully.
   */
  private async enrichFacebook(threadUrl: string): Promise<EnrichedThread> {
    return withRetry(
      async () => {
        const client = getApifyClient();
        const actorId = ACTORS.facebook_groups;

        const run = await client.actor(actorId).call(
          {
            startUrls: [{ url: threadUrl }],
            maxComments: 10,
            proxy: {
              useApifyProxy: true,
            },
          },
          { waitSecs: 300 }
        );

        if (!run || run.status !== "SUCCEEDED") {
          // FB scraping is fragile — return minimal data instead of failing hard
          return {
            body_text: "",
            author: "unknown",
            comment_count: 0,
            upvote_count: 0,
            thread_date: new Date().toISOString(),
            top_comments: [],
          };
        }

        const { items } = await client
          .dataset(run.defaultDatasetId)
          .listItems();

        if (items.length === 0) {
          return {
            body_text: "",
            author: "unknown",
            comment_count: 0,
            upvote_count: 0,
            thread_date: new Date().toISOString(),
            top_comments: [],
          };
        }

        const post = items[0] as Record<string, unknown>;

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
      },
      {
        maxRetries: 1, // Fewer retries for FB since it's fragile
        baseDelayMs: 5000,
        maxDelayMs: 15000,
      }
    );
  }
}
