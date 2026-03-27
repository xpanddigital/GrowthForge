import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createPressCampaignSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

// GET /api/press/campaigns — List press campaigns for the current client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    let query = supabase
      .from("press_campaigns")
      .select("*, spokespersons(name, title), press_releases(id, title, status, is_current)")
      .order("created_at", { ascending: false });

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/press/campaigns — Create a new press campaign
export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const validated = createPressCampaignSchema.parse(body);

    // Verify client belongs to agency
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", validated.client_id)
      .single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { data: campaign, error } = await supabase
      .from("press_campaigns")
      .insert({
        client_id: validated.client_id,
        spokesperson_id: validated.spokesperson_id,
        headline: validated.headline,
        angle: validated.angle,
        pr_type: validated.pr_type,
        target_region: validated.target_region ?? "AU",
        target_date: validated.target_date ?? null,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
