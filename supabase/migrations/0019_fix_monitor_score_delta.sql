-- ============================================
-- MIGRATION 0019: ADD SCORE DELTA TO MONITOR SNAPSHOTS
-- The AI Visibility Score delta was incorrectly using
-- som_delta in the UI. Add a proper score_delta column
-- that tracks change in the composite AI Visibility Score.
-- ============================================

ALTER TABLE monitor_snapshots
  ADD COLUMN IF NOT EXISTS score_delta INTEGER;

-- Backfill score_delta from historical snapshots
-- For each snapshot, calculate the difference from the previous week's score
WITH ordered AS (
  SELECT
    id,
    client_id,
    ai_visibility_score,
    LAG(ai_visibility_score) OVER (
      PARTITION BY client_id, period_type
      ORDER BY snapshot_date ASC
    ) AS prev_score
  FROM monitor_snapshots
)
UPDATE monitor_snapshots ms
SET score_delta = o.ai_visibility_score - o.prev_score
FROM ordered o
WHERE ms.id = o.id
  AND o.prev_score IS NOT NULL;
