import type { Metadata } from "next";
import Link from "next/link";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Features — AI Visibility Platform",
  description:
    "10 modules for AI visibility: Citation Engine, AI Monitor, 5-pillar Audits, PressForge, Entity Sync, Reviews, Technical GEO, YouTube GEO, and ROI Reporting.",
  openGraph: {
    title: "Features — AI Visibility Platform | MentionLayer",
    description:
      "10 modules for AI visibility: Citation Engine, AI Monitor, Audits, PressForge, Entity Sync, Reviews, and more.",
    images: ["/api/og?title=Features"],
  },
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
  /* Citation Engine is the featured module — pull it out */
  const citationEngine = features[0];
  const remainingFeatures = features.slice(1);

  return (
    <>
      <WebPageJsonLd
        title="Features | MentionLayer"
        description="10 modules for AI visibility: Citation Engine, AI Monitor, Audits, PressForge, Entity Sync, Reviews, Technical GEO, YouTube GEO, Mention Gaps, and ROI Reporting."
        url="/features"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Features", url: "/features" }]} />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(61,43,224,0.04), transparent)" }} />

        <div className="relative max-w-[1200px] mx-auto px-6 text-center">
          <p
            className="text-[13px] font-semibold tracking-wide uppercase"
            style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
          >
            The Full GEO Stack
          </p>

          <h1
            className="mx-auto mt-5 max-w-[800px] text-[36px] sm:text-[44px] lg:text-[56px] leading-[1.08] tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            10 Modules. One Mission:{" "}
            <em className="not-italic" style={{ color: "var(--accent)" }}>
              Get Your Brand Recommended by AI.
            </em>
          </h1>

          <p
            className="mx-auto mt-6 max-w-[640px] text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            AI models are replacing search results. When someone asks ChatGPT or
            Perplexity for a recommendation, your brand is either in the answer
            or it isn&apos;t. MentionLayer makes sure you are.
          </p>

          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <Link
              href="/free-audit"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
              style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}
            >
              Run free visibility audit
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              href="/how-it-works"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center border-[1.5px]"
              style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED MODULE — Citation Engine ═══ */}
      <section className="py-20 sm:py-28" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <p
            className="text-[13px] font-semibold tracking-wide uppercase"
            style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
          >
            Core Module
          </p>
          <h2
            className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] max-w-[560px]"
            style={{ color: "var(--ink)" }}
          >
            Citation Engine
          </h2>

          <div
            className="mt-10 rounded-2xl overflow-hidden"
            style={{ background: "var(--accent)", boxShadow: "0 8px 40px -8px rgba(61,43,224,0.25)" }}
          >
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-0">
              {/* Left — copy */}
              <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
                <div>
                  <span
                    className="inline-block text-[12px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full text-white"
                    style={{ background: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}
                  >
                    Most Powerful Module
                  </span>
                  <h3 className="mt-6 text-[24px] sm:text-[28px] lg:text-[32px] leading-[1.12] text-white">
                    Plant your brand where AI already looks
                  </h3>
                  <p className="mt-4 text-[16px] sm:text-[17px] leading-[1.6] text-white/80">
                    {citationEngine.description}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {["Reddit", "Quora", "Facebook Groups"].map((p) => (
                    <span key={p} className="text-[12px] font-medium px-3 py-1 rounded-full text-white" style={{ background: "rgba(255,255,255,0.12)" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — capabilities checklist */}
              <div
                className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <p className="text-[13px] font-semibold uppercase tracking-wide text-white/50 mb-6" style={{ letterSpacing: "0.06em" }}>
                  What it does
                </p>
                <div className="space-y-4">
                  {[
                    "Discovers threads Google and AI already cite",
                    "Generates 3 response variants: casual, expert, story",
                    "Human-quality, community-native tone per platform",
                    "Opportunity scoring ranks threads by impact",
                    "Human-in-the-loop approval before any posting",
                    "Full audit trail of every placement",
                  ].map((item) => (
                    <div key={item} className="flex gap-3 items-start">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span className="text-[15px] text-white/85">{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={citationEngine.href}
                  className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-white/90 hover:text-white transition-colors"
                >
                  Learn more about Citation Engine
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE GRID — Remaining 9 Modules ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <p
              className="text-[13px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--warm)", letterSpacing: "0.08em" }}
            >
              The Full Suite
            </p>
            <h2
              className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]"
              style={{ color: "var(--ink)" }}
            >
              9 more modules working together
            </h2>
            <p
              className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.65]"
              style={{ color: "var(--ink-secondary)" }}
            >
              Every pillar of AI visibility covered. Monitor, audit, seed, optimize, and prove ROI — from a single platform.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {remainingFeatures.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative rounded-2xl p-7 sm:p-8 transition-all hover:-translate-y-px"
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid rgba(26,26,46,0.06)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
                }}
              >
                {/* Icon */}
                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3
                  className="mb-2 text-[18px] font-semibold leading-tight"
                  style={{ color: "var(--ink)" }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[15px] leading-[1.6]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <span
                  className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--accent)" }}
                >
                  Learn more
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 sm:py-28" style={{ background: "var(--accent-subtle)" }}>
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2
            className="text-[36px] sm:text-[44px] leading-[1.08]"
            style={{ color: "var(--ink)" }}
          >
            Your competitors are already in the AI answers.
          </h2>
          <p
            className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Run a free AI Visibility Audit and see exactly where you stand. Takes
            5 minutes. No credit card required.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
              style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}
            >
              Start Free Audit
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              href="/how-it-works"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center border-[1.5px]"
              style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
