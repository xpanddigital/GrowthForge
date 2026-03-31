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

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{author.name}</span>
        </nav>

        {/* Author Hero */}
        <div className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {author.image ? (
            <img
              src={
                author.image.startsWith("http")
                  ? author.image
                  : `${BASE_URL}${author.image}`
              }
              alt={author.name}
              width={120}
              height={120}
              className="h-28 w-28 flex-shrink-0 rounded-full object-cover ring-4 ring-[#6C5CE7]/20"
            />
          ) : (
            <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-3xl font-bold text-[#6C5CE7] ring-4 ring-[#6C5CE7]/20">
              {author.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {author.name}
            </h1>
            <p className="mt-1 text-base text-muted-foreground">{author.role}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {socialLinks.map(({ url, label }) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-[#6C5CE7]/50 hover:text-[#6C5CE7]"
                >
                  {label} &rarr;
                </a>
              ))}
              {hubLink && (
                <a
                  href={hubLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-[#6C5CE7]/50 hover:text-[#6C5CE7]"
                >
                  {hubLink.label} &rarr;
                </a>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-foreground">About {author.name}</h2>
          <div className="space-y-4">
            {author.extendedBio.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* Expertise */}
        {author.knowsAbout.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Areas of Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {author.knowsAbout.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-[#6C5CE7]/10 px-3 py-1 text-xs font-medium text-[#6C5CE7]"
                >
                  {topic}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Articles by {author.name}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({authorPosts.length})
            </span>
          </h2>
          {authorPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published articles yet.</p>
          ) : (
            <div className="space-y-3">
              {authorPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-[#6C5CE7]/40"
                >
                  <div className="min-w-0">
                    <div className="mb-1 text-xs text-muted-foreground">
                      {categoryLabels[post.category]}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {post.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {post.summary}
                    </p>
                  </div>
                  <time
                    dateTime={post.publishedAt}
                    className="shrink-0 text-xs text-muted-foreground"
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
        <div className="rounded-xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/5 p-6 text-center">
          <h2 className="text-lg font-bold text-foreground">
            See Your AI Visibility Score
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Run a free 5-pillar audit and find out where your brand stands across
            ChatGPT, Perplexity, Gemini, and Claude.
          </p>
          <Link
            href="/free-audit"
            className="mt-4 inline-block rounded-md bg-[#6C5CE7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Run Free Audit &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
