// Stripe integration for MentionLayer billing.
// Handles customer creation, checkout sessions, and subscription management.
//
// Plan definitions come from @/lib/billing/plans.ts — this file just bridges
// Stripe price IDs to our plan system and provides cost constants for credit checks.

import Stripe from "stripe";
import { PLANS, CREDIT_COSTS as PLAN_CREDIT_COSTS, type PlanId } from "./plans";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/**
 * Map a Stripe Price ID back to our internal plan ID.
 * Price IDs are configured via environment variables.
 */
export function getPlanByPriceId(priceId: string): PlanId | null {
  const mapping: Record<string, PlanId> = {
    [process.env.STRIPE_PRICE_SOLO || ""]: "solo",
    [process.env.STRIPE_PRICE_GROWTH || ""]: "growth",
    [process.env.STRIPE_PRICE_AGENCY || ""]: "agency",
    [process.env.STRIPE_PRICE_AGENCY_PRO || ""]: "agency_pro",
  };
  // Remove empty string key if env vars not set
  delete mapping[""];
  return mapping[priceId] || null;
}

/**
 * Get plan limits by plan ID string.
 */
export function getPlanLimits(plan: string) {
  const key = plan as PlanId;
  return PLANS[key] || PLANS.solo;
}

// Re-export so API routes can import from either location
export { PLANS };
export const CREDIT_COSTS = PLAN_CREDIT_COSTS;
