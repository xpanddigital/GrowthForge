-- ============================================
-- MIGRATION 0012: REVIEW ENGINE
-- Review profiles, snapshots, competitor tracking,
-- sentiment analysis, campaigns, and highlights.
-- ============================================

-- -----------------------------------------------
-- 1. REVIEW PROFILES — one row per review platform per client
-- -----------------------------------------------

CREATE TABLE review_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (
    platform IN (
      -- Universal
      'google', 'trustpilot', 'facebook', 'yelp', 'bbb',
      -- SaaS / Tech
      'g2', 'capterra', 'product_hunt', 'trustradius',
      -- Legal
      'avvo', 'super_lawyers', 'martindale', 'lawyers_com',
      -- Home Services
      'homeadvisor', 'angi', 'houzz',
      -- Music / Entertainment
      'allmusic',
      -- E-commerce
      'amazon', 'sitejabber', 'reseller_ratings',
      -- Other
      'glassdoor', 'industry_specific'
    )
  ),

  -- Profile details
  profile_url TEXT,
  is_claimed BOOLEAN,

  -- Current metrics (updated each scan)
  total_reviews INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2),         -- e.g. 4.35
  rating_scale INTEGER NOT NULL DEFAULT 5,  -- Most platforms use 5, some use 10
  most_recent_review_date TIMESTAMPTZ,

  -- Review velocity (calculated from snapshots)
  review_velocity_30d NUMERIC(5,2),    -- Reviews per 30 days (recent)
  review_velocity_90d NUMERIC(5,2),    -- Reviews per 90 days (trend)

  -- Distribution breakdown
  rating_distribution JSONB DEFAULT '{}',
    -- { "5": 45, "4": 20, "3": 8, "2": 3, "1": 4 }

  -- Response tracking
  total_responded INTEGER NOT NULL DEFAULT 0,
  response_rate NUMERIC(5,2),           -- % of reviews with owner response

  -- Scan tracking
  last_scraped_at TIMESTAMPTZ,
  scrape_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, platform)
);

-- -----------------------------------------------
-- 2. REVIEW SNAPSHOTS — periodic snapshots for trending
-- -----------------------------------------------

CREATE TABLE review_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  snapshot_date DATE NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (
    period_type IN ('weekly', 'monthly')
  ),

  -- Aggregate across all platforms
  total_reviews_all_platforms INTEGER NOT NULL DEFAULT 0,
  average_rating_all_platforms NUMERIC(3,2),
  platforms_with_presence INTEGER NOT NULL DEFAULT 0,

  -- New reviews this period
  new_reviews_count INTEGER NOT NULL DEFAULT 0,

  -- Per-platform breakdown
  platform_breakdown JSONB NOT NULL DEFAULT '{}',

  -- Sentiment breakdown (across all new reviews this period)
  sentiment_breakdown JSONB DEFAULT '{}',

  -- Topic themes (AI-extracted from new reviews)
  top_topics JSONB DEFAULT '[]',

  -- Review Authority Score (composite)
  review_authority_score INTEGER CHECK (review_authority_score BETWEEN 0 AND 100),

  -- Delta from previous
  reviews_delta INTEGER,
  rating_delta NUMERIC(3,2),
  authority_score_delta INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, snapshot_date, period_type)
);

-- -----------------------------------------------
-- 3. REVIEW COMPETITORS
-- -----------------------------------------------

CREATE TABLE review_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  competitor_name TEXT NOT NULL,
  competitor_url TEXT,

  -- Per-platform competitor review data
  platform_data JSONB NOT NULL DEFAULT '{}',

  -- Aggregate competitor metrics
  total_reviews_all INTEGER NOT NULL DEFAULT 0,
  avg_rating_all NUMERIC(3,2),
  platforms_count INTEGER NOT NULL DEFAULT 0,

  last_scraped_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, competitor_name)
);

-- -----------------------------------------------
-- 4. INDIVIDUAL REVIEWS — scraped review content
-- -----------------------------------------------

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  review_profile_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,

  -- Review content
  platform TEXT NOT NULL,
  reviewer_name TEXT,
  reviewer_url TEXT,
  review_text TEXT,
  rating NUMERIC(3,1),
  review_date TIMESTAMPTZ,
  review_url TEXT,

  -- AI analysis (populated by sentiment analyzer)
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score NUMERIC(3,2),    -- -1.0 to 1.0 (fine-grained)
  topics TEXT[] DEFAULT '{}',
  key_phrases TEXT[] DEFAULT '{}',

  -- Owner response tracking
  has_owner_response BOOLEAN NOT NULL DEFAULT false,
  owner_response_text TEXT,
  owner_response_date TIMESTAMPTZ,

  -- Curation flags
  is_highlighted BOOLEAN NOT NULL DEFAULT false,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,

  -- Deduplication
  content_hash TEXT NOT NULL,

  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, content_hash)
);

