import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/monitor/results — individual test results
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
  const keywordId = searchParams.get("keywordId");
  const promptId = searchParams.get("promptId");
  const model = searchParams.get("model");
  const brandMentioned = searchParams.get("brandMentioned");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  let query = supabase
    .from("monitor_results")
    .select("*")
    .eq("client_id", clientId)
    .order("tested_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (keywordId) query = query.eq("keyword_id", keywordId);
  if (promptId) query = query.eq("prompt_id", promptId);
  if (model) query = query.eq("ai_model", model);
  if (brandMentioned !== null && brandMentioned !== undefined) {
    query = query.eq("brand_mentioned", brandMentioned === "true");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data });
}
