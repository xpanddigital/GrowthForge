import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryLabels } from "@/lib/blog/types";
import { blogPosts } from "@/lib/blog/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: [post.targetKeyword],
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const relatedPosts = post.relatedSlugs
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      url: "https://joelhouse.com/about",
      sameAs: [
        "https://joelhouse.com/about",
        "https://www.linkedin.com/in/joelhouse",
        "https://xpanddigital.com",
        "https://growthforge.io",
      ],
      worksFor: {
        "@type": "Organization",
        name: "GrowthForge",
        url: "https://growthforge.io",
      },
      description: "AI marketing expert, author of AI for Revenue, and founder of GrowthForge. Joel House helps brands get recommended by AI through Generative Engine Optimization.",
    },
    publisher: {
      "@type": "Organization",
      name: "GrowthForge by Xpand Digital",
      url: "https://growthforge.io",
    },
  };

  const faqJsonLd = post.faqs.length > 0 ? {
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
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
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
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded bg-[#6C5CE7]/10 px-2 py-0.5 font-medium text-[#6C5CE7]">
              {categoryLabels[post.category]}
            </span>
            <span>{post.estimatedReadTime} min read</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">{post.summary}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {post.author.name}
            </span>
            <span>&middot;</span>
            <span>{post.author.role}</span>
          </div>
        </header>

        {/* Key Takeaway */}
        <div className="mb-8 rounded-lg border border-[#6C5CE7]/30 bg-[#6C5CE7]/5 p-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6C5CE7]">
            Key Takeaway
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {post.keyTakeaway}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-10 rounded-lg border border-border bg-card p-4">
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
        </div>

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
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Author Bio */}
        <div className="mb-10 rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-lg font-bold text-[#6C5CE7]">
              JH
            </div>
            <div>
              <a
                href="https://joelhouse.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-foreground hover:text-[#6C5CE7]"
              >
                {post.author.name}
              </a>
              <p className="text-xs text-muted-foreground">{post.author.role}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Joel House is an AI marketing expert, author of{" "}
                <em>AI for Revenue</em>, and founder of GrowthForge and Xpand
                Digital. He helps brands and agencies get recommended by AI
                through Generative Engine Optimization.
              </p>
            </div>
          </div>
        </div>

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
            href="/signup"
            className="mt-4 inline-block rounded-md bg-[#6C5CE7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Run Free Audit →
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
            ← Back to Blog
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
