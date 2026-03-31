# Universal Blog Template SEO/GEO Audit & Implementation Prompt

Use this prompt on any project to bring its blog template to a 10/10 SEO and GEO (Generative Engine Optimization) standard. This is the exact specification used by MentionLayer and represents the gold standard for blog posts that rank in Google AND get cited by AI models (ChatGPT, Perplexity, Gemini, Claude).

---

## Instructions for Claude

Audit and upgrade the blog post template in this project to meet every item in the checklist below. Fix all issues. Do not skip any item. After implementation, verify every item passes by reading the rendered HTML output.

---

## 1. Page Metadata (Next.js `generateMetadata` / `<head>`)

### Title
- [ ] Title uses the template pattern from root layout (e.g., `%s | BrandName`) — never hardcode the brand suffix in individual pages or you'll get doubling like "Title | Brand | Brand"
- [ ] Page-level title is under 60 characters (excluding the template suffix)
- [ ] Title contains the primary keyword naturally

### Description
- [ ] Meta description is 140-160 characters
- [ ] Contains primary keyword
- [ ] Is a compelling, click-worthy summary (not a keyword list)

### Canonical URL
- [ ] Every blog post sets `alternates.canonical` to its full absolute URL (`https://domain.com/blog/slug`)
- [ ] This MUST be the post URL, never the homepage or blog index

### Open Graph (og:)
- [ ] `og:title` — full title including brand
- [ ] `og:description` — same as meta description
- [ ] `og:type` = "article"
- [ ] `og:url` — canonical URL of the post
- [ ] `og:site_name` — brand name
- [ ] `og:image` — 1200x630 OG image with `width`, `height`, `alt` properties
- [ ] `article:published_time` — ISO date
- [ ] `article:modified_time` — ISO date (CRITICAL: must be different from published if content was updated)
- [ ] `article:author` — author name
- [ ] `article:section` — category name
- [ ] `article:tag` — primary keyword / tags

### Twitter Card
- [ ] `twitter:card` = "summary_large_image"
- [ ] `twitter:title`, `twitter:description`, `twitter:image` all set

### Keywords
- [ ] `keywords` meta tag contains the primary target keyword

---

## 2. JSON-LD Structured Data

### BlogPosting (not Article)
Use `BlogPosting` — it's a more specific subtype of `Article` and gives search engines clearer signals.

Required properties:
- [ ] `@type`: "BlogPosting"
- [ ] `headline`: post title
- [ ] `description`: post summary
- [ ] `image`: OG image URL
- [ ] `datePublished`: ISO date
- [ ] `dateModified`: ISO date (different from published when updated)
- [ ] `wordCount`: calculated from actual content
- [ ] `articleSection`: category label
- [ ] `keywords`: primary keyword
- [ ] `inLanguage`: "en-US" (or relevant locale)
- [ ] `mainEntityOfPage`: WebPage with `@id` = post canonical URL
- [ ] `isPartOf`: Blog entity linking to `/blog`

### Author (Person)
- [ ] `@type`: "Person"
- [ ] `name`: full name
- [ ] `jobTitle`: role/title
- [ ] `url`: link to author's personal site or bio page
- [ ] `image`: author headshot URL
- [ ] `description`: 1-2 sentence bio
- [ ] `sameAs`: array of profile URLs (LinkedIn, personal site, company site)
- [ ] `worksFor`: Organization entity with name and URL

### Publisher (Organization)
- [ ] `@type`: "Organization"
- [ ] `name`: company name
- [ ] `url`: site URL
- [ ] `logo`: ImageObject with URL

### Speakable (GEO-critical)
- [ ] `speakable` property with `SpeakableSpecification`
- [ ] CSS selectors targeting the key takeaway box and summary paragraph
- [ ] These are the elements AI models are most likely to extract and cite
- [ ] Use `data-speakable` attributes on the target elements in HTML

### BreadcrumbList
- [ ] Separate JSON-LD block for BreadcrumbList
- [ ] Items: Home > Blog > Category > Post Title
- [ ] Each item has `position`, `name`, and `item` (URL)

### FAQPage
- [ ] If post has FAQs, add separate FAQPage JSON-LD block
- [ ] Each FAQ has `Question` with `name` and `AcceptedAnswer` with `text`

---

## 3. Visible On-Page SEO Elements

### Author Display
- [ ] Author name is visible and clickable (links to author bio/profile page)
- [ ] Link has `rel="author"` attribute
- [ ] Author avatar/image displayed (headshot or initials fallback)
- [ ] Author role/title displayed
- [ ] Author bio section at bottom of article with:
  - Name (linked)
  - Role
  - 1-2 sentence bio
  - Links to LinkedIn, personal site
- [ ] Author data comes from a centralized AUTHORS registry (not hardcoded per post)

### Dates
- [ ] Published date visible with `<time datetime="YYYY-MM-DD">` element
- [ ] "Updated" date visible when `updatedAt` differs from `publishedAt`
- [ ] Both use semantic `<time>` elements with ISO `datetime` attribute
- [ ] Format: "Published Month Day, Year" / "Updated Month Day, Year"

### Breadcrumb
- [ ] Visual breadcrumb navigation at top of article
- [ ] Uses `<nav aria-label="Breadcrumb">` for accessibility
- [ ] Path: Home > Blog > Category
- [ ] Each segment is a clickable link

