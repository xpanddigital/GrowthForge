import { z } from "zod";
import { PLATFORMS, INTENTS, RESPONSE_VARIANTS, RESPONSE_STATUSES } from "@/types/enums";

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
  client_id: z.string().uuid(),
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
  client_id: z.string().uuid(),
  keyword_ids: z.array(z.string().uuid()).optional(),
});

// Response validation
export const generateResponsesSchema = z.object({
  thread_id: z.string().uuid(),
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
