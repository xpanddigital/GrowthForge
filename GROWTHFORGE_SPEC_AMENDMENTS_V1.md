# GrowthForge — Spec Amendments v1

## Purpose

This document contains amendments to the AI Monitor and Entity Sync module specs based on a competitive audit of the 2026 GEO tool landscape. These additions close identified gaps against competitors like Scrunch AI, Otterly, Profound, LLMrefs, Cairrot, Peec AI, Semrush AI Toolkit, and AthenaHQ.

Each amendment is self-contained with its own database changes, agent implementations, API requirements, and build instructions. They should be built AFTER the core module they extend is functional.

**Read order:** CLAUDE.md → Module spec → This amendments doc.

---

# PART 1: AI MONITOR AMENDMENTS

---

## Amendment M1: Google AI Overviews Monitoring

### Why This Matters

Google AI Overviews is the single largest gap in the current spec. AI Overviews appear at the top of standard Google Search for a growing percentage of queries, are available in 200+ countries and 40+ languages, and are powered by Gemini 3 as of January 2026. The Citation Engine already seeds Reddit/Quora/Facebook threads — and AI Overviews heavily reference exactly these platforms (Reddit 21%, YouTube 18.8%, Quora 14.3% of AIO citations). Monitoring AIOs closes the loop between seeding and Google visibility.

### Third-Party API: SerpApi

**Provider:** SerpApi (serpapi.com)
**Endpoint:** `https://serpapi.com/search?engine=google`
**AIO-specific:** `https://serpapi.com/search?engine=google_ai_overview` (for follow-up token fetches)
**Pricing:** $75/mo (5,000 searches) | $150/mo (15,000) | $300/mo (30,000)
**Why SerpApi over alternatives:** Returns AI Overview content as structured JSON with `ai_overview.text_blocks` (paragraphs, headings, lists, tables) plus `ai_overview.references` (source URLs with titles). Handles the two-step fetch (initial search → page_token → AIO content) automatically. More reliable than raw scraping because Google requires JavaScript rendering and anti-bot measures.

**Alternative options if SerpApi cost is a concern:**
- Apify google-search-scraper (already in our stack) — check if it returns AIO content in its output schema. If yes, no new vendor needed.
- Oxylabs Web Scraper API ($49/mo+) — returns `ai_overviews` array in parsed Google results
- Bright Data SERP API — use `brd_ai_overview=2` parameter

**Recommendation:** Start with SerpApi for reliability. Evaluate switching to Apify if their actor supports AIO extraction (check at build time).

### Environment Variable

```bash
SERPAPI_API_KEY=...
```

### Agent Implementation

**File:** `src/lib/agents/monitor/aio-test.agent.ts`

```typescript
// Google AI Overviews Test Agent
//
// Unlike the other 4 model agents, this one doesn't send a prompt to an AI.
// Instead, it searches Google for the prompt text and checks whether:
// 1. An AI Overview appears for that query
// 2. The client brand is mentioned in the AIO text
// 3. Which sources the AIO cites
// 4. Which competitors appear
//
// This directly connects Citation Engine seeding to Google visibility.
//
// Process:
// 1. Send query to SerpApi Google Search endpoint
// 2. Check if response contains ai_overview object
// 3. If ai_overview.page_token exists, make follow-up request to AIO API
//    (token expires within 1 minute — must be immediate)
// 4. Parse AIO text blocks for brand/competitor mentions
// 5. Extract reference URLs from ai_overview.references
// 6. Pass content to MonitorAnalyzerAgent for structured analysis
//
// IMPORTANT: AIO content varies by location. Always pass gl (country)
// and location parameters matching the client's target market.
//
// Rate limiting: SerpApi allows concurrent requests on paid plans.
// Use 1-second delay between requests to be safe.
//
// Credit cost: 3 credits per AIO test (same as other models)

import type { MonitorTestAgent, MonitorTestInput, MonitorTestResult } from '../interfaces';

export class AIOTestAgent implements MonitorTestAgent {
  name = 'AIOTestAgent';
  model = 'google_ai_overview';

  async test(input: MonitorTestInput): Promise<MonitorTestResult> {
    // Step 1: Search Google via SerpApi
    const searchParams = new URLSearchParams({
      engine: 'google',
      q: input.promptText,
      api_key: process.env.SERPAPI_API_KEY!,
      gl: input.location?.countryCode || 'us',
      hl: 'en',
      // Location string for geo-targeting (e.g. "Santa Monica, California")
      ...(input.location?.locationString && { location: input.location.locationString }),
    });

    const searchResponse = await fetch(`https://serpapi.com/search?${searchParams}`);
    const searchData = await searchResponse.json();

    // Step 2: Check for AI Overview
    let aioContent = searchData.ai_overview;

    if (!aioContent) {
      // No AI Overview for this query — still a valid result
      return {
        aiModel: 'google_ai_overview',
        fullResponse: '[No AI Overview generated for this query]',
        responseHash: this.hashResponse('no_aio'),
        brandMentioned: false,
        brandRecommended: false,
        brandLinked: false,
        brandSourceUrls: [],
        mentionContext: null,
        mentionPosition: null,
        prominenceScore: 0,
        sentiment: null,
        sourcesCited: [],
        competitorDetails: input.competitors.map(c => ({
          name: c.name,
          mentioned: false,
          recommended: false,
          sentiment: null,
          context: null,
        })),
        metadata: { aio_present: false },
      };
    }

    // Step 3: If page_token exists, fetch full AIO content
    if (aioContent.page_token && !aioContent.text_blocks) {
      const aioParams = new URLSearchParams({
        engine: 'google_ai_overview',
        page_token: aioContent.page_token,
        api_key: process.env.SERPAPI_API_KEY!,
      });

      const aioResponse = await fetch(`https://serpapi.com/search?${aioParams}`);
      const aioData = await aioResponse.json();
      aioContent = aioData.ai_overview || aioContent;
    }

    // Step 4: Extract text from AIO blocks
    const aioText = this.extractTextFromBlocks(aioContent.text_blocks || []);

    // Step 5: Extract reference URLs
    const references: string[] = (aioContent.references || [])
      .map((ref: any) => ref.link)
      .filter(Boolean);

    const responseHash = this.hashResponse(aioText);

    // Step 6: Analyze with MonitorAnalyzerAgent
    const analysis = await agents.monitor.analyzer.analyze({
      response: aioText,
      clientName: input.clientName,
      clientAliases: input.clientAliases || [],
      clientUrls: input.clientUrls,
      competitors: input.competitors,
    });

    // Check if any AIO references point to client's domain
    const brandSourceUrls = references.filter(url =>
      input.clientUrls.some(clientUrl => {
        try { return url.includes(new URL(clientUrl).hostname); } catch { return false; }
      })
    );

    // Check if any AIO references are Reddit/Quora/FB threads
    // (these are Citation Engine opportunities)
    const forumReferences = references.filter(url =>
      /reddit\.com|quora\.com|facebook\.com\/groups/i.test(url)
    );

    return {
      aiModel: 'google_ai_overview',
      fullResponse: aioText,
      responseHash,
      sourcesCited: references,
      brandSourceUrls: [...analysis.brandSourceUrls, ...brandSourceUrls],
      brandMentioned: analysis.brandMentioned,
      brandRecommended: analysis.brandRecommended,
      brandLinked: analysis.brandLinked || brandSourceUrls.length > 0,
      mentionContext: analysis.mentionContext,
      mentionPosition: analysis.mentionPosition,
      prominenceScore: analysis.prominenceScore,
      sentiment: analysis.sentiment,
      competitorDetails: analysis.competitorDetails,
      metadata: {
        aio_present: true,
        reference_count: references.length,
        forum_references: forumReferences,
        forum_reference_count: forumReferences.length,
      },
    };
  }

  private extractTextFromBlocks(blocks: any[]): string {
    return blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return block.snippet || '';
        case 'heading':
          return `\n## ${block.snippet}\n`;
        case 'list':
          return (block.list || [])
            .map((item: any) => `- ${item.snippet || item.title || ''}`)
            .join('\n');
        case 'table':
          return (block.table || [])
            .map((row: any[]) => row.join(' | '))
            .join('\n');
        default:
          return block.snippet || '';
      }
    }).join('\n');
  }

  private hashResponse(text: string): string {
    const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();
    return createHash('sha256').update(normalized).digest('hex');
  }
}
```

### Registry Update

```typescript
// In src/lib/agents/registry.ts, add to monitor namespace:
monitor: {
  chatgpt: new ChatGPTTestAgent(),
  perplexity: new PerplexityTestAgent(),
  gemini: new GeminiTestAgent(),
  claude: new ClaudeTestAgent(),
  google_ai_overview: new AIOTestAgent(),  // NEW
  analyzer: new MonitorAnalyzerAgent(),
},
```

### Update monitor_prompts Default Models

The default `test_models` array should now include AIO:

```sql
-- In migration 0009, add:
ALTER TABLE monitor_prompts
  ALTER COLUMN test_models SET DEFAULT '{chatgpt,perplexity,gemini,claude,google_ai_overview}';

