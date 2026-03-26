# AI Monitor Module — Complete Specification v2

## Read First

Before building this module, read `CLAUDE.md` in the project root completely. It contains the full Phase 1 spec including database schema (migrations 0001-0008), agent abstraction layer, directory structure, and all architectural patterns. Everything in this document EXTENDS that spec. Never contradict it.

The Citation Engine (Phase 1) is fully built and deployed. All architectural patterns — agent abstraction, action logging via `logAgentAction()`, RLS on every table, Inngest for async work, credit tracking via `src/lib/billing/credits.ts` — are already in place and must be followed exactly.

---

## Module Purpose

The AI Monitor tracks whether client brands get cited by AI models (ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews) when users ask buying-intent questions. This is the ROI proof layer — it shows whether Citation Engine seeding and other MentionLayer modules are actually moving the needle on AI visibility.

**Primary metric: AI Visibility Score** — a composite 0-100 score combining Share of Model, recommendation rate, prominence, model coverage, and trend direction. This is the hero number on client reports and the dashboard.

**Secondary metric: Share of Model (SoM)** — the percentage of monitored prompts where the brand appears in each AI model's response. SoM is the 2026 GEO research consensus metric and feeds into the AI Visibility Score.

### Five AI Models Monitored

1. **ChatGPT** (OpenAI gpt-4o) — largest consumer AI, no native source URLs
2. **Perplexity** (sonar-pro) — returns native source citations, most reliable for URL attribution
3. **Gemini** (gemini-2.0-flash) — Google's model, distinct from AI Overviews
4. **Claude** (claude-sonnet-4) — Anthropic's model (note: we test Claude with Claude, document this bias in UI)
5. **Google AI Overviews** (via SerpApi) — AI-generated summaries in Google Search results. Heavily references Reddit (21%), YouTube (18.8%), and Quora (14.3%) — exactly the platforms the Citation Engine seeds.

### Two Monitoring Modes

**Mode 1: Keyword Tracking (primary, recommended)**
- User adds keywords (reuses existing `keywords` table from Citation Engine)
- System auto-generates 5 prompt variations per keyword using templates + AI
- Prompts rotate across monitoring runs for statistical significance
- Results displayed grouped by KEYWORD, not individual prompt

**Mode 2: Custom Prompts (advanced)**
- User creates specific prompts manually
- Results shown per prompt
- Used for precise tracking of known queries

---

## What Already Exists

Migration 0005 created two tables that are already deployed:

- `monitor_prompts` — prompts to test against AI models (per client), with `prompt_text`, `test_models`, `frequency`, `is_active`
- `monitor_results` — individual test results with `brand_mentioned`, `brand_linked`, `mention_context`, `competitor_mentions`, `sources_cited`, `full_response`, `sentiment`, `prominence_score`

The audit pillar `ai-presence.agent.ts` already runs a one-time scan using these tables. The AI Monitor module makes this **ongoing** with trending, alerts, competitor tracking, and a dedicated dashboard.

---

## Third-Party API Dependency: SerpApi

**Required for:** Google AI Overviews monitoring (Agent 5 of 5)
**Provider:** SerpApi (serpapi.com)
**Endpoints:**
- `https://serpapi.com/search?engine=google` — standard Google Search (returns AIO when present)
- `https://serpapi.com/search?engine=google_ai_overview` — follow-up fetch when `page_token` is returned
**Pricing:** $75/mo (5,000 searches) | $150/mo (15,000) | $300/mo (30,000)
**Why SerpApi:** Returns AI Overview content as structured JSON with text_blocks (paragraphs, headings, lists, tables) plus references (source URLs). Handles the two-step fetch automatically. Google requires JS rendering and anti-bot measures — SerpApi manages this.
**Fallback:** Apify google-search-scraper (already in stack) — check at build time if their actor returns AIO data. If yes, no new vendor needed.

---

## Migration 0009: AI Monitor (Complete)

This migration adds new tables, extends existing ones, and includes all keyword monitoring and correlation tables. It does NOT modify migration 0005 — all changes to existing tables use ALTER TABLE statements.

