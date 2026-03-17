# Entity Sync Module — Complete Specification v2

## Read First

Before building this module, read `CLAUDE.md` in the project root completely. It contains the full Phase 1 spec including database schema (migrations 0001-0008), agent abstraction layer, directory structure, and all architectural patterns. Everything in this document EXTENDS that spec. Never contradict it.

Also read `docs/MODULE_AI_MONITOR.md` — it was built first and established the pattern for module-scoped agent namespaces in the registry. Follow the same pattern.

The Citation Engine (Phase 1) is fully built and deployed. The AI Monitor (Phase 2, Module 1) should be built before this module. All architectural patterns — agent abstraction, action logging via `logAgentAction()`, RLS on every table, Inngest for async work, credit tracking via `src/lib/billing/credits.ts` — are already in place and must be followed exactly.

---

## Module Purpose

Entity Sync audits and maintains brand consistency across directories, knowledge graphs, structured data, and AI-accessibility signals. Inconsistent entity data reduces AI confidence in recommending the brand. This module ensures the brand's digital identity is clean, consistent, and machine-readable across every platform that feeds into AI model training and retrieval pipelines.

**Primary metric: Entity Consistency Score** — a 0-100 score measuring how closely the brand's representation across all discovered platforms matches the canonical (source of truth) description.

### What This Module Covers

1. **Canonical brand description** — a versioned, approved source of truth with platform-adapted versions
2. **Directory presence** — discovery and scoring across 30+ platforms by vertical
3. **Schema markup audit** — JSON-LD, Microdata, RDFa on client's website, with code generation
4. **AI crawler access audit** — robots.txt checking for GPTBot, ClaudeBot, PerplexityBot, etc.
5. **llms.txt audit + generation** — the emerging AI-readability standard
6. **sameAs validation** — cross-referencing schema markup with claimed platform profiles
7. **Remediation task queue** — actionable tasks with step-by-step instructions and auto-verification
8. **Platform-adapted descriptions** — character-limited versions of canonical per platform

---

## What Already Exists

The audit pillar `entity-check.agent.ts` (Phase 1) runs a one-time scan checking platform presence, description consistency, and schema markup. It produces findings and a score stored in `audit_pillar_results` (migration 0007). Entity Sync makes this an **ongoing management tool** with richer output and ongoing tracking.

---

## Migration 0010: Entity Sync (Complete)

