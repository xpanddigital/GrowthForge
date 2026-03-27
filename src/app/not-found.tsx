import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-[#6C5CE7]">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-[#6C5CE7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </div>
        <p className="mt-12 text-xs text-muted-foreground">
          MentionLayer
        </p>
      </div>
    </div>
  );
}
