-- ============================================
-- MIGRATION 0021: ADMIN BI DASHBOARD
-- Subscription event logging for revenue analytics,
-- admin notes for internal tracking, and denormalized
-- columns on agencies for fast filtering.
-- ============================================

-- ============================================
-- 1. Subscription Events — populated by Stripe webhooks
-- ============================================

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  -- Idempotency: Stripe event ID prevents duplicate inserts
  stripe_event_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT,

  -- Event classification
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'checkout_completed',
      'subscription_updated',
      'subscription_deleted',
      'invoice_paid',
      'invoice_payment_failed',
      'trial_will_end'
    )
  ),

  -- Plan transition tracking
  previous_plan TEXT,
  new_plan TEXT,
  previous_status TEXT,  -- trialing, active, past_due, canceled
  new_status TEXT,

  -- Revenue impact (in cents)
  mrr_delta INTEGER DEFAULT 0,       -- positive = expansion, negative = contraction
  amount_cents INTEGER DEFAULT 0,    -- invoice amount for payment events

  -- Flexible metadata
  metadata JSONB DEFAULT '{}',

  -- When Stripe says this happened (not when we processed it)
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sub_events_agency ON subscription_events(agency_id, occurred_at DESC);
CREATE INDEX idx_sub_events_type ON subscription_events(event_type, occurred_at DESC);
CREATE INDEX idx_sub_events_occurred ON subscription_events(occurred_at DESC);

-- ============================================
-- 2. Admin Notes — internal tracking per agency
-- ============================================

CREATE TABLE admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  note TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general' CHECK (
    note_type IN ('general', 'flag', 'credit_adjustment', 'plan_change')
  ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_notes_agency ON admin_notes(agency_id, created_at DESC);

-- ============================================
-- 3. Denormalized columns on agencies
-- ============================================

ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS churned_at TIMESTAMPTZ;

-- ============================================
-- 4. RLS Policies — platform_admin only
-- ============================================

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Subscription events: read-only for platform admins
CREATE POLICY "sub_events_platform_admin_select" ON subscription_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- Allow service role to insert (webhooks run as service role)
CREATE POLICY "sub_events_service_insert" ON subscription_events
  FOR INSERT WITH CHECK (true);

-- Admin notes: full access for platform admins
CREATE POLICY "admin_notes_platform_admin" ON admin_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ============================================
-- 5. Backfill existing agencies with subscription_status
-- ============================================

-- Agencies with active Stripe subscriptions
UPDATE agencies
SET subscription_status = 'active'
WHERE stripe_subscription_id IS NOT NULL
  AND is_active = true
  AND subscription_status IS NULL OR subscription_status = 'none';

-- The internal unlimited plan
UPDATE agencies
SET subscription_status = 'active'
WHERE plan = 'agency_unlimited'
  AND is_active = true;
