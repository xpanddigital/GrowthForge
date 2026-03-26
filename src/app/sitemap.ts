import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog/posts";
import { helpArticles } from "@/lib/help/articles";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mentionlayer.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/use-cases/agencies`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/use-cases/brands`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/help`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  // Published blog posts (only posts with publishedAt in the past)
  const today = new Date();
  const publishedBlogPosts: MetadataRoute.Sitemap = blogPosts
    .filter((post) => new Date(post.publishedAt) <= today)
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // Help articles
  const helpPages: MetadataRoute.Sitemap = helpArticles.map((article) => ({
    url: `${BASE_URL}/help/${article.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...publishedBlogPosts, ...helpPages];
}
