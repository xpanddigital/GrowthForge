import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s | MentionLayer Help Center",
    default: "Help Center | MentionLayer",
  },
  description:
    "Learn how to use MentionLayer to improve your brand's AI visibility. Guides for the Citation Engine, AI Monitor, Audits, PressForge, and more.",
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/help"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <svg
              className="h-5 w-5 text-[#6C5CE7]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            MentionLayer Help
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="mailto:joel@xpanddigital.io"
              className="rounded-md bg-[#6C5CE7] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#5A4BD1]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
