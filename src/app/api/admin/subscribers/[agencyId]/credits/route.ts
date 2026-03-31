import { NextResponse } from "next/server";
import { requirePlatformAdmin, handleAdminError } from "@/lib/admin/auth";
import { addCredits } from "@/lib/billing/credits";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const { supabase, userId } = await requirePlatformAdmin();
    const { agencyId } = await params;

    const body = await request.json();
    const { amount, reason } = body as { amount: number; reason: string };

    // Validate
    if (!amount || !Number.isInteger(amount) || amount === 0) {
      return NextResponse.json(
        { error: "amount must be a non-zero integer" },
        { status: 400 }
      );
    }
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "reason is required" },
        { status: 400 }
      );
    }

    if (amount > 0) {
      // Use the standard addCredits helper for positive amounts
      await addCredits({
        agencyId,
        amount,
        reason: "admin_adjustment",
        description: `Admin credit adjustment: +${amount} — ${reason}`,
      });
    } else {
      // For negative amounts, handle directly
      const { data: agency, error: fetchError } = await supabase
        .from("agencies")
        .select("credits_balance")
        .eq("id", agencyId)
        .single();

      if (fetchError || !agency) {
        return NextResponse.json({ error: "Agency not found" }, { status: 404 });
      }

      const newBalance = agency.credits_balance + amount; // amount is negative

      const { error: updateError } = await supabase
        .from("agencies")
        .update({ credits_balance: newBalance })
        .eq("id", agencyId);

      if (updateError) throw updateError;

      await supabase.from("credit_transactions").insert({
        agency_id: agencyId,
        amount,
        reason: "admin_adjustment",
        balance_after: newBalance,
        description: `Admin credit adjustment: ${amount} — ${reason}`,
      });
    }

    // Log admin note
    await supabase.from("admin_notes").insert({
      agency_id: agencyId,
      author_user_id: userId,
      note: `Credit adjustment: ${amount > 0 ? "+" : ""}${amount} credits — ${reason}`,
      note_type: "credit_adjustment",
    });

    // Return updated agency
    const { data: updatedAgency } = await supabase
      .from("agencies")
      .select("id, name, credits_balance, plan")
      .eq("id", agencyId)
      .single();

    return NextResponse.json({ agency: updatedAgency });
  } catch (error) {
    return handleAdminError(error);
  }
}
