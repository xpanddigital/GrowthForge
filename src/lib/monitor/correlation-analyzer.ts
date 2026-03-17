// Cross-Module Correlation Engine — overlays Citation Engine activity against SoM movement.
// This is the ROI proof agencies screenshot for case studies.
//
// Patterns detected:
// 1. SoM rise after Citation Engine seeding (2-3 week lag)
// 2. AIO references matching seeded threads (direct proof)
// 3. Entity fix → SoM improvement (lower confidence)

import { createAdminClient } from "@/lib/inngest/admin-client";

interface CorrelationNote {
  type: "citation_impact" | "aio_proof" | "entity_impact";
  confidence: "high" | "medium" | "low";
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Populate the correlation timeline for a client's most recent week.
 * Called after each monitoring run completes.
 */
export async function updateCorrelationTimeline(
  clientId: string
): Promise<void> {
  const supabase = createAdminClient();

  // Calculate week start (Monday of current week)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // 1. Citation Engine activity this week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const { data: threadsThisWeek } = await supabase
    .from("threads")
    .select("id, status, platform")
    .eq("client_id", clientId)
    .gte("discovered_at", weekStartStr)
    .lt("discovered_at", weekEnd.toISOString().split("T")[0]);

  const { data: responsesPosted } = await supabase
    .from("responses")
    .select("id")
    .eq("client_id", clientId)
    .eq("status", "posted")
    .gte("posted_at", weekStartStr)
    .lt("posted_at", weekEnd.toISOString().split("T")[0]);

  const { data: responsesGenerated } = await supabase
    .from("responses")
    .select("id")
    .eq("client_id", clientId)
    .gte("created_at", weekStartStr)
    .lt("created_at", weekEnd.toISOString().split("T")[0]);

  // Platform breakdown for seeded posts
  const platformsSeeded: Record<string, number> = {};
  if (threadsThisWeek) {
    for (const thread of threadsThisWeek) {
      const t = thread as { platform: string; status: string };
      if (t.status === "posted") {
        platformsSeeded[t.platform] = (platformsSeeded[t.platform] || 0) + 1;
      }
    }
  }

  // 2. Get current snapshot
  const { data: currentSnapshot } = await supabase
    .from("monitor_snapshots")
    .select("*")
    .eq("client_id", clientId)
    .eq("period_type", "weekly")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  // 3. Get snapshot from 2-3 weeks ago (for lag correlation)
  const threeWeeksAgo = new Date(weekStart);
  threeWeeksAgo.setDate(weekStart.getDate() - 21);
  const { data: lagSnapshot } = await supabase
    .from("monitor_snapshots")
    .select("*")
    .eq("client_id", clientId)
    .eq("period_type", "weekly")
    .lte("snapshot_date", weekStartStr)
    .gte("snapshot_date", threeWeeksAgo.toISOString().split("T")[0])
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  // 4. Detect correlation patterns
  const correlationNotes: CorrelationNote[] = [];

  // Pattern 1: SoM rise after Citation Engine seeding
  if (currentSnapshot && lagSnapshot) {
    const somDelta =
      Number(currentSnapshot.overall_som) - Number(lagSnapshot.overall_som);

    // Look at Citation Engine activity 2-3 weeks ago
    const lagWeekEnd = new Date(threeWeeksAgo);
    lagWeekEnd.setDate(threeWeeksAgo.getDate() + 14);

    const { data: lagResponses } = await supabase
      .from("responses")
      .select("id")
      .eq("client_id", clientId)
      .eq("status", "posted")
      .gte("posted_at", threeWeeksAgo.toISOString().split("T")[0])
      .lt("posted_at", lagWeekEnd.toISOString().split("T")[0]);

    const lagPostedCount = lagResponses?.length || 0;

    if (somDelta > 5 && lagPostedCount >= 5) {
      correlationNotes.push({
        type: "citation_impact",
        confidence: somDelta > 10 ? "high" : "medium",
        message: `SoM rose ${somDelta.toFixed(1)}% — ${lagPostedCount} citation responses were posted 2-3 weeks ago`,
        data: {
          som_delta: somDelta,
          responses_posted_lag: lagPostedCount,
        },
      });
    }
  }

  // Pattern 2: AIO source URLs match seeded threads
  if (currentSnapshot) {
    const { data: aioResults } = await supabase
      .from("monitor_results")
      .select("sources_cited")
      .eq("client_id", clientId)
      .eq("ai_model", "google_ai_overview")
      .gte("tested_at", weekStartStr)
      .lt("tested_at", weekEnd.toISOString().split("T")[0]);

    if (aioResults) {
      const allAioSources = aioResults.flatMap(
        (r: { sources_cited: string[] }) => r.sources_cited || []
      );

      // Check if any AIO sources are threads where we posted
      const { data: postedThreads } = await supabase
        .from("threads")
        .select("url")
        .eq("client_id", clientId)
        .eq("status", "posted");

      if (postedThreads) {
        const postedUrls = new Set(
          postedThreads.map((t: { url: string }) =>
            t.url.split("?")[0].toLowerCase()
          )
        );
        const matchedUrls = allAioSources.filter((url: string) =>
          postedUrls.has(url.split("?")[0].toLowerCase())
        );

        if (matchedUrls.length > 0) {
          correlationNotes.push({
            type: "aio_proof",
            confidence: "high",
            message: `${matchedUrls.length} Google AI Overview source(s) match threads we've seeded — direct proof of Citation Engine impact`,
            data: { matched_urls: matchedUrls },
          });
        }
      }
    }
  }

  // 5. Upsert timeline entry
  await supabase.from("monitor_activity_timeline").upsert(
    {
      client_id: clientId,
      week_start: weekStartStr,
      threads_discovered: threadsThisWeek?.length || 0,
      responses_generated: responsesGenerated?.length || 0,
      responses_posted: responsesPosted?.length || 0,
      platforms_seeded: platformsSeeded,
      overall_som: currentSnapshot
        ? Number(currentSnapshot.overall_som)
        : null,
      som_delta: currentSnapshot ? Number(currentSnapshot.som_delta) : null,
      ai_visibility_score: currentSnapshot
        ? currentSnapshot.ai_visibility_score
        : null,
      correlation_notes: correlationNotes,
    },
    { onConflict: "client_id,week_start" }
  );
}
