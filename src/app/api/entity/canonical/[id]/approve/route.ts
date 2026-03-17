import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

// POST /api/entity/canonical/[id]/approve — Approve a canonical
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's agency and role
    const { data: user } = await supabase
      .from("users")
      .select("agency_id, role")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Requires agency_admin or agency_owner role
    if (!["agency_admin", "agency_owner", "platform_admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Requires agency_admin or agency_owner role." },
        { status: 403 }
      );
    }

    // Verify canonical exists and belongs to user's agency
    const { data: canonical, error: canonicalError } = await supabase
      .from("entity_canonical")
      .select("id, client_id, status")
      .eq("id", id)
      .single();

    if (canonicalError || !canonical) {
      return NextResponse.json(
        { error: "Canonical not found" },
        { status: 404 }
      );
    }

    // Verify client belongs to user's agency
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", canonical.client_id)
      .eq("agency_id", user.agency_id)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    if (canonical.status === "approved") {
      return NextResponse.json(
        { error: "Canonical is already approved" },
        { status: 400 }
      );
    }

    // Update status to approved
    const { data: updated, error: updateError } = await supabase
      .from("entity_canonical")
      .update({
        status: "approved",
        approved_by: authUser.user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      throw new Error(
        `Failed to approve canonical: ${updateError?.message || "Unknown error"}`
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
