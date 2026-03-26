// ============================================
// PLAN CONFIGURATION — Single source of truth
// ============================================
// All plan limits, credit allocations, and pricing
// are defined here. The pricing page, enforcement
// middleware, and billing logic all reference this.
// ============================================

export const PLAN_IDS = [
  "solo",
  "growth",
  "agency",
  "agency_pro",
  "agency_unlimited",
] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnualMonthly: number;
  maxClients: number;
  maxKeywordsPerClient: number;
  monthlyCredits: number;
  trialCredits: number;
  trialDays: number;
  overageRatePerCredit: number;
  maxAuditsPerMonth: number;
  monitorFrequency: "weekly";
  whiteLabel: boolean;
  reports: boolean;
  support: "email" | "priority" | "dedicated_am";
  popular: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  solo: {
    id: "solo",
    name: "Solo",
    tagline: "For businesses managing their own AI visibility.",
    priceMonthly: 97,
    priceAnnualMonthly: 77,
    maxClients: 1,
    maxKeywordsPerClient: 20,
    monthlyCredits: 500,
    trialCredits: 500,
    trialDays: 14,
    overageRatePerCredit: 0.1,
    maxAuditsPerMonth: 1,
    monitorFrequency: "weekly",
    whiteLabel: false,
    reports: true,
    support: "email",
    popular: false,
  },
  growth: {
    id: "growth",
    name: "Growth",
    tagline: "For agencies growing their AI visibility practice.",
    priceMonthly: 297,
    priceAnnualMonthly: 237,
    maxClients: 5,
    maxKeywordsPerClient: 50,
    monthlyCredits: 2500,
    trialCredits: 500,
    trialDays: 14,
    overageRatePerCredit: 0.08,
    maxAuditsPerMonth: 5,
    monitorFrequency: "weekly",
    whiteLabel: false,
    reports: true,
    support: "priority",
    popular: true,
  },
  agency: {
    id: "agency",
    name: "Agency",
    tagline: "Full-scale AI visibility for established agencies.",
    priceMonthly: 397,
    priceAnnualMonthly: 317,
    maxClients: 15,
    maxKeywordsPerClient: 100,
    monthlyCredits: 7500,
    trialCredits: 500,
    trialDays: 14,
    overageRatePerCredit: 0.06,
    maxAuditsPerMonth: 15,
    monitorFrequency: "weekly",
    whiteLabel: true,
    reports: true,
    support: "priority",
    popular: false,
  },
  agency_pro: {
    id: "agency_pro",
    name: "Agency Pro",
    tagline: "Unlimited scale with dedicated support.",
    priceMonthly: 997,
    priceAnnualMonthly: 797,
    maxClients: 9999,
    maxKeywordsPerClient: 9999,
    monthlyCredits: 25000,
    trialCredits: 500,
    trialDays: 14,
    overageRatePerCredit: 0.05,
    maxAuditsPerMonth: 9999,
    monitorFrequency: "weekly",
    whiteLabel: true,
    reports: true,
    support: "dedicated_am",
    popular: false,
  },
  // Internal plan for Phase 1 development — not shown on pricing page
  agency_unlimited: {
    id: "agency_unlimited",
    name: "Agency Unlimited",
    tagline: "Internal development plan.",
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    maxClients: 9999,
    maxKeywordsPerClient: 9999,
    monthlyCredits: 999999,
    trialCredits: 999999,
    trialDays: 14,
    overageRatePerCredit: 0,
    maxAuditsPerMonth: 9999,
    monitorFrequency: "weekly",
    whiteLabel: true,
    reports: true,
    support: "dedicated_am",
    popular: false,
  },
};

// Plans shown on the public pricing page (excludes internal plans)
export const PUBLIC_PLANS: PlanId[] = [
  "solo",
  "growth",
  "agency",
  "agency_pro",
];

// ============================================
// CREDIT COSTS — What each operation costs
// ============================================

export const CREDIT_COSTS = {
  serp_scan: 1, // per keyword
  thread_enrich: 2, // per thread
  classification: 1, // per thread
  response_generation: 10, // 3 variants per thread
  ai_probe: 5, // per query
  monitor_test: 3, // per model per prompt
  full_audit: 50, // all 5 pillars
  quick_audit: 20, // 3 pillars
  citation_only_audit: 10, // citation + ai presence
  press_ideation: 5, // per campaign idea batch
  press_release: 15, // per press release generation
  press_pitch: 3, // per pitch generation
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// ============================================
// HELPERS
// ============================================

export function getPlan(planId: string): PlanConfig {
  const plan = PLANS[planId as PlanId];
  if (!plan) {
    // Fall back to solo for unknown plans
    return PLANS.solo;
  }
  return plan;
}

export function isUnlimited(value: number): boolean {
  return value >= 9999;
}

export function formatLimit(value: number): string {
  return isUnlimited(value) ? "Unlimited" : value.toString();
}
