import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createCoverageSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/press/coverage — List coverage for a client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const campaignId = searchParams.get("campaignId");

    let query = supabase
      .from("press_coverage")
      .select("*")
      .order("publish_date", { ascending: false, nullsFirst: false });

    if (clientId) query = query.eq("client_id", clientId);
    if (campaignId) query = query.eq("campaign_id", campaignId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/press/coverage — Manual coverage entry
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createCoverageSchema.parse(body);

    const { data, error } = await supabase
      .from("press_coverage")
      .insert({
        ...validated,
        source: "manual",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
