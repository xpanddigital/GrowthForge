import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import {
  calculateCorrelations,
  type MonitorSnapshot,
  type TrafficData,
} from "@/lib/analytics/correlation-engine";

export const dynamic = "force-dynamic";

// GET /api/analytics/correlations — Get SoM-traffic correlations
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId query parameter required" },
        { status: 400 }
      );
    }

    // Get the two most recent monitor snapshots for SoM comparison
    const { data: snapshots } = await supabase
      .from("monitor_snapshots")
      .select("*")
      .eq("client_id", clientId)
      .order("snapshot_date", { ascending: false })
      .limit(2);

    if (!snapshots || snapshots.length < 2) {
      return NextResponse.json({
        data: null,
        message:
          "Need at least 2 monitoring snapshots to calculate correlations. Run AI Monitor weekly.",
      });
    }

    const currentSnapshot = snapshots[0];
    const previousSnapshot = snapshots[1];

    // Build monitor data from snapshots
    const monitorData: MonitorSnapshot[] = [];
    const currentMetrics = (currentSnapshot.keyword_metrics || {}) as Record<
      string,
      { som?: number }
    >;
    const previousMetrics = (previousSnapshot.keyword_metrics || {}) as Record<
      string,
      { som?: number }
    >;

    for (const keyword of Object.keys(currentMetrics)) {
      monitorData.push({
        keyword,
        currentSom: currentMetrics[keyword]?.som || 0,
        previousSom: previousMetrics[keyword]?.som || 0,
      });
    }

    // For traffic data, we use placeholder zeros since GA4 integration
    // requires propertyId which is client-specific configuration.
    // Real traffic data would come from the GA4 Attribution module.
    const trafficData: TrafficData[] = monitorData.map((m) => ({
      keyword: m.keyword,
      currentSessions: 0,
      previousSessions: 0,
    }));

    const dateRange = {
      start: previousSnapshot.snapshot_date,
      end: currentSnapshot.snapshot_date,
    };

    const result = calculateCorrelations(monitorData, trafficData, dateRange);

    return NextResponse.json({ data: result });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
