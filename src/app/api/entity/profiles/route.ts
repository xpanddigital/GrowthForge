import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/entity/profiles?clientId=xxx&status=xxx&sortBy=xxx — List profiles for a client
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
    const sortBy = searchParams.get("sortBy");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    // Verify client belongs to user's agency
    const { data: user } = await supabase
      .from("users")
      .select("agency_id")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("agency_id", user.agency_id)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from("entity_profiles")
      .select("*")
      .eq("client_id", clientId);

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Sort order
    if (sortBy === "consistency") {
      query = query.order("consistency_score", {
        ascending: true,
        nullsFirst: false,
      });
    } else {
      query = query.order("platform", { ascending: true });
    }

    const { data: profiles, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: profiles });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
