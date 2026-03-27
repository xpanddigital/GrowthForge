import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

export const dynamic = "force-dynamic";

const triggerScanSchema = z.object({
  clientId: uuidLike,
});

// POST /api/mentions/scan — Trigger mention gap scan
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
    const validated = triggerScanSchema.parse(body);

    // Verify client belongs to user's agency
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, agency_id")
      .eq("id", validated.clientId)
      .eq("agency_id", user.agency_id)
      .eq("is_active", true)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    // Send Inngest event
    await inngest.send({
      name: "mentions/scan",
      data: {
        clientId: validated.clientId,
        agencyId: user.agency_id,
      },
    });

    return NextResponse.json(
      {
        data: {
          clientId: validated.clientId,
          status: "queued",
          message: `Mention gap scan queued for ${client.name}`,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
