import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { createAdminClient } from "./admin-client";
import { runEntityScan } from "@/lib/entity/run-entity-scan";

const entityScan = inngest.createFunction(
  {
    id: "entity-scan",
    name: "Entity Sync Scan",
    retries: 1,
    concurrency: [{ limit: 2 }],
  },
  { event: "entity/scan" },
  async ({ event, step }) => {
    const { clientId, scanType, scanId, singlePlatform } = event.data;
    const supabase = createAdminClient();

    const agencyId = await step.run("load-agency", async () => {
      const { data: client } = await supabase
        .from("clients")
        .select("agency_id")
        .eq("id", clientId)
        .single();
      if (!client) throw new NonRetriableError(`Client ${clientId} not found`);
      return client.agency_id as string;
    });

    await step.run("run-scan", async () => {
      await runEntityScan({
        clientId,
        agencyId,
        scanId,
        scanType: scanType as 'full' | 'quick' | 'single' | 'schema_only',
        singlePlatform,
      });
    });

    return { status: "completed", scanId };
  }
);

const entityVerifyTask = inngest.createFunction(
  {
    id: "entity-verify-task",
    name: "Entity Task Verification",
    retries: 1,
    concurrency: [{ limit: 3 }],
  },
  { event: "entity/verify-task" },
  async ({ event, step }) => {
    const { taskId, clientId } = event.data;
    const supabase = createAdminClient();

    // Load the task to determine what to re-scan
    const task = await step.run("load-task", async () => {
      const { data } = await supabase
        .from("entity_tasks")
        .select("*")
        .eq("id", taskId)
        .single();
      if (!data) throw new NonRetriableError(`Task ${taskId} not found`);
      return data;
    });

    const agencyId = await step.run("load-agency", async () => {
      const { data: client } = await supabase
        .from("clients")
        .select("agency_id")
        .eq("id", clientId)
        .single();
      if (!client) throw new NonRetriableError(`Client ${clientId} not found`);
      return client.agency_id as string;
    });

    // Create a verification scan
    const scanId = await step.run("create-scan", async () => {
      const { data: scan } = await supabase
        .from("entity_scans")
        .insert({
          client_id: clientId,
          scan_type: "single",
          status: "pending",
        })
        .select("id")
        .single();
      return scan!.id as string;
    });

    // Run a single-platform or schema-only re-scan
    await step.run("verify-scan", async () => {
      const taskType = task.task_type as string;
      const isSchemaTask = ['add_schema', 'fix_schema', 'fix_robots_txt', 'create_llms_txt', 'update_llms_txt', 'fix_sameas'].includes(taskType);

      await runEntityScan({
        clientId,
        agencyId,
        scanId,
        scanType: isSchemaTask ? 'schema_only' : 'single',
        singlePlatform: isSchemaTask ? undefined : (task.platform as string),
      });
    });

    // Check if the issue was resolved
    await step.run("check-resolution", async () => {
      // Re-load the profile or schema result
      const taskPlatform = task.platform as string | null;

      if (taskPlatform) {
        const { data: profile } = await supabase
          .from("entity_profiles")
          .select("consistency_score, status")
          .eq("client_id", clientId)
          .eq("platform", taskPlatform)
          .single();

        const improved = profile && (profile.consistency_score as number) >= 80;

        await supabase.from("entity_tasks").update({
          verified: improved || false,
          verified_at: new Date().toISOString(),
          verification_note: improved
            ? `Verified: ${taskPlatform} consistency score is now ${profile?.consistency_score}/100`
            : `Not yet resolved: ${taskPlatform} consistency score is ${profile?.consistency_score ?? 'unknown'}/100`,
        }).eq("id", taskId);
      } else {
        // Schema/robots/llms tasks
        await supabase.from("entity_tasks").update({
          verified_at: new Date().toISOString(),
          verification_note: "Re-scan completed. Check schema audit page for updated results.",
        }).eq("id", taskId);
      }
    });

    return { status: "completed", taskId, scanId };
  }
);

export const entityFunctions = [entityScan, entityVerifyTask];
