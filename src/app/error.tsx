"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-red-500">Error</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again or return to the
          dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-[#6C5CE7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Go to Dashboard
          </a>
        </div>
        <p className="mt-12 text-xs text-muted-foreground">
          MentionLayer
        </p>
      </div>
    </div>
  );
}