```sql
-- ============================================
-- MIGRATION 0009: AI MONITOR (COMPLETE)
-- Extends monitor_results, adds prompt templates,
-- snapshots, competitors, alerts, keyword config,
-- correlation timeline, content gaps, and visibility scoring.
-- ============================================

-- -----------------------------------------------
-- 1. EXTEND monitor_results with new columns
-- -----------------------------------------------

ALTER TABLE monitor_results
  ADD COLUMN IF NOT EXISTS response_hash TEXT;

ALTER TABLE monitor_results
  ADD COLUMN IF NOT EXISTS competitor_details JSONB DEFAULT '[]';

ALTER TABLE monitor_results
  ADD COLUMN IF NOT EXISTS brand_source_urls TEXT[] DEFAULT '{}';

ALTER TABLE monitor_results
  ADD COLUMN IF NOT EXISTS brand_recommended BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE monitor_results
  ADD COLUMN IF NOT EXISTS mention_position INTEGER;

-- Link results to keywords (for keyword-mode monitoring)
ALTER TABLE monitor_results
  ADD COLUMN IF NOT EXISTS keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL;

-- Update default test models to include AI Overviews
ALTER TABLE monitor_prompts
  ALTER COLUMN test_models SET DEFAULT '{chatgpt,perplexity,gemini,claude,google_ai_overview}';

-- -----------------------------------------------
-- 2. PROMPT TEMPLATES — reusable per vertical
-- -----------------------------------------------

CREATE TABLE monitor_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  vertical TEXT NOT NULL DEFAULT 'general',
  template_text TEXT NOT NULL,

  prompt_type TEXT NOT NULL DEFAULT 'recommendation' CHECK (
    prompt_type IN (
      'recommendation', 'comparison', 'alternative', 'how_to',
      'review', 'cost', 'vs', 'custom'
    )
  ),

  default_models TEXT[] NOT NULL DEFAULT '{chatgpt,perplexity,gemini,claude,google_ai_overview}',
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 3. MONITOR SNAPSHOTS — weekly/monthly rollups
-- -----------------------------------------------

CREATE TABLE monitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  snapshot_date DATE NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'weekly' CHECK (
    period_type IN ('weekly', 'monthly')
  ),

  -- AI Visibility Score (composite hero metric)
  ai_visibility_score INTEGER CHECK (ai_visibility_score BETWEEN 0 AND 100),

  -- Share of Model
  overall_som NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Per-model SoM breakdown
  model_breakdown JSONB NOT NULL DEFAULT '{}',

  -- Per-keyword SoM breakdown
  keyword_breakdown JSONB DEFAULT '{}',

  -- Competitor SoM
  competitor_som JSONB NOT NULL DEFAULT '{}',

  som_delta NUMERIC(5,2),

  -- Summary stats
  total_tests_run INTEGER NOT NULL DEFAULT 0,
  total_brand_mentions INTEGER NOT NULL DEFAULT 0,
  total_brand_recommendations INTEGER NOT NULL DEFAULT 0,
  total_brand_links INTEGER NOT NULL DEFAULT 0,
  response_changes_detected INTEGER NOT NULL DEFAULT 0,
  avg_prominence NUMERIC(5,2),
  top_competitor_name TEXT,
  top_competitor_som NUMERIC(5,2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, snapshot_date, period_type)
);

-- -----------------------------------------------
-- 4. MONITOR COMPETITORS
-- -----------------------------------------------

CREATE TABLE monitor_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  competitor_name TEXT NOT NULL,
  competitor_url TEXT,
  competitor_aliases TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, competitor_name)
);

-- -----------------------------------------------
-- 5. MONITOR ALERTS
-- -----------------------------------------------

CREATE TABLE monitor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  alert_type TEXT NOT NULL CHECK (
    alert_type IN (
      'som_drop', 'som_rise', 'competitor_spike',
      'new_model_appearance', 'brand_lost', 'response_changed'
    )
  ),
  threshold NUMERIC(5,2),
  notify_user_ids UUID[] DEFAULT '{}',
  notify_email BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE monitor_alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES monitor_alerts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  trigger_data JSONB NOT NULL DEFAULT '{}',
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 6. KEYWORD MONITORING CONFIG
-- -----------------------------------------------

CREATE TABLE monitor_keyword_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,

  is_monitored BOOLEAN NOT NULL DEFAULT true,
  test_models TEXT[] NOT NULL DEFAULT '{chatgpt,perplexity,gemini,claude,google_ai_overview}',
  frequency TEXT NOT NULL DEFAULT 'weekly',

  -- Location context
  location_country TEXT DEFAULT 'us',
  location_string TEXT,

  -- Persona frames (optional, Phase 2 enhancement)
  persona_frames TEXT[] DEFAULT '{}',

  -- Prompt variations
  prompt_variation_count INTEGER NOT NULL DEFAULT 5,
  generated_prompts JSONB DEFAULT '[]',
  prompts_last_generated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, keyword_id)
);

-- -----------------------------------------------
-- 7. CROSS-MODULE CORRELATION TIMELINE
-- -----------------------------------------------

CREATE TABLE monitor_activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  week_start DATE NOT NULL,

  -- Citation Engine activity
  threads_discovered INTEGER NOT NULL DEFAULT 0,
  responses_generated INTEGER NOT NULL DEFAULT 0,
  responses_posted INTEGER NOT NULL DEFAULT 0,
  platforms_seeded JSONB DEFAULT '{}',

  -- Entity Sync activity
  entity_tasks_completed INTEGER NOT NULL DEFAULT 0,
  entity_score_change NUMERIC(5,2),
  schema_improvements INTEGER NOT NULL DEFAULT 0,

  -- Press activity (when PressForge built)
  press_releases_distributed INTEGER NOT NULL DEFAULT 0,
  coverage_secured INTEGER NOT NULL DEFAULT 0,

  -- Monitor results
  overall_som NUMERIC(5,2),
  som_delta NUMERIC(5,2),
  ai_visibility_score INTEGER,
  aio_som NUMERIC(5,2),
  aio_som_delta NUMERIC(5,2),

  -- Correlation flags
  correlation_notes JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, week_start)
);

-- -----------------------------------------------
-- 8. CONTENT GAP RECOMMENDATIONS
-- -----------------------------------------------

CREATE TABLE monitor_content_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES monitor_snapshots(id) ON DELETE SET NULL,

  topic TEXT NOT NULL,
  competitor_advantage TEXT NOT NULL,
  recommended_content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  publish_target TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  detail TEXT,

  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'in_progress', 'completed', 'dismissed')
  ),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 9. INDEXES
-- -----------------------------------------------

CREATE INDEX idx_monitor_templates_agency ON monitor_prompt_templates(agency_id, is_active);
CREATE INDEX idx_monitor_templates_vertical ON monitor_prompt_templates(vertical);
CREATE INDEX idx_monitor_snapshots_client ON monitor_snapshots(client_id, snapshot_date DESC);
CREATE INDEX idx_monitor_snapshots_period ON monitor_snapshots(client_id, period_type, snapshot_date DESC);
CREATE INDEX idx_monitor_competitors_client ON monitor_competitors(client_id, is_active);
CREATE INDEX idx_monitor_alerts_client ON monitor_alerts(client_id, is_active);
CREATE INDEX idx_monitor_alert_events_alert ON monitor_alert_events(alert_id, created_at DESC);
CREATE INDEX idx_monitor_alert_events_unack ON monitor_alert_events(client_id, acknowledged)
  WHERE acknowledged = false;
CREATE INDEX idx_monitor_results_hash ON monitor_results(response_hash);
CREATE INDEX idx_monitor_results_brand ON monitor_results(client_id, brand_mentioned, tested_at DESC);
CREATE INDEX idx_monitor_results_keyword ON monitor_results(keyword_id, tested_at DESC);
CREATE INDEX idx_monitor_keyword_config_client ON monitor_keyword_config(client_id, is_monitored);
CREATE INDEX idx_timeline_client ON monitor_activity_timeline(client_id, week_start DESC);
CREATE INDEX idx_content_gaps_client ON monitor_content_gaps(client_id, status);

-- -----------------------------------------------
-- 10. RLS POLICIES
-- -----------------------------------------------

ALTER TABLE monitor_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_keyword_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_activity_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_content_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monitor_templates_agency_isolation" ON monitor_prompt_templates FOR ALL USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "monitor_snapshots_agency_isolation" ON monitor_snapshots FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "monitor_competitors_agency_isolation" ON monitor_competitors FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "monitor_alerts_agency_isolation" ON monitor_alerts FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "monitor_alert_events_agency_isolation" ON monitor_alert_events FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "monitor_keyword_config_agency_isolation" ON monitor_keyword_config FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "timeline_agency_isolation" ON monitor_activity_timeline FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "content_gaps_agency_isolation" ON monitor_content_gaps FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

---

## AI Visibility Score (Composite Hero Metric)

The AI Visibility Score is the single number on the client report cover page, the dashboard hero card, and the client portal main metric. It combines multiple signals into one 0-100 score.

```typescript
// src/lib/monitor/visibility-score.ts

