# GrowthForge Blog Content Master Plan

**Purpose:** This is the single source of truth for writing all 180 blog articles. Every writing session should read this file first.

**Status tracker:** `src/lib/blog/posts.ts` — check which post files exist and how many articles are published. The content calendar below tracks what needs writing.

---

## How Writing Sessions Work

### Session Setup
1. Read THIS file first — it contains the style guide, quality rules, and linking strategy
2. Check `src/lib/blog/posts.ts` to see what batches exist (posts-1-5.ts through posts-X.ts)
3. Pick up where the last session left off using the calendar below
4. Write 10-20 articles per session (one TypeScript file per batch of 5)

### File Structure
- Each batch of 5 articles goes in `src/lib/blog/posts-{N}-{N+4}.ts`
- Export as `postsNtoM: BlogPost[]`
- Import and spread into `src/lib/blog/posts.ts`
- Set `publishedAt` dates to match the calendar schedule below

### After Writing
- Run `npx next build` to verify no TypeScript errors
- Commit and push — articles auto-publish on their scheduled date (ISR revalidates every 12 hours)

---

## Author Entity Strategy

### Why This Matters
Joel House publishes across three properties: growthforge.io, xpanddigital.com, and joelhouse.com. This **compounds** entity authority — Google and AI models triangulate a single expert entity from multiple sources. The key structural requirement: joelhouse.com/about is the **Entity Home** — the canonical reference page that all author bios link back to.

### Author for All Articles
```
author: { name: "Joel House", role: "Founder, GrowthForge" }
```

### Author Schema (Already Implemented)
The blog post template (`src/app/(marketing)/blog/[slug]/page.tsx`) renders structured Person schema on every article with:
- `url: "https://joelhouse.com/about"` (Entity Home)
- `sameAs` links to LinkedIn, Xpand Digital, GrowthForge
- `worksFor` → GrowthForge organization
- Full author bio description mentioning "AI for Revenue" book

### Content Lane Separation (Prevent Cross-Site Cannibalization)
| Site | Content Focus | Never Publish Here |
|------|--------------|-------------------|
| **growthforge.io** | Product-led GEO: audits, benchmarks, platform tutorials, tactical playbooks | Agency case studies, personal opinion pieces |
| **xpanddigital.com** | Agency-led: "why hire us," client case studies, service pages | Platform tutorials, product comparisons |
| **joelhouse.com** | Thought leadership: opinion, book excerpts, speaking topics, future-of-search | Step-by-step product tutorials, agency pitches |

### Joel House Quotes (REQUIRED in Every Article)
Research shows **attributed expert quotes increase AI citation rates by 28%** (Princeton GEO study). Every article must include **2-3 Joel House quotes** using this format:

```
According to Joel House, founder of GrowthForge and author of AI for Revenue, "[original insight about the topic]."
```

Or the first-person variant:
```
"In our experience running AI visibility campaigns at GrowthForge, we\\'ve found that [specific observation with data]," says Joel House.
```

**Quote placement rules:**
- One quote in the first third of the article (where 44% of AI citations come from)
- One quote in the expert perspective section
- Optional third quote in the conclusion
- Quotes must contain ORIGINAL insights — not restatements of statistics found elsewhere
- Quotes should reference GrowthForge platform experience, client campaign data, or forward-looking predictions

---

## GEO-Optimized Article Framework

### Why This Framework Exists
The Princeton/Georgia Tech GEO study and Kevin Indig's 1.2M ChatGPT citation study prove that article structure directly affects whether AI models cite your content. This framework is engineered to maximize AI citations, not just Google rankings.

### The "First 30%" Rule
**44.2% of all AI citations come from the first 30% of content** (Kevin Indig study of 1.2M ChatGPT responses). The opening of every article is the most valuable real estate. Front-load your direct answer, primary statistic, and first Joel House quote.

### Optimal Section Structure
Each section should be **120-180 words** between headings. This range gets 70% more ChatGPT citations than shorter, fragmented sections. Use clear H2/H3 hierarchy — content with proper heading structure gets cited **65% more** frequently.

### The Blueprint (Follow This for Every Article)

