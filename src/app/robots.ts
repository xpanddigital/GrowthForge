import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://growthforge.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/login", "/signup"],
      },
      // Allow AI retrieval bots to crawl public content
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      {
        userAgent: "Claude-SearchBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      // Block AI training bots (keep content for retrieval, not training)
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ClaudeBot",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "Google-Extended",
        disallow: ["/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
