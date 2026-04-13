import type { Metadata } from "next";
import Link from "next/link";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "For Brands — Get Recommended by AI",
  description:
    "Find out if AI recommends your brand. Get cited in high-authority Reddit and Quora threads, recommended by ChatGPT, and tracked across all major AI models.",
  openGraph: {
    title: "For Brands — Get Recommended by AI | MentionLayer",
    description:
      "Get your brand cited in Reddit threads, recommended by ChatGPT, Perplexity, and Gemini, and tracked across all AI models.",
    images: ["/api/og?title=For+Brands"],
  },
};

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.167 10h11.666M10.833 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 7l-8.5 8.5-5-5L2 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 7h6v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BrandsUseCasePage() {
  return (
    <>
      <WebPageJsonLd
        title="For Brands | MentionLayer"
        description="Find out if AI recommends your brand. MentionLayer helps brands get cited in Reddit threads, recommended by ChatGPT, and tracked across all AI models."
        url="/use-cases/brands"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Use Cases", url: "/use-cases/brands" }, { name: "For Brands", url: "/use-cases/brands" }]} />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p
            className="text-[13px] font-semibold tracking-wide uppercase"
            style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
          >
            For Brands
          </p>
          <h1
            className="mt-5 text-[36px] sm:text-[44px] leading-[1.08] tracking-tight max-w-3xl mx-auto"
            style={{ color: "var(--ink)" }}
          >
            Is AI Recommending Your Competitors{" "}
            <em className="not-italic" style={{ color: "var(--accent)" }}>
              Instead of You?
            </em>
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            When someone asks ChatGPT, Perplexity, or Gemini for the best
            option in your category, your brand either shows up or it
            doesn&apos;t. Right now, most brands have no idea which one it is.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
              style={{
                background: "var(--accent)",
                boxShadow: "0 2px 8px rgba(61,43,224,0.25)",
              }}
            >
              Run a Free AI Visibility Audit
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center gap-2 border-[1.5px] transition-colors"
              style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ The Shift ═══ */}
      <section
        className="py-20 sm:py-28"
        style={{ background: "var(--surface-raised)" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center">
            <p
              className="text-[13px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
            >
              The Shift
            </p>
            <h2
              className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] tracking-tight max-w-3xl mx-auto"
              style={{ color: "var(--ink)" }}
            >
              Search is splitting in two. Your brand needs to show up in both.
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl text-[17px] leading-[1.65]"
              style={{ color: "var(--ink-secondary)" }}
            >
              Google still matters. But a growing number of buying decisions now
              start with an AI conversation, not a search bar.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {/* Traditional Search — red tint */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              <span
                className="inline-flex rounded-lg px-3 py-1 text-[12px] font-semibold"
                style={{ background: "#fecaca", color: "#991b1b" }}
              >
                Traditional Search
              </span>
              <h3
                className="mt-4 text-[20px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Google ranks pages
              </h3>
              <p
                className="mt-2 text-[15px] leading-[1.6]"
                style={{ color: "var(--ink-secondary)" }}
              >
                10 blue links. Your SEO team optimises meta tags, builds
                backlinks, and fights for page one. You&apos;ve been doing this
                for years.
              </p>
              <div
                className="mt-6 space-y-3 rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.6)" }}
              >
                <div className="flex items-center gap-3 text-[14px]" style={{ color: "var(--ink-tertiary)" }}>
                  <span className="shrink-0 font-mono text-[12px]" style={{ color: "var(--ink-tertiary)", opacity: 0.5 }}>
                    #1
                  </span>
                  <span>Your competitor&apos;s homepage</span>
                </div>
                <div className="flex items-center gap-3 text-[14px]" style={{ color: "var(--ink-tertiary)" }}>
                  <span className="shrink-0 font-mono text-[12px]" style={{ color: "var(--ink-tertiary)", opacity: 0.5 }}>
                    #2
                  </span>
                  <span>Reddit thread comparing options</span>
                </div>
                <div className="flex items-center gap-3 text-[14px]" style={{ color: "var(--ink-tertiary)" }}>
                  <span className="shrink-0 font-mono text-[12px]" style={{ color: "var(--ink-tertiary)", opacity: 0.5 }}>
                    #3
                  </span>
                  <span>Quora answer from 2024</span>
                </div>
                <div className="flex items-center gap-3 text-[14px]" style={{ color: "var(--ink)" }}>
                  <span className="shrink-0 font-mono text-[12px] font-semibold" style={{ color: "var(--accent)" }}>
                    #4
                  </span>
                  <span className="font-medium">Your homepage</span>
                </div>
              </div>
            </div>

            {/* AI-Powered Search — green tint */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
              }}
            >
              <span
                className="inline-flex rounded-lg px-3 py-1 text-[12px] font-semibold"
                style={{ background: "#a7f3d0", color: "#065f46" }}
              >
                AI-Powered Search
              </span>
              <h3
                className="mt-4 text-[20px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                AI recommends brands
              </h3>
              <p
                className="mt-2 text-[15px] leading-[1.6]"
                style={{ color: "var(--ink-secondary)" }}
              >
                One answer. No scrolling. The AI picks who to recommend based on
                what it&apos;s learned from forums, reviews, and news. There is
                no page two.
              </p>
              <div
                className="mt-6 space-y-3 rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.6)" }}
              >
                <p className="text-[14px] italic" style={{ color: "var(--ink-tertiary)" }}>
                  &ldquo;What&apos;s the best project management tool for remote
                  teams?&rdquo;
                </p>
                <div
                  className="mt-3 rounded-xl p-3"
                  style={{
                    background: "var(--surface-raised)",
                    border: "1px solid rgba(26,26,46,0.06)",
                  }}
                >
                  <p className="text-[14px]" style={{ color: "var(--ink)" }}>
                    Based on community discussions and user reviews, the top
                    options are{" "}
                    <span className="font-semibold" style={{ color: "#059669" }}>
                      Competitor A
                    </span>
                    ,{" "}
                    <span className="font-semibold" style={{ color: "#059669" }}>
                      Competitor B
                    </span>
                    , and{" "}
                    <span className="font-semibold" style={{ color: "#059669" }}>
                      Competitor C
                    </span>
                    .
                  </p>
                  <p className="mt-2 text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
                    Your brand? Not mentioned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ What happens when AI ignores you ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center">
            <p
              className="text-[13px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
            >
              The Cost of Invisibility
            </p>
            <h2
              className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] tracking-tight max-w-3xl mx-auto"
              style={{ color: "var(--ink)" }}
            >
              Every day AI doesn&apos;t recommend you, your competitor gets
              stronger
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl text-[17px] leading-[1.65]"
              style={{ color: "var(--ink-secondary)" }}
            >
              AI models learn from the same sources over and over. When your
              competitor is mentioned in 47 high-authority Reddit threads and you
              are in zero, that gap compounds.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {/* Problem 1 — Red tint */}
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "#fecaca" }}
              >
                <svg
                  className="h-6 w-6"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: "#991b1b" }}
                >
                  <path
                    d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3
                className="mt-4 text-[18px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Invisible pipeline leak
              </h3>
              <p
                className="mt-2 text-[15px] leading-[1.6]"
                style={{ color: "var(--ink-secondary)" }}
              >
                Potential customers ask AI for recommendations, get your
                competitor&apos;s name, and never google you. You don&apos;t
                even know the lead existed.
              </p>
            </div>

            {/* Problem 2 — Amber tint */}
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
              }}
            >
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "#fde68a" }}
              >
                <svg
                  className="h-6 w-6"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: "#92400e" }}
                >
                  <path
                    d="M13 17l5-5-5-5M6 17l5-5-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3
                className="mt-4 text-[18px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Compounding advantage
              </h3>
              <p
                className="mt-2 text-[15px] leading-[1.6]"
                style={{ color: "var(--ink-secondary)" }}
              >
                AI models reinforce what they already know. The more your
                competitor is cited across Reddit, Quora, and news sites, the
                more likely AI is to recommend them next time.
              </p>
            </div>

            {/* Problem 3 — Accent tint */}
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: "var(--accent-subtle)",
                border: "1px solid rgba(61,43,224,0.12)",
              }}
            >
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "rgba(61,43,224,0.15)" }}
              >
                <svg
                  className="h-6 w-6"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: "var(--accent)" }}
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3
                className="mt-4 text-[18px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                The window is closing
              </h3>
              <p
                className="mt-2 text-[15px] leading-[1.6]"
                style={{ color: "var(--ink-secondary)" }}
              >
                Right now most brands haven&apos;t figured this out. That
                won&apos;t last. The brands that build AI visibility now will be
                the ones AI recommends for years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ How MentionLayer fixes it ═══ */}
      <section
        className="py-20 sm:py-28"
        style={{ background: "var(--surface-raised)" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center">
            <p
              className="text-[13px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
            >
              How It Works
            </p>
            <h2
              className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] tracking-tight max-w-3xl mx-auto"
              style={{ color: "var(--ink)" }}
            >
              Get your brand into the conversations AI is already reading
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl text-[17px] leading-[1.65]"
              style={{ color: "var(--ink-secondary)" }}
            >
              MentionLayer finds the exact threads and sources that AI models
              pull from, then helps you place your brand in them authentically.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <div
              className="flex gap-4 rounded-2xl p-6"
              style={{
                background: "white",
                border: "1px solid rgba(26,26,46,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
              >
                <SearchIcon className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  1. Discover where AI looks
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.6]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  We scan Google SERPs and probe ChatGPT, Perplexity, and Gemini
                  with your keywords. We find the Reddit threads, Quora answers,
                  and forum posts these models actually cite. Not guesswork
                  &mdash; data.
                </p>
              </div>
            </div>

            <div
              className="flex gap-4 rounded-2xl p-6"
              style={{
                background: "white",
                border: "1px solid rgba(26,26,46,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
              >
                <TargetIcon className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  2. Seed authentic citations
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.6]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  For every high-value thread, MentionLayer generates three
                  response variants that read like a real community member. No
                  spam. No marketing speak. Genuine, helpful contributions that
                  naturally mention your brand.
                </p>
              </div>
            </div>

            <div
              className="flex gap-4 rounded-2xl p-6"
              style={{
                background: "white",
                border: "1px solid rgba(26,26,46,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
              >
                <ShieldIcon className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  3. Build multi-signal authority
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.6]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  AI models don&apos;t trust a single source. MentionLayer
                  strengthens your presence across five pillars: forum
                  citations, AI model mentions, entity consistency, reviews, and
                  earned press coverage.
                </p>
              </div>
            </div>

            <div
              className="flex gap-4 rounded-2xl p-6"
              style={{
                background: "white",
                border: "1px solid rgba(26,26,46,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
              >
                <TrendUpIcon className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  4. Measure share of model
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.6]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  Track how often AI recommends your brand vs. competitors
                  across every major model. Share of model is the new share of
                  voice &mdash; and MentionLayer makes it measurable for the
                  first time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ The proof: audit score trajectory ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center">
            <p
              className="text-[13px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
            >
              Proven Results
            </p>
            <h2
              className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] tracking-tight max-w-3xl mx-auto"
              style={{ color: "var(--ink)" }}
            >
              Measurable results, not promises
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl text-[17px] leading-[1.65]"
              style={{ color: "var(--ink-secondary)" }}
            >
              Every engagement starts with a baseline AI Visibility Audit. After
              90 days of targeted work, the numbers tell the story.
            </p>
          </div>

          {/* Score trajectory visualization */}
          <div
            className="mt-16 rounded-2xl p-8 max-w-4xl mx-auto"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid rgba(26,26,46,0.06)",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-[14px] font-medium"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  AI Visibility Score
                </p>
                <p className="text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
                  Example: SaaS brand, B2B category
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--ink-tertiary)", opacity: 0.4 }}
                  />
                  <span className="text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
                    Day 1
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                  <span className="text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
                    Day 90
                  </span>
                </div>
              </div>
            </div>

            {/* Before / After scores */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {/* Before — red tint */}
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase"
                  style={{ letterSpacing: "0.08em", color: "#991b1b" }}
                >
                  Baseline Audit
                </p>
                <p
                  className="mt-3 text-[52px] font-bold leading-none"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  28
                </p>
                <p className="text-[14px]" style={{ color: "var(--ink-tertiary)" }}>
                  /100
                </p>
                <div className="mx-auto mt-4 grid max-w-xs grid-cols-5 gap-2 text-center text-[11px]">
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#dc2626" }}>12</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>Citations</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#dc2626" }}>5</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>AI</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#d97706" }}>42</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>Entity</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#d97706" }}>55</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>Reviews</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#dc2626" }}>18</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>Press</p>
                  </div>
                </div>
              </div>

              {/* After — green tint */}
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase"
                  style={{ letterSpacing: "0.08em", color: "#059669" }}
                >
                  After 90 Days
                </p>
                <p
                  className="mt-3 text-[52px] font-bold leading-none"
                  style={{ color: "var(--accent)" }}
                >
                  74
                </p>
                <p className="text-[14px]" style={{ color: "var(--ink-secondary)" }}>
                  /100
                </p>
                <div className="mx-auto mt-4 grid max-w-xs grid-cols-5 gap-2 text-center text-[11px]">
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#059669" }}>71</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>Citations</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#059669" }}>68</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>AI</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#059669" }}>82</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>Entity</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#059669" }}>73</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>Reviews</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold" style={{ color: "#d97706" }}>58</p>
                    <p style={{ color: "var(--ink-tertiary)" }}>Press</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What changed — stat cards */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: "142", label: "threads discovered" },
                { value: "38", label: "citations placed" },
                { value: "5% \u2192 68%", label: "share of model" },
                { value: "+164%", label: "score improvement" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: "var(--accent-subtle)",
                    border: "1px solid rgba(61,43,224,0.08)",
                  }}
                >
                  <p
                    className="text-[24px] font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ What you get ═══ */}
      <section
        className="py-20 sm:py-28"
        style={{ background: "var(--surface-raised)" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center">
            <p
              className="text-[13px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
            >
              What You Get
            </p>
            <h2
              className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] tracking-tight max-w-3xl mx-auto"
              style={{ color: "var(--ink)" }}
            >
              Everything a brand needs to own AI recommendations
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
            {[
              "AI Visibility Audit across 5 pillars with composite score",
              "Automated discovery of high-authority threads in your category",
              "Three response variants per thread: casual, expert, and story",
              "Share of model tracking across ChatGPT, Perplexity, Gemini, and Claude",
              "Competitor monitoring so you know exactly who AI recommends instead",
              "Prioritised action plan ranked by impact and effort",
              "Entity consistency checks across Google, LinkedIn, directories",
              "Monthly progress reports with before/after score comparison",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3">
                <span className="mt-0.5 shrink-0" style={{ color: "#059669" }}>
                  <CheckIcon className="h-5 w-5" />
                </span>
                <p className="text-[15px] leading-[1.6]" style={{ color: "var(--ink-secondary)" }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p
              className="text-[13px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
            >
              Get Started
            </p>
            <h2
              className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Find out if AI recommends you
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-[17px] leading-[1.65]"
              style={{ color: "var(--ink-secondary)" }}
            >
              Run a free AI Visibility Audit. In under five minutes, you&apos;ll
              know your score, see where your competitors appear, and get a
              prioritised action plan to close the gap.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 2px 8px rgba(61,43,224,0.25)",
                }}
              >
                Run Your Free Audit
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/use-cases/agencies"
                className="inline-flex items-center gap-2 text-[15px] transition-colors"
                style={{ color: "var(--ink-secondary)" }}
              >
                Are you an agency? See the agency use case
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-6 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
              No credit card required. Audit takes under 5 minutes.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
