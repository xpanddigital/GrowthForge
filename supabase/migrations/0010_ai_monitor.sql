-- ============================================
-- MIGRATION 0010: AI MONITOR (COMPLETE)
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
