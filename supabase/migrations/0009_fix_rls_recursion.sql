-- ============================================
-- MIGRATION 0009: FIX RLS INFINITE RECURSION
-- The users_select policy queries users table,
-- which triggers itself infinitely.
-- Fix: Use SECURITY DEFINER function to bypass RLS.
-- ============================================

-- Helper function that bypasses RLS to get the current user's agency_id
CREATE OR REPLACE FUNCTION public.get_user_agency_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT agency_id FROM public.users WHERE id = auth.uid()
$$;

-- Helper function to check if current user is a platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'platform_admin')
$$;

-- Drop and recreate all policies that reference the users table

-- === AGENCIES ===
DROP POLICY IF EXISTS "agencies_select" ON agencies;
DROP POLICY IF EXISTS "agencies_update" ON agencies;

CREATE POLICY "agencies_select" ON agencies FOR SELECT USING (
  id = public.get_user_agency_id()
  OR public.is_platform_admin()
);

CREATE POLICY "agencies_update" ON agencies FOR UPDATE USING (
  id = public.get_user_agency_id()
  AND EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('agency_owner', 'platform_admin')
  )
);

-- === USERS ===
DROP POLICY IF EXISTS "users_select" ON users;

CREATE POLICY "users_select" ON users FOR SELECT USING (
  agency_id = public.get_user_agency_id()
);

-- === CLIENTS ===
DROP POLICY IF EXISTS "clients_agency_isolation" ON clients;

CREATE POLICY "clients_agency_isolation" ON clients FOR ALL USING (
  agency_id = public.get_user_agency_id()
);

-- === KEYWORDS ===
DROP POLICY IF EXISTS "keywords_agency_isolation" ON keywords;

CREATE POLICY "keywords_agency_isolation" ON keywords FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

-- === THREADS ===
DROP POLICY IF EXISTS "threads_agency_isolation" ON threads;

CREATE POLICY "threads_agency_isolation" ON threads FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

-- === DISCOVERY RUNS ===
DROP POLICY IF EXISTS "discovery_runs_agency_isolation" ON discovery_runs;

CREATE POLICY "discovery_runs_agency_isolation" ON discovery_runs FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

-- === RESPONSES ===
DROP POLICY IF EXISTS "responses_agency_isolation" ON responses;

CREATE POLICY "responses_agency_isolation" ON responses FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

-- === MONITOR PROMPTS ===
DROP POLICY IF EXISTS "monitor_prompts_agency_isolation" ON monitor_prompts;

CREATE POLICY "monitor_prompts_agency_isolation" ON monitor_prompts FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

-- === MONITOR RESULTS ===
DROP POLICY IF EXISTS "monitor_results_agency_isolation" ON monitor_results;

CREATE POLICY "monitor_results_agency_isolation" ON monitor_results FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

-- === CREDIT TRANSACTIONS ===
DROP POLICY IF EXISTS "credits_agency_isolation" ON credit_transactions;

CREATE POLICY "credits_agency_isolation" ON credit_transactions FOR ALL USING (
  agency_id = public.get_user_agency_id()
);

-- === AUDITS ===
DROP POLICY IF EXISTS "audits_agency_isolation" ON audits;

CREATE POLICY "audits_agency_isolation" ON audits FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

-- === AUDIT PILLAR RESULTS ===
DROP POLICY IF EXISTS "audit_pillars_agency_isolation" ON audit_pillar_results;

CREATE POLICY "audit_pillars_agency_isolation" ON audit_pillar_results FOR ALL USING (
  audit_id IN (
    SELECT id FROM audits WHERE client_id IN (
      SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
    )
  )
);

-- === AGENT ACTIONS ===
DROP POLICY IF EXISTS "agent_actions_agency_isolation" ON agent_actions;

CREATE POLICY "agent_actions_agency_isolation" ON agent_actions FOR ALL USING (
  agency_id = public.get_user_agency_id()
);
