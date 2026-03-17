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
