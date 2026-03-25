import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/mentions/gaps — Get mention gaps for a client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");
    const status = url.searchParams.get("status"); // open | in_progress | resolved | dismissed
    const platform = url.searchParams.get("platform");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId query parameter required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("mention_gaps")
      .select("*")
      .eq("client_id", clientId)
      .order("opportunity_score", { ascending: false })
      .limit(100);

    if (status) {
      query = query.eq("status", status);
    }

    if (platform) {
      query = query.eq("platform", platform);
    }

    const { data: gaps, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: gaps || [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/mentions/gaps — Update gap status
export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gapId, status: newStatus } = body;

    if (!gapId || !newStatus) {
      return NextResponse.json(
        { error: "gapId and status required" },
        { status: 400 }
      );
    }

    const validStatuses = ["open", "in_progress", "resolved", "dismissed"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("mention_gaps")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gapId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
