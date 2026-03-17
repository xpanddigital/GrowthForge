import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";

// POST /api/reviews/campaigns/:campaignId/activate — start sending
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
    .select("status, client_id")
    .eq("id", campaignId)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status !== "approved") {
    return NextResponse.json(
      { error: "Campaign must be approved before activating" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("review_campaigns")
    .update({
      status: "active",
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Queue the send job
  await inngest.send({
    name: "review/send-campaign",
    data: {
      campaignId,
      clientId: campaign.client_id as string,
    },
  });

  return NextResponse.json({ status: "active" });
}
