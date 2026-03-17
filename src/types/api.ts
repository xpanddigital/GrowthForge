import type { Client, Keyword, Thread, Response, Audit } from "./database";

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
