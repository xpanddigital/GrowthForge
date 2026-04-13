import Link from "next/link";

export function MLFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
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
                className="text-[15px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                MentionLayer
              </span>
            </Link>
            <span
              className="text-[13px] hidden sm:block"
              style={{ color: "var(--ink-tertiary)" }}
            >
              The AI Visibility Platform
            </span>
          </div>
          <div
            className="flex flex-wrap items-center gap-6 text-[14px]"
            style={{ color: "var(--ink-tertiary)" }}
          >
            {[
              { label: "Features", href: "/#platform" },
              { label: "Pricing", href: "/#pricing" },
              { label: "Blog", href: "/blog" },
              { label: "Academy", href: "/academy" },
              { label: "Research", href: "/research" },
              { label: "Done for You", href: "/services" },
              { label: "Sign In", href: "/login" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="hover:text-[var(--ink)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div
          className="mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]"
          style={{
            borderTop: "1px solid rgba(26,26,46,0.04)",
            color: "var(--ink-tertiary)",
          }}
        >
          <p>
            &copy; {new Date().getFullYear()} MentionLayer. Built by Xpand
            Digital.
          </p>
          <p>
            Generative Engine Optimization for brands that want to be
            recommended by AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
