// Core monitoring function — orchestrates the full monitoring pipeline for a client.
// Loads keyword configs → selects rotated prompts → runs tests → generates snapshot.

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

interface MonitoringRunResult {
  clientId: string;
  totalTests: number;
  totalMentions: number;
  snapshotId: string | null;
  aiVisibilityScore: number;
}

/**
 * Run monitoring for a single client. Called by Inngest jobs.
 */
export async function runMonitoringForClient(
  clientId: string,
  agencyId: string,
  trigger: string
): Promise<MonitoringRunResult> {
  const supabase = createAdminClient();

  // 1. Load client data
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) throw new Error(`Client ${clientId} not found`);

  // 2. Load competitors
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

  // 3. Load keyword configs with active monitoring
  const { data: keywordConfigs } = await supabase
    .from("monitor_keyword_config")
    .select("*, keywords!inner(*)")
    .eq("client_id", clientId)
    .eq("is_monitored", true);

  // 4. Load custom prompts
  const { data: customPrompts } = await supabase
    .from("monitor_prompts")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true);

  // 5. Build prompt list: keyword-based + custom
  const promptsToTest: Array<{
    promptText: string;
    keywordId: string | null;
    promptId: string | null;
    models: string[];
    location?: { countryCode: string; locationString?: string };
  }> = [];

  // Keyword-based prompts with rotation
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

    // Update last_used_at for selected prompts
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

  // Custom prompts
  for (const prompt of customPrompts || []) {
    promptsToTest.push({
      promptText: prompt.prompt_text as string,
      keywordId: null,
      promptId: prompt.id as string,
      models: prompt.test_models as string[],
    });
  }

  if (promptsToTest.length === 0) {
    return {
      clientId,
      totalTests: 0,
      totalMentions: 0,
      snapshotId: null,
      aiVisibilityScore: 0,
    };
  }

  // 6. Run tests for each prompt × model combination
  let totalTests = 0;
  let totalMentions = 0;
  let totalRecommendations = 0;
  let totalLinks = 0;
  let totalProminence = 0;
  let prominenceCount = 0;
  let responseChanges = 0;

  const modelStats: Record<string, { mentioned: number; total: number }> = {};
  const keywordStats: Record<string, { mentioned: number; total: number }> = {};
  const competitorMentionCounts: Record<string, number> = {};
  const collectedResponses: string[] = [];

  for (const promptEntry of promptsToTest) {
    for (const modelName of promptEntry.models) {
      if (!AI_MODELS.includes(modelName as AIModel)) continue;

      const agentKey = modelName as AIModel;
      const agent = agents.monitor[agentKey];
      if (!agent || !("test" in agent)) continue;

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

        // Check for response hash changes (drift detection)
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
            responseChanges++;
          }
        }

        // Insert result into monitor_results
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

        // Accumulate stats
        totalTests++;
        if (result.brandMentioned) totalMentions++;
        if (result.brandRecommended) totalRecommendations++;
        if (result.brandLinked) totalLinks++;
        if (result.prominenceScore > 0) {
          totalProminence += result.prominenceScore;
          prominenceCount++;
        }

        // Model stats
        if (!modelStats[modelName]) {
          modelStats[modelName] = { mentioned: 0, total: 0 };
        }
        modelStats[modelName].total++;
        if (result.brandMentioned) modelStats[modelName].mentioned++;

        // Keyword stats
        if (promptEntry.keywordId) {
          if (!keywordStats[promptEntry.keywordId]) {
            keywordStats[promptEntry.keywordId] = { mentioned: 0, total: 0 };
          }
          keywordStats[promptEntry.keywordId].total++;
          if (result.brandMentioned) {
            keywordStats[promptEntry.keywordId].mentioned++;
          }
        }

        // Competitor stats
        for (const comp of result.competitorDetails) {
          if (comp.mentioned) {
            competitorMentionCounts[comp.name] =
              (competitorMentionCounts[comp.name] || 0) + 1;
          }
        }

        // Collect response text for post-scan competitor auto-discovery
        if (result.fullResponse) {
          collectedResponses.push(result.fullResponse);
        }
      } catch (error) {
        console.error(
          `Monitor test failed for ${modelName}:`,
          error instanceof Error ? error.message : error
        );
        // Continue with other tests — don't fail the whole run
      }
    }
  }

  // 7. Auto-discover competitors from collected responses
  if (collectedResponses.length > 0) {
    try {
      const existingNames = competitorList.map((c) => c.name);
      const discovered = await extractCompetitorsFromResponses(
        collectedResponses,
        client.name as string,
        [],
        existingNames
      );

      if (discovered.length > 0) {
        console.log(
          `[monitor] Auto-discovered ${discovered.length} competitors for ${client.name}`
        );

        // Upsert new competitors into monitor_competitors
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

        // Re-scan responses for newly discovered competitor names (simple string match)
        // to build accurate SoM counts for competitors not in the original list
        for (const comp of discovered) {
          if (competitorMentionCounts[comp.name]) continue; // already counted by analyzer
          let count = 0;
          for (const response of collectedResponses) {
            if (response.toLowerCase().includes(comp.name.toLowerCase())) {
              count++;
            }
          }
          if (count > 0) {
            competitorMentionCounts[comp.name] = count;
          }
        }

        // Update last_seen_at for all mentioned competitors
        for (const name of Object.keys(competitorMentionCounts)) {
          await supabase
            .from("monitor_competitors")
            .update({
              last_seen_at: new Date().toISOString(),
            })
            .eq("client_id", clientId)
            .eq("competitor_name", name);
        }
      }
    } catch (error) {
      console.error(
        "[monitor] Competitor auto-discovery failed (non-fatal):",
        error instanceof Error ? error.message : error
      );
      // Non-fatal — continue with snapshot creation
    }
  }

  // 8. Calculate SoM and create snapshot
  const overallSom =
    totalTests > 0 ? (totalMentions / totalTests) * 100 : 0;
  const avgProminence =
    prominenceCount > 0 ? totalProminence / prominenceCount : 0;

  // Get previous snapshot for delta calculation
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

  // Model breakdown as percentages
  const modelBreakdown: Record<
    string,
    { mentioned: number; total: number; som: number }
  > = {};
  for (const [model, stats] of Object.entries(modelStats)) {
    modelBreakdown[model] = {
      ...stats,
      som: stats.total > 0 ? (stats.mentioned / stats.total) * 100 : 0,
    };
  }

  // Keyword breakdown
  const keywordBreakdown: Record<
    string,
    { mentioned: number; total: number; som: number }
  > = {};
  for (const [kwId, stats] of Object.entries(keywordStats)) {
    keywordBreakdown[kwId] = {
      ...stats,
      som: stats.total > 0 ? (stats.mentioned / stats.total) * 100 : 0,
    };
  }

  // Competitor SoM
  const competitorSom: Record<string, number> = {};
  for (const [name, count] of Object.entries(competitorMentionCounts)) {
    competitorSom[name] =
      totalTests > 0 ? (count / totalTests) * 100 : 0;
  }

  // Top competitor
  let topCompetitorName: string | null = null;
  let topCompetitorSom = 0;
  for (const [name, som] of Object.entries(competitorSom)) {
    if (som > topCompetitorSom) {
      topCompetitorName = name;
      topCompetitorSom = som;
    }
  }

  // Calculate AI Visibility Score
  const aiVisibilityScore = calculateAIVisibilityScore({
    overall_som: overallSom,
    total_brand_mentions: totalMentions,
    total_brand_recommendations: totalRecommendations,
    avg_prominence: avgProminence,
    model_breakdown: modelStats,
    som_delta: somDelta,
  });

  // Insert snapshot
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
        total_tests_run: totalTests,
        total_brand_mentions: totalMentions,
        total_brand_recommendations: totalRecommendations,
        total_brand_links: totalLinks,
        response_changes_detected: responseChanges,
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
    totalTests,
    totalMentions,
    snapshotId: snapshot?.id || null,
    aiVisibilityScore,
  };
}
