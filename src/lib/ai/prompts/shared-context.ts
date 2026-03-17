// Shared context builders for response generation prompts.
// Thread and client context are injected into every variant prompt.

import type { Client, Thread } from "@/types/database";

export interface ResponseThreadContext {
  platform: string;
  community: string;
  title: string;
  body_text: string;
  top_comments: string;
  thread_date: string;
  suggested_angle: string;
}

export interface ResponseClientContext {
  name: string;
  brand_brief: string;
  key_differentiators: string;
  target_audience: string;
  tone_guidelines: string;
  primary_url: string;
  response_rules: string;
}

/**
 * Extract thread context for prompt injection.
 */
export function buildThreadContext(thread: Thread): ResponseThreadContext {
  const community =
    thread.subreddit
      ? `r/${thread.subreddit}`
      : thread.group_name || "Unknown community";

  // Format top comments into readable text
  let topCommentsText = "(no comments available)";
  if (
    Array.isArray(thread.top_comments) &&
    thread.top_comments.length > 0
  ) {
    topCommentsText = thread.top_comments
      .slice(0, 10) // Limit to top 10 to manage prompt size
      .map((comment) => {
        const c = comment as { author?: string; body?: string; upvotes?: number };
        const author = c.author || "anonymous";
        const upvotes = c.upvotes ?? 0;
        const body = c.body
          ? String(c.body).substring(0, 500)
          : "(no text)";
        return `[${author} | ${upvotes} upvotes]: ${body}`;
      })
      .join("\n\n");
  }

  // Calculate thread age for context
  let dateContext = "Unknown date";
  if (thread.thread_date) {
    const threadDate = new Date(thread.thread_date);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - threadDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 1) dateContext = "Today";
    else if (daysDiff <= 7) dateContext = `${daysDiff} days ago`;
    else if (daysDiff <= 30)
      dateContext = `${Math.floor(daysDiff / 7)} weeks ago`;
    else if (daysDiff <= 365)
      dateContext = `${Math.floor(daysDiff / 30)} months ago`;
    else dateContext = `${Math.floor(daysDiff / 365)} years ago`;
  }

  return {
    platform: thread.platform,
    community,
    title: thread.title,
    body_text: thread.body_text || "(original post body not available)",
    top_comments: topCommentsText,
    thread_date: dateContext,
    suggested_angle:
      thread.suggested_angle || "No specific angle suggested by classifier.",
  };
}

/**
 * Extract client context for prompt injection.
 */
export function buildClientContext(client: Client): ResponseClientContext {
  return {
    name: client.name,
    brand_brief: client.brand_brief,
    key_differentiators: client.key_differentiators || "Not specified",
    target_audience: client.target_audience || "Not specified",
    tone_guidelines: client.tone_guidelines || "Professional and helpful",
    primary_url:
      client.urls_to_mention.length > 0
        ? client.urls_to_mention[0]
        : "(no URL provided — do not include any URL)",
    response_rules:
      client.response_rules || "No additional rules specified.",
  };
}

/**
 * The ABSOLUTE RULES that apply to ALL response variants.
 * Copied exactly from the CLAUDE.md specification.
 */
export const ABSOLUTE_RULES = `## ABSOLUTE RULES (never break these)

1. NEVER start with "Great question!", "I totally agree!", "This is a great topic!"
   or any generic opener. Start with substance.
2. NEVER mention the brand name in the first sentence. Earn the mention.
3. NEVER use marketing language: "game-changer", "revolutionary", "best-in-class",
   "cutting-edge", "seamless", "robust", "leverage".
4. NEVER position yourself as the company. You are a USER who has experience with them.
5. NEVER include a URL unless the thread explicitly asks for recommendations with links.
6. ALWAYS reference specific details from the thread (OP's situation, other comments).
7. ALWAYS provide genuine value BEFORE mentioning the brand.
8. MATCH the platform's culture:
   - Reddit: Casual, can swear lightly, self-deprecating humor OK,
     markdown formatting, "edit: typo" is natural
   - Quora: More formal, structured, expertise-signaling, longer answers OK
   - Facebook Groups: Conversational, supportive, emoji OK but not excessive
9. For threads older than 30 days, acknowledge lateness: "Late to this thread but..."
10. Occasionally mention a competitor positively (credibility through balance).
11. Imperfect formatting is GOOD on Reddit. Don't be too polished.
12. Length: Reddit = 2-4 paragraphs. Quora = 3-5 paragraphs. FB = 1-3 paragraphs.`;

/**
 * Build the client context section for injection into prompts.
 */
export function formatClientContextBlock(ctx: ResponseClientContext): string {
  return `## CLIENT CONTEXT

Brand: ${ctx.name}
What they do: ${ctx.brand_brief}
Differentiator: ${ctx.key_differentiators}
Target audience: ${ctx.target_audience}
Tone: ${ctx.tone_guidelines}
URL (use sparingly): ${ctx.primary_url}
Special rules: ${ctx.response_rules}`;
}

/**
 * Build the thread context section for injection into prompts.
 */
export function formatThreadContextBlock(ctx: ResponseThreadContext): string {
  return `## THREAD CONTEXT

Platform: ${ctx.platform}
Community: ${ctx.community}
Title: ${ctx.title}
Post body: ${ctx.body_text}
Top comments:
${ctx.top_comments}
Thread date: ${ctx.thread_date}
AI's suggested angle: ${ctx.suggested_angle}`;
}
