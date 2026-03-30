import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { calculateAIVisibilityScore } from "@/lib/monitor/visibility-score";

export const dynamic = "force-dynamic";

// POST /api/monitor/recalculate — re-compute AI Visibility Score from existing
// monitor_results without running a new scan. Useful after scoring formula changes.
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId } = body as { clientId: string };

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  // Verify client belongs to user's agency
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .select("id, name")
    .eq("id", clientId)
    .single();
  if (clientErr || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Get the latest snapshot for this client
  const { data: snapshot, error: snapErr } = await supabase
    .from("monitor_snapshots")
    .select("*")
    .eq("client_id", clientId)
    .eq("period_type", "weekly")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  if (snapErr || !snapshot) {
    return NextResponse.json(
      { error: "No snapshot found for this client" },
      { status: 404 }
    );
  }

  // Find the previous snapshot (before this one) for delta calculation
  const { data: prevSnapshot } = await supabase
    .from("monitor_snapshots")
    .select("overall_som, ai_visibility_score")
    .eq("client_id", clientId)
    .eq("period_type", "weekly")
    .lt("snapshot_date", snapshot.snapshot_date)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  // Recalculate SoM delta
  const somDelta = prevSnapshot
    ? Number(snapshot.overall_som) - Number(prevSnapshot.overall_som)
    : null;

  // Recalculate AI Visibility Score with the corrected formula
  const modelBreakdown = (snapshot.model_breakdown || {}) as Record<
    string,
    { mentioned: number; total: number }
  >;

  const newScore = calculateAIVisibilityScore({
    overall_som: Number(snapshot.overall_som),
    total_brand_mentions: snapshot.total_brand_mentions,
    total_brand_recommendations: snapshot.total_brand_recommendations,
    avg_prominence: snapshot.avg_prominence ? Number(snapshot.avg_prominence) : null,
    model_breakdown: modelBreakdown,
    som_delta: somDelta,
  });

  // Calculate score delta
  const scoreDelta =
    prevSnapshot?.ai_visibility_score != null
      ? newScore - Number(prevSnapshot.ai_visibility_score)
      : null;

  // Update the snapshot
  const { error: updateErr } = await supabase
    .from("monitor_snapshots")
    .update({
      ai_visibility_score: newScore,
      som_delta: somDelta,
      score_delta: scoreDelta,
    })
    .eq("id", snapshot.id);

  if (updateErr) {
    console.error("[monitor/recalculate] Update failed:", updateErr.message);
    return NextResponse.json(
      { error: "Failed to update snapshot" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    clientId,
    clientName: client.name,
    snapshotId: snapshot.id,
    snapshotDate: snapshot.snapshot_date,
    oldScore: snapshot.ai_visibility_score,
    newScore,
    scoreDelta,
    somDelta,
    breakdown: {
      overall_som: Number(snapshot.overall_som),
      total_brand_mentions: snapshot.total_brand_mentions,
      total_brand_recommendations: snapshot.total_brand_recommendations,
      avg_prominence: snapshot.avg_prominence ? Number(snapshot.avg_prominence) : null,
      models_with_mentions: Object.values(modelBreakdown).filter(
        (m) => m.mentioned > 0
      ).length,
      has_previous_snapshot: !!prevSnapshot,
    },
  });
}
