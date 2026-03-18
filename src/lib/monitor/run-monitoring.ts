// Core monitoring functions — split into composable steps for Inngest.
// Each exported function runs within Vercel's timeout limit (~60s).

import { createAdminClient, logAgentActionBg } from "@/lib/inngest/admin-client";
import { agents } from "@/lib/agents/registry";
import { selectPromptsForRun } from "./prompt-rotation";
import { wrapPromptWithLocation } from "./location-wrapper";
import { calculateAIVisibilityScore } from "./visibility-score";
import { extractCompetitorsFromResponses } from "./extract-competitors";
import type { MonitorTestInput, MonitorTestResult } from "@/lib/agents/interfaces";

const AI_MODELS = [
  "chatgpt",
  "perplexity",
  "gemini",
  "claude",
  "google_ai_overview",
] as const;

type AIModel = (typeof AI_MODELS)[number];

// Types for data passed between steps
export interface PromptToTest {
  promptText: string;
  keywordId: string | null;
  promptId: string | null;
  models: string[];
  location?: { countryCode: string; locationString?: string };
}

export interface TestResultAccumulator {
  totalTests: number;
  totalMentions: number;
  totalRecommendations: number;
  totalLinks: number;
  totalProminence: number;
  prominenceCount: number;
  responseChanges: number;
  modelStats: Record<string, { mentioned: number; total: number }>;
  keywordStats: Record<string, { mentioned: number; total: number }>;
  competitorMentionCounts: Record<string, number>;
  collectedResponses: string[];
}

export interface MonitoringRunResult {
  clientId: string;
  totalTests: number;
  totalMentions: number;
  snapshotId: string | null;
  aiVisibilityScore: number;
}

// ---------------------------------------------------------------------------
// Step 1: Load client data and build prompt list
// ---------------------------------------------------------------------------

export async function loadPromptsForClient(clientId: string): Promise<{
  client: Record<string, unknown>;
  competitorList: Array<{ name: string; aliases: string[]; url?: string }>;
  promptsToTest: PromptToTest[];
}> {
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) throw new Error(`Client ${clientId} not found`);

  const { data: competitors } = await supabase
    .from("monitor_competitors")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true);

  const competitorList = (competitors || []).map((c: {
    competitor_name: string;
    competitor_aliases: string[];
    competitor_url: string | null;
  }) => ({
    name: c.competitor_name,
    aliases: c.competitor_aliases || [],
    url: c.competitor_url || undefined,
  }));

  const { data: keywordConfigs } = await supabase
    .from("monitor_keyword_config")
    .select("*, keywords!inner(*)")
    .eq("client_id", clientId)
    .eq("is_monitored", true);

  const { data: customPrompts } = await supabase
    .from("monitor_prompts")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true);

  const promptsToTest: PromptToTest[] = [];

  for (const config of keywordConfigs || []) {
    const kw = config.keywords as { id: string; keyword: string };
    const generatedPrompts = (config.generated_prompts as Array<{
      text: string;
      type: string;
      last_used_at: string | null;
    }>) || [];

    if (generatedPrompts.length === 0) continue;

    const selected = selectPromptsForRun(generatedPrompts, 3);

    for (const prompt of selected) {
      promptsToTest.push({
        promptText: prompt.text,
        keywordId: kw.id,
        promptId: null,
        models: config.test_models as string[],
        location: config.location_string
          ? {
              countryCode: config.location_country || "us",
              locationString: config.location_string,
            }
          : undefined,
      });
    }

    const updatedPrompts = generatedPrompts.map((p) => {
      const wasSelected = selected.some((s) => s.text === p.text);
      return wasSelected
        ? { ...p, last_used_at: new Date().toISOString() }
        : p;
    });

    await supabase
      .from("monitor_keyword_config")
      .update({
        generated_prompts: updatedPrompts,
        updated_at: new Date().toISOString(),
      })
      .eq("id", config.id);
  }

  for (const prompt of customPrompts || []) {
    promptsToTest.push({
      promptText: prompt.prompt_text as string,
      keywordId: null,
      promptId: prompt.id as string,
      models: prompt.test_models as string[],
    });
  }

  return { client, competitorList, promptsToTest };
}

// ---------------------------------------------------------------------------
// Step 2: Run a batch of tests (called per model to stay within timeout)
// ---------------------------------------------------------------------------

