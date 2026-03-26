// Database row types matching the SQL schema exactly.
// These types mirror what Supabase returns from queries.

export interface Agency {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  logo_url: string | null;
  plan: string;
  credits_balance: number;
  monthly_credits_allocation: number;
  billing_cycle_start: string;
  billing_interval: "monthly" | "annual";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  max_clients: number;
  max_keywords_per_client: number;
  is_platform_owner: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  agency_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  signup_source: string;
  ghl_contact_id: string | null;
  company_name: string | null;
  website_url: string | null;
  last_active_at: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  agency_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  brand_brief: string;
  tone_guidelines: string | null;
  target_audience: string | null;
  key_differentiators: string | null;
  urls_to_mention: string[];
  response_rules: string | null;
  // PressForge additions (migration 0013)
  client_type: string | null;
  industry: string | null;
  sub_industry: string | null;
  location: string | null;
  description: string | null;
  target_regions: string[];
  created_by_signup: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Keyword {
  id: string;
  client_id: string;
  keyword: string;
  tags: string[];
  intent: string | null;
  volume_score: number | null;
  source: string;
  scan_platforms: string[];
  is_active: boolean;
  created_at: string;
}

export interface Thread {
  id: string;
  client_id: string;
  keyword_id: string | null;
  platform: string;
  platform_id: string | null;
  subreddit: string | null;
  group_name: string | null;
  title: string;
  body_text: string | null;
  url: string;
  author: string | null;
  comment_count: number;
  upvote_count: number;
  thread_date: string | null;
  top_comments: Record<string, unknown>[];
  discovered_via: string;
  google_position: number | null;
  ai_source: string | null;
  ai_query: string | null;
  intent: string | null;
  relevance_score: number | null;
  opportunity_score: number | null;
  can_mention_brand: boolean | null;
  suggested_angle: string | null;
  classification_tags: string[];
  status: string;
  is_enriched: boolean;
  enriched_at: string | null;
  enrichment_error: string | null;
  content_hash: string;
  discovered_at: string;
  last_checked_at: string;
  status_changed_at: string;
}

export interface DiscoveryRun {
  id: string;
  client_id: string;
  run_type: string;
  status: string;
  items_total: number;
  items_processed: number;
  items_succeeded: number;
  items_failed: number;
  credits_used: number;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  started_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
}

export interface Response {
  id: string;
  thread_id: string;
  client_id: string;
  variant: string;
  body_text: string;
  quality_score: number | null;
  tone_match_score: number | null;
  mentions_brand: boolean;
  mentions_url: boolean;
  status: string;
  was_edited: boolean;
  edited_text: string | null;
  approved_by: string | null;
  approved_at: string | null;
  posted_by: string | null;
  posted_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface MonitorPrompt {
  id: string;
  client_id: string;
  prompt_text: string;
  test_models: string[];
  frequency: string;
  is_active: boolean;
  created_at: string;
}

export interface MonitorResult {
  id: string;
  prompt_id: string;
  client_id: string;
  ai_model: string;
  brand_mentioned: boolean;
  brand_linked: boolean;
  mention_context: string | null;
  competitor_mentions: string[] | null;
  sources_cited: string[] | null;
  full_response: string | null;
  sentiment: string | null;
  prominence_score: number | null;
  tested_at: string;
}

export interface CreditTransaction {
  id: string;
  agency_id: string;
  amount: number;
  reason: string;
  reference_type: string | null;
  reference_id: string | null;
  balance_after: number;
  description: string | null;
  created_at: string;
}

export interface Audit {
  id: string;
  client_id: string;
  audit_type: string;
  status: string;
  composite_score: number | null;
  citation_score: number | null;
  ai_presence_score: number | null;
  entity_score: number | null;
  review_score: number | null;
  press_score: number | null;
  executive_summary: string | null;
  action_plan: Record<string, unknown>[];
  competitors_analyzed: string[];
  is_free_audit: boolean;
  started_at: string | null;
  completed_at: string | null;
  credits_used: number;
  created_at: string;
}

export interface AuditPillarResult {
  id: string;
  audit_id: string;
  pillar: string;
  score: number;
  status: string;
  findings: Record<string, unknown>;
  summary: string | null;
  recommendations: Record<string, unknown>[];
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface AgentAction {
  id: string;
  agency_id: string;
  client_id: string | null;
  agent_type: string;
  agent_name: string;
  trigger: string;
  trigger_reference_id: string | null;
  target_type: string | null;
  target_id: string | null;
  status: string;
  items_processed: number;
  items_produced: number;
  credits_consumed: number;
  duration_ms: number | null;
  cost_usd: number | null;
  error_code: string | null;
  error_message: string | null;
  input_summary: Record<string, unknown>;
  output_summary: Record<string, unknown>;
  created_at: string;
}

// ============================================
// PressForge types (migration 0013)
// ============================================

export type ClientType = "business" | "thought_leader";

export interface Spokesperson {
  id: string;
  client_id: string;
  name: string;
  title: string;
  bio: string | null;
  email: string | null;
  phone: string | null;
  voice_samples: Array<{ quote: string; context: string; date: string }>;
  voice_profile: string | null;
  voice_profile_generated_at: string | null;
  photo_url: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PressCalendarEvent {
  id: string;
  agency_id: string;
  month: number;
  name: string;
  event_date: string | null;
  event_type: string;
  regions: string[];
  industries: string[];
  pr_angle_hint: string | null;
  send_by_offset_days: number;
  is_custom: boolean;
  is_active: boolean;
  created_at: string;
}

// Alias used by ported PressForge prompts
export type CalendarEvent = PressCalendarEvent;

export interface PressCampaignIdea {
  id: string;
  client_id: string;
  headline: string;
  angle: string;
  pr_type: string;
  press_release_brief: string | null;
  target_date: string | null;
  relevance_score: number | null;
  seasonal_hook: string | null;
  calendar_event_id: string | null;
  is_approved: boolean;
  is_rejected: boolean;
  promoted_to_campaign_id: string | null;
  generated_at: string;
  created_at: string;
}

export interface PressCampaign {
  id: string;
  client_id: string;
  name: string;
  headline: string | null;
  angle: string | null;
  pr_type: string;
  idea_id: string | null;
  calendar_event_id: string | null;
  target_date: string | null;
  target_region: string;
  target_publications: string[];
  status: string;
  spokesperson_id: string | null;
  journalists_targeted: number;
  pitches_sent: number;
  opens: number;
  replies: number;
  coverage_count: number;
  backlinks_earned: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PressRelease {
  id: string;
  campaign_id: string;
  client_id: string;
  title: string;
  subtitle: string | null;
  body_html: string;
  body_text: string;
  pr_type: string | null;
  target_region: string | null;
  word_count: number | null;
  version: number;
  is_current: boolean;
  quality_checks: Record<string, unknown>;
  public_slug: string | null;
  public_url: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface Journalist {
  id: string;
  agency_id: string;
  name: string;
  email: string | null;
  email_verified: boolean;
  phone: string | null;
  publication: string;
  publication_domain: string | null;
  publication_type: string | null;
  secondary_publications: string[];
  author_page_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  region: string | null;
  sub_regions: string[];
  beats: string[];
  beat_summary: string | null;
  preferred_content_type: string | null;
  typical_article_length: string | null;
  engages_with_types: string[];
  recent_articles: Array<Record<string, unknown>>;
  total_pitched: number;
  total_opened: number;
  total_replied: number;
  total_published: number;
  response_rate: number | null;
  publish_rate: number | null;
  email_bounce_count: number;
  relationship_score: number | null;
  last_pitched_at: string | null;
  cooldown_days: number;
  discovered_via: string | null;
  discovered_for_campaign_id: string | null;
  notes: string | null;
  tags: string[];
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PressCampaignJournalistScore {
  id: string;
  campaign_id: string;
  journalist_id: string;
  total_score: number;
  tier: string;
  score_breakdown: Record<string, unknown>;
  why_selected: string | null;
  personalization_hook: string | null;
  source: string;
  is_selected: boolean;
  created_at: string;
}

export interface PressOutreachEmail {
  id: string;
  campaign_id: string;
  journalist_id: string;
  subject_line: string;
  body: string;
  tier: string;
  instantly_campaign_id: string | null;
  instantly_lead_id: string | null;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  bounced_at: string | null;
  created_at: string;
}

export interface PressCoverage {
  id: string;
  client_id: string;
  campaign_id: string | null;
  journalist_id: string | null;
  title: string;
  url: string;
  publication: string;
  author: string | null;
  publish_date: string | null;
  coverage_type: string;
  has_backlink: boolean;
  backlink_url: string | null;
  is_dofollow: boolean | null;
  estimated_domain_authority: number | null;
  sentiment: string | null;
  discovered_via: string | null;
  verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export interface PressTemplate {
  id: string;
  agency_id: string;
  name: string;
  vertical: string | null;
  pr_type: string;
  template_body: string;
  template_structure: Record<string, unknown>;
  variables: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}
