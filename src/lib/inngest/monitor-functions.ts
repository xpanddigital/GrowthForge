// AI Monitor Inngest functions — kept separate from Citation Engine functions
// to maintain clean separation between modules.

import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { createAdminClient } from "./admin-client";
import {
  loadPromptsForClient,
  runTestBatch,
  mergeAccumulators,
  finalizeMonitoringRun,
  runMonitoringForClient,
} from "@/lib/monitor/run-monitoring";
import type { TestResultAccumulator } from "@/lib/monitor/run-monitoring";
import { updateCorrelationTimeline } from "@/lib/monitor/correlation-analyzer";
import { analyzeContentGaps } from "@/lib/monitor/content-gaps";

const AI_MODELS = ["chatgpt", "perplexity", "gemini", "claude", "google_ai_overview"] as const;

// ===========================================================================
// FUNCTION: monitor/run (manual trigger for a single client)
// Split into per-model steps so each stays within Vercel's timeout limit.
// ===========================================================================

const monitorRun = inngest.createFunction(
  {
    id: "monitor-run",
    name: "AI Monitor Run",
    retries: 1,
    concurrency: [{ limit: 3 }],
  },
  { event: "monitor/run" },
  async ({ event, step }) => {
    const { clientId, runContentGaps } = event.data;
    const supabase = createAdminClient();

    // Step 1: Load agency ID
    const agencyId = await step.run("load-agency", async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("agency_id")
        .eq("id", clientId)
        .single();

      if (error || !data) {
        throw new NonRetriableError(`Client ${clientId} not found`);
      }
      return data.agency_id as string;
    });

    // Step 2: Load client data and build prompt list
    const { client, competitorList, promptsToTest } = await step.run(
      "load-prompts",
      async () => {
        return loadPromptsForClient(clientId);
      }
    );

    if (promptsToTest.length === 0) {
      return {
        status: "completed",
        totalTests: 0,
        totalMentions: 0,
        aiVisibilityScore: 0,
        message: "No prompts to test",
      };
    }

    // Step 3: Run tests per model × batch (small batches to stay within timeout)
    const BATCH_SIZE = 5; // 5 prompts per step ≈ 50-90 seconds
    const accumulators: TestResultAccumulator[] = [];

    for (const modelName of AI_MODELS) {
      // Split prompts that include this model into batches
      const modelPrompts = promptsToTest.filter((p) => p.models.includes(modelName));

      for (let i = 0; i < modelPrompts.length; i += BATCH_SIZE) {
        const batch = modelPrompts.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE);

        const acc = await step.run(`test-${modelName}-batch-${batchNum}`, async () => {
          return runTestBatch(
            batch,
            modelName,
            client,
            clientId,
            agencyId,
            competitorList,
            "manual"
          );
        });
        accumulators.push(acc);
      }
    }

    // Step 4: Merge results and create snapshot (includes competitor auto-discovery)
    const result = await step.run("finalize", async () => {
      const merged = mergeAccumulators(accumulators);
      return finalizeMonitoringRun(clientId, client, competitorList, merged);
    });

    // Step 5: Update correlation timeline
    await step.run("update-correlation", async () => {
      await updateCorrelationTimeline(clientId);
    });

    // Step 6: Content gap analysis (if requested)
    if (runContentGaps) {
      await step.run("content-gaps", async () => {
        await analyzeContentGaps(clientId, result.snapshotId || undefined);
      });
    }

    return {
      status: "completed",
      ...result,
    };
  }
);

// ===========================================================================
// FUNCTION: monitor/run-weekly (cron — Sunday 4am UTC)
// Processes ALL clients with active monitoring.
// ===========================================================================

const monitorRunWeekly = inngest.createFunction(
  {
    id: "monitor-run-weekly",
    name: "AI Monitor Weekly Run",
    retries: 1,
    concurrency: [{ limit: 1 }],
  },
  { event: "monitor/run-weekly" },
  async ({ step }) => {
    const supabase = createAdminClient();

    const clientIds = await step.run("get-active-clients", async () => {
      const { data: kwClients } = await supabase
        .from("monitor_keyword_config")
        .select("client_id")
        .eq("is_monitored", true);

      const { data: promptClients } = await supabase
        .from("monitor_prompts")
        .select("client_id")
        .eq("is_active", true);

      const allClientIds = new Set<string>();
      for (const row of kwClients || []) {
        allClientIds.add(row.client_id as string);
      }
      for (const row of promptClients || []) {
        allClientIds.add(row.client_id as string);
      }

      return Array.from(allClientIds);
    });

    if (clientIds.length === 0) {
      return { status: "completed", message: "No clients with active monitoring" };
    }

    const isFirstWeekOfMonth = new Date().getDate() <= 7;

    const results: Array<{
      clientId: string;
      totalTests: number;
      totalMentions: number;
      aiVisibilityScore: number;
    }> = [];

    for (const cid of clientIds) {
      // Each client gets its own step to avoid timeout
      const result = await step.run(`monitor-client-${cid}`, async () => {
        const { data } = await supabase
          .from("clients")
          .select("agency_id")
          .eq("id", cid)
          .single();

        if (!data) return null;

        const monitorResult = await runMonitoringForClient(
          cid,
          data.agency_id as string,
          "cron"
        );

        await updateCorrelationTimeline(cid);

        if (isFirstWeekOfMonth) {
          await analyzeContentGaps(cid, monitorResult.snapshotId || undefined);
        }

        return monitorResult;
      });

      if (result) {
        results.push(result);
      }
    }

    return {
      status: "completed",
      clientsProcessed: results.length,
      results,
    };
  }
);

// ===========================================================================
// Export monitor functions
// ===========================================================================

export const monitorFunctions = [monitorRun, monitorRunWeekly];
