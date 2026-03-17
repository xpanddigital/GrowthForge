import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";

// POST /api/monitor/run — trigger manual monitoring scan
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, runContentGaps } = body as {
    clientId: string;
    runContentGaps?: boolean;
  };

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  // Verify client belongs to user's agency
  const { data: client, error } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .single();

  if (error || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Queue the monitoring run
  await inngest.send({
    name: "monitor/run",
    data: { clientId, runContentGaps: runContentGaps || false },
  });

  return NextResponse.json({ status: "queued", clientId }, { status: 202 });
}
