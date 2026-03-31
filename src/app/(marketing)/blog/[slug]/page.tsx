import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryLabels } from "@/lib/blog/types";
import { AUTHORS } from "@/lib/blog/types";
import { blogPosts } from "@/lib/blog/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mentionlayer.com";

// Revalidate every 12 hours so scheduled posts go live without a deploy
export const revalidate = 43200;

function getPost(slug: string) {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return undefined;
  // Don't show future-dated posts
  if (new Date(post.publishedAt) > new Date()) return undefined;
  return post;
}

export function generateStaticParams() {
  const now = new Date();
  return blogPosts
    .filter((p) => new Date(p.publishedAt) <= now)
    .map((p) => ({ slug: p.slug }));
}

function getOgImageUrl(post: { title: string; category: string }) {
  const params = new URLSearchParams({
    title: post.title,
    category: post.category,
  });
  return `${BASE_URL}/api/og?${params.toString()}`;
}

function getWordCount(post: { sections: Array<{ content: string }>; keyTakeaway: string; summary: string }) {
  const allText = [
    post.summary,
    post.keyTakeaway,
    ...post.sections.map((s) => s.content),
  ].join(" ");
  return allText.split(/\s+/).length;
}

function resolveAuthor(postAuthor: { name: string; role: string }) {
  // Match post author to AUTHORS registry by name
  const entry = Object.values(AUTHORS).find(
    (a) => a.name === postAuthor.name,
  );
  return entry || {
    name: postAuthor.name,
    role: postAuthor.role,
    bio: "",
    url: "",
    image: undefined,
    sameAs: [],
  };
}

// ─── Metadata (title, OG, Twitter, canonical) ────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not Found" };

  const ogImage = getOgImageUrl(post);
  const postUrl = `${BASE_URL}/blog/${post.slug}`;

  return {
    // Use raw title — root layout template adds "| MentionLayer"
    title: post.metaTitle.replace(/\s*\|\s*MentionLayer\s*$/i, ""),
    description: post.metaDescription,
    keywords: [post.targetKeyword],
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      url: postUrl,
      siteName: "MentionLayer",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author.name],
      section: categoryLabels[post.category],
      tags: [post.targetKeyword, post.category],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [ogImage],
    },
  };
}

