import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST /api/reviews/campaigns/:campaignId/pause — pause active campaign
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { campaignId } = await params;

  const { data: campaign } = await supabase
    .from("review_campaigns")
    .select("status")
    .eq("id", campaignId)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status !== "active") {
    return NextResponse.json(
      { error: "Only active campaigns can be paused" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("review_campaigns")
    .update({
      status: "paused",
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "paused" });
}
