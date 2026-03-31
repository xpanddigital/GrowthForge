import { NextResponse } from "next/server";
import { requirePlatformAdmin, handleAdminError } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

interface SubscriptionEvent {
  id: string;
  agency_id: string;
  event_type: string;
  mrr_delta: number;
  occurred_at: string;
  previous_plan: string | null;
  new_plan: string | null;
  previous_status: string | null;
  new_status: string | null;
  amount_cents: number;
  agencies?: { name: string } | null;
}

interface MonthBucket {
  month: string;
  new_mrr: number;
  churned_mrr: number;
  net_mrr: number;
}

export async function GET() {
  try {
    const { supabase } = await requirePlatformAdmin();

    // Fetch all subscription events for trend calculation
    const { data: events, error: eventsError } = await supabase
      .from("subscription_events")
      .select("id, agency_id, event_type, mrr_delta, occurred_at, previous_plan, new_plan, previous_status, new_status, amount_cents")
      .in("event_type", [
        "checkout_completed",
        "subscription_updated",
        "subscription_deleted",
      ])
      .order("occurred_at", { ascending: true });

    if (eventsError) throw eventsError;

    // Aggregate monthly trend in JS
    const monthlyMap = new Map<string, MonthBucket>();

    for (const event of (events ?? []) as SubscriptionEvent[]) {
      const month = event.occurred_at.slice(0, 7); // "YYYY-MM"
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { month, new_mrr: 0, churned_mrr: 0, net_mrr: 0 });
      }
      const bucket = monthlyMap.get(month)!;
      const delta = event.mrr_delta ?? 0;
      if (delta > 0) {
        bucket.new_mrr += delta;
      } else {
        bucket.churned_mrr += Math.abs(delta);
      }
      bucket.net_mrr += delta;
    }

    const monthlyTrend = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Recent events with agency name
    const { data: recentEvents, error: recentError } = await supabase
      .from("subscription_events")
      .select("id, agency_id, event_type, mrr_delta, occurred_at, previous_plan, new_plan, previous_status, new_status, amount_cents, agencies(name)")
      .order("occurred_at", { ascending: false })
      .limit(50);

    if (recentError) throw recentError;

    return NextResponse.json({
      monthlyTrend,
      recentEvents: (recentEvents ?? []).map((e: Record<string, unknown>) => ({
        ...e,
        agencyName: (e.agencies as { name: string } | null)?.name ?? "Unknown",
      })),
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
