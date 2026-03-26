"use client";

import Link from "next/link";

export function UpgradeCTA() {
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6 space-y-4">
      <h3 className="text-lg font-semibold">Ready to improve your AI visibility?</h3>
      <p className="text-sm text-muted-foreground">
        MentionLayer automates citation seeding, AI monitoring, entity optimization,
        and press distribution — everything in your action plan, handled for you.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/pricing"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Unlock Full Platform
        </Link>
        <a
          href="https://xpanddigital.io/book-a-call"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium hover:bg-muted transition-colors"
        >
          Book a Strategy Call
        </a>
      </div>
    </div>
  );
}
