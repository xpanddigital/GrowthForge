# Review Engine Module — Complete Specification

## Read First

Before building this module, read `CLAUDE.md` in the project root completely. It contains the full Phase 1 spec including database schema, agent abstraction layer, directory structure, and all architectural patterns. Everything in this document EXTENDS that spec. Never contradict it.

The Citation Engine (Phase 1), AI Monitor (Phase 2), and Entity Sync (Phase 2) should be built before this module. Follow the same patterns established in those modules: agent namespaces in the registry, `logAgentAction`/`logAgentActionBg` wrapping, typed Inngest events, `callSonnet`/`callOpus`/`parseClaudeJson` helpers, `withRetry` for external calls, admin Supabase client for server operations, RLS on every table.

**Important:** The existing codebase has migrations through 0009 (fix_rls_recursion). AI Monitor is 0010, Entity Sync is 0011. This module's migration is **0012**.

---

## Module Purpose

The Review Engine tracks review presence across platforms, analyzes sentiment and topic themes, monitors review velocity, compares against competitors, manages review request campaigns, and curates review highlights for reporting and marketing. Reviews are the #1 signal AI models use when deciding which brands to recommend — user-generated content ranks above brand content and earned media in LLM trust hierarchies.

**Primary metric: Review Authority Score** — a composite 0-100 score combining total review volume, average rating, review velocity, platform coverage, and competitive gap. This feeds into the overall AI Visibility Score via the audit composite.

### Why Reviews Matter for GEO

AI models synthesize recommendations from multiple signals. When Perplexity says "RUN Music is highly rated by users," it's pulling from review platforms. When ChatGPT lists "top-rated personal injury lawyers in Perth," it's weighted by Google review count and rating. The brands with the most reviews, on the most platforms, with the highest velocity, dominate AI recommendations.

The Review Engine proves this by correlating review metrics with AI Monitor SoM data.

---

## What Already Exists

The audit pillar `review-scan.agent.ts` (Phase 1) runs a one-time scan of review platforms. It produces findings and a score stored in `audit_pillar_results` (migration 0007 — audits table). The Review Engine makes this an **ongoing monitoring tool** with historical trending, competitor benchmarking, sentiment analysis, campaign management, and curated highlights.

Entity Sync (Phase 2) discovers review platform presence (Trustpilot, G2, Yelp, etc.) but only tracks whether a profile exists and whether the description is consistent. The Review Engine handles the actual review data — counts, ratings, velocity, sentiment, individual review content.

**Shared platforms between Entity Sync and Review Engine:**
- Entity Sync tracks: profile exists? → description consistent? → claimed?
- Review Engine tracks: how many reviews? → what rating? → what velocity? → what sentiment?
- No duplication — different data, same platforms, linked by `client_id` + `platform`

---

## Migration 0012: Review Engine

```sql
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
    -- { "google": { "total": 48, "rating": 4.3, "new": 5, "velocity_30d": 1.7 },
    --   "trustpilot": { "total": 12, "rating": 4.1, "new": 2, "velocity_30d": 0.7 } }

  -- Sentiment breakdown (across all new reviews this period)
  sentiment_breakdown JSONB DEFAULT '{}',
    -- { "positive": 5, "neutral": 1, "negative": 1 }

  -- Topic themes (AI-extracted from new reviews)
  top_topics JSONB DEFAULT '[]',
    -- [ { "topic": "customer service", "count": 4, "sentiment": "positive" },
    --   { "topic": "response time", "count": 3, "sentiment": "mixed" } ]

  -- Review Authority Score (composite)
  review_authority_score INTEGER CHECK (review_authority_score BETWEEN 0 AND 100),

  -- Delta from previous
  reviews_delta INTEGER,               -- Change in total reviews
  rating_delta NUMERIC(3,2),           -- Change in average rating
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
    -- { "google": { "total": 187, "rating": 3.9, "velocity_30d": 5.2, "profile_url": "..." },
    --   "trustpilot": { "total": 450, "rating": 3.4, "velocity_30d": 12.1 } }

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
  reviewer_url TEXT,               -- Link to reviewer profile if available
  review_text TEXT,
  rating NUMERIC(3,1),             -- e.g. 4.0, 4.5
  review_date TIMESTAMPTZ,
  review_url TEXT,                  -- Direct link to this review

  -- AI analysis (populated by sentiment analyzer)
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score NUMERIC(3,2),    -- -1.0 to 1.0 (fine-grained)
  topics TEXT[] DEFAULT '{}',      -- AI-extracted topics: ['customer service', 'pricing', 'quality']
  key_phrases TEXT[] DEFAULT '{}', -- Notable phrases for highlight curation

  -- Owner response tracking
  has_owner_response BOOLEAN NOT NULL DEFAULT false,
  owner_response_text TEXT,
  owner_response_date TIMESTAMPTZ,

  -- Curation flags
  is_highlighted BOOLEAN NOT NULL DEFAULT false,  -- Manually curated for reporting
  is_flagged BOOLEAN NOT NULL DEFAULT false,       -- Flagged for attention (negative, needs response)
  flag_reason TEXT,

  -- Deduplication
  content_hash TEXT NOT NULL,      -- SHA256 of normalized(reviewer_name + review_text + platform)

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
  target_platform TEXT NOT NULL,    -- Which platform to direct reviewers to
  target_url TEXT NOT NULL,         -- Direct link to leave a review
  target_count INTEGER,             -- Goal: how many reviews to collect

  -- Method
  method TEXT NOT NULL DEFAULT 'email' CHECK (
    method IN ('email', 'sms', 'qr_code', 'in_app', 'manual')
  ),

  -- Message template
  subject_line TEXT,                -- For email campaigns
  message_template TEXT NOT NULL,   -- The review request message
    -- Supports variables: {customer_name}, {business_name}, {review_url}, {service_date}

  -- Status (human-in-the-loop — campaigns must be approved before sending)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'review', 'approved', 'active', 'paused', 'completed', 'cancelled')
  ),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  -- Tracking
  requests_sent INTEGER NOT NULL DEFAULT 0,
  requests_opened INTEGER NOT NULL DEFAULT 0,  -- Email open tracking
  reviews_received INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5,2),                -- reviews_received / requests_sent

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual campaign recipients (for tracking who was asked)
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
-- 8. RLS POLICIES
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
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "review_snapshots_agency_isolation" ON review_snapshots FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "review_competitors_agency_isolation" ON review_competitors FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "reviews_agency_isolation" ON reviews FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "review_campaigns_agency_isolation" ON review_campaigns FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "review_recipients_agency_isolation" ON review_campaign_recipients FOR ALL USING (
  campaign_id IN (
    SELECT rc.id FROM review_campaigns rc
    JOIN clients c ON c.id = rc.client_id
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "review_templates_agency_isolation" ON review_response_templates FOR ALL USING (
  agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
```

