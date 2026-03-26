# PressForge Module — Complete Specification

## Read First

Before building this module, read `CLAUDE.md` in the project root completely. Also read docs for AI Monitor, Entity Sync, and Review Engine modules — they establish patterns this module follows.

The Citation Engine, AI Monitor, Entity Sync, and Review Engine should be built before this module. Follow established patterns: agent namespaces in registry, `logAgentAction`/`logAgentActionBg`, typed Inngest events, `callSonnet`/`callOpus`/`parseClaudeJson`, `withRetry`, admin Supabase client, RLS on every table.

**Migration number: 0013** (after Citation Engine 0001-0009, AI Monitor 0010, Entity Sync 0011, Review Engine 0012).

---

## Integration Context: Existing PressForge Codebase

PressForge exists as a separate Next.js 15 + Supabase + Vercel application. **Only press release generation is built and working.** The journalist database, campaign management, outreach, and link monitoring are specced but not implemented.

**What to preserve from the existing codebase:**
- Press release generation prompts (voice modeling, quality checks, generation prompt)
- Press release versioning pattern (append-only, `is_current` flag)
- Campaign ideation prompts (seasonal hooks, calendar-driven)
- Spokesperson voice modeling prompt
- Journalist scoring batch prompt (8 per Claude call)
- Pitch email generation prompt (tiered: Tier 1/2/3)
- The entire campaign calendar seed data (calendar-data.json)

**What to rebuild in MentionLayer patterns:**
- Database schema (add `agency_id`/`client_id`, RLS, MentionLayer conventions)
- API routes → Inngest jobs (replace `maxDuration: 300` / `async_jobs` polling)
- Press release generation → wrapped in agent abstraction
- All remaining features built fresh

**What to migrate:**
- If the existing PressForge Supabase has press release data, provide a migration script
- Campaign calendar JSON data → seed into MentionLayer database

### Integration Steps (Do Before Building)

1. Copy the press release generation prompt from PressForge's `src/lib/ai/prompts/press-release.ts` into MentionLayer's `src/lib/agents/press/` directory
2. Copy the voice modeling prompt from `src/lib/ai/prompts/voice-model.ts`
3. Copy the campaign ideation prompt from `src/lib/ai/prompts/ideation.ts`
4. Copy the journalist scoring prompt from `src/lib/ai/prompts/journalist-score.ts`
5. Copy the pitch email generation prompt
6. Copy `calendar-data.json` from PressForge's `src/data/` into MentionLayer's `src/data/`
7. If PressForge has existing press release data in Supabase, run the migration script (see Migration Guide at bottom)

Do NOT copy PressForge's API routes, Supabase client, or component code. Rebuild to MentionLayer patterns.

---

## Module Purpose

PressForge automates digital PR: campaign ideation from a seasonal calendar, press release generation with spokesperson voice modeling, a compounding journalist database with AI-powered discovery and scoring, tiered outreach via Instantly, coverage monitoring, and backlink tracking.

This module replaces Olivia Brown AI ($1,500-2,000/mo) with a self-hosted system at $30-80/mo in API costs.

**Primary metric: PR Authority Score** — a composite of press releases distributed, coverage secured, backlinks earned, journalist database size, and response rates. Feeds into the overall AI Visibility Score.

### Why Press/Earned Media Matters for GEO

Press coverage is the external validation layer that AI models use to distinguish authority from self-promotion. Third-party mentions are roughly 3x more correlated with AI visibility than traditional backlinks. When Perplexity cites "according to a report in PerthNow," that's earned media driving AI citations.

### The Compounding Journalist Database

This is PressForge's core competitive advantage. Every campaign enriches the journalist database:
- Campaign 1: Discover 100 journalists via Perplexity, score all, pitch 50
- Campaign 5: 60% of journalists come from the database (instant, free), only 40% need Perplexity discovery
- Campaign 20: 80%+ from database with engagement history, response rates, and content preferences

Per-campaign Perplexity API costs DROP over time while journalist quality RISES. The database is scoped to `agency_id` — each agency builds their own compounding asset.

---

## Third-Party Dependencies

**Instantly API** (existing account) — email outreach platform
- Endpoint: `https://api.instantly.ai/api/v2`
- Used for: creating campaigns, adding leads, sending tiered pitch sequences, tracking engagement
- MentionLayer already uses Resend for transactional email (notifications). Instantly is for cold outreach. These are different purposes — keep both.
- Verify current API docs at `https://developer.instantly.ai/` before building wrapper

