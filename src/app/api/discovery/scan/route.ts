import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { triggerScanSchema } from "@/lib/utils/validators";
import { handleApiError, RateLimitError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { rateLimit } from "@/lib/utils/rate-limit";
import { checkCredits, InsufficientCreditsError } from "@/lib/billing/credits";
import { CREDIT_COSTS } from "@/lib/billing/stripe";

// POST /api/discovery/scan — Trigger a manual discovery scan
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    // Authenticate
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists and get their agency
    const { data: user } = await supabase
      .from("users")
      .select("agency_id, role")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Viewers cannot trigger scans
    if (user.role === "viewer") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Rate limit: max 5 scans per hour per agency
    rateLimit(`discovery:${user.agency_id}`, { maxRequests: 5, windowMs: 3_600_000 });

    // Parse and validate request body
    const body = await request.json();
    const validated = triggerScanSchema.parse(body);

    // Verify client belongs to user's agency
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, agency_id")
      .eq("id", validated.client_id)
      .eq("agency_id", user.agency_id)
      .eq("is_active", true)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    // Check credits (estimate: 1 credit per keyword scanned)
    const { data: keywordCount } = await supabase
      .from("keywords")
      .select("id", { count: "exact", head: true })
      .eq("client_id", validated.client_id)
      .eq("is_active", true);
    const estimatedCost = Math.max((keywordCount as unknown as number) || 5, 5) * CREDIT_COSTS.serp_scan;
    try {
      await checkCredits(user.agency_id, estimatedCost);
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        return NextResponse.json(
          {
            error: `Insufficient credits. Discovery scan requires ~${estimatedCost} credits. You have ${err.available}.`,
            code: "INSUFFICIENT_CREDITS",
            required: estimatedCost,
            available: err.available,
          },
          { status: 402 }
        );
      }
      throw err;
    }

    // Create a discovery run record
    const { data: run, error: runError } = await supabase
      .from("discovery_runs")
      .insert({
        client_id: validated.client_id,
        run_type: "serp_scan",
        status: "pending",
        metadata: {
          triggered_by: authUser.user.id,
          keyword_ids: validated.keyword_ids || null,
        },
      })
      .select("id")
      .single();

    if (runError || !run) {
      throw new Error(
        `Failed to create discovery run: ${runError?.message || "Unknown error"}`
      );
    }

    // Queue the Inngest job
    try {
      await inngest.send({
        name: "discovery/scan",
        data: {
          clientId: validated.client_id,
          keywordIds: validated.keyword_ids,
          runId: run.id,
        },
      });
    } catch (inngestError) {
      // Inngest may not be configured — log but don't fail the request.
      // The discovery run record is already created and can be retried.
      console.error("[discovery/scan] Inngest send failed:", inngestError);

      // Mark the run as failed so it doesn't hang as 'pending'
      await supabase
        .from("discovery_runs")
        .update({ status: "failed", error_message: "Failed to queue background job" })
        .eq("id", run.id);

      return NextResponse.json(
        { error: "Failed to queue discovery scan. Please check Inngest configuration." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        data: {
          runId: run.id,
          clientId: validated.client_id,
          status: "pending",
          message: `Discovery scan queued for ${client.name}`,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
