import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { createClient } from "@supabase/supabase-js";

// Vercel Cron: monthly review scan for all active clients
// Schedule: "0 2 1 * *" (1st of month at 2am UTC)
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Missing Supabase config" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Get all active clients
  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .eq("is_active", true);

  if (!clients || clients.length === 0) {
    return NextResponse.json({ message: "No active clients", jobs: 0 });
  }

  // Queue a scan for each client
  const events = clients.map((client) => ({
    name: "review/scan" as const,
    data: {
      clientId: client.id as string,
      scanType: "full" as const,
    },
  }));

  await inngest.send(events);

  return NextResponse.json({
    message: `Queued ${events.length} review scans`,
    jobs: events.length,
  });
}