-- Also update monitor_prompt_templates:
ALTER TABLE monitor_prompt_templates
  ALTER COLUMN default_models SET DEFAULT '{chatgpt,perplexity,gemini,claude,google_ai_overview}';
```

### MonitorTestInput Extension

Add optional location to the test input interface:

```typescript
export interface MonitorTestInput {
  promptText: string;
  clientName: string;
  clientAliases?: string[];
  clientUrls: string[];
  competitors: Array<{ name: string; aliases: string[]; url?: string }>;
  // NEW: Location context for geo-targeted testing
  location?: {
    countryCode: string;       // 'us', 'au', 'uk', etc.
    locationString?: string;   // 'Santa Monica, California' — for SerpApi geo-targeting
  };
}
```

### Refresh Frequency

**AI Overviews: Weekly** (same as other models)

Rationale: AIO content is grounded in live SERP results and can change whenever Google re-indexes pages or updates its Gemini model. However, testing daily would burn too many SerpApi credits. Weekly captures meaningful changes without excessive cost. If a client is running an active Citation Engine campaign and wants to see faster feedback, they can trigger a manual scan.

**Credit cost:** 3 credits per AIO test (consistent with other models).
With 5 models instead of 4: 10 prompts × 5 models × 4 weeks = 200 tests × 3 credits = **600 credits/month** (up from 480).

---

## Amendment M2: Keyword-First Monitoring with Automatic Prompt Fan-Out

### The Problem

The current spec requires users to manually create individual prompts. This is friction-heavy for agencies onboarding new clients. Competitors like LLMrefs let users input keywords and auto-generate prompts, which is far more natural for SEO practitioners.

### The Solution: Dual-Mode Monitoring

GrowthForge should support TWO modes of monitoring:

**Mode 1: Keyword Tracking (primary, recommended)**
- User adds keywords (reuses existing `keywords` table from Citation Engine)
- System auto-generates 5-8 prompt variations per keyword using templates + AI
- Prompts rotate across monitoring runs for statistical significance
- Users see results grouped by KEYWORD, not individual prompt

**Mode 2: Custom Prompts (advanced)**
- User creates specific prompts manually (current spec behavior)
- Results shown per prompt
- Used for precise tracking of known queries

### Database Changes

```sql
-- Add to migration 0009:

-- Link keywords to monitoring (many-to-many, since a keyword can generate multiple prompts)
CREATE TABLE monitor_keyword_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,

  -- Monitoring-specific overrides
  is_monitored BOOLEAN NOT NULL DEFAULT true,
  test_models TEXT[] NOT NULL DEFAULT '{chatgpt,perplexity,gemini,claude,google_ai_overview}',
  frequency TEXT NOT NULL DEFAULT 'weekly',

  -- Location context for this keyword
  location_country TEXT DEFAULT 'us',
  location_string TEXT,        -- e.g. 'Perth, Western Australia' for Foyle Legal

  -- How many prompt variations to generate and rotate
  prompt_variation_count INTEGER NOT NULL DEFAULT 5,

  -- Auto-generated prompts (regenerated periodically or on demand)
  -- Stored here so we can track which variations have been used
  generated_prompts JSONB DEFAULT '[]',
    -- [
    --   { "text": "What are the best personal injury lawyers in Perth?",
    --     "type": "recommendation", "last_used_at": "2026-03-10T04:00:00Z" },
    --   { "text": "Can anyone recommend a good injury lawyer in Perth?",
    --     "type": "recommendation", "last_used_at": null },
    --   ...
    -- ]

  prompts_last_generated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, keyword_id)
);

CREATE INDEX idx_monitor_keyword_config_client ON monitor_keyword_config(client_id, is_monitored);

ALTER TABLE monitor_keyword_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monitor_keyword_config_agency_isolation" ON monitor_keyword_config FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);

-- Add keyword_id reference to monitor_results so results can be grouped by keyword
ALTER TABLE monitor_results
  ADD COLUMN IF NOT EXISTS keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL;

-- Add to snapshots for keyword-level SoM
ALTER TABLE monitor_snapshots
  ADD COLUMN IF NOT EXISTS keyword_breakdown JSONB DEFAULT '{}';
  -- { "personal injury lawyer": { "som": 35, "tests": 20, "mentions": 7 },
  --   "car accident attorney perth": { "som": 20, "tests": 20, "mentions": 4 } }
