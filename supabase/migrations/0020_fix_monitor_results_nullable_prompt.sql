-- ============================================
-- MIGRATION 0020: ALLOW NULL prompt_id ON monitor_results
-- Keyword-based monitoring generates prompts dynamically from
-- monitor_keyword_config.generated_prompts, so they don't have
-- a row in monitor_prompts. The NOT NULL constraint was causing
-- inserts to silently fail, losing all individual test results.
--
-- Also adds prompt_text column to store the actual prompt used,
-- so results are self-contained and don't require a join.
-- ============================================

-- Drop the NOT NULL constraint on prompt_id
ALTER TABLE monitor_results
  ALTER COLUMN prompt_id DROP NOT NULL;

-- Add prompt_text column so each result stores the actual prompt used
ALTER TABLE monitor_results
  ADD COLUMN IF NOT EXISTS prompt_text TEXT;
