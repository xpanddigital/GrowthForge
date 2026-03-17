import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { inngest } from "@/lib/inngest/client";

// GET /api/cron/discovery — Scheduled discovery scan (Vercel Cron)
// Vercel cron config: { "path": "/api/cron/discovery", "schedule": "0 6 * * 2,5" }
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized invocations
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client since cron jobs don't have user sessions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all active agencies
    const { data: agencies, error: agencyError } = await supabase
      .from("agencies")
      .select("id")
      .eq("is_active", true);

    if (agencyError) {
      throw new Error(`Failed to load agencies: ${agencyError.message}`);
    }

    if (!agencies || agencies.length === 0) {
      return NextResponse.json({
        data: { message: "No active agencies found", jobsQueued: 0 },
      });
    }

    // Get all active clients across active agencies
    const agencyIds = agencies.map((a: { id: string }) => a.id);

    const { data: clients, error: clientError } = await supabase
      .from("clients")
      .select("id, name, agency_id")
      .in("agency_id", agencyIds)
      .eq("is_active", true);

    if (clientError) {
      throw new Error(`Failed to load clients: ${clientError.message}`);
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        data: { message: "No active clients found", jobsQueued: 0 },
      });
    }

    // For each client, verify they have active keywords before queuing
    let jobsQueued = 0;
    const results: Array<{
      clientId: string;
      clientName: string;
      runId: string;
    }> = [];

    for (const client of clients) {
      const c = client as { id: string; name: string; agency_id: string };

      // Check that the client has active keywords
      const { count } = await supabase
        .from("keywords")
        .select("id", { count: "exact", head: true })
        .eq("client_id", c.id)
        .eq("is_active", true);

      if (!count || count === 0) {
        continue;
      }

      // Create a discovery run record
      const { data: run, error: runError } = await supabase
        .from("discovery_runs")
        .insert({
          client_id: c.id,
          run_type: "serp_scan",
          status: "pending",
          metadata: {
            triggered_by: "cron",
            keyword_count: count,
          },
        })
        .select("id")
        .single();

      if (runError || !run) {
        console.error(
          `Failed to create run for client ${c.id}:`,
          runError?.message
        );
        continue;
      }

      // Queue the Inngest job
      await inngest.send({
        name: "discovery/scan",
        data: {
          clientId: c.id,
          runId: run.id,
        },
      });

      jobsQueued++;
      results.push({
        clientId: c.id,
        clientName: c.name,
        runId: run.id,
      });
    }

    return NextResponse.json({
      data: {
        message: `Queued ${jobsQueued} discovery scans`,
        jobsQueued,
        clients: results,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Cron discovery error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
