// Core review scan pipeline — orchestrates the full review scan flow.
// Follows the same pattern as run-entity-scan.ts.

import { createAdminClient, logAgentActionBg } from "@/lib/inngest/admin-client";
import { agents } from "@/lib/agents/registry";
import { getPlatformsForVertical } from "@/lib/reviews/platform-config";
import { calculateReviewAuthorityScore } from "@/lib/reviews/authority-score";
import { calculateVelocity } from "@/lib/reviews/velocity";
import { createHash } from "crypto";
import type { ReviewScanResult } from "@/lib/agents/interfaces";

interface ScanOptions {
  clientId: string;
  agencyId: string;
  scanType: "full" | "single";
  singlePlatform?: string;
}

export async function runReviewScan(options: ScanOptions): Promise<void> {
  const { clientId, agencyId, scanType, singlePlatform } = options;
  const supabase = createAdminClient();

  // Step 0: Load client data
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) throw new Error(`Client ${clientId} not found`);

  const vertical = (client.vertical as string) || null;
  const clientName = client.name as string;
  const clientUrl = (client.website_url as string) || "";
  const location = (client.location as string) || undefined;

  // Step 1: Determine platforms to scan
  let platforms: string[];
  if (scanType === "single" && singlePlatform) {
    platforms = [singlePlatform];
  } else {
    platforms = getPlatformsForVertical(vertical);
  }

  // Step 2: Load existing profile URLs for platforms we've scanned before
  const { data: existingProfiles } = await supabase
    .from("review_profiles")
    .select("platform, profile_url")
    .eq("client_id", clientId);

  const profileUrlMap: Record<string, string> = {};
  for (const p of existingProfiles || []) {
    if (p.profile_url) {
      profileUrlMap[p.platform as string] = p.profile_url as string;
    }
  }

  // Step 3: Scan each platform
  const scanResults: ReviewScanResult[] = [];

  for (const platform of platforms) {
    const input = {
      clientName,
      clientUrl,
      platform,
      existingProfileUrl: profileUrlMap[platform],
      location,
    };

    try {
      const result = await logAgentActionBg(
        {
          agencyId,
          clientId,
          agentType: platform === "google" ? "review_google" : "review_platform",
          agentName: platform === "google" ? agents.review.google.name : agents.review.platform.name,
          trigger: "manual",
          targetType: "review_profile",
          inputSummary: { platform, clientName },
        },
        () =>
          platform === "google"
            ? agents.review.google.scan(input)
            : agents.review.platform.scan(input)
      );

      scanResults.push(result);
    } catch (error) {
      // Platform failures never block the scan
      scanResults.push({
        platform,
        found: false,
        profileUrl: null,
        isClaimed: null,
        totalReviews: 0,
        averageRating: null,
        ratingScale: 5,
        mostRecentReviewDate: null,
        ratingDistribution: {},
        totalResponded: 0,
        recentReviews: [],
        scrapeError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Step 4: Upsert review_profiles and insert individual reviews
  const allNewReviewIds: string[] = [];

  for (const result of scanResults) {
    if (!result.found) {
      // Update profile with error if it exists
      if (result.scrapeError) {
        await supabase
          .from("review_profiles")
          .upsert(
            {
              client_id: clientId,
              platform: result.platform,
              scrape_error: result.scrapeError,
              last_scraped_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "client_id,platform" }
          );
      }
      continue;
    }

    // Upsert the profile
    const { data: profile } = await supabase
      .from("review_profiles")
      .upsert(
        {
          client_id: clientId,
          platform: result.platform,
          profile_url: result.profileUrl,
          is_claimed: result.isClaimed,
          total_reviews: result.totalReviews,
          average_rating: result.averageRating,
          rating_scale: result.ratingScale,
          most_recent_review_date: result.mostRecentReviewDate,
          rating_distribution: result.ratingDistribution,
          total_responded: result.totalResponded,
          response_rate:
            result.totalReviews > 0
              ? Math.round((result.totalResponded / result.totalReviews) * 100 * 100) / 100
              : 0,
          last_scraped_at: new Date().toISOString(),
          scrape_error: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id,platform" }
      )
      .select("id")
      .single();

    if (!profile) continue;
    const profileId = profile.id as string;

    // Insert individual reviews (deduplicate via content_hash)
    for (const review of result.recentReviews) {
      const contentHash = generateReviewHash(
        review.reviewerName,
        review.reviewText,
        result.platform
      );

      const { data: inserted } = await supabase
        .from("reviews")
        .upsert(
          {
            client_id: clientId,
            review_profile_id: profileId,
            platform: result.platform,
            reviewer_name: review.reviewerName,
            review_text: review.reviewText,
            rating: review.rating,
            review_date: review.reviewDate,
            review_url: review.reviewUrl,
            has_owner_response: review.hasOwnerResponse,
            owner_response_text: review.ownerResponseText,
            content_hash: contentHash,
          },
          { onConflict: "client_id,content_hash", ignoreDuplicates: true }
        )
        .select("id")
        .single();

      if (inserted) {
        allNewReviewIds.push(inserted.id as string);
      }
    }
  }

  // Step 5: Run sentiment analysis on new (unanalyzed) reviews
  if (allNewReviewIds.length > 0) {
    const { data: unanalyzed } = await supabase
      .from("reviews")
      .select("id, review_text, rating, platform")
      .eq("client_id", clientId)
      .is("sentiment", null)
      .not("review_text", "is", null)
      .limit(100);

    if (unanalyzed && unanalyzed.length > 0) {
      try {
        const sentimentResult = await logAgentActionBg(
          {
            agencyId,
            clientId,
            agentType: "review_sentiment",
            agentName: agents.review.sentiment.name,
            trigger: "manual",
            inputSummary: { reviewCount: unanalyzed.length },
          },
          () =>
            agents.review.sentiment.analyze({
              reviews: unanalyzed.map((r) => ({
                id: r.id as string,
                reviewText: r.review_text as string,
                rating: r.rating as number,
                platform: r.platform as string,
              })),
              clientName,
              clientVertical: vertical || "general",
            })
        );

        // Update reviews with sentiment data
        for (const analyzed of sentimentResult.reviews) {
          await supabase
            .from("reviews")
            .update({
              sentiment: analyzed.sentiment,
              sentiment_score: analyzed.sentimentScore,
              topics: analyzed.topics,
              key_phrases: analyzed.keyPhrases,
              is_flagged: analyzed.shouldFlag,
              flag_reason: analyzed.flagReason,
            })
            .eq("id", analyzed.id);
        }
      } catch {
        // Sentiment failure shouldn't block the scan
      }
    }
  }

  // Step 6: Scrape competitor reviews
  const { data: competitors } = await supabase
    .from("review_competitors")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true);

  if (competitors && competitors.length > 0) {
    for (const competitor of competitors.slice(0, 3)) {
      const competitorName = competitor.competitor_name as string;
      const platformData: Record<string, Record<string, unknown>> = {};
      let totalAll = 0;
      let ratingSum = 0;
      let ratingCount = 0;
      let platformsWithPresence = 0;

      // Scan top 3 platforms for competitors (not all — saves credits)
      const competitorPlatforms = platforms.slice(0, 3);
      for (const platform of competitorPlatforms) {
        try {
          const result =
            platform === "google"
              ? await agents.review.google.scan({
                  clientName: competitorName,
                  clientUrl: (competitor.competitor_url as string) || "",
                  platform,
                  location,
                })
              : await agents.review.platform.scan({
                  clientName: competitorName,
                  clientUrl: (competitor.competitor_url as string) || "",
                  platform,
                  location,
                });

          if (result.found) {
            platformData[platform] = {
              total: result.totalReviews,
              rating: result.averageRating,
              velocity_30d: 0, // Can't calculate velocity for competitors without history
              profile_url: result.profileUrl,
            };
            totalAll += result.totalReviews;
            if (result.averageRating) {
              ratingSum += result.averageRating;
              ratingCount++;
            }
            platformsWithPresence++;
          }
        } catch {
          // Competitor scan failure — skip
        }
      }

      await supabase
        .from("review_competitors")
        .update({
          platform_data: platformData,
          total_reviews_all: totalAll,
          avg_rating_all: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 100) / 100 : null,
          platforms_count: platformsWithPresence,
          last_scraped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", competitor.id);
    }
  }

  // Step 7: Calculate velocity and generate snapshot
  const { data: allProfiles } = await supabase
    .from("review_profiles")
    .select("*")
    .eq("client_id", clientId);

  if (allProfiles && allProfiles.length > 0) {
    let totalReviewsAll = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    let platformsWithPresence = 0;
    const platformBreakdown: Record<string, Record<string, unknown>> = {};

    for (const p of allProfiles) {
      const total = (p.total_reviews as number) || 0;
      totalReviewsAll += total;
      if (p.average_rating) {
        // Normalize to 5-star scale for averaging
        const normalized = ((p.average_rating as number) / (p.rating_scale as number)) * 5;
        ratingSum += normalized;
        ratingCount++;
      }
      if (total > 0) platformsWithPresence++;
      platformBreakdown[p.platform as string] = {
        total,
        rating: p.average_rating,
        new: 0, // Will be calculated from delta
        velocity_30d: p.review_velocity_30d || 0,
      };
    }

    const avgRating = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 100) / 100 : null;

    // Calculate velocity
    const velocity = await calculateVelocity(supabase, clientId, totalReviewsAll);

    // Update velocity on profiles
    for (const p of allProfiles) {
      await supabase
        .from("review_profiles")
        .update({
          review_velocity_30d: velocity.velocity30d,
          review_velocity_90d: velocity.velocity90d,
        })
        .eq("id", p.id);
    }

    // Get top competitor for authority score
    let topCompetitorReviews = 0;
    let topCompetitorRating = 0;
    if (competitors && competitors.length > 0) {
      const sorted = [...competitors].sort(
        (a, b) =>
          ((b.total_reviews_all as number) || 0) - ((a.total_reviews_all as number) || 0)
      );
      topCompetitorReviews = (sorted[0].total_reviews_all as number) || 0;
      topCompetitorRating = (sorted[0].avg_rating_all as number) || 0;
    }

    // Calculate authority score
    const totalPlatformsRelevant = platforms.length;
    const responseRateAvg =
      allProfiles.reduce(
        (sum, p) => sum + ((p.response_rate as number) || 0),
        0
      ) / Math.max(1, allProfiles.length);

    const authorityScore = calculateReviewAuthorityScore({
      totalReviews: totalReviewsAll,
      averageRating: avgRating || 0,
      ratingScale: 5,
      platformCount: platformsWithPresence,
      totalPlatformsRelevant,
      velocity30d: velocity.velocity30d,
      responseRate: responseRateAvg,
      topCompetitorReviews,
      topCompetitorRating,
    });

    // Get previous snapshot for delta calculation
    const { data: prevSnapshot } = await supabase
      .from("review_snapshots")
      .select("total_reviews_all_platforms, average_rating_all_platforms, review_authority_score")
      .eq("client_id", clientId)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single();

    const reviewsDelta = prevSnapshot
      ? totalReviewsAll - ((prevSnapshot.total_reviews_all_platforms as number) || 0)
      : null;
    const ratingDelta = prevSnapshot && avgRating
      ? Math.round(
          (avgRating - ((prevSnapshot.average_rating_all_platforms as number) || 0)) * 100
        ) / 100
      : null;
    const authorityDelta = prevSnapshot
      ? authorityScore - ((prevSnapshot.review_authority_score as number) || 0)
      : null;

    // Get sentiment breakdown from recent reviews
    const { data: recentSentiments } = await supabase
      .from("reviews")
      .select("sentiment")
      .eq("client_id", clientId)
      .not("sentiment", "is", null)
      .gte("scraped_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const sentimentBreakdown: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
    for (const r of recentSentiments || []) {
      const s = r.sentiment as string;
      if (sentimentBreakdown[s] !== undefined) sentimentBreakdown[s]++;
    }

    // Get top topics
    const { data: recentTopics } = await supabase
      .from("reviews")
      .select("topics, sentiment")
      .eq("client_id", clientId)
      .not("topics", "eq", "{}");

    const topicCounts: Record<string, { count: number; sentiments: string[] }> = {};
    for (const r of recentTopics || []) {
      for (const topic of (r.topics as string[]) || []) {
        if (!topicCounts[topic]) topicCounts[topic] = { count: 0, sentiments: [] };
        topicCounts[topic].count++;
        if (r.sentiment) topicCounts[topic].sentiments.push(r.sentiment as string);
      }
    }
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([topic, data]) => {
        const positiveCount = data.sentiments.filter((s) => s === "positive").length;
        const negativeCount = data.sentiments.filter((s) => s === "negative").length;
        const sentiment =
          positiveCount > negativeCount
            ? "positive"
            : negativeCount > positiveCount
              ? "negative"
              : "mixed";
        return { topic, count: data.count, sentiment };
      });

    // Insert snapshot
    await supabase.from("review_snapshots").upsert(
      {
        client_id: clientId,
        snapshot_date: new Date().toISOString().split("T")[0],
        period_type: "monthly",
        total_reviews_all_platforms: totalReviewsAll,
        average_rating_all_platforms: avgRating,
        platforms_with_presence: platformsWithPresence,
        new_reviews_count: reviewsDelta ?? 0,
        platform_breakdown: platformBreakdown,
        sentiment_breakdown: sentimentBreakdown,
        top_topics: topTopics,
        review_authority_score: authorityScore,
        reviews_delta: reviewsDelta,
        rating_delta: ratingDelta,
        authority_score_delta: authorityDelta,
      },
      { onConflict: "client_id,snapshot_date,period_type" }
    );
  }
}

function generateReviewHash(
  reviewerName: string | null,
  reviewText: string | null,
  platform: string
): string {
  const normalized = `${(reviewerName || "").toLowerCase().trim()}|${(reviewText || "").toLowerCase().trim().substring(0, 200)}|${platform}`;
  return createHash("sha256").update(normalized).digest("hex");
}
