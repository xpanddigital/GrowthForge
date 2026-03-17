import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowthForge — AI SEO Platform",
  description:
    "Multi-tenant AI SEO platform for managing off-page AI visibility campaigns.",
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
