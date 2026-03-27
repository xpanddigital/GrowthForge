import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateTaskSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "skipped", "blocked"]),
  notes: z.string().optional(),
});

// PATCH /api/entity/tasks/[taskId] — Update task status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { taskId } = await params;

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's agency
    const { data: user } = await supabase
      .from("users")
      .select("agency_id")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse and validate body
    const body = await request.json();
    const validated = updateTaskSchema.parse(body);

    // Verify task exists and belongs to user's agency
    const { data: existingTask } = await supabase
      .from("entity_tasks")
      .select("id, client_id, clients!inner(agency_id)")
      .eq("id", taskId)
      .single();

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const taskClient = existingTask.clients as unknown as { agency_id: string };
    if (taskClient.agency_id !== user.agency_id) {
      return NextResponse.json(
        { error: "Task does not belong to your agency" },
        { status: 403 }
      );
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      status: validated.status,
    };

    if (validated.notes !== undefined) {
      updatePayload.notes = validated.notes;
    }

    if (validated.status === "completed") {
      updatePayload.completed_at = new Date().toISOString();
      updatePayload.completed_by = authUser.user.id;
    }

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from("entity_tasks")
      .update(updatePayload)
      .eq("id", taskId)
      .select("*")
      .single();

    if (updateError || !updatedTask) {
      throw new Error(
        `Failed to update task: ${updateError?.message || "Unknown error"}`
      );
    }

    // If completed, send Inngest event for verification
    if (validated.status === "completed") {
      await inngest.send({
        name: "entity/verify-task",
        data: {
          taskId,
          clientId: existingTask.client_id,
        },
      });
    }

    return NextResponse.json({ data: updatedTask });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
