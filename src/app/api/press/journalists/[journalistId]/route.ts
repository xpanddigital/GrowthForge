import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { updateJournalistSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

interface RouteParams {
  params: Promise<{ journalistId: string }>;
}

// GET /api/press/journalists/[journalistId] — Get journalist profile
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { journalistId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("journalists")
      .select("*, press_campaign_journalist_scores(campaign_id, total_score, tier, why_selected, created_at)")
      .eq("id", journalistId)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Journalist not found" }, { status: 404 });

    return NextResponse.json({ data });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/press/journalists/[journalistId] — Update journalist
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { journalistId } = await params;
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateJournalistSchema.parse(body);

    const { data, error } = await supabase
      .from("journalists")
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq("id", journalistId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
