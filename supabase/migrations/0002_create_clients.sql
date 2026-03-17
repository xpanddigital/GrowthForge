-- ============================================
-- MIGRATION 0002: CLIENTS & KEYWORDS
-- ============================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  brand_brief TEXT NOT NULL,
  tone_guidelines TEXT,
  target_audience TEXT,
  key_differentiators TEXT,
  urls_to_mention TEXT[] NOT NULL DEFAULT '{}',
  response_rules TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agency_id, slug)
);

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  intent TEXT,
  volume_score INTEGER CHECK (volume_score BETWEEN 1 AND 10),
  source TEXT NOT NULL DEFAULT 'manual',
  scan_platforms TEXT[] NOT NULL DEFAULT '{reddit,quora,facebook_groups}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, keyword)
);

CREATE INDEX idx_clients_agency ON clients(agency_id);
CREATE INDEX idx_clients_active ON clients(agency_id, is_active);
CREATE INDEX idx_keywords_client ON keywords(client_id, is_active);
CREATE INDEX idx_keywords_tags ON keywords USING GIN(tags);

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