**Perplexity API** (existing) — journalist discovery
- Already used in AI Monitor for model testing
- Here used for: finding journalists, email enrichment, publication research
- Model: sonar-pro

**No new vendor dependencies.** Claude (existing), Perplexity (existing), Instantly (existing account).

---

## Migration 0013: PressForge

```sql
-- ============================================
-- MIGRATION 0013: PRESSFORGE
-- Press releases, spokespersons, campaign ideas,
-- journalist database, outreach, coverage tracking,
-- campaign calendar, and link monitoring.
-- ============================================

-- -----------------------------------------------
-- 1. SPOKESPERSONS — voice profiles for press releases
-- -----------------------------------------------

CREATE TABLE spokespersons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  email TEXT,
  phone TEXT,

  -- Voice modeling
  voice_samples JSONB DEFAULT '[]',
    -- [{ "quote": "...", "context": "interview", "date": "2026-01" }]
  voice_profile TEXT,
    -- AI-generated voice analysis: sentence structure, vocabulary,
    -- emotional register, metaphor usage, directness level
  voice_profile_generated_at TIMESTAMPTZ,

  photo_url TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 2. CAMPAIGN CALENDAR — seasonal hooks and events
-- -----------------------------------------------

CREATE TABLE press_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  name TEXT NOT NULL,
  event_date TEXT,                  -- Specific date or "month-long"
  event_type TEXT NOT NULL CHECK (
    event_type IN ('awareness_day', 'awareness_month', 'seasonal', 'industry', 'news_pattern')
  ),

  regions TEXT[] NOT NULL DEFAULT '{GLOBAL}',
  industries TEXT[] NOT NULL DEFAULT '{ALL}',
  pr_angle_hint TEXT,
  send_by_offset_days INTEGER DEFAULT 7,

  is_custom BOOLEAN NOT NULL DEFAULT false,  -- User-created vs seeded
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 3. CAMPAIGN IDEAS — AI-generated PR concepts
-- -----------------------------------------------

CREATE TABLE press_campaign_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  headline TEXT NOT NULL,
  angle TEXT NOT NULL,
  pr_type TEXT NOT NULL CHECK (
    pr_type IN ('expert_commentary', 'data_driven', 'case_study',
                'thought_leadership', 'event', 'award', 'partnership', 'launch')
  ),
  press_release_brief TEXT,
  target_date DATE,
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),
  seasonal_hook TEXT,
  calendar_event_id UUID REFERENCES press_calendar_events(id),

  -- Status
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_rejected BOOLEAN NOT NULL DEFAULT false,
  promoted_to_campaign_id UUID,     -- Links to press_campaigns when promoted

  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 4. PRESS CAMPAIGNS — the main pipeline entity
-- -----------------------------------------------

CREATE TABLE press_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  headline TEXT,
  angle TEXT,
  pr_type TEXT NOT NULL DEFAULT 'expert_commentary',

  -- From the idea (if promoted from one)
  idea_id UUID REFERENCES press_campaign_ideas(id),
  calendar_event_id UUID REFERENCES press_calendar_events(id),

  -- Target
  target_date DATE,
  target_region TEXT NOT NULL DEFAULT 'AU',
  target_publications TEXT[] DEFAULT '{}',

  -- Status pipeline
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',                   -- Just created
      'ideation_complete',       -- Concept finalized
      'press_release_draft',     -- PR being written
      'press_release_approved',  -- PR approved, ready for journalist search
      'journalists_found',       -- Journalists scored and selected
      'outreach_ready',          -- Pitches generated, ready to send
      'outreach_sent',           -- Emails sent via Instantly
      'monitoring',              -- Tracking coverage and links
      'completed',               -- Campaign finished
      'cancelled', 'archived'
    )
  ),

  -- Spokesperson for this campaign
  spokesperson_id UUID REFERENCES spokespersons(id),

  -- Stats (denormalized for dashboard)
  journalists_targeted INTEGER NOT NULL DEFAULT 0,
  pitches_sent INTEGER NOT NULL DEFAULT 0,
  opens INTEGER NOT NULL DEFAULT 0,
  replies INTEGER NOT NULL DEFAULT 0,
  coverage_count INTEGER NOT NULL DEFAULT 0,
  backlinks_earned INTEGER NOT NULL DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 5. PRESS RELEASES — versioned, append-only
-- -----------------------------------------------

CREATE TABLE press_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES press_campaigns(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  subtitle TEXT,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,

  -- Metadata
  pr_type TEXT,
  target_region TEXT,
  word_count INTEGER,

  -- Version tracking (append-only: each regen creates new row)
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT true,

  -- Quality checks (AI self-assessed)
  quality_checks JSONB DEFAULT '{}',
    -- { "word_count_ok": true, "backlink_included": true,
    --   "spokesperson_quoted": true, "region_spelling": "AU",
    --   "no_banned_words": true }

  -- Public access
  public_slug TEXT UNIQUE,
  public_url TEXT,

  -- Approval workflow (human-in-the-loop)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'review', 'approved', 'rejected')
  ),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 6. JOURNALISTS — compounding database (agency-scoped)
-- -----------------------------------------------

CREATE TABLE journalists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  email TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone TEXT,

  -- Publication
  publication TEXT NOT NULL,
  publication_domain TEXT,
  publication_type TEXT CHECK (
    publication_type IN ('online', 'print', 'broadcast', 'podcast', 'wire_service')
  ),
  secondary_publications TEXT[] DEFAULT '{}',

  -- Profile links
  author_page_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,

  -- Beat and coverage
  region TEXT,                       -- 'AU', 'UK', 'US', 'CA'
  sub_regions TEXT[] DEFAULT '{}',   -- ['Perth', 'Western Australia']
  beats TEXT[] DEFAULT '{}',         -- ['legal', 'workplace_safety', 'courts']
  beat_summary TEXT,                 -- AI-generated: "Covers workplace safety law in WA..."

  -- Content preferences (learned from articles + engagement)
  preferred_content_type TEXT,       -- 'data_driven', 'expert_commentary', 'case_study', etc.
  typical_article_length TEXT,       -- 'short', 'standard', 'longform'
  engages_with_types TEXT[] DEFAULT '{}',  -- Types they actually respond to

  -- Recent articles (refreshed periodically)
  recent_articles JSONB DEFAULT '[]',
    -- [{ "title": "...", "url": "...", "date": "2026-01-15",
    --    "summary": "...", "topics": [...], "content_type": "data_driven" }]

  -- Engagement stats (updated after each campaign)
  total_pitched INTEGER NOT NULL DEFAULT 0,
  total_opened INTEGER NOT NULL DEFAULT 0,
  total_replied INTEGER NOT NULL DEFAULT 0,
  total_published INTEGER NOT NULL DEFAULT 0,
  response_rate NUMERIC(5,4),       -- 0.0000 to 1.0000
  publish_rate NUMERIC(5,4),
  email_bounce_count INTEGER NOT NULL DEFAULT 0,

  -- Relationship tracking
  relationship_score INTEGER CHECK (relationship_score BETWEEN 0 AND 100),
    -- Composite: response rate + publish rate + recency + volume
  last_pitched_at TIMESTAMPTZ,
  cooldown_days INTEGER NOT NULL DEFAULT 30,
    -- Adaptive: 14 for publishers, 60 for non-responders

  -- Discovery tracking
  discovered_via TEXT DEFAULT 'perplexity',
    -- 'perplexity', 'manual', 'csv_import', 'coverage_scan'
  discovered_for_campaign_id UUID,

  -- Manual enrichment
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Status
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  blacklist_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(agency_id, email) -- One email per agency (dedup key)
);

-- -----------------------------------------------
-- 7. CAMPAIGN JOURNALIST SCORES — per-campaign scoring
-- -----------------------------------------------

CREATE TABLE press_campaign_journalist_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES press_campaigns(id) ON DELETE CASCADE,
  journalist_id UUID NOT NULL REFERENCES journalists(id) ON DELETE CASCADE,

  -- Scoring
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 100),
  tier TEXT NOT NULL CHECK (tier IN ('tier_1', 'tier_2', 'tier_3', 'skip')),
  score_breakdown JSONB DEFAULT '{}',
    -- { "beat": 25, "publication": 20, "region": 18, "recency": 12, "engagement": 8 }

  -- AI-generated
  why_selected TEXT,
  personalization_hook TEXT,

  -- Source
  source TEXT NOT NULL DEFAULT 'database',
    -- 'database' = found in existing journalist DB
    -- 'perplexity' = discovered via Perplexity for this campaign

  -- Selection status
  is_selected BOOLEAN NOT NULL DEFAULT false,  -- User confirms inclusion in outreach

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(campaign_id, journalist_id)
);

-- -----------------------------------------------
-- 8. OUTREACH EMAILS — what was actually sent
-- -----------------------------------------------

CREATE TABLE press_outreach_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES press_campaigns(id) ON DELETE CASCADE,
  journalist_id UUID NOT NULL REFERENCES journalists(id) ON DELETE CASCADE,

  -- Email content
  subject_line TEXT NOT NULL,
  body TEXT NOT NULL,
  tier TEXT NOT NULL,

  -- Instantly tracking
  instantly_campaign_id TEXT,
  instantly_lead_id TEXT,

  -- Status (updated via Instantly webhooks)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'opened', 'clicked', 'replied', 'bounced', 'unsubscribed')
  ),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 9. PRESS COVERAGE — earned media tracking
-- -----------------------------------------------

CREATE TABLE press_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES press_campaigns(id),  -- nullable: could be organic
  journalist_id UUID REFERENCES journalists(id),     -- nullable: could be unknown author

  -- Coverage details
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  publication TEXT NOT NULL,
  author TEXT,
  publish_date DATE,

  coverage_type TEXT NOT NULL DEFAULT 'mention' CHECK (
    coverage_type IN ('feature', 'mention', 'quote', 'syndication', 'backlink_only')
  ),

  -- Link tracking
  has_backlink BOOLEAN NOT NULL DEFAULT false,
  backlink_url TEXT,
  is_dofollow BOOLEAN,
  estimated_domain_authority INTEGER,

  -- Sentiment
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),

  -- Discovery
  discovered_via TEXT DEFAULT 'manual',
    -- 'manual', 'google_news_scan', 'google_alert', 'instantly_reply'

  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 10. PRESS TEMPLATES — reusable PR templates per vertical
-- -----------------------------------------------

CREATE TABLE press_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  vertical TEXT DEFAULT 'general',
  pr_type TEXT NOT NULL,

  template_body TEXT NOT NULL,
  template_structure JSONB DEFAULT '{}',
    -- { "sections": ["headline", "lead", "body", "quote_1", "data", "quote_2", "boilerplate"] }
  variables JSONB DEFAULT '{}',
    -- { "spokesperson_name": "required", "key_stat": "optional", ... }

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 11. INDEXES
-- -----------------------------------------------

CREATE INDEX idx_spokespersons_client ON spokespersons(client_id);
CREATE INDEX idx_calendar_events_month ON press_calendar_events(month, agency_id);
CREATE INDEX idx_calendar_events_industry ON press_calendar_events USING GIN(industries);
CREATE INDEX idx_campaign_ideas_client ON press_campaign_ideas(client_id, is_approved, is_rejected);
CREATE INDEX idx_press_campaigns_client ON press_campaigns(client_id, status);
CREATE INDEX idx_press_campaigns_status ON press_campaigns(status);
CREATE INDEX idx_press_releases_campaign ON press_releases(campaign_id, is_current);
CREATE INDEX idx_press_releases_slug ON press_releases(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX idx_journalists_agency ON journalists(agency_id);
CREATE INDEX idx_journalists_beats ON journalists USING GIN(beats);
CREATE INDEX idx_journalists_region ON journalists(agency_id, region);
CREATE INDEX idx_journalists_email ON journalists(agency_id, email);
CREATE INDEX idx_journalists_cooldown ON journalists(agency_id, last_pitched_at, cooldown_days)
  WHERE is_blacklisted = false AND email IS NOT NULL;
CREATE INDEX idx_journalists_relationship ON journalists(agency_id, relationship_score DESC NULLS LAST);
CREATE INDEX idx_campaign_scores_campaign ON press_campaign_journalist_scores(campaign_id, tier);
CREATE INDEX idx_campaign_scores_journalist ON press_campaign_journalist_scores(journalist_id);
CREATE INDEX idx_outreach_campaign ON press_outreach_emails(campaign_id, status);
CREATE INDEX idx_outreach_journalist ON press_outreach_emails(journalist_id);
CREATE INDEX idx_coverage_client ON press_coverage(client_id, publish_date DESC);
CREATE INDEX idx_coverage_campaign ON press_coverage(campaign_id);
CREATE INDEX idx_press_templates_agency ON press_templates(agency_id, pr_type);

-- -----------------------------------------------
-- 12. RLS POLICIES
-- -----------------------------------------------

ALTER TABLE spokespersons ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_campaign_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE journalists ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_campaign_journalist_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_templates ENABLE ROW LEVEL SECURITY;

-- Client-scoped tables
CREATE POLICY "spokespersons_agency_isolation" ON spokespersons FOR ALL USING (
  client_id IN (SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id WHERE u.id = auth.uid())
);
CREATE POLICY "campaign_ideas_agency_isolation" ON press_campaign_ideas FOR ALL USING (
  client_id IN (SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id WHERE u.id = auth.uid())
);
CREATE POLICY "press_campaigns_agency_isolation" ON press_campaigns FOR ALL USING (
  client_id IN (SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id WHERE u.id = auth.uid())
);
CREATE POLICY "press_releases_agency_isolation" ON press_releases FOR ALL USING (
  client_id IN (SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id WHERE u.id = auth.uid())
);
CREATE POLICY "coverage_agency_isolation" ON press_coverage FOR ALL USING (
  client_id IN (SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id WHERE u.id = auth.uid())
);

-- Agency-scoped tables
CREATE POLICY "calendar_agency_isolation" ON press_calendar_events FOR ALL USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "journalists_agency_isolation" ON journalists FOR ALL USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "press_templates_agency_isolation" ON press_templates FOR ALL USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);

-- Campaign-linked tables (chain through press_campaigns → clients → agency)
CREATE POLICY "campaign_scores_agency_isolation" ON press_campaign_journalist_scores FOR ALL USING (
  campaign_id IN (
    SELECT pc.id FROM press_campaigns pc JOIN clients c ON c.id = pc.client_id
    JOIN users u ON u.agency_id = c.agency_id WHERE u.id = auth.uid()
  )
);
CREATE POLICY "outreach_agency_isolation" ON press_outreach_emails FOR ALL USING (
  campaign_id IN (
    SELECT pc.id FROM press_campaigns pc JOIN clients c ON c.id = pc.client_id
    JOIN users u ON u.agency_id = c.agency_id WHERE u.id = auth.uid()
  )
);
```

