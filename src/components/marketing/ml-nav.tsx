import Link from "next/link";

const navLinks = [
  { label: "Features", href: "/#platform" },
  { label: "How It Works", href: "/#process" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Academy", href: "/academy" },
  { label: "Done for You", href: "/services" },
];

export function MLNav() {
  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 h-16 flex items-center"
      style={{
        background: "rgba(252,251,249,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#3d2be0" />
            <text
              x="8"
              y="20"
              fill="white"
              fontFamily="Outfit"
              fontWeight="700"
              fontSize="16"
            >
              M
            </text>
          </svg>
          <span
            className="text-[17px] font-semibold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            MentionLayer
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[14px]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="hidden sm:block text-[14px] font-medium"
            style={{ color: "var(--ink-secondary)" }}
          >
            Sign in
          </Link>
          <Link
            href="/free-audit"
            className="h-9 px-4 rounded-lg text-[14px] font-semibold text-white inline-flex items-center"
            style={{ background: "var(--accent)" }}
          >
            Start free audit
          </Link>
        </div>
      </div>
    </nav>
  );
}
