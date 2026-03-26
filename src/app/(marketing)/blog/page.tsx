import Link from "next/link";
import type { Metadata } from "next";
import { categoryLabels } from "@/lib/blog/types";
import { blogPosts } from "@/lib/blog/posts";

// Revalidate every 12 hours so scheduled posts go live without a deploy
export const revalidate = 43200;

export const metadata: Metadata = {
  title: "Blog | MentionLayer — AI Visibility & GEO Insights",
  description:
    "Learn how to get your brand recommended by AI. Guides on Generative Engine Optimization, citation seeding, share of model, AI audits, and more.",
};

function getOgImageUrl(post: { title: string; category: string }) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "https://mentionlayer.com";
  const params = new URLSearchParams({
    title: post.title,
    category: post.category,
  });
  return `${base}/api/og?${params.toString()}`;
}

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

  const categories = [
    "fundamentals",
    "strategy",
    "technical",
    "industry",
    "tools",
  ] as const;

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          MentionLayer Blog
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The playbook for getting your brand recommended by AI.
        </p>
      </div>

      {/* Featured post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group mb-12 block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-[#6C5CE7]/50"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getOgImageUrl(featured)}
            alt={featured.title}
            width={1200}
            height={630}
            className="w-full"
          />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-[#6C5CE7]/10 px-2 py-0.5 font-medium text-[#6C5CE7]">
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
            <h2 className="mt-3 text-xl font-bold text-foreground group-hover:text-[#6C5CE7] sm:text-2xl">
              {featured.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {featured.summary}
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-[#6C5CE7]">
              Read article →
            </span>
          </div>
        </Link>
      )}

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const count = posts.filter((p) => p.category === cat).length;
          if (count === 0) return null;
          return (
            <span
              key={cat}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {categoryLabels[cat]} ({count})
            </span>
          );
        })}
      </div>

      {/* Article grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-[#6C5CE7]/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getOgImageUrl(post)}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full"
              loading="lazy"
            />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-[#6C5CE7]/10 px-1.5 py-0.5 font-medium text-[#6C5CE7]">
                  {categoryLabels[post.category]}
                </span>
                <span>{post.estimatedReadTime} min</span>
              </div>
              <h3 className="mt-2 flex-1 text-sm font-semibold text-foreground group-hover:text-[#6C5CE7]">
                {post.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                {post.summary}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div className="mt-16 rounded-xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/5 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">
          Get AI Visibility Insights
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Join agency owners and brand marketers who are staying ahead of the AI
          search shift.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-block rounded-md bg-[#6C5CE7] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
        >
          Start Free →
        </Link>
      </div>
    </div>
  );
}