---

## Agent Implementations

### Registry Extension

```typescript
export const agents = {
  // ... existing agents ...

  press: {
    ideator: new CampaignIdeatorAgent(),
    releaseGenerator: new PressReleaseAgent(),
    voiceModeler: new VoiceModelAgent(),
    journalistDiscovery: new JournalistDiscoveryAgent(),
    journalistScorer: new JournalistScorerAgent(),
    pitchGenerator: new PitchEmailAgent(),
    coverageScanner: new CoverageScannerAgent(),
  },
} as const;
```

### Agent 1: Campaign Ideator

**File:** `src/lib/agents/press/campaign-ideator.agent.ts`

Uses Claude Opus. Takes client profile + calendar events for target month + past campaign history. Generates 3-5 PR concepts with headlines, angles, types, target dates, and relevance scores. **Port the ideation prompt from PressForge's `src/lib/ai/prompts/ideation.ts`.**

### Agent 2: Press Release Generator

**File:** `src/lib/agents/press/release-generator.agent.ts`

Uses Claude Opus. This is the agent that wraps PressForge's existing working code. **Port the generation prompt from PressForge's `src/lib/ai/prompts/press-release.ts`.** Include voice profile injection, region-specific spelling, quality checks, and the banned word list. Output: full press release with title, subtitle, body_html, body_text, quality_checks JSONB.