---

## Review Authority Score

Composite metric that feeds into the overall audit AI Visibility Score and monthly reports.

```typescript
// src/lib/reviews/authority-score.ts

export function calculateReviewAuthorityScore(data: {
  totalReviews: number;
  averageRating: number;
  ratingScale: number;
  platformCount: number;
  totalPlatformsRelevant: number;
  velocity30d: number;
  responseRate: number;
  topCompetitorReviews: number;
  topCompetitorRating: number;
}): number {
  // Volume score (log scale — diminishing returns after ~200)
  // 0 reviews = 0, 10 = 30, 50 = 55, 100 = 70, 200 = 85, 500+ = 100
  const volumeScore = Math.min(100, Math.round(
    Math.log10(Math.max(1, data.totalReviews)) * 35
  ));

  // Rating score (normalized to 0-100 from the platform's scale)
  const ratingScore = data.averageRating
    ? Math.round((data.averageRating / data.ratingScale) * 100)
    : 0;

  // Coverage score: % of relevant platforms with presence
  const coverageScore = data.totalPlatformsRelevant > 0
    ? Math.round((data.platformCount / data.totalPlatformsRelevant) * 100)
    : 0;

  // Velocity score: review momentum (0 = dead, 5+/month = healthy)
  const velocityScore = Math.min(100, Math.round(data.velocity30d * 20));

  // Response rate score
  const responseScore = Math.round(data.responseRate || 0);

  // Competitive gap: how do we compare to top competitor?
  const competitiveScore = data.topCompetitorReviews > 0
    ? Math.min(100, Math.round((data.totalReviews / data.topCompetitorReviews) * 100))
    : 50; // No competitor data = neutral

  return Math.round(
    volumeScore * 0.25 +
    ratingScore * 0.20 +
    coverageScore * 0.15 +
    velocityScore * 0.15 +
    responseScore * 0.10 +
    competitiveScore * 0.15
  );
}
```

---

## Agent Implementations

### Registry Extension

```typescript
// Add to src/lib/agents/registry.ts

import { GoogleReviewsAgent } from './review/google-reviews.agent';
import { PlatformReviewsAgent } from './review/platform-reviews.agent';
import { SentimentAnalyzerAgent } from './review/sentiment-analyzer.agent';
import { ReviewResponseAgent } from './review/response-generator.agent';

export const agents = {
  // ... existing agents ...

  review: {
    google: new GoogleReviewsAgent(),
    platform: new PlatformReviewsAgent(),
    sentiment: new SentimentAnalyzerAgent(),
    responseGenerator: new ReviewResponseAgent(),
  },
} as const;
```

### Agent Interfaces

Add to `src/lib/agents/interfaces.ts`:

```typescript
// --- Review Engine Agent Interfaces ---

export interface ReviewScanInput {
  clientName: string;
  clientUrl: string;
  platform: string;
  existingProfileUrl?: string;
  location?: string;           // For local businesses: "Perth, Western Australia"
}

export interface ReviewScanResult {
  platform: string;
  found: boolean;
  profileUrl: string | null;
  isClaimed: boolean | null;
  totalReviews: number;
  averageRating: number | null;
  ratingScale: number;
  mostRecentReviewDate: string | null;
  ratingDistribution: Record<string, number>;
  totalResponded: number;
  recentReviews: Array<{
    reviewerName: string | null;
    reviewText: string | null;
    rating: number;
    reviewDate: string | null;
    reviewUrl: string | null;
    hasOwnerResponse: boolean;
    ownerResponseText: string | null;
  }>;
  scrapeError: string | null;
}

export interface SentimentAnalysisInput {
  reviews: Array<{
    id: string;
    reviewText: string;
    rating: number;
    platform: string;
  }>;
  clientName: string;
  clientVertical: string;
}

export interface SentimentAnalysisResult {
  reviews: Array<{
    id: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    sentimentScore: number;      // -1.0 to 1.0
    topics: string[];
    keyPhrases: string[];
    shouldFlag: boolean;
    flagReason: string | null;
  }>;
  aggregateTopics: Array<{
    topic: string;
    count: number;
    avgSentiment: 'positive' | 'neutral' | 'negative';
  }>;
}

export interface ReviewResponseInput {
  reviewText: string;
  reviewerName: string | null;
  rating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  clientName: string;
  clientToneGuidelines: string | null;
}

export interface ReviewResponseResult {
  responseText: string;
  tone: string;
}
```

### Agent 1: Google Reviews Agent

**File:** `src/lib/agents/review/google-reviews.agent.ts`

```typescript
// Google Reviews are the most important review source for local businesses
// and carry heavy weight in AI model recommendations.
//
// Scraping method: Apify google-maps-scraper OR SerpApi Places API
//
// Option A: Apify (preferred if already in stack)
//   Actor: apify/google-maps-scraper
//   Input: { searchStringsArray: ["{clientName} {location}"], maxReviews: 50 }
//   Output: place data with reviews array
//   Extracts: total reviews, average rating, individual reviews with text
//
// Option B: SerpApi Google Maps Reviews API
//   If SerpApi is already added for AI Overviews, this is a natural extension
//   Endpoint: https://serpapi.com/search?engine=google_maps_reviews
//   Input: data_id (Google Place ID) or place_id
//   Returns: structured review data with pagination
//
// Recommendation: Use whichever is already available. If both are available,
// prefer Apify for Google Reviews (cheaper per-scrape cost).
//
// Google-specific data to extract:
// - Total review count
// - Average rating (1-5 stars)
// - Rating distribution (5-star: 45, 4-star: 20, etc.)
// - Up to 50 most recent reviews with full text
// - Owner response tracking (has_response + response text)
// - Review date
// - Reviewer name and profile link
//
// Rate limiting: 1 request per business, throttle via Apify actor settings
```

### Agent 2: Platform Reviews Agent

**File:** `src/lib/agents/review/platform-reviews.agent.ts`

```typescript
// Generic review scraper for non-Google platforms.
// Uses Apify actors or Google Search discovery + scraping.
//
// Platform-specific scraping approaches:
//
// Trustpilot: Apify trustpilot-scraper
//   - Well-structured data, reliable scraping
//   - Returns reviews with star rating, text, date, author
//
// G2: Apify web-scraper with G2 product page URL
//   - Extract from review cards: rating, title, text, date
//   - G2 uses 5-star scale
//
// Capterra: Apify web-scraper with Capterra product page URL
//   - Similar structure to G2
//
// Yelp: Apify yelp-scraper
//   - Returns business info + reviews
//   - Yelp is aggressive about bot detection — use Apify residential proxies
//
// BBB: Google Search discovery ("site:bbb.org {clientName}")
//   - Extract rating and complaint count from BBB page
//   - BBB uses letter grade (A+ through F), convert to numeric
//
// Avvo: Google Search discovery ("site:avvo.com {clientName}")
//   - Extract Avvo rating (1-10 scale) and review count
//
// Facebook: Apify facebook-reviews-scraper
//   - Facebook reviews are public on business pages
//
// HomeAdvisor / Angi: Google Search + web scraping
//   - Extract star rating and review count from listing page
//
// For platforms without a dedicated Apify actor:
//   1. Google Search: "{clientName} site:{platform_domain}"
//   2. Take first result that looks like a profile/listing page
//   3. Scrape with Apify cheerio-scraper or web-scraper
//   4. Use Claude Sonnet to extract structured review data from raw HTML
//      (this handles the variety of page layouts)
//
// Error handling: Platform failures should never block the scan.
// Log error, return { found: false, scrapeError: "..." }, continue.
```

### Agent 3: Sentiment Analyzer Agent

**File:** `src/lib/agents/review/sentiment-analyzer.agent.ts`

