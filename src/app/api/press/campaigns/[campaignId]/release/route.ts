import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ campaignId: string }>;
}

// GET /api/press/campaigns/[campaignId]/release — Get current press release
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { campaignId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("press_releases")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("version", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/press/campaigns/[campaignId]/release — Generate a press release
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
      name: "press/generate-release",
      data: {
        campaignId,
        clientId: campaign.client_id as string,
        agencyId: user.agency_id as string,
      },
    });

    return NextResponse.json({ message: "Release generation queued" }, { status: 202 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/press/campaigns/[campaignId]/release — Approve/reject release
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { campaignId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body as { action: "approve" | "reject" };

    if (action === "approve") {
      // Generate a public slug and approve
      const publicSlug = nanoid(12);
      const { error } = await supabase
        .from("press_releases")
        .update({
          status: "approved",
          public_slug: publicSlug,
          approved_at: new Date().toISOString(),
          approved_by: authUser.user.id,
        })
        .eq("campaign_id", campaignId)
        .eq("is_current", true);

      if (error) throw error;

      await supabase
        .from("press_campaigns")
        .update({ status: "release_approved", updated_at: new Date().toISOString() })
        .eq("id", campaignId);

      const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/press/${publicSlug}`;
      return NextResponse.json({ data: { publicSlug, publicUrl } });
    }

    if (action === "reject") {
      const { error } = await supabase
        .from("press_releases")
        .update({ status: "rejected" })
        .eq("campaign_id", campaignId)
        .eq("is_current", true);

      if (error) throw error;

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
