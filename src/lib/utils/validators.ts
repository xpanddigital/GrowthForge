import { z } from "zod";
import {
  PLATFORMS,
  INTENTS,
  RESPONSE_VARIANTS,
  RESPONSE_STATUSES,
  PR_TYPES,
  PRESS_CAMPAIGN_STATUSES,
  COVERAGE_TYPES,
  CALENDAR_EVENT_TYPES,
} from "@/types/enums";

// Custom UUID validation that accepts any hex UUID format (including seed data IDs)
// Zod's built-in .uuid() enforces RFC 4122 version bits which rejects our seed UUIDs
export const uuidLike = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  "Invalid UUID format"
);

// Client validation
export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  website_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  brand_brief: z
    .string()
    .min(10, "Brand brief must be at least 10 characters")
    .max(2000, "Brand brief must be under 2000 characters"),
  tone_guidelines: z.string().max(1000).optional().or(z.literal("")),
  target_audience: z.string().max(1000).optional().or(z.literal("")),
  key_differentiators: z.string().max(1000).optional().or(z.literal("")),
  urls_to_mention: z.array(z.string().url()).max(5).optional().default([]),
  response_rules: z.string().max(1000).optional().or(z.literal("")),
});

export const updateClientSchema = createClientSchema.partial().extend({
  is_active: z.boolean().optional(),
});

// Keyword validation
export const createKeywordsSchema = z.object({
  client_id: uuidLike,
  keywords: z
    .array(
      z.object({
        keyword: z.string().min(1).max(200),
        tags: z.array(z.string().max(50)).max(10).optional().default([]),
        intent: z.enum(INTENTS).optional(),
        scan_platforms: z
          .array(z.enum(PLATFORMS))
          .optional()
          .default(["reddit", "quora", "facebook_groups"]),
      })
    )
    .min(1, "At least one keyword is required")
    .max(100, "Cannot add more than 100 keywords at once"),
});

export const updateKeywordSchema = z.object({
  tags: z.array(z.string().max(50)).max(10).optional(),
  intent: z.enum(INTENTS).optional(),
  volume_score: z.number().int().min(1).max(10).optional(),
  scan_platforms: z.array(z.enum(PLATFORMS)).optional(),
  is_active: z.boolean().optional(),
});

// Thread validation
export const triggerScanSchema = z.object({
  client_id: uuidLike,
  keyword_ids: z.array(uuidLike).optional(),
});

// Response validation
export const generateResponsesSchema = z.object({
  thread_id: uuidLike,
});

export const updateResponseSchema = z.object({
  status: z.enum(RESPONSE_STATUSES),
  edited_text: z.string().optional(),
  rejection_reason: z.string().max(500).optional(),
});

// Response variant validation
export const responseVariantSchema = z.object({
  variant: z.enum(RESPONSE_VARIANTS),
  body_text: z.string().min(1),
  quality_score: z.number().int().min(0).max(100),
  tone_match_score: z.number().int().min(0).max(100),
  mentions_brand: z.boolean(),
  mentions_url: z.boolean(),
});

// ============================================
// PressForge validators
// ============================================

// Campaign validation
export const createPressCampaignSchema = z.object({
  client_id: uuidLike,
  name: z.string().min(1).max(200),
  headline: z.string().max(300).optional(),
  angle: z.string().max(1000).optional(),
  pr_type: z.enum(PR_TYPES).optional().default("expert_commentary"),
  idea_id: uuidLike.optional(),
  calendar_event_id: uuidLike.optional(),
  target_date: z.string().optional(),
  target_region: z.string().max(10).optional().default("AU"),
  target_publications: z.array(z.string().max(200)).max(20).optional().default([]),
  spokesperson_id: uuidLike.optional(),
  notes: z.string().max(2000).optional(),
});

