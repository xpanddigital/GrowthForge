import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/monitor/snapshots — snapshot history for trending
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const periodType = searchParams.get("periodType") || "weekly";
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("monitor_snapshots")
    .select("*")
    .eq("client_id", clientId)
    .eq("period_type", periodType)
    .order("snapshot_date", { ascending: false })
    .limit(limit);

  if (error) {
    // Table may not exist yet (migration 0010 not run) — return empty
    console.error("[monitor/snapshots] query error:", error.message);
    return NextResponse.json({ snapshots: [] });
  }

  return NextResponse.json({ snapshots: data });
}
