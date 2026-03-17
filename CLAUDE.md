# CLAUDE.md — GrowthForge: AI SEO Platform

## Project Identity

**Product:** GrowthForge — The AI SEO Platform
**Company:** Xpand Digital (Miji Australia Pty Ltd)
**Owner:** Joel House (joel@xpanddigital.com)
**Repository:** growthforge (monorepo)

GrowthForge is a multi-tenant AI SEO platform that helps agencies manage off-page AI visibility campaigns for their clients. It discovers high-authority threads on Reddit, Quora, and Facebook Groups that are already cited by Google and AI models, generates human-quality contextual responses, manages digital PR distribution, monitors AI citation performance, and provides unified reporting.

---

## Architecture Overview

### Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js (App Router) | 14.x | Monorepo, `src/` directory structure |
| Language | TypeScript | 5.x | Strict mode enabled |
| Database | Supabase (PostgreSQL) | Latest | Multi-tenant with RLS |
| Auth | Supabase Auth | Latest | Email + magic link, team invites |
| ORM | Drizzle ORM | Latest | Type-safe queries, migration-first |
| UI | shadcn/ui + Tailwind CSS | Latest | Consistent component library |
| State | Zustand | Latest | Lightweight client state |
| Scraping | Apify (via REST API) | Latest | Actors for SERP, Reddit, Quora |
| AI — Classification | Claude Sonnet 4 | claude-sonnet-4-20250514 | Fast, cheap classification |
| AI — Generation | Claude Opus 4 | claude-opus-4-20250514 | Highest quality responses |
| AI — Probing | Perplexity API | sonar-pro | Returns source URLs natively |
| AI — Probing | OpenAI API | gpt-4o | For ChatGPT citation detection |
| Hosting | Vercel | Pro plan | Edge functions, cron jobs |
| Payments | Stripe | Latest | Usage-based credits (Phase 3) |
| Email | Resend | Latest | Transactional + notifications |
| Queue | Inngest | Latest | Background job orchestration |

### Directory Structure

```
growthforge/
├── CLAUDE.md                          # This file
├── package.json
├── next.config.js
├── tailwind.config.ts
├── drizzle.config.ts
├── tsconfig.json
├── .env.local                         # Local env vars (never commit)
├── .env.example                       # Template for env vars
├── supabase/
│   ├── migrations/                    # Sequential SQL migrations
│   │   ├── 0001_create_tenancy.sql
│   │   ├── 0002_create_clients.sql
│   │   ├── 0003_create_discovery.sql
│   │   ├── 0004_create_responses.sql
│   │   ├── 0005_create_campaigns.sql
│   │   ├── 0006_create_monitoring.sql
│   │   ├── 0007_create_billing.sql
│   │   └── 0008_create_agent_actions.sql
│   └── seed.sql                       # Dev seed data
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Landing/marketing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx             # Dashboard shell with sidebar
│   │   │   ├── page.tsx               # Overview/home
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx           # Client list
│   │   │   │   ├── new/page.tsx       # Add client
│   │   │   │   └── [clientId]/
│   │   │   │       ├── page.tsx       # Client detail (brand info + keywords)
│   │   │   │       ├── keywords/page.tsx
│   │   │   │       └── settings/page.tsx
│   │   │   ├── citations/             # Citation Engine module
│   │   │   │   ├── page.tsx           # Thread queue (main working screen)
│   │   │   │   ├── [threadId]/page.tsx # Thread detail + responses
│   │   │   │   └── runs/page.tsx      # Discovery run history
│   │   │   ├── press/                 # PressForge module (Phase 2)
│   │   │   │   ├── page.tsx           # Press campaigns
│   │   │   │   └── [campaignId]/page.tsx
│   │   │   ├── monitor/               # AI Monitor module (Phase 2)
│   │   │   │   ├── page.tsx           # Share of Model dashboard
│   │   │   │   └── prompts/page.tsx   # Prompt test results
│   │   │   ├── entities/              # Entity Sync module (Phase 3)
│   │   │   │   └── page.tsx
│   │   │   ├── reviews/               # Review Engine module (Phase 3)
│   │   │   │   └── page.tsx
│   │   │   ├── reports/               # Unified reporting
│   │   │   │   └── page.tsx
│   │   │   ├── team/                  # Team management
│   │   │   │   └── page.tsx
│   │   │   └── settings/              # Agency settings + billing
│   │   │       ├── page.tsx
│   │   │       └── billing/page.tsx
│   │   └── api/
│   │       ├── cron/
│   │       │   ├── discovery/route.ts         # Scheduled SERP + AI probing
│   │       │   ├── classify/route.ts          # Batch thread classification
│   │       │   └── monitor/route.ts           # AI citation monitoring
│   │       ├── discovery/
│   │       │   ├── scan/route.ts              # Trigger manual discovery scan
│   │       │   └── enrich/route.ts            # Enrich specific threads
│   │       ├── responses/
│   │       │   ├── generate/route.ts          # Generate 3 response variants
│   │       │   └── [responseId]/route.ts      # Update response status
│   │       ├── clients/
│   │       │   └── route.ts                   # CRUD
│   │       ├── keywords/
│   │       │   ├── route.ts                   # CRUD
│   │       │   └── suggest/route.ts           # AI keyword suggestions
│   │       ├── webhooks/
│   │       │   ├── stripe/route.ts            # Stripe webhooks (Phase 3)
│   │       │   └── apify/route.ts             # Apify actor completion
│   │       └── inngest/route.ts               # Inngest function handler
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client
│   │   │   ├── server.ts              # Server client (with service role)
│   │   │   ├── middleware.ts          # Auth middleware
│   │   │   └── types.ts              # Generated DB types
│   │   ├── agents/
│   │   │   ├── interfaces.ts          # Agent type interfaces (DiscoveryAgent, etc.)
│   │   │   ├── registry.ts            # Maps agent type → active implementation
│   │   │   ├── logger.ts              # Agent action logger (wraps every agent call)
│   │   │   ├── discovery/
│   │   │   │   ├── apify-serp.agent.ts
│   │   │   │   └── perplexity-probe.agent.ts
│   │   │   ├── enrichment/
│   │   │   │   └── apify-reddit.agent.ts
│   │   │   ├── classification/
│   │   │   │   └── claude-sonnet.agent.ts
│   │   │   ├── response/
│   │   │   │   └── claude-opus.agent.ts
│   │   │   └── audit/
│   │   │       ├── citation-scan.agent.ts
│   │   │       ├── ai-presence.agent.ts
│   │   │       ├── entity-check.agent.ts
│   │   │       ├── review-scan.agent.ts
│   │   │       └── press-scan.agent.ts
│   │   ├── ai/
│   │   │   ├── claude.ts             # Anthropic SDK wrapper
│   │   │   ├── classify.ts           # Thread classification pipeline
│   │   │   ├── generate-responses.ts # 3-variant response generator
│   │   │   ├── probe-ai-models.ts    # AI model probing (Perplexity + OpenAI)
│   │   │   ├── suggest-keywords.ts   # AI keyword expansion
│   │   │   └── prompts/
│   │   │       ├── classify-thread.ts
│   │   │       ├── generate-casual.ts
│   │   │       ├── generate-expert.ts
│   │   │       ├── generate-story.ts
│   │   │       └── probe-query.ts
│   │   ├── discovery/
│   │   │   ├── serp-scanner.ts       # Google SERP via Apify
│   │   │   ├── thread-enricher.ts    # Full thread content fetcher
│   │   │   ├── ai-prober.ts          # AI citation discovery
│   │   │   ├── dedup.ts              # Content hash deduplication
│   │   │   └── scoring.ts            # Opportunity score calculator
│   │   ├── apify/
│   │   │   ├── client.ts             # Apify API client wrapper
│   │   │   ├── actors.ts             # Actor IDs and input schemas
│   │   │   └── parsers.ts            # Output parsing per actor
│   │   ├── inngest/
│   │   │   ├── client.ts             # Inngest client
│   │   │   └── functions.ts          # Background job definitions
│   │   ├── billing/
│   │   │   ├── credits.ts            # Credit transaction helpers
│   │   │   └── stripe.ts             # Stripe integration (Phase 3)
│   │   ├── email/
│   │   │   └── notifications.ts      # Email templates via Resend
│   │   └── utils/
│   │       ├── errors.ts             # Error types and handlers
│   │       ├── rate-limit.ts         # Rate limiting helpers
│   │       ├── retry.ts              # Retry with exponential backoff
│   │       ├── hash.ts               # Content hashing for dedup
│   │       └── validators.ts         # Zod schemas for all inputs
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx           # Dashboard sidebar navigation
│   │   │   ├── header.tsx            # Top bar with client selector
│   │   │   └── client-selector.tsx   # Global client context switcher
│   │   ├── citations/
│   │   │   ├── thread-table.tsx      # Main thread queue table
│   │   │   ├── thread-filters.tsx    # Filter bar (platform, intent, relevance, date)
│   │   │   ├── thread-row.tsx        # Individual thread row
│   │   │   ├── response-panel.tsx    # Slide-out with 3 variants
│   │   │   ├── response-card.tsx     # Single response variant display
│   │   │   └── copy-button.tsx       # Copy-to-clipboard with feedback
│   │   ├── clients/
│   │   │   ├── client-form.tsx       # Add/edit client form
│   │   │   ├── brand-brief-editor.tsx # Rich text brand brief
│   │   │   └── keyword-manager.tsx   # Keyword list with tags
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx       # Overview metric cards
│   │   │   ├── activity-feed.tsx     # Recent activity log
│   │   │   └── module-status.tsx     # Module health indicators
│   │   └── shared/
│   │       ├── data-table.tsx        # Reusable sortable/filterable table
│   │       ├── platform-badge.tsx    # Reddit/Quora/FB icon badges
│   │       ├── intent-tag.tsx        # Colored intent classification tag
│   │       ├── relevance-bar.tsx     # Visual relevance score bar
│   │       ├── status-badge.tsx      # Thread/response status indicator
│   │       └── empty-state.tsx       # Empty state illustrations
│   ├── hooks/
│   │   ├── use-client-context.ts     # Current selected client
│   │   ├── use-agency.ts             # Current agency data
│   │   └── use-credits.ts            # Credit balance (Phase 3)
│   └── types/
│       ├── database.ts               # DB row types (from Drizzle)
│       ├── api.ts                    # API request/response types
│       └── enums.ts                  # Shared enum types
└── tests/
    ├── unit/
    │   ├── classify.test.ts
    │   ├── dedup.test.ts
    │   ├── scoring.test.ts
    │   └── hash.test.ts
    ├── integration/
    │   ├── discovery-pipeline.test.ts
    │   └── response-generation.test.ts
    └── e2e/
        ├── thread-queue.test.ts
        └── client-management.test.ts
```