export function calculateAIVisibilityScore(snapshot: {
  overall_som: number;
  total_brand_mentions: number;
  total_brand_recommendations: number;
  avg_prominence: number | null;
  model_breakdown: Record<string, { mentioned: number; total: number }>;
  som_delta: number | null;
}): number {
  const somWeight = 0.40;
  const recommendWeight = 0.25;
  const prominenceWeight = 0.15;
  const coverageWeight = 0.10;
  const trendWeight = 0.10;

  // SoM component (0-100)
  const somScore = snapshot.overall_som;

  // Recommendation component: of mentions, what % were recommendations?
  const recommendScore = snapshot.total_brand_mentions > 0
    ? (snapshot.total_brand_recommendations / snapshot.total_brand_mentions) * 100
    : 0;

  // Prominence component
  const prominenceScore = snapshot.avg_prominence || 0;

  // Coverage: mentioned in how many of the 5 models?
  const modelsMentionedIn = Object.values(snapshot.model_breakdown)
    .filter((m: any) => m.mentioned > 0).length;
  const coverageScore = (modelsMentionedIn / 5) * 100;

  // Trend component: positive delta = bonus, negative = penalty
  const trendScore = snapshot.som_delta
    ? Math.min(100, Math.max(0, 50 + snapshot.som_delta * 2))
    : 50;

  return Math.round(
    somScore * somWeight +
    recommendScore * recommendWeight +
    prominenceScore * prominenceWeight +
    coverageScore * coverageWeight +
    trendScore * trendWeight
  );
}
```

---

## Agent Implementations

### Registry Extension

```typescript
// Add to src/lib/agents/registry.ts

import { ChatGPTTestAgent } from './monitor/chatgpt-test.agent';
import { PerplexityTestAgent } from './monitor/perplexity-test.agent';
import { GeminiTestAgent } from './monitor/gemini-test.agent';
import { ClaudeTestAgent } from './monitor/claude-test.agent';
import { AIOTestAgent } from './monitor/aio-test.agent';
import { MonitorAnalyzerAgent } from './monitor/response-analyzer.agent';

export const agents = {
  // ... existing Phase 1 agents (do not modify) ...

  monitor: {
    chatgpt: new ChatGPTTestAgent(),
    perplexity: new PerplexityTestAgent(),
    gemini: new GeminiTestAgent(),
    claude: new ClaudeTestAgent(),
    google_ai_overview: new AIOTestAgent(),
    analyzer: new MonitorAnalyzerAgent(),
  },
} as const;
```

### Agent Interface

Add to `src/lib/agents/interfaces.ts`:

```typescript
// --- Monitor Agent Interfaces ---

export interface MonitorTestInput {
  promptText: string;
  clientName: string;
  clientAliases?: string[];
  clientUrls: string[];
  competitors: Array<{
    name: string;
    aliases: string[];
    url?: string;
  }>;
  // Location context for geo-targeted testing
  location?: {
    countryCode: string;
    locationString?: string;
  };
}