### Agent 3: Voice Modeler

**File:** `src/lib/agents/press/voice-modeler.agent.ts`

Uses Claude Opus. Analyzes spokesperson quotes and generates a voice profile covering sentence structure, vocabulary, emotional register, metaphors, directness, and personality markers. **Port from PressForge's `src/lib/ai/prompts/voice-model.ts`.**

### Agent 4: Journalist Discovery

**File:** `src/lib/agents/press/journalist-discovery.agent.ts`

**This is the core competitive engine.** Two-phase, database-first architecture:

**Phase A: Database Search (instant, free)**
1. Claude extracts search criteria from press release (keywords, beats, region, target publications)
2. Query `journalists` table with layered matching: beat overlap + region + not in cooldown + not blacklisted + keyword match in recent_articles
3. Batch score database matches (8 per Claude call) — see Agent 5
4. Calculate gap: TARGET (default 100) minus scored DB results

**Phase B: Perplexity Gap-Fill (only if gap > 0)**
5. Tell Perplexity what you already have (exclude known publications)
6. Run targeted queries: `"journalists who cover {topic} in {region}" excluding {known_pubs}`
7. Claude parses Perplexity responses into structured journalist records
8. Deduplicate against existing database (name + publication match)
9. Insert new journalists, batch score them
10. Merge DB-sourced + Perplexity-sourced, sort by score

