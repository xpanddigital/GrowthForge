import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

const triggerSchema = z.object({
  clientId: uuidLike,
});

// POST /api/mentions/journalist-queries — Trigger journalist query scan
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("agency_id, role")
      .eq("id", authUser.user.id)
      .single();

    if (!user || user.role === "viewer") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = triggerSchema.parse(body);

    await inngest.send({
      name: "journalist-queries/scan",
      data: {
        clientId: validated.clientId,
        agencyId: user.agency_id,
      },
    });

    return NextResponse.json(
      { data: { status: "queued", message: "Journalist query scan started" } },
      { status: 202 }
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// GET /api/mentions/journalist-queries — Get matched queries for a client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");
    const status = url.searchParams.get("status");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("journalist_queries")
      .select("*")
      .eq("client_id", clientId)
      .order("relevance_score", { ascending: false })
      .limit(50);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
