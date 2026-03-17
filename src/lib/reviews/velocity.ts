// Review velocity calculation — tracks new reviews per time period.
// Used to measure review momentum and detect acceleration/deceleration.

import type { SupabaseClient } from "@supabase/supabase-js";

interface VelocityResult {
  velocity30d: number;
  velocity90d: number;
  direction: "accelerating" | "steady" | "decelerating";
}

/**
 * Calculate review velocity by comparing current totals to previous snapshots.
 * Falls back to estimation from most_recent_review_date if no snapshots exist.
 */
export async function calculateVelocity(
  supabase: SupabaseClient,
  clientId: string,
  currentTotal: number
): Promise<VelocityResult> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Try to get previous snapshots
  const { data: snapshots } = await supabase
    .from("review_snapshots")
    .select("snapshot_date, total_reviews_all_platforms")
    .eq("client_id", clientId)
    .order("snapshot_date", { ascending: false })
    .limit(12);

  let velocity30d = 0;
  let velocity90d = 0;

  if (snapshots && snapshots.length > 0) {
    // Find closest snapshot to 30 days ago
    const snap30d = findClosestSnapshot(snapshots, thirtyDaysAgo);
    if (snap30d) {
      const total30d = snap30d.total_reviews_all_platforms as number;
      velocity30d = Math.max(0, currentTotal - total30d);
    }

    // Find closest snapshot to 90 days ago
    const snap90d = findClosestSnapshot(snapshots, ninetyDaysAgo);
    if (snap90d) {
      const total90d = snap90d.total_reviews_all_platforms as number;
      velocity90d = Math.max(0, (currentTotal - total90d) / 3);
    }
  } else {
    // No snapshots yet — estimate from recent review count
    const { count } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .gte("review_date", thirtyDaysAgo.toISOString());

    velocity30d = count || 0;
    velocity90d = velocity30d; // Best estimate with no history
  }

  // Determine direction
  let direction: VelocityResult["direction"] = "steady";
  if (velocity90d > 0) {
    const ratio = velocity30d / velocity90d;
    if (ratio > 1.2) direction = "accelerating";
    else if (ratio < 0.8) direction = "decelerating";
  } else if (velocity30d > 0) {
    direction = "accelerating";
  }

  return { velocity30d, velocity90d, direction };
}

function findClosestSnapshot(
  snapshots: Array<Record<string, unknown>>,
  targetDate: Date
): Record<string, unknown> | null {
  let closest: Record<string, unknown> | null = null;
  let closestDiff = Infinity;

  for (const snap of snapshots) {
    const snapDate = new Date(snap.snapshot_date as string);
    const diff = Math.abs(snapDate.getTime() - targetDate.getTime());
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = snap;
    }
  }

  // Only use if within 15 days of target
  if (closestDiff > 15 * 24 * 60 * 60 * 1000) return null;
  return closest;
}
