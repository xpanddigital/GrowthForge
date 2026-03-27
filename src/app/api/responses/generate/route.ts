import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateResponsesSchema } from "@/lib/utils/validators";
import { handleApiError, RateLimitError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { checkCredits, InsufficientCreditsError } from "@/lib/billing/credits";
import { CREDIT_COSTS } from "@/lib/billing/stripe";
import { rateLimit } from "@/lib/utils/rate-limit";

// POST /api/responses/generate — Generate 3 response variants for a thread
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

    // Viewers cannot generate responses
    if (user.role === "viewer") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Rate limit: max 10 response generations per minute per agency
    rateLimit(`responses:${user.agency_id}`, { maxRequests: 10, windowMs: 60_000 });

    // Parse and validate request body
    const body = await request.json();
    const validated = generateResponsesSchema.parse(body);

    // Verify thread exists and belongs to user's agency
    const { data: thread, error: threadError } = await supabase
      .from("threads")
      .select("id, status, client_id, title, clients!inner(agency_id)")
      .eq("id", validated.thread_id)
      .single();

    if (threadError || !thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    // Verify agency ownership through the client relationship
    const clientData = thread.clients as unknown as { agency_id: string };
    if (clientData.agency_id !== user.agency_id) {
      return NextResponse.json(
        { error: "Thread does not belong to your agency" },
        { status: 403 }
      );
    }

    // Check credits
    try {
      await checkCredits(user.agency_id, CREDIT_COSTS.response_generation);
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        return NextResponse.json(
          {
            error: `Insufficient credits. Response generation requires ${CREDIT_COSTS.response_generation} credits. You have ${err.available}.`,
            code: "INSUFFICIENT_CREDITS",
            required: err.required,
            available: err.available,
          },
          { status: 402 }
        );
      }
      throw err;
    }

    // Check thread is in a valid state for response generation
    // Allow generation from most statuses — the thread has at least a title/snippet from SERP
    const blockedStatuses = ["generating", "posted"];
    if (blockedStatuses.includes(thread.status)) {
      if (thread.status === "generating") {
        return NextResponse.json(
          { error: "Responses are already being generated for this thread" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Thread is in '${thread.status}' status and cannot be regenerated.` },
        { status: 400 }
        );
    }

    // If re-generating for a 'responded' thread, clear existing drafts
    if (thread.status === "responded") {
      await supabase
        .from("responses")
        .delete()
        .eq("thread_id", validated.thread_id)
        .eq("status", "draft");
    }



    // Check existing non-draft responses to avoid duplicates
    const { count: existingResponses } = await supabase
      .from("responses")
      .select("id", { count: "exact", head: true })
      .eq("thread_id", validated.thread_id)
      .in("status", ["approved", "posted"]);

    if (existingResponses && existingResponses > 0) {
      return NextResponse.json(
        {
          error:
            "This thread already has approved or posted responses. Cannot regenerate.",
        },
        { status: 409 }
      );
    }

    // Queue the Inngest job
    await inngest.send({
      name: "responses/generate",
      data: {
        threadId: validated.thread_id,
      },
    });

    return NextResponse.json(
      {
        data: {
          threadId: validated.thread_id,
          status: "generating",
          message: "Response generation queued",
        },
      },
      { status: 202 }
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
