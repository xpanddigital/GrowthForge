# CLAUDE.md Addition — Audit Module

## Append to: Database Schema (after Migration 0006)

### Migration 0007: AI Visibility Audit

```sql
-- ============================================
-- MIGRATION 0007: AI VISIBILITY AUDIT
-- Runs across all 5 pillars to establish a baseline score.
-- Can be re-run monthly to track progress.
-- ============================================

CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Audit metadata
  audit_type TEXT NOT NULL DEFAULT 'full' CHECK (
    audit_type IN ('full', 'citation_only', 'ai_presence_only', 'quick')
    -- full: All 5 pillars (onboarding audit)
    -- citation_only: Just citation + AI presence (quick check)
    -- ai_presence_only: Just AI model testing
    -- quick: Citation + AI presence + entity (skip reviews + press)
  ),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  
  -- Composite score (calculated after all pillars complete)
  -- Weighted average: citations 25%, ai_presence 30%, entities 15%, reviews 15%, press 15%
  composite_score INTEGER CHECK (composite_score BETWEEN 0 AND 100),
  
  -- Individual pillar scores (denormalized for fast dashboard reads)
  citation_score INTEGER CHECK (citation_score BETWEEN 0 AND 100),
  ai_presence_score INTEGER CHECK (ai_presence_score BETWEEN 0 AND 100),
  entity_score INTEGER CHECK (entity_score BETWEEN 0 AND 100),
  review_score INTEGER CHECK (review_score BETWEEN 0 AND 100),
  press_score INTEGER CHECK (press_score BETWEEN 0 AND 100),
  
  -- AI-generated executive summary
  -- Claude synthesizes all pillar data into 3-4 paragraph narrative
  executive_summary TEXT,
  
  -- AI-generated prioritized action plan
  -- JSON array of recommended actions, ranked by impact
  -- [{ "priority": 1, "pillar": "ai_presence", "action": "...", "impact": "high", "effort": "low" }]
  action_plan JSONB DEFAULT '[]',
  
  -- Competitor comparison (optional — if competitor URLs provided)
  competitors_analyzed TEXT[] DEFAULT '{}',
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  credits_used INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Detailed results per pillar (the raw data behind each score)
CREATE TABLE audit_pillar_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  
  pillar TEXT NOT NULL CHECK (
    pillar IN ('citations', 'ai_presence', 'entities', 'reviews', 'press')
  ),
  
  -- Pillar-level score
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  
  -- Status of this specific pillar scan
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'skipped')
  ),
  
  -- Raw findings — structure varies by pillar type
  -- See pillar-specific schemas below
  findings JSONB NOT NULL DEFAULT '{}',
  
  -- AI-generated pillar summary (2-3 sentences)
  summary TEXT,
  
  -- AI-generated recommendations for this pillar
  -- [{ "action": "...", "impact": "high|medium|low", "effort": "high|medium|low" }]
  recommendations JSONB DEFAULT '[]',
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(audit_id, pillar)
);

-- Indexes
CREATE INDEX idx_audits_client ON audits(client_id, created_at DESC);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audit_pillars_audit ON audit_pillar_results(audit_id);

-- RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_pillar_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audits_agency_isolation" ON audits FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "audit_pillars_agency_isolation" ON audit_pillar_results FOR ALL USING (
  audit_id IN (
    SELECT a.id FROM audits a
    JOIN clients c ON c.id = a.client_id
    JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

---

## Audit Pillar Specifications

### Pillar 1: Citation Audit

**What it does:** Discovers how many high-authority threads exist for the client's keywords, and whether the client is already mentioned in them.

**Data sources:** Google SERPs (via Apify), Reddit/Quora/FB thread content

**Process:**
1. Run SERP scan for top 20 client keywords (same as discovery pipeline)
2. For each discovered thread, search the content for:
   - Client brand name (exact + fuzzy match)
   - Client URL (any of urls_to_mention)
   - Top 3 competitor names (if provided)
3. Classify threads by whether client is present, absent, or competitor is present

**Findings JSONB schema:**
```json
{
  "total_threads_found": 142,
  "threads_with_client_mention": 3,
  "threads_with_competitor_mention": 47,
  "threads_with_no_mentions": 92,
  "platform_breakdown": {
    "reddit": { "total": 89, "client_present": 2, "competitor_present": 31 },
    "quora": { "total": 38, "client_present": 1, "competitor_present": 12 },
    "facebook_groups": { "total": 15, "client_present": 0, "competitor_present": 4 }
  },
  "top_opportunities": [
    {
      "url": "https://reddit.com/r/...",
      "title": "Best playlist promotion services?",
      "google_position": 3,
      "relevance_score": 92,
      "comment_count": 47,
      "competitor_mentioned": "DistroKid",
      "client_mentioned": false
    }
  ],
  "competitor_share": {
    "DistroKid": 23,
    "TuneCore": 14,
    "CD Baby": 10
  },
  "gap_percentage": 97.9
}
```

**Scoring formula:**
```
citation_score = (
  (threads_with_client_mention / total_threads_found) * 40 +
  (1 - competitor_dominance_ratio) * 30 +
  opportunity_density * 30
)
// Where opportunity_density = threads with relevance > 70 / total threads
// A client with 0 mentions in 142 threads scores ~15-25 (lots of opportunity)
// A client dominating their threads scores 80-95
```

---

### Pillar 2: AI Presence Audit

**What it does:** Tests whether AI models mention the client when asked buying-intent questions about their category.

**Data sources:** ChatGPT API, Perplexity API, Gemini API, Claude API

**Process:**
1. Generate 10 buying-intent prompts from client keywords:
   - "What are the best {keyword} services?"
   - "Can you recommend a {keyword} provider?"
   - "I need help with {keyword} — what are my options?"
   - "Compare the top {keyword} companies"
   - "{keyword} alternatives to {competitor}"
2. Send each prompt to 4 AI models
3. Parse each response for:
   - Brand name mention (exact match)
   - Brand URL citation (link present)
   - Brand recommendation (mentioned as a recommendation vs just listed)
   - Competitor mentions
   - Sentiment of mention (positive/neutral/negative)

**Findings JSONB schema:**
```json
{
  "prompts_tested": 10,
  "models_tested": ["chatgpt", "perplexity", "gemini", "claude"],
  "total_tests": 40,
  "brand_mentioned_count": 2,
  "brand_linked_count": 0,
  "brand_recommended_count": 1,
  "share_of_model": {
    "chatgpt": { "mentioned": 1, "total": 10, "percentage": 10 },
    "perplexity": { "mentioned": 1, "total": 10, "percentage": 10 },
    "gemini": { "mentioned": 0, "total": 10, "percentage": 0 },
    "claude": { "mentioned": 0, "total": 10, "percentage": 0 }
  },
  "competitor_share_of_model": {
    "DistroKid": { "mentioned": 28, "total": 40, "percentage": 70 },
    "TuneCore": { "mentioned": 22, "total": 40, "percentage": 55 },
    "CD Baby": { "mentioned": 18, "total": 40, "percentage": 45 }
  },
  "sample_mentions": [
    {
      "model": "perplexity",
      "prompt": "Best music licensing services for independent artists",
      "mention_context": "RUN Music offers transparent short-term financing...",
      "sentiment": "positive",
      "sources_cited": ["reddit.com/r/...", "musicbusinessworldwide.com/..."]
    }
  ]
}
```

**Scoring formula:**
```
ai_presence_score = (
  overall_mention_rate * 50 +         // % of tests where brand appeared
  recommendation_rate * 30 +           // % where brand was recommended (not just listed)
  link_citation_rate * 20              // % where brand URL was cited
)
// A brand mentioned in 0/40 tests scores 0
// A brand mentioned in 5/40 tests scores ~15
// A brand mentioned in 20/40 and recommended in 10 scores ~55
// Market leader mentioned in 35/40 and recommended in 25 scores ~85
```

---

### Pillar 3: Entity Audit

**What it does:** Checks whether the client's brand identity is consistent and well-represented across key platforms that AI models reference.

**Data sources:** Google search (brand name), Apify web scraping, client's website

**Process:**
1. Search Google for "{brand name}" and collect the top 20 results
2. Identify which platforms the brand appears on:
   - Google Business Profile
   - LinkedIn company page
   - Crunchbase
   - Wikipedia / Wikidata
   - Industry directories (varies by vertical)
   - Social profiles (Twitter/X, Facebook, Instagram)
3. For each platform found, extract the brand description
4. Check client's website for schema markup (Organization, LocalBusiness, Product)
5. Use Claude to compare all descriptions for consistency:
   - Same business category?
   - Same value proposition?
   - Same contact info?
   - Same founding date / location?
   - Conflicting or outdated information?

**Findings JSONB schema:**
```json
{
  "platforms_checked": 12,
  "platforms_present": 7,
  "platforms_missing": ["crunchbase", "wikipedia", "g2", "capterra", "trustpilot"],
  "platform_details": {
    "google_business": { "present": true, "description_match": 85, "info_complete": true },
    "linkedin": { "present": true, "description_match": 72, "info_complete": false, "missing": ["website_url"] },
    "website_schema": { "has_organization_schema": true, "has_product_schema": false, "has_faq_schema": false }
  },
  "consistency_score": 71,
  "inconsistencies": [
    { "field": "business_description", "platforms": ["linkedin", "google_business"], "issue": "LinkedIn says 'music distribution' while Google says 'music licensing'" },
    { "field": "founding_year", "platforms": ["crunchbase", "website"], "issue": "Crunchbase says 2019, website says 2018" }
  ],
  "schema_markup_present": ["Organization"],
  "schema_markup_missing": ["Product", "FAQ", "BreadcrumbList"],
  "knowledge_panel_exists": false
}
```

**Scoring formula:**
```
entity_score = (
  (platforms_present / platforms_checked) * 25 +
  consistency_score * 0.35 +
  schema_completeness * 20 +
  knowledge_panel_bonus * 20       // +20 if Google Knowledge Panel exists
)
```

---

### Pillar 4: Review Audit

**What it does:** Assesses the client's review presence across platforms that AI models weight heavily.

**Data sources:** Google Maps API or scraping, Apify actors for review sites

**Process:**
1. Search for client on: Google Reviews, Trustpilot, G2, Capterra, Yelp, industry-specific sites
2. For each platform, collect: total reviews, average rating, most recent review date, review velocity (reviews per month over last 6 months)
3. Run the same search for top 3 competitors
4. Use Claude to analyze sentiment distribution from review snippets

**Findings JSONB schema:**
```json
{
  "platforms_checked": 8,
  "platforms_with_reviews": 3,
  "total_reviews": 23,
  "average_rating": 4.2,
  "review_velocity": 1.8,
  "most_recent_review": "2026-02-15",
  "platform_breakdown": {
    "google": { "reviews": 18, "rating": 4.3, "velocity": 1.2 },
    "trustpilot": { "reviews": 5, "rating": 3.8, "velocity": 0.6 },
    "g2": { "reviews": 0, "present": false },
    "capterra": { "reviews": 0, "present": false }
  },
  "competitor_comparison": {
    "DistroKid": { "total_reviews": 4200, "avg_rating": 3.9, "platforms": 6 },
    "TuneCore": { "total_reviews": 1800, "avg_rating": 3.4, "platforms": 5 }
  },
  "sentiment_distribution": {
    "positive": 17,
    "neutral": 3,
    "negative": 3
  },
  "review_gap_vs_top_competitor": 4177
}
```

**Scoring formula:**
```
review_score = (
  platform_coverage * 20 +           // % of key platforms with presence
  rating_score * 25 +                 // (avg_rating / 5) * 100
  volume_score * 25 +                 // log scale: 0=0, 10=30, 50=60, 200+=100
  recency_score * 15 +                // reviews in last 90 days
  velocity_vs_competitor * 15         // review velocity relative to top competitor
)
```

---

### Pillar 5: Press / Earned Media Audit

**What it does:** Measures the client's third-party media footprint — the signals that AI models use to determine brand authority.

**Data sources:** Google News, Google web search, Apify news scraper

**Process:**
1. Search Google News for "{brand name}" (last 12 months)
2. Search Google for "{brand name}" -site:{client_domain} (third-party mentions)
3. Search for "{founder name} {brand name}" (thought leadership)
4. For each mention found, classify: press release, news article, guest post, podcast, award/list, social mention
5. Estimate domain authority of each mentioning site (use Google position as proxy, or Moz/Ahrefs API if available)
6. Check for unlinked mentions (brand name appears but no link back)

**Findings JSONB schema:**
```json
{
  "total_mentions": 14,
  "mention_types": {
    "news_article": 3,
    "press_release": 5,
    "guest_post": 1,
    "podcast": 0,
    "award_or_list": 2,
    "social_mention": 3
  },
  "high_authority_mentions": 4,
  "unique_publications": 8,
  "mentions_with_links": 9,
  "unlinked_mentions": 5,
  "most_recent_mention": "2026-01-20",
  "mention_velocity": 1.2,
  "top_mentions": [
    {
      "title": "10 Music Licensing Platforms for Indie Artists",
      "url": "https://musicbusinessworldwide.com/...",
      "publication": "Music Business Worldwide",
      "date": "2025-11-15",
      "type": "news_article",
      "has_link": true,
      "estimated_authority": "high"
    }
  ],
  "competitor_mentions": {
    "DistroKid": 89,
    "TuneCore": 62
  },
  "thought_leadership_score": 15
}
```

**Scoring formula:**
```
press_score = (
  mention_volume_score * 20 +         // log scale based on total mentions
  authority_score * 25 +              // weighted by publication authority
  diversity_score * 20 +              // variety of publication types
  recency_score * 15 +                // freshness of mentions
  link_ratio * 10 +                   // % of mentions with backlinks
  thought_leadership * 10             // founder/team personal mentions
)
```

---

## Composite AI Visibility Score

```typescript
// Weighted pillar combination
const PILLAR_WEIGHTS = {
  citations: 0.25,      // 25% — forum presence is highly actionable
  ai_presence: 0.30,    // 30% — this is the north star metric
  entities: 0.15,       // 15% — foundational but less volatile
  reviews: 0.15,        // 15% — important for trust signals
  press: 0.15,          // 15% — important for authority
};