```
## Section 1: Direct Answer (First 200 words — CRITICAL)
- Open with a 1-2 sentence direct answer to the article's core question
- Include the primary statistic or data point
- Include first Joel House quote: "According to Joel House..."
- This section is where 44% of AI citations will come from
- Do NOT waste this space on background or context

## Section 2: Core Concept / Definition
- Explain the core idea in clear, structured prose
- 120-180 words
- Include 1-2 statistics with sources
- Use "according to [source]" attribution style

## Section 3: Detailed Analysis / How-To
- Break into H3 subsections where needed
- Each H3 targets a specific sub-question
- Include original data, benchmarks, or first-person experience
- Second Joel House quote placed here

## Section 4: Expert Perspective / Original Insight
- First-person commentary from Joel House
- Original data from GrowthForge platform (if available)
- Contrarian or forward-looking position
- "In our experience at GrowthForge, we\\'ve found that..."

## Section 5: Comparison / Practical Application (where relevant)
- Tables comparing options (AI models love extracting tables)
- Structured lists with clear differentiators
- Actionable takeaways

## Section 6: Frequently Asked Questions
- 4-6 Q&A pairs
- Each answer: 50-80 words, self-contained
- FAQPage schema renders automatically
- Target long-tail queries
```

### What Makes Content Get Cited (Ranked by Impact)
1. **Statistics** — adding stats improves AI visibility by **40.9%** (largest gain of any technique)
2. **Expert attribution** — "According to [Name]..." format improves citations by **28%**
3. **Named author with credentials** — bylined content with verifiable expertise outperforms anonymous
4. **Self-contained sections** — 120-180 words per section, each answerable in isolation
5. **FAQ schema** — pages with FAQPage schema are **3.2x more likely** to appear in AI Overviews
6. **Tables** — AI models preferentially extract structured tabular data
7. **Freshness** — 76.4% of ChatGPT's cited pages were updated within 30 days
8. **Information density** — 5+ facts per 100 words outperforms padded content

### Platform-Specific Citation Preferences
| AI Platform | What It Prefers | Key Optimization |
|-------------|----------------|------------------|
| **ChatGPT** | Encyclopedic, factual; Wikipedia is #1 at 7.8% of citations | Direct definitions, structured facts, entity references |
| **Perplexity** | Expert sources, reviews; Reddit at 6.6% of citations | Expert quotes, attributed data, original research |
| **Gemini** | Brand-owned websites (52% of citations from brand domains) | Schema markup, structured pages, consistent subdomains |
| **AI Overviews** | Well-structured intent-matching content | FAQ schema, H2/H3 hierarchy, direct answers |

---

## Brand Voice & Style Guide

### Tone
- **Direct and specific.** Lead with data, not fluff. "Reddit appears in 68% of AI answers" not "Reddit is very important."
- **Practitioner voice.** Write as someone who runs AI visibility campaigns daily, not as a journalist covering them.
- **Confident but honest.** Make strong claims backed by data. Acknowledge uncertainty where it exists.
- **Zero filler phrases.** Never use: "In today's digital landscape," "Let's dive in," "In the ever-evolving world of," "It's no secret that," "At the end of the day," "game-changer," "revolutionary," "paradigm shift."
- **Short paragraphs.** 2-4 sentences max. One idea per paragraph.
- **Use numbers.** "3.2x more citations" not "significantly more citations."

### Formatting Rules
- Sections use `## Heading` style (rendered as H2s on the blog)
- Use markdown-style links: `[anchor text](/blog/slug)` for internal links
- Bullet points for lists of 3+ items
- Bold key phrases within paragraphs for scannability
- Every article starts with a "Key Takeaway" (the `keyTakeaway` field) — 1-2 sentence TL;DR
- Include markdown tables wherever comparisons or structured data exists

### Content Rules
- **First 200 words must contain a direct answer + statistic + Joel House quote.** This is the AI citation zone.
- **Include 2-3 Joel House quotes per article** using the attribution format above
- **Include at least one original insight** per article — proprietary data, a framework, a specific example from campaign experience
- **All statistics must be specific and sourced** (in the content text, not footnotes)
- **Minimum 4 internal links per article**, spread across multiple sections
- **Include 3-5 FAQs** at the end of every article (these render with FAQ schema)
- **Never duplicate another article's core topic.** Overlap is fine; duplication is not.
- **Sections should be 120-180 words each** for optimal AI extraction

