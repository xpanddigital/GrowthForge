import { NextResponse } from "next/server";
import { requirePlatformAdmin, handleAdminError } from "@/lib/admin/auth";
import { PLANS, PLAN_IDS, type PlanId } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const { supabase, userId } = await requirePlatformAdmin();
    const { agencyId } = await params;

    const body = await request.json();
    const { plan } = body as { plan: string };

    // Validate plan ID
    if (!plan || !PLAN_IDS.includes(plan as PlanId)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${PLAN_IDS.join(", ")}` },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan as PlanId];

    // Get current agency for the note
    const { data: currentAgency, error: fetchError } = await supabase
      .from("agencies")
      .select("plan")
      .eq("id", agencyId)
      .single();

    if (fetchError || !currentAgency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const previousPlan = currentAgency.plan;

    // Update agency plan and limits
    const { error: updateError } = await supabase
      .from("agencies")
      .update({
        plan: planConfig.id,
        max_clients: planConfig.maxClients,
        max_keywords_per_client: planConfig.maxKeywordsPerClient,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agencyId);

    if (updateError) throw updateError;

    // Log admin note
    await supabase.from("admin_notes").insert({
      agency_id: agencyId,
      author_user_id: userId,
      note: `Plan changed from "${previousPlan}" to "${planConfig.id}" (${planConfig.name})`,
      note_type: "plan_change",
    });

    // Return updated agency
    const { data: updatedAgency } = await supabase
      .from("agencies")
      .select("id, name, plan, max_clients, max_keywords_per_client, credits_balance")
      .eq("id", agencyId)
      .single();

    return NextResponse.json({ agency: updatedAgency });
  } catch (error) {
    return handleAdminError(error);
  }
}