### Content Structure
- [ ] Single `<h1>` — the post title
- [ ] `<h2>` for each major section
- [ ] `<h3>` for subsections within sections
- [ ] All headings have anchor IDs for deep linking
- [ ] Table of contents with links to each section (uses `<nav aria-label="Table of contents">`)

### Key Takeaway Box
- [ ] Above the fold, before table of contents
- [ ] Clearly labeled "Key Takeaway" or "TL;DR"
- [ ] Contains the most citable sentence of the article
- [ ] Has `data-speakable="key-takeaway"` attribute for AI extraction
- [ ] Summary paragraph also has `data-speakable="summary"`

### Word Count
- [ ] Word count displayed in article header (e.g., "1,847 words")
- [ ] Calculated from actual content, not estimated

### Semantic HTML
- [ ] Content wrapped in `<article>` element
- [ ] FAQ section uses `<details>` / `<summary>` for collapsible Q&A
- [ ] Author bio uses `<aside aria-label="About the author">`
- [ ] Lists use proper `<ul>` / `<ol>` elements
- [ ] Tables use proper `<table>` / `<thead>` / `<tbody>` elements

### Internal Linking
- [ ] Related articles section at bottom (3-5 related posts)
- [ ] CTA block between content and related articles
- [ ] "Back to Blog" link at footer
- [ ] In-content links to related blog posts and product pages where natural

---

## 4. GEO-Specific Optimizations

These are what separate a "good SEO blog" from a blog that actually gets cited by AI:

### Citability
- [ ] Key takeaway box contains a complete, standalone answer (AI can cite it without needing surrounding context)
- [ ] First paragraph of each section is a complete thought that can stand alone as a citation
- [ ] Statistics and data points include specific numbers (not vague claims)
- [ ] Claims reference a source or authority (e.g., "According to [Author], [Org]...")

### Structure for AI Extraction
- [ ] Content uses clear section headings that match common search queries
- [ ] FAQ section asks and answers questions in the exact phrasing users would type into an AI model
- [ ] Lists and tables are used for comparisons and multi-item answers
- [ ] Each section has a clear topic sentence that AI can extract

### Speakable Markup
- [ ] `SpeakableSpecification` in JSON-LD targets the 2-3 most citable elements
- [ ] These elements contain concise, factual, answer-ready content
- [ ] No marketing fluff in speakable sections — just facts and insights

### Entity Signals
- [ ] Author is a named Person with verifiable credentials (sameAs links)
- [ ] Organization is clearly identified with URL and logo
- [ ] Content references verifiable data and named entities
- [ ] `worksFor` on the Person connects author to organization

---

## 5. Robots & Indexing

- [ ] Blog posts have `index: true, follow: true` (default — don't set noindex)
- [ ] `googleBot` directives: `max-image-preview: "large"`, `max-snippet: -1`, `max-video-preview: -1`
- [ ] Blog posts are in the sitemap with `priority: 0.8` and `changeFrequency: "monthly"`
- [ ] Sitemap includes `lastModified` from `updatedAt` or `publishedAt`

---

## Reference: Complete JSON-LD Example

```json
[
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://domain.com/blog/post-slug"
    },
    "headline": "Your Post Title Here",
    "description": "A 140-160 character summary.",
    "image": "https://domain.com/api/og?title=Your+Post+Title",
    "datePublished": "2026-03-25",
    "dateModified": "2026-03-28",
    "wordCount": 1847,
    "articleSection": "Category Name",
    "keywords": "primary keyword",
    "inLanguage": "en-US",
    "author": {
      "@type": "Person",
      "name": "Author Name",
      "jobTitle": "Founder, Company",
      "url": "https://authorsite.com/about",
      "image": "https://domain.com/authors/author.jpg",
      "description": "Short bio of the author.",
      "sameAs": [
        "https://authorsite.com/about",
        "https://linkedin.com/in/author",
        "https://domain.com"
      ],
      "worksFor": {
        "@type": "Organization",
        "name": "Company Name",
        "url": "https://domain.com"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Company Name",
      "url": "https://domain.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://domain.com/logo.png"
      }
    },
    "isPartOf": {
      "@type": "Blog",
      "name": "Company Blog",
      "url": "https://domain.com/blog"
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        "[data-speakable='key-takeaway']",
        "[data-speakable='summary']"
      ]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://domain.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://domain.com/blog" },
      { "@type": "ListItem", "position": 3, "name": "Category", "item": "https://domain.com/blog?category=cat" },
      { "@type": "ListItem", "position": 4, "name": "Post Title", "item": "https://domain.com/blog/post-slug" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Question text here?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Answer text here."
        }
      }
    ]
  }
]
```

---

## Validation

After implementation, verify:
1. Run Google Rich Results Test on a blog post URL
2. Run Schema.org Validator on the JSON-LD
3. Check that `<title>` does not have the brand name doubled
4. Check that canonical URL points to the actual post (not `/` or `/blog`)
5. Check that both published and modified dates are visible when different
6. Check that the author name links to an external profile with `rel="author"`
7. Check that speakable elements have `data-speakable` attributes in the DOM