### Apostrophe Escaping
Content strings use template literals (backticks). **All apostrophes in content must be escaped as `\\'`** to avoid breaking the template literal. This is critical — every `it's`, `don't`, `you're`, `brand's` must be `it\\'s`, `don\\'t`, `you\\'re`, `brand\\'s`.

---

## TypeScript Interface

Every article must conform to this type (defined in `src/lib/blog/types.ts`):

```typescript
interface BlogPost {
  slug: string;                    // kebab-case URL slug
  title: string;                   // H1 title
  summary: string;                 // 1-2 sentence summary for cards
  metaTitle: string;               // SEO title (under 60 chars)
  metaDescription: string;         // SEO description (under 155 chars)
  targetKeyword: string;           // Primary keyword to rank for
  publishedAt: string;             // ISO date matching calendar
  updatedAt?: string;              // Set on refreshes only
  author: { name: string; role: string };
  category: "fundamentals" | "strategy" | "technical" | "industry" | "tools";
  buyingStage: "awareness" | "consideration" | "decision";
  estimatedReadTime: number;       // Minutes (word count / 250)
  relatedSlugs: string[];          // 3-5 related article slugs
  faqs: Array<{ question: string; answer: string }>;  // 3-5 FAQs
  sections: Array<{ id: string; title: string; content: string }>;
  keyTakeaway: string;             // TL;DR box at top of article
}
```

---

## Internal Linking Strategy

### Layer 1: Within-Cluster Hub and Spoke
- Every supporting article links back to its cluster's pillar page
- Every pillar page links to all its supporting articles
- Use the pillar's target keyword as anchor text

### Layer 2: Cross-Cluster Strategic Links
- Link from informational → commercial content (guides → comparisons, tools)
- Link from newer articles → older established articles (pass authority backward)
- Link from blog articles → product pages where natural:
  - `/features` — when describing what a GEO platform does
  - `/pricing` — when discussing agency services pricing
  - `/how-it-works` — when explaining the audit-discover-seed-monitor cycle
  - `/use-cases/agencies` — when writing about agency use cases
  - `/use-cases/brands` — when writing about brand use cases
  - `/help/ai-visibility-audit` — when referencing the audit process
  - `/help/citation-engine` — when referencing citation seeding

### Layer 3: Glossary Auto-Links
Every first occurrence of these terms in any article should link to its glossary page:

| Term | Link Target |
|------|-------------|
| Answer engine optimization / AEO | `/blog/what-is-answer-engine-optimization` |
| LLMO | `/blog/what-is-llmo` |
| Prompt-based search | `/blog/what-is-prompt-based-search` |
| AI referral traffic | `/blog/what-is-ai-referral-traffic` |
| Citation velocity | `/blog/what-is-citation-velocity` |
| LLM seeding / Content seeding | `/blog/what-is-llm-seeding` or `/blog/what-is-content-seeding` |
| AI visibility score | `/blog/what-is-ai-visibility-score` |
| Consensus layer | `/blog/what-is-consensus-layer-ai-search` |
| Share of model | `/blog/share-of-model-metric` |
| E-E-A-T | `/blog/what-is-eeat-framework-ai` |
| Entity authority | `/blog/what-is-entity-authority-ai` |
| Knowledge graph | `/blog/what-is-knowledge-graph` |
| Structured data | `/blog/what-is-structured-data-ai` |
| Topical authority | `/blog/what-is-topical-authority-ai` |
| Content cluster | `/blog/what-is-content-cluster` |
| RAG | `/blog/what-is-rag-seo` |
| AI brand sentiment | `/blog/what-is-ai-brand-sentiment` |
| Unlinked mention | `/blog/what-is-unlinked-mention` |
| Agentic SEO | `/blog/what-is-agentic-seo` |
| Information gain | `/blog/what-is-information-gain-ai-search` |

### Layer 4: Related Articles
Each article's `relatedSlugs` array should contain 3-5 slugs from:
1. Same cluster siblings (priority)
2. Closest cross-cluster matches
3. The cluster's pillar page (if the article is a supporting piece)

### Links to Existing 20 Articles
These are already published and should be linked TO from new articles wherever relevant:

| Slug | Topic | Category |
|------|-------|----------|
| `brand-invisible-to-ai` | Brand visibility test | fundamentals |
| `ai-seo-vs-traditional-seo` | AI SEO vs traditional | fundamentals |
| `what-is-geo-complete-guide` | GEO pillar page | fundamentals |
| `share-of-model-metric` | Share of Model definition | fundamentals |
| `ai-citation-index` | Which sources AI cites | fundamentals |
| `how-ai-models-choose` | AI source selection | fundamentals |
| `reddit-most-important-platform` | Reddit for GEO | strategy |
| `citation-seeding-playbook` | Seeding playbook | strategy |
| `platform-by-platform-geo` | Platform optimization | strategy |
| `ai-visibility-audit-five-pillars` | 5-pillar audit | tools |
| `schema-markup-ai-search` | Schema for AI | technical |
| `digital-pr-ai-era` | Digital PR and AI | strategy |
| `robots-txt-ai-crawlers` | Robots.txt strategy | technical |
| `zero-click-search-data` | Zero-click analysis | fundamentals |
| `entity-seo-knowledge-graph` | Entity SEO | technical |
| `ai-visibility-tools-compared` | Tool comparison | tools |
| `geo-for-agencies` | Agency guide | industry |
| `geo-for-saas` | SaaS guide | industry |
| `roi-ai-visibility` | ROI calculation | strategy |
| `ninety-day-playbook` | 90-day plan | strategy |

---

## Quality Checklist (Every Article)

Before marking an article done, verify:

### GEO Optimization (AI Citation Maximization)
- [ ] First 200 words contain: direct answer + key statistic + first Joel House quote
- [ ] Contains 2-3 Joel House quotes using "According to Joel House..." format
- [ ] Quotes contain ORIGINAL insights (not restatements of existing data)
- [ ] Sections are 120-180 words each (optimal for AI extraction)
- [ ] At least one markdown table (where relevant — AI models extract tables preferentially)
- [ ] Information density: 5+ facts per 100 words (no padding or filler)

### Content Quality
- [ ] `keyTakeaway` is a clear 1-2 sentence TL;DR
- [ ] Contains at least one original insight, framework, or data point
- [ ] All statistics include specific numbers with source context
- [ ] 3-5 FAQs with specific, self-contained answers (50-80 words each)
- [ ] No filler phrases (checked against banned list above)
- [ ] Answers the search intent completely within the article

### Internal Linking & SEO
- [ ] Minimum 4 internal links spread across multiple sections
- [ ] Links to at least 1 product page where natural
- [ ] Links to at least 2 related blog articles
- [ ] First occurrence of glossary terms are linked to their glossary page
- [ ] `relatedSlugs` has 3-5 entries from same cluster + cross-cluster
- [ ] `metaTitle` under 60 characters
- [ ] `metaDescription` under 155 characters

### Keyword Deduplication
- [ ] Primary keyword (`targetKeyword`) is unique — not assigned to any other article
- [ ] Search intent is different from any existing article on a similar topic
- [ ] Checked against KEYWORD-DEDUP-MAP.md before writing

### Technical
- [ ] All apostrophes escaped as `\\'`
- [ ] `publishedAt` matches the calendar date
- [ ] Category and buyingStage are correct
- [ ] Author set to `{ name: "Joel House", role: "Founder, GrowthForge" }`

---

## Key Statistics Bank

Reference these throughout articles (with attribution):