export interface MonitorTestResult {
  aiModel: 'chatgpt' | 'perplexity' | 'gemini' | 'claude' | 'google_ai_overview';
  fullResponse: string;
  responseHash: string;
  brandMentioned: boolean;
  brandRecommended: boolean;
  brandLinked: boolean;
  brandSourceUrls: string[];
  mentionContext: string | null;
  mentionPosition: number | null;
  prominenceScore: number;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  sourcesCited: string[];
  competitorDetails: Array<{
    name: string;
    mentioned: boolean;
    recommended: boolean;
    sentiment: 'positive' | 'neutral' | 'negative' | null;
    context: string | null;
  }>;
  metadata?: Record<string, unknown>;
}

export interface MonitorTestAgent {
  name: string;
  model: string;
  test(input: MonitorTestInput): Promise<MonitorTestResult>;
}

export interface MonitorAnalyzerInput {
  response: string;
  clientName: string;
  clientAliases: string[];
  clientUrls: string[];
  competitors: Array<{ name: string; aliases: string[] }>;
}

export interface MonitorAnalyzerOutput {
  brandMentioned: boolean;
  brandRecommended: boolean;
  brandLinked: boolean;
  brandSourceUrls: string[];
  mentionContext: string | null;
  mentionPosition: number | null;
  prominenceScore: number;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  competitorDetails: Array<{
    name: string;
    mentioned: boolean;
    recommended: boolean;
    sentiment: 'positive' | 'neutral' | 'negative' | null;
    context: string | null;
  }>;
}
```

### Agent 1: ChatGPT Test Agent

**File:** `src/lib/agents/monitor/chatgpt-test.agent.ts`

Uses OpenAI API (gpt-4o). No native source URLs — relies on MonitorAnalyzerAgent for inline URL detection.

- System prompt: neutral ("You are a helpful assistant. Answer thoroughly and cite sources where possible.")
- Temperature: 0.3 (low for consistency, not 0 to avoid cached responses)
- Max tokens: 2000
- After receiving response, pass to MonitorAnalyzerAgent for parsing
- Response hash: SHA256 of normalized text (collapse whitespace, trim, lowercase)
- Rate limiting: Max 20 requests/minute. Use withRetry() from src/lib/utils/retry.ts
- For geo-targeted queries: append " (I'm based in {location})" to prompt text

### Agent 2: Perplexity Test Agent

**File:** `src/lib/agents/monitor/perplexity-test.agent.ts`

Uses Perplexity API (sonar-pro). KEY ADVANTAGE: Returns native source citations in the `citations` field of the API response, making source detection far more reliable than other models.

- Endpoint: `https://api.perplexity.ai/chat/completions`
- Temperature: 0.3, max_tokens: 2000
- Extract `data.citations` array (Perplexity-specific) for native source URLs
- Merge native citations with inline URL extraction
- Check if any citations point to client's domain
- If a Citation Engine thread URL appears in Perplexity's citations, that's direct proof that seeding worked
- Rate limiting: 20 requests/minute
- Geo: append location to prompt text

### Agent 3: Gemini Test Agent

**File:** `src/lib/agents/monitor/gemini-test.agent.ts`

Uses Google Gemini API (gemini-2.0-flash).

- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- Gemini does NOT natively return source citations in the standard API
- Rely on inline URL extraction + MonitorAnalyzerAgent
- Temperature: 0.3, maxOutputTokens: 2000
- Rate limiting: 15 requests/minute (free tier), 360/min (paid)
- Geo: append location to prompt text

### Agent 4: Claude Test Agent

**File:** `src/lib/agents/monitor/claude-test.agent.ts`

Uses Anthropic API (claude-sonnet-4-20250514) — NOT Opus, this is a test not a generation task.

- IMPORTANT: We're using Claude to test Claude. Document this bias in UI: "Claude monitoring results may differ from end-user experiences. Cross-reference with other models."
- Use existing Anthropic SDK wrapper at src/lib/ai/claude.ts
- System prompt: neutral, same as ChatGPT agent
- Temperature: 0.3, max_tokens: 2000
- Claude does NOT return source URLs natively
- Geo: append location to prompt text

### Agent 5: Google AI Overviews Test Agent

**File:** `src/lib/agents/monitor/aio-test.agent.ts`

Unlike the other 4 agents, this one doesn't send a prompt to an AI model. Instead, it searches Google for the prompt text and checks whether an AI Overview appears, what it says, and what sources it cites.

```typescript
// Process:
// 1. Send query to SerpApi Google Search endpoint
//    Include gl (country) and location params for geo-targeting
// 2. Check if response contains ai_overview object
// 3. If ai_overview.page_token exists, make immediate follow-up request
//    (token expires within 1 minute)
// 4. Extract text from ai_overview.text_blocks (paragraphs, headings, lists, tables)
// 5. Extract reference URLs from ai_overview.references
// 6. Pass text to MonitorAnalyzerAgent for brand/competitor analysis
// 7. Check if any AIO references are Reddit/Quora/FB threads (Citation Engine intel)
//
// SerpApi params:
//   engine: 'google'
//   q: {prompt text}
//   api_key: process.env.SERPAPI_API_KEY
//   gl: {location.countryCode || 'us'}
//   hl: 'en'
//   location: {location.locationString} (optional, for city-level targeting)
//
// If no AI Overview appears for the query, return a valid result with
// brandMentioned=false and metadata.aio_present=false
//
// Text extraction from blocks:
//   paragraph → block.snippet
//   heading → ## block.snippet
//   list → - item.snippet for each item
//   table → row values joined with |
//
// This agent directly connects Citation Engine seeding to Google visibility.
// When AIO references include a Reddit thread we've seeded, that's proof.
//
// Rate limiting: 1-second delay between requests
// Credit cost: 3 credits (same as other models)
```