**Port the journalist discovery prompts and Perplexity query patterns from PressForge's CLAUDE.md journalist discovery section.**

### Agent 5: Journalist Scorer

**File:** `src/lib/agents/press/journalist-scorer.agent.ts`

Uses Claude Sonnet (batch classification). Scores 8 journalists per API call against a press release. Evaluates: beat alignment (0-30), publication fit (0-25), regional match (0-20), recency (0-15), engagement likelihood (0-10). Tiers: 80+ = tier_1, 50-79 = tier_2, 30-49 = tier_3, <30 = skip. **Port the batch scoring prompt from PressForge's CLAUDE.md.**

### Agent 6: Pitch Email Generator

**File:** `src/lib/agents/press/pitch-generator.agent.ts`

Uses Claude Opus (public-facing quality). Generates tiered pitch emails:
- **Tier 1 (80+):** 3-step sequence. Day 0: personalized pitch referencing journalist's recent article. Day 3: follow-up. Day 7: last note.
- **Tier 2 (50-79):** 2-step. Day 0: personalized with publication name. Day 5: follow-up.
- **Tier 3 (30-49):** 1-step. Day 0: standard pitch, no follow-up.

Generates 3 subject line variants per journalist. Human-in-the-loop: preview all pitches before pushing to Instantly.