```

### Prompt Fan-Out Generator

```typescript
// src/lib/monitor/prompt-generator.ts
//
// Generates prompt variations from a keyword + client context.
// Uses Claude Sonnet for natural language variation.
//
// For each keyword, generates variations across these dimensions:
// 1. Question type: recommendation, comparison, how-to, cost, review
// 2. Phrasing style: formal, casual, specific, broad
// 3. Location inclusion: with/without location qualifier
// 4. Persona framing: default, small business owner, first-time buyer, etc.
//
// The key insight: LLMs are non-deterministic, so asking the same question
// weekly gives you ONE data point. Asking 5 semantically equivalent questions
// gives you 5 data points — a much more statistically meaningful SoM.

export async function generatePromptVariations(
  keyword: string,
  clientContext: {
    vertical: string;
    location?: string;
    competitors: string[];
  },
  count: number = 5
): Promise<Array<{ text: string; type: string }>> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    temperature: 0.7, // Higher temp for more variation
    system: 'Generate diverse search prompt variations. Return ONLY valid JSON array.',
    messages: [{
      role: 'user',
      content: `Generate ${count} diverse prompt variations that a real person might type into ChatGPT, Perplexity, or Google when searching for "${keyword}".

Context:
- Industry: ${clientContext.vertical}
- Location: ${clientContext.location || 'not specified'}
- Known competitors: ${clientContext.competitors.join(', ')}

Requirements:
- Each prompt should be semantically equivalent (asking about the same topic) but phrased differently
- Mix of question types: recommendation, comparison, how-to, cost, review
- Mix of formality: some casual ("hey what's the best..."), some specific ("compare top 5...")
- ${clientContext.location ? `Include location in ~60% of prompts, omit in ~40%` : 'No location needed'}
- Include 1 competitor-reference prompt (e.g. "alternatives to {competitor}")
- Make them sound like REAL human queries, not SEO templates
- No two prompts should start with the same word

Return JSON array:
[
  { "text": "the full prompt text", "type": "recommendation|comparison|how_to|cost|review|alternative|vs" }
]`
    }],
  });

  const responseText = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');

  const cleaned = responseText.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
```

### Rotation Strategy

Each monitoring run selects a SUBSET of generated prompts, not all of them. This ensures:
- Different prompts are used each week (statistical diversity)
- Over 4 weeks, all variations get tested (full coverage)
- No single prompt biases the SoM score

```typescript
// src/lib/monitor/prompt-rotation.ts

export function selectPromptsForRun(
  allPrompts: Array<{ text: string; type: string; last_used_at: string | null }>,
  selectCount: number = 3 // Use 3 out of 5 each run
): Array<{ text: string; type: string }> {
  // Priority: least recently used first
  const sorted = [...allPrompts].sort((a, b) => {
    if (!a.last_used_at) return -1; // Never used = highest priority
    if (!b.last_used_at) return 1;
    return new Date(a.last_used_at).getTime() - new Date(b.last_used_at).getTime();
  });

  return sorted.slice(0, selectCount);
}
```

### Dashboard Impact

The Monitor overview page should show results grouped by KEYWORD by default, with the ability to drill into individual prompts. The SoM calculation aggregates across all prompt variations for a keyword.

```
Keyword: "personal injury lawyer perth"
SoM: 35% (7 mentions across 20 tests over 4 weeks)
├── ChatGPT:          40% (4/10)
├── Perplexity:       50% (5/10)
├── Gemini:           20% (2/10)
├── Claude:           30% (3/10)
└── AI Overviews:     30% (3/10)

[View individual prompts ▾]
  - "best personal injury lawyer perth" — tested Mar 10, Mar 3
  - "can you recommend an injury attorney in perth?" — tested Mar 10
  - "compare top personal injury law firms western australia" — tested Mar 3
  - "how much does a personal injury lawyer cost in perth" — tested Feb 24
  - "alternatives to slater and gordon for injury claims" — tested Feb 24
```

### Onboarding Flow

When a new client is set up with keywords in the Citation Engine, the Monitor should offer a one-click "Enable AI Monitoring" that:
1. Takes the client's top 10-20 keywords
2. Creates `monitor_keyword_config` entries for each
3. Auto-generates 5 prompt variations per keyword (50-100 prompts total)
4. Starts the first monitoring run immediately

This means a new client can go from zero to a full SoM baseline in under 10 minutes.

---

## Amendment M3: Geographic & Persona Variation

### Why This Matters

For Foyle Legal (Perth personal injury), the AI response to "best personal injury lawyer" is completely different in Perth vs Sydney vs New York. For RUN Music (global), location matters less. The system needs to support location-aware monitoring without forcing it on everyone.

### Implementation

Already partially covered in M1 (AIO agent location parameter) and M2 (keyword config location fields). The remaining piece is making the OTHER model agents location-aware.

**ChatGPT:** Append location context to the prompt text: `"{prompt} (I'm located in {location})"`. OpenAI doesn't have a native locale parameter, so prompt framing is the approach.

**Perplexity:** Same approach — append location to prompt. Perplexity's sonar model doesn't have a location parameter.

**Gemini:** Same approach — append location to prompt.

**Claude:** Same approach — append location to prompt.

**Google AI Overviews:** SerpApi supports `gl` (country) and `location` (city-level) parameters natively. This is the most precise geo-targeting available.

### Location Prompt Wrapping

```typescript
// src/lib/monitor/location-wrapper.ts

export function wrapPromptWithLocation(
  promptText: string,
  location: { countryCode: string; locationString?: string } | undefined,
  model: string
): string {
  if (!location?.locationString) return promptText;

  // For Google AIO, location is handled via API params, not prompt text
  if (model === 'google_ai_overview') return promptText;

  // For LLM models, append location naturally
  // Don't append if the prompt already contains the location
  if (promptText.toLowerCase().includes(location.locationString.toLowerCase())) {
    return promptText;
  }

  return `${promptText} (I'm based in ${location.locationString})`;
}
```

### Persona Variation (Phase 2 Enhancement)

Store optional persona framing on `monitor_keyword_config`:

```sql
ALTER TABLE monitor_keyword_config
  ADD COLUMN IF NOT EXISTS persona_frames TEXT[] DEFAULT '{}';
  -- e.g. ['I am a small business owner', 'I am a first-time buyer',
  --        'I run a 50-person team', 'I am looking for options in Perth']
```

When persona_frames are set, some prompt variations include the persona prefix:
`"I'm a first-time home buyer looking for... {prompt}"`

This is a future enhancement — not needed for MVP but the schema supports it.

---

## Amendment M4: Cross-Module Correlation Engine

### Why This Matters

This is the ROI proof that agencies will screenshot for case studies. The current spec tracks Citation Engine activity and Monitor SoM separately. The correlation engine overlays them to show causation:

*"We posted 22 Reddit responses in Weeks 3-4 → SoM rose from 18% to 31% in Weeks 5-6"*

### Database

```sql
-- Add to migration 0009:

