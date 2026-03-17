-- ============================================
-- MIGRATION 0007: AI VISIBILITY AUDIT
-- ============================================

CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL DEFAULT 'full' CHECK (
    audit_type IN ('full', 'citation_only', 'ai_presence_only', 'quick')
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  composite_score INTEGER CHECK (composite_score BETWEEN 0 AND 100),
  citation_score INTEGER CHECK (citation_score BETWEEN 0 AND 100),
  ai_presence_score INTEGER CHECK (ai_presence_score BETWEEN 0 AND 100),
  entity_score INTEGER CHECK (entity_score BETWEEN 0 AND 100),
  review_score INTEGER CHECK (review_score BETWEEN 0 AND 100),
  press_score INTEGER CHECK (press_score BETWEEN 0 AND 100),
  executive_summary TEXT,
  action_plan JSONB DEFAULT '[]',
  competitors_analyzed TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_pillar_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL CHECK (
    pillar IN ('citations', 'ai_presence', 'entities', 'reviews', 'press')
  ),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'skipped')
  ),
  findings JSONB NOT NULL DEFAULT '{}',
  summary TEXT,
  recommendations JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(audit_id, pillar)
);

CREATE INDEX idx_audits_client ON audits(client_id, created_at DESC);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audit_pillars_audit ON audit_pillar_results(audit_id);

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
