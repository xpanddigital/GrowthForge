import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mentionlayer.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6C5CE7",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "MentionLayer — Get Your Brand Recommended by AI",
    template: "%s | MentionLayer",
  },
  description:
    "AI visibility platform that seeds forum citations, launches press, boosts reviews, and tracks your brand across ChatGPT, Perplexity, Gemini, and Claude.",
  keywords: [
    "generative engine optimization",
    "GEO",
    "AI SEO",
    "AI visibility",
    "share of model",
    "ChatGPT ranking",
    "AI recommendations",
    "Reddit citation seeding",
    "Quora marketing",
    "press wire releases",
    "UGC reviews",
    "AI brand mentions",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "MentionLayer — Get Your Brand Recommended by AI",
    description:
      "The GEO platform that seeds forum citations, launches press, boosts reviews, and tracks your AI visibility score in real-time.",
    type: "website",
    url: BASE_URL,
    siteName: "MentionLayer",
    images: [
      {
        url: `${BASE_URL}/api/og?title=${encodeURIComponent("MentionLayer — Get Your Brand Recommended by AI")}`,
        width: 1200,
        height: 630,
        alt: "MentionLayer — AI Visibility Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MentionLayer — Get Your Brand Recommended by AI",
    description:
      "Get your brand recommended by ChatGPT, Perplexity, Gemini, and Claude. Track your AI visibility score in real-time.",
    images: [
      `${BASE_URL}/api/og?title=${encodeURIComponent("MentionLayer — Get Your Brand Recommended by AI")}`,
    ],
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