### Agent 7: Coverage Scanner

**File:** `src/lib/agents/press/coverage-scanner.agent.ts`

Uses Apify for Google News monitoring + web search. Scans for brand mentions, matches to campaigns, checks for backlinks (dofollow status), estimates domain authority from Google position.

---

## Instantly Integration

**File:** `src/lib/instantly/client.ts`

Wrapper for the Instantly API v2. **Verify current API docs before building.**

```typescript
// Key endpoints:
// POST /api/v2/campaigns — create campaign with tiered email sequences
// POST /api/v2/campaigns/{id}/leads — add leads (bulk, with custom variables)
// GET /api/v2/campaigns/{id}/summary — campaign analytics
// Webhook: engagement events (opens, clicks, replies, bounces)

// Webhook handler at /api/webhooks/instantly/route.ts:
// - On open: update outreach_emails.status + opened_at
// - On reply: update status + replied_at, update journalist.total_replied
// - On bounce: update status + bounced_at, set journalist.email_verified = false,
//   increment journalist.email_bounce_count, auto-blacklist at 3 bounces
// - On click: update status + clicked_at (journalist viewed the press release)
//
// After each engagement event, run update_journalist_stats() to recalculate:
//   response_rate, publish_rate, cooldown_days, relationship_score
```

### Cooldown Enforcement

**This is a hard constraint.** When selecting journalists for a campaign:

```sql
WHERE (last_pitched_at IS NULL OR last_pitched_at < NOW() - INTERVAL '1 day' * cooldown_days)
  AND is_blacklisted = false
  AND email IS NOT NULL
  AND email_verified = true  -- NEVER send to unverified emails
```

Default cooldown: 30 days. Adaptive: 14 days for journalists who published, 60 days for non-responders. Display "X journalists excluded (recently pitched)" in UI.

### Email Verification Flow

1. Perplexity discovers emails → flag as `email_verified = false`
2. Validate domain MX records exist
3. Only push verified emails to Instantly
4. On successful Instantly delivery (no bounce) → mark `email_verified = true`
5. On bounce → mark `email_verified = false`, increment bounce count

---

## Campaign Calendar

Seed `press_calendar_events` from `calendar-data.json` on first run:

```typescript
// src/lib/calendar/seed.ts
import calendarData from '@/data/calendar-data.json';

export async function seedCalendar(supabase: SupabaseClient, agencyId: string) {
  const { count } = await supabase
    .from('press_calendar_events')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId);

  if (count === 0) {
    const events = calendarData.events.map(e => ({
      ...e,
      agency_id: agencyId,
      is_custom: false,
    }));
    await supabase.from('press_calendar_events').insert(events);
  }
}
```

Users can add custom events via UI. Database is source of truth after seed.

---

## Core Pipelines

### Campaign Creation Pipeline

1. User selects client + month
2. System loads matching calendar events (by industry + region)
3. Campaign Ideator agent generates 3-5 concepts
4. User approves/rejects ideas
5. Approved idea → creates press_campaign with status 'ideation_complete'

### Press Release Pipeline

1. User clicks "Generate Press Release" on campaign
2. If no voice profile for spokesperson → Voice Modeler runs first
3. Press Release Generator agent produces full press release
4. Quality checks displayed alongside content
5. User reviews, edits inline, approves
6. On approval: generate public_slug, set public_url → status 'press_release_approved'
7. Public press release page at `/press/[slug]` (no auth, clean layout)

