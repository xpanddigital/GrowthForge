import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/reviews/campaigns/:campaignId/recipients — recipient tracking
export async function GET(
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

  const { data, error } = await supabase
    .from("review_campaign_recipients")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recipients: data });
}

// POST /api/reviews/campaigns/:campaignId/recipients — upload recipients
export async function POST(
  req: NextRequest,
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
  const body = await req.json();
  const { recipients } = body as {
    recipients: Array<{
      name?: string;
      email?: string;
      phone?: string;
    }>;
  };

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json(
      { error: "recipients array is required" },
      { status: 400 }
    );
  }

  // Verify campaign exists
  const { data: campaign } = await supabase
    .from("review_campaigns")
    .select("id")
    .eq("id", campaignId)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const rows = recipients.map((r) => ({
    campaign_id: campaignId,
    recipient_name: r.name || null,
    recipient_email: r.email || null,
    recipient_phone: r.phone || null,
    status: "pending" as const,
  }));

  const { data, error } = await supabase
    .from("review_campaign_recipients")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { recipients: data, count: data.length },
    { status: 201 }
  );
}
