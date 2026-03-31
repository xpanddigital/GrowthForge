# Master Technical SEO & GEO Specification for Next.js Projects

**Owner:** Joel House | **Standard:** 10/10 SEO + GEO
**Use this file with any Next.js project to bring its technical SEO, blog template, and author architecture to the same gold standard.**

Give this entire file to Claude as context, then tell it:
> "Audit this project against every section in this spec. Fix everything that doesn't pass. Verify every item after implementation."

---

## How This Spec Is Organized

| Section | What It Covers |
|---------|---------------|
| 0 | Author Hub-and-Spoke Architecture |
| 1 | Root Layout Technical SEO (metadata, viewport, JSON-LD) |
| 2 | Per-Page Metadata Patterns |
| 3 | Blog Post Template (10/10 SEO + GEO) |
| 4 | JSON-LD Structured Data Library |
| 5 | Robots.txt Strategy |
| 6 | Sitemap Configuration |
| 7 | OG Image Generation |
| 8 | GEO-Specific Optimizations |
| 9 | Validation Checklist |

---

## 0. Author Hub-and-Spoke Architecture

Before touching templates, set up the author infrastructure. This is the foundation that makes every other SEO/GEO signal work.

### The Pattern

Every project Joel owns must follow this hub-and-spoke model:

```
joelhouse.com/about                          <-- CENTRAL HUB (Person schema, sameAs to all spokes)
  |-- mentionlayer.com/author/joel-house     <-- Spoke (ProfilePage schema, sameAs back to hub)
  |-- project2.com/author/joel-house         <-- Spoke
  |-- project3.com/author/joel-house         <-- Spoke
  |-- linkedin.com/in/joelhouse              <-- Social spoke
  +-- wikipedia (if eligible)                <-- Ultimate entity validation
```

### Why Both Hub AND Local Author Pages

- **E-E-A-T is evaluated per-domain.** Google needs to see author credibility on the same domain as the content.
- **AI models cite the domain, not the author's personal site.** When Perplexity cites `yoursite.com/blog/post`, the author authority needs to exist on `yoursite.com`.
- **Entity consolidation via sameAs.** Every spoke links back to the hub. This tells Google's Knowledge Graph all the "Joel House" mentions across different domains are the same person.
- **Authors with cross-platform presence are 2.8x more likely to be cited by AI** vs anonymous content.

### AUTHORS Registry (Centralized Config)

Every project must have a centralized authors config at `src/lib/blog/types.ts` (or equivalent):

```typescript
export interface BlogAuthor {
  slug: string;
  name: string;
  role: string;
  bio: string;                // 1-2 sentence bio (used in blog post bylines)
  extendedBio: string;        // 200-500 word third-person bio (used on /author/ page)
  url: string;                // LOCAL author page: "/author/joel-house"
  hub: string;                // EXTERNAL hub: "https://joelhouse.com/about"
  image?: string;             // LOCAL headshot: "/authors/joel-house.jpg"
  knowsAbout: string[];       // Expertise areas for schema.org knowsAbout
  sameAs: string[];           // Hub + LinkedIn + all other spoke sites
}

export const AUTHORS: Record<string, BlogAuthor> = {
  "joel-house": {
    slug: "joel-house",
    name: "Joel House",
    role: "Founder, [CompanyName]",
    bio: "AI marketing expert, author of AI for Revenue, and founder of [CompanyName]. Joel House helps brands and agencies get recommended by AI through Generative Engine Optimization.",
    extendedBio: `Joel House is an AI marketing strategist, entrepreneur...
    [200-500 words, third person, covering: background, expertise,
    why he built this product, credentials, location, speaking/writing]`,
    url: "/author/joel-house",
    hub: "https://joelhouse.com/about",
    image: "/authors/joel-house.jpg",
    knowsAbout: [
      "Generative Engine Optimization",
      "AI Visibility",
      "SEO",
      "Digital Marketing",
      // Add project-specific expertise areas
    ],
    sameAs: [
      "https://joelhouse.com/about",
      "https://www.linkedin.com/in/joelhouse",
      // Add all other spoke site author URLs here
    ],
  },
};

export function getAuthorBySlug(slug: string): BlogAuthor | undefined {
  return AUTHORS[slug];
}
```

