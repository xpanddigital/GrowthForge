/**
 * JSON-LD structured data components for SEO.
 * Each component renders a <script type="application/ld+json"> tag.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mentionlayer.com";

// ─── Shared types ────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  url: string;
}

// ─── Organization (site-wide, in root layout) ────────────

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MentionLayer",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "AI visibility platform that seeds forum citations, launches press releases, boosts reviews, and tracks your brand across ChatGPT, Perplexity, Gemini, and Claude.",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "Joel House",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "joel@xpanddigital.io",
      contactType: "sales",
    },
    sameAs: [
      "https://www.linkedin.com/company/mentionlayer",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── WebSite (site-wide, enables sitelinks search box) ───

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MentionLayer",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/help?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── WebPage (generic page) ──────────────────────────────

export function WebPageJsonLd({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${BASE_URL}${url}`,
    isPartOf: { "@type": "WebSite", url: BASE_URL },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── SoftwareApplication (homepage / features) ───────────

export function SoftwareApplicationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MentionLayer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: BASE_URL,
    description:
      "AI visibility platform that seeds forum citations on Reddit and Quora, launches press releases, boosts reviews, and tracks your brand across ChatGPT, Perplexity, Gemini, and Claude in real-time.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "97",
      highPrice: "997",
      offerCount: 4,
    },
    featureList: [
      "Citation Engine — seed Reddit & Quora threads",
      "AI Monitor — track share of model across ChatGPT, Perplexity, Gemini, Claude",
      "AI Visibility Audit — 5-pillar scoring",
      "PressForge — AI-powered press releases",
      "Entity Sync — directory consistency",
      "Review Engine — UGC campaigns",
      "Technical GEO — structured data optimization",
      "YouTube GEO — video AI visibility",
      "ROI Reporting — prove AI visibility gains",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── FAQPage ─────────────────────────────────────────────

export function FAQPageJsonLd({
  questions,
}: {
  questions: Array<{ question: string; answer: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── BreadcrumbList ──────────────────────────────────────

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Blog / Article ──────────────────────────────────────

export function ArticleJsonLd({
  title,
  description,
  url,
  publishedAt,
  updatedAt,
  authorName,
  image,
}: {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  image?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${BASE_URL}${url}`,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "MentionLayer",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    ...(image && { image }),
    isPartOf: { "@type": "WebSite", url: BASE_URL },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Course (Academy) ────────────────────────────────────

export function CourseJsonLd({
  name,
  description,
  url,
  provider,
}: {
  name: string;
  description: string;
  url: string;
  provider?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: `${BASE_URL}${url}`,
    provider: {
      "@type": "Organization",
      name: provider || "MentionLayer",
      url: BASE_URL,
    },
    isAccessibleForFree: true,
    educationalLevel: "Beginner to Advanced",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Service (Done-for-You page) ─────────────────────────

export function ServiceJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${BASE_URL}${url}`,
    provider: {
      "@type": "Organization",
      name: "MentionLayer",
      url: BASE_URL,
    },
    areaServed: "Worldwide",
    serviceType: "AI Visibility & GEO Services",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Pricing / Offer Catalog ─────────────────────────────

export function PricingJsonLd({
  plans,
}: {
  plans: Array<{
    name: string;
    description: string;
    price: number;
    priceCurrency?: string;
  }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "MentionLayer",
    description:
      "AI visibility platform for agencies and brands.",
    url: `${BASE_URL}/pricing`,
    brand: { "@type": "Brand", name: "MentionLayer" },
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      priceCurrency: plan.priceCurrency || "USD",
      priceValidUntil: new Date(
        new Date().getFullYear() + 1,
        0,
        1,
      ).toISOString().split("T")[0],
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/pricing`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
