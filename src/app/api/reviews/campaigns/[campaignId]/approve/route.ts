import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// POST /api/reviews/campaigns/:campaignId/approve — approve campaign (admin+)
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

  // Check the campaign is in 'review' status
  const { data: campaign } = await supabase
    .from("review_campaigns")
    .select("status")
    .eq("id", campaignId)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status !== "review" && campaign.status !== "draft") {
    return NextResponse.json(
      { error: `Campaign cannot be approved from status '${campaign.status}'` },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("review_campaigns")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "approved" });
}
