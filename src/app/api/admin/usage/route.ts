import { NextResponse } from "next/server";
import { requirePlatformAdmin, handleAdminError } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { supabase } = await requirePlatformAdmin();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      auditsResult,
      threadsResult,
      responsesResult,
      creditTxResult,
      agentActionsResult,
    ] = await Promise.all([
      // Total audits
      supabase
        .from("audits")
        .select("id", { count: "exact", head: true }),

      // Total threads
      supabase
        .from("threads")
        .select("id", { count: "exact", head: true }),

      // Total responses
      supabase
        .from("responses")
        .select("id", { count: "exact", head: true }),

      // Credit transactions in last 30 days (deductions only)
      supabase
        .from("credit_transactions")
        .select("amount, agency_id, created_at")
        .lt("amount", 0)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true }),

      // Agent actions for feature adoption
      supabase
        .from("agent_actions")
        .select("agent_type, agency_id, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString()),
    ]);

    // Total credits consumed in 30d
    const creditTxData = creditTxResult.data ?? [];
    const creditsConsumed30d = creditTxData.reduce(
      (sum, tx) => sum + Math.abs(tx.amount),
      0
    );

    // Daily credit consumption trend
    const dailyMap = new Map<string, number>();
    for (const tx of creditTxData) {
      const day = tx.created_at.slice(0, 10); // "YYYY-MM-DD"
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + Math.abs(tx.amount));
    }
    const creditTrend = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Feature adoption from agent_actions
    const agentData = agentActionsResult.data ?? [];
    const adoptionMap = new Map<string, { count: number; agencies: Set<string> }>();
    for (const action of agentData) {
      if (!adoptionMap.has(action.agent_type)) {
        adoptionMap.set(action.agent_type, { count: 0, agencies: new Set() });
      }
      const entry = adoptionMap.get(action.agent_type)!;
      entry.count++;
      entry.agencies.add(action.agency_id);
    }
    const featureAdoption = Array.from(adoptionMap.entries())
      .map(([agentType, data]) => ({
        agentType,
        actionCount: data.count,
        uniqueAgencies: data.agencies.size,
      }))
      .sort((a, b) => b.actionCount - a.actionCount);

    // Top 10 agencies by credit consumption
    const agencyConsumption = new Map<string, number>();
    for (const tx of creditTxData) {
      agencyConsumption.set(
        tx.agency_id,
        (agencyConsumption.get(tx.agency_id) ?? 0) + Math.abs(tx.amount)
      );
    }
    const topAgencyIds = Array.from(agencyConsumption.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Fetch agency names for top consumers
    let topAgencies: Array<{ agencyId: string; name: string; creditsConsumed: number }> = [];
    if (topAgencyIds.length > 0) {
      const { data: agencyNames } = await supabase
        .from("agencies")
        .select("id, name")
        .in(
          "id",
          topAgencyIds.map(([id]) => id)
        );

      const nameMap = new Map<string, string>();
      for (const a of agencyNames ?? []) {
        nameMap.set(a.id, a.name);
      }

      topAgencies = topAgencyIds.map(([id, consumed]) => ({
        agencyId: id,
        name: nameMap.get(id) ?? "Unknown",
        creditsConsumed: consumed,
      }));
    }

    return NextResponse.json({
      totals: {
        audits: auditsResult.count ?? 0,
        threads: threadsResult.count ?? 0,
        responses: responsesResult.count ?? 0,
        creditsConsumed30d,
      },
      creditTrend,
      featureAdoption,
      topAgencies,
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
