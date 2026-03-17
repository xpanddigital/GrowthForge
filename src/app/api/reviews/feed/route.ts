import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/reviews/feed — recent reviews with filters
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
  const sentiment = searchParams.get("sentiment");
  const platform = searchParams.get("platform");
  const highlighted = searchParams.get("highlighted");
  const flagged = searchParams.get("flagged");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  let query = supabase
    .from("reviews")
    .select("*")
    .eq("client_id", clientId)
    .order("review_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (sentiment) query = query.eq("sentiment", sentiment);
  if (platform) query = query.eq("platform", platform);
  if (highlighted === "true") query = query.eq("is_highlighted", true);
  if (flagged === "true") query = query.eq("is_flagged", true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data });
}
