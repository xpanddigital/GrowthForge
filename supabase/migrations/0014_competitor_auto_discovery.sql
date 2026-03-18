-- ============================================
-- MIGRATION 0014: COMPETITOR AUTO-DISCOVERY
-- Adds tracking fields so competitors can be
-- auto-discovered from AI monitor scan responses.
-- ============================================

ALTER TABLE monitor_competitors
  ADD COLUMN IF NOT EXISTS discovered_via TEXT NOT NULL DEFAULT 'manual';

ALTER TABLE monitor_competitors
  ADD COLUMN IF NOT EXISTS mention_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE monitor_competitors
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
