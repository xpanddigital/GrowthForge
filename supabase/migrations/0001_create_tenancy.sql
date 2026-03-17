-- ============================================
-- MIGRATION 0001: MULTI-TENANT HIERARCHY
-- Platform (GrowthForge) → Agencies → Clients
-- ============================================

CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_email TEXT NOT NULL,
  logo_url TEXT,
  plan TEXT NOT NULL DEFAULT 'agency_unlimited',
  credits_balance INTEGER NOT NULL DEFAULT 999999,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  max_clients INTEGER NOT NULL DEFAULT 100,
  max_keywords_per_client INTEGER NOT NULL DEFAULT 100,
  is_platform_owner BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_agency ON users(agency_id);
CREATE INDEX idx_users_email ON users(email);

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agencies_select" ON agencies FOR SELECT USING (
  id IN (SELECT agency_id FROM users WHERE id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
);

CREATE POLICY "agencies_update" ON agencies FOR UPDATE USING (
  id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role IN ('agency_owner', 'platform_admin'))
);

CREATE POLICY "users_select" ON users FOR SELECT USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