### Journalist Discovery Pipeline (Inngest job)

1. Extract search criteria from press release (Claude)
2. Phase A: database search → batch score (8/call)
3. Calculate gap
4. Phase B: Perplexity queries (if gap > 0) → parse → dedup → insert → batch score
5. Merge results, display grouped by source with tier badges
6. User reviews, selects journalists → status 'journalists_found'

### Outreach Pipeline

1. Pitch Email agent generates tiered emails for selected journalists
2. User previews all tiers → approves → status 'outreach_ready'
3. Create Instantly campaign with tiered sequences
4. Push leads (verified emails only) to Instantly
5. Status → 'outreach_sent'
6. Instantly webhooks update engagement data in real-time
7. After engagement data settles (14 days) → update journalist stats

### Coverage Monitoring Pipeline (Inngest cron)

1. Coverage Scanner searches Google News for client brand mentions
2. Match mentions to active campaigns
3. Check for backlinks in coverage articles
4. Insert press_coverage records
5. Update campaign stats (coverage_count, backlinks_earned)
6. Status → 'monitoring' or 'completed'

---

## Inngest Jobs

```typescript
// press.ideate — Generate campaign ideas for a month
// press.generate-release — Generate/regenerate press release
// press.model-voice — Analyze spokesperson voice samples
// press.discover-journalists — Two-phase database-first discovery
// press.score-journalists — Batch scoring (8 per Claude call)
// press.generate-pitches — Tiered pitch email generation
// press.send-outreach — Push to Instantly
// press.scan-coverage — Google News monitoring (monthly cron)
// press.update-journalist-stats — Recalculate engagement metrics

// Cron: Monthly coverage scan
// { "path": "/api/cron/press-coverage", "schedule": "0 5 * * 1" }
// Every Monday at 5am UTC
```

---

## API Routes

Campaign CRUD, press release CRUD with versioning, journalist CRUD + CSV import, campaign scoring + selection, outreach preview + send, coverage tracking, calendar events, spokesperson management, voice modeling, Instantly webhook handler.

Public route: `/press/[slug]` — unauthenticated press release display page.

---

## Dashboard UI

```
src/app/(dashboard)/press/
├── page.tsx                       # PressForge overview (active campaigns, recent coverage)
├── campaigns/
│   ├── page.tsx                   # All campaigns with status pipeline
│   ├── new/page.tsx               # Create campaign (idea-first or manual)
│   └── [campaignId]/
│       ├── page.tsx               # Campaign detail with pipeline steps
│       ├── release/page.tsx       # Press release editor + quality checks
│       ├── journalists/page.tsx   # Discovery results + selection
│       └── outreach/page.tsx      # Pitch preview + Instantly tracking
├── journalists/
│   ├── page.tsx                   # Master journalist database
│   └── [journalistId]/page.tsx    # Full journalist profile + history
├── coverage/
│   └── page.tsx                   # Earned media tracking + backlinks
├── calendar/
│   └── page.tsx                   # 12-month campaign calendar
└── ideas/
    └── page.tsx                   # AI-generated ideas pending review

src/app/press/
└── [slug]/page.tsx                # PUBLIC press release page (no auth)
```

---

## Cross-Module Integration

### PressForge → AI Monitor
Coverage monitoring feeds into the correlation timeline. When coverage is secured and SoM rises, the correlation engine links them. Press release distribution dates overlay on the timeline chart.

### PressForge → Entity Sync
Coverage articles with backlinks are high-authority entity signals. When press_coverage records have `has_backlink = true`, flag them as authority boosters in Entity Sync's assessment.

### PressForge → Citation Engine
High-DA coverage articles are exactly the kind of content AI models cite. When coverage is secured on a publication AI models reference, flag it for the AI Monitor to track.

### PressForge → Review Engine
PR campaigns can drive review activity (media coverage → brand awareness → organic reviews). The correlation engine should track this.

---

## Credit Costs

| Action | Credits |
|--------|---------|
| Campaign ideation (per month) | 10 |
| Press release generation | 20 |
| Voice modeling | 5 |
| Journalist discovery (full pipeline) | 25 |
| Journalist batch scoring (per batch of 8) | 2 |
| Pitch email generation (per campaign) | 15 |
| Coverage scan | 5 |

**Per campaign total:** ~80-100 credits (ideation through coverage monitoring)

