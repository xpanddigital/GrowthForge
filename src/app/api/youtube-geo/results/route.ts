import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

// GET /api/youtube-geo/results — Get YouTube presence data for a client
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

    const { data: topics, error } = await supabase
      .from("youtube_presence")
      .select("*")
      .eq("client_id", clientId)
      .order("opportunity_score", { ascending: false });

    if (error) throw error;

    // Calculate summary stats
    const topicList = topics || [];
    const withVideo = topicList.filter((t) => t.has_client_video);
    const gaps = topicList.filter(
      (t) => !t.has_client_video && (t.opportunity_score || 0) >= 50
    );

    return NextResponse.json({
      data: topicList,
      stats: {
        totalTopics: topicList.length,
        withClientVideo: withVideo.length,
        gapCount: gaps.length,
        presenceCoverage:
          topicList.length > 0
            ? Math.round((withVideo.length / topicList.length) * 100)
            : 0,
      },
    });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
