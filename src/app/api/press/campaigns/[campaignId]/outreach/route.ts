import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ campaignId: string }>;
}

// GET /api/press/campaigns/[campaignId]/outreach — Get outreach emails
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { campaignId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("press_outreach_emails")
      .select("*, journalists(name, email, publication)")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/press/campaigns/[campaignId]/outreach — Generate pitches or send to Instantly
export async function POST(request: Request, { params }: RouteParams) {
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

    const body = await request.json();
    const { action } = body as { action: "generate_pitches" | "send_outreach"; journalistScoreIds?: string[]; emailIds?: string[] };

    if (action === "generate_pitches") {
      // Get selected journalists
      const { data: selected } = await supabase
        .from("press_campaign_journalist_scores")
        .select("id")
        .eq("campaign_id", campaignId)
        .eq("is_selected", true);

      const scoreIds = body.journalistScoreIds ?? (selected ?? []).map((s: Record<string, unknown>) => s.id as string);

      await inngest.send({
        name: "press/generate-pitches",
        data: {
          campaignId,
          clientId: campaign.client_id as string,
          agencyId: user.agency_id as string,
          journalistScoreIds: scoreIds,
        },
      });

      return NextResponse.json({ message: "Pitch generation queued" }, { status: 202 });
    }

    if (action === "send_outreach") {
      const emailIds = body.emailIds as string[];
      if (!emailIds?.length) {
        return NextResponse.json({ error: "emailIds required" }, { status: 400 });
      }

      await inngest.send({
        name: "press/send-outreach",
        data: {
          campaignId,
          agencyId: user.agency_id as string,
          emailIds,
        },
      });

      return NextResponse.json({ message: "Outreach send queued" }, { status: 202 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
