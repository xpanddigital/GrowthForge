import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/press/ideas — List campaign ideas
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    let query = supabase
      .from("press_campaign_ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);
    if (status === "approved") query = query.eq("is_approved", true);
    else if (status === "rejected") query = query.eq("is_rejected", true);
    else if (status === "pending") query = query.eq("is_approved", false).eq("is_rejected", false);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/press/ideas — Approve or reject an idea
export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ideaId, action } = body as { ideaId: string; action: "approve" | "reject" };

    if (!ideaId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "ideaId and valid action required" }, { status: 400 });
    }

    if (action === "approve") {
      // Get idea details
      const { data: idea } = await supabase
        .from("press_campaign_ideas")
        .select("*")
        .eq("id", ideaId)
        .single();

      if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

      const i = idea as Record<string, unknown>;

      // Create a campaign from the idea
      const { data: campaign, error: campError } = await supabase
        .from("press_campaigns")
        .insert({
          client_id: i.client_id,
          idea_id: ideaId,
          name: (i.headline as string) || "Untitled Campaign",
          headline: i.headline,
          angle: i.angle,
          pr_type: i.pr_type ?? "expert_commentary",
          status: "draft",
        })
        .select()
        .single();

      if (campError) throw campError;

      // Mark idea as approved and link to campaign
      await supabase
        .from("press_campaign_ideas")
        .update({ is_approved: true, promoted_to_campaign_id: campaign.id })
        .eq("id", ideaId);

      return NextResponse.json({ data: campaign }, { status: 201 });
    }

    // Reject
    await supabase
      .from("press_campaign_ideas")
      .update({ is_rejected: true })
      .eq("id", ideaId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
