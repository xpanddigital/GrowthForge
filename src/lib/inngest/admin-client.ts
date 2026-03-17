// Shared Supabase admin client for Inngest background jobs.
// Uses service role key (no cookies/sessions needed).
// Extracted from functions.ts for reuse across Citation Engine and Monitor.

import { createClient } from "@supabase/supabase-js";
import { NonRetriableError } from "inngest";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new NonRetriableError("Missing Supabase environment variables");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Agent action logger for background jobs (uses admin client, not SSR).
 * Wraps any async function with start/complete/fail logging to agent_actions table.
 */
export async function logAgentActionBg<T>(
  params: {
    agencyId: string;
    clientId?: string;
    agentType: string;
    agentName: string;
    trigger: string;
    triggerReferenceId?: string;
    targetType?: string;
    targetId?: string;
    inputSummary?: Record<string, unknown>;
  },
  fn: () => Promise<T>
): Promise<T> {
  const supabase = createAdminClient();
  const startTime = Date.now();

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
      const outputSummary = Array.isArray(result)
        ? { count: result.length }
        : typeof result === "object" && result !== null
          ? {
              keys: Object.keys(result as Record<string, unknown>),
              type: "object",
            }
          : { type: typeof result };

      await supabase
        .from("agent_actions")
        .update({
          status: "completed",
          duration_ms: Date.now() - startTime,
          output_summary: outputSummary,
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
