import { NextResponse } from "next/server";
import { requirePlatformAdmin, handleAdminError } from "@/lib/admin/auth";
import { PLANS, type PlanId, PLAN_IDS } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { supabase } = await requirePlatformAdmin();

    const { data: agencies, error } = await supabase
      .from("agencies")
      .select("id, plan, subscription_status, trial_ends_at, created_at");

    if (error) throw error;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Count by status
    const counts = { total: 0, active: 0, trialing: 0, past_due: 0, canceled: 0, none: 0 };
    let mrr = 0;
    let signupsThisWeek = 0;
    let signupsThisMonth = 0;
    let trialsTotal = 0;
    let trialsConverted = 0;

    const mrrByPlanMap: Record<string, { count: number; mrr: number }> = {};
    for (const planId of PLAN_IDS) {
      mrrByPlanMap[planId] = { count: 0, mrr: 0 };
    }

    for (const agency of agencies ?? []) {
      counts.total++;
      const status = (agency.subscription_status ?? "none") as keyof typeof counts;
      if (status in counts) {
        counts[status]++;
      }

      // MRR: only active subscribers contribute
      if (agency.subscription_status === "active") {
        const plan = PLANS[agency.plan as PlanId];
        if (plan) {
          const planMrr = plan.priceMonthly * 100; // cents
          mrr += planMrr;
          mrrByPlanMap[agency.plan] = mrrByPlanMap[agency.plan] ?? { count: 0, mrr: 0 };
          mrrByPlanMap[agency.plan].count++;
          mrrByPlanMap[agency.plan].mrr += planMrr;
        }
      }

      // Signup recency
      const created = new Date(agency.created_at);
      if (created >= weekAgo) signupsThisWeek++;
      if (created >= monthAgo) signupsThisMonth++;

      // Trial conversion
      if (agency.trial_ends_at) {
        trialsTotal++;
        if (agency.subscription_status === "active") {
          trialsConverted++;
        }
      }
    }

    const activeCount = counts.active || 1; // avoid division by zero
    const arr = mrr * 12;
    const arpa = Math.round(mrr / activeCount);
    const trialConversionRate =
      trialsTotal > 0 ? Math.round((trialsConverted / trialsTotal) * 10000) / 100 : 0;

    const mrrByPlan = Object.entries(mrrByPlanMap)
      .filter(([, v]) => v.count > 0)
      .map(([plan, v]) => ({ plan, count: v.count, mrr: v.mrr }));

    return NextResponse.json({
      mrr,
      arr,
      arpa,
      counts,
      signupsThisWeek,
      signupsThisMonth,
      trialConversionRate,
      mrrByPlan,
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
