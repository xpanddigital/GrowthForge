import { NextResponse } from "next/server";
import { requirePlatformAdmin, handleAdminError } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { supabase } = await requirePlatformAdmin();

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      trialingResult,
      allTrialsResult,
      convertedTrialsResult,
      expiringSoonResult,
      conversionEventsResult,
    ] = await Promise.all([
      // Currently trialing
      supabase
        .from("agencies")
        .select("id", { count: "exact", head: true })
        .eq("subscription_status", "trialing"),

      // All agencies that have ever had a trial
      supabase
        .from("agencies")
        .select("id, subscription_status", { count: "exact" })
        .not("trial_ends_at", "is", null),

      // Trials that converted to active
      supabase
        .from("agencies")
        .select("id", { count: "exact", head: true })
        .eq("subscription_status", "active")
        .not("trial_ends_at", "is", null),

      // Expiring soon (within 7 days)
      supabase
        .from("agencies")
        .select("id, name, slug, plan, trial_ends_at, owner_email, created_at")
        .eq("subscription_status", "trialing")
        .gte("trial_ends_at", now.toISOString())
        .lte("trial_ends_at", sevenDaysFromNow.toISOString())
        .order("trial_ends_at", { ascending: true }),

      // Recent conversion events
      supabase
        .from("subscription_events")
        .select("id, agency_id, occurred_at, previous_plan, new_plan, agencies(name, created_at)")
        .eq("event_type", "subscription_updated")
        .eq("previous_status", "trialing")
        .eq("new_status", "active")
        .order("occurred_at", { ascending: false })
        .limit(20),
    ]);

    const onTrialCount = trialingResult.count ?? 0;
    const allTrialsCount = allTrialsResult.count ?? 0;
    const convertedCount = convertedTrialsResult.count ?? 0;

    const conversionRate =
      allTrialsCount > 0
        ? Math.round((convertedCount / allTrialsCount) * 10000) / 100
        : 0;

    // Calculate average days to convert
    let avgDaysToConvert: number | null = null;
    const conversions = conversionEventsResult.data ?? [];
    if (conversions.length > 0) {
      let totalDays = 0;
      let validCount = 0;
      for (const event of conversions) {
        const agencyData = event.agencies as unknown as { name: string; created_at: string } | null;
        if (agencyData?.created_at) {
          const createdAt = new Date(agencyData.created_at);
          const convertedAt = new Date(event.occurred_at);
          const days = (convertedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          if (days >= 0) {
            totalDays += days;
            validCount++;
          }
        }
      }
      if (validCount > 0) {
        avgDaysToConvert = Math.round((totalDays / validCount) * 10) / 10;
      }
    }

    const recentConversions = conversions.map((e) => ({
      id: e.id,
      agencyId: e.agency_id,
      agencyName: (e.agencies as unknown as { name: string } | null)?.name ?? "Unknown",
      occurredAt: e.occurred_at,
      previousPlan: e.previous_plan,
      newPlan: e.new_plan,
    }));

    return NextResponse.json({
      onTrialCount,
      conversionRate,
      expiringSoon: expiringSoonResult.data ?? [],
      recentConversions,
      avgDaysToConvert,
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
