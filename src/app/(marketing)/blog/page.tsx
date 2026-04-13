import Link from "next/link";
import type { Metadata } from "next";
import { categoryLabels } from "@/lib/blog/types";
import { blogPosts } from "@/lib/blog/posts";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { BlogFilters } from "./blog-filters";

export const revalidate = 43200;

export const metadata: Metadata = {
  title: "Blog — AI Visibility & GEO Insights",
  description:
    "Learn how to get your brand recommended by AI. Guides on GEO, citation seeding, share of model, AI audits, and more.",
  openGraph: {
    title: "Blog — AI Visibility & GEO Insights | MentionLayer",
    description:
      "Guides on Generative Engine Optimization, citation seeding, share of model, AI audits, and AI visibility strategy.",
    images: ["/api/og?title=Blog"],
  },
};

function getPublishedPosts() {
  const now = new Date();
  return [...blogPosts]
    .filter((post) => new Date(post.publishedAt) <= now)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export default function BlogIndexPage() {
  const posts = getPublishedPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  const categoryCounts: Record<string, number> = {};
  for (const p of posts) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <WebPageJsonLd
        title="Blog | MentionLayer"
        description="Learn how to get your brand recommended by AI. Guides on Generative Engine Optimization, citation seeding, share of model, AI audits, and more."
        url="/blog"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }]} />

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[36px] sm:text-[44px] tracking-tight" style={{ color: "var(--ink)" }}>
          MentionLayer Blog
        </h1>
        <p className="mt-2 text-[17px]" style={{ color: "var(--ink-secondary)" }}>
          The playbook for getting your brand recommended by AI.
        </p>
      </div>

      {/* Featured Research Banner */}
      <Link
        href="/research"
        className="group mb-10 flex items-center gap-4 rounded-2xl p-5 transition-all hover:-translate-y-px"
        style={{
          background: "var(--accent-subtle)",
          border: "1px solid rgba(61,43,224,0.12)",
        }}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold" style={{ color: "var(--accent)" }}>
            Featured Research
          </div>
          <div className="text-[15px] font-medium" style={{ color: "var(--ink)" }}>
            AI Visibility Index — 1,000 businesses, 5 AI models, 95,392 data points
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" className="flex-shrink-0 transition-transform group-hover:translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
      </Link>

      {/* Featured post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group mb-10 block overflow-hidden rounded-2xl transition-all hover:-translate-y-px"
          style={{
            background: "var(--surface-raised)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/blog/${featured.slug}.png`}
            alt={featured.title}
            width={1200}
            height={630}
            className="w-full"
          />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
              <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                {categoryLabels[featured.category]}
              </span>
              <span>{featured.estimatedReadTime} min read</span>
              <span>
                {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h2 className="mt-3 text-[22px] sm:text-[26px] font-semibold tracking-tight" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
              {featured.title}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
              {featured.summary}
            </p>
            <span className="mt-4 inline-block text-[14px] font-medium" style={{ color: "var(--accent)" }}>
              Read article →
            </span>
          </div>
        </Link>
      )}

      {/* Category filters + Article grid (client component for interactivity) */}
      <BlogFilters
        posts={rest.map((p) => ({
          slug: p.slug,
          title: p.title,
          summary: p.summary,
          category: p.category,
          estimatedReadTime: p.estimatedReadTime,
          publishedAt: p.publishedAt,
        }))}
        categoryCounts={categoryCounts}
      />

      {/* Newsletter CTA */}
      <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "var(--accent-subtle)", border: "1px solid rgba(61,43,224,0.12)" }}>
        <h2 className="text-[22px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
          Get AI Visibility Insights
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[14px]" style={{ color: "var(--ink-secondary)" }}>
          Join agency owners and brand marketers who are staying ahead of the AI
          search shift.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-flex h-10 items-center rounded-lg px-6 text-[14px] font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          Start Free →
        </Link>
      </div>
    </div>
  );
}
