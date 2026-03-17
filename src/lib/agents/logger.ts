// Every agent call MUST be wrapped with the action logger.
// Provides full observability into what ran, when, how long it took,
// and whether it succeeded or failed.

import { createServerClient } from "@/lib/supabase/server";

interface LogAgentActionParams {
  agencyId: string;
  clientId?: string;
  agentType: string;
  agentName: string;
  trigger: string;
  triggerReferenceId?: string;
  targetType?: string;
  targetId?: string;
  inputSummary?: Record<string, unknown>;
}

function summarizeOutput(result: unknown): Record<string, unknown> {
  if (result === null || result === undefined) return {};
  if (Array.isArray(result)) return { count: result.length };
  if (typeof result === "object") {
    const keys = Object.keys(result as Record<string, unknown>);
    return { keys, type: "object" };
  }
  return { type: typeof result };
}

export async function logAgentAction<T>(
  params: LogAgentActionParams,
  fn: () => Promise<T>
): Promise<T> {
  const supabase = await createServerClient();
  const startTime = Date.now();

  // Insert initial action record
  const { data: action } = await supabase
    .from("agent_actions")
    .insert({
      agency_id: params.agencyId,
      client_id: params.clientId || null,
      agent_type: params.agentType,
      agent_name: params.agentName,
      trigger: params.trigger,
      trigger_reference_id: params.triggerReferenceId || null,
      target_type: params.targetType || null,
      target_id: params.targetId || null,
      status: "started",
      input_summary: params.inputSummary || {},
    })
    .select("id")
    .single();

  const actionId = action?.id;

  try {
    const result = await fn();

    if (actionId) {
      await supabase
        .from("agent_actions")
        .update({
          status: "completed",
          duration_ms: Date.now() - startTime,
          output_summary: summarizeOutput(result),
        })
        .eq("id", actionId);
    }

    return result;
  } catch (error) {
    if (actionId) {
      const err = error instanceof Error ? error : new Error(String(error));
      await supabase
        .from("agent_actions")
        .update({
          status: "failed",
          duration_ms: Date.now() - startTime,
          error_code: (error as { code?: string }).code || "UNKNOWN",
          error_message: err.message,
        })
        .eq("id", actionId);
    }

    throw error;
  }
}