---

## Build Sequence

1. **Copy PressForge prompts** into MentionLayer (see Integration Steps at top)
2. **Copy calendar-data.json** into MentionLayer
3. **Migration 0013** — all 10 tables
4. **Agent interfaces** — add PressForge interfaces to `interfaces.ts`
5. **Voice Modeler agent** — port from PressForge
6. **Press Release Generator agent** — port from PressForge (the working code)
7. **Campaign Ideator agent** — port from PressForge
8. **Journalist Scorer agent** — batch scoring (8 per call)
9. **Journalist Discovery agent** — database-first + Perplexity gap-fill
10. **Pitch Email Generator agent** — tiered sequences
11. **Coverage Scanner agent** — Google News via Apify
12. **Registry extension** — add press namespace
13. **Instantly client wrapper** — verify API docs first
14. **Calendar seed script**
15. **Inngest jobs** — all press.* jobs
16. **API routes** — `/api/press/*` + Instantly webhook + cron
17. **Spokesperson management UI**
18. **Campaign pipeline UI** — status-driven steps
19. **Press release editor** — with quality checks + versioning + public page
20. **Journalist database UI** — master table + profile detail + discovery progress
21. **Outreach UI** — pitch preview + Instantly tracking
22. **Coverage tracking UI**
23. **Calendar UI** — 12-month grid with campaign overlay
24. **Test with live data** — Foyle Legal campaign through full pipeline

---

## Claude Code Prompt

```
Read CLAUDE.md in the project root completely before responding.
Read docs/MODULE_PRESSFORGE.md completely before responding.

You are building the PressForge module for MentionLayer.
All other modules (Citation Engine, AI Monitor, Entity Sync,
Review Engine) are already built. All patterns are in place.

IMPORTANT: PressForge has an existing standalone codebase.
The press release generation prompts, voice modeling prompts,
campaign ideation prompts, journalist scoring prompts, and
pitch email prompts should already be copied into this project
(see Integration Steps at the top of the spec). Wrap these
existing prompts with the agent abstraction layer.

The journalist database, campaign management, Instantly outreach,
and coverage monitoring are built fresh to MentionLayer patterns.

Follow the 24-step build sequence. Enter Plan Mode first.
Do not modify any existing module code.
```

---

## Data Migration Guide (If PressForge Has Existing Data)

If the existing PressForge Supabase project has press releases or other data worth preserving:

```typescript
// scripts/migrate-pressforge-data.ts
//
// Run ONCE after migration 0013 is applied.
//
// 1. Connect to PressForge Supabase (source)
// 2. Connect to MentionLayer Supabase (destination)
// 3. For each press release in source:
//    a. Map org_id → agency_id (lookup by owner_email)
//    b. Map client → client_id (lookup by name or create)
//    c. Create press_campaign record (status based on PR status)
//    d. Insert press_release with content, version, quality_checks
//    e. Preserve public_slug if exists
// 4. For any journalists in source (if populated):
//    a. Map org_id → agency_id
//    b. Insert into journalists table
//    c. Preserve engagement stats and relationship scores
//
// The script is idempotent (checks for duplicates before inserting).
// Run with: npx tsx scripts/migrate-pressforge-data.ts
```

If PressForge has no data worth migrating (just the code patterns), skip this script entirely.

---

## Notes

- The press release generation prompts from PressForge are battle-tested. Port them exactly, then iterate.
- Instantly is for COLD OUTREACH to journalists. Resend is for TRANSACTIONAL EMAILS (notifications, alerts, reports). Don't mix these — sending cold pitches through Resend will destroy your transactional email reputation.
- The journalist cooldown is a HARD constraint, not a suggestion. Without it, the same journalist gets pitched by multiple clients in the same week → blacklisted.
- Email verification is MANDATORY before outreach. Perplexity WILL hallucinate email addresses. Never send to unverified emails.
- The public press release page (`/press/[slug]`) must be clean, fast, and unbranded. It should look like a news article, not a marketing page. This page also gives analytics on which journalists clicked through.
- Batch journalist scoring (8 per call) cuts 200 individual API calls to 25, saving ~$2 and ~4 minutes per campaign.
- The campaign calendar is seeded once, then managed via UI. Users add custom events for their verticals.
- Coverage monitoring is the weakest link technically (Google News scraping is fragile). Start with manual coverage entry + a simple Google News search, iterate toward automated monitoring.
- This is the most complex module in MentionLayer. Budget 2-3 Claude Code sessions.
