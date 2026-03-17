-- ============================================
-- MIGRATION 0003: THREAD DISCOVERY
-- ============================================

CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'quora', 'facebook_groups')),
  platform_id TEXT,
  subreddit TEXT,
  group_name TEXT,
  title TEXT NOT NULL,
  body_text TEXT,
  url TEXT NOT NULL,
  author TEXT,
  comment_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  thread_date TIMESTAMPTZ,
  top_comments JSONB DEFAULT '[]',
  discovered_via TEXT NOT NULL DEFAULT 'serp',
  google_position INTEGER,
  ai_source TEXT,
  ai_query TEXT,
  intent TEXT CHECK (intent IN ('informational', 'transactional', 'commercial', 'navigational')),
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  opportunity_score INTEGER CHECK (opportunity_score BETWEEN 0 AND 100),
  can_mention_brand BOOLEAN,
  suggested_angle TEXT,
  classification_tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'enriching', 'classified', 'queued', 'generating', 'responded', 'posted', 'skipped', 'expired')
  ),
  is_enriched BOOLEAN NOT NULL DEFAULT false,
  enriched_at TIMESTAMPTZ,
  enrichment_error TEXT,
  content_hash TEXT NOT NULL,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, content_hash)
);

CREATE TABLE discovery_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL CHECK (
    run_type IN ('serp_scan', 'ai_probe', 'thread_enrich', 'classification', 'response_gen')
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  items_total INTEGER NOT NULL DEFAULT 0,
  items_processed INTEGER NOT NULL DEFAULT 0,
  items_succeeded INTEGER NOT NULL DEFAULT 0,
  items_failed INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  error_details JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_threads_client_status ON threads(client_id, status);
CREATE INDEX idx_threads_client_relevance ON threads(client_id, relevance_score DESC NULLS LAST);
CREATE INDEX idx_threads_client_opportunity ON threads(client_id, opportunity_score DESC NULLS LAST);
CREATE INDEX idx_threads_platform ON threads(platform);
CREATE INDEX idx_threads_discovered ON threads(discovered_at DESC);
CREATE INDEX idx_threads_content_hash ON threads(content_hash);
CREATE INDEX idx_threads_status_changed ON threads(status_changed_at DESC);
CREATE INDEX idx_discovery_runs_client ON discovery_runs(client_id, started_at DESC);

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
