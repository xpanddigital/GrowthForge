// AI Monitor Inngest functions — kept separate from Citation Engine functions
// to maintain clean separation between modules.

import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { createAdminClient } from "./admin-client";
import { runMonitoringForClient } from "@/lib/monitor/run-monitoring";
import { updateCorrelationTimeline } from "@/lib/monitor/correlation-analyzer";
import { analyzeContentGaps } from "@/lib/monitor/content-gaps";

// ===========================================================================
// FUNCTION: monitor/run (manual trigger for a single client)
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

    // Load agency ID for the client
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

    // Run monitoring
    const result = await step.run("run-monitoring", async () => {
      return runMonitoringForClient(clientId, agencyId, "manual");
    });

    // Update correlation timeline
    await step.run("update-correlation", async () => {
      await updateCorrelationTimeline(clientId);
    });

    // Run content gap analysis if requested
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

    // Get all clients with active monitoring (have keyword configs or custom prompts)
    const clientIds = await step.run("get-active-clients", async () => {
      // Clients with keyword monitoring
      const { data: kwClients } = await supabase
        .from("monitor_keyword_config")
        .select("client_id")
        .eq("is_monitored", true);

      // Clients with custom prompts
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
      return {
        status: "completed",
        message: "No clients with active monitoring",
      };
    }

    // Check if this is the first week of the month (for content gap analysis)
    const isFirstWeekOfMonth = new Date().getDate() <= 7;

    // Queue individual runs for each client
    const results: Array<{
      clientId: string;
      totalTests: number;
      totalMentions: number;
      aiVisibilityScore: number;
    }> = [];

    for (const clientId of clientIds) {
      const result = await step.run(
        `monitor-client-${clientId}`,
        async () => {
          // Get agency ID
          const { data } = await supabase
            .from("clients")
            .select("agency_id")
            .eq("id", clientId)
            .single();

          if (!data) return null;

          const monitorResult = await runMonitoringForClient(
            clientId,
            data.agency_id as string,
            "cron"
          );

          // Update correlation timeline
          await updateCorrelationTimeline(clientId);

          // Monthly content gap analysis
          if (isFirstWeekOfMonth) {
            await analyzeContentGaps(
              clientId,
              monitorResult.snapshotId || undefined
            );
          }

          return monitorResult;
        }
      );

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
