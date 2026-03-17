-- ============================================
-- MIGRATION 0004: GENERATED RESPONSES
-- ============================================

CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('casual', 'expert', 'story')),
  body_text TEXT NOT NULL,
  quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
  tone_match_score INTEGER CHECK (tone_match_score BETWEEN 0 AND 100),
  mentions_brand BOOLEAN NOT NULL DEFAULT false,
  mentions_url BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'approved', 'posted', 'rejected')
  ),
  was_edited BOOLEAN NOT NULL DEFAULT false,
  edited_text TEXT,
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

CREATE INDEX idx_responses_thread ON responses(thread_id);
CREATE INDEX idx_responses_client_status ON responses(client_id, status);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "responses_agency_isolation" ON responses FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
