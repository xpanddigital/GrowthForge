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
    .order("is_active", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with SoM from latest snapshot + previous snapshot for trends
  const { data: snapshots } = await supabase
    .from("monitor_snapshots")
    .select("competitor_som, overall_som, snapshot_date")
    .eq("client_id", clientId)
    .eq("period_type", "weekly")
    .order("snapshot_date", { ascending: false })
    .limit(2);

  const latestSnapshot = snapshots?.[0];
  const previousSnapshot = snapshots?.[1];
  const currentSom = (latestSnapshot?.competitor_som as Record<string, number>) || {};
  const previousSom = (previousSnapshot?.competitor_som as Record<string, number>) || {};
  const clientSom = latestSnapshot ? Number(latestSnapshot.overall_som) : 0;

  const enriched = (data || []).map((comp: Record<string, unknown>) => {
    const name = comp.competitor_name as string;
    const som = currentSom[name] ?? 0;
    const prevSomValue = previousSom[name] ?? null;
    const delta = prevSomValue !== null ? som - prevSomValue : null;
    return {
      ...comp,
      som: Math.round(som * 100) / 100,
      previous_som: prevSomValue !== null ? Math.round(prevSomValue * 100) / 100 : null,
      som_delta: delta !== null ? Math.round(delta * 100) / 100 : null,
    };
  });

  // Sort by SoM descending
  enriched.sort((a: { som: number }, b: { som: number }) => b.som - a.som);

  return NextResponse.json({
    competitors: enriched,
    client_som: Math.round(clientSom * 100) / 100,
    snapshot_date: latestSnapshot?.snapshot_date || null,
  });
}