### Per-Project Author Page Requirements

Create `/author/[slug]` on every project with:

- [ ] `generateStaticParams()` from AUTHORS keys
- [ ] `generateMetadata()` with OG type="profile", canonical, description
- [ ] `ProfilePage` + `Person` JSON-LD schema with:
  - `sameAs` pointing to: hub, LinkedIn, all other spoke sites
  - `worksFor` linking to the Organization of this specific site
  - `knowsAbout` listing relevant expertise areas
- [ ] 200-500 word bio (third person) from `extendedBio`
- [ ] Author headshot (consistent across all sites)
- [ ] Current role at this specific company
- [ ] Social links (LinkedIn, personal site/hub, book)
- [ ] Auto-generated list of articles written on this site (filtered + sorted by date)
- [ ] CTA block
- [ ] Breadcrumb: Home > Blog > Author Name

### Blog Post Author Linking Rules

- Blog posts link author name to the **local** `/author/joel-house` page (same domain) using `<Link>` with `rel="author"`
- They do NOT link directly to the external hub
- The local author page links out to the hub and social profiles
- JSON-LD `author.url` points to the local author page (resolved to absolute URL)
- JSON-LD `author.sameAs` array includes hub + LinkedIn + other spokes

---

## 1. Root Layout Technical SEO

The root `layout.tsx` sets the foundation for every page. Get this right and half the battle is won.

### Viewport (Next.js 15+ pattern)

```typescript
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,          // Allow pinch zoom for accessibility
  themeColor: "#6C5CE7",    // Replace with your brand color
};
```

### Root Metadata

```typescript
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "[BrandName] -- [Tagline]",
    template: "%s | [BrandName]",       // <-- all child pages inherit this
  },
  description: "[140-160 char site-wide description]",
  keywords: [
    // 8-12 primary keywords
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "[BrandName] -- [Tagline]",
    description: "[OG description]",
    type: "website",
    url: BASE_URL,
    siteName: "[BrandName]",
    images: [
      {
        url: `${BASE_URL}/api/og?title=${encodeURIComponent("[Brand Tagline]")}`,
        width: 1200,
        height: 630,
        alt: "[BrandName]",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "[BrandName] -- [Tagline]",
    description: "[Twitter description]",
    images: [`${BASE_URL}/api/og?title=${encodeURIComponent("[Brand Tagline]")}`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

### Root Layout Body

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
```

### Critical Rules

- [ ] `metadataBase` is set so all relative OG image URLs resolve correctly
- [ ] Title uses `template: "%s | Brand"` -- child pages supply only the page title, NEVER include the brand suffix themselves or it doubles
- [ ] `alternates.canonical` is set at root level (homepage), then overridden per-page
- [ ] `robots.googleBot` includes `max-image-preview: "large"` and `max-snippet: -1` (lets Google and AI show full content)
- [ ] OrganizationJsonLd + WebSiteJsonLd are in `<head>` (site-wide, rendered once)

---

## 2. Per-Page Metadata Patterns

### Marketing Pages (Features, Pricing, Services, etc.)

Every marketing page should export:

```typescript
export const metadata: Metadata = {
  title: "[Page Title Under 60 Chars]",      // Root template adds "| Brand"
  description: "[140-160 chars, contains primary keyword, compelling]",
  openGraph: {
    title: "[Full Title] | [BrandName]",      // OG gets full title (no template)
    description: "[Same as meta description]",
    images: ["/api/og?title=[Page+Title]"],
  },
};

export default function Page() {
  return (
    <>
      <WebPageJsonLd title="..." description="..." url="/page-path" />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "/" },
        { name: "Page Name", url: "/page-path" },
      ]} />
      {/* Page content */}
    </>
  );
}
```

### Page-Specific JSON-LD Types

| Page Type | JSON-LD Schema |
|-----------|---------------|
| Homepage | `SoftwareApplication` + `BreadcrumbList` |
| Features | `WebPage` + `BreadcrumbList` |
| Pricing | `Product` with `Offer` array + `BreadcrumbList` |
| Services | `Service` + `BreadcrumbList` |
| Academy/Courses | `Course` + `BreadcrumbList` |
| Blog Index | `Blog` + `BreadcrumbList` |
| Blog Post | `BlogPosting` + `BreadcrumbList` + `FAQPage` (if FAQs exist) |
| Author | `ProfilePage` with `Person` mainEntity |
| Help/Docs | `WebPage` + `BreadcrumbList` |

