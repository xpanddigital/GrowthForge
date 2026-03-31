# SEO/GEO Implementation Audit Prompt

Give this prompt to Claude Opus along with the `MASTER-seo-geo-technical-spec.md` file. It will perform a line-by-line verification of every implementation detail — not trusting that it was done, but proving it by reading the actual rendered output and source code.

---

## Prompt

You are a senior technical SEO auditor. A previous Claude Sonnet session implemented the `MASTER-seo-geo-technical-spec.md` specification on this project. Your job is to **verify every single item was done correctly** — not by asking, not by assuming, but by reading the actual source code and rendered output. Sonnet is fast but can cut corners, miss edge cases, or implement things slightly wrong. You are the quality gate.

### Audit Rules

1. **Read every file before judging it.** Do not assume anything passes based on file existence alone.
2. **Check rendered output, not just source.** A JSON-LD block that exists in code but has a typo in a property name is a fail.
3. **Flag severity levels:** CRITICAL (breaks SEO/GEO), IMPORTANT (weakens signals), MINOR (cosmetic or best-practice).
4. **For each item, report:** PASS, FAIL (with what's wrong), or PARTIAL (implemented but incomplete).
5. **At the end, give a score out of 10** and a prioritized fix list.

### Audit Procedure

Work through every section below in order. For each section, read the relevant files, verify the implementation, and report findings.

---

#### SECTION 0: Author Hub-and-Spoke Architecture

**Files to read:**
- The AUTHORS registry file (likely `src/lib/blog/types.ts` or similar)
- The author page route (likely `src/app/(marketing)/author/[slug]/page.tsx` or similar)
- One blog post page to check author linking

**Verify:**
- [ ] `BlogAuthor` interface has all required fields: `slug`, `name`, `role`, `bio`, `extendedBio`, `url` (local), `hub` (external), `image`, `knowsAbout`, `sameAs`
- [ ] `author.url` points to LOCAL `/author/[slug]` — NOT to `joelhouse.com` or any external URL
- [ ] `author.hub` points to `https://joelhouse.com/about`
- [ ] `author.image` is a local path (e.g., `/authors/joel-house.jpg`), not an external URL
- [ ] `author.sameAs` array includes the hub URL + LinkedIn + any other spoke sites
- [ ] `getAuthorBySlug()` helper function exists and works
- [ ] `extendedBio` is 200-500 words, written in third person
- [ ] The headshot file actually exists at the path specified in `author.image` (check `public/authors/`)
- [ ] `/author/[slug]` page exists with `generateStaticParams()` from AUTHORS keys
- [ ] Author page `generateMetadata()` sets: title, description, canonical (absolute URL), OG type="profile"
- [ ] Author page renders: headshot, name, role, extended bio, social links, expertise tags
- [ ] Author page has auto-generated list of all published posts by this author
- [ ] Author page JSON-LD is `ProfilePage` with `mainEntity` of type `Person`
- [ ] ProfilePage JSON-LD includes: `sameAs`, `worksFor`, `knowsAbout`, `jobTitle`, `description`
- [ ] Person `@id` in ProfilePage JSON-LD points to the hub URL (entity consolidation anchor)

---

#### SECTION 1: Root Layout Technical SEO

**Files to read:**
- `src/app/layout.tsx` (or root layout equivalent)

**Verify:**
- [ ] `Viewport` export exists with `width: "device-width"`, `initialScale: 1`, `maximumScale: 5`, `themeColor`
- [ ] `metadataBase` is set to `new URL(BASE_URL)` — this is CRITICAL for OG image resolution
- [ ] Title has `template: "%s | [BrandName]"` pattern
- [ ] Title has a `default` value for the homepage
- [ ] `description` is 140-160 characters
- [ ] `icons` includes `icon` (favicon) and `apple` (apple-touch-icon)
- [ ] `openGraph` has: title, description, type="website", url, siteName, images with width/height/alt
- [ ] `twitter` has: card="summary_large_image", title, description, images
- [ ] `alternates.canonical` is set to BASE_URL
- [ ] `robots` includes `index: true`, `follow: true`
- [ ] `robots.googleBot` includes `max-image-preview: "large"`, `max-snippet: -1`, `max-video-preview: -1`
- [ ] `<html lang="en">` is set
- [ ] `OrganizationJsonLd` is rendered in the layout (in `<head>` or body)
- [ ] `WebSiteJsonLd` is rendered in the layout
- [ ] OrganizationJsonLd contains: name, url, logo, description, founder (Person), contactPoint, sameAs
- [ ] WebSiteJsonLd contains: name, url, potentialAction (SearchAction with urlTemplate)

---

#### SECTION 2: Per-Page Metadata

**Files to read:**
- Every marketing page (features, pricing, services, how-it-works, academy, use-cases, etc.)

**For each page, verify:**
- [ ] `export const metadata: Metadata` exists (or `generateMetadata` for dynamic pages)
- [ ] Title is under 60 characters (excluding template suffix) — actually count the characters
- [ ] Title does NOT contain the brand name (root template adds it — check for doubling)
- [ ] Description is 140-160 characters — actually count
- [ ] Description contains the primary keyword
- [ ] `openGraph` has title (WITH brand name), description, images
- [ ] Page renders at least one JSON-LD component appropriate to its type (WebPage, Service, Course, etc.)
- [ ] Page renders a `BreadcrumbJsonLd` with correct hierarchy

**Common Sonnet mistakes to look for:**
- Title too long (Sonnet often writes verbose titles)
- Brand name in both page title AND template suffix (doubling)
- Missing OG images
- BreadcrumbJsonLd with wrong URL paths
- JSON-LD rendered but with placeholder text from the spec

---

#### SECTION 3: Blog Post Template

**Files to read:**
- Blog post page component (likely `src/app/(marketing)/blog/[slug]/page.tsx`)
- Blog post types file
- At least 2 actual blog post data files to verify real content

**Metadata verification:**
- [ ] `generateMetadata()` strips brand suffix before returning title (check for regex or replace)
- [ ] `alternates.canonical` is set to the POST URL (`${BASE_URL}/blog/${slug}`), NOT the homepage
- [ ] `openGraph.type` is `"article"`
- [ ] `openGraph.publishedTime` is set from `post.publishedAt`
- [ ] `openGraph.modifiedTime` is set from `post.updatedAt` (falling back to publishedAt)
- [ ] `openGraph.authors` is set
- [ ] `openGraph.section` is set to the category label
- [ ] `openGraph.tags` includes target keyword
- [ ] `openGraph.images` has `width: 1200`, `height: 630`, `alt` set
- [ ] `twitter.card` is `"summary_large_image"`
- [ ] `keywords` meta contains the target keyword

**JSON-LD verification (read the actual object, not just that it exists):**
- [ ] `@type` is `"BlogPosting"` (NOT `"Article"`)
- [ ] `mainEntityOfPage` has `@type: "WebPage"` with `@id` = post canonical URL
- [ ] `headline` = post title
- [ ] `description` = post summary
- [ ] `image` = OG image URL
- [ ] `datePublished` = ISO date
- [ ] `dateModified` = ISO date (DIFFERENT from published when `updatedAt` exists)
- [ ] `wordCount` = calculated from actual content (not hardcoded or estimated)
- [ ] `articleSection` = category label string
- [ ] `keywords` = target keyword
- [ ] `inLanguage` = `"en-US"`
- [ ] `author.@type` = `"Person"`
- [ ] `author.url` = ABSOLUTE URL to LOCAL author page (`https://domain.com/author/joel-house`)
- [ ] `author.url` is NOT a relative path like `/author/joel-house` (must be absolute in JSON-LD)
- [ ] `author.url` is NOT pointing to `joelhouse.com` (must be local)
- [ ] `author.sameAs` array is present and populated
- [ ] `author.worksFor` has Organization with name and url
- [ ] `author.image` is present (if headshot exists)
- [ ] `author.description` is the short bio
- [ ] `publisher.@type` = `"Organization"` with `name`, `url`, `logo` (ImageObject)
- [ ] `isPartOf` has `@type: "Blog"` with name and url
- [ ] `speakable` has `@type: "SpeakableSpecification"` with `cssSelector` array
- [ ] Speakable selectors target `[data-speakable='key-takeaway']` and `[data-speakable='summary']`

**BreadcrumbList JSON-LD:**
- [ ] Separate JSON-LD block (not nested in BlogPosting)
- [ ] 4 items: Home > Blog > Category > Post Title
- [ ] Each item has `position`, `name`, and `item` (absolute URL)
- [ ] Category item URL matches the blog filter URL pattern

**FAQPage JSON-LD:**
- [ ] Present when post has FAQs (check a post that has FAQs)
- [ ] NOT present when post has no FAQs (check a post without FAQs)
- [ ] Each question has `@type: "Question"` with `name` and `acceptedAnswer.text`

**On-page HTML verification:**
- [ ] Author name is rendered as a `<Link>` or `<a>` pointing to `/author/[slug]` (LOCAL)
- [ ] Author link has `rel="author"` attribute
- [ ] Author avatar/image is displayed
- [ ] Published date uses `<time datetime="YYYY-MM-DD">` element
- [ ] Updated date is shown when different from published, also with `<time>` element
- [ ] `<nav aria-label="Breadcrumb">` exists at top
- [ ] `<nav aria-label="Table of contents">` exists
- [ ] Content is wrapped in `<article>` element
- [ ] Single `<h1>` for the title
- [ ] Section headings use `<h2>` with anchor IDs
- [ ] Key takeaway box has `data-speakable="key-takeaway"` attribute
- [ ] Summary paragraph has `data-speakable="summary"` attribute
- [ ] Word count is displayed and calculated from actual content
- [ ] FAQ section uses `<details>`/`<summary>` elements
- [ ] Author bio aside has `<aside aria-label="About the author">`
- [ ] Related articles section exists with links to other posts
- [ ] CTA block exists between content and related articles
- [ ] "Back to Blog" link exists

---

#### SECTION 4: JSON-LD Component Library

**Files to read:**
- `src/components/seo/json-ld.tsx` (or equivalent)

**Verify these components exist and are correctly implemented:**
- [ ] `OrganizationJsonLd` — renders Organization with name, url, logo, founder, sameAs
- [ ] `WebSiteJsonLd` — renders WebSite with SearchAction
- [ ] `WebPageJsonLd` — accepts title, description, url props
- [ ] `BreadcrumbJsonLd` — accepts items array, renders with position/name/item
- [ ] `FAQPageJsonLd` — accepts questions array
- [ ] `ProfilePageJsonLd` — renders ProfilePage + Person mainEntity with sameAs, worksFor, knowsAbout
- [ ] All components use `BASE_URL` for absolute URLs (not relative)
- [ ] All components render `<script type="application/ld+json">` with `dangerouslySetInnerHTML`

**Common Sonnet mistakes:**
- Rendering relative URLs in JSON-LD (must always be absolute)
- Missing `@context: "https://schema.org"` on schema objects
- Forgetting to stringify the data object
- Using `Article` instead of `BlogPosting`
- ProfilePageJsonLd missing `@id` on the Person entity

---

#### SECTION 5: Robots.txt

**Files to read:**
- `src/app/robots.ts`

**Verify:**
- [ ] Default rule allows `/` and disallows `/api/`, `/dashboard/`, `/login`, `/signup`
- [ ] `ChatGPT-User` is ALLOWED (retrieval bot)
- [ ] `PerplexityBot` is ALLOWED (retrieval bot)
- [ ] `Claude-SearchBot` is ALLOWED (retrieval bot)
- [ ] `GPTBot` is BLOCKED (training bot)
- [ ] `ClaudeBot` is BLOCKED (training bot)
- [ ] `CCBot` is BLOCKED (training bot)
- [ ] `Google-Extended` is BLOCKED (training bot)
- [ ] `Bytespider` is BLOCKED (training bot)
- [ ] `anthropic-ai` is BLOCKED (training bot)
- [ ] Sitemap URL is declared: `sitemap: ${BASE_URL}/sitemap.xml`

**Critical distinction:** Retrieval bots (allow) fetch pages to answer user queries — you WANT citations. Training bots (block) scrape for model training.

---

#### SECTION 6: Sitemap

**Files to read:**
- `src/app/sitemap.ts`

**Verify:**
- [ ] Returns `MetadataRoute.Sitemap`
- [ ] Includes all static marketing pages with appropriate priorities
- [ ] Includes author pages (from AUTHORS registry) with priority 0.7
- [ ] Includes published blog posts with priority 0.8
- [ ] Blog posts use `post.updatedAt || post.publishedAt` for `lastModified`
- [ ] Blog posts are filtered to only published (publishedAt <= today)
- [ ] Author pages are generated from `Object.values(AUTHORS)`

---

#### SECTION 7: OG Image Generation

**Files to read:**
- `src/app/api/og/route.tsx` (or equivalent)

**Verify:**
- [ ] Route exists and exports `GET` handler
- [ ] Uses `runtime = "edge"`
- [ ] Accepts `title` and `category` search params
- [ ] Returns `ImageResponse` with `width: 1200, height: 630`
- [ ] Renders author name and brand name in the image
- [ ] Has readable title text (font size adapts to title length)

---

#### SECTION 8: GEO-Specific Optimizations

**Verify by reading actual blog post content and HTML:**
- [ ] Key takeaway box contains a complete, standalone answer (not a teaser)
- [ ] `data-speakable` attributes are present in the rendered DOM
- [ ] `SpeakableSpecification` in JSON-LD correctly targets those attributes
- [ ] FAQ questions are phrased as users would ask AI models (natural language, not keyword-stuffed)
- [ ] Author has verifiable `sameAs` links in JSON-LD
- [ ] `worksFor` connects author to organization

---

### Output Format

After auditing every section, produce this report:

```
## SEO/GEO Audit Report — [ProjectName]
Date: [Today]
Auditor: Claude Opus

### Score: X/10

### Summary
[2-3 sentence overall assessment]

### CRITICAL Issues (Must Fix)
1. [Issue] — [File:Line] — [What's wrong] — [How to fix]

### IMPORTANT Issues (Should Fix)
1. [Issue] — [File:Line] — [What's wrong] — [How to fix]

### MINOR Issues (Nice to Fix)
1. [Issue] — [File:Line] — [What's wrong] — [How to fix]

### Section Scores
| Section | Score | Notes |
|---------|-------|-------|
| 0. Author Architecture | PASS/FAIL | ... |
| 1. Root Layout | PASS/FAIL | ... |
| 2. Per-Page Metadata | PASS/FAIL | ... |
| 3. Blog Post Template | PASS/FAIL | ... |
| 4. JSON-LD Library | PASS/FAIL | ... |
| 5. Robots.txt | PASS/FAIL | ... |
| 6. Sitemap | PASS/FAIL | ... |
| 7. OG Images | PASS/FAIL | ... |
| 8. GEO Optimizations | PASS/FAIL | ... |

### Items That Passed
[List of everything that was correctly implemented]
```

Then ask: "Would you like me to fix the issues I found?"
