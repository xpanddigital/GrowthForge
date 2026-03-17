import type {
  Client,
  Keyword,
  Thread,
  Response,
  Audit,
  PressCampaign,
  PressRelease,
  Journalist,
  PressCampaignJournalistScore,
  PressCoverage,
  Spokesperson,
} from "./database";

// API request/response types

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Client API
export interface CreateClientRequest {
  name: string;
  website_url?: string;
  brand_brief: string;
  tone_guidelines?: string;
  target_audience?: string;
  key_differentiators?: string;
  urls_to_mention?: string[];
  response_rules?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  is_active?: boolean;
}

export interface ClientWithKeywordCount extends Client {
  keyword_count: number;
}

// Keyword API
export interface CreateKeywordsRequest {
  client_id: string;
  keywords: Array<{
    keyword: string;
    tags?: string[];
    intent?: string;
    scan_platforms?: string[];
  }>;
}

export interface UpdateKeywordRequest {
  tags?: string[];
  intent?: string;
  volume_score?: number;
  scan_platforms?: string[];
  is_active?: boolean;
}

// Discovery API
export interface TriggerScanRequest {
  client_id: string;
  keyword_ids?: string[];
}

// Response API
export interface GenerateResponsesRequest {
  thread_id: string;
}

export interface UpdateResponseRequest {
  status: string;
  edited_text?: string;
  rejection_reason?: string;
}

// Dashboard stats
export interface DashboardStats {
  threads_this_month: number;
  responses_this_month: number;
  responses_posted: number;
  queued_threads: number;
  total_clients: number;
  total_keywords: number;
}

// Thread with responses
export interface ThreadWithResponses extends Thread {
  responses: Response[];
  keyword?: Keyword;
}

// Audit with pillar results
export interface AuditWithPillars extends Audit {
  pillar_results: Array<{
    pillar: string;
    score: number;
    status: string;
    summary: string | null;
  }>;
}

// ============================================
// PressForge API types
// ============================================

// Campaign API
export interface CreatePressCampaignRequest {
  client_id: string;
  name: string;
  headline?: string;
  angle?: string;
  pr_type?: string;
  idea_id?: string;
  calendar_event_id?: string;
  target_date?: string;
  target_region?: string;
  target_publications?: string[];
  spokesperson_id?: string;
  notes?: string;
}

export interface UpdatePressCampaignRequest {
  name?: string;
  headline?: string;
  angle?: string;
  pr_type?: string;
  target_date?: string;
  target_region?: string;
  target_publications?: string[];
  spokesperson_id?: string;
  status?: string;
  notes?: string;
}

export interface PressCampaignWithRelations extends PressCampaign {
  spokesperson?: Spokesperson | null;
  current_release?: PressRelease | null;
  coverage?: PressCoverage[];
}

// Press Release API
export interface GeneratePressReleaseRequest {
  campaign_id: string;
  length?: "short" | "standard" | "detailed";
}

export interface ApprovePressReleaseRequest {
  release_id: string;
}

// Spokesperson API
export interface CreateSpokespersonRequest {
  client_id: string;
  name: string;
  title: string;
  bio?: string;
  email?: string;
  phone?: string;
  voice_samples?: Array<{ quote: string; context: string; date: string }>;
  photo_url?: string;
  is_primary?: boolean;
}

export type UpdateSpokespersonRequest = Partial<Omit<CreateSpokespersonRequest, "client_id">>;

// Journalist API
export interface CreateJournalistRequest {
  name: string;
  email?: string;
  publication: string;
  publication_domain?: string;
  publication_type?: string;
  region?: string;
  sub_regions?: string[];
  beats?: string[];
  notes?: string;
  tags?: string[];
}

export interface UpdateJournalistRequest extends Partial<CreateJournalistRequest> {
  is_blacklisted?: boolean;
  blacklist_reason?: string;
}

export interface JournalistWithScore extends Journalist {
  campaign_score?: PressCampaignJournalistScore | null;
}

// Ideation API
export interface TriggerIdeationRequest {
  client_id: string;
  month: number;
  year: number;
  count?: number;
}

export interface ApproveIdeaRequest {
  idea_id: string;
}

// Journalist Discovery API
export interface TriggerJournalistDiscoveryRequest {
  campaign_id: string;
  target_count?: number;
}

// Outreach API
export interface TriggerPitchGenerationRequest {
  campaign_id: string;
}

export interface SendOutreachRequest {
  campaign_id: string;
}

// Coverage API
export interface CreateCoverageRequest {
  client_id: string;
  campaign_id?: string;
  journalist_id?: string;
  title: string;
  url: string;
  publication: string;
  author?: string;
  publish_date?: string;
  coverage_type?: string;
  has_backlink?: boolean;
  backlink_url?: string;
  is_dofollow?: boolean;
  estimated_domain_authority?: number;
  sentiment?: string;
}

// Calendar API
export interface CreateCalendarEventRequest {
  month: number;
  name: string;
  event_date?: string;
  event_type: string;
  regions?: string[];
  industries?: string[];
  pr_angle_hint?: string;
  send_by_offset_days?: number;
}

// Press Dashboard Stats
export interface PressDashboardStats {
  active_campaigns: number;
  pitches_sent: number;
  coverage_secured: number;
  backlinks_earned: number;
  journalists_in_database: number;
  ideas_pending_review: number;
}
