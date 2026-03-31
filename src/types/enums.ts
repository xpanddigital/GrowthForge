export const PLATFORMS = ["reddit", "quora", "facebook_groups"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const INTENTS = [
  "informational",
  "transactional",
  "commercial",
  "navigational",
] as const;
export type Intent = (typeof INTENTS)[number];

export const THREAD_STATUSES = [
  "new",
  "enriching",
  "classified",
  "queued",
  "generating",
  "responded",
  "posted",
  "skipped",
  "expired",
] as const;
export type ThreadStatus = (typeof THREAD_STATUSES)[number];

export const RESPONSE_STATUSES = [
  "draft",
  "approved",
  "posted",
  "rejected",
] as const;
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];

export const RESPONSE_VARIANTS = ["casual", "expert", "story"] as const;
export type ResponseVariant = (typeof RESPONSE_VARIANTS)[number];

export const USER_ROLES = [
  "platform_admin",
  "agency_owner",
  "agency_admin",
  "member",
  "viewer",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const DISCOVERY_RUN_TYPES = [
  "serp_scan",
  "ai_probe",
  "thread_enrich",
  "classification",
  "response_gen",
] as const;
export type DiscoveryRunType = (typeof DISCOVERY_RUN_TYPES)[number];

export const AUDIT_TYPES = [
  "full",
  "citation_only",
  "ai_presence_only",
  "quick",
] as const;
export type AuditType = (typeof AUDIT_TYPES)[number];

export const AUDIT_PILLARS = [
  "citations",
  "ai_presence",
  "entities",
  "reviews",
  "press",
] as const;
export type AuditPillar = (typeof AUDIT_PILLARS)[number];

export const AGENT_TYPES = [
  "discovery",
  "enrichment",
  "classification",
  "response",
  "audit_citation",
  "audit_ai_presence",
  "audit_entity",
  "audit_review",
  "audit_press",
  "monitor",
  "press_ideation",
  "press_release",
  "press_voice",
  "press_journalist_discovery",
  "press_journalist_scoring",
  "press_pitch",
  "press_coverage",
] as const;
export type AgentType = (typeof AGENT_TYPES)[number];

export const AGENT_TRIGGERS = [
  "cron",
  "manual",
  "inngest_job",
  "audit",
  "onboarding",
] as const;
export type AgentTrigger = (typeof AGENT_TRIGGERS)[number];

// ============================================
// PressForge enums
// ============================================

export const PRESS_CAMPAIGN_STATUSES = [
  "draft",
  "ideation_complete",
  "press_release_draft",
  "press_release_approved",
  "journalists_found",
  "outreach_ready",
  "outreach_sent",
  "monitoring",
  "completed",
  "cancelled",
  "archived",
] as const;
export type PressCampaignStatus = (typeof PRESS_CAMPAIGN_STATUSES)[number];

export const PR_TYPES = [
  "expert_commentary",
  "data_driven",
  "case_study",
  "thought_leadership",
  "event",
  "award",
  "partnership",
  "launch",
] as const;
export type PrType = (typeof PR_TYPES)[number];

export const PRESS_RELEASE_STATUSES = [
  "draft",
  "review",
  "approved",
  "rejected",
] as const;
export type PressReleaseStatus = (typeof PRESS_RELEASE_STATUSES)[number];

export const OUTREACH_STATUSES = [
  "pending",
  "sent",
  "opened",
  "clicked",
  "replied",
  "bounced",
  "unsubscribed",
] as const;
export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];

export const COVERAGE_TYPES = [
  "feature",
  "mention",
  "quote",
  "syndication",
  "backlink_only",
] as const;
export type CoverageType = (typeof COVERAGE_TYPES)[number];

export const JOURNALIST_TIERS = [
  "tier_1",
  "tier_2",
  "tier_3",
  "skip",
] as const;
export type JournalistTier = (typeof JOURNALIST_TIERS)[number];

export const CALENDAR_EVENT_TYPES = [
  "awareness_day",
  "awareness_month",
  "seasonal",
  "industry",
  "news_pattern",
] as const;
export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

export const CLIENT_TYPES = ["business", "thought_leader"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

// ============================================
// Billing enums
// ============================================

export const PLAN_IDS = [
  "solo",
  "growth",
  "agency",
  "agency_pro",
  "agency_unlimited",
] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const BILLING_INTERVALS = ["monthly", "annual"] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

// ============================================
// Admin BI enums
// ============================================

export const SUBSCRIPTION_EVENT_TYPES = [
  "checkout_completed",
  "subscription_updated",
  "subscription_deleted",
  "invoice_paid",
  "invoice_payment_failed",
  "trial_will_end",
] as const;
export type SubscriptionEventType = (typeof SUBSCRIPTION_EVENT_TYPES)[number];

export const SUBSCRIPTION_STATUSES = [
  "none",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "paused",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