```sql
-- ============================================
-- MIGRATION 0010: ENTITY SYNC (COMPLETE)
-- Canonical descriptions, platform profiles, consistency
-- scoring, remediation tasks, scan history, schema audit,
-- AI crawler audit, and llms.txt support.
-- ============================================

-- -----------------------------------------------
-- 1. ENTITY CANONICAL — source of truth per client
-- -----------------------------------------------

CREATE TABLE entity_canonical (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  canonical_description TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
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

  -- Page or file being audited
  page_url TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'homepage' CHECK (
    page_type IN ('homepage', 'about', 'contact', 'service', 'product',
                  'blog', 'robots_txt', 'llms_txt', 'other')
  ),

  -- Schema types found (for HTML pages)
  schemas_found JSONB NOT NULL DEFAULT '[]',
  schemas_missing TEXT[] DEFAULT '{}',
  schema_score INTEGER CHECK (schema_score BETWEEN 0 AND 100),

  -- sameAs validation (for pages with Organization schema)
  sameas_validation JSONB DEFAULT '{}',
    -- { "urls_in_schema": [...], "expected_from_profiles": [...],
    --   "missing": [...], "score": 80 }

  -- Raw structured data
  raw_jsonld JSONB DEFAULT '[]',
  raw_microdata JSONB DEFAULT '[]',
  raw_rdfa JSONB DEFAULT '[]',

  -- For robots.txt audits (page_type = 'robots_txt')
  crawler_access JSONB DEFAULT '{}',
    -- { "GPTBot": { "allowed": true, "rule": null },
    --   "ClaudeBot": { "allowed": false, "rule": "User-agent: ClaudeBot / Disallow: /" } }
  robots_score INTEGER CHECK (robots_score BETWEEN 0 AND 100),

  -- For llms.txt audits (page_type = 'llms_txt')
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
-- 7. RLS POLICIES
-- -----------------------------------------------

ALTER TABLE entity_canonical ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_schema_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entity_canonical_agency_isolation" ON entity_canonical FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "entity_profiles_agency_isolation" ON entity_profiles FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "entity_tasks_agency_isolation" ON entity_tasks FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "entity_scans_agency_isolation" ON entity_scans FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "entity_schema_agency_isolation" ON entity_schema_results FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

---

## Platform Configuration

Full platform config with 30+ platforms across 6 verticals. See the original Entity Sync spec for the complete `PLATFORM_CONFIG` array in `src/lib/entity/platform-config.ts`. Key points:

- Each platform has: `platform` (ID), `displayName`, `weight` (0-100), `quickScan` (boolean), `verticals` (array), `scrapingMethod` ('apify_google_search' | 'apify_direct' | 'api' | 'website_parse'), `claimUrl`, `instructions`
- Universal platforms (all verticals): Google Business (100), LinkedIn (90), Wikipedia (95), Wikidata (85), Crunchbase (75), Facebook (60), Twitter (55), Instagram (50), YouTube (50), Apple Maps (65), Bing Places (60)
- Legal: Avvo (85), Super Lawyers (80), FindLaw (75), Justia (75), Martindale (70)
- Music: MusicBrainz (80), AllMusic (70), Discogs (65)
- Home Services: HomeAdvisor (80), Angi (80), Houzz (70)
- SaaS/Tech: G2 (85), Capterra (80), Product Hunt (70), AngelList (60), AlternativeTo (55)

`getPlatformsForVertical(vertical)` returns platforms sorted by weight DESC. `getQuickScanPlatforms(vertical)` returns top 5 by weight.

Platform character limits for adapted descriptions:

| Platform | Character Limit |
|----------|----------------|
| Google Business | 750 |
| LinkedIn | 2,000 |
| Twitter/X | 160 |
| Instagram | 150 |
| Facebook | 255 |
| Crunchbase | 2,000 |
| YouTube | 1,000 |
| Trustpilot | 500 |
| G2 | 1,500 |
| Capterra | 1,000 |
| BBB | 500 |
| Yelp | 1,500 |
| Avvo | 1,000 |

---

## Agent Implementations

### Registry Extension

```typescript
import { DirectoryScannerAgent } from './entity/directory-scanner.agent';
import { ConsistencyScorerAgent } from './entity/consistency-scorer.agent';
import { SchemaAuditorAgent } from './entity/schema-auditor.agent';
import { TaskGeneratorAgent } from './entity/task-generator.agent';