---

## Database Schema

### Migration 0001: Tenancy Model (Platform → Agency → Client)

```sql
-- ============================================
-- MIGRATION 0001: MULTI-TENANT HIERARCHY
-- Platform (GrowthForge) → Agencies → Clients
-- ============================================

-- Agencies are the primary tenant unit.
-- Phase 1: Xpand Digital is the only agency.
-- Phase 3: Other agencies sign up and pay for access.
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_email TEXT NOT NULL,
  logo_url TEXT,
  
  -- Plan & billing (Phase 3 — default to unlimited for Phase 1)
  plan TEXT NOT NULL DEFAULT 'agency_unlimited',
    -- Phase 1: agency_unlimited (no limits)
    -- Phase 3: starter | growth | agency_pro | enterprise
  credits_balance INTEGER NOT NULL DEFAULT 999999,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Settings
  max_clients INTEGER NOT NULL DEFAULT 100,
  max_keywords_per_client INTEGER NOT NULL DEFAULT 100,
  
  -- Metadata
  is_platform_owner BOOLEAN NOT NULL DEFAULT false, -- true for Xpand Digital only
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users belong to exactly one agency.
-- Phase 2: Clients can be invited as viewers.
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Roles determine access level
  role TEXT NOT NULL DEFAULT 'member',
    -- platform_admin: GrowthForge superadmin (Joel only)
    -- agency_owner: Full agency access, billing, team management
    -- agency_admin: Full agency access, no billing
    -- member: Can manage clients, run campaigns
    -- viewer: Read-only access (for client portal, Phase 2)
  
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_agency ON users(agency_id);
CREATE INDEX idx_users_email ON users(email);

-- RLS Policies
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Platform admins see all agencies
-- Agency members see only their own agency
CREATE POLICY "agencies_select" ON agencies FOR SELECT USING (
  id IN (SELECT agency_id FROM users WHERE id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
);

CREATE POLICY "agencies_update" ON agencies FOR UPDATE USING (
  id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role IN ('agency_owner', 'platform_admin'))
);

-- Users see only their agency's members
CREATE POLICY "users_select" ON users FOR SELECT USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
```

### Migration 0002: Clients & Keywords

```sql
-- ============================================
-- MIGRATION 0002: CLIENTS & KEYWORDS
-- Clients (brands) belong to an agency.
-- Keywords drive the discovery engine.
-- ============================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  
  -- Brand identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  
  -- Brand brief — the heart of response quality
  -- This is injected into every AI prompt for this client.
  brand_brief TEXT NOT NULL,
    -- Instructions: Describe the business in 250 words or less.
    -- Include: what they do, who they serve, what makes them different.
    -- This directly controls the quality of generated responses.
  
  tone_guidelines TEXT,
    -- e.g. "Casual and helpful. Never salesy. Use specific numbers.
    -- OK to mention competitors by name. Avoid corporate jargon."
  
  target_audience TEXT,
    -- e.g. "Independent musicians aged 20-35 looking for music promotion
    -- and licensing services. Frustrated with predatory labels."
  
  key_differentiators TEXT,
    -- e.g. "Transparent short-term financing (not advances that own your masters).
    -- Data-driven licensing deals. No exclusivity required."
  
  -- URLs the AI can reference in responses (use sparingly)
  urls_to_mention TEXT[] NOT NULL DEFAULT '{}',
  
  -- Response rules (appended to generation prompts)
  response_rules TEXT,
    -- e.g. "Never mention pricing. Always suggest they 'check out' rather than
    -- 'sign up for'. Never claim to be a customer — position as someone who
    -- 'heard about them from a friend'."
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(agency_id, slug)
);

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  keyword TEXT NOT NULL,
  
  -- Classification
  tags TEXT[] NOT NULL DEFAULT '{}',
    -- e.g. ['music industry', 'financing', 'competitor']
  intent TEXT,
    -- informational | transactional | commercial | navigational
    -- Set by AI or manually overridden
  volume_score INTEGER CHECK (volume_score BETWEEN 1 AND 10),
    -- Relative search volume estimate (1=low, 10=high)
  
  -- Source tracking
  source TEXT NOT NULL DEFAULT 'manual',
    -- manual | ai_suggested | imported
  
  -- Scan configuration
  scan_platforms TEXT[] NOT NULL DEFAULT '{reddit,quora,facebook_groups}',
    -- Which platforms to search for this keyword
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(client_id, keyword)
);

-- Indexes
CREATE INDEX idx_clients_agency ON clients(agency_id);
CREATE INDEX idx_clients_active ON clients(agency_id, is_active);
CREATE INDEX idx_keywords_client ON keywords(client_id, is_active);
CREATE INDEX idx_keywords_tags ON keywords USING GIN(tags);

-- RLS: Agency isolation through client -> agency chain
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_agency_isolation" ON clients FOR ALL USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "keywords_agency_isolation" ON keywords FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

### Migration 0003: Discovery Engine (Threads)

```sql
-- ============================================
-- MIGRATION 0003: THREAD DISCOVERY
-- Discovered threads from Reddit, Quora, Facebook Groups.
-- Each thread is an opportunity to place a citation.
-- ============================================

CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  
  -- Platform identification
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'quora', 'facebook_groups')),
  platform_id TEXT,            -- Reddit post ID, Quora question ID, etc.
  
  -- Platform-specific context
  subreddit TEXT,              -- e.g. 'r/WeAreTheMusicMakers' (Reddit only)
  group_name TEXT,             -- Facebook Group name (FB only)
  
  -- Thread content (populated during enrichment)
  title TEXT NOT NULL,
  body_text TEXT,              -- Full post body
  url TEXT NOT NULL,
  author TEXT,
  comment_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  thread_date TIMESTAMPTZ,     -- When the thread was originally posted
  
  -- Top comments (stored as JSONB for flexibility)
  -- Structure: [{ author, body, upvotes, date }]
  top_comments JSONB DEFAULT '[]',
  
  -- Discovery metadata — how we found this thread
  discovered_via TEXT NOT NULL DEFAULT 'serp',
    -- serp | ai_probe_chatgpt | ai_probe_perplexity | ai_probe_gemini | manual
  google_position INTEGER,     -- SERP position (1-100) if found via SERP
  ai_source TEXT,              -- Which AI model cited this thread
  ai_query TEXT,               -- The query/prompt that surfaced this thread
  
  -- AI Classification (set by classification pipeline)
  intent TEXT CHECK (intent IN ('informational', 'transactional', 'commercial', 'navigational')),
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  opportunity_score INTEGER CHECK (opportunity_score BETWEEN 0 AND 100),
  can_mention_brand BOOLEAN,
  suggested_angle TEXT,        -- AI's suggestion for how to approach the response
  classification_tags TEXT[] DEFAULT '{}',
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'enriching', 'classified', 'queued', 'generating', 'responded', 'posted', 'skipped', 'expired')
  ),
  -- new: Just discovered, not yet enriched
  -- enriching: Apify actor is fetching full thread content
  -- classified: AI has scored and classified
  -- queued: Ready for response generation
  -- generating: Claude is generating responses
  -- responded: Responses generated, awaiting review
  -- posted: User confirmed they posted a response
  -- skipped: User decided to skip this thread
  -- expired: Thread is too old or locked
  
  -- Enrichment tracking
  is_enriched BOOLEAN NOT NULL DEFAULT false,
  enriched_at TIMESTAMPTZ,
  enrichment_error TEXT,
  
  -- Deduplication
  content_hash TEXT NOT NULL,  -- SHA256 of normalized(title + url)
  
  -- Timestamps
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(client_id, content_hash)
);