// ─── Page Component ──────────────────────────────────────

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const author = resolveAuthor(post.author);
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const ogImage = getOgImageUrl(post);
  const wordCount = getWordCount(post);

  const relatedPosts = post.relatedSlugs
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean);

  // ─── JSON-LD: BlogPosting (full spec) ────────────────

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: post.title,
    description: post.summary,
    image: ogImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    wordCount,
    articleSection: categoryLabels[post.category],
    keywords: post.targetKeyword,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: author.name,
      jobTitle: author.role,
      url: author.url
        ? author.url.startsWith("http")
          ? author.url
          : `${BASE_URL}${author.url}`
        : undefined,
      ...(author.image && { image: author.image }),
      sameAs: author.sameAs,
      worksFor: {
        "@type": "Organization",
        name: "MentionLayer",
        url: BASE_URL,
      },
      description: author.bio,
    },
    publisher: {
      "@type": "Organization",
      name: "MentionLayer",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    isPartOf: {
      "@type": "Blog",
      name: "MentionLayer Blog",
      url: `${BASE_URL}/blog`,
    },
    // Speakable: marks key takeaway + summary for AI voice/citation extraction
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='key-takeaway']",
        "[data-speakable='summary']",
      ],
    },
  };

  // ─── JSON-LD: BreadcrumbList ─────────────────────────

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${BASE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryLabels[post.category],
        item: `${BASE_URL}/blog?category=${post.category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  // ─── JSON-LD: FAQPage ───────────────────────────────

  const faqJsonLd =
    post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">
            {categoryLabels[post.category]}
          </span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded bg-[#6C5CE7]/10 px-2 py-0.5 font-medium text-[#6C5CE7]">
              {categoryLabels[post.category]}
            </span>
            <span>{post.estimatedReadTime} min read</span>
            <span>&middot;</span>
            <span>{wordCount.toLocaleString()} words</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-base text-muted-foreground" data-speakable="summary">
            {post.summary}
          </p>

          {/* Author + dates row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {author.image ? (
                <img
                  src={author.image}
                  alt={author.name}
                  className="h-8 w-8 rounded-full object-cover"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-xs font-bold text-[#6C5CE7]">
                  {author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              )}
              <Link
                href={author.url || "#"}
                rel="author"
                className="font-medium text-foreground hover:text-[#6C5CE7]"
              >
                {author.name}
              </Link>
            </div>
            <time dateTime={post.publishedAt} className="text-xs">
              Published{" "}
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <time dateTime={post.updatedAt} className="text-xs">
                Updated{" "}
                {new Date(post.updatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            )}
          </div>
        </header>

        {/* Key Takeaway (speakable for AI extraction) */}
        <div
          className="mb-8 rounded-lg border border-[#6C5CE7]/30 bg-[#6C5CE7]/5 p-4"
          data-speakable="key-takeaway"
        >
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6C5CE7]">
            Key Takeaway
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {post.keyTakeaway}
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-10 rounded-lg border border-border bg-card p-4" aria-label="Table of contents">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            In this article
          </h2>
          <ul className="space-y-1">
            {post.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-[#6C5CE7] hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
            {post.faqs.length > 0 && (
              <li>
                <a
                  href="#faq"
                  className="text-sm text-[#6C5CE7] hover:underline"
                >
                  Frequently Asked Questions
                </a>
              </li>
            )}
          </ul>
        </nav>

        {/* Sections */}
        {post.sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.content.split("\n\n").map((paragraph, i) => {
                if (paragraph.trim().startsWith("[Screenshot:")) {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground"
                    >
                      {paragraph.trim().replace("[", "").replace("]", "")}
                    </div>
                  );
                }

                if (paragraph.trim().startsWith("|")) {
                  const lines = paragraph.trim().split("\n");
                  const headers = lines[0]
                    .split("|")
                    .filter(Boolean)
                    .map((h) => h.trim());
                  const rows = lines.slice(2).map((row) =>
                    row
                      .split("|")
                      .filter(Boolean)
                      .map((cell) => cell.trim())
                  );

                  return (
                    <div key={i} className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            {headers.map((h, hi) => (
                              <th
                                key={hi}
                                className="px-3 py-2 text-left font-semibold text-foreground"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, ri) => (
                            <tr
                              key={ri}
                              className="border-b border-border/50"
                            >
                              {row.map((cell, ci) => (
                                <td
                                  key={ci}
                                  className="px-3 py-2 text-muted-foreground"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (
                  paragraph.trim().startsWith("- ") ||
                  paragraph.trim().startsWith("1. ")
                ) {
                  const items = paragraph.trim().split("\n");
                  const isOrdered = !!items[0].match(/^\d+\./);
                  const Tag = isOrdered ? "ol" : "ul";

                  return (
                    <Tag
                      key={i}
                      className={`space-y-1 pl-5 text-sm text-muted-foreground ${
                        isOrdered ? "list-decimal" : "list-disc"
                      }`}
                    >
                      {items.map((item, li) => (
                        <li key={li}>
                          <ContentRenderer
                            text={item.replace(/^[-\d.]+\s*/, "")}
                          />
                        </li>
                      ))}
                    </Tag>
                  );
                }

                return (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    <ContentRenderer text={paragraph} />
                  </p>
                );
              })}
            </div>
          </section>
        ))}

        {/* FAQ Section */}
        {post.faqs.length > 0 && (
          <section id="faq" className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {post.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-border bg-card"
                >
                  <summary className="cursor-pointer list-none p-4 text-sm font-semibold text-foreground">
                    {faq.question}
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Author Bio */}
        <aside className="mb-10 rounded-lg border border-border bg-card p-5" aria-label="About the author">
          <div className="flex items-start gap-4">
            {author.image ? (
              <img
                src={author.image}
                alt={author.name}
                className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                width={48}
                height={48}
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-lg font-bold text-[#6C5CE7]">
                {author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <div>
              <Link
                href={author.url || "#"}
                rel="author"
                className="text-sm font-semibold text-foreground hover:text-[#6C5CE7]"
              >
                {author.name}
              </Link>
              <p className="text-xs text-muted-foreground">{author.role}</p>
              {author.bio && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {author.bio}
                </p>
              )}
              {author.sameAs.length > 0 && (
                <div className="mt-2 flex gap-3">
                  {author.sameAs.map((url) => {
                    const label = url.includes("linkedin")
                      ? "LinkedIn"
                      : url.includes("joelhouse")
                        ? "Website"
                        : "Profile";
                    return (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#6C5CE7] hover:underline"
                      >
                        {label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* CTA */}
        <div className="mb-10 rounded-xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/5 p-6 text-center">
          <h2 className="text-lg font-bold text-foreground">
            Check Your AI Visibility Score
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Run a free 5-pillar audit and see where your brand stands across
            Citations, AI Presence, Entities, Reviews, and Press.
          </p>
          <Link
            href="/free-audit"
            className="mt-4 inline-block rounded-md bg-[#6C5CE7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Run Free Audit &rarr;
          </Link>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Related Articles
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) =>
                related ? (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-[#6C5CE7]/50"
                  >
                    <div className="text-xs text-muted-foreground">
                      {categoryLabels[related.category]}
                    </div>
                    <h3 className="mt-1 text-sm font-semibold text-foreground">
                      {related.title}
                    </h3>
                  </Link>
                ) : null
              )}
            </div>
          </section>
        )}

        {/* Back */}
        <div className="border-t border-border pt-6 text-center">
          <Link
            href="/blog"
            className="text-sm text-[#6C5CE7] hover:underline"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </article>
    </>
  );
}

function ContentRenderer({ text }: { text: string }) {
  const parts = text.split(
    /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g
  );

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return (
            <Link
              key={i}
              href={linkMatch[2]}
              className="text-[#6C5CE7] hover:underline"
            >
              {linkMatch[1]}
            </Link>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
