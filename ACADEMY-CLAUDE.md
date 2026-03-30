# CLAUDE.md — MentionLayer Academy

## What This Is

Build the MentionLayer Academy — an in-app education hub that teaches agency clients what GEO (Generative Engine Optimization) is, why it matters, and how to use every module in MentionLayer to dominate AI search visibility.

This is NOT a blog. The blog already exists with 80 SEO-focused articles. The Academy is structured learning — courses, lessons, and guides — organized by module and skill level. Think HubSpot Academy meets Ahrefs Academy, but for GEO.

---

## Who It's For

- **Agency owners** who just signed up and need to understand the GEO landscape before selling it to their clients
- **Agency team members** who operate MentionLayer daily and need to know how each module works
- **Brand managers** (client-side viewers) who want to understand what their agency is doing for them

---

## Architecture

### Tech Stack

- Same Next.js 14 App Router as the main app
- Content stored as MDX files (not database) for easy editing and version control
- Rendered inside the dashboard layout with a dedicated `/academy` route
- No auth required for the learning content (public, doubles as marketing)
- Progress tracking stored in localStorage (no DB needed for MVP)

### Directory Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── academy/
│   │       ├── page.tsx                    # Academy home — course grid
│   │       ├── [courseSlug]/
│   │       │   ├── page.tsx                # Course overview + lesson list
│   │       │   └── [lessonSlug]/
│   │       │       └── page.tsx            # Individual lesson
│   │       └── layout.tsx                  # Academy layout with sidebar nav
│   └── (marketing)/
│       └── academy/
│           └── page.tsx                    # Public academy landing (same content, marketing layout)
├── content/
│   └── academy/
│       ├── courses.json                    # Course metadata + ordering
│       ├── geo-foundations/
│       │   ├── what-is-geo.mdx
│       │   ├── how-ai-models-find-answers.mdx
│       │   ├── five-pillars-of-ai-visibility.mdx
│       │   ├── geo-vs-traditional-seo.mdx
│       │   └── your-first-audit.mdx
│       ├── ai-monitor-mastery/
│       │   ├── understanding-share-of-model.mdx
│       │   ├── setting-up-keywords.mdx
│       │   ├── reading-your-results.mdx
│       │   ├── competitor-tracking.mdx
│       │   └── correlating-actions-to-visibility.mdx
│       ├── citation-engine/
│       │   ├── how-citation-seeding-works.mdx
│       │   ├── thread-discovery-explained.mdx
│       │   ├── writing-authentic-responses.mdx
│       │   ├── choosing-which-threads-to-target.mdx
│       │   └── measuring-citation-impact.mdx
│       ├── entity-sync/
│       │   ├── why-entity-consistency-matters.mdx
│       │   ├── canonical-brand-identity.mdx
│       │   ├── schema-markup-for-ai.mdx
│       │   ├── directory-audit-walkthrough.mdx
│       │   └── llms-txt-explained.mdx
│       ├── pressforge/
│       │   ├── earned-media-and-ai-authority.mdx
│       │   ├── building-press-campaigns.mdx
│       │   ├── journalist-discovery.mdx
│       │   ├── pitch-generation.mdx
│       │   └── tracking-coverage.mdx
│       ├── review-engine/
│       │   ├── reviews-as-trust-signals.mdx
│       │   ├── multi-platform-monitoring.mdx
│       │   ├── ai-response-generation.mdx
│       │   ├── review-campaigns.mdx
│       │   └── competitor-review-analysis.mdx
│       └── selling-geo/
│           ├── pitching-geo-to-clients.mdx
│           ├── running-prospect-audits.mdx
│           ├── pricing-geo-services.mdx
│           ├── monthly-reporting.mdx
│           └── case-study-template.mdx
└── components/
    └── academy/
        ├── course-card.tsx                 # Course card for grid view
        ├── lesson-sidebar.tsx              # Left nav with lesson list + progress
        ├── lesson-content.tsx              # MDX renderer with custom components
        ├── progress-tracker.tsx            # Checkmark progress per lesson
        ├── next-lesson-cta.tsx             # "Next lesson" button at bottom
        ├── module-link.tsx                 # Deep link to the actual module in dashboard
        ├── callout-box.tsx                 # Tip/warning/info callout MDX component
        ├── screenshot.tsx                  # Annotated screenshot component
        └── video-embed.tsx                 # YouTube/Loom embed component
