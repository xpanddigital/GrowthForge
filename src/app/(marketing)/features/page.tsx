import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features | MentionLayer — AI Visibility Platform",
  description:
    "10 modules for AI visibility: Citation Engine, AI Monitor, Audits, PressForge, Entity Sync, Reviews, Technical GEO, YouTube GEO, Mention Gaps, and ROI Reporting.",
};

const features = [
  {
    title: "Citation Engine",
    description:
      "Discovers high-authority Reddit, Quora, and Facebook Group threads that Google and AI models already cite. Generates three human-quality response variants per thread — casual, expert, and story — so your brand gets mentioned where it matters. No bots. No spam. Real community-native responses.",
    href: "/help/citation-engine",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8" />
        <path d="M8 13h4" />
      </svg>
    ),
  },
  {
    title: "AI Monitor",
    description:
      "Tests your brand visibility across ChatGPT, Perplexity, Gemini, and Claude every week. Sends buying-intent prompts, tracks whether you get mentioned, and measures your Share of Model against competitors. You'll know exactly which AI recommends you — and which ones don't.",
    href: "/help/ai-monitor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
        <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z" />
        <circle cx="12" cy="6" r="1" fill="currentColor" />
        <path d="M18 2l2 2-2 2" />
      </svg>
    ),
  },
  {
    title: "AI Visibility Audit",
    description:
      "Five-pillar scoring across Citations, AI Presence, Entity Consistency, Reviews, and Press. Run it on day one to establish a baseline. Run it again in 90 days to prove ROI. Includes a competitor comparison, executive summary, and prioritized action plan — ready to present to clients.",
    href: "/help/ai-visibility-audit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Entity Sync",
    description:
      "Checks whether your brand identity is consistent across Google Business, LinkedIn, Crunchbase, Wikipedia, directories, and your own website schema markup. Inconsistencies confuse AI models. Entity Sync finds the mismatches and tells you exactly what to fix.",
    href: "/help/entity-sync",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="6" r="2" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="18" r="2" />
        <path d="M6.7 7.5L9.5 10" />
        <path d="M17.3 7.5L14.5 10" />
        <path d="M6.7 16.5L9.5 14" />
        <path d="M17.3 16.5L14.5 14" />
      </svg>
    ),
  },
  {
    title: "Review Engine",
    description:
      "Monitors your review presence across Google, Trustpilot, G2, Capterra, and industry-specific platforms. Tracks review velocity, sentiment distribution, and how you stack up against competitors. AI models weight reviews heavily — this module makes sure yours are working for you.",
    href: "/help/review-engine",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: "PressForge",
    description:
      "AI-powered digital PR that gets your brand into the publications AI models trust. Generates press releases, identifies journalist targets, and manages distribution campaigns. Third-party authority signals are the backbone of AI recommendations — PressForge builds them systematically.",
    href: "/help/pressforge",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M10 6h8" />
        <path d="M10 10h8" />
        <path d="M10 14h4" />
      </svg>
    ),
  },
  {
    title: "Technical GEO",
    description:
      "Audits your robots.txt and meta tags for AI crawler access. If you're blocking GPTBot, Google-Extended, or ClaudeBot, AI models can't read your site — and they won't cite it. Also scores your content for citability: structured data, FAQ markup, clear headings, and authoritative formatting.",
    href: "/help/technical-geo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    title: "YouTube GEO",
    description:
      "Generates video content briefs optimized for AI citation. YouTube is the second-largest search engine and a major source for AI models. This module identifies video topics in your niche that AI already references, then creates briefs with titles, outlines, and talking points designed to get cited.",
    href: "/help/youtube-geo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Mention Gap Analysis",
    description:
      "Cross-platform competitor gap scanning. Finds every thread, article, and discussion where competitors get mentioned but you don't. Maps the gaps across Reddit, Quora, Facebook Groups, and AI model responses. Each gap is a placement opportunity — ranked by authority and traffic potential.",
    href: "/help/mention-gap-analysis",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 5-9" />
        <circle cx="7" cy="16" r="1.5" fill="currentColor" />
        <circle cx="11" cy="8" r="1.5" fill="currentColor" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" />
        <circle cx="20" cy="3" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "ROI Reporting",
    description:
      "Before-and-after audit comparisons that prove the work is paying off. Tracks composite AI Visibility Score over time, breaks down improvement by pillar, and connects to GA4 for traffic attribution. Exportable PDF reports your clients can actually understand — no vanity metrics.",
    href: "/help/roi-reporting",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21 21H3V3" />
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M17 7h4v4" />
      </svg>
    ),
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-[#6C5CE7]/5 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#00D2D3]">
            The Full GEO Stack
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            10 Modules. One Mission:{" "}
            <span className="text-[#6C5CE7]">
              Get Your Brand Recommended by AI.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AI models are replacing search results. When someone asks ChatGPT or
            Perplexity for a recommendation, your brand is either in the answer
            or it isn&apos;t. MentionLayer makes sure you are.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-[#6C5CE7]/40 hover:bg-card/80 sm:p-8"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7] transition-colors group-hover:bg-[#6C5CE7]/20">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-[#6C5CE7] opacity-0 transition-opacity group-hover:opacity-100">
                Learn more
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="ml-1 h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your competitors are already in the AI answers.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Run a free AI Visibility Audit and see exactly where you stand. Takes
            5 minutes. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center rounded-md bg-[#6C5CE7] px-8 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
            >
              Start Free Audit
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex h-11 items-center rounded-md border border-border px-8 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
