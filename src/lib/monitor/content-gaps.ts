// Content Gap Analyzer — identifies content competitors are cited for that the client is missing.
// Runs monthly (or manually). Uses Claude Sonnet to analyze competitive citation patterns.

import { createAdminClient } from "@/lib/inngest/admin-client";
import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

const SYSTEM_PROMPT = `You are an AI SEO content strategist. Analyze the competitive citation data and identify content gaps — topics where competitors are cited by AI models but the client is not.

For each gap, recommend specific content the client should create. Return ONLY valid JSON.`;

interface ContentGap {
  topic: string;
  competitor_advantage: string;
  recommended_content: string;
  content_type: string;
  publish_target: string;
  impact: "high" | "medium" | "low";
  detail: string;
}

/**
 * Analyze monitor results for the past month and identify content gaps.
 */
export async function analyzeContentGaps(
  clientId: string,
  snapshotId?: string
): Promise<ContentGap[]> {
  const supabase = createAdminClient();

  // Get client info
  const { data: client } = await supabase
    .from("clients")
    .select("name, brand_brief, key_differentiators")
    .eq("id", clientId)
    .single();

  if (!client) throw new Error(`Client ${clientId} not found`);

  // Get recent results where brand was NOT mentioned but competitors were
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: competitivResults } = await supabase
    .from("monitor_results")
    .select(
      "ai_model, full_response, competitor_details, competitor_mentions, sources_cited"
    )
    .eq("client_id", clientId)
    .eq("brand_mentioned", false)
    .gte("tested_at", thirtyDaysAgo.toISOString())
    .order("tested_at", { ascending: false })
    .limit(50);

  if (!competitivResults || competitivResults.length === 0) {
    return [];
  }

  // Get competitors for context
  const { data: competitors } = await supabase
    .from("monitor_competitors")
    .select("competitor_name")
    .eq("client_id", clientId)
    .eq("is_active", true);

  // Build analysis prompt
  const competitorSummaries = competitivResults
    .slice(0, 20) // Limit to avoid token overflow
    .map(
      (r: {
        ai_model: string;
        competitor_mentions: string[];
        full_response: string;
      }) =>
        `Model: ${r.ai_model}\nCompetitors cited: ${(r.competitor_mentions || []).join(", ")}\nResponse excerpt: ${(r.full_response || "").substring(0, 500)}`
    )
    .join("\n\n---\n\n");

  const userPrompt = `Analyze these AI model responses where competitors are cited but ${client.name} is NOT mentioned.

CLIENT: ${client.name}
WHAT THEY DO: ${(client.brand_brief as string || "").substring(0, 300)}
DIFFERENTIATORS: ${(client.key_differentiators as string || "").substring(0, 200)}
COMPETITORS: ${(competitors || []).map((c: { competitor_name: string }) => c.competitor_name).join(", ")}

COMPETITIVE CITATION DATA:
${competitorSummaries}

Identify 3-6 content gaps. For each, specify:
- topic: The specific topic where the client has no AI visibility
- competitor_advantage: What competitor content is being cited
- recommended_content: Specific content the client should create
- content_type: blog_post | comparison_page | faq | case_study | forum_post | data_study
- publish_target: Where to publish (website, reddit, quora, linkedin)
- impact: high | medium | low (based on search volume and competitive gap size)
- detail: 2-3 sentences explaining the rationale

Return JSON:
{
  "gaps": [
    {
      "topic": "...",
      "competitor_advantage": "...",
      "recommended_content": "...",
      "content_type": "...",
      "publish_target": "...",
      "impact": "high",
      "detail": "..."
    }
  ]
}`;

  const result = await callSonnet(userPrompt, {
    systemPrompt: SYSTEM_PROMPT,
    temperature: 0.3,
    maxTokens: 3000,
  });

  const parsed = parseClaudeJson<{ gaps: ContentGap[] }>(result.text);

  // Insert gaps into database
  if (parsed.gaps.length > 0) {
    const rows = parsed.gaps.map((gap) => ({
      client_id: clientId,
      snapshot_id: snapshotId || null,
      topic: gap.topic,
      competitor_advantage: gap.competitor_advantage,
      recommended_content: gap.recommended_content,
      content_type: gap.content_type,
      publish_target: gap.publish_target,
      impact: gap.impact,
      detail: gap.detail,
      status: "open",
    }));

    await supabase.from("monitor_content_gaps").insert(rows);
  }

  return parsed.gaps;
}