-- Materialized view for activity timeline (refreshed after each monitoring run)
CREATE TABLE monitor_activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Time bucket (weekly)
  week_start DATE NOT NULL,

  -- Citation Engine activity this week
  threads_discovered INTEGER NOT NULL DEFAULT 0,
  responses_generated INTEGER NOT NULL DEFAULT 0,
  responses_posted INTEGER NOT NULL DEFAULT 0,
  platforms_seeded JSONB DEFAULT '{}',
    -- { "reddit": 8, "quora": 3, "facebook_groups": 1 }

  -- Entity Sync activity this week
  entity_tasks_completed INTEGER NOT NULL DEFAULT 0,
  entity_score_change NUMERIC(5,2),
  schema_improvements INTEGER NOT NULL DEFAULT 0,

  -- Press activity this week (when PressForge is built)
  press_releases_distributed INTEGER NOT NULL DEFAULT 0,
  coverage_secured INTEGER NOT NULL DEFAULT 0,

  -- Monitor results this week
  overall_som NUMERIC(5,2),
  som_delta NUMERIC(5,2),          -- Change vs previous week
  aio_som NUMERIC(5,2),            -- AI Overviews specifically
  aio_som_delta NUMERIC(5,2),

  -- Correlation flags (set by analysis)
  correlation_notes JSONB DEFAULT '[]',
    -- [
    --   { "type": "som_rise_after_seeding",
    --     "detail": "SoM rose 13% two weeks after 15 Reddit responses were posted",
    --     "confidence": "medium" },
    --   { "type": "aio_source_match",
    --     "detail": "3 AI Overview references matched Citation Engine threads",
    --     "confidence": "high" }
    -- ]

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, week_start)
);

CREATE INDEX idx_timeline_client ON monitor_activity_timeline(client_id, week_start DESC);

ALTER TABLE monitor_activity_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline_agency_isolation" ON monitor_activity_timeline FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

### Correlation Analysis

```typescript
// src/lib/monitor/correlation-analyzer.ts
//
// Runs after each weekly monitoring snapshot is created.
// Looks back 4-8 weeks for patterns.

export async function analyzeCorrelations(clientId: string): Promise<void> {
  const timeline = await getActivityTimeline(clientId, 8); // Last 8 weeks

  const notes: CorrelationNote[] = [];

  // Pattern 1: SoM rise after Citation Engine seeding
  // Look for weeks where responses_posted > 5, then check if SoM
  // increased 2-3 weeks later (typical lag for AI model refresh)
  for (let i = 2; i < timeline.length; i++) {
    const seedingWeek = timeline[i]; // 2-3 weeks ago
    const currentWeek = timeline[0];

    if (seedingWeek.responses_posted >= 5 && currentWeek.som_delta > 0) {
      notes.push({
        type: 'som_rise_after_seeding',
        detail: `SoM rose ${currentWeek.som_delta}% — ${seedingWeek.responses_posted} responses were posted ${i} weeks ago`,
        confidence: currentWeek.som_delta > 5 ? 'high' : 'medium',
        seeding_week: seedingWeek.week_start,
        effect_week: currentWeek.week_start,
      });
    }
  }

  // Pattern 2: AI Overview references match Citation Engine threads
  // Check if any AIO source URLs are threads we seeded
  const recentAioResults = await getRecentAioResults(clientId, 7); // Last 7 days
  const seededThreadUrls = await getSeededThreadUrls(clientId);

  for (const result of recentAioResults) {
    const matchingThreads = (result.sources_cited || []).filter(url =>
      seededThreadUrls.includes(url)
    );

    if (matchingThreads.length > 0) {
      notes.push({
        type: 'aio_source_match',
        detail: `${matchingThreads.length} AI Overview source(s) are threads where we posted responses`,
        confidence: 'high',
        matching_urls: matchingThreads,
      });
    }
  }

  // Pattern 3: Entity fix → SoM improvement
  for (let i = 1; i < timeline.length; i++) {
    const fixWeek = timeline[i];
    const currentWeek = timeline[0];

    if (fixWeek.entity_tasks_completed >= 3 && currentWeek.som_delta > 0) {
      notes.push({
        type: 'som_rise_after_entity_fix',
        detail: `${fixWeek.entity_tasks_completed} entity fixes completed ${i} weeks ago, SoM up ${currentWeek.som_delta}%`,
        confidence: 'low', // Hard to isolate entity fixes as sole cause
      });
    }
  }

  // Update timeline with correlation notes
  await updateTimelineCorrelations(clientId, timeline[0].week_start, notes);
}
```

### Dashboard Component: Correlation Timeline

Add to the Monitor overview page — a horizontal timeline chart showing:
- **Top bar:** Citation Engine activity (responses posted per week, colored by platform)
- **Middle bar:** Entity Sync + Press activity
- **Bottom line:** SoM trend line overlaid

When a correlation is detected, draw a dotted connector line between the activity spike and the SoM movement, with a tooltip showing the correlation note.

This is the single most compelling visualization in the entire platform. Agencies will screenshot this for every client report.

---

## Amendment M5: AI Visibility Score (Composite Brand Metric)

### The Naming Problem

"Share of Model" is a per-model metric. But agencies need a SINGLE number to put on a client report cover page. The platform already has a "Composite AI Visibility Score" in the audit module (weighted pillar scores). The Monitor needs its own version of this for ongoing tracking.

### AI Visibility Score Definition

```typescript
// src/lib/monitor/visibility-score.ts

export function calculateAIVisibilityScore(snapshot: MonitorSnapshot): number {
  // Weighted combination of multiple signals:

  const somWeight = 0.40;          // Share of Model (are you mentioned?)
  const recommendWeight = 0.25;    // Recommendation rate (are you recommended, not just listed?)
  const prominenceWeight = 0.15;   // Average prominence when mentioned
  const coverageWeight = 0.10;     // Model coverage (mentioned in 1/5 models vs 5/5)
  const trendWeight = 0.10;        // Direction (improving, stable, declining)

  // SoM component: 0-100 based on overall_som
  const somScore = snapshot.overall_som;

  // Recommendation component: of mentions, what % were recommendations?
  const recommendScore = snapshot.total_brand_mentions > 0
    ? (snapshot.total_brand_recommendations / snapshot.total_brand_mentions) * 100
    : 0;

  // Prominence component: average prominence when mentioned
  const prominenceScore = snapshot.avg_prominence || 0;

  // Coverage component: mentioned in how many models out of 5?
  const modelsMentionedIn = Object.values(snapshot.model_breakdown)
    .filter((m: any) => m.mentioned > 0).length;
  const coverageScore = (modelsMentionedIn / 5) * 100;

  // Trend component: positive delta = bonus, negative = penalty
  const trendScore = snapshot.som_delta
    ? Math.min(100, Math.max(0, 50 + snapshot.som_delta * 2))
    : 50; // neutral if no previous data

  return Math.round(
    somScore * somWeight +
    recommendScore * recommendWeight +
    prominenceScore * prominenceWeight +
    coverageScore * coverageWeight +
    trendScore * trendWeight
  );
}
```