### Agent 6: Response Analyzer Agent

**File:** `src/lib/agents/monitor/response-analyzer.agent.ts`

The brain that parses ANY AI model's response for brand/competitor mentions, sentiment, and prominence. Uses Claude Sonnet for classification.

```typescript
// Why not regex? Because brand mentions can be:
// - Exact: "RUN Music"
// - Partial: "RUN"
// - Possessive: "RUN's catalog financing"
// - Contextual: "a company called Run that does music licensing"
// - Misspelled: "Run music" (lowercase)
// - URL-only: "runmusic.com" without naming the brand
// Claude handles all of these naturally.
//
// System prompt: "You are a precise text analyzer. Analyze the given AI
//   model response for brand and competitor mentions. Return ONLY valid JSON."
//
// Model: claude-sonnet-4-20250514 (classification task, Sonnet is appropriate)
// Temperature: 0 (deterministic analysis)
//
// Scoring rules:
// - prominence_score: 100 = brand is #1 recommendation, 75 = top 3,
//   50 = mentioned among several, 25 = mentioned in passing, 0 = not mentioned
// - brand_recommended: true ONLY if response actively suggests the brand
// - mention_position: 1 = first option mentioned, 2 = second, etc.
// - mention_context: 1-2 sentences where brand appears
```

---

## Keyword Monitoring System

### Prompt Fan-Out Generator

```typescript
// src/lib/monitor/prompt-generator.ts
//
// Generates prompt variations from a keyword + client context.
// Uses Claude Sonnet with temperature 0.7 (higher for variation).
//
// For each keyword, generates variations across:
// 1. Question type: recommendation, comparison, how-to, cost, review
// 2. Phrasing style: formal, casual, specific, broad
// 3. Location inclusion: with/without location qualifier (~60%/40%)
// 4. Competitor references: 1 prompt per keyword mentioning a known competitor
//
// Key insight: LLMs are non-deterministic. Asking the same question weekly
// gives ONE data point. Asking 5 semantically equivalent questions gives 5
// data points — a much more statistically meaningful SoM.
//
// Requirements for generated prompts:
// - Each semantically equivalent but differently phrased
// - Sound like REAL human queries, not SEO templates
// - No two start with the same word
// - Mix of formality levels
//
// Credit cost: 5 credits per generation batch (one Claude call)
```

### Prompt Rotation Strategy

Each weekly monitoring run selects a SUBSET of generated prompts (3 out of 5), prioritizing least-recently-used. Over 4 weeks, all variations get tested. This ensures statistical diversity without over-spending.

```typescript
// src/lib/monitor/prompt-rotation.ts

export function selectPromptsForRun(
  allPrompts: Array<{ text: string; type: string; last_used_at: string | null }>,
  selectCount: number = 3
): Array<{ text: string; type: string }> {
  // Sort by least recently used first (never used = highest priority)
  const sorted = [...allPrompts].sort((a, b) => {
    if (!a.last_used_at) return -1;
    if (!b.last_used_at) return 1;
    return new Date(a.last_used_at).getTime() - new Date(b.last_used_at).getTime();
  });
  return sorted.slice(0, selectCount);
}
```

### Onboarding Flow

When a new client is set up with keywords in the Citation Engine, the Monitor should offer a one-click "Enable AI Monitoring" that:
1. Takes the client's top 10-20 keywords
2. Creates `monitor_keyword_config` entries for each
3. Auto-generates 5 prompt variations per keyword
4. Starts the first monitoring run immediately

A new client goes from zero to full AI Visibility Score baseline in under 10 minutes.

### Location Wrapping

For geo-targeted queries, location is handled differently per model:

