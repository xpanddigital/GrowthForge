// Audit Orchestrator — coordinates all 5 pillar scans in parallel,
// calculates composite scores, and generates the executive summary + action plan.

import { createClient } from "@supabase/supabase-js";
import { CitationScanAgent } from "@/lib/agents/audit/citation-scan.agent";
import { AIPresenceAgent } from "@/lib/agents/audit/ai-presence.agent";
import { EntityCheckAgent } from "@/lib/agents/audit/entity-check.agent";
import { ReviewScanAgent } from "@/lib/agents/audit/review-scan.agent";
import { PressScanAgent } from "@/lib/agents/audit/press-scan.agent";
import { logAgentAction } from "@/lib/agents/logger";
import { callOpus, parseClaudeJson } from "@/lib/ai/claude";
import type { AuditPillarResult } from "@/lib/agents/interfaces";

const PILLAR_WEIGHTS = {
  citations: 0.25,
  ai_presence: 0.30,
  entities: 0.15,
  reviews: 0.15,
  press: 0.15,
} as const;

const PILLAR_AGENTS = {
  citations: new CitationScanAgent(),
  ai_presence: new AIPresenceAgent(),
  entities: new EntityCheckAgent(),
  reviews: new ReviewScanAgent(),
  press: new PressScanAgent(),
} as const;

type PillarName = keyof typeof PILLAR_AGENTS;

interface AuditOrchestratorInput {
  auditId: string;
  clientId: string;
  agencyId: string;
  auditType: "full" | "citation_only" | "ai_presence_only" | "quick";
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getPillarsForAuditType(
  auditType: AuditOrchestratorInput["auditType"]
): PillarName[] {
  switch (auditType) {
    case "full":
      return ["citations", "ai_presence", "entities", "reviews", "press"];
    case "citation_only":
      return ["citations", "ai_presence"];
    case "ai_presence_only":
      return ["ai_presence"];
    case "quick":
      return ["citations", "ai_presence", "entities"];
    default:
      return ["citations", "ai_presence", "entities", "reviews", "press"];
  }
}

/**
 * Runs a single pillar scan, updating the database as it progresses.
 */
async function runPillarScan(
  supabase: ReturnType<typeof createAdminClient>,
  auditId: string,
  pillar: PillarName,
  client: Record<string, unknown>,
  keywords: Array<Record<string, unknown>>,
  agencyId: string,
  clientId: string
): Promise<AuditPillarResult | null> {
  // Mark pillar as running
  await supabase
    .from("audit_pillar_results")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .eq("audit_id", auditId)
    .eq("pillar", pillar);

  try {
    const agent = PILLAR_AGENTS[pillar];

    const result = await logAgentAction(
      {
        agencyId,
        clientId,
        agentType: `audit_${pillar}`,
        agentName: agent.name,
        trigger: "audit",
        triggerReferenceId: auditId,
        targetType: "audit",
        targetId: auditId,
        inputSummary: { pillar, keywordCount: keywords.length },
      },
      () => agent.scan(client, keywords)
    );

    // Mark pillar as completed
    await supabase
      .from("audit_pillar_results")
      .update({
        status: "completed",
        score: result.score,
        summary: result.summary,
        findings: result.findings,
        recommendations: result.recommendations,
        completed_at: new Date().toISOString(),
      })
      .eq("audit_id", auditId)
      .eq("pillar", pillar);

    return result;
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);

    // Mark pillar as failed
    await supabase
      .from("audit_pillar_results")
      .update({
        status: "failed",
        error_message: errMessage,
        completed_at: new Date().toISOString(),
      })
      .eq("audit_id", auditId)
      .eq("pillar", pillar);

    console.error(`Pillar ${pillar} failed:`, errMessage);
    return null;
  }
}

/**
 * Generates the executive summary and action plan using Claude Opus.
 */
