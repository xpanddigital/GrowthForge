import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import {
  generateCompetitorReport,
  type MonitorSomData,
  type MentionData,
  type ReviewData,
} from "@/lib/reports/competitor-benchmark";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

const generateSchema = z.object({
  clientId: uuidLike,
});

// POST /api/reports/competitor — Generate competitor benchmark report
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("agency_id, role")
      .eq("id", authUser.user.id)
      .single();

    if (!user || user.role === "viewer") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = generateSchema.parse(body);

    // Load client
    const { data: client } = await supabase
      .from("clients")
      .select("id, name, agency_id")
      .eq("id", validated.clientId)
      .eq("agency_id", user.agency_id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Load competitors
    const { data: competitors } = await supabase
      .from("monitor_competitors")
      .select("name")
      .eq("client_id", validated.clientId)
      .limit(5);

    const competitorNames = (competitors || []).map((c) => c.name);

    if (competitorNames.length === 0) {
      return NextResponse.json(
        {
          error:
            "No competitors found. Run AI Monitor first to auto-discover competitors.",
        },
        { status: 400 }
      );
    }

    // Load latest audit
    const { data: audit } = await supabase
      .from("audits")
      .select(
        "composite_score, citation_score, ai_presence_score, entity_score, review_score, press_score"
      )
      .eq("client_id", validated.clientId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Load latest monitor snapshot for SoM data
    const { data: snapshot } = await supabase
      .from("monitor_snapshots")
      .select("*")
      .eq("client_id", validated.clientId)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single();

    // Build SoM data from snapshot
    const somData: MonitorSomData[] = [];
    if (snapshot?.model_metrics) {
      const modelMetrics = snapshot.model_metrics as Record<
        string,
        { som?: number; competitor_som?: Record<string, number> }
      >;
      for (const [model, metrics] of Object.entries(modelMetrics)) {
        somData.push({
          model,
          clientSom: metrics.som || 0,
          competitorSom: metrics.competitor_som || {},
        });
      }
    }

    // Load mention data
    const { data: mentionSources } = await supabase
      .from("mention_sources")
      .select("platform, mention_type, mentioned_entity")
      .eq("client_id", validated.clientId);

    const mentionData: MentionData[] = [];
    if (mentionSources) {
      const platformMap = new Map<
        string,
        { client: number; competitors: Record<string, number> }
      >();

      for (const source of mentionSources) {
        if (!platformMap.has(source.platform)) {
          platformMap.set(source.platform, { client: 0, competitors: {} });
        }
        const entry = platformMap.get(source.platform)!;

        if (
          source.mention_type === "brand" ||
          source.mention_type === "both"
        ) {
          entry.client++;
        }
        if (
          source.mention_type === "competitor" ||
          source.mention_type === "both"
        ) {
          const compName = source.mentioned_entity || "Unknown";
          entry.competitors[compName] =
            (entry.competitors[compName] || 0) + 1;
        }
      }

      for (const [platform, data] of Array.from(platformMap)) {
        mentionData.push({
          platform,
          clientMentions: data.client,
          competitorMentions: data.competitors,
        });
      }
    }

    // Load review data
    let reviewData: ReviewData | null = null;
    const { data: reviewProfiles } = await supabase
      .from("review_profiles")
      .select("total_reviews, average_rating")
      .eq("client_id", validated.clientId);

    if (reviewProfiles && reviewProfiles.length > 0) {
      const totalReviews = reviewProfiles.reduce(
        (sum, p) => sum + (p.total_reviews || 0),
        0
      );
      const ratings = reviewProfiles
        .map((p) => p.average_rating)
        .filter((r): r is number => r !== null);
      const avgRating =
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
            ) / 10
          : null;

      reviewData = {
        clientReviews: totalReviews,
        clientRating: avgRating,
        competitorReviews: {},
        competitorRatings: {},
      };
    }

    // Generate report
    const report = await generateCompetitorReport(
      client.name,
      competitorNames,
      audit || null,
      somData,
      mentionData,
      reviewData
    );

    return NextResponse.json({ data: report });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
