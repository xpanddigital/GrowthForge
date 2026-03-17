import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// POST /api/monitor/competitors — create competitor
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, competitorName, competitorUrl, aliases } = body as {
    clientId: string;
    competitorName: string;
    competitorUrl?: string;
    aliases?: string[];
  };

  if (!clientId || !competitorName) {
    return NextResponse.json(
      { error: "clientId and competitorName are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("monitor_competitors")
    .insert({
      client_id: clientId,
      competitor_name: competitorName,
      competitor_url: competitorUrl || null,
      competitor_aliases: aliases || [],
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Competitor already exists for this client" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ competitor: data }, { status: 201 });
}

// GET /api/monitor/competitors — list competitors for a client
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
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("monitor_competitors")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ competitors: data });
}
