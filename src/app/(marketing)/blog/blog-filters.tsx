"use client";

import { useState } from "react";
import Link from "next/link";
import { categoryLabels } from "@/lib/blog/types";

interface PostSummary {
  slug: string;
  title: string;
  summary: string;
  category: string;
  estimatedReadTime: number;
  publishedAt: string;
}

interface Props {
  posts: PostSummary[];
  categoryCounts: Record<string, number>;
}

export function BlogFilters({ posts, categoryCounts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Object.entries(categoryCounts).filter(([, count]) => count > 0);
  const filteredPosts = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  return (
    <>
      {/* Category filter buttons */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
          style={{
            background: activeCategory === null ? "var(--accent)" : "transparent",
            color: activeCategory === null ? "white" : "var(--ink-tertiary)",
            border: activeCategory === null ? "none" : "1px solid rgba(26,26,46,0.1)",
          }}
        >
          All ({posts.length})
        </button>
        {categories.map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
            style={{
              background: activeCategory === cat ? "var(--accent)" : "transparent",
              color: activeCategory === cat ? "white" : "var(--ink-tertiary)",
              border: activeCategory === cat ? "none" : "1px solid rgba(26,26,46,0.1)",
            }}
          >
            {categoryLabels[cat as keyof typeof categoryLabels] || cat} ({count})
          </button>
        ))}
      </div>

      {/* Article grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-px"
            style={{
              background: "var(--surface-raised)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/blog/${post.slug}.png`}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full"
              loading="lazy"
            />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
                <span className="rounded-full px-2 py-0.5 font-medium" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                  {categoryLabels[post.category as keyof typeof categoryLabels] || post.category}
                </span>
                <span>{post.estimatedReadTime} min</span>
              </div>
              <h3 className="mt-2 flex-1 text-[15px] font-semibold leading-snug" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                {post.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
                {post.summary}
              </p>
              <div className="mt-3 text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
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
    </>
  );
}
