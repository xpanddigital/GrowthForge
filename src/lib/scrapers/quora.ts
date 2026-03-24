// Quora Enrichment — uses Perplexity API to read and summarize Quora content.
// Quora is behind Cloudflare anti-bot protection, so direct scraping is impossible.
// Perplexity can access and cite Quora pages, making it a reliable (and cheap) proxy.
// Cost: ~$0.005 per question (vs $4.00 per Apify run).

import type { EnrichedThread } from "@/lib/agents/interfaces";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Enrich a Quora question using Perplexity API.
 * Perplexity reads the page and extracts the question + top answers.
 */
export async function scrapeQuoraQuestion(quoraUrl: string): Promise<EnrichedThread> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY not set — required for Quora enrichment");
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: `You are a data extraction assistant. Extract content from Quora question pages.
Return ONLY valid JSON with this exact structure, no markdown, no explanation:
{
  "question_body": "the full question text",
  "author": "question author name or unknown",
  "answer_count": number,
  "top_answers": [
    {
      "author": "answer author name",
      "body": "the full answer text (keep it complete, up to 500 words per answer)",
      "upvotes": estimated number or 0
    }
  ],
  "date": "ISO date string or empty string if unknown"
}
Extract up to 5 top answers. If the page is inaccessible, return the JSON with empty values.`,
        },
        {
          role: "user",
          content: `Extract the question and top answers from this Quora page: ${quoraUrl}`,
        },
      ],
      max_tokens: 3000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "unknown error");
    throw new Error(`Perplexity API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    // Parse the JSON response from Perplexity
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Perplexity response");
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      question_body?: string;
      author?: string;
      answer_count?: number;
      top_answers?: Array<{
        author?: string;
        body?: string;
        upvotes?: number;
      }>;
      date?: string;
    };

    const topComments = (parsed.top_answers || [])
      .slice(0, 10)
      .map((a) => ({
        author: a.author || "anonymous",
        body: a.body || "",
        upvotes: a.upvotes || 0,
      }))
      .filter((a) => a.body.length > 0);

    return {
      body_text: parsed.question_body || "",
      author: parsed.author || "unknown",
      comment_count: parsed.answer_count || topComments.length,
      upvote_count: 0, // Perplexity can't reliably get question upvotes
      thread_date: parsed.date || new Date().toISOString(),
      top_comments: topComments,
    };
  } catch (parseErr) {
    // If JSON parsing fails, use the raw text as body
    return {
      body_text: content.substring(0, 2000),
      author: "unknown",
      comment_count: 0,
      upvote_count: 0,
      thread_date: new Date().toISOString(),
      top_comments: [],
    };
  }
}