### Where It Appears

- **Monitor overview:** Large number card (replaces raw SoM as the hero metric, with SoM shown below as a detail)
- **Dashboard home:** Card showing AI Visibility Score with sparkline
- **Monthly report:** Cover page hero number
- **Client portal:** The one number clients see

### Snapshot Extension

```sql
ALTER TABLE monitor_snapshots
  ADD COLUMN IF NOT EXISTS ai_visibility_score INTEGER CHECK (ai_visibility_score BETWEEN 0 AND 100);
```

---

## Amendment M6: Content Gap Recommendations

### Why This Matters

The Monitor identifies WHERE the brand is invisible. But it doesn't tell the agency WHAT CONTENT to create to fix it. This closes the loop between monitoring and action.

### Implementation

After each monitoring run, analyze the responses where competitors are cited but the client isn't. Extract what content/pages are being referenced and suggest content the client should create.

```typescript
// src/lib/monitor/content-gaps.ts

export async function analyzeContentGaps(
  clientId: string,
  results: MonitorTestResult[]
): Promise<ContentGap[]> {
  // Find results where competitors are mentioned but client isn't
  const gapResults = results.filter(r =>
    !r.brandMentioned &&
    r.competitorDetails.some(c => c.mentioned)
  );

  if (gapResults.length === 0) return [];

  // Collect competitor source URLs across all gap results
  const competitorSourceEvidence: Array<{
    model: string;
    prompt: string;
    competitor: string;
    sourceUrls: string[];
    mentionContext: string;
  }> = [];

  for (const result of gapResults) {
    for (const competitor of result.competitorDetails.filter(c => c.mentioned)) {
      competitorSourceEvidence.push({
        model: result.aiModel,
        prompt: result.fullResponse.substring(0, 200), // First 200 chars as context
        competitor: competitor.name,
        sourceUrls: result.sourcesCited,
        mentionContext: competitor.context || '',
      });
    }
  }

  // Use Claude Sonnet to analyze patterns and generate recommendations
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0,
    system: 'Analyze competitive citation patterns and generate content gap recommendations. Return ONLY valid JSON.',
    messages: [{
      role: 'user',
      content: `Analyze why competitors are being cited by AI models instead of our client, and recommend content the client should create.

COMPETITOR CITATION EVIDENCE:
${JSON.stringify(competitorSourceEvidence, null, 2)}

For each content gap, provide:
1. What type of content is the competitor being cited for?
2. Why is the AI model choosing the competitor?
3. What specific content should the client create to compete?
4. Where should it be published? (website, Reddit, Quora, etc.)

Return JSON:
{
  "gaps": [
    {
      "topic": "string (the topic area where client is invisible)",
      "competitor_advantage": "string (why the competitor is being cited)",
      "recommended_content": "string (specific content piece to create)",
      "content_type": "blog_post | comparison_page | faq | case_study | forum_post | data_study",
      "publish_target": "website | reddit | quora | linkedin",
      "impact": "high | medium | low",
      "detail": "string (2-3 sentences explaining the opportunity)"
    }
  ]
}`
    }],
  });

  const responseText = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');

  const cleaned = responseText.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return parsed.gaps;
}
```

### Storage

```sql
-- Add to migration 0009:

CREATE TABLE monitor_content_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES monitor_snapshots(id) ON DELETE SET NULL,

  topic TEXT NOT NULL,
  competitor_advantage TEXT NOT NULL,
  recommended_content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  publish_target TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  detail TEXT,

  -- Action tracking
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'in_progress', 'completed', 'dismissed')
  ),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_gaps_client ON monitor_content_gaps(client_id, status);

ALTER TABLE monitor_content_gaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_gaps_agency_isolation" ON monitor_content_gaps FOR ALL USING (
  client_id IN (
    SELECT c.id FROM clients c JOIN users u ON u.agency_id = c.agency_id
    WHERE u.id = auth.uid()
  )
);
```

### Dashboard

Add a "Content Gaps" tab to the Monitor dashboard showing recommended content with impact tags and action buttons ("Create Brief" → opens Citation Engine or links to a content creation workflow).

---

# PART 2: ENTITY SYNC AMENDMENTS

---

## Amendment E1: llms.txt Audit & Generation

### Background

llms.txt is an emerging standard (similar to robots.txt) that provides AI models with a clean, markdown-based index of a site's most important content. While current research suggests it's not yet a proven ranking factor, the GEO community expects it as a hygiene signal, and early adoption demonstrates AI-readiness.

### No Third-Party API Needed

This is purely a fetch + parse operation:
1. Fetch `{client_website}/llms.txt` via Apify or direct HTTP
2. Check if it exists (200 vs 404)
3. If it exists, parse and grade quality
4. If it doesn't exist, offer to generate one from canonical data

### Add to Schema Auditor Agent

Extend `SchemaAuditorAgent` to also check for llms.txt:

```typescript
// Add to src/lib/agents/entity/schema-auditor.agent.ts

async auditLlmsTxt(websiteUrl: string, canonical: EntityCanonical): Promise<LlmsTxtAuditResult> {
  const llmsTxtUrl = `${websiteUrl.replace(/\/$/, '')}/llms.txt`;

  try {
    const response = await fetch(llmsTxtUrl, {
      headers: { 'User-Agent': 'GrowthForge-Bot/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 404) {
      return {
        exists: false,
        url: llmsTxtUrl,
        score: 0,
        issues: ['llms.txt file not found — recommended to create one'],
        content: null,
      };
    }

    if (!response.ok) {
      return {
        exists: false,
        url: llmsTxtUrl,
        score: 0,
        issues: [`llms.txt returned HTTP ${response.status}`],
        content: null,
      };
    }

    const content = await response.text();

    // Grade the llms.txt quality
    return this.gradeLlmsTxt(content, canonical);

  } catch (error) {
    return {
      exists: false,
      url: llmsTxtUrl,
      score: 0,
      issues: [`Could not fetch llms.txt: ${error.message}`],
      content: null,
    };
  }
}

private gradeLlmsTxt(content: string, canonical: EntityCanonical): LlmsTxtAuditResult {
  let score = 100;
  const issues: string[] = [];

  // Check 1: Has a title/name section
  if (!content.includes(canonical.canonical_name)) {
    score -= 20;
    issues.push('llms.txt does not contain the canonical brand name');
  }

  // Check 2: Has a description
  if (content.length < 200) {
    score -= 20;
    issues.push('llms.txt is too short — should include comprehensive site description');
  }

  // Check 3: Contains key URLs/paths
  if (!content.includes('http') && !content.includes('/')) {
    score -= 20;
    issues.push('llms.txt does not reference any site URLs or paths');
  }

  // Check 4: Markdown formatted (the llms.txt standard recommends markdown)
  if (!content.includes('#') && !content.includes('-')) {
    score -= 10;
    issues.push('llms.txt should use markdown formatting with headers and lists');
  }

  // Check 5: Recently updated (check for date references)
  const currentYear = new Date().getFullYear().toString();
  if (!content.includes(currentYear) && !content.includes((parseInt(currentYear) - 1).toString())) {
    score -= 10;
    issues.push('llms.txt may be outdated — no recent date references found');
  }

  return {
    exists: true,
    url: '',
    score: Math.max(0, score),
    issues,
    content,
  };
}
```