-- Discovery runs — audit trail for batch operations
CREATE TABLE discovery_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  run_type TEXT NOT NULL CHECK (
    run_type IN ('serp_scan', 'ai_probe', 'thread_enrich', 'classification', 'response_gen')
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  
  -- Stats
  items_total INTEGER NOT NULL DEFAULT 0,
  items_processed INTEGER NOT NULL DEFAULT 0,
  items_succeeded INTEGER NOT NULL DEFAULT 0,
  items_failed INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- Debug metadata (actor run IDs, API call counts, etc.)
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_threads_client_status ON threads(client_id, status);
CREATE INDEX idx_threads_client_relevance ON threads(client_id, relevance_score DESC NULLS LAST);
CREATE INDEX idx_threads_client_opportunity ON threads(client_id, opportunity_score DESC NULLS LAST);
CREATE INDEX idx_threads_platform ON threads(platform);
CREATE INDEX idx_threads_discovered ON threads(discovered_at DESC);
CREATE INDEX idx_threads_content_hash ON threads(content_hash);
CREATE INDEX idx_threads_status_changed ON threads(status_changed_at DESC);
CREATE INDEX idx_discovery_runs_client ON discovery_runs(client_id, started_at DESC);

-- RLS
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "threads_agency_isolation" ON threads FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "discovery_runs_agency_isolation" ON discovery_runs FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

### Migration 0004: Response Generation

```sql
-- ============================================
-- MIGRATION 0004: GENERATED RESPONSES
-- Three variants per thread: casual, expert, story.
-- ============================================

CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Variant type
  variant TEXT NOT NULL CHECK (variant IN ('casual', 'expert', 'story')),
  
  -- Response content
  body_text TEXT NOT NULL,
  
  -- Quality metadata (self-assessed by AI during generation)
  quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
  tone_match_score INTEGER CHECK (tone_match_score BETWEEN 0 AND 100),
  mentions_brand BOOLEAN NOT NULL DEFAULT false,
  mentions_url BOOLEAN NOT NULL DEFAULT false,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'approved', 'posted', 'rejected')
  ),
  
  -- Edit tracking
  was_edited BOOLEAN NOT NULL DEFAULT false,
  edited_text TEXT,            -- If the user modified before posting
  
  -- Audit trail
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(thread_id, variant)
);

-- Indexes
CREATE INDEX idx_responses_thread ON responses(thread_id);
CREATE INDEX idx_responses_client_status ON responses(client_id, status);

-- RLS
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "responses_agency_isolation" ON responses FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

### Migration 0005: AI Monitoring (Phase 2)

```sql
-- ============================================
-- MIGRATION 0005: AI CITATION MONITORING
-- Track whether the client's brand gets cited by AI models.
-- This is the feedback loop that proves the seeding works.
-- ============================================

CREATE TABLE monitor_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- The prompt we send to AI models
  prompt_text TEXT NOT NULL,
    -- e.g. "What are the best music licensing services for independent artists?"
  
  -- Which AI models to test
  test_models TEXT[] NOT NULL DEFAULT '{chatgpt,perplexity,gemini}',
  
  -- Schedule
  frequency TEXT NOT NULL DEFAULT 'weekly',
    -- daily | weekly | biweekly | monthly
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE monitor_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES monitor_prompts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Which model was tested
  ai_model TEXT NOT NULL, -- chatgpt | perplexity | gemini | claude
  
  -- Results
  brand_mentioned BOOLEAN NOT NULL DEFAULT false,
  brand_linked BOOLEAN NOT NULL DEFAULT false,
  mention_context TEXT,        -- The sentence/paragraph where brand appeared
  competitor_mentions TEXT[],  -- Which competitors were mentioned instead
  sources_cited TEXT[],        -- URLs the AI model cited
  full_response TEXT,          -- Complete AI response (for audit)
  
  -- Scoring
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  prominence_score INTEGER CHECK (prominence_score BETWEEN 0 AND 100),
    -- 100 = brand was the top recommendation
    -- 50 = brand was mentioned among several
    -- 0 = brand not mentioned at all
  
  tested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_monitor_prompts_client ON monitor_prompts(client_id, is_active);
CREATE INDEX idx_monitor_results_client ON monitor_results(client_id, tested_at DESC);
CREATE INDEX idx_monitor_results_prompt ON monitor_results(prompt_id, tested_at DESC);
CREATE INDEX idx_monitor_results_model ON monitor_results(ai_model);

-- RLS
ALTER TABLE monitor_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monitor_prompts_agency_isolation" ON monitor_prompts FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "monitor_results_agency_isolation" ON monitor_results FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

### Migration 0006: Credit System (Phase 3)

```sql
-- ============================================
-- MIGRATION 0006: CREDIT-BASED BILLING
-- Every action costs credits. Agencies buy credit packs.
-- Phase 1: All agencies have unlimited credits.
-- Phase 3: Stripe-powered credit purchases.
-- ============================================

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  
  amount INTEGER NOT NULL,    -- positive = add, negative = spend
  reason TEXT NOT NULL,
    -- purchase | serp_scan | thread_enrich | classification |
    -- response_generation | ai_probe | monitor_test | refund | bonus
  
  -- Link to what consumed the credits
  reference_type TEXT,         -- discovery_run | response | monitor_result
  reference_id UUID,
  
  -- Running balance
  balance_after INTEGER NOT NULL,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credit cost constants (stored in app config, not DB)
-- SERP scan (per keyword): 1 credit
-- Thread enrichment: 2 credits
-- AI classification (per thread): 1 credit
-- Response generation (3 variants): 10 credits
-- AI probe query: 5 credits
-- AI monitor test (per model): 3 credits

CREATE INDEX idx_credit_tx_agency ON credit_transactions(agency_id, created_at DESC);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credits_agency_isolation" ON credit_transactions FOR ALL USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
```

---

## Agent Abstraction Layer (Critical for Future-Proofing)

Every execution capability in GrowthForge (discovery, enrichment, classification, response generation, audit pillar scans) MUST be built behind an interface. Today the concrete implementation uses Apify + Claude API. Tomorrow it could be a browser agent, Claude Computer Use, an MCP-connected tool, or something that doesn't exist yet. The platform doesn't care — it receives typed results and stores them.

**This is not optional. Every module must follow this pattern.**

### Agent Interfaces (src/lib/agents/interfaces.ts)

```typescript
// All agent implementations must conform to these interfaces.
// The platform orchestrates agents — it never calls Apify or Claude directly
// outside of an agent implementation.

export interface DiscoveredThread {
  url: string;
  title: string;
  snippet: string;
  position?: number;
  platform: 'reddit' | 'quora' | 'facebook_groups';
  keyword: string;
  keywordId: string;
}

export interface EnrichedThread {
  body_text: string;
  author: string;
  comment_count: number;
  upvote_count: number;
  thread_date: string;
  top_comments: Array<{ author: string; body: string; upvotes: number }>;
}

export interface ClassificationResult {
  intent: 'informational' | 'transactional' | 'commercial' | 'navigational';
  relevance_score: number;
  can_mention_brand: boolean;
  suggested_angle: string;
  tags: string[];
}

export interface GeneratedResponse {
  variant: 'casual' | 'expert' | 'story';
  body_text: string;
  quality_score: number;
  tone_match_score: number;
  mentions_brand: boolean;
  mentions_url: boolean;
}

export interface AuditPillarResult {
  score: number;
  findings: Record<string, unknown>;
  summary: string;
  recommendations: Array<{
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
  }>;
}

// --- Agent interfaces ---

export interface DiscoveryAgent {
  name: string;
  discover(clientId: string, keywords: Array<{ id: string; keyword: string; platforms: string[] }>): Promise<DiscoveredThread[]>;
}

export interface EnrichmentAgent {
  name: string;
  enrich(threadUrl: string, platform: string): Promise<EnrichedThread>;
}

export interface ClassificationAgent {
  name: string;
  classify(thread: { title: string; body_text: string; platform: string }, brandBrief: string): Promise<ClassificationResult>;
}

export interface ResponseAgent {
  name: string;
  generate(thread: Record<string, unknown>, client: Record<string, unknown>): Promise<GeneratedResponse[]>;
}

export interface AuditAgent {
  name: string;
  pillar: string;
  scan(client: Record<string, unknown>, keywords: Array<Record<string, unknown>>): Promise<AuditPillarResult>;
}
```

### Concrete Implementations (Today)

```
src/lib/agents/
├── interfaces.ts                 # Agent interfaces (above)
├── discovery/
│   ├── apify-serp.agent.ts       # Today: Apify google-search-scraper
│   └── perplexity-probe.agent.ts # Today: Perplexity API for AI probing
├── enrichment/
│   └── apify-reddit.agent.ts     # Today: Apify reddit-scraper
├── classification/
│   └── claude-sonnet.agent.ts    # Today: Claude Sonnet batch classification
├── response/
│   └── claude-opus.agent.ts      # Today: Claude Opus 3-variant generation
├── audit/
│   ├── citation-scan.agent.ts    # Today: SERP scan + brand mention check
│   ├── ai-presence.agent.ts      # Today: Multi-model prompt testing
│   ├── entity-check.agent.ts     # Today: Apify web scraping + Claude analysis
│   ├── review-scan.agent.ts      # Today: Apify review site scraping
│   └── press-scan.agent.ts       # Today: Google News + web search
└── registry.ts                   # Maps agent type → active implementation
```

### Agent Registry (src/lib/agents/registry.ts)

```typescript
// Central registry that maps each capability to its current implementation.
// To swap an agent, change the registration — no other code changes needed.

import { ApifySerpAgent } from './discovery/apify-serp.agent';
import { PerplexityProbeAgent } from './discovery/perplexity-probe.agent';
import { ApifyRedditAgent } from './enrichment/apify-reddit.agent';
import { ClaudeSonnetClassifier } from './classification/claude-sonnet.agent';
import { ClaudeOpusResponder } from './response/claude-opus.agent';

export const agents = {
  discovery: new ApifySerpAgent(),
  aiProbe: new PerplexityProbeAgent(),
  enrichment: new ApifyRedditAgent(),
  classification: new ClaudeSonnetClassifier(),
  response: new ClaudeOpusResponder(),
} as const;

// Usage in Inngest jobs or API routes:
// const threads = await agents.discovery.discover(clientId, keywords);
// const enriched = await agents.enrichment.enrich(threadUrl, 'reddit');
// const responses = await agents.response.generate(thread, client);
```

### Human-in-the-Loop Gates

Every agent action that has real-world consequences MUST pass through an approval queue before execution. This is both a safety mechanism and a quality differentiator.

**Gate points (always require human approval):**
- Response posting (copy-paste by human — never auto-post)
- Press release publication
- Directory listing updates (Entity Sync module)
- Review request campaigns

**No gate required (automated):**
- Thread discovery and enrichment
- AI classification and scoring
- Audit scans
- AI monitoring/prompt testing
- Report generation

The approval status is tracked on each output record (responses.status, press_campaigns.status, etc.). The thread queue and response panel are the primary approval interfaces.

---

## Core Engine Specifications

### Discovery Pipeline (src/lib/discovery/)

The discovery pipeline runs as a scheduled batch job via Inngest. It does NOT run in real-time. The flow is:

```
Cron trigger (2x/week per client)
  → Step 1: SERP scan (Apify google-search-scraper)
  → Step 2: AI probing (Perplexity + OpenAI)
  → Step 3: Dedup against existing threads
  → Step 4: Thread enrichment (Apify reddit-scraper)
  → Step 5: AI classification (Claude Sonnet batch)
  → Step 6: Opportunity scoring
  → Done → Threads appear in queue with status='classified'
```

#### SERP Scanner (src/lib/discovery/serp-scanner.ts)

```typescript
// Input: Array of keywords for a client
// Output: Array of discovered thread URLs with SERP metadata
// Method: Apify google-search-scraper actor

interface SerpScanInput {
  clientId: string;
  keywords: Array<{
    id: string;
    keyword: string;
    platforms: string[]; // ['reddit', 'quora', 'facebook_groups']
  }>;
}

interface SerpResult {
  url: string;
  title: string;
  snippet: string;
  position: number;
  keyword: string;
  keywordId: string;
  platform: 'reddit' | 'quora' | 'facebook_groups';
}

// For each keyword, generate search queries:
// - "site:reddit.com {keyword}"
// - "{keyword} reddit"
// - "site:quora.com {keyword}"
// - "{keyword} facebook group"
// Max 2 pages per query, 10 results per page.
// Parse results to extract platform, subreddit/group name, thread URL.
// Filter out non-thread URLs (subreddit homepages, user profiles, etc.)

// Rate limiting: Max 100 queries per Apify run.
// For clients with 100 keywords, this means 400 queries — split into 4 actor runs.

// Error handling:
// - If Apify actor fails, log to discovery_runs with error, retry once after 30 min
// - If individual query returns 0 results, skip (not an error)
// - Timeout: 10 minutes per actor run
```

#### AI Prober (src/lib/discovery/ai-prober.ts)

```typescript
// Input: Client's top 20 keywords + brand brief
// Output: Thread URLs that AI models cite when asked about the topic
// Method: Perplexity API (primary) + OpenAI API (secondary)

// Perplexity is ideal because it returns source URLs in the response.
// For each keyword, generate a buying-intent question:
// "What are the best {keyword} options?"
// "Can anyone recommend a good {keyword} service?"
// "I need help with {keyword} — what do people suggest?"

// Parse response for Reddit, Quora, and Facebook Group URLs.
// Store with discovered_via = 'ai_probe_perplexity' or 'ai_probe_chatgpt'

// IMPORTANT: This is NOT about checking if the client's brand is mentioned.
// That's the AI Monitor module. This is about finding THREADS that AI models
// already reference, so we can place the client's brand IN those threads.

// Rate limiting: 
// - Perplexity: 20 requests/minute (sonar-pro)
// - OpenAI: Standard rate limits
// - Run top 20 keywords per client per week
```

#### Thread Enricher (src/lib/discovery/thread-enricher.ts)

```typescript
// Input: Array of thread URLs to enrich
// Output: Full thread content (body, comments, metadata)
// Method: Apify actors per platform

// Reddit: Use apify/reddit-scraper
//   - Fetch full post body, top 15 comments (2 levels deep), sorted by top
//   - Extract: title, body, author, upvotes, comment_count, subreddit, date
//   - Store top_comments as JSONB array

// Quora: Use apify/quora-scraper or custom actor
//   - Fetch question body, top 10 answers
//   - Extract: question, answer bodies, author names, upvotes

// Facebook Groups: Use custom Apify actor
//   - Fetch post content, top comments
//   - Note: FB scraping is fragile — handle failures gracefully

// After enrichment, update thread:
//   status = 'enriching' → 'classified' (after classification runs)
//   is_enriched = true
//   enriched_at = now()

// Error handling:
// - Thread deleted/locked: Set status = 'expired', log error
// - Rate limited: Retry with exponential backoff (max 3 retries)
// - Actor timeout: Mark enrichment_error, skip and continue
```

#### Deduplication (src/lib/discovery/dedup.ts)

```typescript
// Content hash: SHA256 of normalized(lowercase(title) + url_without_params)
// Check against existing threads table before inserting.
// If hash exists for this client: skip (already discovered)
// If hash exists for different client: create new thread (different client = different opportunity)

import { createHash } from 'crypto';

export function generateContentHash(title: string, url: string): string {
  const normalized = `${title.toLowerCase().trim()}|${stripQueryParams(url).toLowerCase()}`;
  return createHash('sha256').update(normalized).digest('hex');
}
```

#### Opportunity Scoring (src/lib/discovery/scoring.ts)

```typescript
// Composite score combining multiple signals:
// opportunity_score = (
//   relevance_score * 0.35 +
//   google_authority * 0.25 +
//   recency_score * 0.20 +
//   engagement_score * 0.20
// )

// google_authority: inverse of google_position (position 1 = 100, position 10 = 50, position 50 = 10)
// recency_score: threads < 7 days = 100, < 30 days = 80, < 90 days = 50, < 1 year = 30, older = 10
// engagement_score: based on comment_count (0-5 = 20, 5-20 = 50, 20-100 = 75, 100+ = 100)

// Threads with opportunity_score >= 70 auto-advance to status='queued'
// Threads with opportunity_score 40-69 stay as status='classified' for manual review
// Threads with opportunity_score < 40 are auto-skipped
```

### Response Generation (src/lib/ai/generate-responses.ts)

This is the most critical code in the entire system. Response quality is the entire value proposition.

```typescript
// Input: Thread (enriched) + Client (with brand brief)
// Output: 3 response variants (casual, expert, story)
// Model: Claude Opus 4 (claude-opus-4-20250514) — do NOT use Sonnet for this

interface GenerateResponsesInput {
  thread: Thread;       // Full thread with body_text and top_comments
  client: Client;       // Full client with brand_brief, tone_guidelines, etc.
}

interface GeneratedResponse {
  variant: 'casual' | 'expert' | 'story';
  body_text: string;
  quality_score: number;
  tone_match_score: number;
  mentions_brand: boolean;
  mentions_url: boolean;
}

// The system prompt is the key to quality. See src/lib/ai/prompts/ for full prompts.
// Each variant gets its own tailored prompt section.
```

#### Response Generation System Prompt

```
You are an expert at writing authentic, community-native responses for Reddit, 
Quora, and Facebook Group discussions. Your responses must be indistinguishable 
from a real community member who genuinely uses and recommends the brand.

## ABSOLUTE RULES (never break these)

1. NEVER start with "Great question!", "I totally agree!", "This is a great topic!"
   or any generic opener. Start with substance.
2. NEVER mention the brand name in the first sentence. Earn the mention.
3. NEVER use marketing language: "game-changer", "revolutionary", "best-in-class",
   "cutting-edge", "seamless", "robust", "leverage".
4. NEVER position yourself as the company. You are a USER who has experience with them.
5. NEVER include a URL unless the thread explicitly asks for recommendations with links.
6. ALWAYS reference specific details from the thread (OP's situation, other comments).
7. ALWAYS provide genuine value BEFORE mentioning the brand.
8. MATCH the platform's culture:
   - Reddit: Casual, can swear lightly, self-deprecating humor OK, 
     markdown formatting, "edit: typo" is natural
   - Quora: More formal, structured, expertise-signaling, longer answers OK
   - Facebook Groups: Conversational, supportive, emoji OK but not excessive
9. For threads older than 30 days, acknowledge lateness: "Late to this thread but..."
10. Occasionally mention a competitor positively (credibility through balance).
11. Imperfect formatting is GOOD on Reddit. Don't be too polished.
12. Length: Reddit = 2-4 paragraphs. Quora = 3-5 paragraphs. FB = 1-3 paragraphs.

## CLIENT CONTEXT (injected per-client)

Brand: {client.name}
What they do: {client.brand_brief}
Differentiator: {client.key_differentiators}
Target audience: {client.target_audience}
Tone: {client.tone_guidelines}
URL (use sparingly): {client.urls_to_mention[0]}
Special rules: {client.response_rules}

## THREAD CONTEXT (injected per-thread)

Platform: {thread.platform}
Community: {thread.subreddit || thread.group_name}
Title: {thread.title}
Post body: {thread.body_text}
Top comments: {thread.top_comments}
Thread date: {thread.thread_date}
AI's suggested angle: {thread.suggested_angle}

## GENERATE THREE VARIANTS

### Variant 1: Casual Helper
Write as someone who stumbled across this thread and has personal experience.
Short, punchy, conversational. Mentions the brand as "I've been using X" or 
"a friend put me onto X". Feels like a quick helpful reply between meetings.

### Variant 2: Expert Authority  
Write as someone with deep domain knowledge. Leads with substantial advice —
enough that the response would be helpful even WITHOUT the brand mention.
Positions the brand as one option among several. Structured, thorough, credible.
This variant should have the highest quality_score.

### Variant 3: Story-Based
Write as someone sharing a personal experience that involves the brand.
"I was in the exact same boat as you..." format. The brand mention feels
incidental to the story, not the point of it. Emotionally engaging.

## OUTPUT FORMAT

Return valid JSON:
{
  "variants": [
    {
      "variant": "casual",
      "body_text": "the full response text ready to paste",
      "quality_score": 0-100,
      "tone_match_score": 0-100,
      "mentions_brand": true/false,
      "mentions_url": true/false
    },
    // ... expert and story variants
  ]
}
```

### Classification Pipeline (src/lib/ai/classify.ts)

```typescript
// Model: Claude Sonnet 4 (fast, cheap, accurate for classification)
// Batch size: Up to 20 threads per API call
// Process: Send thread title + body + client brand brief → get classification

// Prompt outputs per thread:
// {
//   "intent": "informational|transactional|commercial|navigational",
//   "relevance_score": 0-100,
//   "can_mention_brand": true/false,
//   "suggested_angle": "brief description",
//   "tags": ["tag1", "tag2"]
// }

// After classification, the opportunity_score is calculated by scoring.ts
// and the thread status advances to 'classified' or 'queued'.
```

---

## Background Jobs (Inngest)

```typescript
// src/lib/inngest/functions.ts

// Job: discovery.scan
// Trigger: Cron (6am UTC Tue/Fri) OR manual trigger from dashboard
// Steps:
//   1. Get all active clients for the agency
//   2. For each client, get active keywords
//   3. Run SERP scanner (Apify) — wait for actor completion
//   4. Run AI prober (Perplexity + OpenAI) — parallel
//   5. Dedup results against existing threads
//   6. Insert new threads with status='new'
//   7. Trigger enrichment job

// Job: discovery.enrich
// Trigger: After discovery.scan completes
// Steps:
//   1. Get all threads with status='new' and is_enriched=false
//   2. Batch by platform (Reddit threads together, Quora together)
//   3. Run platform-specific Apify actors
//   4. Update threads with enriched content
//   5. Trigger classification job

// Job: discovery.classify
// Trigger: After discovery.enrich completes
// Steps:
//   1. Get all enriched threads without classification
//   2. Batch into groups of 20
//   3. Run Claude Sonnet classification
//   4. Calculate opportunity scores
//   5. Update thread statuses (queued / classified / skipped)

// Job: responses.generate
// Trigger: User clicks "Generate Replies" in dashboard
// Steps:
//   1. Set thread status = 'generating'
//   2. Fetch full thread + client data
//   3. Call Claude Opus with response generation prompt
//   4. Parse 3 variants from JSON response
//   5. Insert into responses table
//   6. Set thread status = 'responded'
//   7. Deduct credits (10 credits)

// Job: monitor.test (Phase 2)
// Trigger: Cron (weekly) OR manual trigger
// Steps:
//   1. Get all active monitor_prompts for client
//   2. For each prompt × model combination:
//      a. Call AI model API
//      b. Parse response for brand mentions + source URLs
//      c. Score prominence
//      d. Insert into monitor_results
//   3. Deduct credits (3 per test)
```

---

## API Routes

### Cron: Discovery (/api/cron/discovery)

```typescript
// Vercel Cron config in vercel.json:
// { "path": "/api/cron/discovery", "schedule": "0 6 * * 2,5" }

// Security: Verify CRON_SECRET header
// Process:
//   1. Get all agencies with active plans
//   2. For each agency, get active clients
//   3. Queue Inngest job: discovery.scan per client
//   4. Return 200 with job count
```

### Generate Responses (/api/responses/generate)

```typescript
// Method: POST
// Body: { threadId: string }
// Auth: Required (member+ role)
// 
// Process:
//   1. Validate thread exists and belongs to user's agency
//   2. Check credits balance (10 credits required)
//   3. Queue Inngest job: responses.generate
//   4. Return 202 Accepted with job ID
//
// The frontend polls the thread status until it changes to 'responded',
// then fetches the generated responses.
```

### Manual Discovery Scan (/api/discovery/scan)

```typescript
// Method: POST
// Body: { clientId: string, keywordIds?: string[] }
// Auth: Required (member+ role)
//
// Triggers an immediate discovery scan for specified client.
// If keywordIds provided, only scans those keywords.
// Otherwise scans all active keywords.
```

---

## UI Component Specifications

### Thread Queue Page (Primary Working Screen)

This is the screen operators spend 90% of their time on. It must be fast, scannable, and efficient.

```
Layout:
┌─────────────────────────────────────────────────────────┐
│ Header: "Citation Engine" + Client Selector dropdown     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Filter Bar:                                          │ │
│ │ [Platform ▾] [Intent ▾] [Relevance: 50-100]         │ │
│ │ [Status ▾] [Date range] [Search...]   [Run Scan ▶]  │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Stats Bar: 142 threads | 38 queued | 12 responded   │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Thread Table (sortable, paginated, 25 per page)      │ │
│ │                                                       │ │
│ │ ☐ Platform | Community | Title | KW | Pos | Intent   │ │
│ │   | Relevance | Comments | Date | Status | Actions   │ │
│ │                                                       │ │
│ │ ☐ 🟠Reddit r/music.. | "Best playlist..." | spotify  │ │
│ │   | #3 | 🟢info | ████░ 82 | 💬47 | 3d | queued     │ │
│ │   | [Generate ▶] [View ↗] [Skip ✕]                   │ │
│ │                                                       │ │
│ │ ... more rows ...                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── Slide-out Panel (when Generate clicked) ──────────┐│
│ │ Thread: "Best playlist promotion services 2026"       ││
│ │ r/WeAreTheMusicMakers · 47 comments · 3 days ago      ││
│ │                                                        ││
│ │ [Casual] [Expert] [Story]  ← tab selector              ││
│ │                                                        ││
│ │ ┌──────────────────────────────────────────────┐      ││
│ │ │ "Honestly been down this rabbit hole myself..." │   ││
│ │ │ ... full response text ...                      │   ││
│ │ │                                                  │   ││
│ │ │ Quality: 87/100 · Tone: 92/100                   │   ││
│ │ │ ✓ Mentions brand · ✕ No URL                      │   ││
│ │ └──────────────────────────────────────────────┘      ││
│ │                                                        ││
│ │ [📋 Copy] [✏️ Edit] [✓ Mark Posted] [✕ Reject]        ││
│ └────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### Client Selector

Global dropdown in the header. Persisted in URL params AND localStorage.
All data on every page filters by the selected client.
Agency-level views (team, settings, billing) show when "All Clients" is selected.

### Dashboard Overview Page

```
Stats Cards (4-up grid):
- Threads Discovered (this month)
- Responses Generated (this month)  
- Responses Posted (this month)
- Share of Model trend (Phase 2, placeholder for Phase 1)

Activity Feed:
- Recent discovery runs with thread counts
- Recent response generations
- Recent postings

Module Status:
- Citation Engine: ● Active (last scan: 2h ago)
- PressForge: ○ Coming soon
- AI Monitor: ○ Coming soon
- Entity Sync: ○ Coming soon
- Review Engine: ○ Coming soon
```

---

## Error Handling Patterns

```typescript
// src/lib/utils/errors.ts

// All errors extend a base GrowthForgeError
export class GrowthForgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export class InsufficientCreditsError extends GrowthForgeError {
  constructor(required: number, available: number) {
    super(
      `Insufficient credits: ${required} required, ${available} available`,
      'INSUFFICIENT_CREDITS',
      402,
      { required, available }
    );
  }
}

export class ApifyActorError extends GrowthForgeError { ... }
export class AIGenerationError extends GrowthForgeError { ... }
export class RateLimitError extends GrowthForgeError { ... }
```

```typescript
// src/lib/utils/retry.ts

// Exponential backoff with jitter for all external API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;       // default: 3
    baseDelayMs?: number;      // default: 1000
    maxDelayMs?: number;       // default: 30000
    retryableErrors?: string[]; // error codes to retry on
  }
): Promise<T> { ... }

