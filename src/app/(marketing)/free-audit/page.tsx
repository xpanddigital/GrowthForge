import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { BrowserFrame } from "@/components/marketing/browser-frame";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { AuditForm } from "./audit-form";
import { AuditFAQ } from "./audit-faq";

export const metadata: Metadata = {
  title: "Free AI Visibility Audit — MentionLayer",
  description:
    "Get your AI Visibility Score in under 5 minutes. Scored baseline across 5 pillars, competitor comparison, and prioritized action plan. No credit card required.",
  openGraph: {
    title: "Free AI Visibility Audit | MentionLayer",
    description:
      "Discover how visible your brand is to ChatGPT, Perplexity, Gemini, and other AI models. Free scored audit across 5 pillars.",
    images: ["/api/og?title=Free+AI+Visibility+Audit"],
  },
};

/* ── Pillar data for the bento grid ── */
const pillars = [
  {
    title: "AI Presence",
    weight: 30,
    desc: "How often ChatGPT, Perplexity, Gemini, and Claude recommend your brand when users ask buying-intent questions in your category.",
    metric: "Share of Model %",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    color: "#3d2be0",
    bg: "var(--accent-subtle)",
    featured: true,
  },
  {
    title: "Citation Audit",
    weight: 25,
    desc: "Your presence in the Reddit, Quora, and forum threads that AI models cite as sources.",
    metric: "Gap vs. competitors",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    color: "#059669",
    bg: "#ecfdf5",
    featured: false,
  },
  {
    title: "Entity Sync",
    weight: 15,
    desc: "Brand consistency across directories, schema markup, and knowledge graphs that AI models reference.",
    metric: "Consistency score",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.914 0a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.88" />
      </svg>
    ),
    color: "#2563eb",
    bg: "#eff6ff",
    featured: false,
  },
  {
    title: "Reviews",
    weight: 15,
    desc: "Review volume, velocity, and sentiment across Google, Trustpilot, G2, and other platforms AI trusts.",
    metric: "Volume & velocity",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    color: "#d97706",
    bg: "#fffbeb",
    featured: false,
  },
  {
    title: "Press & Media",
    weight: 15,
    desc: "Earned media coverage and third-party mentions that AI models use to gauge your authority.",
    metric: "Authority signals",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
      </svg>
    ),
    color: "#7c3aed",
    bg: "#f5f3ff",
    featured: false,
  },
];

