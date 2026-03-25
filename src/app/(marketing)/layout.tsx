import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-[#6C5CE7]">Growth</span>
            <span className="text-foreground">Forge</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/help"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Help
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-[#6C5CE7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Product</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How It Works</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Use Cases</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/use-cases/agencies" className="text-sm text-muted-foreground hover:text-foreground">For Agencies</Link></li>
                <li><Link href="/use-cases/brands" className="text-sm text-muted-foreground hover:text-foreground">For Brands</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Resources</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
                <li><Link href="/help/getting-started" className="text-sm text-muted-foreground hover:text-foreground">Getting Started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="mt-3 space-y-2">
                <li><a href="mailto:joel@xpanddigital.com" className="text-sm text-muted-foreground hover:text-foreground">Contact</a></li>
                <li><span className="text-sm text-muted-foreground">Built by Xpand Digital</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GrowthForge by Xpand Digital (Miji Australia Pty Ltd). All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