// Usage:
// const result = await withRetry(() => apifyClient.runActor(actorId, input), {
//   maxRetries: 3,
//   retryableErrors: ['RATE_LIMIT', 'TIMEOUT']
// });
```

---

## Environment Variables

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...

# Scraping
APIFY_API_TOKEN=apify_api_...

# Background Jobs
INNGEST_SIGNING_KEY=signkey-...
INNGEST_EVENT_KEY=...

# Email
RESEND_API_KEY=re_...

# Payments (Phase 3)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Cron Security
CRON_SECRET=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Build Phases & Priority

### Phase 1: Citation Engine MVP (Weeks 1-4)

**Week 1: Foundation**
- Next.js 14 project setup with TypeScript strict mode
- Supabase project + migrations 0001-0004
- Supabase Auth with magic link
- Dashboard layout shell (sidebar, header, client selector)
- Client CRUD (add, edit, delete brands with brand briefs)
- Keyword management (add, import, tag, activate/deactivate)
- Seed data: Xpand Digital agency + RUN, Foyle Legal, ClaimArchitect clients

**Week 2: Discovery Engine**
- Apify client wrapper with retry logic
- SERP scanner using google-search-scraper actor
- AI prober using Perplexity API
- Content hash deduplication
- Thread enrichment using reddit-scraper actor
- Discovery run logging
- Inngest job: discovery.scan → enrich → classify pipeline
- Vercel Cron configuration

**Week 3: AI Processing + Response Generation**
- Claude Sonnet classification pipeline (batch processing)
- Opportunity scoring algorithm
- Claude Opus response generation (3 variants)
- Thread queue page with filters and sorting
- Response slide-out panel with tab switching
- Copy-to-clipboard with visual feedback
- Response status management (approve, reject, mark posted)

**Week 4: Polish + Ship**
- Dashboard overview with stats cards
- Discovery run history page
- Bulk actions (skip multiple threads, bulk generate)
- Thread search (full-text search across titles)
- Loading states, empty states, error states
- Mobile-responsive sidebar (collapse to icons)
- Deploy to Vercel, connect custom domain
- Test with live data: RUN Music keywords

### Phase 2: AI Monitor + PressForge Integration (Weeks 5-8)
- Migration 0005 (monitor tables)
- Monitor prompt management UI
- AI model testing pipeline (ChatGPT, Perplexity, Gemini)
- Share of Model tracking dashboard
- PressForge module stub (press campaign management)
- Client portal (viewer role with read-only access)
- Email notifications (new responses ready, weekly digest)

### Phase 3: SaaS Launch (Weeks 9-14)
- Migration 0006 (billing tables)
- Stripe integration (credit packs, subscriptions)
- Self-serve agency onboarding flow
- Agency plan management (starter/growth/agency_pro)
- Credit consumption tracking + usage dashboard
- Entity Sync module (directory audit, consistency scoring)
- Review Engine module (UGC campaign management)
- Marketing site (growthforge.io or similar)
- API documentation for advanced users

---

## Design System

### Visual Direction

GrowthForge should feel like a premium agency tool — not a consumer SaaS. Think Linear meets Vercel Dashboard. Dark-mode-first, minimal chrome, data-dense tables, generous whitespace around controls.

### Colors

```css
/* Brand */
--gf-primary: #6C5CE7;        /* Purple — primary actions */
--gf-primary-hover: #5A4BD1;
--gf-accent: #00D2D3;          /* Teal — positive/success indicators */