export const agents = {
  // ... existing Phase 1 + Phase 2 monitor agents ...

  entity: {
    directoryScanner: new DirectoryScannerAgent(),
    consistencyScorer: new ConsistencyScorerAgent(),
    schemaAuditor: new SchemaAuditorAgent(),
    taskGenerator: new TaskGeneratorAgent(),
  },
} as const;
```

### Agent 1: Directory Scanner

**File:** `src/lib/agents/entity/directory-scanner.agent.ts`

Three scraping strategies by platform:
- **Google Search Discovery** (most platforms): Search `"{brand name} site:{domain}"` via Apify google-search-scraper, then scrape the found profile page, then use Claude Sonnet to extract structured data from raw HTML/text.
- **Direct Apify Actor** (LinkedIn, Trustpilot, G2): Use platform-specific actors for cleaner, more structured data.
- **Public API** (Wikidata, MusicBrainz): Direct API calls and response parsing.

Error handling: a failed scrape for one platform should NEVER block the entire scan. Log error, continue.

### Agent 2: Consistency Scorer

**File:** `src/lib/agents/entity/consistency-scorer.agent.ts`

Uses Claude Sonnet (temperature 0) for field-by-field comparison against canonical.

**Scoring weights:** name 20%, description 30%, category 15%, contact 20%, other 15%

**Severity levels:** critical (wrong company/description), high (significantly outdated), medium (missing contact, category mismatch), low (formatting differences)

**sameAs cross-validation:** After scoring individual profiles, cross-reference the website's Organization schema `sameAs` array against all claimed entity profiles. Flag any claimed platform URL missing from `sameAs` as a high-severity issue.

### Agent 3: Schema Auditor (Extended)

**File:** `src/lib/agents/entity/schema-auditor.agent.ts`

Three audit functions in one agent:

**3a: Schema Markup Audit**
- Fetch page HTML via Apify cheerio-scraper (fallback: web-scraper for SPAs)
- Extract JSON-LD (`<script type="application/ld+json">`), Microdata, RDFa
- Validate each schema type against schema.org
- Score completeness and flag missing required types
- Expected schemas by page type + vertical (see original spec for full mapping)
- Schema score: 60% coverage × 40% quality

**3b: robots.txt AI Crawler Audit**
- Fetch `{website}/robots.txt` via HTTP
- Check access for 10 AI crawlers:
  - GPTBot (OpenAI/ChatGPT) — CRITICAL
  - ChatGPT-User (ChatGPT browsing) — CRITICAL
  - Google-Extended (Gemini training) — CRITICAL
  - Googlebot (Search + AI Overviews) — CRITICAL
  - PerplexityBot — CRITICAL
  - ClaudeBot (Anthropic) — non-critical
  - Bytespider (TikTok/ByteDance) — non-critical
  - CCBot (Common Crawl) — non-critical
  - anthropic-ai — non-critical
  - cohere-ai — non-critical
- Check for blanket `User-agent: * / Disallow: /`
- Check for Cloudflare AI bot blocking (common misconfiguration)
- Score: start at 100, -20 per blocked critical crawler, -5 per blocked non-critical
- Generate specific fix instructions for robots.txt

**3c: llms.txt Audit + Generation**
- Fetch `{website}/llms.txt` via HTTP
- If 404: score 0, recommend creation
- If exists: grade quality (contains brand name? sufficient length? markdown formatted? contains URLs/paths? recently dated?)
- Score: start at 100, deductions per quality issue
- Generation: if missing, produce a complete llms.txt from canonical data using Claude Sonnet. Output includes title, description, key pages, core information, markdown formatting.

### Agent 4: Task Generator (Enhanced)

**File:** `src/lib/agents/entity/task-generator.agent.ts`

Uses Claude Sonnet to generate platform-specific, step-by-step remediation instructions.

**Enhancement: Copy-Paste Ready Output**

For `add_schema` tasks: Generate complete JSON-LD code populated with canonical data. The task instructions include the actual `<script type="application/ld+json">` block ready to paste into HTML. Stored in `entity_tasks.generated_code`.

Supported schema generators:
- `generateOrganizationSchema(canonical)` — Organization with name, description, sameAs, contact, founder
- `generateLocalBusinessSchema(canonical)` — LocalBusiness with geo, openingHours, address
- `generateFAQSchema(faqs)` — FAQPage with Question/Answer pairs
- `generateServiceSchema(canonical, service)` — Service with provider, area
- `generateBreadcrumbSchema(breadcrumbs)` — BreadcrumbList

For `update_description` tasks: Include the pre-generated platform-adapted description with character count. Stored in `entity_tasks.platform_description` and `entity_tasks.platform_char_limit`.

For `fix_robots_txt` tasks: Generate the specific lines to add/change in robots.txt.

For `create_llms_txt` tasks: Generate the complete llms.txt file content.

For `fix_sameas` tasks: Generate the complete sameAs array with all claimed platform URLs.

**Priority scoring:**
- Google Business Profile issues → critical
- Wikipedia/LinkedIn issues → high
- Name inconsistency anywhere → high
- Missing critical AI crawlers in robots.txt → high
- Description inconsistency → medium-high
- Missing schemas on homepage → medium
- Missing llms.txt → medium
- Social profile inconsistencies → low-medium
- Missing presence on minor platforms → low

---

## Platform-Adapted Canonical Descriptions

Auto-generate platform-specific versions trimmed to each platform's character limit.

```typescript
// src/lib/entity/platform-descriptions.ts
//
// Uses Claude Sonnet to generate adapted descriptions:
// - Shorter versions prioritize: what the company does + key differentiator
// - Twitter/Instagram: punchy, includes tagline
// - LinkedIn/Crunchbase: detailed, professional
// - Google Business: optimized for local search if applicable
// - Every description under its character limit
//
// Stored in entity_canonical.platform_descriptions JSONB
// Regenerated when canonical is updated
// Used in task queue — copy button with character count display
```

---

## Canonical Auto-Population

When a client has no canonical record, offer to auto-generate from brand_brief + website:

```typescript
// src/lib/entity/auto-canonical.ts
//
// Uses Claude Sonnet to extract:
// - canonical_name (exact brand name as it should appear everywhere)
// - canonical_description (professional 150-250 word description)
// - canonical_tagline (10-15 words)
// - canonical_category + subcategories
// - canonical_founding_year, founder_name, service_areas
//
// Creates as draft — requires human approval before use
// Credit cost: 3 credits (one Claude Sonnet call)
```

---

## Core Scan Pipeline

```typescript
// src/lib/entity/run-entity-scan.ts
//
// Step 0: Load client + canonical (MUST be approved)
// Step 1: Determine platforms based on scan type + vertical
// Step 2: Check credits
// Step 3: Create scan record
// Step 4: For each platform:
//   4a: Directory scanner discovers/scrapes the platform
//   4b: Consistency scorer compares against canonical
//   4c: Upsert entity_profiles record
//   4d: Task generator creates remediation tasks for issues
// Step 5: Schema audit (homepage, about, contact pages)
//   5a: Schema markup audit (JSON-LD, Microdata, RDFa)
//   5b: sameAs validation (cross-reference with claimed profiles)
//   5c: Generate schema tasks with copy-paste JSON-LD code
// Step 6: robots.txt AI crawler audit
//   6a: Check all 10 AI crawlers
//   6b: Generate fix tasks for blocked critical crawlers
// Step 7: llms.txt audit
//   7a: Check existence and quality
//   7b: Generate creation/update task if needed
// Step 8: Calculate overall consistency score (weighted by platform weight + schema + robots + llms)
// Step 9: Update scan record with results
// Step 10: Deduct credits
//
// Overall consistency score calculation:
//   Platform scores: weighted average by platform importance weight
//   Schema score: weight 50 in the calculation
//   Robots.txt score: weight 30
//   llms.txt score: weight 20
//   All combined into single 0-100 score
```

---

## Inngest Jobs

```typescript
// Job: entity.scan
// Trigger: User clicks "Run Entity Scan" OR monthly cron
// Steps: Full pipeline above