export async function runTestBatch(
  promptEntries: PromptToTest[],
  modelName: string,
  client: Record<string, unknown>,
  clientId: string,
  agencyId: string,
  competitorList: Array<{ name: string; aliases: string[]; url?: string }>,
  trigger: string
): Promise<TestResultAccumulator> {
  const supabase = createAdminClient();

  const acc: TestResultAccumulator = {
    totalTests: 0,
    totalMentions: 0,
    totalRecommendations: 0,
    totalLinks: 0,
    totalProminence: 0,
    prominenceCount: 0,
    responseChanges: 0,
    modelStats: {},
    keywordStats: {},
    competitorMentionCounts: {},
    collectedResponses: [],
  };

  if (!AI_MODELS.includes(modelName as AIModel)) {
    console.error(`[monitor] Model "${modelName}" not in AI_MODELS list`);
    return acc;
  }

  const agentKey = modelName as AIModel;
  const agent = agents.monitor[agentKey];
  if (!agent || !("test" in agent)) {
    console.error(`[monitor] No agent found for model "${modelName}", agent exists: ${!!agent}, has test: ${"test" in (agent || {})}`);
    return acc;
  }

  console.log(`[monitor] Starting batch for ${modelName} with ${promptEntries.length} prompts`);

  for (const promptEntry of promptEntries) {
    if (!promptEntry.models.includes(modelName)) {
      console.log(`[monitor] Skipping prompt — models=${JSON.stringify(promptEntry.models)} doesn't include ${modelName}`);
      continue;
    }

    const testInput: MonitorTestInput = {
      promptText: wrapPromptWithLocation(
        promptEntry.promptText,
        promptEntry.location,
        modelName
      ),
      clientName: client.name as string,
      clientAliases: [],
      clientUrls: (client.urls_to_mention as string[]) || [],
      competitors: competitorList,
      location: promptEntry.location,
    };

    try {
      console.log(`[monitor] Testing prompt on ${modelName}: "${promptEntry.promptText.substring(0, 60)}..."`);
      const result: MonitorTestResult = await logAgentActionBg(
        {
          agencyId,
          clientId,
          agentType: `monitor_${modelName}`,
          agentName: agent.name,
          trigger,
          inputSummary: {
            prompt: promptEntry.promptText.substring(0, 100),
            model: modelName,
          },
        },
        () => agent.test(testInput)
      );

      if (promptEntry.promptId) {
        const { data: prevResult } = await supabase
          .from("monitor_results")
          .select("response_hash")
          .eq("prompt_id", promptEntry.promptId)
          .eq("ai_model", modelName)
          .order("tested_at", { ascending: false })
          .limit(1)
          .single();

        if (
          prevResult?.response_hash &&
          prevResult.response_hash !== result.responseHash
        ) {
          acc.responseChanges++;
        }
      }

      await supabase.from("monitor_results").insert({
        prompt_id: promptEntry.promptId,
        client_id: clientId,
        keyword_id: promptEntry.keywordId,
        ai_model: modelName,
        brand_mentioned: result.brandMentioned,
        brand_linked: result.brandLinked,
        brand_recommended: result.brandRecommended,
        brand_source_urls: result.brandSourceUrls,
        mention_context: result.mentionContext,
        mention_position: result.mentionPosition,
        competitor_mentions: result.competitorDetails
          .filter((c) => c.mentioned)
          .map((c) => c.name),
        competitor_details: result.competitorDetails,
        sources_cited: result.sourcesCited,
        full_response: result.fullResponse,
        response_hash: result.responseHash,
        sentiment: result.sentiment,
        prominence_score: result.prominenceScore,
        tested_at: new Date().toISOString(),
      });

      acc.totalTests++;
      if (result.brandMentioned) acc.totalMentions++;
      if (result.brandRecommended) acc.totalRecommendations++;
      if (result.brandLinked) acc.totalLinks++;
      if (result.prominenceScore > 0) {
        acc.totalProminence += result.prominenceScore;
        acc.prominenceCount++;
      }

      if (!acc.modelStats[modelName]) {
        acc.modelStats[modelName] = { mentioned: 0, total: 0 };
      }
      acc.modelStats[modelName].total++;
      if (result.brandMentioned) acc.modelStats[modelName].mentioned++;

      if (promptEntry.keywordId) {
        if (!acc.keywordStats[promptEntry.keywordId]) {
          acc.keywordStats[promptEntry.keywordId] = { mentioned: 0, total: 0 };
        }
        acc.keywordStats[promptEntry.keywordId].total++;
        if (result.brandMentioned) {
          acc.keywordStats[promptEntry.keywordId].mentioned++;
        }
      }

      for (const comp of result.competitorDetails) {
        if (comp.mentioned) {
          acc.competitorMentionCounts[comp.name] =
            (acc.competitorMentionCounts[comp.name] || 0) + 1;
        }
      }

      if (result.fullResponse) {
        acc.collectedResponses.push(result.fullResponse);
      }
      console.log(`[monitor] ✓ ${modelName} result: mentioned=${result.brandMentioned}, prominence=${result.prominenceScore}`);
    } catch (error) {
      console.error(
        `[monitor] ✗ Test FAILED for ${modelName}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  return acc;
}

// ---------------------------------------------------------------------------
// Helper: merge multiple TestResultAccumulator objects
// ---------------------------------------------------------------------------

export function mergeAccumulators(accumulators: TestResultAccumulator[]): TestResultAccumulator {
  const merged: TestResultAccumulator = {
    totalTests: 0,
    totalMentions: 0,
    totalRecommendations: 0,
    totalLinks: 0,
    totalProminence: 0,
    prominenceCount: 0,
    responseChanges: 0,
    modelStats: {},
    keywordStats: {},
    competitorMentionCounts: {},
    collectedResponses: [],
  };

  for (const acc of accumulators) {
    merged.totalTests += acc.totalTests;
    merged.totalMentions += acc.totalMentions;
    merged.totalRecommendations += acc.totalRecommendations;
    merged.totalLinks += acc.totalLinks;
    merged.totalProminence += acc.totalProminence;
    merged.prominenceCount += acc.prominenceCount;
    merged.responseChanges += acc.responseChanges;
    merged.collectedResponses.push(...acc.collectedResponses);

    for (const [model, stats] of Object.entries(acc.modelStats)) {
      if (!merged.modelStats[model]) {
        merged.modelStats[model] = { mentioned: 0, total: 0 };
      }
      merged.modelStats[model].mentioned += stats.mentioned;
      merged.modelStats[model].total += stats.total;
    }

    for (const [kwId, stats] of Object.entries(acc.keywordStats)) {
      if (!merged.keywordStats[kwId]) {
        merged.keywordStats[kwId] = { mentioned: 0, total: 0 };
      }
      merged.keywordStats[kwId].mentioned += stats.mentioned;
      merged.keywordStats[kwId].total += stats.total;
    }

    for (const [name, count] of Object.entries(acc.competitorMentionCounts)) {
      merged.competitorMentionCounts[name] =
        (merged.competitorMentionCounts[name] || 0) + count;
    }
  }

  return merged;
}

// ---------------------------------------------------------------------------
// Step 3: Auto-discover competitors + create snapshot
// ---------------------------------------------------------------------------

export async function finalizeMonitoringRun(
  clientId: string,
  client: Record<string, unknown>,
  competitorList: Array<{ name: string; aliases: string[] }>,
  acc: TestResultAccumulator
): Promise<MonitoringRunResult> {
  const supabase = createAdminClient();

  // Auto-discover competitors
  if (acc.collectedResponses.length > 0) {
    try {
      const existingNames = competitorList.map((c) => c.name);
      const discovered = await extractCompetitorsFromResponses(
        acc.collectedResponses,
        client.name as string,
        [],
        existingNames
      );

      if (discovered.length > 0) {
        console.log(
          `[monitor] Auto-discovered ${discovered.length} competitors for ${client.name}`
        );

        for (const comp of discovered) {
          await supabase.from("monitor_competitors").upsert(
            {
              client_id: clientId,
              competitor_name: comp.name,
              competitor_aliases: [],
              is_active: true,
              discovered_via: "auto_scan",
              mention_count: comp.mentionCount,
              last_seen_at: new Date().toISOString(),
            },
            { onConflict: "client_id,competitor_name" }
          );
        }

        for (const comp of discovered) {
          if (acc.competitorMentionCounts[comp.name]) continue;
          let count = 0;
          for (const response of acc.collectedResponses) {
            if (response.toLowerCase().includes(comp.name.toLowerCase())) {
              count++;
            }
          }
          if (count > 0) {
            acc.competitorMentionCounts[comp.name] = count;
          }
        }

        for (const name of Object.keys(acc.competitorMentionCounts)) {
          await supabase
            .from("monitor_competitors")
            .update({ last_seen_at: new Date().toISOString() })
            .eq("client_id", clientId)
            .eq("competitor_name", name);
        }
      }
    } catch (error) {
      console.error(
        "[monitor] Competitor auto-discovery failed (non-fatal):",
        error instanceof Error ? error.message : error
      );
    }
  }

  // Calculate SoM and create snapshot
  const overallSom =
    acc.totalTests > 0 ? (acc.totalMentions / acc.totalTests) * 100 : 0;
  const avgProminence =
    acc.prominenceCount > 0 ? acc.totalProminence / acc.prominenceCount : 0;

  const { data: prevSnapshot } = await supabase
    .from("monitor_snapshots")
    .select("overall_som")
    .eq("client_id", clientId)
    .eq("period_type", "weekly")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  const somDelta = prevSnapshot
    ? overallSom - Number(prevSnapshot.overall_som)
    : null;

  const modelBreakdown: Record<string, { mentioned: number; total: number; som: number }> = {};
  for (const [model, stats] of Object.entries(acc.modelStats)) {
    modelBreakdown[model] = {
      ...stats,
      som: stats.total > 0 ? (stats.mentioned / stats.total) * 100 : 0,
    };
  }

  const keywordBreakdown: Record<string, { mentioned: number; total: number; som: number }> = {};
  for (const [kwId, stats] of Object.entries(acc.keywordStats)) {
    keywordBreakdown[kwId] = {
      ...stats,
      som: stats.total > 0 ? (stats.mentioned / stats.total) * 100 : 0,
    };
  }

  const competitorSom: Record<string, number> = {};
  for (const [name, count] of Object.entries(acc.competitorMentionCounts)) {
    competitorSom[name] =
      acc.totalTests > 0 ? (count / acc.totalTests) * 100 : 0;
  }

  let topCompetitorName: string | null = null;
  let topCompetitorSom = 0;
  for (const [name, som] of Object.entries(competitorSom)) {
    if (som > topCompetitorSom) {
      topCompetitorName = name;
      topCompetitorSom = som;
    }
  }

  const aiVisibilityScore = calculateAIVisibilityScore({
    overall_som: overallSom,
    total_brand_mentions: acc.totalMentions,
    total_brand_recommendations: acc.totalRecommendations,
    avg_prominence: avgProminence,
    model_breakdown: acc.modelStats,
    som_delta: somDelta,
  });

  const today = new Date().toISOString().split("T")[0];
  const { data: snapshot } = await supabase
    .from("monitor_snapshots")
    .upsert(
      {
        client_id: clientId,
        snapshot_date: today,
        period_type: "weekly",
        ai_visibility_score: aiVisibilityScore,
        overall_som: overallSom,
        model_breakdown: modelBreakdown,
        keyword_breakdown: keywordBreakdown,
        competitor_som: competitorSom,
        som_delta: somDelta,
        total_tests_run: acc.totalTests,
        total_brand_mentions: acc.totalMentions,
        total_brand_recommendations: acc.totalRecommendations,
        total_brand_links: acc.totalLinks,
        response_changes_detected: acc.responseChanges,
        avg_prominence: avgProminence,
        top_competitor_name: topCompetitorName,
        top_competitor_som: topCompetitorSom,
      },
      { onConflict: "client_id,snapshot_date,period_type" }
    )
    .select("id")
    .single();

  return {
    clientId,
    totalTests: acc.totalTests,
    totalMentions: acc.totalMentions,
    snapshotId: snapshot?.id || null,
    aiVisibilityScore,
  };
}

// ---------------------------------------------------------------------------
// Legacy wrapper (kept for weekly cron compatibility)
// ---------------------------------------------------------------------------

export async function runMonitoringForClient(
  clientId: string,
  agencyId: string,
  trigger: string
): Promise<MonitoringRunResult> {
  const { client, competitorList, promptsToTest } = await loadPromptsForClient(clientId);

  if (promptsToTest.length === 0) {
    return { clientId, totalTests: 0, totalMentions: 0, snapshotId: null, aiVisibilityScore: 0 };
  }

  const accumulators: TestResultAccumulator[] = [];
  for (const modelName of AI_MODELS) {
    const acc = await runTestBatch(
      promptsToTest, modelName, client, clientId, agencyId, competitorList, trigger
    );
    accumulators.push(acc);
  }

  const merged = mergeAccumulators(accumulators);
  return finalizeMonitoringRun(clientId, client, competitorList, merged);
}
