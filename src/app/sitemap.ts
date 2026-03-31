import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { blogPosts } from "@/lib/blog/posts";
import { helpArticles } from "@/lib/help/articles";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mentionlayer.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/use-cases/agencies`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/use-cases/brands`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/academy`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
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

  // Published press releases (from Supabase)
  let pressPages: MetadataRoute.Sitemap = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: releases } = await supabase
        .from("press_releases")
        .select("public_slug, created_at")
        .eq("is_current", true)
        .eq("status", "approved")
        .not("public_slug", "is", null);

      if (releases) {
        pressPages = releases.map((r) => ({
          url: `${BASE_URL}/press/${r.public_slug}`,
          lastModified: r.created_at,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }));
      }
    }
  } catch {
    // Silently skip press releases if DB is unavailable (build time)
  }

  return [...staticPages, ...publishedBlogPosts, ...helpPages, ...pressPages];
}