composite_score = Math.round(
  citation_score * 0.25 +
  ai_presence_score * 0.30 +
  entity_score * 0.15 +
  review_score * 0.15 +
  press_score * 0.15
);
```

---

## Action Plan Generation

After all pillars complete, Claude synthesizes the findings into a prioritized action plan.

**Prompt:**
```
You are an AI SEO strategist analyzing an audit for {client.name}.

Here are the pillar scores and findings:
- Citations: {citation_score}/100 — {citation_findings}
- AI Presence: {ai_presence_score}/100 — {ai_presence_findings}
- Entities: {entity_score}/100 — {entity_findings}
- Reviews: {review_score}/100 — {review_findings}
- Press: {press_score}/100 — {press_findings}

Composite AI Visibility Score: {composite_score}/100

Generate:

1. EXECUTIVE SUMMARY (3-4 paragraphs)
Write a clear, honest assessment of the client's AI visibility posture. 
Lead with the biggest finding. Compare to competitors where relevant.
Use specific numbers from the findings. End with the opportunity.

2. PRIORITIZED ACTION PLAN (5-8 actions)
Rank by impact-to-effort ratio. For each action:
- Priority number (1 = do first)
- Which pillar it addresses
- Specific action to take
- Expected impact (high/medium/low)
- Effort required (high/medium/low)
- Estimated timeline
- Which GrowthForge module handles this

