import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/monitor/timeline — correlation timeline data
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
  const weeks = parseInt(searchParams.get("weeks") || "12", 10);

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("monitor_activity_timeline")
    .select("*")
    .eq("client_id", clientId)
    .order("week_start", { ascending: false })
    .limit(weeks);

  if (error) {
    // Table may not exist yet (migration 0010 not run) — return empty
    console.error("[monitor/timeline] query error:", error.message);
    return NextResponse.json({ timeline: [] });
  }

  return NextResponse.json({ timeline: data });
}
