import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MentionLayer — Get Your Brand Recommended by AI",
  description:
    "MentionLayer is the AI visibility platform that seeds forum citations on Reddit and Quora, launches press releases, boosts reviews, and tracks your brand across ChatGPT, Perplexity, Gemini, and Claude in real-time.",
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
  openGraph: {
    title: "MentionLayer — Get Your Brand Recommended by AI",
    description:
      "The GEO platform that seeds forum citations, launches press, boosts reviews, and tracks your AI visibility score in real-time.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentionLayer — Get Your Brand Recommended by AI",
    description:
      "Get your brand recommended by ChatGPT, Perplexity, Gemini, and Claude. Track your AI visibility score in real-time.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