```typescript
// src/lib/monitor/location-wrapper.ts

export function wrapPromptWithLocation(
  promptText: string,
  location: { countryCode: string; locationString?: string } | undefined,
  model: string
): string {
  if (!location?.locationString) return promptText;

  // For Google AIO, location is handled via SerpApi API params, not prompt text
  if (model === 'google_ai_overview') return promptText;

  // For LLM models, append location naturally
  if (promptText.toLowerCase().includes(location.locationString.toLowerCase())) {
    return promptText; // Already contains location
  }

  return `${promptText} (I'm based in ${location.locationString})`;
}
```

---

## Inngest Job Definitions

### Job: monitor.run-weekly

```typescript
// Trigger: Cron (Sunday 4am UTC) OR manual
// Steps:
//   1. Get all clients with active monitoring (keyword configs or custom prompts)
//   2. For each client:
//      a. Load keyword configs → select rotated prompts for this run
//      b. Load custom prompts (if any)
//      c. For each prompt × model combination:
//         - Wrap prompt with location if needed
//         - logAgentAction() → call MonitorTestAgent → insert monitor_result
//         - Deduct 3 credits per test
//      d. After all tests: generate weekly snapshot with SoM + AI Visibility Score
//      e. Compare to previous snapshot → evaluate alerts
//      f. Run correlation analysis (overlay Citation Engine + Entity activity)
//      g. Run content gap analysis (monthly, or if flag set)
//      h. Check for Citation Engine intelligence (competitor-cited forum threads)
//
// Parallelism: Different models can run in parallel (Inngest steps)
//              Same model sequential (rate limiting)
//
// Credit budget: 3 credits per test
// Example: 10 keywords × 3 prompts/run × 5 models = 150 tests = 450 credits
```

### Job: monitor.run-manual

Same logic as weekly but triggered by `event: 'monitor/run'` with `{ clientId }`.

---

## Cross-Module Correlation Engine

After each weekly snapshot, the correlation analyzer overlays activity from all modules against SoM movement:

```typescript
// src/lib/monitor/correlation-analyzer.ts
//
// Pattern 1: SoM rise after Citation Engine seeding
//   Look 2-3 weeks back. If responses_posted >= 5, and current SoM rose,
//   flag correlation with confidence based on delta magnitude.
//
// Pattern 2: AI Overview references match seeded threads
//   If any AIO source URLs are threads where we posted responses,
//   flag as HIGH confidence direct proof.
//
// Pattern 3: Entity fix → SoM improvement
//   If entity_tasks_completed >= 3 in a prior week and SoM rose,
//   flag with LOW confidence (hard to isolate cause).
//
// Output: correlation_notes JSONB array on monitor_activity_timeline
//
// This is the ROI proof agencies screenshot for case studies.
```

The correlation timeline populates from:
- `threads` and `responses` tables (Citation Engine activity)
- `entity_tasks` table (Entity Sync activity)
- `monitor_snapshots` (SoM data)

### Dashboard: Correlation Timeline

Horizontal timeline chart on the Monitor overview page:
- **Top bar:** Citation Engine activity (responses posted per week, colored by platform)
- **Middle bar:** Entity Sync + Press activity
- **Bottom line:** AI Visibility Score trend overlaid
- **Connectors:** Dotted lines between activity spikes and SoM movements when correlation is detected

---

## Content Gap Recommendations

After each monitoring run (monthly cadence), analyze responses where competitors are cited but the client isn't. Extract what content is being referenced and suggest what the client should create.

```typescript
// src/lib/monitor/content-gaps.ts
//
// Uses Claude Sonnet to analyze competitive citation patterns:
// - What type of content is the competitor cited for?
// - Why is the AI model choosing the competitor?
// - What specific content should the client create?
// - Where should it be published? (website, Reddit, Quora, LinkedIn)
//
// Output: monitor_content_gaps records with topic, recommended_content,
//   content_type (blog_post, comparison_page, faq, case_study, forum_post,
//   data_study), publish_target, impact level
//
// Dashboard: "Content Gaps" tab showing recommendations with impact tags
//   and action buttons ("Create Brief" → links to content workflow)
```

---

## Citation Engine Integration

When the Monitor detects competitors cited from specific Reddit/Quora/Facebook threads, auto-create thread records for the Citation Engine.

```typescript
// src/lib/monitor/citation-intel.ts
//
// For each test result where:
//   - Brand is NOT mentioned
//   - A competitor IS mentioned
//   - Sources cited include forum thread URLs
//
// Check if thread already exists in threads table.
// If not: create with discovered_via='monitor_intel', status='new'
// If exists and status='skipped': re-queue (it's now confirmed as AI-cited)
//
// Forum URL detection: reddit.com/r/{sub}/comments, quora.com/{slug}, facebook.com/groups/
```

---

## API Routes

### POST /api/monitor/run
Trigger manual monitoring scan. Body: `{ clientId, keywordIds?: string[], promptIds?: string[] }`. Credit pre-check before queueing.

### GET /api/monitor/snapshots
Snapshot history for trending. Query: `clientId, periodType, limit`. Returns snapshots with AI Visibility Score + SoM.

### GET /api/monitor/results
Individual test results. Query: `clientId, keywordId?, promptId?, model?, brandMentioned?, limit, offset`.

### POST /api/monitor/keywords/enable
Enable keyword monitoring for a client. Body: `{ clientId, keywordIds }`. Creates keyword configs + generates prompt variations.

### POST /api/monitor/prompts/generate
AI-powered prompt generation from keywords. Body: `{ clientId, keywordId }`. Returns generated variations for review.

### POST /api/monitor/prompts
CRUD for custom prompts. Body: `{ clientId, promptText, testModels, frequency }`.

### POST /api/monitor/competitors
CRUD for competitor tracking. Body: `{ clientId, competitorName, competitorUrl?, aliases? }`.

### GET /api/monitor/alerts
Get alert events. Query: `clientId, acknowledged?, limit`.

### POST /api/monitor/alerts/:alertEventId/acknowledge
Mark alert as acknowledged.

### GET /api/monitor/timeline
Get correlation timeline data. Query: `clientId, weeks (default 12)`.

### GET /api/monitor/content-gaps
Get content gap recommendations. Query: `clientId, status?, limit`.

---

## Cron Configuration

```json
{
  "crons": [
    { "path": "/api/cron/discovery", "schedule": "0 6 * * 2,5" },
    { "path": "/api/cron/monitor", "schedule": "0 4 * * 0" }
  ]
}
```

---

## Refresh Frequency Guide

| Data Type | Frequency | Rationale |
|-----------|-----------|-----------|
| All 5 model responses | Weekly | Captures changes without over-spending |
| Prompt variation regeneration | Monthly | Keep monitoring fresh with new phrasings |
| Content gap analysis | Monthly | Analyze accumulated monthly data for patterns |
| Correlation analysis | Weekly | Overlay each week's activity against SoM |
| Snapshot rollup | Weekly + Monthly | Weekly for trending, monthly for reports |

---

## Dashboard UI Specification

### Directory Structure

```
src/app/(dashboard)/monitor/
├── page.tsx                    # AI Visibility Score overview dashboard
├── keywords/
│   ├── page.tsx                # Keyword-based monitoring (primary view)
│   └── [keywordId]/page.tsx    # Per-keyword result history
├── prompts/
│   ├── page.tsx                # Custom prompt management + template library
│   └── [promptId]/page.tsx     # Per-prompt result history
├── results/
│   └── page.tsx                # Full results explorer
├── competitors/
│   └── page.tsx                # Competitor SoM comparison
├── timeline/
│   └── page.tsx                # Cross-module correlation timeline
├── gaps/
│   └── page.tsx                # Content gap recommendations
└── alerts/
    └── page.tsx                # Alert configuration + history