| Stat | Source Context |
|------|--------------|
| 527% YoY growth in AI-referred sessions | 2025 data |
| 37% of consumers start searches with AI, not Google | 2026 survey |
| 60-83% of searches end with zero clicks | 83% when AI Overviews appear |
| AI Overviews slash organic CTR by 61% | Google data |
| Reddit appears in 68% of AI answers | Citation study |
| Reddit in 95% of product-review AI queries on Google | Semrush study |
| Content with schema has 2.5x higher chance of AI citation | Search Engine Land |
| 76.4% of ChatGPT's cited pages updated within 30 days | Freshness study |
| Only 6% of AI brand mentions result in recommendations | Rand Fishkin / SparkToro |
| Brand mentions correlate 3x more than backlinks with AI visibility | Citation research |
| Perplexity averages 21.87 citations per response | Qwairy Q3 2025 study |
| ChatGPT averages 7.92 citations per response | Qwairy Q3 2025 study |
| Wikipedia accounts for 47.9% of ChatGPT top-10 citations | Profound study |
| YouTube overtook Reddit: 39.2% vs 20.3% social citation share | PikaSEO study |
| Only 11% of cited domains appear across multiple AI platforms | Cross-platform study |
| 90% of citations driving LLM visibility come from earned media | PR on the Go |
| Content with H2/H3 hierarchy and bullets cited 65% more | Content structure study |
| First-person writing with author byline yields 1.67x citation improvement | GEO study |
| AI citation visibility can decay within 48-72 hours | Decay research |
| AI referral traffic converts 4.4x better than organic | Conversion data |
| LLM-referred visitors convert 5-9x higher for B2B | BrightEdge data |

---

## 6-Month Content Calendar

**Schedule:** April 1 – September 27, 2026, one article per day.
**Full calendar:** See `CONTENT-CALENDAR-180.md` for the complete day-by-day breakdown.
**Cluster sequencing:** Complete one cluster (pillar + 8-12 supporting articles) before starting the next.

### Month-by-Month Overview

| Month | Dates | Clusters | Articles |
|-------|-------|----------|----------|
| **1** | Apr 1-30 | GEO Fundamentals → AI Search Visibility | 30 |
| **2** | May 1-31 | Topical Authority → Content Seeding & Forums | 31 |
| **3** | Jun 1-30 | E-E-A-T for AI → Entity & Knowledge Graphs | 30 |
| **4** | Jul 1-30 | Agency AI SEO → AI Monitoring & Measurement | 30 (2 refreshes) |
| **5** | Aug 1-30 | AI Model-Specific → Digital PR → Industry Pt.1 | 30 (2 refreshes) |
| **6** | Sep 1-27 | Industry Pt.2 → Technical → Future → Case Studies | 29 (4 refreshes) |

### Content Type Distribution

| Type | Count | Word Count Range |
|------|-------|-----------------|
| Pillar pages | 15 | 3,000-5,000 |
| Standard articles | 55 | 1,500-2,500 |
| Short tactical | 25 | 800-1,200 |
| Glossary/definition | 25 | 500-800 |
| Comparison/versus | 18 | 1,500-2,000 |
| Listicles | 15 | 1,200-2,000 |
| Data/statistics | 10 | 1,500-2,500 |
| Case studies | 8 | 1,200-2,000 |
| Trend pieces | 5 | 800-1,500 |
| Templates/tools | 4 | 800-1,500 |

### Buying Stage Mix

| Stage | Count | % |
|-------|-------|---|
| Awareness | 58 | 32% |
| Consideration | 93 | 52% |
| Decision | 29 | 16% |

---

## Writing Session Workflow

### Starting a New Session

```
1. Read .claude/blog-content-plan.md (this file)
2. Read CONTENT-CALENDAR-180.md to find next batch of articles
3. Check src/lib/blog/posts.ts to see last written batch number
4. Write next 10-20 articles as posts-{N}-{M}.ts files
5. Update posts.ts barrel file to import new batches
6. Run npx next build to verify
7. Commit and push
```

### Naming Convention

| Articles | File | Export Name |
|----------|------|-------------|
| 21-25 | `posts-21-25.ts` | `posts21to25` |
| 26-30 | `posts-26-30.ts` | `posts26to30` |
| 31-35 | `posts-31-35.ts` | `posts31to35` |
| ... | ... | ... |

### Updating the Barrel File

After writing new batch files, add to `src/lib/blog/posts.ts`:

```typescript
import { posts21to25 } from "./posts-21-25";
// ... etc

export const blogPosts = [
  ...posts1to5,
  // ... existing batches
  ...posts21to25,
  // ... new batches
];
```

---

## Post-Sprint Plan (After Month 6)

- Reduce to 3-4 articles per week
- Monthly refresh cycle for pillar content
- Expand A-tier articles into video, infographics, lead magnets
- Begin guest posting and digital PR for backlinks
- Re-run AI visibility audit to measure progress
- Create resource hub pages that aggregate clusters by audience