```

---

## Courses

### Course 1: GEO Foundations
**Slug:** `geo-foundations`
**Description:** Understand why AI search is the next frontier and how MentionLayer gives you the tools to win it.
**Icon:** 🎓
**Lessons:**

#### 1.1 What Is GEO?
- Define Generative Engine Optimization
- Explain the shift: search → AI answers → citations
- The 3 things AI models need to recommend a brand: authority, consensus, recency
- How this is different from traditional SEO (and why both matter)
- Include: Simple diagram showing "User asks ChatGPT → ChatGPT searches sources → Sources include Reddit threads, press articles, directories → ChatGPT cites the brand"

#### 1.2 How AI Models Find Answers
- How ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews each work
- What data sources each model pulls from (Perplexity uses live web, ChatGPT uses training data + Bing, Gemini uses Google index, etc.)
- Why Reddit and Quora are disproportionately cited by AI
- The concept of "training data lag" vs "real-time retrieval"
- What "Share of Model" (SOM) means — percentage of AI responses that mention a brand

#### 1.3 The Five Pillars of AI Visibility
- **Citations** — Being mentioned in forum threads that AI models reference
- **AI Presence** — Direct mention rate across AI models for buying-intent queries
- **Entity Consistency** — Consistent brand info across directories and platforms
- **Reviews** — Trust signals from review platforms that AI models weight
- **Press/Earned Media** — Authority signals from third-party media
- How each pillar maps to a MentionLayer module
- The AI Visibility Score: how it's calculated (weighted average of 5 pillars)

#### 1.4 GEO vs Traditional SEO
- SEO optimizes for Google's ranked list → GEO optimizes for AI's synthesized answer
- In SEO you need to rank #1 → In GEO you need to BE the answer
- SEO signals: backlinks, keywords, page speed → GEO signals: citations, consensus, entity authority
- They're complementary, not competing — GEO amplifies SEO and vice versa
- The "zero-click" trend: more users getting answers from AI without clicking through

#### 1.5 Running Your First AI Visibility Audit
- Step-by-step walkthrough of the MentionLayer audit
- What each pillar score means
- How to read the executive summary
- Understanding the action plan priorities
- **Module link:** Jump to Audits → Run New Audit
- Include: Annotated screenshot of a completed audit dashboard

---

### Course 2: AI Monitor Mastery
**Slug:** `ai-monitor-mastery`
**Description:** Learn how to track, measure, and improve your brand's presence across every major AI model.
**Icon:** 📡

#### 2.1 Understanding Share of Model
- What SOM is and why it's the north star metric for GEO
- How SOM is calculated: (prompts where brand is mentioned / total prompts tested) × 100
- What a "good" SOM looks like by industry (0-5% = invisible, 5-15% = emerging, 15-30% = competitive, 30%+ = dominant)
- Why you track SOM over time, not as a single snapshot
- The competitor SOM comparison: knowing where you stand

#### 2.2 Setting Up Keywords for Monitoring
- What makes a good monitoring keyword (buying intent, category terms, competitor comparisons)
- How MentionLayer auto-generates prompt variations from keywords
- Why 5 prompt variations per keyword matters (AI models respond differently to phrasing)
- How to add and remove keywords
- Recommended keyword count per client (10-20 for most businesses)
- **Module link:** Jump to AI Monitor → Manage Keywords

#### 2.3 Reading Your AI Monitor Results
- The visibility score card: what the big number means
- Model breakdown: why some models mention you and others don't
- Keyword performance table: finding your strong and weak topics
- The difference between "mentioned" and "recommended"
- Understanding sentiment: positive vs neutral mentions
- **Module link:** Jump to AI Monitor dashboard

#### 2.4 Competitor Tracking
- How MentionLayer auto-discovers competitors from AI responses
- Setting focus competitors for detailed tracking
- Reading the competitor comparison chart
- Using competitor data to identify gaps ("they mention X but not us")
- Turning competitor insights into citation targets

#### 2.5 Correlating Actions to Visibility Changes
- The correlation timeline: linking your actions to SOM changes
- Typical lag times: citation seeding → visibility change (2-6 weeks)
- What causes SOM to go up (new citations, press coverage, entity fixes)
- What causes SOM to go down (competitors acting, content going stale)
- The weekly rhythm: scan → analyze → act → rescan

---

### Course 3: Citation Engine Deep Dive
**Slug:** `citation-engine`
**Description:** Master the art of placing your brand in the conversations that AI models already reference.
**Icon:** 💬

#### 3.1 How Citation Seeding Works
- The core insight: AI models cite Reddit/Quora/FB threads that rank in Google
- If your brand is mentioned in those threads, AI models pick it up
- The discovery → classify → respond → post pipeline
- Why authentic, value-first responses beat promotional ones
- The 3 response variants: casual, expert, story — when to use each
- Ethical considerations: transparent, genuine value, never astroturfing

#### 3.2 Thread Discovery Explained
- How MentionLayer finds citation-worthy threads
- SERP scanning: finding threads that rank for your keywords
- AI probing: finding threads that ChatGPT and Perplexity already cite
- The opportunity score: relevance × authority × recency × engagement
- Why thread age matters (recent threads are better, but old high-authority threads still work)

#### 3.3 Writing Authentic Responses
- Why the #1 rule is "provide genuine value before mentioning the brand"
- Platform culture differences (Reddit vs Quora vs Facebook Groups)
- The 3 variant styles and when each works best:
  - **Casual:** Quick, personal, "I've been using X" — best for Reddit
  - **Expert:** Thorough, structured, authority-building — best for Quora
  - **Story:** Personal narrative, emotionally engaging — best for Facebook Groups
- Red flags that get responses removed (too promotional, new account, irrelevant)
- Editing generated responses: what to change, what to keep

#### 3.4 Choosing Which Threads to Target
- Reading the opportunity score
- High-value targets: threads in Google top 5 + recent + high engagement
- When to skip a thread (too old, locked, irrelevant community)
- Batch processing: efficient workflow for handling 20+ threads
- **Module link:** Jump to Citation Engine → Thread Queue

#### 3.5 Measuring Citation Impact
- How to track whether a citation led to AI mentions
- The citation → AI visibility feedback loop
- Using AI Monitor to measure before/after
- Typical timelines: when to expect results
- Building a citation seeding cadence (weekly for active campaigns)

---

### Course 4: Entity Sync Guide
**Slug:** `entity-sync`
**Description:** Ensure your brand's identity is consistent across every platform that AI models reference.
**Icon:** 🏢

#### 4.1 Why Entity Consistency Matters for AI
- AI models cross-reference multiple sources to build a "brand entity"
- If sources disagree, AI models lose confidence and don't recommend you
- The consistency score: how it's calculated
- Common inconsistencies: different descriptions, wrong categories, outdated info
- The Knowledge Panel effect: consistent entities are more likely to get one

#### 4.2 Building a Canonical Brand Identity
- What a "canonical description" is and why you need one
- How MentionLayer AI-generates your canonical description from brand brief
- The approval workflow: review → edit → approve → deploy
- Adapting the canonical for different platform formats
- Version history: tracking changes over time
- **Module link:** Jump to Entity Sync → Canonical Description

#### 4.3 Schema Markup for AI Crawlers
- What structured data is and why AI models love it
- Organization schema: the minimum every brand needs
- Product, FAQ, and BreadcrumbList schemas
- How MentionLayer generates schema markup for you
- Installing schema on your website (developer handoff)
- **Module link:** Jump to Entity Sync → Schema Markup

#### 4.4 Directory Audit Walkthrough
- Which directories matter most for AI (Google Business, LinkedIn, Crunchbase, etc.)
- How MentionLayer scans and scores each platform
- Reading the consistency report
- The task list: prioritized fixes with effort/impact ratings
- **Module link:** Jump to Entity Sync → Profiles

#### 4.5 llms.txt Explained
- What llms.txt is (machine-readable file for AI crawlers, like robots.txt)
- Why it matters for AI discoverability
- How MentionLayer generates it from your brand data
- Where to deploy it on your website
- The emerging standard and future implications

---

### Course 5: PressForge Playbook
**Slug:** `pressforge`
**Description:** Build earned media authority that makes AI models trust and recommend your brand.
**Icon:** 📰

#### 5.1 Earned Media and AI Authority
- Why press coverage is one of the strongest AI ranking signals
- How AI models weight different publication types
- The authority hierarchy: major publications > industry press > guest posts > press releases
- Unlinked mentions: still valuable for AI (they don't need backlinks)
- The press velocity signal: consistent coverage > one big hit

#### 5.2 Building Press Campaigns
- Campaign types: product launch, thought leadership, data study, expert commentary
- How MentionLayer generates campaign ideas from your brand brief
- Setting campaign goals and timelines
- The campaign workflow: idea → release → pitch → coverage → track
- **Module link:** Jump to PressForge → Campaigns

#### 5.3 Journalist Discovery
- How MentionLayer finds relevant journalists
- Relevance scoring: topic match, publication authority, recent activity
- Building your media list
- The importance of personalization (never spray-and-pray)
- **Module link:** Jump to PressForge → Journalists

#### 5.4 AI-Powered Pitch Generation
- How brand voice modeling works
- Generating personalized pitches per journalist
- The pitch review workflow: generate → edit → send
- Follow-up timing and etiquette
- **Module link:** Jump to PressForge → Campaigns

#### 5.5 Tracking Press Coverage
- How MentionLayer monitors for new mentions
- Coverage types: article, mention, quote, feature
- Measuring press impact on AI visibility (connect to AI Monitor)
- Building coverage reports for clients
- **Module link:** Jump to PressForge → Coverage

---

### Course 6: Review Engine Guide
**Slug:** `review-engine`
**Description:** Leverage reviews as trust signals that influence how AI models perceive your brand.
**Icon:** ⭐

#### 6.1 Reviews as AI Trust Signals
- Why AI models weight reviews heavily in recommendations
- Which review platforms matter most by industry
- The review velocity signal: recent reviews > total count
- Sentiment analysis: how negative reviews affect AI recommendations
- The competitor review gap: when they have 500 reviews and you have 5

#### 6.2 Multi-Platform Review Monitoring
- How MentionLayer aggregates reviews from Google, Trustpilot, G2, Capterra, etc.
- The review feed: one place to see all reviews
- Sentiment tracking over time
- Alert setup: get notified on negative reviews
- **Module link:** Jump to Review Engine → Feed

#### 6.3 AI-Generated Review Responses
- Why responding to reviews matters for AI perception
- How MentionLayer generates professional responses
- Response templates: positive, negative, neutral
- The review-edit-post workflow
- **Module link:** Jump to Review Engine → Templates

#### 6.4 Review Generation Campaigns
- Setting up review request campaigns
- Choosing the right timing (post-purchase, post-service)
- The recipient workflow: select → template → send → track
- Compliance: never incentivize, always genuine
- **Module link:** Jump to Review Engine → Campaigns

#### 6.5 Competitor Review Intelligence
- Tracking competitor review trends
- Finding sentiment gaps to exploit in messaging
- Using competitor weaknesses in citation responses
- **Module link:** Jump to Review Engine → Competitors

---

### Course 7: Selling GEO to Clients (Agency Course)
**Slug:** `selling-geo`
**Description:** Position and sell GEO services to your agency clients using MentionLayer as proof.
**Icon:** 💼

#### 7.1 Pitching GEO to Clients
- The elevator pitch: "Your brand is invisible to AI search. We fix that."
- The audit-first sales motion: run a free audit, show them the gap
- Framing the competitive advantage: "Your competitors are already doing this"
- Handling objections: "Is this real?", "How long does it take?", "What's the ROI?"
- The monthly retainer model vs project-based pricing

#### 7.2 Running Prospect Audits
- Using MentionLayer's free audit as a sales tool
- Walking through audit results with a prospect
- The "here's what we'd do" action plan presentation
- Converting audit recipients to paying clients
- **Module link:** Jump to Audits → Run New Audit

#### 7.3 Pricing GEO Services
- Market rate benchmarks for GEO services
- Pricing models: per-client monthly retainer, credit-based, performance-based
- Stacking GEO with existing SEO retainers
- The MentionLayer cost structure and your margin
- Package examples: Bronze/Silver/Gold tiers

#### 7.4 Monthly Client Reporting
- What to include in a GEO report
- The AI Visibility Score as the headline metric
- Before/after comparisons using historical snapshots
- Citation counts, SOM trends, competitor movement
- **Module link:** Jump to Reports

#### 7.5 Building Case Studies
- Template for GEO case studies
- What metrics to highlight
- Getting client permission
- Publishing case studies for your own AI visibility (meta!)

---

## UI Design

### Academy Home (`/academy`)

```
┌────────────────────────────────────────────────────┐
│  MentionLayer Academy                               │
│  Master AI visibility — from fundamentals to        │
│  advanced strategies.                               │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 🎓       │ │ 📡       │ │ 💬       │           │
│  │ GEO      │ │ AI Mon.  │ │ Citation │           │
│  │ Found.   │ │ Mastery  │ │ Engine   │           │
│  │ 5 lessons│ │ 5 lessons│ │ 5 lessons│           │
│  │ ██░░ 40% │ │ ░░░░ 0%  │ │ ░░░░ 0%  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 🏢       │ │ 📰       │ │ ⭐       │           │
│  │ Entity   │ │ Press    │ │ Review   │           │
│  │ Sync     │ │ Forge    │ │ Engine   │           │
│  │ 5 lessons│ │ 5 lessons│ │ 5 lessons│           │
│  │ ░░░░ 0%  │ │ ░░░░ 0%  │ │ ░░░░ 0%  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐                                      │
│  │ 💼       │                                      │
│  │ Selling  │                                      │
│  │ GEO      │                                      │
│  │ 5 lessons│                                      │
│  │ ░░░░ 0%  │                                      │
│  └──────────┘                                      │
└────────────────────────────────────────────────────┘
```

### Lesson Page

```
┌─────────────────────────────────────────────────────┐
│  ← Back to course                                    │
│                                                       │
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │ Lesson   │  │                                    │ │
│  │ Sidebar  │  │  What Is GEO?                      │ │
│  │          │  │                                    │ │
│  │ ✅ 1.1   │  │  [MDX content rendered here]       │ │
│  │ ✅ 1.2   │  │                                    │ │
│  │ ● 1.3   │  │  Includes:                         │ │
│  │ ○ 1.4   │  │  - Annotated screenshots           │ │
│  │ ○ 1.5   │  │  - Callout boxes (tips, warnings)  │ │
│  │          │  │  - Module deep links               │ │
│  │          │  │  - Video embeds (optional)          │ │
│  │          │  │                                    │ │
│  │          │  │  ┌──────────────────────────────┐  │ │
│  │          │  │  │ 💡 Try it: Jump to AI Monitor │  │ │
│  │          │  │  │    to see this in action →     │  │ │
│  │          │  │  └──────────────────────────────┘  │ │
│  │          │  │                                    │ │
│  │          │  │  [Mark as complete ✓]              │ │
│  │          │  │  [← Previous] [Next lesson →]      │ │
│  └──────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Content Guidelines

