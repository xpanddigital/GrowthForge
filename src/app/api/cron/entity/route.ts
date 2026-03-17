import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { inngest } from "@/lib/inngest/client";

// POST /api/cron/entity — Monthly entity scan cron
// Vercel cron config: { "path": "/api/cron/entity", "schedule": "0 6 1 * *" }
export async function POST(request: Request) {
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

    // Get all active clients
    const { data: clients, error: clientError } = await supabase
      .from("clients")
      .select("id, name")
      .eq("is_active", true);

    if (clientError) {
      throw new Error(`Failed to load clients: ${clientError.message}`);
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        data: { message: "No active clients found", scansQueued: 0 },
      });
    }

    let scansQueued = 0;
    const results: Array<{
      clientId: string;
      clientName: string;
      scanId: string;
    }> = [];

    for (const client of clients) {
      const c = client as { id: string; name: string };

      // Create a scan record
      const { data: scan, error: scanError } = await supabase
        .from("entity_scans")
        .insert({
          client_id: c.id,
          scan_type: "quick",
          status: "pending",
          metadata: {
            triggered_by: "cron",
          },
        })
        .select("id")
        .single();

      if (scanError || !scan) {
        console.error(
          `Failed to create entity scan for client ${c.id}:`,
          scanError?.message
        );
        continue;
      }

      // Queue the Inngest job
      await inngest.send({
        name: "entity/scan",
        data: {
          clientId: c.id,
          scanId: scan.id,
          scanType: "quick",
        },
      });

      scansQueued++;
      results.push({
        clientId: c.id,
        clientName: c.name,
        scanId: scan.id,
      });
    }

    return NextResponse.json({
      data: {
        message: `Queued ${scansQueued} entity scans`,
        scansQueued,
        clients: results,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Cron entity scan error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
