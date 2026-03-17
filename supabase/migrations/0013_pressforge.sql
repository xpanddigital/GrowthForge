-- ============================================
-- MIGRATION 0013: PRESSFORGE
-- Press releases, spokespersons, campaign ideas,
-- journalist database, outreach, coverage tracking,
-- campaign calendar, and link monitoring.
-- ============================================

-- -----------------------------------------------
-- 0. ADD NEW COLUMNS TO CLIENTS TABLE
-- These are needed by the PressForge ideation prompt
-- -----------------------------------------------

ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type TEXT DEFAULT 'business';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sub_industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS target_regions TEXT[] DEFAULT '{AU}';

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
  voice_profile TEXT,
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
  event_date TEXT,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('awareness_day', 'awareness_month', 'seasonal', 'industry', 'news_pattern')
  ),

  regions TEXT[] NOT NULL DEFAULT '{GLOBAL}',
  industries TEXT[] NOT NULL DEFAULT '{ALL}',
  pr_angle_hint TEXT,
  send_by_offset_days INTEGER DEFAULT 7,

  is_custom BOOLEAN NOT NULL DEFAULT false,
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
  promoted_to_campaign_id UUID,

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
      'draft',
      'ideation_complete',
      'press_release_draft',
      'press_release_approved',
      'journalists_found',
      'outreach_ready',
      'outreach_sent',
      'monitoring',
      'completed',
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
  region TEXT,
  sub_regions TEXT[] DEFAULT '{}',
  beats TEXT[] DEFAULT '{}',
  beat_summary TEXT,

  -- Content preferences (learned from articles + engagement)
  preferred_content_type TEXT,
  typical_article_length TEXT,
  engages_with_types TEXT[] DEFAULT '{}',

  -- Recent articles (refreshed periodically)
  recent_articles JSONB DEFAULT '[]',

  -- Engagement stats (updated after each campaign)
  total_pitched INTEGER NOT NULL DEFAULT 0,
  total_opened INTEGER NOT NULL DEFAULT 0,
  total_replied INTEGER NOT NULL DEFAULT 0,
  total_published INTEGER NOT NULL DEFAULT 0,
  response_rate NUMERIC(5,4),
  publish_rate NUMERIC(5,4),
  email_bounce_count INTEGER NOT NULL DEFAULT 0,

  -- Relationship tracking
  relationship_score INTEGER CHECK (relationship_score BETWEEN 0 AND 100),
  last_pitched_at TIMESTAMPTZ,
  cooldown_days INTEGER NOT NULL DEFAULT 30,

  -- Discovery tracking
  discovered_via TEXT DEFAULT 'perplexity',
  discovered_for_campaign_id UUID,

  -- Manual enrichment
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Status
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  blacklist_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(agency_id, email)
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

  -- AI-generated
  why_selected TEXT,
  personalization_hook TEXT,

  -- Source
  source TEXT NOT NULL DEFAULT 'database',

  -- Selection status
  is_selected BOOLEAN NOT NULL DEFAULT false,

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
  campaign_id UUID REFERENCES press_campaigns(id),
  journalist_id UUID REFERENCES journalists(id),

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
  variables JSONB DEFAULT '{}',

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

-- Campaign-linked tables (chain through press_campaigns -> clients -> agency)
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