export default function FreeAuditPage() {
  const featured = pillars.find((p) => p.featured)!;
  const rest = pillars.filter((p) => !p.featured);

  return (
    <>
      <WebPageJsonLd
        title="Free AI Visibility Audit | MentionLayer"
        description="Get your AI Visibility Score in under 5 minutes. Scored baseline across 5 pillars, competitor comparison, and prioritized action plan."
        url="/free-audit"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Free Audit", url: "/free-audit" },
        ]}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <Image src="/images/hero-bg-texture.png" alt="" fill className="object-cover" priority />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-20 items-center">
            {/* Left — Copy */}
            <div className="max-w-[600px]">
              <p
                className="ml-enter text-[14px] font-medium tracking-wide uppercase"
                style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
              >
                Free AI Visibility Audit
              </p>

              <h1
                className="ml-enter ml-d1 mt-6 text-[42px] sm:text-[54px] lg:text-[64px] leading-[1.04] tracking-tight"
                style={{ color: "var(--ink)" }}
              >
                See your brand through{" "}
                <em className="not-italic" style={{ color: "var(--accent)" }}>
                  AI&apos;s
                </em>{" "}
                eyes
              </h1>

              <p
                className="ml-enter ml-d2 mt-7 text-[18px] sm:text-[20px] leading-[1.6] max-w-[520px]"
                style={{ color: "var(--ink-secondary)" }}
              >
                Get a scored baseline across 5 pillars, see how you compare to
                competitors, and receive a prioritized action plan. In under 5
                minutes. Completely free.
              </p>

              <div className="ml-enter ml-d3 mt-9 flex flex-wrap gap-3">
                <a
                  href="#start-audit"
                  className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
                  style={{
                    background: "var(--accent)",
                    boxShadow: "0 2px 8px rgba(61,43,224,0.25)",
                  }}
                >
                  Start free audit
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
                <a
                  href="#sample-report"
                  className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center border-[1.5px] transition-colors"
                  style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}
                >
                  See sample report
                </a>
              </div>

              {/* Trust strip */}
              <div className="ml-enter ml-d4 mt-10 flex flex-wrap gap-x-8 gap-y-2">
                {[
                  { icon: "shield", text: "No credit card required" },
                  { icon: "clock", text: "Results in under 5 min" },
                  { icon: "users", text: "Used by 100+ agencies" },
                ].map(({ icon, text }) => (
                  <span key={text} className="flex items-center gap-2 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
                    {icon === "shield" && (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                    )}
                    {icon === "clock" && (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
                    )}
                    {icon === "users" && (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
                    )}
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Animated Audit Score Card */}
            <div className="ml-enter ml-d4 hidden lg:flex justify-center">
              <div
                className="rounded-2xl p-8 max-w-[380px] w-full"
                style={{
                  background: "var(--surface-raised)",
                  boxShadow:
                    "0 25px 60px -12px rgba(15,23,42,0.12), 0 8px 24px -8px rgba(15,23,42,0.06)",
                }}
              >
                <p className="text-[12px] font-semibold tracking-wide uppercase mb-6" style={{ color: "var(--ink-tertiary)", letterSpacing: "0.08em" }}>
                  AI Visibility Score
                </p>

                {/* Score ring */}
                <div className="flex justify-center mb-8">
                  <svg viewBox="0 0 120 120" width="180" height="180">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(26,26,46,0.05)" strokeWidth="9" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#3d2be0"
                      strokeWidth="9"
                      strokeDasharray="314"
                      strokeDashoffset="69"
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{ animation: "score-fill 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                    />
                    <text x="60" y="54" textAnchor="middle" fontSize="38" fontFamily="'Instrument Serif', Georgia, serif" fill="#1a1a2e" fontWeight="400">78</text>
                    <text x="60" y="72" textAnchor="middle" fontSize="11" fill="#8e90a6" fontFamily="'Outfit', system-ui, sans-serif">/100</text>
                  </svg>
                </div>

                {/* Pillar mini bars */}
                <div className="space-y-3">
                  {[
                    { label: "AI Presence", score: 72, color: "#3d2be0" },
                    { label: "Citations", score: 45, color: "#059669" },
                    { label: "Entity Sync", score: 88, color: "#2563eb" },
                    { label: "Reviews", score: 91, color: "#d97706" },
                    { label: "Press", score: 58, color: "#7c3aed" },
                  ].map((p) => (
                    <div key={p.label} className="flex items-center gap-3">
                      <span className="w-[72px] text-[11px] font-medium" style={{ color: "var(--ink-secondary)" }}>
                        {p.label}
                      </span>
                      <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.05)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.score}%`, background: p.color, transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                        />
                      </div>
                      <span className="w-7 text-right text-[11px] font-mono font-semibold" style={{ color: p.color }}>
                        {p.score}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sample insight */}
                <div className="mt-6 rounded-lg p-3" style={{ background: "var(--accent-subtle)" }}>
                  <p className="text-[11px] font-semibold" style={{ color: "var(--accent)" }}>Top Insight</p>
                  <p className="mt-0.5 text-[12px] leading-[1.5]" style={{ color: "var(--ink-secondary)" }}>
                    Competitors appear in 47 high-authority threads where your brand has zero presence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT THE AUDIT MEASURES — Pillar Bento Grid ═══ */}
      <section className="py-20 sm:py-28" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>
            What you&apos;ll discover
          </p>
          <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] max-w-[560px]" style={{ color: "var(--ink)" }}>
            Five pillars. One score.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.65] max-w-[560px]" style={{ color: "var(--ink-secondary)" }}>
            The audit examines every signal AI models use when deciding whether to recommend your brand — then tells you exactly what to fix.
          </p>

          <div className="mt-14 grid lg:grid-cols-[1fr_1fr] gap-5">
            {/* Featured: AI Presence — tall card */}
            <div
              className="rounded-2xl p-8 sm:p-10 flex flex-col justify-between min-h-[420px]"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <div>
                <span
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  {featured.icon}
                  30% of your score
                </span>
                <h3 className="mt-6 text-[28px] sm:text-[32px] leading-[1.12]">
                  {featured.title}
                </h3>
                <p className="mt-4 text-[16px] leading-[1.65]" style={{ opacity: 0.85 }}>
                  {featured.desc}
                </p>
              </div>
              <div className="mt-8">
                <p className="text-[12px] uppercase tracking-wide mb-3" style={{ opacity: 0.5 }}>We test across</p>
                <div className="flex flex-wrap gap-2">
                  {["ChatGPT", "Perplexity", "Gemini", "Claude", "Google AIO"].map((m) => (
                    <span key={m} className="text-[12px] font-medium px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 smaller pillar cards */}
            <div className="grid grid-cols-2 gap-5">
              {rest.map((p) => (
                <div
                  key={p.title}
                  className="rounded-xl p-6 flex flex-col justify-between min-h-[200px]"
                  style={{ background: p.bg }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ color: p.color }}>{p.icon}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: p.color }}>
                        {p.weight}%
                      </span>
                    </div>
                    <h3 className="text-[17px] font-semibold" style={{ color: p.color }}>
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.6]" style={{ color: "var(--ink-secondary)" }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SAMPLE REPORT — Product Screenshot ═══ */}
      <section id="sample-report" className="py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Screenshot */}
            <div className="order-2 lg:order-1">
              <BrowserFrame url="app.mentionlayer.com/audits/result" className="max-w-[540px]">
                <Image
                  src="/images/audit-results.png"
                  alt="AI Visibility Audit dashboard showing composite score, 5 pillar breakdown, and prioritized action plan"
                  width={600}
                  height={480}
                  className="w-full"
                />
              </BrowserFrame>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--warm)", letterSpacing: "0.08em" }}>
                Sample report
              </p>
              <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]" style={{ color: "var(--ink)" }}>
                Your audit delivers clarity
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>
                Not another vague report. The audit tells you exactly where you stand,
                who&apos;s beating you, and what to do about it — in specific, actionable terms.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  {
                    title: "Composite AI Visibility Score",
                    desc: "One number (0–100) that captures your total AI visibility. Compare against industry benchmarks and track progress monthly.",
                    color: "var(--accent)",
                  },
                  {
                    title: "Competitor Share of Model",
                    desc: "See exactly which brands AI models recommend instead of you — and how often. The gap is your opportunity.",
                    color: "#059669",
                  },
                  {
                    title: "Prioritized Action Plan",
                    desc: "AI-generated roadmap ranked by impact-to-effort ratio. Know what to fix first, what can wait, and what each action costs.",
                    color: "var(--warm)",
                  },
                ].map(({ title, desc, color }) => (
                  <div key={title} className="flex gap-4">
                    <div
                      className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${color}15` }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                        {title}
                      </h3>
                      <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: "var(--ink-secondary)" }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RESEARCH CREDIBILITY — Dark Band ═══ */}
      <section className="relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <Image src="/images/social-proof-bg.png" alt="" fill className="object-cover" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 py-20 sm:py-28">
          <div className="max-w-[560px]">
            <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "#fbbf24", letterSpacing: "0.08em" }}>
              Research-backed
            </p>
            <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] text-white">
              65.9% of businesses are invisible to AI
            </h2>
            <p className="mt-5 text-[17px] leading-[1.65]" style={{ color: "#94a3b8" }}>
              Our AI Visibility Index studied 1,000 businesses across 5 AI models
              and 95,392 data points. The finding: most businesses have
              zero AI visibility — even the ones investing in SEO.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "1,004", sub: "businesses studied" },
              { n: "65.9%", sub: "completely invisible to AI" },
              { n: "5", sub: "AI models tested" },
              { n: "11.7", sub: "average visibility score (of 100)" },
            ].map(({ n, sub }) => (
              <div
                key={n}
                className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="serif text-[32px] text-white">{n}</span>
                <p className="mt-1 text-[13px]" style={{ color: "#94a3b8" }}>{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-[14px] font-semibold transition-colors"
              style={{ color: "#fbbf24" }}
            >
              Read the full research
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-[560px] mx-auto">
            <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>
              How it works
            </p>
            <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]" style={{ color: "var(--ink)" }}>
              Three steps. Five minutes.
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Sign up",
                body: "Enter your name, email, company, and website. That's it — no credit card, no long onboarding form.",
                border: "var(--accent)",
                icon: (
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
              },
              {
                n: "02",
                title: "We scan",
                body: "Our system probes ChatGPT, Perplexity, Gemini, and Claude with buying-intent prompts. Simultaneously scans SERPs, entities, reviews, and press.",
                border: "var(--warm)",
                icon: (
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--warm)" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                ),
              },
              {
                n: "03",
                title: "Get your score",
                body: "Receive a composite AI Visibility Score with pillar breakdowns, competitor comparison, and a prioritized action plan.",
                border: "#059669",
                icon: (
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                ),
              },
            ].map(({ n, title, body, border, icon }) => (
              <div
                key={n}
                className="rounded-xl p-8 text-center"
                style={{
                  background: "var(--surface-raised)",
                  borderTop: `3px solid ${border}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
                }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5" style={{ background: `${border}10` }}>
                  {icon}
                </div>
                <span className="block text-[13px] font-semibold" style={{ color: "var(--ink-tertiary)" }}>{n}</span>
                <h3 className="mt-2 text-[22px]" style={{ color: "var(--ink)" }}>{title}</h3>
                <p className="mt-3 text-[14px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE FORM ═══ */}
      <section id="start-audit" className="py-20 sm:py-28 scroll-mt-20" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-start">
            {/* Left — Value prop */}
            <div className="lg:sticky lg:top-28">
              <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>
                Start now
              </p>
              <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]" style={{ color: "var(--ink)" }}>
                Get your AI Visibility Score
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>
                Fill in four fields. We&apos;ll handle the rest — probing AI models,
                scanning SERPs, checking entities, and analyzing your review and press
                footprint.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  {
                    title: "Scored across 5 pillars",
                    desc: "AI Presence, Citations, Entities, Reviews, and Press — each scored 0-100.",
                  },
                  {
                    title: "Competitor comparison",
                    desc: "See which brands AI models recommend instead of you — and how often.",
                  },
                  {
                    title: "Action plan included",
                    desc: "Prioritized roadmap of what to fix first, ranked by impact and effort.",
                  },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-[15px] font-medium" style={{ color: "var(--ink)" }}>{title}</p>
                      <p className="mt-0.5 text-[13px]" style={{ color: "var(--ink-secondary)" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial mini */}
              <div className="mt-10 rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid rgba(26,26,46,0.06)" }}>
                <p className="text-[14px] leading-[1.6] italic" style={{ color: "var(--ink-secondary)" }}>
                  &quot;The audit showed us we were invisible to every AI model. Three months later,
                  we&apos;re being recommended by ChatGPT for our primary keywords.&quot;
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Image
                    src="/authors/joel-house.jpg"
                    alt="Joel House"
                    width={32}
                    height={32}
                    className="rounded-full"
                    style={{ objectFit: "cover" }}
                  />
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>Joel House</p>
                    <p className="text-[11px]" style={{ color: "var(--ink-tertiary)" }}>Founder, MentionLayer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{
                background: "var(--surface-raised)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
                border: "1px solid rgba(26,26,46,0.04)",
              }}
            >
              <h3 className="text-[22px] font-semibold mb-1" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                Start your free audit
              </h3>
              <p className="text-[14px] mb-6" style={{ color: "var(--ink-tertiary)" }}>
                Enter your details below. No credit card required.
              </p>
              <AuditForm />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[36px] sm:text-[44px] leading-[1.08]" style={{ color: "var(--ink)" }}>
              Common questions
            </h2>
          </div>
          <AuditFAQ />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-16 sm:py-20" style={{ background: "var(--accent-subtle)" }}>
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <h2 className="text-[28px] sm:text-[36px] leading-[1.12]" style={{ color: "var(--ink)" }}>
            Your competitors might already be in AI&apos;s answers. Are you?
          </h2>
          <p className="mt-4 text-[16px]" style={{ color: "var(--ink-secondary)" }}>
            Run a free audit and find out in under 5 minutes.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <a
              href="#start-audit"
              className="h-12 px-8 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
              style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}
            >
              Start free audit
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <Link
              href="/pricing"
              className="h-12 px-8 rounded-lg text-[15px] font-semibold inline-flex items-center border-[1.5px] transition-colors"
              style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}
            >
              View plans
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