```typescript
// Analyzes review text for sentiment, topics, and key phrases.
// Uses Claude Sonnet (classification task — fast, cheap, accurate).
//
// Processes reviews in batches of up to 20 per API call.
//
// For each review:
// - sentiment: positive / neutral / negative
// - sentimentScore: -1.0 to 1.0 (fine-grained, useful for trending)
// - topics: extracted topic themes (e.g. "customer service", "pricing",
//   "wait time", "expertise", "communication", "results", "value")
// - keyPhrases: notable phrases for highlight curation
//   (e.g. "best lawyer I've ever worked with", "saved my business")
// - shouldFlag: true if review needs attention (negative sentiment,
//   mentions specific complaints, contains actionable feedback)
// - flagReason: why it's flagged
//
// Aggregate output:
// - Top topics across all reviews with average sentiment per topic
// - This feeds into the snapshot's top_topics field
//
// Prompt should be vertical-aware:
// - Legal: look for topics like "case outcome", "communication",
//   "billing transparency", "courtroom experience"
// - Music: look for "deal terms", "transparency", "payout speed",
//   "artist support", "catalog valuation"
// - Home Services: "quality of work", "on time", "budget",
//   "cleanup", "professionalism"
//
// Credit cost: 0 — included in the review scan credit cost
// (Sentiment analysis is cheap enough with Sonnet batching to bundle in)

export class SentimentAnalyzerAgent {
  name = 'SentimentAnalyzerAgent';

  async analyze(input: SentimentAnalysisInput): Promise<SentimentAnalysisResult> {
    // Batch reviews into groups of 20
    const batches = chunk(input.reviews, 20);
    const allResults: SentimentAnalysisResult['reviews'] = [];

    for (const batch of batches) {
      const response = await callSonnet({
        system: 'Analyze review sentiment, extract topics and key phrases. Return ONLY valid JSON.',
        prompt: `Analyze these ${input.clientName} reviews (${input.clientVertical} industry).

REVIEWS:
${batch.map((r, i) => `[${r.id}] (${r.platform}, ${r.rating} stars): "${r.reviewText}"`).join('\n\n')}

For each review, return:
{
  "reviews": [
    {
      "id": "the review id",
      "sentiment": "positive|neutral|negative",
      "sentiment_score": -1.0 to 1.0,
      "topics": ["topic1", "topic2"],
      "key_phrases": ["notable phrase 1"],
      "should_flag": boolean,
      "flag_reason": "string or null"
    }
  ]
}

Flag reviews that: are strongly negative (1-2 stars with specific complaints), contain actionable feedback the business should address, mention competitor advantages, or suggest a service failure.`,
      });

      const parsed = parseClaudeJson(response);
      allResults.push(...(parsed.reviews || []));
    }

    // Aggregate topics
    const topicCounts: Record<string, { count: number; sentiments: number[] }> = {};
    for (const review of allResults) {
      for (const topic of review.topics) {
        if (!topicCounts[topic]) topicCounts[topic] = { count: 0, sentiments: [] };
        topicCounts[topic].count++;
        topicCounts[topic].sentiments.push(review.sentimentScore);
      }
    }

    const aggregateTopics = Object.entries(topicCounts)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        avgSentiment: (data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length) > 0.2
          ? 'positive' as const
          : (data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length) < -0.2
            ? 'negative' as const
            : 'neutral' as const,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      reviews: allResults.map(r => ({
        id: r.id,
        sentiment: r.sentiment,
        sentimentScore: r.sentiment_score,
        topics: r.topics,
        keyPhrases: r.key_phrases,
        shouldFlag: r.should_flag,
        flagReason: r.flag_reason,
      })),
      aggregateTopics,
    };
  }
}
```

### Agent 4: Review Response Generator

**File:** `src/lib/agents/review/response-generator.agent.ts`

```typescript
// Generates owner response drafts for reviews.
// Uses Claude Opus (quality matters — these are public-facing).
//
// Human-in-the-loop: generated responses are DRAFTS.
// The user must review, edit, and approve before posting.
// MentionLayer never auto-posts responses.
//
// Response strategy by sentiment:
// - Positive: Thank, reinforce specific praise, subtle re-engagement
// - Neutral: Acknowledge, address any specific points, invite further engagement
// - Negative: Empathize, address concerns specifically, offer resolution path,
//   take conversation offline (provide contact), never be defensive
//
// Tone: Uses client.tone_guidelines if available.
// Length: 2-4 sentences for positive, 3-5 for negative (enough to address
//   concerns but not so long it looks rehearsed).
//
// Credit cost: 5 credits per response draft (Opus call)

export class ReviewResponseAgent {
  name = 'ReviewResponseAgent';

  async generate(input: ReviewResponseInput): Promise<ReviewResponseResult> {
    const response = await callOpus({
      system: `You write professional, empathetic review responses for businesses.
Never be defensive. Never use corporate jargon. Never say "we take all feedback seriously"
or any generic phrases. Be specific to what the reviewer said.
${input.clientToneGuidelines ? `Tone guidelines: ${input.clientToneGuidelines}` : ''}`,
      prompt: `Write an owner response to this review of ${input.clientName}.

Review by ${input.reviewerName || 'a customer'} (${input.rating} stars):
"${input.reviewText}"

