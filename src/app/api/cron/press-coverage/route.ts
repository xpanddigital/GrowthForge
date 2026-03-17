import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { inngest } from "@/lib/inngest/client";

// GET /api/cron/press-coverage — Weekly coverage scan for all active clients
// Vercel Cron: { "path": "/api/cron/press-coverage", "schedule": "0 8 * * 1" }
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all active clients that have at least one press campaign
    const { data: clients } = await supabase
      .from("clients")
      .select("id, agency_id")
      .eq("is_active", true);

    if (!clients || clients.length === 0) {
      return NextResponse.json({ message: "No active clients", jobs: 0 });
    }

    let jobCount = 0;
    for (const client of clients) {
      // Check if client has any press campaigns
      const { count } = await supabase
        .from("press_campaigns")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client.id);

      if ((count ?? 0) > 0) {
        await inngest.send({
          name: "press/scan-coverage",
          data: {
            clientId: client.id as string,
            agencyId: client.agency_id as string,
          },
        });
        jobCount++;
      }
    }

    return NextResponse.json({ message: "Coverage scans queued", jobs: jobCount });
  } catch (error) {
    console.error("Press coverage cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
