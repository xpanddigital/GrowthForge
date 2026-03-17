// Classification prompt builder for batch thread classification.
// Used with Claude Sonnet for fast, cheap, accurate classification.
// Batches up to 20 threads per API call.

export interface ThreadForClassification {
  id: string;
  title: string;
  body_text: string | null;
  platform: string;
  subreddit?: string | null;
  group_name?: string | null;
  url: string;
}

const SYSTEM_PROMPT = `You are an AI SEO classification expert for GrowthForge, a platform that identifies high-value threads on Reddit, Quora, and Facebook Groups where brands can be authentically mentioned.

Your job is to classify each thread based on:
1. User intent — what is the original poster looking for?
2. Relevance — how relevant is this thread to the client's brand?
3. Brand mention viability — can the brand be naturally mentioned?
4. Suggested response angle — how should a response approach this thread?
5. Tags — categorization keywords for filtering

## Classification Rules

### Intent Classification
- **informational**: User is seeking knowledge, asking "how to", "what is", or exploring a topic. No buying signals.
- **transactional**: User is ready to buy/sign up. Asking for specific product links, pricing, or "where to buy".
- **commercial**: User is comparing options, asking for recommendations, "best X for Y", or evaluating alternatives. HIGHEST value for brand mentions.
- **navigational**: User is looking for a specific brand/product they already know. Low value for new brand mentions.

### Relevance Scoring (0-100)
- 90-100: Thread directly asks about the client's exact service category with buying intent
- 70-89: Thread is highly related to what the client offers, good opportunity for mention
- 50-69: Thread is tangentially related, mention would require careful angling
- 30-49: Thread is loosely related, mention might feel forced
- 0-29: Thread is not relevant enough for a brand mention

### can_mention_brand Assessment
Set to true ONLY if:
- The thread asks for recommendations or suggestions
- The thread discusses problems the client's product/service solves
- Mentioning the brand would feel natural in a response
- The thread is not already dominated by a single brand/product

Set to false if:
- The thread is a rant/complaint with no room for solutions
- The thread is locked or very old with no activity
- Mentioning a brand would feel spammy or off-topic
- The thread is about a completely different niche

### Tags
Assign 2-5 tags that help categorize the thread for filtering.
Use lowercase, hyphenated tags like: "music-industry", "indie-artist", "playlist-promotion", "licensing", "competitor-comparison"

You MUST respond with valid JSON only. No other text.`;

/**
 * Build the classification prompt for a batch of threads.
 * Batches up to 20 threads and returns a prompt that asks Claude to classify all of them.
 */
export function buildClassifyPrompt(
  threads: ThreadForClassification[],
  brandBrief: string
): { systemPrompt: string; userPrompt: string } {
  const threadDescriptions = threads
    .map((thread, index) => {
      const communityInfo = thread.subreddit
        ? `Community: r/${thread.subreddit}`
        : thread.group_name
          ? `Group: ${thread.group_name}`
          : "";

      return `--- THREAD ${index + 1} (ID: ${thread.id}) ---
Platform: ${thread.platform}
${communityInfo}
Title: ${thread.title}
Body: ${thread.body_text ? thread.body_text.substring(0, 1500) : "(no body text)"}
URL: ${thread.url}`;
    })
    .join("\n\n");

  const userPrompt = `## CLIENT BRAND BRIEF
${brandBrief}

## THREADS TO CLASSIFY (${threads.length} total)

${threadDescriptions}

## REQUIRED OUTPUT

Return a JSON object with a "classifications" array containing one entry per thread, in the same order as provided above. Each entry must have:

{
  "classifications": [
    {
      "thread_id": "the thread ID from above",
      "intent": "informational" | "transactional" | "commercial" | "navigational",
      "relevance_score": 0-100,
      "can_mention_brand": true | false,
      "suggested_angle": "1-2 sentence description of the recommended approach angle",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

Classify ALL ${threads.length} threads. Return ONLY valid JSON.`;

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}