/* Platform badges */
--gf-reddit: #FF4500;
--gf-quora: #B92B27;
--gf-facebook: #1877F2;

/* Intent tags */
--gf-informational: #3B82F6;   /* Blue */
--gf-transactional: #10B981;   /* Green */
--gf-commercial: #F59E0B;      /* Amber */
--gf-navigational: #8B5CF6;    /* Purple */

/* Relevance score gradient */
--gf-score-low: #EF4444;       /* Red: 0-30 */
--gf-score-mid: #F59E0B;       /* Amber: 31-60 */
--gf-score-high: #10B981;      /* Green: 61-100 */
```

### Typography

Use the system font stack (no external fonts for dashboard):
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

Code/monospace (for URLs, thread IDs):
```css
font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
```

---

## Testing Strategy

### Unit Tests (Vitest)
- `dedup.ts` — content hash generation and collision handling
- `scoring.ts` — opportunity score calculation edge cases
- `hash.ts` — URL normalization
- `validators.ts` — Zod schema validation
- `classify.ts` — prompt construction (mock AI responses)

### Integration Tests (Vitest + Supabase local)
- Discovery pipeline end-to-end (mock Apify responses)
- Response generation (mock Claude API)
- Credit deduction on generation
- RLS policy verification (agency A can't see agency B's data)

### E2E Tests (Playwright)
- Client creation → keyword add → discovery trigger → thread appears
- Thread queue filtering and sorting
- Response generation → copy to clipboard → mark as posted
- Team member invitation and role-based access

---

## Security Checklist

- [ ] All API routes verify auth via Supabase middleware
- [ ] RLS enabled on ALL tables (no exceptions)
- [ ] Service role key NEVER exposed to client
- [ ] CRON_SECRET verified on all cron endpoints
- [ ] Apify webhook signature verified
- [ ] Stripe webhook signature verified (Phase 3)
- [ ] Rate limiting on response generation (max 10/min per agency)
- [ ] Input validation via Zod on all API inputs
- [ ] Content sanitization on all user-generated text (brand briefs, response edits)
- [ ] No PII stored in threads or responses (only public Reddit/Quora content)

---

## Performance Targets

- Thread queue page: < 200ms initial load (paginated, 25 rows)
- Response generation: < 30 seconds (Claude Opus, streaming)
- Discovery scan: < 15 minutes per client (including enrichment)
- Dashboard overview: < 500ms (aggregate queries with materialized views if needed)
- Supabase real-time: Thread status updates push to UI immediately

---

## Notes for Claude Code

1. **Start with migrations.** Run all SQL migrations first, verify tables exist.
2. **Seed data matters.** Create Xpand Digital agency, Joel as platform_admin, and 3 test clients (RUN Music, Foyle Legal, ClaimArchitect) with realistic brand briefs.
3. **Build the thread queue UI EARLY.** This is the core UX — iterate on it.
4. **Mock external APIs during development.** Create mock Apify responses and mock Claude API responses so the pipeline can be tested without burning credits.
5. **The Apify MCP server is available.** Use it to test actor integrations directly.
6. **Response quality is everything.** Spend extra time on prompt engineering for the response generator. Test with real Reddit threads and compare output quality.
7. **Dark mode first.** The dashboard should look great in dark mode by default. Light mode is secondary.
8. **Use Inngest for all async work.** Never do long-running operations in API routes. Queue everything through Inngest.
# CLAUDE.md Addition — Audit Module

## Append to: Database Schema (after Migration 0006)

### Migration 0007: AI Visibility Audit

```sql
-- ============================================
-- MIGRATION 0007: AI VISIBILITY AUDIT
-- Runs across all 5 pillars to establish a baseline score.
-- Can be re-run monthly to track progress.
-- ============================================

CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Audit metadata
  audit_type TEXT NOT NULL DEFAULT 'full' CHECK (
    audit_type IN ('full', 'citation_only', 'ai_presence_only', 'quick')
    -- full: All 5 pillars (onboarding audit)
    -- citation_only: Just citation + AI presence (quick check)
    -- ai_presence_only: Just AI model testing
    -- quick: Citation + AI presence + entity (skip reviews + press)
  ),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  
  -- Composite score (calculated after all pillars complete)
  -- Weighted average: citations 25%, ai_presence 30%, entities 15%, reviews 15%, press 15%
  composite_score INTEGER CHECK (composite_score BETWEEN 0 AND 100),
  
  -- Individual pillar scores (denormalized for fast dashboard reads)
  citation_score INTEGER CHECK (citation_score BETWEEN 0 AND 100),
  ai_presence_score INTEGER CHECK (ai_presence_score BETWEEN 0 AND 100),
  entity_score INTEGER CHECK (entity_score BETWEEN 0 AND 100),
  review_score INTEGER CHECK (review_score BETWEEN 0 AND 100),
  press_score INTEGER CHECK (press_score BETWEEN 0 AND 100),
  
  -- AI-generated executive summary
  -- Claude synthesizes all pillar data into 3-4 paragraph narrative
  executive_summary TEXT,
  
  -- AI-generated prioritized action plan
  -- JSON array of recommended actions, ranked by impact
  -- [{ "priority": 1, "pillar": "ai_presence", "action": "...", "impact": "high", "effort": "low" }]
  action_plan JSONB DEFAULT '[]',
  
  -- Competitor comparison (optional — if competitor URLs provided)
  competitors_analyzed TEXT[] DEFAULT '{}',
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  credits_used INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Detailed results per pillar (the raw data behind each score)
CREATE TABLE audit_pillar_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  
  pillar TEXT NOT NULL CHECK (
    pillar IN ('citations', 'ai_presence', 'entities', 'reviews', 'press')
  ),
  
  -- Pillar-level score
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  
  -- Status of this specific pillar scan
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'skipped')
  ),
  
  -- Raw findings — structure varies by pillar type
  -- See pillar-specific schemas below
  findings JSONB NOT NULL DEFAULT '{}',
  
  -- AI-generated pillar summary (2-3 sentences)
  summary TEXT,
  
  -- AI-generated recommendations for this pillar
  -- [{ "action": "...", "impact": "high|medium|low", "effort": "high|medium|low" }]
  recommendations JSONB DEFAULT '[]',
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(audit_id, pillar)
);

-- Indexes
CREATE INDEX idx_audits_client ON audits(client_id, created_at DESC);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audit_pillars_audit ON audit_pillar_results(audit_id);

-- RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_pillar_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audits_agency_isolation" ON audits FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "audit_pillars_agency_isolation" ON audit_pillar_results FOR ALL USING (
  audit_id IN (
    SELECT a.id FROM audits a
    JOIN clients c ON c.id = a.client_id
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

### Migration 0008: Agent Action Log

```sql
-- ============================================
-- MIGRATION 0008: AGENT ACTION LOG
-- Every action taken by any agent (discovery, enrichment,
-- classification, generation, audit) is logged here.
-- Provides full observability and audit trail.
-- Critical for debugging, cost tracking, and future agent swaps.
-- ============================================

CREATE TABLE agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- What agent ran
  agent_type TEXT NOT NULL,
    -- discovery | enrichment | classification | response | audit_citation |
    -- audit_ai_presence | audit_entity | audit_review | audit_press | monitor
  agent_name TEXT NOT NULL,
    -- e.g. 'ApifySerpAgent', 'ClaudeOpusResponder', 'PerplexityProbeAgent'
    -- This tracks WHICH implementation ran, so when you swap agents you can
    -- compare performance between old and new.
  
  -- What triggered it
  trigger TEXT NOT NULL,
    -- cron | manual | inngest_job | audit | onboarding
  trigger_reference_id UUID,  -- inngest job ID, audit ID, etc.
  
  -- What it operated on
  target_type TEXT,            -- thread | client | keyword | audit | monitor_prompt
  target_id UUID,
  
  -- Results
  status TEXT NOT NULL DEFAULT 'started' CHECK (
    status IN ('started', 'completed', 'failed', 'timeout')
  ),
  items_processed INTEGER DEFAULT 0,
  items_produced INTEGER DEFAULT 0,
  credits_consumed INTEGER DEFAULT 0,
  
  -- Performance tracking
  duration_ms INTEGER,         -- How long the action took
  cost_usd NUMERIC(10,6),     -- Estimated API cost (for optimization)
  
  -- Error info
  error_code TEXT,
  error_message TEXT,
  
  -- Full input/output for debugging (JSONB, can be large)
  -- Truncate or omit in production if storage becomes an issue
  input_summary JSONB DEFAULT '{}',   -- Key params, not full payloads
  output_summary JSONB DEFAULT '{}',  -- Key results, not full responses
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_agent_actions_agency ON agent_actions(agency_id, created_at DESC);
CREATE INDEX idx_agent_actions_client ON agent_actions(client_id, created_at DESC);
CREATE INDEX idx_agent_actions_type ON agent_actions(agent_type, created_at DESC);
CREATE INDEX idx_agent_actions_status ON agent_actions(status) WHERE status = 'failed';

-- RLS
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_actions_agency_isolation" ON agent_actions FOR ALL USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
```

### Agent Action Logger (src/lib/agents/logger.ts)

```typescript
// Every agent call MUST be wrapped with the action logger.
// This provides full observability into what ran, when, how long it took,
// and whether it succeeded or failed.

export async function logAgentAction<T>(
  params: {
    agencyId: string;
    clientId?: string;
    agentType: string;
    agentName: string;
    trigger: string;
    triggerReferenceId?: string;
    targetType?: string;
    targetId?: string;
    inputSummary?: Record<string, unknown>;
  },
  fn: () => Promise<T>
): Promise<T> {
  const actionId = await createAction(params);  // INSERT with status='started'
  const startTime = Date.now();
  
  try {
    const result = await fn();
    await completeAction(actionId, {
      status: 'completed',
      durationMs: Date.now() - startTime,
      outputSummary: summarizeOutput(result),
    });
    return result;
  } catch (error) {
    await completeAction(actionId, {
      status: 'failed',
      durationMs: Date.now() - startTime,
      errorCode: error.code,
      errorMessage: error.message,
    });
    throw error;
  }
}

// Usage in Inngest jobs:
// const threads = await logAgentAction({
//   agencyId, clientId, agentType: 'discovery', agentName: agents.discovery.name,
//   trigger: 'cron', inputSummary: { keywordCount: keywords.length }
// }, () => agents.discovery.discover(clientId, keywords));
```

---

## Audit Pillar Specifications

### Pillar 1: Citation Audit

**What it does:** Discovers how many high-authority threads exist for the client's keywords, and whether the client is already mentioned in them.

**Data sources:** Google SERPs (via Apify), Reddit/Quora/FB thread content

**Process:**
1. Run SERP scan for top 20 client keywords (same as discovery pipeline)
2. For each discovered thread, search the content for:
   - Client brand name (exact + fuzzy match)
   - Client URL (any of urls_to_mention)
   - Top 3 competitor names (if provided)
3. Classify threads by whether client is present, absent, or competitor is present

**Findings JSONB schema:**
```json
{
  "total_threads_found": 142,
  "threads_with_client_mention": 3,
  "threads_with_competitor_mention": 47,
  "threads_with_no_mentions": 92,
  "platform_breakdown": {
    "reddit": { "total": 89, "client_present": 2, "competitor_present": 31 },
    "quora": { "total": 38, "client_present": 1, "competitor_present": 12 },
    "facebook_groups": { "total": 15, "client_present": 0, "competitor_present": 4 }
  },
  "top_opportunities": [
    {
      "url": "https://reddit.com/r/...",
      "title": "Best playlist promotion services?",
      "google_position": 3,
      "relevance_score": 92,
      "comment_count": 47,
      "competitor_mentioned": "DistroKid",
      "client_mentioned": false
    }
  ],
  "competitor_share": {
    "DistroKid": 23,
    "TuneCore": 14,
    "CD Baby": 10
  },
  "gap_percentage": 97.9
}
```

**Scoring formula:**
```
citation_score = (
  (threads_with_client_mention / total_threads_found) * 40 +
  (1 - competitor_dominance_ratio) * 30 +
  opportunity_density * 30
)
// Where opportunity_density = threads with relevance > 70 / total threads
// A client with 0 mentions in 142 threads scores ~15-25 (lots of opportunity)
// A client dominating their threads scores 80-95
```

---

### Pillar 2: AI Presence Audit

**What it does:** Tests whether AI models mention the client when asked buying-intent questions about their category.

**Data sources:** ChatGPT API, Perplexity API, Gemini API, Claude API

**Process:**
1. Generate 10 buying-intent prompts from client keywords:
   - "What are the best {keyword} services?"
   - "Can you recommend a {keyword} provider?"
   - "I need help with {keyword} — what are my options?"
   - "Compare the top {keyword} companies"
   - "{keyword} alternatives to {competitor}"
2. Send each prompt to 4 AI models
3. Parse each response for:
   - Brand name mention (exact match)
   - Brand URL citation (link present)
   - Brand recommendation (mentioned as a recommendation vs just listed)
   - Competitor mentions
   - Sentiment of mention (positive/neutral/negative)

**Findings JSONB schema:**
```json
{
  "prompts_tested": 10,
  "models_tested": ["chatgpt", "perplexity", "gemini", "claude"],
  "total_tests": 40,
  "brand_mentioned_count": 2,
  "brand_linked_count": 0,
  "brand_recommended_count": 1,
  "share_of_model": {
    "chatgpt": { "mentioned": 1, "total": 10, "percentage": 10 },
    "perplexity": { "mentioned": 1, "total": 10, "percentage": 10 },
    "gemini": { "mentioned": 0, "total": 10, "percentage": 0 },
    "claude": { "mentioned": 0, "total": 10, "percentage": 0 }
  },
  "competitor_share_of_model": {
    "DistroKid": { "mentioned": 28, "total": 40, "percentage": 70 },
    "TuneCore": { "mentioned": 22, "total": 40, "percentage": 55 },
    "CD Baby": { "mentioned": 18, "total": 40, "percentage": 45 }
  },
  "sample_mentions": [
    {
      "model": "perplexity",
      "prompt": "Best music licensing services for independent artists",
      "mention_context": "RUN Music offers transparent short-term financing...",
      "sentiment": "positive",
      "sources_cited": ["reddit.com/r/...", "musicbusinessworldwide.com/..."]
    }
  ]
}
```

**Scoring formula:**
```
ai_presence_score = (
  overall_mention_rate * 50 +         // % of tests where brand appeared
  recommendation_rate * 30 +           // % where brand was recommended (not just listed)
  link_citation_rate * 20              // % where brand URL was cited
)
// A brand mentioned in 0/40 tests scores 0
// A brand mentioned in 5/40 tests scores ~15
// A brand mentioned in 20/40 and recommended in 10 scores ~55
// Market leader mentioned in 35/40 and recommended in 25 scores ~85
```

---

### Pillar 3: Entity Audit

**What it does:** Checks whether the client's brand identity is consistent and well-represented across key platforms that AI models reference.

**Data sources:** Google search (brand name), Apify web scraping, client's website

**Process:**
1. Search Google for "{brand name}" and collect the top 20 results
2. Identify which platforms the brand appears on:
   - Google Business Profile
   - LinkedIn company page
   - Crunchbase
   - Wikipedia / Wikidata
   - Industry directories (varies by vertical)
   - Social profiles (Twitter/X, Facebook, Instagram)
3. For each platform found, extract the brand description
4. Check client's website for schema markup (Organization, LocalBusiness, Product)
5. Use Claude to compare all descriptions for consistency:
   - Same business category?
   - Same value proposition?
   - Same contact info?
   - Same founding date / location?
   - Conflicting or outdated information?

**Findings JSONB schema:**
```json
{
  "platforms_checked": 12,
  "platforms_present": 7,
  "platforms_missing": ["crunchbase", "wikipedia", "g2", "capterra", "trustpilot"],
  "platform_details": {
    "google_business": { "present": true, "description_match": 85, "info_complete": true },
    "linkedin": { "present": true, "description_match": 72, "info_complete": false, "missing": ["website_url"] },
    "website_schema": { "has_organization_schema": true, "has_product_schema": false, "has_faq_schema": false }
  },
  "consistency_score": 71,
  "inconsistencies": [
    { "field": "business_description", "platforms": ["linkedin", "google_business"], "issue": "LinkedIn says 'music distribution' while Google says 'music licensing'" },
    { "field": "founding_year", "platforms": ["crunchbase", "website"], "issue": "Crunchbase says 2019, website says 2018" }
  ],
  "schema_markup_present": ["Organization"],
  "schema_markup_missing": ["Product", "FAQ", "BreadcrumbList"],
  "knowledge_panel_exists": false
}
```

**Scoring formula:**
```
entity_score = (
  (platforms_present / platforms_checked) * 25 +
  consistency_score * 0.35 +
  schema_completeness * 20 +
  knowledge_panel_bonus * 20       // +20 if Google Knowledge Panel exists
)
```

---

### Pillar 4: Review Audit

**What it does:** Assesses the client's review presence across platforms that AI models weight heavily.

**Data sources:** Google Maps API or scraping, Apify actors for review sites

**Process:**
1. Search for client on: Google Reviews, Trustpilot, G2, Capterra, Yelp, industry-specific sites
2. For each platform, collect: total reviews, average rating, most recent review date, review velocity (reviews per month over last 6 months)
3. Run the same search for top 3 competitors
4. Use Claude to analyze sentiment distribution from review snippets

**Findings JSONB schema:**
```json
{
  "platforms_checked": 8,
  "platforms_with_reviews": 3,
  "total_reviews": 23,
  "average_rating": 4.2,
  "review_velocity": 1.8,
  "most_recent_review": "2026-02-15",
  "platform_breakdown": {
    "google": { "reviews": 18, "rating": 4.3, "velocity": 1.2 },
    "trustpilot": { "reviews": 5, "rating": 3.8, "velocity": 0.6 },
    "g2": { "reviews": 0, "present": false },
    "capterra": { "reviews": 0, "present": false }
  },
  "competitor_comparison": {
    "DistroKid": { "total_reviews": 4200, "avg_rating": 3.9, "platforms": 6 },
    "TuneCore": { "total_reviews": 1800, "avg_rating": 3.4, "platforms": 5 }
  },
  "sentiment_distribution": {
    "positive": 17,
    "neutral": 3,
    "negative": 3
  },
  "review_gap_vs_top_competitor": 4177
}
```

**Scoring formula:**
```
review_score = (
  platform_coverage * 20 +           // % of key platforms with presence
  rating_score * 25 +                 // (avg_rating / 5) * 100
  volume_score * 25 +                 // log scale: 0=0, 10=30, 50=60, 200+=100
  recency_score * 15 +                // reviews in last 90 days
  velocity_vs_competitor * 15         // review velocity relative to top competitor
)
```

---

### Pillar 5: Press / Earned Media Audit

**What it does:** Measures the client's third-party media footprint — the signals that AI models use to determine brand authority.

**Data sources:** Google News, Google web search, Apify news scraper

**Process:**
1. Search Google News for "{brand name}" (last 12 months)
2. Search Google for "{brand name}" -site:{client_domain} (third-party mentions)
3. Search for "{founder name} {brand name}" (thought leadership)
4. For each mention found, classify: press release, news article, guest post, podcast, award/list, social mention
5. Estimate domain authority of each mentioning site (use Google position as proxy, or Moz/Ahrefs API if available)
6. Check for unlinked mentions (brand name appears but no link back)

**Findings JSONB schema:**
```json
{
  "total_mentions": 14,
  "mention_types": {
    "news_article": 3,
    "press_release": 5,
    "guest_post": 1,
    "podcast": 0,
    "award_or_list": 2,
    "social_mention": 3
  },
  "high_authority_mentions": 4,
  "unique_publications": 8,
  "mentions_with_links": 9,
  "unlinked_mentions": 5,
  "most_recent_mention": "2026-01-20",
  "mention_velocity": 1.2,
  "top_mentions": [
    {
      "title": "10 Music Licensing Platforms for Indie Artists",
      "url": "https://musicbusinessworldwide.com/...",
      "publication": "Music Business Worldwide",
      "date": "2025-11-15",
      "type": "news_article",
      "has_link": true,
      "estimated_authority": "high"
    }
  ],
  "competitor_mentions": {
    "DistroKid": 89,
    "TuneCore": 62
  },
  "thought_leadership_score": 15
}
```

**Scoring formula:**
```
press_score = (
  mention_volume_score * 20 +         // log scale based on total mentions
  authority_score * 25 +              // weighted by publication authority
  diversity_score * 20 +              // variety of publication types
  recency_score * 15 +                // freshness of mentions
  link_ratio * 10 +                   // % of mentions with backlinks
  thought_leadership * 10             // founder/team personal mentions
)
```

---

## Composite AI Visibility Score

```typescript
// Weighted pillar combination
const PILLAR_WEIGHTS = {
  citations: 0.25,      // 25% — forum presence is highly actionable
  ai_presence: 0.30,    // 30% — this is the north star metric
  entities: 0.15,       // 15% — foundational but less volatile
  reviews: 0.15,        // 15% — important for trust signals
  press: 0.15,          // 15% — important for authority
};

composite_score = Math.round(
  citation_score * 0.25 +
  ai_presence_score * 0.30 +
  entity_score * 0.15 +
  review_score * 0.15 +
  press_score * 0.15
);
```

---

## Action Plan Generation

After all pillars complete, Claude synthesizes the findings into a prioritized action plan.

**Prompt:**
```
You are an AI SEO strategist analyzing an audit for {client.name}.

Here are the pillar scores and findings:
- Citations: {citation_score}/100 — {citation_findings}
- AI Presence: {ai_presence_score}/100 — {ai_presence_findings}
- Entities: {entity_score}/100 — {entity_findings}
- Reviews: {review_score}/100 — {review_findings}
- Press: {press_score}/100 — {press_findings}

Composite AI Visibility Score: {composite_score}/100

Generate:

1. EXECUTIVE SUMMARY (3-4 paragraphs)
Write a clear, honest assessment of the client's AI visibility posture. 
Lead with the biggest finding. Compare to competitors where relevant.
Use specific numbers from the findings. End with the opportunity.

2. PRIORITIZED ACTION PLAN (5-8 actions)
Rank by impact-to-effort ratio. For each action:
- Priority number (1 = do first)
- Which pillar it addresses
- Specific action to take
- Expected impact (high/medium/low)
- Effort required (high/medium/low)
- Estimated timeline
- Which GrowthForge module handles this

Focus on quick wins first (high impact, low effort).
The action plan should read as a campaign roadmap.

Return as JSON:
{
  "executive_summary": "...",
  "action_plan": [
    {
      "priority": 1,
      "pillar": "citations",
      "action": "Seed 20 high-authority Reddit threads where competitors are mentioned but you are not",
      "impact": "high",
      "effort": "low",
      "timeline": "Week 1-2",
      "module": "citation_engine",
      "details": "Focus on r/WeAreTheMusicMakers and r/MusicIndustry threads ranking in Google positions 1-5"
    }
  ],
  "headline_stat": "Your competitors appear in 47 high-authority threads where you have zero presence",
  "biggest_gap": "ai_presence",
  "biggest_quick_win": "citations"
}
```

---

## Audit UI Specification

### Audit Trigger

On the Client Detail page, add a prominent "Run AI Visibility Audit" button.
Also trigger automatically on new client creation (after keywords are added).

### Audit Progress Screen

Show real-time progress as each pillar completes:

```
┌─────────────────────────────────────────────────┐
│  AI Visibility Audit — RUN Music                 │
│  Started 2 minutes ago                           │
│                                                   │
│  ✅ Citations ............ 32/100  (done)         │
│  ✅ AI Presence .......... 18/100  (done)         │
│  ⏳ Entities ............. scanning...             │
│  ○  Reviews .............. pending                 │
│  ○  Press ................ pending                 │
│                                                   │
│  ████████████░░░░░░░  2/5 pillars complete       │
└─────────────────────────────────────────────────┘
```

### Audit Results Dashboard

```
┌──────────────────────────────────────────────────────┐
│  AI Visibility Score                                  │
│                                                        │
│         ╭─────────╮                                    │
│         │   36    │   ← large circular score           │
│         │  /100   │      with color (red/amber/green)  │
│         ╰─────────╯                                    │
│                                                        │
│  ┌────────┬────────┬────────┬────────┬────────┐       │
│  │ Citat. │ AI Pres│ Entity │ Review │ Press  │       │
│  │ 32     │ 18     │ 45     │ 61     │ 22     │       │
│  │ ████░  │ ██░░░  │ █████░ │ ██████ │ ███░░  │       │
│  └────────┴────────┴────────┴────────┴────────┘       │
│                                                        │
│  Executive Summary                                     │
│  "RUN Music has minimal AI visibility with a score of  │
│   36/100. While review presence is moderate (61/100),  │
│   the brand is nearly invisible to AI models, appearing│
│   in only 5% of relevant prompts. Competitors like     │
│   DistroKid dominate with 70% share of model..."       │
│                                                        │
│  Recommended Action Plan                               │
│  ┌─────────────────────────────────────────────┐      │
│  │ 1. 🟠 Seed 20 high-authority Reddit threads  │      │
│  │    Impact: HIGH · Effort: LOW · Week 1-2      │      │
│  │    → Citation Engine                          │      │
│  │                                               │      │
│  │ 2. 🔵 Fix entity inconsistencies across 3     │      │
│  │    Impact: MED · Effort: LOW · Week 1          │      │
│  │    → Entity Sync                              │      │
│  │                                               │      │
│  │ 3. 🟣 Launch press campaign targeting 5 music  │      │
│  │    Impact: HIGH · Effort: MED · Week 2-4       │      │
│  │    → PressForge                               │      │
│  └─────────────────────────────────────────────┘      │
│                                                        │
│  [📄 Export PDF Report]  [🔄 Re-run Audit]            │
└──────────────────────────────────────────────────────┘
```

### Month-Over-Month Tracking

Store each audit as a snapshot. The dashboard shows a trend line of composite_score over time. Each pillar score trends independently. This is how agencies prove ROI: "Your AI Visibility Score went from 36 to 72 in 90 days."

---

## Append to Directory Structure

```
src/
├── app/(dashboard)/
│   └── audits/
│       ├── page.tsx               # Audit history list
│       ├── new/page.tsx           # Trigger new audit
│       └── [auditId]/
│           ├── page.tsx           # Audit results dashboard
│           └── report/page.tsx    # Printable/PDF report view
├── lib/
│   └── audit/
│       ├── orchestrator.ts        # Runs all 5 pillar scans
│       ├── pillar-citations.ts    # Citation audit logic
│       ├── pillar-ai-presence.ts  # AI presence audit logic
│       ├── pillar-entities.ts     # Entity audit logic
│       ├── pillar-reviews.ts      # Review audit logic
│       ├── pillar-press.ts        # Press audit logic
│       ├── scoring.ts             # Composite score calculator
│       └── report-generator.ts    # PDF report generation
├── components/
│   └── audits/
│       ├── audit-progress.tsx     # Real-time progress indicator
│       ├── audit-score-card.tsx   # Large circular composite score
│       ├── pillar-scores.tsx      # 5-up pillar score bars
│       ├── action-plan.tsx        # Prioritized action list
│       ├── competitor-comparison.tsx
│       └── audit-trend.tsx        # Month-over-month score chart
```

---

## Append to Inngest Jobs

```typescript
// Job: audit.run
// Trigger: User clicks "Run Audit" OR new client onboarded with keywords
// Steps:
//   1. Create audit record with status='running'
//   2. Run all 5 pillar scans IN PARALLEL (each is independent):
//      a. audit.pillar.citations
//      b. audit.pillar.ai_presence
//      c. audit.pillar.entities
//      d. audit.pillar.reviews
//      e. audit.pillar.press
//   3. Wait for all pillars to complete (Inngest waitForEvent)
//   4. Calculate composite score
//   5. Generate executive summary + action plan via Claude Opus
//   6. Update audit record with scores and narrative
//   7. Send notification email: "Your audit is ready"
//   8. Deduct credits (50 credits for full audit)

// Estimated runtime: 3-5 minutes for full audit
// Credit cost: 50 credits (full) / 20 credits (quick)
```

---

## Audit as Sales Tool

The audit serves dual purpose:

**1. Client onboarding:** Establishes a measured baseline before any campaigns run. Every future audit shows improvement (or reveals what needs adjustment).

**2. Sales weapon:** Run a free audit for prospects. The PDF report shows their gaps, competitor comparison, and a specific action plan. The action plan items map directly to GrowthForge modules — it sells the service for you.

For the SaaS version, offer "1 Free Audit" on the starter plan as the conversion hook. Agencies can run audits for prospects before they even become paying clients.
