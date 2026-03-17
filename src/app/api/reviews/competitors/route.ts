import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/reviews/competitors — competitor review data
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

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("review_competitors")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("total_reviews_all", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ competitors: data });
}

// POST /api/reviews/competitors — add/update competitor
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, competitorName, competitorUrl } = body as {
    clientId: string;
    competitorName: string;
    competitorUrl?: string;
  };

  if (!clientId || !competitorName) {
    return NextResponse.json(
      { error: "clientId and competitorName are required" },
      { status: 400 }
    );
  }

  // Verify client belongs to user
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("review_competitors")
    .upsert(
      {
        client_id: clientId,
        competitor_name: competitorName,
        competitor_url: competitorUrl || null,
      },
      { onConflict: "client_id,competitor_name" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ competitor: data }, { status: 201 });
}
