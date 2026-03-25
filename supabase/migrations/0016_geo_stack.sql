-- ============================================
-- MIGRATION 0016: GEO STACK
-- Technical GEO, Mention Gap Analyzer,
-- YouTube GEO, and Journalist Query Matching.
-- ============================================

-- -----------------------------------------------
-- 1. TECHNICAL GEO SCANS
-- -----------------------------------------------

CREATE TABLE technical_geo_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  scan_type TEXT NOT NULL DEFAULT 'full' CHECK (
    scan_type IN ('full', 'robots_only', 'freshness_only', 'citability_only', 'schema_ssr_only')
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed')
  ),

  -- Sub-scores (each 0-100)
  robots_score INTEGER CHECK (robots_score BETWEEN 0 AND 100),
  freshness_score INTEGER CHECK (freshness_score BETWEEN 0 AND 100),
  citability_score INTEGER CHECK (citability_score BETWEEN 0 AND 100),
  schema_ssr_score INTEGER CHECK (schema_ssr_score BETWEEN 0 AND 100),
  composite_score INTEGER CHECK (composite_score BETWEEN 0 AND 100),

  -- Full findings per sub-scan
  findings JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  credits_used INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_technical_geo_scans_client ON technical_geo_scans(client_id, created_at DESC);
CREATE INDEX idx_technical_geo_scans_status ON technical_geo_scans(status);

ALTER TABLE technical_geo_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "technical_geo_scans_agency_isolation" ON technical_geo_scans FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

-- -----------------------------------------------
-- 2. CONTENT FRESHNESS
-- -----------------------------------------------

CREATE TABLE content_freshness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES technical_geo_scans(id) ON DELETE SET NULL,

  page_url TEXT NOT NULL,
  page_title TEXT,

  -- Freshness detection
  last_modified_header TIMESTAMPTZ,
  content_date_detected TIMESTAMPTZ,
  days_since_update INTEGER,
  freshness_category TEXT NOT NULL CHECK (
    freshness_category IN ('fresh', 'aging', 'stale', 'expired')
  ),

  -- AI citation cross-reference
  is_cited_by_ai BOOLEAN NOT NULL DEFAULT false,
  cited_by_models TEXT[] DEFAULT '{}',
  citation_at_risk BOOLEAN NOT NULL DEFAULT false,

  -- Citability scoring (per page)
  citability_score INTEGER CHECK (citability_score BETWEEN 0 AND 100),
  citability_dimensions JSONB DEFAULT '{}',

  -- AI-generated refresh suggestions
  refresh_brief TEXT,
  refresh_priority TEXT DEFAULT 'medium' CHECK (
    refresh_priority IN ('critical', 'high', 'medium', 'low')
  ),

  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_freshness_client ON content_freshness(client_id, freshness_category);
CREATE INDEX idx_content_freshness_scan ON content_freshness(scan_id);
CREATE INDEX idx_content_freshness_at_risk ON content_freshness(client_id, citation_at_risk) WHERE citation_at_risk = true;

ALTER TABLE content_freshness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_freshness_agency_isolation" ON content_freshness FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

-- -----------------------------------------------
-- 3. MENTION SOURCES — where brands are mentioned
-- -----------------------------------------------

CREATE TABLE mention_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  platform TEXT NOT NULL,
  -- reddit | quora | facebook_groups | linkedin | youtube | g2 | capterra |
  -- getapp | clutch | trustradius | trustpilot | crunchbase | wikipedia |
  -- wikidata | medium | industry_directory

  source_url TEXT,
  source_title TEXT,

  -- What was mentioned
  mention_type TEXT NOT NULL DEFAULT 'neither' CHECK (
    mention_type IN ('brand', 'competitor', 'both', 'neither')
  ),
  mentioned_entity TEXT,        -- The brand or competitor name that was found
  context_snippet TEXT,         -- The sentence/paragraph with the mention

  -- Discovery method
  discovery_method TEXT NOT NULL DEFAULT 'serp',
  -- serp | direct_scrape | api | ai_probe

  -- Source authority
  authority_estimate TEXT DEFAULT 'medium' CHECK (
    authority_estimate IN ('high', 'medium', 'low')
  ),
  engagement_count INTEGER,    -- upvotes, likes, views depending on platform

  -- AI citation tracking
  cited_by_ai_models TEXT[] DEFAULT '{}',

  scan_id UUID,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mention_sources_client ON mention_sources(client_id, platform);
