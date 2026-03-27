import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

// GET /api/entity/tasks?clientId=xxx&status=xxx&assignedTo=xxx&platform=xxx
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
    const assignedTo = searchParams.get("assignedTo");
    const platform = searchParams.get("platform");

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

    let query = supabase
      .from("entity_tasks")
      .select("*")
      .eq("client_id", clientId);

    if (status) {
      query = query.eq("status", status);
    }
    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo);
    }
    if (platform) {
      query = query.eq("platform", platform);
    }

    query = query.order("priority_score", {
      ascending: false,
      nullsFirst: false,
    });

    const { data: tasks, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: tasks });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