Focus on quick wins first (high impact, low effort).
The action plan should read as a campaign roadmap.

Return as JSON:
{
  "executive_summary": "...",
  "action_plan": [
    {
      "priority": 1,
      "pillar": "citations",
      "action": "Seed 20 high-authority Reddit threads where competitors are mentioned but you are not",
      "impact": "high",
      "effort": "low",
      "timeline": "Week 1-2",
      "module": "citation_engine",
      "details": "Focus on r/WeAreTheMusicMakers and r/MusicIndustry threads ranking in Google positions 1-5"
    }
  ],
  "headline_stat": "Your competitors appear in 47 high-authority threads where you have zero presence",
  "biggest_gap": "ai_presence",
  "biggest_quick_win": "citations"
}
```

---

## Audit UI Specification

### Audit Trigger

On the Client Detail page, add a prominent "Run AI Visibility Audit" button.
Also trigger automatically on new client creation (after keywords are added).

### Audit Progress Screen

Show real-time progress as each pillar completes:

```
┌─────────────────────────────────────────────────┐
│  AI Visibility Audit — RUN Music                 │
│  Started 2 minutes ago                           │
│                                                   │
│  ✅ Citations ............ 32/100  (done)         │
│  ✅ AI Presence .......... 18/100  (done)         │
│  ⏳ Entities ............. scanning...             │
│  ○  Reviews .............. pending                 │
│  ○  Press ................ pending                 │
│                                                   │
│  ████████████░░░░░░░  2/5 pillars complete       │
└─────────────────────────────────────────────────┘
```

### Audit Results Dashboard

```
┌──────────────────────────────────────────────────────┐
│  AI Visibility Score                                  │
│                                                        │
│         ╭─────────╮                                    │
│         │   36    │   ← large circular score           │
│         │  /100   │      with color (red/amber/green)  │
│         ╰─────────╯                                    │
│                                                        │
│  ┌────────┬────────┬────────┬────────┬────────┐       │
│  │ Citat. │ AI Pres│ Entity │ Review │ Press  │       │
│  │ 32     │ 18     │ 45     │ 61     │ 22     │       │
│  │ ████░  │ ██░░░  │ █████░ │ ██████ │ ███░░  │       │
│  └────────┴────────┴────────┴────────┴────────┘       │
│                                                        │
│  Executive Summary                                     │
│  "RUN Music has minimal AI visibility with a score of  │
│   36/100. While review presence is moderate (61/100),  │
│   the brand is nearly invisible to AI models, appearing│
│   in only 5% of relevant prompts. Competitors like     │
│   DistroKid dominate with 70% share of model..."       │
│                                                        │
│  Recommended Action Plan                               │
│  ┌─────────────────────────────────────────────┐      │
│  │ 1. 🟠 Seed 20 high-authority Reddit threads  │      │
│  │    Impact: HIGH · Effort: LOW · Week 1-2      │      │
│  │    → Citation Engine                          │      │
│  │                                               │      │
│  │ 2. 🔵 Fix entity inconsistencies across 3     │      │
│  │    Impact: MED · Effort: LOW · Week 1          │      │
│  │    → Entity Sync                              │      │
│  │                                               │      │
│  │ 3. 🟣 Launch press campaign targeting 5 music  │      │
│  │    Impact: HIGH · Effort: MED · Week 2-4       │      │
│  │    → PressForge                               │      │
│  └─────────────────────────────────────────────┘      │
│                                                        │
│  [📄 Export PDF Report]  [🔄 Re-run Audit]            │
└──────────────────────────────────────────────────────┘
```

### Month-Over-Month Tracking

Store each audit as a snapshot. The dashboard shows a trend line of composite_score over time. Each pillar score trends independently. This is how agencies prove ROI: "Your AI Visibility Score went from 36 to 72 in 90 days."

---

## Append to Directory Structure

```
src/
├── app/(dashboard)/
│   └── audits/
│       ├── page.tsx               # Audit history list
│       ├── new/page.tsx           # Trigger new audit
│       └── [auditId]/
│           ├── page.tsx           # Audit results dashboard
│           └── report/page.tsx    # Printable/PDF report view
├── lib/
│   └── audit/
│       ├── orchestrator.ts        # Runs all 5 pillar scans
│       ├── pillar-citations.ts    # Citation audit logic
│       ├── pillar-ai-presence.ts  # AI presence audit logic
│       ├── pillar-entities.ts     # Entity audit logic
│       ├── pillar-reviews.ts      # Review audit logic
│       ├── pillar-press.ts        # Press audit logic
│       ├── scoring.ts             # Composite score calculator
│       └── report-generator.ts    # PDF report generation
├── components/
│   └── audits/
│       ├── audit-progress.tsx     # Real-time progress indicator
│       ├── audit-score-card.tsx   # Large circular composite score
│       ├── pillar-scores.tsx      # 5-up pillar score bars
│       ├── action-plan.tsx        # Prioritized action list
│       ├── competitor-comparison.tsx
│       └── audit-trend.tsx        # Month-over-month score chart
```

---

## Append to Inngest Jobs

```typescript
// Job: audit.run
// Trigger: User clicks "Run Audit" OR new client onboarded with keywords
// Steps:
//   1. Create audit record with status='running'
//   2. Run all 5 pillar scans IN PARALLEL (each is independent):
//      a. audit.pillar.citations
//      b. audit.pillar.ai_presence
//      c. audit.pillar.entities
//      d. audit.pillar.reviews
//      e. audit.pillar.press
//   3. Wait for all pillars to complete (Inngest waitForEvent)
//   4. Calculate composite score
//   5. Generate executive summary + action plan via Claude Opus
//   6. Update audit record with scores and narrative
//   7. Send notification email: "Your audit is ready"
//   8. Deduct credits (50 credits for full audit)

// Estimated runtime: 3-5 minutes for full audit
// Credit cost: 50 credits (full) / 20 credits (quick)
```

---

## Audit as Sales Tool

The audit serves dual purpose:

**1. Client onboarding:** Establishes a measured baseline before any campaigns run. Every future audit shows improvement (or reveals what needs adjustment).

**2. Sales weapon:** Run a free audit for prospects. The PDF report shows their gaps, competitor comparison, and a specific action plan. The action plan items map directly to GrowthForge modules — it sells the service for you.

For the SaaS version, offer "1 Free Audit" on the starter plan as the conversion hook. Agencies can run audits for prospects before they even become paying clients.