### Title & Description Rules

- [ ] Page title under 60 characters (excluding template suffix)
- [ ] Meta description 140-160 characters
- [ ] Both contain the primary keyword naturally
- [ ] Description is compelling and click-worthy, not a keyword list
- [ ] OG title includes brand name (template doesn't apply to OG)
- [ ] NEVER hardcode the brand suffix in page titles -- let the root template add it

---

## 3. Blog Post Template (10/10 SEO + GEO)

This is the most comprehensive section. Every blog post must pass every item below.

### Blog Post Data Model

```typescript
export interface BlogPost {
  slug: string;
  title: string;
  summary: string;                    // 1-2 sentences, used as data-speakable="summary"
  metaTitle: string;                  // Under 60 chars + brand suffix
  metaDescription: string;            // 140-160 chars
  targetKeyword: string;
  publishedAt: string;                // ISO date: "2026-03-25"
  updatedAt?: string;                 // ISO date, must differ from publishedAt if content updated
  author: { name: string; role: string };
  category: string;
  estimatedReadTime: number;
  relatedSlugs: string[];
  faqs: Array<{ question: string; answer: string }>;
  sections: Array<{ id: string; title: string; content: string }>;
  keyTakeaway: string;                // TL;DR box content -- THE most citable sentence
}
```

### generateMetadata() for Blog Posts

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not Found" };

  const ogImage = getOgImageUrl(post);
  const postUrl = `${BASE_URL}/blog/${post.slug}`;

  return {
    // Strip brand suffix if present in metaTitle (root template adds it)
    title: post.metaTitle.replace(/\s*\|\s*\[BrandName\]\s*$/i, ""),
    description: post.metaDescription,
    keywords: [post.targetKeyword],
    alternates: {
      canonical: postUrl,                    // CRITICAL: must be post URL, not homepage
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      url: postUrl,
      siteName: "[BrandName]",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author.name],
      section: categoryLabels[post.category],
      tags: [post.targetKeyword, post.category],
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: post.title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [ogImage],
    },
  };
}
```

### BlogPosting JSON-LD (Full Spec)

```typescript
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",              // NOT "Article" -- BlogPosting is more specific
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": postUrl,
  },
  headline: post.title,
  description: post.summary,
  image: ogImage,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt || post.publishedAt,
  wordCount: calculatedWordCount,       // Calculated from actual content, not estimated
  articleSection: categoryLabels[post.category],
  keywords: post.targetKeyword,
  inLanguage: "en-US",
  author: {
    "@type": "Person",
    name: author.name,
    jobTitle: author.role,
    url: `${BASE_URL}${author.url}`,   // Absolute URL to LOCAL author page
    image: author.image ? `${BASE_URL}${author.image}` : undefined,
    description: author.bio,
    sameAs: author.sameAs,             // Hub + LinkedIn + other spokes
    worksFor: {
      "@type": "Organization",
      name: "[CompanyName]",
      url: BASE_URL,
    },
  },
  publisher: {
    "@type": "Organization",
    name: "[CompanyName]",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/logo.png`,
    },
  },
  isPartOf: {
    "@type": "Blog",
    name: "[CompanyName] Blog",
    url: `${BASE_URL}/blog`,
  },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [
      "[data-speakable='key-takeaway']",
      "[data-speakable='summary']",
    ],
  },
};
```

### BreadcrumbList JSON-LD

```typescript
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
    { "@type": "ListItem", position: 3, name: categoryLabel, item: `${BASE_URL}/blog?category=${post.category}` },
    { "@type": "ListItem", position: 4, name: post.title, item: postUrl },
  ],
};
```

### FAQPage JSON-LD (Conditional)

```typescript
const faqJsonLd = post.faqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    }
  : null;
```

### Visible On-Page Elements Checklist

#### Author Display
- [ ] Author name visible and clickable -- links to **local** `/author/[slug]` (same domain) with `rel="author"`
- [ ] Author avatar/image displayed (headshot or initials fallback)
- [ ] Author role/title displayed
- [ ] Author data comes from centralized AUTHORS registry

#### Author Bio (Bottom of Article)
- [ ] `<aside aria-label="About the author">` containing:
  - Name (linked to local author page with `rel="author"`)
  - Role
  - 1-2 sentence bio
  - Links to LinkedIn, personal site (hub), other profiles
- [ ] Links render from `author.sameAs` with appropriate labels

#### Dates
- [ ] Published date visible with `<time datetime="YYYY-MM-DD">` element
- [ ] "Updated" date visible when `updatedAt` differs from `publishedAt`
- [ ] Format: "Published Month Day, Year" / "Updated Month Day, Year"

#### Breadcrumb
- [ ] `<nav aria-label="Breadcrumb">` at top of article
- [ ] Path: Home > Blog > Category (each segment is a clickable link)

#### Content Structure
- [ ] Single `<h1>` -- the post title
- [ ] `<h2>` for each major section
- [ ] `<h3>` for subsections within sections
- [ ] All headings have anchor IDs for deep linking
- [ ] Table of contents with `<nav aria-label="Table of contents">`

#### Key Takeaway Box
- [ ] Above the fold, before table of contents
- [ ] Labeled "Key Takeaway" or "TL;DR"
- [ ] Contains the most citable sentence of the article
- [ ] Has `data-speakable="key-takeaway"` attribute
- [ ] Summary paragraph also has `data-speakable="summary"`

#### Word Count
- [ ] Word count displayed in article header (e.g., "1,847 words")
- [ ] Calculated from actual content, not estimated

#### Semantic HTML
- [ ] Content wrapped in `<article>` element
- [ ] FAQ section uses `<details>` / `<summary>` for collapsible Q&A
- [ ] Lists use proper `<ul>` / `<ol>` elements
- [ ] Tables use proper `<table>` / `<thead>` / `<tbody>` elements

#### Internal Linking
- [ ] Related articles section at bottom (3-5 related posts)
- [ ] CTA block between content and related articles
- [ ] "Back to Blog" link at footer

---

## 4. JSON-LD Structured Data Library

Create `src/components/seo/json-ld.tsx` with reusable components. Every component renders a `<script type="application/ld+json">` tag.

### Components to Build

| Component | Where Used | Schema Type |
|-----------|-----------|-------------|
| `OrganizationJsonLd` | Root layout `<head>` | Organization |
| `WebSiteJsonLd` | Root layout `<head>` | WebSite with SearchAction |
| `WebPageJsonLd` | Generic marketing pages | WebPage |
| `SoftwareApplicationJsonLd` | Homepage / Features | SoftwareApplication |
| `FAQPageJsonLd` | Pages with FAQs | FAQPage |
| `BreadcrumbJsonLd` | Every page | BreadcrumbList |
| `ArticleJsonLd` | Blog posts (or inline) | Article / BlogPosting |
| `CourseJsonLd` | Academy / learning pages | Course |
| `ServiceJsonLd` | Services page | Service |
| `ProfilePageJsonLd` | Author pages | ProfilePage + Person |
| `PricingJsonLd` | Pricing page | Product + Offer |

### ProfilePage JSON-LD (Author Pages)

```typescript
export function ProfilePageJsonLd({
  slug, name, jobTitle, bio, image, hub, knowsAbout, sameAs,
  worksForName, worksForUrl,
}: ProfilePageProps) {
  const authorUrl = `${BASE_URL}/author/${slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": authorUrl,
    url: authorUrl,
    name: `${name} -- Author at [CompanyName]`,
    mainEntity: {
      "@type": "Person",
      "@id": hub,                        // Hub URL as canonical Person ID
      name,
      jobTitle,
      description: bio,
      url: authorUrl,                    // Local author page URL
      image: image ? {
        "@type": "ImageObject",
        url: image.startsWith("http") ? image : `${BASE_URL}${image}`,
      } : undefined,
      sameAs,                            // Hub + LinkedIn + all spokes
      knowsAbout,
      worksFor: {
        "@type": "Organization",
        name: worksForName,
        url: worksForUrl,
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Authors", item: `${BASE_URL}/author` },
        { "@type": "ListItem", position: 3, name, item: authorUrl },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

---

## 5. Robots.txt Strategy

Create `src/app/robots.ts`:

```typescript
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow public pages, block private areas
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/signup",
          "/reset-password",
          "/callback",
        ],
      },
      // ALLOW AI retrieval bots (these cite your content to users)
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      {
        userAgent: "Claude-SearchBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      // BLOCK AI training bots (don't let them scrape for model training)
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ClaudeBot",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "Google-Extended",
        disallow: ["/"],
      },
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

### The Key Distinction

**Retrieval bots** (ChatGPT-User, PerplexityBot, Claude-SearchBot) fetch pages in real-time to answer user queries -- **you WANT these to access your content** so they can cite you.

**Training bots** (GPTBot, ClaudeBot, CCBot, Google-Extended, Bytespider) scrape content for model training -- **block these** unless you want your content in training data.

---

## 6. Sitemap Configuration

Create `src/app/sitemap.ts`:

```typescript
import type { MetadataRoute } from "next";
import { AUTHORS } from "@/lib/blog/types";
import { blogPosts } from "@/lib/blog/posts";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    // Add all public pages here
  ];

  // Author pages
  const authorPages: MetadataRoute.Sitemap = Object.values(AUTHORS).map((author) => ({
    url: `${BASE_URL}/author/${author.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Published blog posts
  const today = new Date();
  const publishedPosts: MetadataRoute.Sitemap = blogPosts
    .filter((post) => new Date(post.publishedAt) <= today)
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...authorPages, ...publishedPosts];
}
```

### Priority Guidelines

| Content Type | Priority | Change Frequency |
|-------------|---------|-----------------|
| Homepage | 1.0 | weekly |
| Blog Index | 0.9 | daily |
| Core Marketing Pages | 0.9 | monthly |
| Blog Posts | 0.8 | monthly |
| Services / Use Cases | 0.8 | monthly |
| Author Pages | 0.7 | monthly |
| Help / Docs | 0.6 | monthly |

---

## 7. OG Image Generation

Create `src/app/api/og/route.tsx` using Next.js Edge OG image generation:

```typescript
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "[BrandName] Blog";
  const category = searchParams.get("category") || "default";

  return new ImageResponse(
    (
      <div style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#09090b",
        padding: "60px",
        fontFamily: "system-ui, sans-serif",
      }}>
        {/* Category badge at top */}
        <div style={{ display: "flex" }}>
          <div style={{
            backgroundColor: "#6C5CE720",
            color: "#6C5CE7",
            fontSize: "20px",
            fontWeight: 600,
            padding: "6px 16px",
            borderRadius: "8px",
          }}>
            {category}
          </div>
        </div>

        {/* Title in the center */}
        <div style={{
          fontSize: title.length > 60 ? "42px" : "52px",
          fontWeight: 700,
          color: "#fafafa",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}>
          {title}
        </div>

        {/* Author + brand at bottom */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              backgroundColor: "#6C5CE7", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", fontWeight: 700,
            }}>JH</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#fafafa" }}>Joel House</div>
              <div style={{ fontSize: "16px", color: "#a1a1aa" }}>Founder, [BrandName]</div>
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 600, color: "#a1a1aa" }}>
            yourdomain.com
          </div>
        </div>

        {/* Accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "4px",
          background: "linear-gradient(to right, #6C5CE7, #00D2D3)",
        }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

### Usage in Blog Posts

```typescript
function getOgImageUrl(post: { title: string; category: string }) {
  const params = new URLSearchParams({
    title: post.title,
    category: post.category,
  });
  return `${BASE_URL}/api/og?${params.toString()}`;
}
```

---

## 8. GEO-Specific Optimizations

These are what separate a "good SEO blog" from a blog that actually gets cited by AI models.

### Citability
- [ ] Key takeaway box contains a complete, standalone answer (AI can cite it without surrounding context)
- [ ] First paragraph of each section is a complete thought that can stand alone as a citation
- [ ] Statistics include specific numbers (not vague claims)
- [ ] Claims reference a source or authority ("According to [Author], [Org]...")

### Structure for AI Extraction
- [ ] Section headings match common search queries
- [ ] FAQ questions use exact phrasing users type into AI models
- [ ] Lists and tables for comparisons and multi-item answers
- [ ] Each section has a clear topic sentence AI can extract

### Speakable Markup
- [ ] `SpeakableSpecification` in JSON-LD targets the 2-3 most citable elements
- [ ] Target elements contain concise, factual, answer-ready content
- [ ] No marketing fluff in speakable sections -- just facts and insights
- [ ] HTML elements have `data-speakable` attributes

### Entity Signals
- [ ] Author is a named Person with verifiable credentials (sameAs links)
- [ ] Organization clearly identified with URL and logo
- [ ] Content references verifiable data and named entities
- [ ] `worksFor` connects author to organization

---

## 9. Validation Checklist

After implementation, verify every item:

### Technical
- [ ] `npx tsc --noEmit` passes clean
- [ ] All pages render without errors
- [ ] Title does NOT have the brand name doubled on any page
- [ ] Canonical URLs point to actual pages (not `/` or `/blog`)

### Schema
- [ ] Run Schema.org Validator on JSON-LD from a blog post
- [ ] BlogPosting schema validates with all required properties
- [ ] BreadcrumbList renders correct hierarchy
- [ ] FAQPage schema validates (if FAQs present)
- [ ] ProfilePage schema validates on author page

### Author Architecture
- [ ] `/author/joel-house` page exists and renders
- [ ] Author page has `ProfilePage` + `Person` JSON-LD
- [ ] Blog post author name links to LOCAL `/author/joel-house` (not external hub)
- [ ] Blog post author link has `rel="author"`
- [ ] JSON-LD `author.url` resolves to absolute `https://domain.com/author/joel-house`
- [ ] JSON-LD `author.sameAs` includes hub + LinkedIn + other spokes
- [ ] Author page lists all articles written on this site
- [ ] Hub-spoke chain: blog post --> local author page --> hub + social profiles

### Dates
- [ ] Published date visible with `<time datetime>` element
- [ ] Updated date visible when different from published
- [ ] `dateModified` in JSON-LD differs from `datePublished` when content was updated

### GEO
- [ ] `data-speakable="key-takeaway"` attribute present in DOM
- [ ] `data-speakable="summary"` attribute present in DOM
- [ ] `SpeakableSpecification` in JSON-LD targets these selectors
- [ ] Key takeaway contains a complete, standalone, citable answer

### Robots & Sitemap
- [ ] Blog posts indexed (`robots: index, follow`)
- [ ] `googleBot.max-image-preview: "large"` set
- [ ] AI retrieval bots (ChatGPT-User, PerplexityBot) are ALLOWED
- [ ] AI training bots (GPTBot, ClaudeBot, CCBot) are BLOCKED
- [ ] Sitemap includes all published blog posts with correct `lastModified`
- [ ] Sitemap includes author pages
- [ ] Sitemap includes all marketing pages

### OG Images
- [ ] Every blog post generates a 1200x630 OG image
- [ ] OG image has `width`, `height`, `alt` properties set
- [ ] Marketing pages have OG images

---

## Quick-Start Implementation Order

When applying this spec to a new project, follow this order:

1. **Root layout** -- viewport, metadata, metadataBase, title template
2. **JSON-LD library** -- create `src/components/seo/json-ld.tsx` with all components
3. **Root JSON-LD** -- add OrganizationJsonLd + WebSiteJsonLd to root layout
4. **Robots.ts** -- create with retrieval-allow / training-block strategy
5. **Sitemap.ts** -- create with all page types
6. **OG image API** -- create `/api/og/route.tsx`
7. **AUTHORS registry** -- create in `src/lib/blog/types.ts`
8. **Author page** -- create `/author/[slug]/page.tsx`
9. **Blog post template** -- full BlogPosting JSON-LD, metadata, speakable, semantic HTML
10. **Per-page metadata** -- add to every marketing page
11. **Validate** -- run through the entire Section 9 checklist

---

*This specification represents the gold standard for technical SEO and GEO across all projects. Every item has been tested and validated on production sites. When in doubt, refer to the code examples -- they are exact implementations, not pseudocode.*