Sentiment: ${input.sentiment}
Topics mentioned: ${input.topics.join(', ')}

Requirements:
- ${input.sentiment === 'positive' ? 'Thank them specifically for what they praised. Keep it warm and brief (2-3 sentences).' : ''}
- ${input.sentiment === 'negative' ? 'Empathize genuinely. Address their specific concern. Offer a path to resolution. Provide a way to continue the conversation offline (invite them to email/call). 3-5 sentences.' : ''}
- ${input.sentiment === 'neutral' ? 'Acknowledge their experience. Address any specific points. Invite them back. 2-4 sentences.' : ''}
- Sound like a real person, not a PR department
- Reference specific details from their review

Return ONLY the response text, nothing else.`,
    });

    return {
      responseText: response,
      tone: input.sentiment === 'negative' ? 'empathetic' : 'grateful',
    };
  }
}
```

---

## Core Scan Pipeline

```typescript
// src/lib/reviews/run-review-scan.ts
//
// Step 1: Load client data + determine relevant review platforms for vertical
// Step 2: Check credits
// Step 3: For each platform:
//   3a: Scrape reviews (Google agent for Google, Platform agent for others)
//       Fetch up to 50 most recent reviews per platform
//   3b: Upsert review_profiles with current metrics
//   3c: Insert new individual reviews (deduplicate via content_hash)
//   3d: Run sentiment analysis on new (unanalyzed) reviews
//   3e: Auto-flag negative reviews that need attention
// Step 4: Scrape competitor reviews (top 3 competitors, same platforms)
//   4a: Upsert review_competitors with current metrics
// Step 5: Calculate review velocity (compare to last snapshot)
// Step 6: Generate snapshot with Review Authority Score
// Step 7: Deduct credits

// Platform selection by vertical:
const REVIEW_PLATFORMS_BY_VERTICAL: Record<string, string[]> = {
  general: ['google', 'trustpilot', 'facebook', 'bbb'],
  legal: ['google', 'avvo', 'super_lawyers', 'martindale', 'yelp', 'facebook', 'bbb'],
  music: ['google', 'trustpilot', 'facebook'],
  home_services: ['google', 'homeadvisor', 'angi', 'houzz', 'yelp', 'bbb', 'facebook'],
  construction: ['google', 'homeadvisor', 'angi', 'houzz', 'yelp', 'bbb', 'facebook'],
  saas: ['google', 'g2', 'capterra', 'trustpilot', 'product_hunt', 'trustradius'],
  ecommerce: ['google', 'trustpilot', 'sitejabber', 'reseller_ratings', 'bbb', 'amazon'],
  finance: ['google', 'trustpilot', 'bbb', 'yelp'],
};

// Credit costs:
// Full review scan (all platforms + competitors): 10 credits
// Single platform scan: 3 credits
// Response draft generation: 5 credits per response
```

---

## Review Velocity Calculation

```typescript
// src/lib/reviews/velocity.ts
//
// Review velocity = new reviews per unit time
//
// Calculated by comparing current snapshot to previous snapshots:
// - velocity_30d: (current_total - total_30_days_ago) / 1 month
// - velocity_90d: (current_total - total_90_days_ago) / 3 months
//
// If no previous snapshot exists, estimate from most_recent_review_date:
// - If most recent review was 7 days ago: velocity ≈ reviews_in_last_month
// - If most recent review was 90 days ago: velocity ≈ 0 (stale)
//
// Velocity is critical for GEO because AI models weight recency.
// A business with 200 reviews but 0 in the last 6 months looks abandoned.
// A business with 50 reviews but 5 this month looks active.
//
// The dashboard should show velocity with directional arrows:
// ▲ accelerating (this month > last month)
// ► steady (roughly the same)
// ▼ decelerating (this month < last month)
```

---

## Review Campaign System

### Campaign Templates

Pre-seed templates for common review request scenarios:

**Post-Service Email (General):**
```
Subject: Quick favor, {customer_name}?

Hi {customer_name},

Thanks for choosing {business_name}. We hope everything went well.

If you have 60 seconds, a quick review would mean the world to us:
{review_url}

No pressure — we're just grateful for your trust.

Best,
The {business_name} Team
```

**Post-Case Email (Legal):**
```
Subject: A moment of your time, {customer_name}?

Dear {customer_name},

We're glad we could help with your case. Your experience matters to
us — and to others who might be going through something similar.

If you're comfortable sharing, a brief review here would help
others find the support they need: {review_url}

Thank you for trusting us with your case.

Warm regards,
{business_name}
```

**Post-Project Email (Home Services):**
```
Subject: How did we do, {customer_name}?

Hey {customer_name},

Hope you're enjoying the finished project! We had a great time
working on it.

Got 30 seconds? A quick review helps other homeowners find
reliable contractors: {review_url}

Thanks for having us!

{business_name}
```

### Campaign Workflow