### llms.txt Generator

```typescript
// src/lib/entity/llmstxt-generator.ts

export async function generateLlmsTxt(clientId: string): Promise<string> {
  const client = await getClientWithCanonical(clientId);
  const canonical = client.canonical;

  if (!canonical) throw new Error('Canonical required to generate llms.txt');

  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0,
    system: 'Generate a well-structured llms.txt file in markdown format. Return ONLY the file content, no wrapping.',
    messages: [{
      role: 'user',
      content: `Generate a comprehensive llms.txt file for this brand:

Name: ${canonical.canonical_name}
Website: ${client.website_url}
Description: ${canonical.canonical_description}
Category: ${canonical.canonical_category}
Subcategories: ${canonical.canonical_subcategories.join(', ')}
Tagline: ${canonical.canonical_tagline || ''}
Founded: ${canonical.canonical_founding_year || ''}
Service Areas: ${canonical.canonical_service_areas.join(', ')}

The llms.txt file should:
1. Start with # {brand name} followed by a clear, concise brand description
2. List the most important pages with > prefix and brief descriptions
3. Include sections for: About, Services/Products, Contact, Key Resources
4. Use markdown formatting
5. Be optimized for AI model consumption (clear, structured, factual)
6. Follow the llms.txt specification format

Example structure:
# Brand Name
> Brief description of the company

## Key Pages
- [About Us](url): Description
- [Services](url): Description
- [Contact](url): Description

## Core Information
- Founded: year
- Category: category
- Service area: areas`
    }],
  });

  return message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');
}
```

### Database & UI

Store llms.txt audit results in `entity_schema_results` with `page_type = 'llms_txt'` and `page_url = '{website}/llms.txt'`.

In the Schema Audit UI, add a dedicated llms.txt section:

```
llms.txt Status: ❌ Not Found
[🤖 Generate llms.txt]  ← produces copy-paste-ready content

-- or --

llms.txt Status: ✅ Found · Quality: 72/100
Issues:
- Does not contain canonical brand name
- No recent date references
[📋 View Content]  [🔄 Regenerate Suggestion]
```

---

## Amendment E2: robots.txt AI Crawler Audit

### Why This Matters

Many sites accidentally block AI crawlers. Cloudflare's default changed to block AI bots. If GPTBot can't crawl your site, you're invisible to ChatGPT regardless of how good your content is.

### No Third-Party API Needed

Simple HTTP fetch + parse:

```typescript
// Add to SchemaAuditorAgent:

async auditRobotsTxt(websiteUrl: string): Promise<RobotsTxtAuditResult> {
  const robotsUrl = `${websiteUrl.replace(/\/$/, '')}/robots.txt`;

  try {
    const response = await fetch(robotsUrl);
    if (!response.ok) {
      return {
        exists: false,
        url: robotsUrl,
        crawlers_status: {},
        issues: ['robots.txt not found or not accessible'],
        score: 50, // Neutral — no robots.txt means nothing is blocked
      };
    }

    const content = await response.text();
    return this.analyzeRobotsTxt(content);

  } catch (error) {
    return {
      exists: false,
      url: robotsUrl,
      crawlers_status: {},
      issues: [`Could not fetch robots.txt: ${error.message}`],
      score: 50,
    };
  }
}

private analyzeRobotsTxt(content: string): RobotsTxtAuditResult {
  // AI crawlers to check for
  const AI_CRAWLERS = [
    { name: 'GPTBot', description: 'OpenAI (ChatGPT)', critical: true },
    { name: 'ChatGPT-User', description: 'ChatGPT browsing', critical: true },
    { name: 'Google-Extended', description: 'Google Gemini training', critical: true },
    { name: 'Googlebot', description: 'Google Search (also feeds AI Overviews)', critical: true },
    { name: 'ClaudeBot', description: 'Anthropic (Claude)', critical: false },
    { name: 'PerplexityBot', description: 'Perplexity AI', critical: true },
    { name: 'Bytespider', description: 'TikTok / ByteDance', critical: false },
    { name: 'CCBot', description: 'Common Crawl (training data)', critical: false },
    { name: 'anthropic-ai', description: 'Anthropic crawler', critical: false },
    { name: 'cohere-ai', description: 'Cohere crawler', critical: false },
  ];

  const crawlerStatus: Record<string, {
    allowed: boolean;
    rule: string | null;
    critical: boolean;
  }> = {};

  const issues: string[] = [];
  let score = 100;

  for (const crawler of AI_CRAWLERS) {
    const status = this.checkCrawlerAccess(content, crawler.name);
    crawlerStatus[crawler.name] = {
      allowed: status.allowed,
      rule: status.matchedRule,
      critical: crawler.critical,
    };

    if (!status.allowed && crawler.critical) {
      score -= 20;
      issues.push(
        `🔴 ${crawler.name} (${crawler.description}) is BLOCKED — ` +
        `rule: "${status.matchedRule}". This prevents ${crawler.description} ` +
        `from crawling your site.`
      );
    } else if (!status.allowed && !crawler.critical) {
      score -= 5;
      issues.push(
        `🟡 ${crawler.name} (${crawler.description}) is blocked — ` +
        `minor impact on AI visibility.`
      );
    }
  }

  // Check for blanket Disallow: / for all user-agents
  if (content.includes('User-agent: *') &&
      content.split('User-agent: *')[1]?.includes('Disallow: /')) {
    score = 0;
    issues.unshift('🔴 CRITICAL: All crawlers are blocked by "User-agent: * / Disallow: /"');
  }

  return {
    exists: true,
    url: '',
    crawlers_status: crawlerStatus,
    issues,
    score: Math.max(0, score),
  };
}

private checkCrawlerAccess(
  robotsTxt: string,
  botName: string
): { allowed: boolean; matchedRule: string | null } {
  const lines = robotsTxt.split('\n').map(l => l.trim());
  let inBotSection = false;
  let inWildcardSection = false;
  let botAllowed = true;
  let wildcardAllowed = true;
  let matchedRule: string | null = null;

  for (const line of lines) {
    if (line.toLowerCase().startsWith('user-agent:')) {
      const agent = line.split(':')[1]?.trim().toLowerCase();
      inBotSection = agent === botName.toLowerCase();
      inWildcardSection = agent === '*';
    }

    if ((inBotSection || inWildcardSection) && line.toLowerCase().startsWith('disallow:')) {
      const path = line.split(':').slice(1).join(':').trim();
      if (path === '/' || path === '') {
        if (inBotSection) {
          botAllowed = false;
          matchedRule = line;
        } else {
          wildcardAllowed = false;
          if (!matchedRule) matchedRule = line;
        }
      }
    }

    if (inBotSection && line.toLowerCase().startsWith('allow:')) {
      botAllowed = true;
      matchedRule = line;
    }
  }

  // Bot-specific rules override wildcard
  return {
    allowed: inBotSection ? botAllowed : wildcardAllowed,
    matchedRule,
  };
}
```

