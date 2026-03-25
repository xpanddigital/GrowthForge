// Credit transaction helpers for GrowthForge.
// Every action that consumes credits goes through these functions.

import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export class InsufficientCreditsError extends Error {
  constructor(
    public required: number,
    public available: number
  ) {
    super(
      `Insufficient credits: ${required} required, ${available} available`
    );
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Check if an agency has enough credits for an operation.
 * Returns the current balance.
 */
export async function checkCredits(
  agencyId: string,
  required: number
): Promise<number> {
  const supabase = createAdminClient();

  const { data: agency, error } = await supabase
    .from("agencies")
    .select("credits_balance, plan")
    .eq("id", agencyId)
    .single();

  if (error || !agency) {
    throw new Error(`Agency ${agencyId} not found`);
  }

  // Unlimited plans skip credit checks
  if (agency.plan === "agency_unlimited") {
    return agency.credits_balance;
  }

  if (agency.credits_balance < required) {
    throw new InsufficientCreditsError(required, agency.credits_balance);
  }

  return agency.credits_balance;
}

/**
 * Deduct credits from an agency and log the transaction.
 * Returns the new balance.
 */
export async function deductCredits(params: {
  agencyId: string;
  amount: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  description?: string;
}): Promise<number> {
  const supabase = createAdminClient();
  const { agencyId, amount, reason, referenceType, referenceId, description } =
    params;

  // Get current balance
  const { data: agency, error: fetchError } = await supabase
    .from("agencies")
    .select("credits_balance, plan")
    .eq("id", agencyId)
    .single();

  if (fetchError || !agency) {
    throw new Error(`Agency ${agencyId} not found`);
  }

  // Unlimited plans don't deduct
  if (agency.plan === "agency_unlimited") {
    return agency.credits_balance;
  }

  const newBalance = agency.credits_balance - amount;

  // Update balance
  const { error: updateError } = await supabase
    .from("agencies")
    .update({ credits_balance: newBalance })
    .eq("id", agencyId);

  if (updateError) {
    throw new Error(`Failed to update credits: ${updateError.message}`);
  }

  // Log transaction
  await supabase.from("credit_transactions").insert({
    agency_id: agencyId,
    amount: -amount,
    reason,
    reference_type: referenceType || null,
    reference_id: referenceId || null,
    balance_after: newBalance,
    description: description || `${reason}: -${amount} credits`,
  });

  return newBalance;
}

/**
 * Add credits to an agency (purchase, refund, bonus).
 */
export async function addCredits(params: {
  agencyId: string;
  amount: number;
  reason: string;
  description?: string;
}): Promise<number> {
  const supabase = createAdminClient();
  const { agencyId, amount, reason, description } = params;

  const { data: agency, error: fetchError } = await supabase
    .from("agencies")
    .select("credits_balance")
    .eq("id", agencyId)
    .single();

  if (fetchError || !agency) {
    throw new Error(`Agency ${agencyId} not found`);
  }

  const newBalance = agency.credits_balance + amount;

  const { error: updateError } = await supabase
    .from("agencies")
    .update({ credits_balance: newBalance })
    .eq("id", agencyId);

  if (updateError) {
    throw new Error(`Failed to update credits: ${updateError.message}`);
  }

  await supabase.from("credit_transactions").insert({
    agency_id: agencyId,
    amount,
    reason,
    balance_after: newBalance,
    description: description || `${reason}: +${amount} credits`,
  });

  return newBalance;
}