1. **Draft:** User creates campaign with template + recipient list (CSV upload or manual entry)
2. **Review:** Campaign is in review state — user previews messages
3. **Approve:** Agency admin approves (human-in-the-loop gate)
4. **Active:** Messages are sent via Resend (email) or logged for manual sending (SMS, QR)
5. **Tracking:** Open/click/review tracking via Resend webhooks (email) or manual confirmation
6. **Complete:** Campaign ends when target reached or manually stopped

**Note:** For Phase 1 of the Review Engine, campaigns can be email-only via Resend. SMS and QR code support are future enhancements. The schema supports them but the implementation can start simple.

---

## Inngest Jobs

```typescript
// Job: review.scan
// Trigger: User clicks "Run Review Scan" OR monthly cron
// Steps:
//   1. Load client + vertical + competitor list
//   2. Scrape all relevant platforms for client
//   3. Scrape same platforms for top 3 competitors
//   4. Insert/update review_profiles and individual reviews
//   5. Run sentiment analysis on new reviews
//   6. Calculate velocities
//   7. Generate snapshot with Review Authority Score
//   8. Deduct credits (10 for full scan)
//   9. Notify if any reviews are flagged for attention

// Job: review.scan-single
// Trigger: Manual single-platform scan
// Steps: Same as above but for one platform only. 3 credits.

// Job: review.generate-response
// Trigger: User clicks "Generate Response" on a review
// Steps:
//   1. Load review + client data
//   2. Call ReviewResponseAgent (Claude Opus)
//   3. Store draft response as a note on the review
//   4. Deduct 5 credits

// Job: review.send-campaign
// Trigger: Campaign status changes to 'active'
// Steps:
//   1. Load campaign + recipients
//   2. For each recipient with status 'pending':
//      a. Render message template with variables
//      b. Send via Resend (email) with tracking headers
//      c. Update recipient status to 'sent'
//   3. Batch send (max 50 per minute for Resend rate limiting)

// Cron: Monthly review scan for all active clients
// Add to vercel.json: { "path": "/api/cron/reviews", "schedule": "0 2 1 * *" }
// Runs 1st of month at 2am UTC
```

---

## API Routes

### POST /api/reviews/scan
Trigger review scan. Body: `{ clientId, scanType: 'full' | 'single', platform? }`. Returns `{ scanId }`.

### GET /api/reviews/profiles
Review profiles for a client. Query: `clientId`. Returns all platforms with current metrics.

### GET /api/reviews/feed
Recent reviews across all platforms. Query: `clientId, sentiment?, platform?, highlighted?, flagged?, limit, offset`. Sorted by review_date DESC.

### GET /api/reviews/snapshots
Snapshot history. Query: `clientId, periodType?, limit`.

### GET /api/reviews/competitors
Competitor review comparison. Query: `clientId`.

### POST /api/reviews/competitors
Add/update competitor. Body: `{ clientId, competitorName, competitorUrl? }`.

### POST /api/reviews/:reviewId/highlight
Toggle highlight flag on a review.

### POST /api/reviews/:reviewId/flag
Flag a review for attention. Body: `{ reason }`.

### POST /api/reviews/:reviewId/generate-response
Generate AI response draft. Body: `{ reviewId }`. Returns draft text. 5 credits.

### POST /api/reviews/campaigns
CRUD for review campaigns. Body includes template, target platform, recipient list.

### POST /api/reviews/campaigns/:id/approve
Approve campaign. Auth: agency_admin+.

### POST /api/reviews/campaigns/:id/activate
Start sending. Queues Inngest job.

### POST /api/reviews/campaigns/:id/pause
Pause active campaign.

### GET /api/reviews/campaigns/:id/recipients
Get recipient tracking data for a campaign.

### POST /api/reviews/campaigns/:id/recipients
Upload recipients. Body: CSV data or JSON array of `{ name, email, phone? }`.

### GET /api/reviews/templates
Review response templates. Query: `agencyId, sentimentTarget?, vertical?`.

### POST /api/reviews/templates
Create response template. Body: `{ name, sentimentTarget, templateText, vertical? }`.

---

## Dashboard UI

### Directory Structure

```
src/app/(dashboard)/reviews/
├── page.tsx                      # Review overview dashboard
├── feed/
│   └── page.tsx                  # All reviews chronological feed
├── [reviewId]/
│   └── page.tsx                  # Individual review detail + response
├── competitors/
│   └── page.tsx                  # Competitor comparison
├── campaigns/
│   ├── page.tsx                  # Campaign list
│   ├── new/page.tsx              # Create campaign wizard
│   └── [campaignId]/page.tsx     # Campaign detail + tracking
├── highlights/
│   └── page.tsx                  # Curated highlights for reporting
└── templates/
    └── page.tsx                  # Response template management

src/components/reviews/
├── authority-score-card.tsx       # Review Authority Score (hero)
├── platform-summary-grid.tsx     # Card per platform with count + rating
├── platform-card.tsx             # Individual platform metrics
├── review-feed.tsx               # Chronological review list
├── review-card.tsx               # Individual review with sentiment + actions
├── review-response-panel.tsx     # AI-generated response editor
├── competitor-table.tsx          # Side-by-side competitor comparison
├── competitor-gap-bar.tsx        # Visual: "You: 23 reviews vs Competitor: 187"
├── velocity-chart.tsx            # Review velocity trend over time
├── sentiment-breakdown.tsx       # Pie/bar chart of sentiment distribution
├── topic-cloud.tsx               # Topic themes from sentiment analysis
├── rating-distribution.tsx       # 5-star distribution bar chart
├── campaign-wizard.tsx           # Multi-step campaign creation
├── campaign-tracker.tsx          # Campaign progress + recipient stats
├── highlight-card.tsx            # Curated review for marketing use
└── review-onboarding.tsx         # Initial setup: select platforms + competitors
```

