-- ============================================
-- MIGRATION 0005: AI CITATION MONITORING
-- ============================================

CREATE TABLE monitor_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  test_models TEXT[] NOT NULL DEFAULT '{chatgpt,perplexity,gemini}',
  frequency TEXT NOT NULL DEFAULT 'weekly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE monitor_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES monitor_prompts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  ai_model TEXT NOT NULL,
  brand_mentioned BOOLEAN NOT NULL DEFAULT false,
  brand_linked BOOLEAN NOT NULL DEFAULT false,
  mention_context TEXT,
  competitor_mentions TEXT[],
  sources_cited TEXT[],
  full_response TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  prominence_score INTEGER CHECK (prominence_score BETWEEN 0 AND 100),
  tested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_monitor_prompts_client ON monitor_prompts(client_id, is_active);
CREATE INDEX idx_monitor_results_client ON monitor_results(client_id, tested_at DESC);
CREATE INDEX idx_monitor_results_prompt ON monitor_results(prompt_id, tested_at DESC);
CREATE INDEX idx_monitor_results_model ON monitor_results(ai_model);

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
