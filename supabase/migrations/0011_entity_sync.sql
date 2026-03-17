-- ============================================
-- MIGRATION 0011: ENTITY SYNC
-- Canonical descriptions, platform profiles, consistency
-- scoring, remediation tasks, scan history, schema audit,
-- AI crawler audit, and llms.txt support.
-- ============================================

-- Add vertical column to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS vertical TEXT CHECK (
  vertical IS NULL OR vertical IN (
    'general', 'legal', 'music', 'home_services',
    'saas', 'ecommerce', 'healthcare', 'restaurant',
    'real_estate', 'finance', 'agency', 'professional'
  )
);

-- -----------------------------------------------
-- 1. ENTITY CANONICAL — source of truth per client
-- -----------------------------------------------

CREATE TABLE entity_canonical (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  canonical_name TEXT NOT NULL,
  canonical_description TEXT NOT NULL,
  canonical_tagline TEXT,
  canonical_category TEXT NOT NULL,
  canonical_subcategories TEXT[] DEFAULT '{}',

  canonical_contact JSONB NOT NULL DEFAULT '{}',
  canonical_urls JSONB NOT NULL DEFAULT '{}',

  canonical_founding_year INTEGER,
  canonical_founder_name TEXT,
  canonical_employee_count TEXT,
  canonical_service_areas TEXT[] DEFAULT '{}',

  -- Platform-adapted descriptions (auto-generated, character-limited per platform)
  platform_descriptions JSONB DEFAULT '{}',

  -- Approval tracking (human-in-the-loop)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'approved', 'needs_update')
  ),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  version INTEGER NOT NULL DEFAULT 1,
  previous_version_id UUID REFERENCES entity_canonical(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, version)
);

-- -----------------------------------------------
-- 2. ENTITY PROFILES — one row per platform presence
-- -----------------------------------------------

CREATE TABLE entity_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (
    platform IN (
      'google_business', 'linkedin', 'crunchbase', 'wikipedia', 'wikidata',
      'facebook', 'twitter', 'instagram', 'youtube',
      'trustpilot', 'g2', 'capterra', 'yelp', 'bbb',
      'avvo', 'super_lawyers', 'findlaw', 'justia', 'martindale',
      'allmusic', 'musicbrainz', 'discogs',
      'homeadvisor', 'angi', 'houzz',
      'product_hunt', 'angellist', 'alternativeto',
      'apple_maps', 'bing_places', 'foursquare',
      'industry_specific'
    )
  ),

  platform_profile_url TEXT,
  platform_profile_id TEXT,
  is_claimed BOOLEAN,

  description_text TEXT,
  category TEXT,
  contact_info JSONB DEFAULT '{}',
  additional_fields JSONB DEFAULT '{}',

  consistency_score INTEGER CHECK (consistency_score BETWEEN 0 AND 100),
  consistency_details JSONB DEFAULT '{}',
  issues JSONB DEFAULT '[]',

  status TEXT NOT NULL DEFAULT 'not_checked' CHECK (
    status IN (
      'not_checked', 'not_found', 'found_unclaimed',
      'claimed_inconsistent', 'claimed_consistent', 'needs_creation'
    )
  ),

  last_scraped_at TIMESTAMPTZ,
  scrape_error TEXT,
  scrape_attempts INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, platform)
);

-- -----------------------------------------------
-- 3. ENTITY TASKS — remediation actions
-- -----------------------------------------------

CREATE TABLE entity_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_profile_id UUID REFERENCES entity_profiles(id) ON DELETE SET NULL,

  task_type TEXT NOT NULL CHECK (
    task_type IN (
      'claim_listing', 'create_listing', 'update_description',
      'update_contact', 'update_category', 'update_name',
      'add_schema', 'fix_schema', 'update_urls', 'verify_listing',
      'fix_robots_txt', 'create_llms_txt', 'update_llms_txt',
      'fix_sameas', 'respond_to_review', 'custom'
    )
  ),

  description TEXT NOT NULL,
  instructions TEXT,

  -- For schema tasks: generated JSON-LD code ready to paste
  generated_code TEXT,

  -- For description tasks: platform-adapted text ready to paste
  platform_description TEXT,
  platform_char_limit INTEGER,

  platform TEXT,

  priority TEXT NOT NULL DEFAULT 'medium' CHECK (
    priority IN ('critical', 'high', 'medium', 'low')
  ),
  priority_score INTEGER CHECK (priority_score BETWEEN 0 AND 100),

  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked')
  ),

  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),

  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_note TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 4. ENTITY SCANS — scan history
