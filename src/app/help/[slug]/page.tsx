import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  helpArticles,
  getArticleBySlug,
  getAllSlugs,
} from "@/lib/help/articles";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Not Found" };

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: [article.targetKeyword],
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: "article",
    },
  };
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const relatedArticles = article.relatedArticles
    .map((s) => helpArticles.find((a) => a.slug === s))
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    author: {
      "@type": "Organization",
      name: "GrowthForge by Xpand Digital",
    },
    publisher: {
      "@type": "Organization",
      name: "GrowthForge",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/help" className="hover:text-foreground">
            Help Center
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{article.title.split(":")[0]}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {article.title}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            {article.summary}
          </p>
        </header>

        {/* Table of Contents */}
        <div className="mb-10 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            In this article
          </h2>
          <ul className="space-y-1">
            {article.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-[#6C5CE7] hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#faq"
                className="text-sm text-[#6C5CE7] hover:underline"
              >
                Frequently Asked Questions
              </a>
            </li>
          </ul>
        </div>

        {/* Sections */}
        {article.sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {section.title}
            </h2>
            <div className="prose-gf space-y-4">
              {section.content.split("\n\n").map((paragraph, i) => {
                // Handle screenshot placeholders
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

                // Handle tables
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

                // Handle list items
                if (paragraph.trim().startsWith("- ") || paragraph.trim().startsWith("1. ")) {
                  const items = paragraph.trim().split("\n");
                  const isOrdered = items[0].match(/^\d+\./);

                  const ListTag = isOrdered ? "ol" : "ul";

                  return (
                    <ListTag
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
                    </ListTag>
                  );
                }

                return (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    <ContentRenderer text={paragraph} />
                  </p>
                );
              })}
            </div>
          </section>
        ))}

        {/* FAQ Section */}
        <section id="faq" className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {article.faqs.map((faq, i) => (
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

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Next Steps
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) =>
                related ? (
                  <Link
                    key={related.slug}
                    href={`/help/${related.slug}`}
                    className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-[#6C5CE7]/50"
                  >
                    <h3 className="text-sm font-semibold text-foreground">
                      {related.title.split(":")[0]}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {related.summary}
                    </p>
                  </Link>
                ) : null
              )}
            </div>
          </section>
        )}

        {/* Back to Help Center */}
        <div className="border-t border-border pt-6 text-center">
          <Link
            href="/help"
            className="text-sm text-[#6C5CE7] hover:underline"
          >
            ← Back to Help Center
          </Link>
        </div>
      </article>
    </>
  );
}

/** Renders inline markdown-like formatting: **bold**, links, `code` */
function ContentRenderer({ text }: { text: string }) {
  // Split by bold markers, inline code, and links
  const parts = text.split(
    /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g
  );

  return (
    <>
      {parts.map((part, i) => {
        // Bold
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        // Link
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
        // Inline code
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
