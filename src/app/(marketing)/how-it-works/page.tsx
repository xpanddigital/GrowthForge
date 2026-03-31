import type { Metadata } from "next";
import Link from "next/link";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "How It Works — AI Visibility in 4 Steps",
  description:
    "Audit your AI visibility, discover high-authority threads, seed authentic responses, and monitor your share of model across AI models.",
  openGraph: {
    title: "How It Works — AI Visibility in 4 Steps | MentionLayer",
    description:
      "Audit, discover, seed, and monitor. Four steps to get your brand recommended by ChatGPT, Perplexity, Gemini, and Claude.",
    images: ["/api/og?title=How+It+Works"],
  },
};

const steps = [
  {
    number: "01",
    title: "Audit",
    description:
      "Run an AI Visibility Audit to establish your baseline score across 5 pillars: Citations, AI Presence, Entities, Reviews, and Press. Most brands score 15\u201335 out of 100. You need to know where you stand before you can move.",
    link: "/help/audits",
    linkText: "Learn about audits",
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
    <div className="mx-auto max-w-6xl px-4">
      <WebPageJsonLd
        title="How It Works | MentionLayer"
        description="Audit your AI visibility, discover high-authority threads, seed authentic responses, and monitor your share of model across ChatGPT, Perplexity, Gemini, and Claude."
        url="/how-it-works"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "How It Works", url: "/how-it-works" }]} />
      {/* Hero */}
      <section className="pb-16 pt-20 text-center md:pb-24 md:pt-28">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          <span className="text-[#6C5CE7]">Audit.</span>{" "}
          <span className="text-foreground">Discover.</span>{" "}
          <span className="text-[#00D2D3]">Seed.</span>{" "}
          <span className="text-foreground">Monitor.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Four steps to make your brand visible where it matters most &mdash;
          inside AI model responses. No black boxes. No vague promises. Just a
          measured system that moves the number.
        </p>
      </section>

      {/* Steps */}
      <section className="relative pb-20 md:pb-28">
        {/* Vertical connector line */}
        <div
          aria-hidden="true"
          className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-[#6C5CE7]/60 via-[#6C5CE7]/20 to-transparent md:left-[39px] md:block"
        />

        <div className="space-y-16 md:space-y-20">
          {steps.map((step) => (
            <div key={step.number} className="relative md:pl-24">
              {/* Step number badge */}
              <div className="mb-4 flex items-center gap-4 md:absolute md:left-0 md:top-0 md:mb-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 md:h-[54px] md:w-[54px]">
                  <span className="text-sm font-bold text-[#6C5CE7]">
                    {step.number}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground md:hidden">
                  {step.title}
                </h2>
              </div>

              {/* Content card */}
              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="hidden shrink-0 text-[#6C5CE7] md:block">
                    {step.icon}
                  </div>
                  <div>
                    <h2 className="hidden text-2xl font-bold text-foreground md:block">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground md:mt-3 md:text-lg">
                      {step.description}
                    </p>
                    <Link
                      href={step.link}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#6C5CE7] transition-colors hover:text-[#5A4BD1]"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border pb-20 pt-16 text-center md:pb-28 md:pt-20">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Know your score. Close the gap.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
          Run your first AI Visibility Audit in under 5 minutes. See exactly
          where you stand, where your competitors are winning, and what to do
          about it.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center rounded-md bg-[#6C5CE7] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Start your free audit
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            See all features
          </Link>
        </div>
      </section>
    </div>
  );
}
