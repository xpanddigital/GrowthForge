// ============================================
// PLAN ENFORCEMENT
// ============================================
// Helpers to check whether an agency can perform
// an action based on their plan limits and credit
// balance. Used by API routes and Inngest jobs.
// ============================================

import type { Agency } from "@/types/database";
import { getPlan, CREDIT_COSTS, type CreditAction, type PlanConfig } from "./plans";

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

/**
 * Check if the agency can add another client (website).
 */
export function canAddClient(
  agency: Agency,
  currentClientCount: number
): EnforcementResult {
  const plan = getPlan(agency.plan);
  if (currentClientCount >= plan.maxClients) {
    return {
      allowed: false,
      reason: `Your ${plan.name} plan supports up to ${plan.maxClients} website${plan.maxClients === 1 ? "" : "s"}. Upgrade to add more.`,
      limit: plan.maxClients,
      current: currentClientCount,
    };
  }
  return { allowed: true };
}

/**
 * Check if a client can add another keyword.
 */
export function canAddKeyword(
  agency: Agency,
  currentKeywordCount: number
): EnforcementResult {
  const plan = getPlan(agency.plan);
  if (currentKeywordCount >= plan.maxKeywordsPerClient) {
    return {
      allowed: false,
      reason: `Your ${plan.name} plan supports up to ${plan.maxKeywordsPerClient} keywords per site. Upgrade to add more.`,
      limit: plan.maxKeywordsPerClient,
      current: currentKeywordCount,
    };
  }
  return { allowed: true };
}

/**
 * Check if the agency can run another audit this month.
 */
export function canRunAudit(
  agency: Agency,
  auditsThisMonth: number
): EnforcementResult {
  const plan = getPlan(agency.plan);
  if (auditsThisMonth >= plan.maxAuditsPerMonth) {
    return {
      allowed: false,
      reason: `Your ${plan.name} plan includes ${plan.maxAuditsPerMonth} audit${plan.maxAuditsPerMonth === 1 ? "" : "s"} per month. Upgrade for more.`,
      limit: plan.maxAuditsPerMonth,
      current: auditsThisMonth,
    };
  }
  return { allowed: true };
}

/**
 * Check if the agency has enough credits for an action.
 * Does NOT deduct credits — use deductCredits for that.
 *
 * During a trial, the credit balance is capped at trialCredits (500)
 * regardless of plan. When credits run out during trial, the user
 * sees an upgrade prompt — no overage purchases allowed until
 * the trial converts to a paid subscription.
 */
export function canAffordAction(
  agency: Agency,
  action: CreditAction,
  quantity: number = 1
): EnforcementResult {
  const cost = CREDIT_COSTS[action] * quantity;
  const isTrial = isOnTrial(agency);

  if (agency.credits_balance < cost) {
    const reason = isTrial
      ? `You've used all your trial credits. Upgrade to continue — your results are waiting.`
      : `Insufficient credits. This action requires ${cost} credits but you have ${agency.credits_balance}. Credits can be purchased at your plan's overage rate.`;

    return {
      allowed: false,
      reason,
      limit: cost,
      current: agency.credits_balance,
    };
  }
  return { allowed: true };
}

/**
 * Check if an agency is currently on a free trial.
 * Trial = no Stripe subscription AND account is less than trialDays old.
 */
export function isOnTrial(agency: Agency): boolean {
  if (agency.stripe_subscription_id) return false;
  if (agency.plan === "agency_unlimited") return false;

  const plan = getPlan(agency.plan);
  const createdAt = new Date(agency.created_at);
  const now = new Date();
  const daysSinceCreation =
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceCreation <= plan.trialDays;
}

/**
 * Check if a trial has expired (past trial period, no subscription).
 */
export function isTrialExpired(agency: Agency): boolean {
  if (agency.stripe_subscription_id) return false;
  if (agency.plan === "agency_unlimited") return false;

  const plan = getPlan(agency.plan);
  const createdAt = new Date(agency.created_at);
  const now = new Date();
  const daysSinceCreation =
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceCreation > plan.trialDays;
}

/**
 * Get trial status details for display in the UI.
 */
export function getTrialStatus(agency: Agency): {
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  creditsRemaining: number;
} {
  const onTrial = isOnTrial(agency);
  const expired = isTrialExpired(agency);

  const plan = getPlan(agency.plan);
  const createdAt = new Date(agency.created_at);
  const now = new Date();
  const daysSinceCreation =
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const daysRemaining = Math.max(0, Math.ceil(plan.trialDays - daysSinceCreation));

  return {
    isTrial: onTrial,
    isExpired: expired,
    daysRemaining,
    creditsRemaining: agency.credits_balance,
  };
}

/**
 * Check if white-label reports are available on this plan.
 */
export function canUseWhiteLabel(agency: Agency): EnforcementResult {
  const plan = getPlan(agency.plan);
  if (!plan.whiteLabel) {
    return {
      allowed: false,
      reason: `White-label reports are available on the Agency plan ($397/mo) and above.`,
    };
  }
  return { allowed: true };
}

/**
 * Get the plan config for an agency.
 */
export function getAgencyPlan(agency: Agency): PlanConfig {
  return getPlan(agency.plan);
}

/**
 * Calculate the credit cost for an action.
 */
export function getCreditCost(
  action: CreditAction,
  quantity: number = 1
): number {
  return CREDIT_COSTS[action] * quantity;
}