### Schema Audit UI Addition

```
AI Crawler Access                              Score: 60/100
┌──────────────────────────────────────────────────────┐
│ ✅ GPTBot (ChatGPT)              Allowed              │
│ ✅ ChatGPT-User (browsing)       Allowed              │
│ 🔴 Google-Extended (Gemini)      BLOCKED              │
│    Rule: "User-agent: Google-Extended / Disallow: /"  │
│ ✅ Googlebot (Search + AIOs)     Allowed              │
│ ✅ PerplexityBot                 Allowed              │
│ 🔴 ClaudeBot (Claude)           BLOCKED              │
│    Rule: "User-agent: * / Disallow: /"                │
│                                                        │
│ ⚠️ 2 AI crawlers are blocked. This may reduce your    │
│   visibility in Gemini and Claude responses.           │
│                                                        │
│ [📋 Show Recommended robots.txt Changes]               │
└──────────────────────────────────────────────────────┘
```

---

## Amendment E3: Schema JSON-LD Code Generation

### The Problem

Entity Sync identifies missing schemas and creates tasks saying "add Organization schema to homepage." But for most agency operators, this task is useless without copy-paste-ready code.

### The Solution

The Task Generator agent should produce complete JSON-LD blocks populated with canonical data.

```typescript
// src/lib/entity/schema-generator.ts

export function generateOrganizationSchema(canonical: EntityCanonical): string {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: canonical.canonical_name,
    description: canonical.canonical_description,
    url: canonical.canonical_urls?.website,
  };

  if (canonical.canonical_tagline) {
    schema.slogan = canonical.canonical_tagline;
  }

  if (canonical.canonical_urls) {
    const sameAs = Object.values(canonical.canonical_urls)
      .filter(url => url && url !== canonical.canonical_urls?.website);
    if (sameAs.length > 0) schema.sameAs = sameAs;
  }

  if (canonical.canonical_contact?.phone) {
    schema.telephone = canonical.canonical_contact.phone;
  }

  if (canonical.canonical_contact?.email) {
    schema.email = canonical.canonical_contact.email;
  }

  if (canonical.canonical_contact?.address) {
    const addr = canonical.canonical_contact.address;
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: addr.street,
      addressLocality: addr.city,
      addressRegion: addr.state,
      postalCode: addr.zip,
      addressCountry: addr.country,
    };
  }

  if (canonical.canonical_founding_year) {
    schema.foundingDate = canonical.canonical_founding_year.toString();
  }

  if (canonical.canonical_founder_name) {
    schema.founder = {
      '@type': 'Person',
      name: canonical.canonical_founder_name,
    };
  }

  // Generate the script tag ready to paste into HTML
  const jsonLd = JSON.stringify(schema, null, 2);
  return `<script type="application/ld+json">\n${jsonLd}\n</script>`;
}

export function generateLocalBusinessSchema(canonical: EntityCanonical): string {
  // Similar but with LocalBusiness type + geo coordinates + openingHours
  // ...
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}
```

### Task Enhancement

When the Task Generator creates an "add_schema" task, it should now include the generated code in the `instructions` field:

```
Task: Add Organization schema to homepage

Instructions:
1. Open your website's homepage HTML (or CMS template)
2. Add the following JSON-LD code just before the closing </head> tag:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "RUN Music",
  "description": "RUN Music provides transparent short-term catalog financing...",
  "url": "https://runmusic.com",
  "sameAs": [
    "https://linkedin.com/company/runmusic",
    "https://twitter.com/runmusic"
  ],
  "telephone": "+1-310-555-0100",
  "foundingDate": "2020",
  "founder": { "@type": "Person", "name": "Diego Farias" }
}
</script>

3. Save and publish
4. Verify at https://search.google.com/test/rich-results
```

The instructions include the actual code — no interpretation needed by the operator.

---

## Amendment E4: Platform-Adapted Canonical Descriptions

### The Problem

LinkedIn has a 2,000-character About limit. Google Business Profile has 750 characters. Twitter/X bio is 160 characters. The canonical is one 250-word description. Operators have to manually trim for each platform.

### The Solution

Auto-generate platform-specific versions from the canonical.

```typescript
// src/lib/entity/platform-descriptions.ts

const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  google_business: 750,
  linkedin: 2000,
  twitter: 160,
  instagram: 150,
  facebook: 255,     // Page "About" short description
  crunchbase: 2000,
  youtube: 1000,
  trustpilot: 500,
  g2: 1500,
  capterra: 1000,
  bbb: 500,
  yelp: 1500,
  avvo: 1000,
};

export async function generatePlatformDescriptions(
  canonical: EntityCanonical
): Promise<Record<string, string>> {
  const anthropic = getAnthropicClient();

  const platforms = Object.entries(PLATFORM_CHAR_LIMITS);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    temperature: 0,
    system: 'Generate platform-specific brand descriptions adapted from a canonical description. Each must fit within the specified character limit while maintaining key messaging. Return ONLY valid JSON.',
    messages: [{
      role: 'user',
      content: `Generate platform-specific descriptions for "${canonical.canonical_name}".

CANONICAL DESCRIPTION (source of truth):
${canonical.canonical_description}

TAGLINE: ${canonical.canonical_tagline || 'none'}
CATEGORY: ${canonical.canonical_category}

Generate a description for each platform, respecting the character limit:
${platforms.map(([platform, limit]) => `- ${platform}: max ${limit} characters`).join('\n')}

