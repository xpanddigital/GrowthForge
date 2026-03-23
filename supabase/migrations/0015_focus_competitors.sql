-- ============================================
-- MIGRATION 0015: FOCUS COMPETITORS
-- Adds is_focus flag to monitor_competitors.
-- Focus competitors are highlighted in charts
-- and prioritized in SoM tracking.
-- ============================================

ALTER TABLE monitor_competitors
ADD COLUMN IF NOT EXISTS is_focus BOOLEAN NOT NULL DEFAULT false;

-- Index for quick focus competitor lookups
CREATE INDEX IF NOT EXISTS idx_monitor_competitors_focus
  ON monitor_competitors(client_id, is_focus)
  WHERE is_focus = true;