-- -----------------------------------------------
-- 5. REVIEW CAMPAIGNS — review request management
-- -----------------------------------------------

CREATE TABLE review_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Target
  target_platform TEXT NOT NULL,
  target_url TEXT NOT NULL,
  target_count INTEGER,

  -- Method
  method TEXT NOT NULL DEFAULT 'email' CHECK (
    method IN ('email', 'sms', 'qr_code', 'in_app', 'manual')
  ),

  -- Message template
  subject_line TEXT,
  message_template TEXT NOT NULL,

  -- Status (human-in-the-loop — campaigns must be approved before sending)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'review', 'approved', 'active', 'paused', 'completed', 'cancelled')
  ),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  -- Tracking
  requests_sent INTEGER NOT NULL DEFAULT 0,
  requests_opened INTEGER NOT NULL DEFAULT 0,
  reviews_received INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5,2),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual campaign recipients
CREATE TABLE review_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES review_campaigns(id) ON DELETE CASCADE,

  -- Recipient info
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,

  -- Tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'opened', 'clicked', 'reviewed', 'bounced', 'opted_out')
  ),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,

  -- If they actually left a review, link it
  review_id UUID REFERENCES reviews(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 6. REVIEW RESPONSE TEMPLATES
-- -----------------------------------------------

CREATE TABLE review_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  sentiment_target TEXT NOT NULL CHECK (
    sentiment_target IN ('positive', 'neutral', 'negative')
  ),

  -- Template with variables: {reviewer_name}, {business_name}, {specific_praise}, {specific_concern}
  template_text TEXT NOT NULL,

  -- Vertical targeting
  vertical TEXT DEFAULT 'general',

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- 7. INDEXES
-- -----------------------------------------------

CREATE INDEX idx_review_profiles_client ON review_profiles(client_id);
CREATE INDEX idx_review_profiles_platform ON review_profiles(client_id, platform);
CREATE INDEX idx_review_snapshots_client ON review_snapshots(client_id, snapshot_date DESC);
CREATE INDEX idx_review_competitors_client ON review_competitors(client_id, is_active);
CREATE INDEX idx_reviews_client ON reviews(client_id, review_date DESC);
CREATE INDEX idx_reviews_profile ON reviews(review_profile_id, review_date DESC);
CREATE INDEX idx_reviews_sentiment ON reviews(client_id, sentiment);
CREATE INDEX idx_reviews_highlighted ON reviews(client_id, is_highlighted) WHERE is_highlighted = true;
CREATE INDEX idx_reviews_flagged ON reviews(client_id, is_flagged) WHERE is_flagged = true;
CREATE INDEX idx_reviews_hash ON reviews(content_hash);
CREATE INDEX idx_review_campaigns_client ON review_campaigns(client_id, status);
CREATE INDEX idx_review_recipients_campaign ON review_campaign_recipients(campaign_id, status);
CREATE INDEX idx_review_response_templates_agency ON review_response_templates(agency_id, sentiment_target);

-- -----------------------------------------------
-- 8. RLS POLICIES (using non-recursive pattern from 0009)
-- -----------------------------------------------

ALTER TABLE review_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_response_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_profiles_agency_isolation" ON review_profiles FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

CREATE POLICY "review_snapshots_agency_isolation" ON review_snapshots FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

CREATE POLICY "review_competitors_agency_isolation" ON review_competitors FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

CREATE POLICY "reviews_agency_isolation" ON reviews FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

CREATE POLICY "review_campaigns_agency_isolation" ON review_campaigns FOR ALL USING (
  client_id IN (
    SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
  )
);

CREATE POLICY "review_recipients_agency_isolation" ON review_campaign_recipients FOR ALL USING (
  campaign_id IN (
    SELECT id FROM review_campaigns WHERE client_id IN (
      SELECT id FROM clients WHERE agency_id = public.get_user_agency_id()
    )
  )
);

CREATE POLICY "review_templates_agency_isolation" ON review_response_templates FOR ALL USING (
  agency_id = public.get_user_agency_id()
);