// Job: entity.verify-task
// Trigger: User marks a task as completed
// Steps:
//   1. Re-scan just the affected platform (or re-check robots.txt/llms.txt/schema)
//   2. Re-score
//   3. If improved: mark task as verified with note
//   4. If not improved: mark as unverified with explanation of remaining issues

// Cron: Monthly entity re-scan (quick) for all active clients
// Add to vercel.json: { "path": "/api/cron/entity", "schedule": "0 3 1 * *" }
```

---

## API Routes

### POST /api/entity/scan
Trigger scan. Body: `{ clientId, scanType, platform? }`. Returns `{ scanId, estimatedCredits }`.

### GET /api/entity/profiles
All profiles for a client. Query: `clientId, status?, sortBy?`.

### GET /api/entity/canonical
Active canonical. Query: `clientId`. Returns approved version (or latest draft).

### POST /api/entity/canonical
Create/update canonical. Creates new version with status='draft'.

### POST /api/entity/canonical/:id/approve
Approve canonical. Auth: agency_admin+. Triggers platform description regeneration.

### POST /api/entity/canonical/generate
Auto-generate from brand brief. Credit cost: 3.

### POST /api/entity/canonical/descriptions
Regenerate platform-adapted descriptions. Credit cost: 3.

### GET /api/entity/tasks
Remediation tasks. Query: `clientId, status?, assignedTo?, platform?`. Sorted by priority_score DESC.

### PATCH /api/entity/tasks/:taskId
Update task. When status → 'completed', queue entity.verify-task job.

### GET /api/entity/scans
Scan history. Query: `clientId, limit`.

### GET /api/entity/schema
Schema + robots.txt + llms.txt results. Query: `clientId, scanId?`.

### POST /api/entity/llmstxt/generate
Generate llms.txt content from canonical. Returns text for review. Credit cost: 3.

### POST /api/entity/schema/generate
Generate JSON-LD code for specified schema type. Body: `{ clientId, schemaType }`. Returns `<script>` block.

---

## Dashboard UI

### Directory Structure

```
src/app/(dashboard)/entities/
├── page.tsx                      # Entity overview dashboard
├── canonical/
│   ├── page.tsx                  # Canonical editor with platform descriptions
│   └── history/page.tsx          # Version history
├── profiles/
│   ├── page.tsx                  # Platform profiles grid
│   └── [profileId]/page.tsx      # Profile detail + issues
├── tasks/
│   └── page.tsx                  # Remediation task queue
├── schema/
│   └── page.tsx                  # Schema + robots.txt + llms.txt audit
└── scans/
    └── page.tsx                  # Scan history