async function generateActionPlan(
  clientName: string,
  pillarResults: Record<string, AuditPillarResult | null>,
  compositeScore: number
): Promise<{
  executive_summary: string;
  action_plan: Array<{
    priority: number;
    pillar: string;
    action: string;
    impact: string;
    effort: string;
    timeline: string;
    module: string;
  }>;
  headline_stat: string;
  biggest_gap: string;
  biggest_quick_win: string;
}> {
  const pillarSummaries = Object.entries(pillarResults)
    .filter(([, result]) => result !== null)
    .map(([pillar, result]) => {
      const r = result!;
      return `- ${pillar}: ${r.score}/100 — ${r.summary}\n  Key findings: ${JSON.stringify(r.findings).slice(0, 500)}`;
    })
    .join("\n\n");

  const prompt = `You are an AI SEO strategist analyzing an audit for ${clientName}.

Here are the pillar scores and findings:
${pillarSummaries}

Composite AI Visibility Score: ${compositeScore}/100

Generate:

1. EXECUTIVE SUMMARY (3-4 paragraphs)
Write a clear, honest assessment of the client's AI visibility posture.
Lead with the biggest finding. Compare to competitors where relevant.
Use specific numbers from the findings. End with the opportunity.

2. PRIORITIZED ACTION PLAN (5-8 actions)
Rank by impact-to-effort ratio. For each action:
- Priority number (1 = do first)
- Which pillar it addresses
- Specific action to take
- Expected impact (high/medium/low)
- Effort required (high/medium/low)
- Estimated timeline
- Which MentionLayer module handles this (Citation Engine, PressForge, Entity Sync, Review Engine, AI Monitor)

Focus on quick wins first (high impact, low effort).

Return as JSON:
{
  "executive_summary": "...",
  "action_plan": [
    {
      "priority": 1,
      "pillar": "citations",
      "action": "specific action description",
      "impact": "high",
      "effort": "low",
      "timeline": "Week 1-2",
      "module": "Citation Engine"
    }
  ],
  "headline_stat": "one punchy stat that sells the opportunity",
  "biggest_gap": "pillar_name",
  "biggest_quick_win": "pillar_name"
}`;

  const result = await callOpus(prompt, {
    systemPrompt:
      "You are a senior AI SEO strategist. Analyze audit data and generate actionable, specific recommendations. Be direct and data-driven. Use the exact numbers from the findings.",
    maxTokens: 4096,
    temperature: 0.5,
  });

  return parseClaudeJson(result.text);
}

/**
 * Main orchestrator — runs the full audit pipeline.
 */
export async function runAudit(input: AuditOrchestratorInput): Promise<void> {
  const supabase = createAdminClient();
  const { auditId, clientId, agencyId, auditType } = input;

  // Mark audit as running
  await supabase
    .from("audits")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .eq("id", auditId);

  try {
    // Fetch client data
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    // Fetch keywords
    const { data: keywords } = await supabase
      .from("keywords")
      .select("*")
      .eq("client_id", clientId)
      .eq("is_active", true)
      .limit(100);

    const keywordList = keywords || [];

    // Determine which pillars to run
    const pillarsToRun = getPillarsForAuditType(auditType);

    // Skip pillars not in this audit type
    const allPillars: PillarName[] = [
      "citations",
      "ai_presence",
      "entities",
      "reviews",
      "press",
    ];
    for (const pillar of allPillars) {
      if (!pillarsToRun.includes(pillar)) {
        await supabase
          .from("audit_pillar_results")
          .update({ status: "skipped" })
          .eq("audit_id", auditId)
          .eq("pillar", pillar);
      }
    }

    // Run all applicable pillars in parallel
    const pillarPromises = pillarsToRun.map((pillar) =>
      runPillarScan(
        supabase,
        auditId,
        pillar,
        client as Record<string, unknown>,
        keywordList as Array<Record<string, unknown>>,
        agencyId,
        clientId
      ).then((result) => [pillar, result] as const)
    );

    const results = await Promise.all(pillarPromises);
    const pillarResults: Record<string, AuditPillarResult | null> =
      Object.fromEntries(results);

    // Calculate composite score from completed pillars
    let compositeScore = 0;
    let totalWeight = 0;

    for (const [pillar, result] of Object.entries(pillarResults)) {
      if (result !== null && pillar in PILLAR_WEIGHTS) {
        const weight = PILLAR_WEIGHTS[pillar as PillarName];
        compositeScore += result.score * weight;
        totalWeight += weight;
      }
    }

    // Normalize if not all pillars completed
    if (totalWeight > 0 && totalWeight < 1) {
      compositeScore = compositeScore / totalWeight;
    }
    compositeScore = Math.round(compositeScore);

    // Extract individual pillar scores
    const pillarScores: Record<string, number | null> = {};
    for (const pillar of allPillars) {
      pillarScores[pillar] = pillarResults[pillar]?.score ?? null;
    }

    // Generate executive summary and action plan
    let executiveSummary = "";
    let actionPlan: Array<Record<string, unknown>> = [];

    const completedCount = Object.values(pillarResults).filter(
      (r) => r !== null
    ).length;

    if (completedCount >= 2) {
      try {
        const plan = await generateActionPlan(
          client.name,
          pillarResults,
          compositeScore
        );
        executiveSummary = plan.executive_summary;
        actionPlan = plan.action_plan;
      } catch (err) {
        console.error("Action plan generation failed:", err);
        executiveSummary =
          `AI Visibility Audit completed with a composite score of ${compositeScore}/100. ` +
          `Review the individual pillar results below for detailed findings and recommendations.`;
      }
    }

    // Update main audit record with final results
    await supabase
      .from("audits")
      .update({
        status: "completed",
        composite_score: compositeScore,
        citation_score: pillarScores.citations,
        ai_presence_score: pillarScores.ai_presence,
        entity_score: pillarScores.entities,
        review_score: pillarScores.reviews,
        press_score: pillarScores.press,
        executive_summary: executiveSummary,
        action_plan: actionPlan,
        completed_at: new Date().toISOString(),
        credits_used: auditType === "full" ? 50 : auditType === "quick" ? 20 : 15,
      })
      .eq("id", auditId);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("Audit failed:", errMessage);

    await supabase
      .from("audits")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", auditId);
  }
}