src/components/monitor/
├── visibility-score-card.tsx   # Large AI Visibility Score (hero metric)
├── som-score-card.tsx          # SoM breakdown below hero
├── som-trend-chart.tsx         # Line chart of score over 12 weeks
├── model-breakdown.tsx         # Bar chart comparing SoM per model (5 models)
├── keyword-table.tsx           # Keyword list with per-keyword SoM
├── competitor-comparison.tsx   # Side-by-side SoM bars
├── prompt-table.tsx            # Prompt list with last result preview
├── result-detail.tsx           # Full AI response viewer with highlights
├── template-picker.tsx         # Template library modal
├── alert-config-form.tsx       # Alert rule editor
├── alert-event-card.tsx        # Individual alert notification card
├── response-diff.tsx           # Side-by-side old vs new when hash changes
├── correlation-timeline.tsx    # Activity overlay chart (Citation Engine + SoM)
├── content-gap-card.tsx        # Individual gap recommendation
└── keyword-onboarding.tsx      # One-click "Enable Monitoring" flow
```

### Page 1: Monitor Overview

```
┌──────────────────────────────────────────────────────────────┐
│  AI Monitor — {Client Name}                                   │
│                                                                │
│  ┌─────────────────────────┐  ┌───────────────────────────┐  │
│  │  AI Visibility Score     │  │  12-Week Trend             │  │
│  │       ╭──────╮           │  │  ──────────╱──              │  │
│  │       │  42  │           │  │  Score + SoM overlaid       │  │
│  │       │ /100 │           │  │                             │  │
│  │       ╰──────╯           │  │  W1 W2 W3 ... W12          │  │
│  │    ▲ +7 vs last week     │  │                             │  │
│  │    SoM: 23% (▲ +5%)     │  │                             │  │
│  └─────────────────────────┘  └───────────────────────────┘  │
│                                                                │
│  Model-by-Model SoM                                            │
│  ┌────────┬────────┬────────┬────────┬────────┐               │
│  │ChatGPT │Perplxty│ Gemini │ Claude │ AI Ovw │               │
│  │ 30%    │ 40%    │ 15%    │ 10%    │ 25%    │               │
│  └────────┴────────┴────────┴────────┴────────┘               │
│                                                                │
│  Competitor Comparison                                         │
│  ┌─────────────────────────────────────────────┐              │
│  │ You:        ███████░░░░░░░░░  23%            │              │
│  │ DistroKid:  ████████████████░  72%           │              │
│  │ TuneCore:   ███████████░░░░░  55%            │              │
│  └─────────────────────────────────────────────┘              │
│                                                                │
│  Correlation Timeline (Citation Activity vs SoM)               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ▓▓▓▓ ▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓ ▓▓▓▓▓  ← responses posted        │ │
│  │ ──────────╱──╱─────────────── ← AI Visibility Score      │ │
│  │ W1  W2  W3  W4  W5  W6  W7  W8                           │ │
│  │ 💡 "SoM rose 13% — 15 Reddit posts were made 2 wks ago" │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Keywords Being Monitored (10)          [+ Add Keywords]       │
│  ┌──────────────────────────────────────────────┐             │
│  │ Keyword          │ SoM  │ Tests │ Best Model │             │
│  │ music licensing   │ 35%  │ 60    │ Perplexity │             │
│  │ catalog financing │ 20%  │ 60    │ ChatGPT    │             │
│  │ ...                                           │             │
│  └──────────────────────────────────────────────┘             │
│                                                                │
│  [🔄 Run Scan Now]  [⚙️ Configure]  [📊 Content Gaps (3)]    │
└──────────────────────────────────────────────────────────────┘
```

---

## System Prompt Templates

Pre-seed during migration/seed:

**General:** "What are the best {keyword} services?", "Can you recommend a {keyword} provider?", "Compare the top {keyword} companies", "{keyword} alternatives to [competitor]", "How do I find a good {keyword} provider?", "What should I look for in a {keyword} service?", "Is {keyword} worth paying for?", "Best {keyword} for small businesses", "Most affordable {keyword} options", "{keyword} reviews and recommendations", "Who is the market leader in {keyword}?", "Pros and cons of different {keyword} solutions"

**Music:** "What are the best music licensing services for independent artists?", "How can I get my music into TV shows and movies?", "Best music distribution platforms compared", "How does catalog financing work for musicians?", "Alternatives to {competitor} for music distribution", "How to monetize my music catalog", "Best sync licensing companies for indie artists", "Should I sell my music catalog or keep it?"

**Legal:** "Best {practice_area} lawyer in {location}", "How to find a good {practice_area} attorney", "Top {practice_area} law firms in {location}", "{practice_area} lawyer reviews {location}", "What should I look for in a {practice_area} lawyer?", "How much does a {practice_area} attorney cost in {location}?"

**Home Services:** "Best {service_type} companies in {location}", "How to find a reliable {service_type} contractor", "Top rated {service_type} near {location}", "{service_type} cost estimates {location}", "What to look for when hiring a {service_type}"

---

## Credit Costs Summary

| Action | Credits | Notes |
|--------|---------|-------|
| AI model test (per model per prompt) | 3 | 5 models × 3 = 15 per prompt across all models |
| Prompt variation generation (per keyword batch) | 5 | Claude Sonnet generates 5 variations |
| Content gap analysis (monthly) | 5 | Claude Sonnet competitive analysis |
| Response analysis (per test) | 0 | Included in 3-credit test cost |
| Snapshot / correlation / alerts | 0 | Database calculations only |

**Monthly cost per client (keyword mode):**
- 10 keywords × 3 prompts/run × 5 models × 4 weeks = 600 tests × 3 credits = 1,800
- Prompt regeneration: 10 keywords × 5 credits = 50
- Content gap analysis: 5
- **Total: ~1,855 credits/month per client**

Fits Growth plan (2,000 credits/$149). 5+ clients need Agency plan (10,000 credits/$349).

---

## Environment Variables

```bash
# New for AI Monitor
SERPAPI_API_KEY=...             # Google AI Overviews (SerpApi)
GOOGLE_GEMINI_API_KEY=AIza...  # Gemini model testing