CREATE INDEX idx_mention_sources_type ON mention_sources(client_id, mention_type);
CREATE INDEX idx_mention_sources_scan ON mention_sources(scan_id);

ALTER TABLE mention_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mention_sources_agency_isolation" ON mention_sources FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

-- -----------------------------------------------
-- 4. MENTION GAPS — where competitors are but client is not
-- -----------------------------------------------

CREATE TABLE mention_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  platform TEXT NOT NULL,
  gap_type TEXT NOT NULL CHECK (
    gap_type IN (
      'competitor_present_client_absent',
      'unlinked_mention',
      'missing_profile',
      'low_review_count',
      'no_youtube_presence',
      'no_linkedin_articles',
      'review_gap'
    )
  ),

  competitor_name TEXT,
  opportunity_url TEXT,
  opportunity_title TEXT,
  recommended_action TEXT,
  action_module TEXT,           -- citation_engine | entity_sync | review_engine | press | youtube_geo
  impact TEXT NOT NULL DEFAULT 'medium' CHECK (impact IN ('high', 'medium', 'low')),
  effort TEXT NOT NULL DEFAULT 'medium' CHECK (effort IN ('high', 'medium', 'low')),
  opportunity_score INTEGER CHECK (opportunity_score BETWEEN 0 AND 100),

  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'in_progress', 'resolved', 'dismissed')
  ),

  scan_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mention_gaps_client ON mention_gaps(client_id, status);
CREATE INDEX idx_mention_gaps_platform ON mention_gaps(client_id, platform);
CREATE INDEX idx_mention_gaps_scan ON mention_gaps(scan_id);

ALTER TABLE mention_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mention_gaps_agency_isolation" ON mention_gaps FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

-- -----------------------------------------------
-- 5. YOUTUBE PRESENCE — per-topic video tracking
-- -----------------------------------------------

CREATE TABLE youtube_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,

  topic TEXT NOT NULL,
  has_client_video BOOLEAN NOT NULL DEFAULT false,
  client_video_url TEXT,
  client_video_title TEXT,

  -- Competitor videos for this topic
  competitor_videos JSONB DEFAULT '[]',
  -- [{ competitor: string, title: string, url: string, views: number }]

  -- AI-generated video brief
  video_brief TEXT,
  opportunity_score INTEGER CHECK (opportunity_score BETWEEN 0 AND 100),

  scan_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_youtube_presence_client ON youtube_presence(client_id);
CREATE INDEX idx_youtube_presence_scan ON youtube_presence(scan_id);

ALTER TABLE youtube_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "youtube_presence_agency_isolation" ON youtube_presence FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

-- -----------------------------------------------
-- 6. JOURNALIST QUERIES — matched journalist requests
-- -----------------------------------------------

CREATE TABLE journalist_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  query_text TEXT NOT NULL,
  source TEXT NOT NULL CHECK (
    source IN ('source_of_sources', 'journorequest', 'featured', 'qwoted', 'manual')
  ),

  journalist_name TEXT,
  publication TEXT,
  deadline TIMESTAMPTZ,

  -- Matching
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  match_reason TEXT,

  -- Auto-drafted response
  draft_response TEXT,

  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'matched', 'drafted', 'submitted', 'expired', 'dismissed')
  ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journalist_queries_client ON journalist_queries(client_id, status);
CREATE INDEX idx_journalist_queries_deadline ON journalist_queries(deadline) WHERE status IN ('new', 'matched', 'drafted');

ALTER TABLE journalist_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journalist_queries_agency_isolation" ON journalist_queries FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
