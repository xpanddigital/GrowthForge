import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";

export const dynamic = "force-dynamic";

// POST /api/reviews/scan — trigger review scan
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, scanType, platform } = body as {
    clientId: string;
    scanType?: "full" | "single";
    platform?: string;
  };

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const effectiveScanType = scanType || "full";
  if (effectiveScanType === "single" && !platform) {
    return NextResponse.json(
      { error: "platform is required for single scan" },
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

  await inngest.send({
    name: "review/scan",
    data: { clientId, scanType: effectiveScanType, platform },
  });

  return NextResponse.json(
    { status: "queued", clientId, scanType: effectiveScanType },
    { status: 202 }
  );
}
