import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ campaignId: string }>;
}

// GET /api/press/campaigns/[campaignId]/journalists — Get scored journalists
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { campaignId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("press_campaign_journalist_scores")
      .select("*, journalists(name, email, publication, region, beats, total_pitches, total_opens, total_replies, is_blacklisted, last_contacted_at)")
      .eq("campaign_id", campaignId)
      .order("total_score", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/press/campaigns/[campaignId]/journalists — Trigger journalist discovery
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { campaignId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("agency_id")
      .eq("id", authUser.user.id)
      .single();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: campaign } = await supabase
      .from("press_campaigns")
      .select("client_id")
      .eq("id", campaignId)
      .single();
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    await inngest.send({
      name: "press/discover-journalists",
      data: {
        campaignId,
        clientId: campaign.client_id as string,
        agencyId: user.agency_id as string,
      },
    });

    return NextResponse.json({ message: "Journalist discovery queued" }, { status: 202 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/press/campaigns/[campaignId]/journalists — Select/deselect journalists
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { campaignId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scoreIds, selected } = body as { scoreIds: string[]; selected: boolean };

    for (const scoreId of scoreIds) {
      await supabase
        .from("press_campaign_journalist_scores")
        .update({ is_selected: selected })
        .eq("id", scoreId)
        .eq("campaign_id", campaignId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
