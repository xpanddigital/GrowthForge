-- ============================================
-- MIGRATION 0008: AGENT ACTION LOG
-- ============================================

CREATE TABLE agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  agent_type TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  trigger_reference_id UUID,
  target_type TEXT,
  target_id UUID,
  status TEXT NOT NULL DEFAULT 'started' CHECK (
    status IN ('started', 'completed', 'failed', 'timeout')
  ),
  items_processed INTEGER DEFAULT 0,
  items_produced INTEGER DEFAULT 0,
  credits_consumed INTEGER DEFAULT 0,
  duration_ms INTEGER,
  cost_usd NUMERIC(10,6),
  error_code TEXT,
  error_message TEXT,
  input_summary JSONB DEFAULT '{}',
  output_summary JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_actions_agency ON agent_actions(agency_id, created_at DESC);
CREATE INDEX idx_agent_actions_client ON agent_actions(client_id, created_at DESC);
CREATE INDEX idx_agent_actions_type ON agent_actions(agent_type, created_at DESC);
CREATE INDEX idx_agent_actions_status ON agent_actions(status) WHERE status = 'failed';

ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_actions_agency_isolation" ON agent_actions FOR ALL USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
