import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePageJsonLd } from "@/components/seo/json-ld";
import { AUTHORS, getAuthorBySlug } from "@/lib/blog/types";
import { blogPosts } from "@/lib/blog/posts";
import { categoryLabels } from "@/lib/blog/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mentionlayer.com";

export function generateStaticParams() {
  return Object.keys(AUTHORS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Not Found" };

  const authorUrl = `${BASE_URL}/author/${slug}`;

  return {
    title: `${author.name} — Author`,
    description: author.bio,
    alternates: { canonical: authorUrl },
    openGraph: {
      type: "profile",
      url: authorUrl,
      title: `${author.name} | MentionLayer`,
      description: author.bio,
      siteName: "MentionLayer",
      ...(author.image && {
        images: [
          {
            url: author.image.startsWith("http")
              ? author.image
              : `${BASE_URL}${author.image}`,
            width: 400,
            height: 400,
            alt: author.name,
          },
        ],
      }),
    },
    twitter: {
      card: "summary",
      title: `${author.name} | MentionLayer`,
      description: author.bio,
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  // All published posts by this author, sorted newest first
  const now = new Date();
  const authorPosts = blogPosts
    .filter(
      (p) =>
        p.author.name === author.name && new Date(p.publishedAt) <= now
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  const authorUrl = `${BASE_URL}/author/${slug}`;

  // Social links from sameAs — label by domain
  const socialLinks = author.sameAs.map((url) => {
    let label = "Profile";
    if (url.includes("linkedin")) label = "LinkedIn";
    else if (url.includes("joelhouse.com")) label = "Personal Site";
    else if (url.includes("mentionlayer.com")) label = "MentionLayer";
    return { url, label };
  });

  // Add hub if not already in sameAs
  const hubLink = author.hub !== author.sameAs[0]
    ? { url: author.hub, label: "Personal Site" }
    : null;

  return (
    <>
      <ProfilePageJsonLd
        slug={slug}
        name={author.name}
        jobTitle={author.role}
        bio={author.bio}
        image={author.image}
        hub={author.hub}
        knowsAbout={author.knowsAbout}
        sameAs={[...author.sameAs, authorUrl]}
        worksForName="MentionLayer"
        worksForUrl={BASE_URL}
      />

      <div className="mx-auto max-w-[800px] px-6 py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
          <Link href="/" className="transition-colors hover:opacity-80" style={{ color: "var(--ink-secondary)" }}>Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="transition-colors hover:opacity-80" style={{ color: "var(--ink-secondary)" }}>Blog</Link>
          <span className="mx-2">/</span>
          <span style={{ color: "var(--ink)" }}>{author.name}</span>
        </nav>

        {/* Author Hero */}
        <div className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {author.image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  author.image.startsWith("http")
                    ? author.image
                    : `${BASE_URL}${author.image}`
                }
                alt={author.name}
                width={120}
                height={120}
                className="h-28 w-28 flex-shrink-0 rounded-full object-cover"
                style={{ boxShadow: "0 0 0 4px rgba(61,43,224,0.2)" }}
              />
            </>
          ) : (
            <div
              className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full text-3xl font-bold"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                boxShadow: "0 0 0 4px rgba(61,43,224,0.2)",
              }}
            >
              {author.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--ink)" }}>
              {author.name}
            </h1>
            <p className="mt-1 text-[15px]" style={{ color: "var(--ink-secondary)" }}>{author.role}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {socialLinks.map(({ url, label }) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(26,26,46,0.06)] px-3 py-1 text-xs font-medium transition-colors hover:border-[rgba(61,43,224,0.3)] hover:text-[var(--accent)]"
                  style={{
                    color: "var(--ink)",
                    background: "var(--surface-raised)",
                  }}
                >
                  {label} &rarr;
                </a>
              ))}
              {hubLink && (
                <a
                  href={hubLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(26,26,46,0.06)] px-3 py-1 text-xs font-medium transition-colors hover:border-[rgba(61,43,224,0.3)] hover:text-[var(--accent)]"
                  style={{
                    color: "var(--ink)",
                    background: "var(--surface-raised)",
                  }}
                >
                  {hubLink.label} &rarr;
                </a>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--ink)" }}>About {author.name}</h2>
          <div className="space-y-4">
            {author.extendedBio.split("\n\n").map((para, i) => (
              <p key={i} className="text-[15px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* Expertise */}
        {author.knowsAbout.length > 0 && (
          <section className="mb-12">
            <h2
              className="mb-3 text-[13px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              Areas of Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {author.knowsAbout.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: "var(--accent-subtle)",
                    color: "var(--accent)",
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--ink)" }}>
            Articles by {author.name}
            <span className="ml-2 text-sm font-normal" style={{ color: "var(--ink-tertiary)" }}>
              ({authorPosts.length})
            </span>
          </h2>
          {authorPosts.length === 0 ? (
            <p className="text-[15px]" style={{ color: "var(--ink-secondary)" }}>No published articles yet.</p>
          ) : (
            <div className="space-y-3">
              {authorPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="flex items-start justify-between gap-4 rounded-xl border border-[rgba(26,26,46,0.06)] p-4 transition-all hover:border-[rgba(61,43,224,0.3)] hover:shadow-sm"
                  style={{
                    background: "var(--surface-raised)",
                  }}
                >
                  <div className="min-w-0">
                    <div
                      className="mb-1 text-[13px] font-semibold uppercase tracking-wide"
                      style={{ color: "var(--accent)" }}
                    >
                      {categoryLabels[post.category]}
                    </div>
                    <h3 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
                      {post.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>
                      {post.summary}
                    </p>
                  </div>
                  <time
                    dateTime={post.publishedAt}
                    className="shrink-0 text-[13px]"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: "var(--accent-subtle)",
            border: "1px solid rgba(61,43,224,0.15)",
          }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            See Your AI Visibility Score
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>
            Run a free 5-pillar audit and find out where your brand stands across
            ChatGPT, Perplexity, Gemini, and Claude.
          </p>
          <Link
            href="/free-audit"
            className="mt-5 inline-block h-12 rounded-lg px-7 text-[15px] font-semibold leading-[48px] text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Run Free Audit &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