### Tone
- **Confident but not arrogant.** You know this space. Teach with authority.
- **Practical over theoretical.** Every lesson should end with "now go do this."
- **Agency-aware.** Remember the reader runs an agency — speak to their business model.
- **No fluff.** Respect their time. If a lesson can be 500 words, don't make it 1500.

### Structure per Lesson
1. **Hook** (1-2 sentences) — Why this matters for their business
2. **Core content** (500-1000 words) — The education
3. **In MentionLayer** section — How the tool handles this specific thing
4. **Try it** callout — Deep link to the relevant module
5. **Key takeaway** — One sentence summary

### MDX Components Available
- `<Callout type="tip|warning|info">` — Colored callout boxes
- `<Screenshot src="..." alt="..." caption="..." />` — Annotated screenshot
- `<ModuleLink module="monitor|citations|entities|press|reviews" />` — Deep link button
- `<VideoEmbed url="..." />` — YouTube or Loom embed
- `<KeyTakeaway>` — Highlighted summary box at lesson end

---

## Integration Points

### "Learn More" Links in Dashboard
Every module header gets a small "📚 Learn" link:
- AI Monitor → links to `/academy/ai-monitor-mastery`
- Citation Engine → links to `/academy/citation-engine`
- Entity Sync → links to `/academy/entity-sync`
- PressForge → links to `/academy/pressforge`
- Review Engine → links to `/academy/review-engine`
- Audits → links to `/academy/geo-foundations/your-first-audit`

