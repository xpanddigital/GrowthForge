// Inngest functions for YouTube GEO scans.

import { createClient } from "@supabase/supabase-js";
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { agents } from "@/lib/agents/registry";
import { logAgentAction } from "@/lib/agents/logger";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new NonRetriableError("Missing Supabase environment variables");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const youtubeGeoScan = inngest.createFunction(
  {
    id: "youtube-geo-scan",
    name: "Run YouTube GEO Scan",
    retries: 1,
  },
  { event: "youtube-geo/scan" },
  async ({ event }) => {
    const { clientId, agencyId } = event.data;
    const supabase = createAdminClient();

    // Load client data
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, website_url, brand_brief, target_audience")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      throw new NonRetriableError(`Client ${clientId} not found`);
    }

    // Load keywords
    const { data: keywords } = await supabase
      .from("keywords")
      .select("id, keyword")
      .eq("client_id", clientId)
      .eq("is_active", true)
      .limit(15);

    const keywordList = (keywords || []).map((k) => k.keyword);

    // Load competitors
    const { data: competitors } = await supabase
      .from("monitor_competitors")
      .select("name")
      .eq("client_id", clientId)
      .limit(5);

    const competitorNames = (competitors || []).map((c) => c.name);

    // Run YouTube GEO scan with logging
    const scanResult = await logAgentAction(
      {
        agencyId,
        clientId,
        agentType: "youtube_geo",
        agentName: agents.youtubeGeo.name,
        trigger: "manual",
        targetType: "client",
        targetId: clientId,
        inputSummary: {
          keywordCount: keywordList.length,
          competitorCount: competitorNames.length,
        },
      },
      () =>
        agents.youtubeGeo.scan(
          client.name,
          client.website_url || "",
          keywordList,
          competitorNames
        )
    );

    // Store results in youtube_presence table
    const presenceRows = scanResult.topics.map((topic) => ({
      client_id: clientId,
      topic: topic.topic,
      has_client_video: topic.hasClientVideo,
      client_video_url: topic.clientVideoUrl,
      client_video_title: topic.clientVideoTitle,
      competitor_videos: topic.competitorVideos,
      video_brief: topic.videoBrief,
      opportunity_score: topic.opportunityScore,
    }));

    if (presenceRows.length > 0) {
      // Clear old data for this client first
      await supabase
        .from("youtube_presence")
        .delete()
        .eq("client_id", clientId);

      await supabase.from("youtube_presence").insert(presenceRows);
    }

    return {
      status: "completed",
      overallScore: scanResult.overallScore,
      presenceCoverage: scanResult.presenceCoverage,
      topicsScanned: scanResult.topics.length,
    };
  }
);

export const youtubeGeoFunctions = [youtubeGeoScan];