Rules:
- Preserve the core value proposition in ALL versions
- Shorter versions should prioritize: what the company does + key differentiator
- Twitter/Instagram should be punchy and include the tagline if one exists
- LinkedIn/Crunchbase can be more detailed and professional
- Google Business should be optimized for local search if applicable
- EVERY description must be under its character limit

Return JSON:
{
  "google_business": "...",
  "linkedin": "...",
  "twitter": "...",
  ...
}`
    }],
  });

  const responseText = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');

  const cleaned = responseText.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
```

### Storage

```sql
-- Add to entity_canonical:
ALTER TABLE entity_canonical
  ADD COLUMN IF NOT EXISTS platform_descriptions JSONB DEFAULT '{}';
  -- { "google_business": "RUN Music provides...", "twitter": "Short-term catalog financing...", ... }
```

### UI Enhancement

In the Task Queue, when a task is "update_description" for a specific platform, show the pre-generated platform-specific description with a copy button and character count:

```
Task: Update LinkedIn description

Current (inconsistent): "We are a music distribution company helping artists..."
Recommended (from canonical): "RUN Music provides transparent short-term catalog
financing for independent artists and rights holders. Unlike traditional advances
that require ownership transfer, RUN's model allows artists to retain full
ownership while accessing upfront capital based on their streaming revenue..."

Characters: 312 / 2,000 limit

[📋 Copy Description]  [✅ Mark Complete]
```

---

## Amendment E5: sameAs Property Validation

### Add to Consistency Scorer

The `sameAs` property in Organization schema is how search engines and AI models connect entities across platforms. The consistency scorer should specifically validate this:

```typescript
// Add to ConsistencyScorerAgent analysis prompt:

// Additional check: For the website's Organization schema (if found by SchemaAuditor),
// verify that the sameAs array includes URLs for all claimed platform profiles.
//
// If the client has a claimed LinkedIn profile at linkedin.com/company/runmusic
// but the Organization schema's sameAs doesn't include that URL, flag it as:
// { field: "sameAs", type: "missing", severity: "high",
//   detail: "LinkedIn profile URL not in Organization schema sameAs array" }
//
// The sameAs check requires both:
// 1. Schema audit data (what sameAs URLs are in the markup)
// 2. Entity profile data (which platforms have claimed profiles)
// Run this check AFTER both audits complete.
```

Store sameAs validation results in `entity_schema_results.schemas_found` — add a `sameAs_validation` field to the Organization schema entry.

---

# PART 3: REFRESH FREQUENCY GUIDE

---

## Recommended Monitoring Cadences

| Data Type | Frequency | Rationale |
|-----------|-----------|-----------|
| ChatGPT, Claude, Gemini responses | Weekly | Models update training data and RAG indexes on irregular schedules. Weekly captures changes without over-spending. |
| Perplexity responses | Weekly | Perplexity uses live web search, so responses can change daily. But weekly is sufficient for SoM trending. |
| Google AI Overviews | Weekly | AIO content is grounded in live SERP results and changes as Google re-crawls. Weekly matches SERP volatility. |
| Entity platform descriptions | Monthly | Platform descriptions rarely change without human action. Monthly re-scan after task completion is sufficient. |
| Schema markup | Monthly (or on-demand after changes) | Schema doesn't change unless the client updates their website. |
| robots.txt / llms.txt | Monthly | These files change infrequently. |
| Prompt variation regeneration | Monthly | Regenerate new prompt paraphrases monthly to keep monitoring fresh. |
| Content gap analysis | Monthly (after monitoring run) | Analyze accumulated monthly data for patterns. |
| Correlation analysis | Weekly (after each monitoring run) | Overlay weekly activity against SoM changes. |
| Snapshot rollup | Weekly + Monthly | Weekly for detailed trending. Monthly for report-level summaries. |

### Cost Projection Per Client (Monthly)

| Component | Tests | Credits | Notes |
|-----------|-------|---------|-------|
| 10 keywords × 3 prompts/run × 5 models × 4 weeks | 600 tests | 1,800 | Core monitoring |
| Prompt generation (10 keywords × 5 variations) | — | 10 | Monthly regeneration |
| Content gap analysis | — | 5 | Monthly Claude analysis |
| Entity quick scan | — | 5 | Monthly |
| **Total** | **600** | **~1,820** | Per client per month |

This fits comfortably in the Growth plan (2,000 credits/month for $149). Agencies with 5+ clients would need the Agency plan (10,000 credits for $349).

---

# PART 4: BUILD SEQUENCE FOR AMENDMENTS

Build these AFTER the core module they extend is functional.

### AI Monitor Amendments (build in this order):

1. **M1: Google AI Overviews** — Add SerpApi integration, AIO agent, update registry + defaults
2. **M2: Keyword-first monitoring** — Keyword config table, prompt generator, rotation logic, onboarding flow
3. **M5: AI Visibility Score** — Composite score calculation, snapshot column, dashboard card
4. **M3: Geo/persona variation** — Location wrapper, keyword config location fields
5. **M4: Correlation engine** — Activity timeline table, correlation analyzer, timeline chart
6. **M6: Content gaps** — Gap analyzer, storage table, dashboard tab

### Entity Sync Amendments (build in this order):

1. **E2: robots.txt AI crawler audit** — Add to schema auditor (quick win, no new dependencies)
2. **E1: llms.txt audit + generation** — Add to schema auditor + generator function
3. **E3: JSON-LD code generation** — Schema generator functions + task enhancement
4. **E4: Platform-adapted descriptions** — Generator + canonical column + task UI
5. **E5: sameAs validation** — Cross-reference schema audit with entity profiles

---

# PART 5: ENVIRONMENT VARIABLES SUMMARY

```bash
# NEW — required for Amendment M1 (Google AI Overviews)
SERPAPI_API_KEY=...

# EXISTING — already in Phase 1 spec
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
APIFY_API_TOKEN=apify_api_...
GOOGLE_GEMINI_API_KEY=AIza...     # Added in AI Monitor spec
```

The only new vendor dependency is **SerpApi** for AI Overview monitoring. Everything else uses existing APIs (Anthropic, OpenAI, Perplexity, Gemini, Apify).

---

## Notes for Claude Code

- These amendments extend the module specs — they do NOT replace them
- Build the core module first, then layer amendments on top
- Each amendment is independently valuable — if time is short, prioritize M1 (AI Overviews), M2 (keyword monitoring), E2 (robots.txt audit), and E3 (JSON-LD generation)
- The SerpApi dependency is the only new cost center. At $75/month for 5,000 searches, it supports ~10 clients with weekly AIO monitoring (10 clients × 10 keywords × 3 prompts × 4 weeks = 1,200 searches/month)
- The correlation engine (M4) is the highest-impact feature for agency sales — build it even if other amendments slip