### Onboarding Integration
After a new user completes the onboarding wizard, show a card:
"New to AI visibility? Start with GEO Foundations →"

### Empty State Integration
When a module has no data yet, the empty state includes:
"Learn how [module] works → [Academy link]"

---

## Build Priority

### Phase 1: Framework + GEO Foundations (ship first)
- Academy routing and layout
- Course grid home page
- Lesson sidebar with progress
- MDX rendering with custom components
- GEO Foundations course (5 lessons) — fully written
- "Learn" links added to each module header

### Phase 2: Module Courses
- AI Monitor Mastery (5 lessons)
- Citation Engine Deep Dive (5 lessons)
- Entity Sync Guide (5 lessons)

### Phase 3: Advanced Courses
- PressForge Playbook (5 lessons)
- Review Engine Guide (5 lessons)
- Selling GEO to Clients (5 lessons)

### Phase 4: Rich Media
- Annotated screenshot library
- Video walkthroughs (Loom embeds)
- Interactive quizzes per course
- Completion certificates

---

## Notes for Claude Code

1. **Use MDX** — not database-stored content. MDX files in `/content/academy/` are version-controlled and easy to edit.
2. **Progress tracking** — localStorage for MVP. Keys: `academy_progress_{courseSlug}` storing an array of completed lesson slugs.
3. **Don't over-design.** The lesson pages should be clean, readable, text-focused. Think Stripe Docs or Linear's changelog — not a flashy learning platform.
4. **Module deep links** must use the actual dashboard routes, not placeholder URLs.
5. **The "Selling GEO" course is the most valuable for retention.** It teaches agency owners how to make money with the tool — that's what keeps them subscribed.
6. **Write in Joel House's voice** — direct, practical, no bullshit, numbers-driven. He runs an SEO agency and speaks to agency owners. Not academic, not corporate.
7. **Each lesson should be completable in 5-10 minutes.** Short and actionable beats long and comprehensive.
