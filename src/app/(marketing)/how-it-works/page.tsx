import type { Metadata } from "next";
import Link from "next/link";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "How It Works — AI Visibility in 4 Steps",
  description:
    "Audit your AI visibility, discover high-authority Reddit and Quora threads, seed authentic responses, and monitor your share of model across ChatGPT and Perplexity.",
  openGraph: {
    title: "How It Works — AI Visibility in 4 Steps | MentionLayer",
    description:
      "Audit, discover, seed, and monitor. Four steps to get your brand recommended by ChatGPT, Perplexity, Gemini, and Claude.",
    images: ["/api/og?title=How+It+Works"],
  },
};

const stepColors = {
  accent: "var(--accent)",
  warm: "var(--warm)",
  green: "#059669",
  purple: "#7c3aed",
} as const;

const steps = [
  {
    number: "01",
    title: "Audit",
    description:
      "Run an AI Visibility Audit to establish your baseline score across 5 pillars: Citations, AI Presence, Entities, Reviews, and Press. Most brands score 15\u201335 out of 100. You need to know where you stand before you can move.",
    link: "/help/audits",
    linkText: "Learn about audits",
    color: stepColors.accent,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Discover",
    description:
      "The Citation Engine scans Google SERPs and probes AI models to find Reddit, Quora, and Facebook Group threads where your competitors are mentioned but you aren\u2019t. These are high-authority pages already indexed and cited \u2014 the exact threads AI models pull from.",
    link: "/help/citation-engine",
    linkText: "Learn about discovery",
    color: stepColors.accent,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Seed",
    description:
      "Generate authentic, human-quality responses in 3 variants \u2014 casual, expert, and story \u2014 then post them to high-authority threads. In parallel, build press coverage through digital PR, fix entity inconsistencies, and grow your review footprint.",
    link: "/help/responses",
    linkText: "Learn about seeding",
    color: stepColors.warm,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Monitor",
    description:
      "Track your share-of-model across ChatGPT, Perplexity, Gemini, and Claude with weekly automated prompts. Re-audit monthly. The brands we work with go from a score of 28 to 74 in 90 days.",
    link: "/help/monitoring",
    linkText: "Learn about monitoring",
    color: stepColors.green,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
  },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <WebPageJsonLd
        title="How It Works | MentionLayer"
        description="Audit your AI visibility, discover high-authority threads, seed authentic responses, and monitor your share of model across ChatGPT, Perplexity, Gemini, and Claude."
        url="/how-it-works"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "How It Works", url: "/how-it-works" },
        ]}
      />

      {/* ═══ HERO ═══ */}
      <section className="py-20 sm:py-28 text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <span
            className="text-[13px] font-semibold tracking-wide uppercase"
            style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
          >
            How It Works
          </span>

          <h1
            className="mt-5 text-[36px] sm:text-[44px] leading-[1.08]"
            style={{ color: "var(--ink)" }}
          >
            <span style={{ color: "var(--accent)" }}>Audit.</span>{" "}
            <span style={{ color: "var(--ink)" }}>Discover.</span>{" "}
            <span style={{ color: "var(--warm)" }}>Seed.</span>{" "}
            <span style={{ color: "#059669" }}>Monitor.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Four steps to make your brand visible where it matters most &mdash;
            inside AI model responses. No black boxes. No vague promises. Just a
            measured system that moves the number.
          </p>
        </div>
      </section>

      {/* ═══ 4 STEPS ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl p-7 sm:p-8 transition-all hover:-translate-y-px"
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid rgba(26,26,46,0.06)",
                  borderTop: `3px solid ${step.color}`,
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
                }}
              >
                {/* Header row: badge + icon */}
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[13px] font-bold"
                    style={{
                      background: `${step.color}12`,
                      color: step.color,
                    }}
                  >
                    {step.number}
                  </div>
                  <div style={{ color: step.color }}>{step.icon}</div>
                </div>

                {/* Title */}
                <h2
                  className="mt-5 text-[22px] sm:text-[24px] leading-[1.2]"
                  style={{ color: "var(--ink)" }}
                >
                  {step.title}
                </h2>

                {/* Description */}
                <p
                  className="mt-3 text-[17px] leading-[1.65]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  {step.description}
                </p>

                {/* Learn more link */}
                <Link
                  href={step.link}
                  className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold transition-opacity hover:opacity-75"
                  style={{ color: step.color }}
                >
                  {step.linkText}
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section
        className="py-20 sm:py-28"
        style={{ background: "var(--accent-subtle)" }}
      >
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2
            className="text-[36px] sm:text-[44px] leading-[1.08]"
            style={{ color: "var(--ink)" }}
          >
            Know your score. Close the gap.
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Run your first AI Visibility Audit in under 5 minutes. See exactly
            where you stand, where your competitors are winning, and what to do
            about it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                background: "var(--accent)",
                boxShadow: "0 2px 8px rgba(61,43,224,0.25)",
              }}
            >
              Start your free audit
            </Link>
            <Link
              href="/features"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center justify-center transition-colors hover:opacity-80"
              style={{
                color: "var(--ink-secondary)",
                border: "1px solid rgba(26,26,46,0.12)",
              }}
            >
              See all features
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