-- -----------------------------------------------

CREATE TABLE entity_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  scan_type TEXT NOT NULL DEFAULT 'full' CHECK (
    scan_type IN ('full', 'quick', 'single', 'schema_only')
  ),

  platforms_scanned TEXT[] NOT NULL DEFAULT '{}',

  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),

  profiles_checked INTEGER NOT NULL DEFAULT 0,
  profiles_found INTEGER NOT NULL DEFAULT 0,
  profiles_consistent INTEGER NOT NULL DEFAULT 0,
  profiles_inconsistent INTEGER NOT NULL DEFAULT 0,
  profiles_missing INTEGER NOT NULL DEFAULT 0,
  issues_found INTEGER NOT NULL DEFAULT 0,
  tasks_created INTEGER NOT NULL DEFAULT 0,

  overall_consistency_score INTEGER CHECK (overall_consistency_score BETWEEN 0 AND 100),

  credits_used INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 5. SCHEMA + AI ACCESSIBILITY AUDIT RESULTS
-- -----------------------------------------------

CREATE TABLE entity_schema_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES entity_scans(id) ON DELETE SET NULL,

  page_url TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'homepage' CHECK (
    page_type IN ('homepage', 'about', 'contact', 'service', 'product',
                  'blog', 'robots_txt', 'llms_txt', 'other')
  ),

  schemas_found JSONB NOT NULL DEFAULT '[]',
  schemas_missing TEXT[] DEFAULT '{}',
  schema_score INTEGER CHECK (schema_score BETWEEN 0 AND 100),

  sameas_validation JSONB DEFAULT '{}',

  raw_jsonld JSONB DEFAULT '[]',
  raw_microdata JSONB DEFAULT '[]',
  raw_rdfa JSONB DEFAULT '[]',

  -- For robots.txt audits
  crawler_access JSONB DEFAULT '{}',
  robots_score INTEGER CHECK (robots_score BETWEEN 0 AND 100),

  -- For llms.txt audits
  llms_txt_exists BOOLEAN,
  llms_txt_content TEXT,
  llms_txt_score INTEGER CHECK (llms_txt_score BETWEEN 0 AND 100),
  llms_txt_issues TEXT[] DEFAULT '{}',

  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, page_url, scan_id)
);

-- -----------------------------------------------
-- 6. INDEXES
-- -----------------------------------------------

CREATE INDEX idx_entity_canonical_client ON entity_canonical(client_id, status);
CREATE INDEX idx_entity_canonical_active ON entity_canonical(client_id, version DESC)
  WHERE status = 'approved';
CREATE INDEX idx_entity_profiles_client ON entity_profiles(client_id);
CREATE INDEX idx_entity_profiles_status ON entity_profiles(client_id, status);
CREATE INDEX idx_entity_profiles_consistency ON entity_profiles(client_id, consistency_score ASC NULLS LAST);
CREATE INDEX idx_entity_tasks_client ON entity_tasks(client_id, status);
CREATE INDEX idx_entity_tasks_assigned ON entity_tasks(assigned_to, status)
  WHERE status IN ('pending', 'in_progress');
CREATE INDEX idx_entity_tasks_priority ON entity_tasks(client_id, priority_score DESC NULLS LAST)
  WHERE status = 'pending';
CREATE INDEX idx_entity_scans_client ON entity_scans(client_id, created_at DESC);
CREATE INDEX idx_entity_schema_client ON entity_schema_results(client_id, scanned_at DESC);

-- -----------------------------------------------
-- 7. RLS POLICIES (using fixed pattern from 0009)
-- -----------------------------------------------

ALTER TABLE entity_canonical ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_schema_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entity_canonical_agency_isolation" ON entity_canonical FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

CREATE POLICY "entity_profiles_agency_isolation" ON entity_profiles FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

CREATE POLICY "entity_tasks_agency_isolation" ON entity_tasks FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

CREATE POLICY "entity_scans_agency_isolation" ON entity_scans FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

CREATE POLICY "entity_schema_agency_isolation" ON entity_schema_results FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);
