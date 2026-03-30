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

// Credit costs — calibrated so 1 credit ≈ $0.04 in API cost
// Target: 70% gross margin across all plans
export const CREDIT_COSTS = {
  serp_scan: 1, // per keyword (~$0.01 API cost)
  thread_enrich: 1, // per thread (~$0.02 API cost)
  classification: 1, // per thread (~$0.005 API cost)
  response_generation: 2, // 3 variants per thread (~$0.08 API cost)
  ai_probe: 2, // per query (~$0.03 API cost)
  monitor_test: 1, // per model per prompt (~$0.02 API cost)
  full_audit: 20, // all 5 pillars (~$0.75 API cost)
  quick_audit: 8, // 3 pillars (~$0.30 API cost)
  citation_only_audit: 4, // citation + ai presence (~$0.15 API cost)
  press_ideation: 2, // per campaign idea batch (~$0.05 API cost)
  press_release: 5, // per press release generation (~$0.15 API cost)
  press_pitch: 1, // per pitch generation (~$0.03 API cost)
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
