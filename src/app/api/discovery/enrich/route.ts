import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { uuidLike } from "@/lib/utils/validators";

const enrichRequestSchema = z.object({
  client_id: uuidLike,
  thread_ids: z
    .array(uuidLike)
    .min(1, "At least one thread ID is required")
    .max(200, "Cannot enrich more than 200 threads at once"),
});

// POST /api/discovery/enrich — Trigger thread enrichment
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    // Authenticate
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists and get their agency
    const { data: user } = await supabase
      .from("users")
      .select("agency_id, role")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Viewers cannot trigger enrichment
    if (user.role === "viewer") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = enrichRequestSchema.parse(body);

    // Verify client belongs to user's agency
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, agency_id")
      .eq("id", validated.client_id)
      .eq("agency_id", user.agency_id)
      .eq("is_active", true)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    // Verify all threads belong to this client and are eligible for enrichment
    const { data: threads, error: threadError } = await supabase
      .from("threads")
      .select("id")
      .in("id", validated.thread_ids)
      .eq("client_id", validated.client_id)
      .eq("is_enriched", false);

    if (threadError) {
      throw new Error(`Failed to verify threads: ${threadError.message}`);
    }

    const eligibleIds = (threads || []).map(
      (t: { id: string }) => t.id
    );

    if (eligibleIds.length === 0) {
      return NextResponse.json(
        { error: "No eligible threads found for enrichment" },
        { status: 400 }
      );
    }

    // Queue the Inngest job
    await inngest.send({
      name: "discovery/enrich",
      data: {
        clientId: validated.client_id,
        threadIds: eligibleIds,
      },
    });

    return NextResponse.json(
      {
        data: {
          clientId: validated.client_id,
          threadCount: eligibleIds.length,
          status: "pending",
          message: `Enrichment queued for ${eligibleIds.length} threads`,
          skipped: validated.thread_ids.length - eligibleIds.length,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