export const updatePressCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  headline: z.string().max(300).optional(),
  angle: z.string().max(1000).optional(),
  pr_type: z.enum(PR_TYPES).optional(),
  target_date: z.string().optional(),
  target_region: z.string().max(10).optional(),
  target_publications: z.array(z.string().max(200)).max(20).optional(),
  spokesperson_id: uuidLike.nullable().optional(),
  status: z.enum(PRESS_CAMPAIGN_STATUSES).optional(),
  notes: z.string().max(2000).optional(),
});

// Spokesperson validation
export const createSpokespersonSchema = z.object({
  client_id: uuidLike,
  name: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  bio: z.string().max(2000).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  voice_samples: z
    .array(
      z.object({
        quote: z.string().min(1),
        context: z.string().min(1),
        date: z.string(),
      })
    )
    .max(20)
    .optional()
    .default([]),
  photo_url: z.string().url().optional().or(z.literal("")),
  is_primary: z.boolean().optional().default(false),
});

export const updateSpokespersonSchema = createSpokespersonSchema
  .omit({ client_id: true })
  .partial();

// Press release validation
export const generatePressReleaseSchema = z.object({
  campaign_id: uuidLike,
  length: z.enum(["short", "standard", "detailed"]).optional().default("standard"),
});

export const approvePressReleaseSchema = z.object({
  release_id: uuidLike,
});

// Journalist validation
export const createJournalistSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  publication: z.string().min(1).max(200),
  publication_domain: z.string().max(200).optional(),
  publication_type: z
    .enum(["online", "print", "broadcast", "podcast", "wire_service"])
    .optional(),
  region: z.string().max(10).optional(),
  sub_regions: z.array(z.string().max(100)).max(10).optional().default([]),
  beats: z.array(z.string().max(100)).max(20).optional().default([]),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
});

export const updateJournalistSchema = createJournalistSchema.partial().extend({
  is_blacklisted: z.boolean().optional(),
  blacklist_reason: z.string().max(500).optional(),
});

// Ideation validation
export const triggerIdeationSchema = z.object({
  client_id: uuidLike,
  spokesperson_id: uuidLike,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024).max(2030),
  count: z.number().int().min(1).max(10).optional().default(5),
});

// Journalist discovery validation
export const triggerJournalistDiscoverySchema = z.object({
  campaign_id: uuidLike,
  target_count: z.number().int().min(10).max(200).optional().default(100),
});

// Pitch generation validation
export const triggerPitchGenerationSchema = z.object({
  campaign_id: uuidLike,
});

// Outreach validation
export const sendOutreachSchema = z.object({
  campaign_id: uuidLike,
});

// Coverage validation
export const createCoverageSchema = z.object({
  client_id: uuidLike,
  campaign_id: uuidLike.optional(),
  journalist_id: uuidLike.optional(),
  title: z.string().min(1).max(500),
  url: z.string().url(),
  publication: z.string().min(1).max(200),
  author: z.string().max(200).optional(),
  publish_date: z.string().optional(),
  coverage_type: z.enum(COVERAGE_TYPES).optional().default("mention"),
  has_backlink: z.boolean().optional().default(false),
  backlink_url: z.string().url().optional().or(z.literal("")),
  is_dofollow: z.boolean().optional(),
  estimated_domain_authority: z.number().int().min(0).max(100).optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
});

// Calendar event validation
export const createCalendarEventSchema = z.object({
  month: z.number().int().min(1).max(12),
  name: z.string().min(1).max(200),
  event_date: z.string().max(50).optional(),
  event_type: z.enum(CALENDAR_EVENT_TYPES),
  regions: z.array(z.string().max(20)).max(10).optional().default(["GLOBAL"]),
  industries: z.array(z.string().max(50)).max(20).optional().default(["ALL"]),
  pr_angle_hint: z.string().max(500).optional(),
  send_by_offset_days: z.number().int().min(1).max(60).optional().default(7),
});

// Idea approval validation
export const approveIdeaSchema = z.object({
  idea_id: uuidLike,
});
