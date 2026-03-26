import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { z } from "zod";

const suggestSchema = z.object({
  websiteUrl: z.string().url(),
  companyName: z.string().min(1),
});

// POST /api/free-audit/suggest-keywords
// Uses Claude Sonnet to suggest buying-intent keywords based on the business.
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { websiteUrl, companyName } = suggestSchema.parse(body);

    // Use Claude Sonnet to generate keyword suggestions
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback: return generic keywords if no API key
      return NextResponse.json({
        data: {
          keywords: [
            `best ${companyName.toLowerCase()} alternatives`,
            `${companyName.toLowerCase()} reviews`,
            `${companyName.toLowerCase()} vs competitors`,
          ],
        },
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are an SEO keyword researcher. Given a business called "${companyName}" with website "${websiteUrl}", suggest 8 buying-intent keywords that potential customers would search for when looking for this type of product or service.

Focus on:
- "Best [category]" queries
- "How to [problem they solve]" queries
- "[Category] for [audience]" queries
- Comparison queries ("[category] alternatives", "[category] vs")
- Review/recommendation queries

Return ONLY a JSON array of keyword strings. No explanation, no markdown formatting.
Example: ["best music licensing services", "how to license music for videos", "music licensing for independent artists"]`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "[]";

    // Parse the JSON array from Claude's response
    let keywords: string[];
    try {
      keywords = JSON.parse(text);
      if (!Array.isArray(keywords)) throw new Error("Not an array");
      keywords = keywords.filter((k) => typeof k === "string").slice(0, 10);
    } catch {
      // Fallback if Claude returns malformed JSON
      keywords = [
        `best ${companyName.toLowerCase()} alternatives`,
        `${companyName.toLowerCase()} reviews`,
      ];
    }

    return NextResponse.json({ data: { keywords } });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