# Existing (from Phase 1)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
```

---

## Testing Strategy

### Unit Tests
- Visibility score calculation with edge cases
- SoM calculation (0 tests, all mentions, no mentions)
- Prompt rotation (least-recently-used selection)
- Citation intel forum URL detection
- Response hash normalization
- Location wrapper (all model types)
- Correlation pattern detection

### Integration Tests
- Full monitoring pipeline with mocked AI responses (all 5 models)
- Keyword config → prompt generation → rotation → test execution
- Snapshot generation with AI Visibility Score
- Alert triggering and notification
- Citation Engine thread creation from monitor intel
- Correlation timeline population
- Content gap analysis

### E2E Tests
- Keyword onboarding: add keywords → enable monitoring → prompts generated
- Monitor dashboard loads with Visibility Score + SoM + correlation timeline
- Response diff viewer shows changes when hash differs
- Alert configuration → trigger → notification appears
- Content gaps tab with recommendations

---

## Build Sequence

1. **Migration 0009** — all tables in one migration (11 tables/alterations)
2. **Agent interfaces** — MonitorTestAgent, MonitorAnalyzerOutput, MonitorTestInput (with location)
3. **Response Analyzer agent** — all other agents depend on it
4. **LLM test agents** — ChatGPT, Perplexity, Gemini, Claude
5. **AIO test agent** — Google AI Overviews via SerpApi
6. **Registry extension** — add monitor namespace with all 6 agents
7. **Location wrapper** — prompt geo-targeting utility
8. **Prompt fan-out generator** — keyword → prompt variations
9. **Prompt rotation** — least-recently-used selection
10. **AI Visibility Score calculator** — composite metric
11. **Core monitoring function** — run-monitoring.ts with snapshot + visibility score
12. **Citation Engine integration** — monitor intel → thread creation
13. **Correlation analyzer** — cross-module activity timeline
14. **Content gap analyzer** — competitive citation pattern analysis
15. **Inngest jobs** — monitor.run-weekly and monitor.run-manual
16. **API routes** — /api/monitor/* and /api/cron/monitor
17. **Dashboard UI** — Overview (Visibility Score + correlation timeline), then keywords, then prompts, results, gaps, alerts
18. **Keyword onboarding flow** — one-click "Enable Monitoring" wizard
19. **Template seeding** — pre-populate prompt templates per vertical
20. **Test with live data** — RUN Music keywords + Foyle Legal (geo-targeted to Perth)

---

## Claude Code Prompt

```
Read CLAUDE.md in the project root completely before responding.
Read docs/MODULE_AI_MONITOR.md completely before responding.

You are building the AI Monitor module for MentionLayer.
The Citation Engine (Phase 1) is already built and deployed.
All architectural patterns (agent abstraction, action logging,
RLS, Inngest jobs, credit tracking) are already in place.

This module monitors 5 AI models: ChatGPT, Perplexity, Gemini,
Claude, and Google AI Overviews (via SerpApi). It supports two
monitoring modes: keyword-based (with auto-generated prompt
fan-out) and custom prompts.

Follow the 20-step build sequence in the spec. Enter Plan Mode
first and propose your plan before writing any code.

Do not modify any existing Citation Engine code.
Register new agents in the existing registry.
Use the existing credit deduction helpers.
Follow the existing UI patterns (shadcn/ui, dark mode first).
Use @react-pdf/renderer for any PDF generation (not Puppeteer).
```

---

## Notes

- Google AI Overviews is the bridge between Citation Engine seeding and Google Search visibility — prioritize this agent
- Perplexity is the most valuable model for source attribution due to native citations
- The AI Visibility Score is what goes on the report cover page — make the dashboard card visually compelling
- The correlation timeline is what agencies screenshot for case studies — invest in this visualization
- Keyword-mode monitoring is the default onboarding path — custom prompts are for power users
- Response hash comparison is the key drift detection mechanism — when a hash changes, correlate with Citation Engine posting dates
- Temperature 0.3 on all models balances consistency with natural variation
- Alert emails should include direct links to the triggering result
- The only new vendor is SerpApi ($75/mo for 5,000 searches) — everything else uses existing APIs
