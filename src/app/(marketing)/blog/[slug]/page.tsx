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

export const revalidate = 43200;

function getPost(slug: string) {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return undefined;
  if (new Date(post.publishedAt) > new Date()) return undefined;
  return post;
}

export function generateStaticParams() {
  const now = new Date();
  return blogPosts
    .filter((p) => new Date(p.publishedAt) <= now)
    .map((p) => ({ slug: p.slug }));
}

function getOgImageUrl(post: { slug: string }) {
  return `${BASE_URL}/images/blog/${post.slug}.png`;
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not Found" };

  const ogImage = getOgImageUrl(post);
  const postUrl = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: post.metaTitle.replace(/\s*\|\s*MentionLayer\s*$/i, ""),
    description: post.metaDescription,
    keywords: [post.targetKeyword],
    alternates: { canonical: postUrl },
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [ogImage],
    },
  };
}

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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
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
        ? author.url.startsWith("http") ? author.url : `${BASE_URL}${author.url}`
        : undefined,
      ...(author.image && { image: author.image }),
      sameAs: author.sameAs,
      worksFor: { "@type": "Organization", name: "MentionLayer", url: BASE_URL },
      description: author.bio,
    },
    publisher: {
      "@type": "Organization",
      name: "MentionLayer",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    isPartOf: { "@type": "Blog", name: "MentionLayer Blog", url: `${BASE_URL}/blog` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='key-takeaway']", "[data-speakable='summary']"],
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: categoryLabels[post.category], item: `${BASE_URL}/blog?category=${post.category}` },
      { "@type": "ListItem", position: 4, name: post.title, item: postUrl },
    ],
  };

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <article className="mx-auto max-w-3xl px-6 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
          <Link href="/" className="hover:text-[var(--ink)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-[var(--ink)]">Blog</Link>
          <span className="mx-2">/</span>
          <span style={{ color: "var(--ink)" }}>{categoryLabels[post.category]}</span>
        </nav>

        {/* Featured Image */}
        <div className="mb-8 overflow-hidden rounded-2xl" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/blog/${post.slug}.png`}
            alt={post.title}
            width={1200}
            height={630}
            className="w-full"
          />
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
            <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
              {categoryLabels[post.category]}
            </span>
            <span>{post.estimatedReadTime} min read</span>
            <span>&middot;</span>
            <span>{wordCount.toLocaleString()} words</span>
          </div>
          <h1 className="mt-4 text-[28px] sm:text-[36px] lg:text-[42px] leading-[1.1] tracking-tight" style={{ color: "var(--ink)" }}>
            {post.title}
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed" data-speakable="summary" style={{ color: "var(--ink-secondary)" }}>
            {post.summary}
          </p>

          {/* Author + dates */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
            <div className="flex items-center gap-2.5">
              {author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.image}
                  alt={author.name}
                  className="h-9 w-9 rounded-full object-cover"
                  width={36}
                  height={36}
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                  {author.name.split(" ").map((n) => n[0]).join("")}
                </span>
              )}
              <Link href={author.url || "#"} rel="author" className="font-medium hover:text-[var(--accent)]" style={{ color: "var(--ink)" }}>
                {author.name}
              </Link>
            </div>
            <time dateTime={post.publishedAt}>
              Published{" "}
              {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </time>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <time dateTime={post.updatedAt}>
                Updated{" "}
                {new Date(post.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </time>
            )}
          </div>
        </header>

        {/* Key Takeaway */}
        <div
          className="mb-8 rounded-2xl p-5"
          data-speakable="key-takeaway"
          style={{
            background: "var(--accent-subtle)",
            border: "1px solid rgba(61,43,224,0.12)",
          }}
        >
          <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            Key Takeaway
          </div>
          <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink)" }}>
            {post.keyTakeaway}
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-10 rounded-2xl p-5" aria-label="Table of contents" style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--ink-tertiary)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
            In this article
          </h2>
          <ul className="space-y-1">
            {post.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-[14px] hover:underline" style={{ color: "var(--accent)" }}>
                  {section.title}
                </a>
              </li>
            ))}
            {post.faqs.length > 0 && (
              <li>
                <a href="#faq" className="text-[14px] hover:underline" style={{ color: "var(--accent)" }}>
                  Frequently Asked Questions
                </a>
              </li>
            )}
          </ul>
        </nav>

        {/* Sections */}
        {post.sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-10">
            <h2 className="mb-4 text-[22px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.content.split("\n\n").map((paragraph, i) => {
                if (paragraph.trim().startsWith("[Screenshot:")) {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-center rounded-xl px-4 py-8 text-[13px]"
                      style={{ border: "1px dashed rgba(26,26,46,0.12)", color: "var(--ink-tertiary)" }}
                    >
                      {paragraph.trim().replace("[", "").replace("]", "")}
                    </div>
                  );
                }

                if (paragraph.trim().startsWith("|")) {
                  const lines = paragraph.trim().split("\n");
                  const headers = lines[0].split("|").filter(Boolean).map((h) => h.trim());
                  const rows = lines.slice(2).map((row) =>
                    row.split("|").filter(Boolean).map((cell) => cell.trim())
                  );
                  return (
                    <div key={i} className="overflow-x-auto">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
                            {headers.map((h, hi) => (
                              <th key={hi} className="px-3 py-2 text-left font-semibold" style={{ color: "var(--ink)" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, ri) => (
                            <tr key={ri} style={{ borderBottom: "1px solid rgba(26,26,46,0.04)" }}>
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-2" style={{ color: "var(--ink-secondary)" }}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (paragraph.trim().startsWith("- ") || paragraph.trim().startsWith("1. ")) {
                  const items = paragraph.trim().split("\n");
                  const isOrdered = !!items[0].match(/^\d+\./);
                  const Tag = isOrdered ? "ol" : "ul";
                  return (
                    <Tag
                      key={i}
                      className={`space-y-1 pl-5 text-[14px] ${isOrdered ? "list-decimal" : "list-disc"}`}
                      style={{ color: "var(--ink-secondary)" }}
                    >
                      {items.map((item, li) => (
                        <li key={li}>
                          <ContentRenderer text={item.replace(/^[-\d.]+\s*/, "")} />
                        </li>
                      ))}
                    </Tag>
                  );
                }

                return (
                  <p key={i} className="text-[14px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
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
            <h2 className="mb-4 text-[22px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {post.faqs.map((faq, i) => (
                <details key={i} className="group rounded-2xl" style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <summary className="cursor-pointer list-none p-4 text-[14px] font-semibold" style={{ color: "var(--ink)" }}>
                    {faq.question}
                  </summary>
                  <p className="px-4 pb-4 text-[14px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Author Bio */}
        <aside className="mb-10 rounded-2xl p-5" aria-label="About the author" style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-start gap-4">
            {author.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.image}
                alt={author.name}
                className="h-14 w-14 flex-shrink-0 rounded-full object-cover"
                width={56}
                height={56}
              />
            ) : (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-[18px] font-bold" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                {author.name.split(" ").map((n) => n[0]).join("")}
              </div>
            )}
            <div>
              <Link href={author.url || "#"} rel="author" className="text-[15px] font-semibold hover:text-[var(--accent)]" style={{ color: "var(--ink)" }}>
                {author.name}
              </Link>
              <p className="text-[13px]" style={{ color: "var(--ink-tertiary)" }}>{author.role}</p>
              {author.bio && (
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                  {author.bio}
                </p>
              )}
              {author.sameAs.length > 0 && (
                <div className="mt-2 flex gap-3">
                  {author.sameAs.map((url) => {
                    const label = url.includes("linkedin") ? "LinkedIn" : url.includes("joelhouse") ? "Website" : "Profile";
                    return (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-[13px] hover:underline" style={{ color: "var(--accent)" }}>
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
        <div className="mb-10 rounded-2xl p-6 text-center" style={{ background: "var(--accent-subtle)", border: "1px solid rgba(61,43,224,0.12)" }}>
          <h2 className="text-[20px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
            Check Your AI Visibility Score
          </h2>
          <p className="mx-auto mt-1 max-w-md text-[14px]" style={{ color: "var(--ink-secondary)" }}>
            Run a free 5-pillar audit and see where your brand stands across
            Citations, AI Presence, Entities, Reviews, and Press.
          </p>
          <Link
            href="/free-audit"
            className="mt-4 inline-flex h-10 items-center rounded-lg px-5 text-[14px] font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Run Free Audit →
          </Link>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-[20px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
              Related Articles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) =>
                related ? (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group overflow-hidden rounded-2xl transition-all hover:-translate-y-px"
                    style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/blog/${related.slug}.png`}
                      alt={related.title}
                      width={400}
                      height={210}
                      className="w-full"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <div className="text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
                        {categoryLabels[related.category]}
                      </div>
                      <h3 className="mt-1 text-[14px] font-semibold leading-snug" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                        {related.title}
                      </h3>
                    </div>
                  </Link>
                ) : null
              )}
            </div>
          </section>
        )}

        {/* Back */}
        <div className="pt-6 text-center" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <Link href="/blog" className="text-[14px] hover:underline" style={{ color: "var(--accent)" }}>
            ← Back to Blog
          </Link>
        </div>
      </article>
    </>
  );
}

function ContentRenderer({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold" style={{ color: "var(--ink)" }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return (
            <Link key={i} href={linkMatch[2]} className="hover:underline" style={{ color: "var(--accent)" }}>
              {linkMatch[1]}
            </Link>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded px-1.5 py-0.5 font-mono text-[12px]"
              style={{ background: "var(--surface-raised)", color: "var(--ink)" }}
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