### Overview Page

```
┌──────────────────────────────────────────────────────────────┐
│  Review Engine — {Client Name}                                │
│                                                                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Authority   │  │  Total       │  │  Avg Rating           │ │
│  │   Score      │  │  Reviews     │  │                       │ │
│  │    58/100    │  │    48        │  │  ⭐ 4.3 / 5.0        │ │
│  │  ▲ +4        │  │  ▲ +7 (30d) │  │  ► stable             │ │
│  └─────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                │
│  Platform Breakdown                                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐    │
│  │ Google   │ Trustplt │ G2       │ Capterra │ BBB      │    │
│  │ ⭐4.5    │ ⭐3.8    │ ⭐4.7    │ —        │ A+       │    │
│  │ 35 revs  │ 8 revs   │ 5 revs   │ None     │ 0 revs   │    │
│  │ ▲ 3/mo   │ ► 1/mo   │ ► 0.5/mo │          │          │    │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘    │
│                                                                │
│  vs Competitors                                                │
│  ┌─────────────────────────────────────────────┐              │
│  │ You:        ███░░░░░░░░░░░░░  48 reviews    │              │
│  │ DistroKid:  ████████████████░  4,200 reviews │              │
│  │ TuneCore:   ██████████░░░░░░  1,800 reviews │              │
│  │ Gap to leader: 4,152 reviews                  │              │
│  └─────────────────────────────────────────────┘              │
│                                                                │
│  Velocity Trend (12 months)                                    │
│  ┌──────────────────────────────────────────┐                 │
│  │  ▓ ▓▓ ▓▓▓ ▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓▓▓  ← monthly new reviews    │
│  │  Apr May Jun Jul Aug Sep Oct Nov Dec Jan Feb Mar           │
│  └──────────────────────────────────────────┘                 │
│                                                                │
│  Sentiment (last 30 days)                                      │
│  ████████████████ 71% positive  ████ 14% neutral  ███ 14% neg │
│                                                                │
│  Top Topics: customer service (4), response time (3),          │
│              expertise (2), pricing (2)                         │
│                                                                │
│  ⚠️ 2 reviews need attention                                  │
│  ┌──────────────────────────────────────────────────┐         │
│  │ ⭐1 Google — "Waited 3 weeks with no update..."   │         │
│  │ [View] [Generate Response] [Dismiss]               │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                │
│  Active Campaigns: 1 running (15/50 sent)                      │
│  [📊 Highlights (5 curated)]                                   │
│                                                                │
│  [🔄 Run Scan]  [📝 New Campaign]  [⚙️ Configure]             │
└──────────────────────────────────────────────────────────────┘
```

### Review Card (in feed)

```
┌──────────────────────────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐ Google · Sarah M. · March 8, 2026                  │
│                                                                │
│ "RUN Music made the whole catalog financing process            │
│  transparent and straightforward. Diego personally walked      │
│  me through the valuation and I felt like they actually         │
│  cared about my music, not just the numbers."                  │
│                                                                │
│ Sentiment: 🟢 Positive (0.92) · Topics: transparency,         │
│ customer service, catalog valuation                             │
│                                                                │
│ Owner Response: ✅ Responded March 9                           │
│                                                                │
│ [⭐ Highlight] [🔗 View on Google] [💬 Generate Response]     │
└──────────────────────────────────────────────────────────────┘
```

---

## Cross-Module Integration

### Reviews → AI Monitor
Review volume and rating feed into the AI Visibility Score via the audit composite. When the Monitor detects an AI model citing "highly rated by users," it can cross-reference with actual review data to validate the claim.

### Reviews → Entity Sync
Entity Sync discovers review platform presence (profile exists, claimed status). Review Engine takes over from there with actual review monitoring. When Entity Sync finds an unclaimed Trustpilot profile, it creates an entity task AND flags it to the Review Engine as a new platform to monitor.

### Reviews → Unified Reporting
Monthly reports include: new reviews this month, rating trend, review velocity, sentiment breakdown, top highlights (curated quotes), competitor gap, and recommended actions.

### Reviews → AI Monitor Correlation
The correlation timeline should include review velocity as an input variable. If review volume spikes (from a campaign) and SoM rises 2-3 weeks later, that's a correlatable signal.

