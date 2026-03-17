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
