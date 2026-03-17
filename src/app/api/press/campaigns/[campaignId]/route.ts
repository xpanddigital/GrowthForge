import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { updatePressCampaignSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

interface RouteParams {
  params: Promise<{ campaignId: string }>;
}

// GET /api/press/campaigns/[campaignId] — Get campaign details
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { campaignId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("press_campaigns")
      .select(
        "*, spokespersons(name, title, voice_profile), press_releases(*, is_current), press_campaign_journalist_scores(*, journalists(name, email, publication, region)), press_outreach_emails(*, journalists(name, email, publication))"
      )
      .eq("id", campaignId)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    return NextResponse.json({ data });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/press/campaigns/[campaignId] — Update campaign
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { campaignId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updatePressCampaignSchema.parse(body);

    const { data, error } = await supabase
      .from("press_campaigns")
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq("id", campaignId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/press/campaigns/[campaignId] — Delete campaign
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { campaignId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("press_campaigns")
      .delete()
      .eq("id", campaignId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
