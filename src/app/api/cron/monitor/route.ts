import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

// Vercel Cron: "0 4 * * 0" (Sunday 4am UTC)
// Triggers weekly monitoring for all active clients.

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

  await inngest.send({
    name: "monitor/run-weekly",
    data: {},
  });

  return NextResponse.json({
    status: "queued",
    message: "Weekly monitoring run queued for all active clients",
  });
}