---

## Refresh Frequency

| Data Type | Frequency | Rationale |
|-----------|-----------|-----------|
| Review profiles (counts, ratings) | Monthly | Reviews accumulate slowly for most businesses |
| Individual reviews (content) | Monthly | Fetch recent reviews each scan |
| Competitor reviews | Monthly | Same cadence as client |
| Sentiment analysis | On each scan | Analyze new reviews as they arrive |
| Review Authority Score | Monthly (with snapshot) | Calculated from profile data |
| Campaign tracking | Real-time (webhook-driven) | Email open/click events from Resend |

For high-review-volume clients (100+ reviews/month), consider offering weekly scans as a premium option.

---

## Credit Costs

| Action | Credits | Notes |
|--------|---------|-------|
| Full review scan (all platforms + competitors) | 10 | Client + top 3 competitors |
| Single platform scan | 3 | One platform only |
| Response draft generation (per review) | 5 | Claude Opus for quality |
| Sentiment analysis | 0 | Included in scan cost |
| Campaign sending | 0 | Email cost covered by Resend plan |

**Monthly cost per client:** ~10-15 credits (1 full scan + occasional response drafts)

---

## Build Sequence

1. **Migration 0012** — all 7 tables
2. **Agent interfaces** — add Review Engine interfaces to `interfaces.ts`
3. **Google Reviews agent** — most important platform, build first
4. **Platform Reviews agent** — generic scraper for all other platforms
5. **Sentiment Analyzer agent** — batch Claude Sonnet analysis
6. **Review Response agent** — Claude Opus response drafts
7. **Registry extension** — add review namespace
8. **Review Authority Score calculator**
9. **Core scan pipeline** — `src/lib/reviews/run-review-scan.ts`
10. **Velocity calculator**
11. **Inngest jobs** — review.scan, review.scan-single, review.generate-response, review.send-campaign
12. **API routes** — `/api/reviews/*` + `/api/cron/reviews`
13. **Overview dashboard** — Authority Score + platform grid + competitor bars + velocity chart
14. **Review feed** — chronological list with sentiment tags + action buttons
15. **Review detail + response panel** — individual review with AI response generation
16. **Competitor comparison page**
17. **Campaign wizard** — create + template + recipients + approve + track
18. **Highlights page** — curated reviews for reporting
19. **Response template management**
20. **Test with live data** — Foyle Legal (legal vertical, Google + Avvo) + RUN Music

---

## Claude Code Prompt

```
Read CLAUDE.md in the project root completely before responding.
Read docs/MODULE_REVIEW_ENGINE.md completely before responding.

You are building the Review Engine module for MentionLayer.
The Citation Engine (Phase 1), AI Monitor, and Entity Sync are
already built and deployed. All architectural patterns (agent
abstraction, logAgentAction, RLS, Inngest jobs, credit tracking,
callSonnet/callOpus/parseClaudeJson helpers) are already in place.

This module tracks reviews across platforms by vertical, analyzes
sentiment with topic extraction, monitors velocity and competitor
gaps, manages review request campaigns with human-in-the-loop
approval, generates AI response drafts, and curates highlights
for reporting.

Follow the 20-step build sequence in the spec. Enter Plan Mode
first and propose your plan before writing any code. Do not modify
any existing module code.
```

---

## Notes

- Google Reviews is the single most important review source for local businesses (Foyle Legal, home services clients). Prioritize this agent.
- For SaaS clients, G2 and Capterra matter more than Google. The vertical-based platform selection handles this.
- Review velocity is the metric agencies can actually influence (through campaigns). Total review count vs competitors is useful for context but depressing at scale — focus the UI on velocity and trend direction.
- The competitor gap visualization ("You: 48 vs DistroKid: 4,200") is intentionally confrontational. It motivates campaign investment. But frame it constructively — show the velocity gap, not just the absolute gap.
- Sentiment analysis should run automatically on every scan. Don't make users trigger it separately.
- The campaign system is email-only for v1 via Resend. SMS requires Twilio integration (future). QR code generation is a simple feature to add later (generate a QR code image linking to the review URL).
- Review response generation uses Opus, not Sonnet. These are public-facing — quality matters. The human-in-the-loop gate ensures nothing gets posted without approval.
- The highlight curation feature is for the unified monthly report. Agencies want to show clients "look at these great reviews you got this month." Make the highlight toggle one-click.
- BBB uses letter grades (A+ through F), not star ratings. Convert to numeric for the authority score: A+=100, A=90, A-=85, B+=80, B=70, B-=65, C+=60, C=50, C-=45, D+=40, D=30, D-=25, F=10.
- Platform scraping WILL be fragile, especially Yelp and Facebook. Build generous error handling. One platform failure should never block the scan.
- No new vendor dependencies. Google Reviews via Apify (already in stack) or SerpApi (already added for AI Monitor). All other platforms via Apify scrapers. Sentiment via Claude (existing). Campaigns via Resend (existing).