src/components/entity/
├── consistency-score-card.tsx
├── platform-grid.tsx
├── platform-card.tsx
├── canonical-editor.tsx
├── canonical-field-editor.tsx
├── platform-description-preview.tsx  # Shows adapted text with char count + copy button
├── task-queue.tsx
├── task-card.tsx                     # Includes generated_code accordion + platform_description
├── schema-checklist.tsx
├── schema-detail.tsx                 # JSON-LD viewer
├── schema-code-block.tsx             # Copy-paste JSON-LD with syntax highlighting
├── robots-txt-audit.tsx              # Crawler access grid (green/red per bot)
├── llms-txt-audit.tsx                # Status + quality score + generate button
├── sameas-validation.tsx             # Missing URLs flagged
├── scan-progress.tsx
└── vertical-selector.tsx
```

### Overview Page

```
┌──────────────────────────────────────────────────────────────┐
│  Entity Sync — {Client Name}                                  │
│                                                                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Consistency  │  │ Platform     │  │ AI Accessibility      │ │
│  │   Score      │  │ Coverage     │  │                       │ │
│  │    71/100    │  │ 12/18 found  │  │ robots.txt: 80/100   │ │
│  │  ▲ +8        │  │ 7 consistent │  │ llms.txt:   ❌ None  │ │
│  └─────────────┘  │ 5 issues     │  │ Schema:     58/100   │ │
│                    └──────────────┘  └──────────────────────┘ │
│                                                                │
│  ┌───────────────────────────────────────────────────────┐    │
│  │ Canonical: ✅ Approved (v3)  [Edit]                    │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                │
│  Platform Profiles (color-coded grid)                          │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐    │
│  │ 🟢 Google│ 🟡 Linked│ 🔴 Crunch│ ⚪ Wiki  │ 🟢 Faceb │    │
│  │ 92/100   │ 71/100   │ 45/100   │ Missing  │ 88/100   │    │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘    │
│                                                                │
│  AI Crawler Access                                             │
│  ✅ GPTBot  ✅ Googlebot  🔴 Google-Extended  ✅ PerplexityBot│
│  🔴 ClaudeBot  ✅ ChatGPT-User                                │
│                                                                │
│  Schema Markup                                                 │
│  Homepage: ✅ Organization ✅ WebSite ❌ FAQ                   │
│  Schema Score: 58/100  [📋 Generate Missing Schemas]           │
│                                                                │
│  llms.txt: ❌ Not Found  [🤖 Generate llms.txt]                │
│                                                                │
│  Tasks: 8 pending · 3 in progress                              │
│  🔴 Fix robots.txt — unblock Google-Extended                   │
│  🔴 Claim Crunchbase listing                                   │
│  🟠 Update LinkedIn description [📋 Copy Adapted Text]         │
│  🟠 Add FAQ schema [📋 Copy JSON-LD Code]                      │
│  [View All Tasks →]                                            │
│                                                                │
│  [🔄 Full Scan]  [⚡ Quick Scan]  [📊 Schema Only]             │
└──────────────────────────────────────────────────────────────┘
```

### Task Card Enhancement

```
┌──────────────────────────────────────────────────────┐
│ 🟠 HIGH — Add Organization Schema to Homepage         │
│    Platform: Website Schema · Score: 58/100            │
│                                                        │
│    ▼ Instructions                                      │
│    1. Open your homepage HTML                          │
│    2. Add this code before </head>:                    │
│                                                        │
│    ┌── Generated JSON-LD ──────────────────────────┐  │
│    │ <script type="application/ld+json">            │  │
│    │ {                                               │  │
│    │   "@context": "https://schema.org",            │  │
│    │   "@type": "Organization",                     │  │
│    │   "name": "RUN Music",                         │  │
│    │   "description": "RUN Music provides...",      │  │
│    │   "sameAs": [                                  │  │
│    │     "https://linkedin.com/company/runmusic",   │  │
│    │     "https://twitter.com/runmusic"             │  │
│    │   ],                                            │  │
│    │   "founder": { "@type": "Person",              │  │
│    │     "name": "Diego Farias" }                   │  │
│    │ }                                               │  │
│    │ </script>                                       │  │
│    └────────────────────────────────────────────────┘  │
│    [📋 Copy Code]                                      │
│                                                        │
│    3. Save and publish                                 │
│    4. Verify: search.google.com/test/rich-results      │
│                                                        │
│    [✅ Mark Complete]  [⏭ Skip]  [Assign To ▾]         │
└──────────────────────────────────────────────────────┘
```

---

## Refresh Frequency

| Data Type | Frequency | Rationale |
|-----------|-----------|-----------|
| Platform descriptions | Monthly | Change only with human action |
| Schema markup | Monthly (or on-demand) | Changes only when site is updated |
| robots.txt | Monthly | Changes infrequently |
| llms.txt | Monthly | Changes infrequently |
| Task verification | On-demand (after completion) | Triggered by task status change |
| Canonical regeneration | On-demand | When canonical is updated |

---

## Credit Costs

| Action | Credits |
|--------|---------|
| Full entity scan (all platforms + schema + robots + llms) | 15 |
| Quick entity scan (top 5 platforms only) | 5 |
| Single platform re-scan (task verification) | 3 |
| Schema-only scan (schema + robots + llms) | 3 |
| Auto-generate canonical from brief | 3 |
| Generate platform descriptions | 3 |
| Generate llms.txt | 3 |
| Generate JSON-LD code (per schema type) | 0 (template-based, no AI call) |

**Monthly cost per client:** ~24 credits (1 full scan + 3 verifications)

---

## Cross-Module Integration

- **Entity → AI Monitor:** After completing high-priority tasks, auto-trigger Monitor scan for SoM baseline
- **Entity → Citation Engine:** Schema improvements as recommendations in Citation dashboard
- **Entity → Review Engine:** Unclaimed review profiles flagged to Review Engine
- **Entity → Audit Module:** Audit pillar can pull from entity_profiles instead of re-scanning

---

## Build Sequence

1. **Migration 0010** — all tables
2. **Platform config** — `src/lib/entity/platform-config.ts`
3. **Agent interfaces** — add to existing `interfaces.ts`
4. **Consistency Scorer agent** — depends only on Claude API
5. **Schema Auditor agent** — including robots.txt + llms.txt audit functions
6. **Directory Scanner agent** — depends on Apify + Google Search
7. **Task Generator agent** — including JSON-LD code generation + platform descriptions
8. **Schema code generators** — `src/lib/entity/schema-generator.ts` (Organization, LocalBusiness, FAQ, etc.)
9. **Platform description generator** — `src/lib/entity/platform-descriptions.ts`
10. **llms.txt generator** — `src/lib/entity/llmstxt-generator.ts`
11. **Registry extension** — add entity namespace
12. **Auto-canonical generator** — `src/lib/entity/auto-canonical.ts`
13. **Core scan pipeline** — `src/lib/entity/run-entity-scan.ts` (the big one)
14. **Inngest jobs** — entity.scan + entity.verify-task
15. **API routes** — `/api/entity/*` + `/api/cron/entity`
16. **Canonical editor UI** — first screen (must be approved before scanning)
17. **Entity overview dashboard** — platform grid, scores, robots/llms/schema summary
18. **Task queue UI** — with generated code blocks + platform descriptions + copy buttons
19. **Schema audit page** — checklist + JSON-LD viewer + robots grid + llms status
20. **Test with live data** — RUN Music + Foyle Legal (legal vertical platforms)

---

## Claude Code Prompt

```
Read CLAUDE.md in the project root completely before responding.
Read docs/MODULE_ENTITY_SYNC.md completely before responding.

You are building the Entity Sync module for GrowthForge.
The Citation Engine (Phase 1) and AI Monitor (Phase 2) are
already built and deployed.

This module audits brand consistency across 30+ platforms,
validates schema markup, checks AI crawler access in robots.txt,
audits llms.txt, generates copy-paste JSON-LD code, and produces
platform-adapted descriptions with character limits.

Follow the 20-step build sequence in the spec. Enter Plan Mode
first and propose your plan before writing any code.

Do not modify any existing Citation Engine or AI Monitor code.
Register new agents in the existing registry.
Use the existing credit deduction helpers.
Follow the existing UI patterns (shadcn/ui, dark mode first).
```

---

## Notes

- The canonical editor is the FIRST thing users must interact with. Without an approved canonical, scans cannot run. Make this obvious with a setup wizard or banner.
- Vertical detection should pull from client metadata. Add a `vertical` field to `clients` table if needed (ALTER TABLE in migration 0010).
- Schema JSON-LD code generation is the highest-ROI quick win — adding Organization schema takes 10 minutes. Make the copy button prominent.
- robots.txt audit for AI crawlers is a 30-minute feature that saves clients months of invisible AI exclusion. Flag blocked critical crawlers with red alerts.
- Wikidata is underrated for AI visibility. ChatGPT and Gemini heavily reference Wikidata's structured knowledge graph.
- The task verification flow (complete → auto re-scan → confirm fix) is a key UX differentiator.
- Platform scraping WILL be fragile. Build generous error handling and retry logic. One platform failure should never block the entire scan.
- llms.txt is not yet a proven ranking factor, but the GEO community expects it as a hygiene signal. Frame it as "AI readiness" not "ranking factor."
- sameAs validation connects Entity Sync profiles to schema markup — a missing LinkedIn URL in sameAs is a high-impact, low-effort fix.
- No new vendor dependencies. All scraping uses existing Apify stack. AI analysis uses existing Claude/Anthropic API.
