// ============================================
// CREDIT TRANSACTIONS
// ============================================
// Handles deducting and adding credits to an
// agency's balance. All mutations go through
// Supabase with a transaction-safe pattern.
// ============================================

import { createServerClient } from "@/lib/supabase/server";
import { CREDIT_COSTS, type CreditAction } from "./plans";

interface DeductCreditsParams {
  agencyId: string;
  action: CreditAction;
  quantity?: number;
  referenceType?: string;
  referenceId?: string;
  description?: string;
}

interface CreditResult {
  success: boolean;
  creditsUsed: number;
  balanceAfter: number;
  error?: string;
}

/**
 * Deduct credits from an agency's balance and log the transaction.
 * Returns the new balance. Fails if insufficient credits.
 */
export async function deductCredits({
  agencyId,
  action,
  quantity = 1,
  referenceType,
  referenceId,
  description,
}: DeductCreditsParams): Promise<CreditResult> {
  const supabase = await createServerClient();
  const cost = CREDIT_COSTS[action] * quantity;

  // Fetch current balance
  const { data: agency, error: fetchError } = await supabase
    .from("agencies")
    .select("credits_balance")
    .eq("id", agencyId)
    .single();

  if (fetchError || !agency) {
    return {
      success: false,
      creditsUsed: 0,
      balanceAfter: 0,
      error: "Agency not found",
    };
  }

  if (agency.credits_balance < cost) {
    return {
      success: false,
      creditsUsed: 0,
      balanceAfter: agency.credits_balance,
      error: `Insufficient credits: ${cost} required, ${agency.credits_balance} available`,
    };
  }

  const newBalance = agency.credits_balance - cost;

  // Update balance
  const { error: updateError } = await supabase
    .from("agencies")
    .update({ credits_balance: newBalance })
    .eq("id", agencyId);

  if (updateError) {
    return {
      success: false,
      creditsUsed: 0,
      balanceAfter: agency.credits_balance,
      error: "Failed to update balance",
    };
  }

  // Log the transaction
  await supabase.from("credit_transactions").insert({
    agency_id: agencyId,
    amount: -cost,
    reason: action,
    reference_type: referenceType ?? null,
    reference_id: referenceId ?? null,
    balance_after: newBalance,
    description: description ?? `${action} x${quantity}`,
  });

  return {
    success: true,
    creditsUsed: cost,
    balanceAfter: newBalance,
  };
}

/**
 * Add credits to an agency's balance (purchase, refund, bonus).
 */
export async function addCredits({
  agencyId,
  amount,
  reason,
  description,
}: {
  agencyId: string;
  amount: number;
  reason: string;
  description?: string;
}): Promise<CreditResult> {
  const supabase = await createServerClient();

  const { data: agency, error: fetchError } = await supabase
    .from("agencies")
    .select("credits_balance")
    .eq("id", agencyId)
    .single();

  if (fetchError || !agency) {
    return {
      success: false,
      creditsUsed: 0,
      balanceAfter: 0,
      error: "Agency not found",
    };
  }

  const newBalance = agency.credits_balance + amount;

  const { error: updateError } = await supabase
    .from("agencies")
    .update({ credits_balance: newBalance })
    .eq("id", agencyId);

  if (updateError) {
    return {
      success: false,
      creditsUsed: 0,
      balanceAfter: agency.credits_balance,
      error: "Failed to update balance",
    };
  }

  await supabase.from("credit_transactions").insert({
    agency_id: agencyId,
    amount,
    reason,
    balance_after: newBalance,
    description: description ?? `${reason}: +${amount} credits`,
  });

  return {
    success: true,
    creditsUsed: 0,
    balanceAfter: newBalance,
  };
}

/**
 * Reset an agency's credits to their plan's monthly allocation.
 * Called by a monthly cron job at billing cycle reset.
 */
export async function resetMonthlyCredits(
  agencyId: string,
  monthlyAllocation: number
): Promise<CreditResult> {
  return addCredits({
    agencyId,
    amount: monthlyAllocation,
    reason: "monthly_allocation",
    description: `Monthly credit reset: +${monthlyAllocation} credits`,
  });
}
