// Stripe integration for GrowthForge billing.
// Handles customer creation, checkout sessions, and subscription management.

import Stripe from "stripe";

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

// Plan definitions — prices are set in Stripe Dashboard, IDs stored here.
// These map to Stripe Price IDs created in the Stripe Dashboard.
export const PLANS = {
  starter: {
    name: "Starter",
    monthlyCredits: 500,
    maxClients: 5,
    maxKeywordsPerClient: 50,
    features: ["Citation Engine", "AI Monitor"],
    priceMonthly: 99,
  },
  growth: {
    name: "Growth",
    monthlyCredits: 2000,
    maxClients: 15,
    maxKeywordsPerClient: 200,
    features: ["Citation Engine", "AI Monitor", "Entity Sync", "Review Engine"],
    priceMonthly: 249,
  },
  agency_pro: {
    name: "Agency Pro",
    monthlyCredits: 10000,
    maxClients: 50,
    maxKeywordsPerClient: 500,
    features: [
      "Citation Engine",
      "AI Monitor",
      "Entity Sync",
      "Review Engine",
      "PressForge",
      "Full Audit",
    ],
    priceMonthly: 499,
  },
  agency_unlimited: {
    name: "Agency Unlimited",
    monthlyCredits: 999999,
    maxClients: 100,
    maxKeywordsPerClient: 100,
    features: ["Everything"],
    priceMonthly: 0,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanKey | null {
  const mapping: Record<string, PlanKey> = {
    [process.env.STRIPE_PRICE_STARTER || ""]: "starter",
    [process.env.STRIPE_PRICE_GROWTH || ""]: "growth",
    [process.env.STRIPE_PRICE_AGENCY_PRO || ""]: "agency_pro",
  };
  return mapping[priceId] || null;
}

export function getPlanLimits(plan: string) {
  const key = plan as PlanKey;
  return PLANS[key] || PLANS.starter;
}

// Credit cost constants
export const CREDIT_COSTS = {
  serp_scan: 1,          // per keyword
  thread_enrich: 2,      // per thread
  classification: 1,     // per thread
  response_generation: 10, // 3 variants
  ai_probe: 5,           // per keyword set
  monitor_test: 3,       // per model
  full_audit: 50,        // 5 pillars
  quick_audit: 20,       // 3 pillars
} as const;
