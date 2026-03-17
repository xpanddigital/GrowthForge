import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { updateResponseSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

// PATCH /api/responses/[responseId] — Update response status
export async function PATCH(
  request: Request,
  { params }: { params: { responseId: string } }
) {
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

    // Viewers cannot update responses
    if (user.role === "viewer") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { responseId } = params;

    // Parse and validate request body
    const body = await request.json();
    const validated = updateResponseSchema.parse(body);

    // Verify response exists and belongs to user's agency
    const { data: response, error: responseError } = await supabase
      .from("responses")
      .select("*, clients!inner(agency_id)")
      .eq("id", responseId)
      .single();

    if (responseError || !response) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    // Verify agency ownership
    const clientData = response.clients as unknown as { agency_id: string };
    if (clientData.agency_id !== user.agency_id) {
      return NextResponse.json(
        { error: "Response does not belong to your agency" },
        { status: 403 }
      );
    }

    // Validate status transitions
    const currentStatus = response.status as string;
    const newStatus = validated.status;

    const validTransitions: Record<string, string[]> = {
      draft: ["approved", "rejected"],
      approved: ["posted", "rejected"],
      rejected: ["draft"], // Allow re-drafting a rejected response
      posted: [], // Terminal state — no further transitions
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from '${currentStatus}' to '${newStatus}'. Valid transitions: ${validTransitions[currentStatus]?.join(", ") || "none"}`,
        },
        { status: 400 }
      );
    }

    // Build update payload based on the new status
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
    };

    // Handle edited text if provided
    if (validated.edited_text !== undefined) {
      updatePayload.was_edited = true;
      updatePayload.edited_text = validated.edited_text;
    }

    // Set status-specific fields
    const now = new Date().toISOString();

    switch (newStatus) {
      case "approved":
        updatePayload.approved_by = authUser.user.id;
        updatePayload.approved_at = now;
        break;

      case "posted":
        updatePayload.posted_by = authUser.user.id;
        updatePayload.posted_at = now;
        break;

      case "rejected":
        updatePayload.rejected_by = authUser.user.id;
        updatePayload.rejected_at = now;
        if (validated.rejection_reason) {
          updatePayload.rejection_reason = validated.rejection_reason;
        }
        break;

      case "draft":
        // Re-drafting a rejected response — clear rejection fields
        updatePayload.rejected_by = null;
        updatePayload.rejected_at = null;
        updatePayload.rejection_reason = null;
        break;
    }

    // Update the response
    const { data: updated, error: updateError } = await supabase
      .from("responses")
      .update(updatePayload)
      .eq("id", responseId)
      .select("id, thread_id, variant, status, was_edited, approved_at, posted_at, rejected_at, rejection_reason")
      .single();

    if (updateError) {
      throw new Error(`Failed to update response: ${updateError.message}`);
    }

    // If response is marked as 'posted', also update the parent thread status
    if (newStatus === "posted") {
      await supabase
        .from("threads")
        .update({
          status: "posted",
          status_changed_at: now,
        })
        .eq("id", response.thread_id);
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// GET /api/responses/[responseId] — Get a single response
export async function GET(
  _request: Request,
  { params }: { params: { responseId: string } }
) {
  try {
    const supabase = await createServerClient();

    // Authenticate
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { responseId } = params;

    // Fetch response (RLS ensures agency isolation)
    const { data: response, error } = await supabase
      .from("responses")
      .select("*")
      .eq("id", responseId)
      .single();

    if (error || !response) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: response });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
