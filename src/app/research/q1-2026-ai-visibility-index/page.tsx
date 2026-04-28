import type { Metadata } from "next";
import Link from "next/link";
import { MLNav } from "@/components/marketing/ml-nav";
import { MLFooter } from "@/components/marketing/ml-footer";
import { ResearchCharts } from "./charts";
import {
  snapshots,
  industryBreakdown,
  keyStats,
} from "@/lib/research/study-data";

export const metadata: Metadata = {
  title: "AI Visibility Index — Research",
  description:
    "1,000 businesses. 5 AI models. 95,392 data points. The first large-scale study on which businesses get recommended by ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews.",
  openGraph: {
    title: "AI Visibility Index | MentionLayer Research",
    description:
      "66% of businesses are completely invisible to AI. The AI Visibility Index reveals what separates the visible from the invisible.",
    images: ["/api/og?title=AI+Visibility+Index"],
  },
};

const latest = snapshots[snapshots.length - 1];

export default function ResearchPage() {
  return (
    <div className="ml">
      <MLNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(61,43,224,0.06) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 flex-wrap justify-center text-[13px] mb-4">
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors"
              style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7 7l-7-7 7-7" /></svg>
              Research
            </Link>
            <span style={{ color: "var(--ink-tertiary)" }}>·</span>
            <span style={{ color: "var(--ink-tertiary)" }}>Study 1 · April 2026</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Ongoing Study &middot; {keyStats.totalBusinesses.toLocaleString()} Businesses
          </div>
          <h1
            className="mt-6 text-[40px] sm:text-[56px] lg:text-[68px] leading-[1.06] tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            The AI Visibility Index
          </h1>
          <p
            className="mt-6 text-[18px] sm:text-[20px] leading-[1.6] max-w-[640px] mx-auto"
            style={{ color: "var(--ink-secondary)" }}
          >
            {keyStats.totalBusinesses.toLocaleString()} businesses. {keyStats.aiModels} AI models.{" "}
            {keyStats.totalDataPoints.toLocaleString()} data points. The first large-scale study on which businesses get recommended by AI &mdash; and why.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#findings"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
              style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}
            >
              View findings
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </a>
            <a
              href="#download"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center gap-2 transition-colors"
              style={{ border: "1px solid rgba(61,43,224,0.2)", color: "var(--accent)" }}
            >
              Download CSV
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FORMAL PAPER CALLOUT ═══ */}
      <section className="py-6">
        <div className="max-w-[900px] mx-auto px-6">
          <a
            href="/research/whitepapers/ai-visibility-index-phase-1-v1.1.docx"
            download
            className="block rounded-xl p-5 transition-transform hover:-translate-y-px"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--accent-subtle)",
              textDecoration: "none",
            }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--accent-subtle)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="15" y2="17" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: 2,
                  }}
                >
                  Academic-format white paper available
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: "var(--ink)",
                    lineHeight: 1.4,
                  }}
                >
                  Phase 1 White Paper · v1.1 · ~16 pages · with abstract, methodology, references
                </div>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Download DOCX
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* ═══ HEADLINE STAT ═══ */}
      <section className="py-12 sm:py-16" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid sm:grid-cols-4 gap-6 text-center">
            {[
              { value: `${latest.invisiblePct}%`, label: "Completely Invisible", sub: "to all 5 AI models" },
              { value: `${keyStats.allFiveModelsPct}%`, label: "Visible in All 5", sub: "AI models" },
              { value: `${latest.avgVisibilityScore}`, label: "Avg Visibility Score", sub: "out of 100" },
              { value: `${keyStats.industries}`, label: "Industries Studied", sub: `${keyStats.totalBusinesses.toLocaleString()} businesses` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl p-6" style={{ background: "var(--surface)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)" }}>
                <div className="text-[36px] sm:text-[42px] font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
                  {stat.value}
                </div>
                <div className="mt-1 text-[14px] font-medium" style={{ color: "var(--ink)" }}>
                  {stat.label}
                </div>
                <div className="text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ KEY FINDINGS ═══ */}
      <section id="findings" className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[32px] sm:text-[40px] tracking-tight" style={{ color: "var(--ink)" }}>
              Key Findings
            </h2>
            <p className="mt-3 text-[16px] max-w-[520px] mx-auto" style={{ color: "var(--ink-secondary)" }}>
              What separates the businesses AI recommends from the ones it ignores.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Finding 1: Invisibility */}
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </div>
                <h3 className="text-[18px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                  The Invisibility Problem
                </h3>
              </div>
              <p className="text-[40px] font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
                {latest.invisiblePct}%
              </p>
              <p className="mt-1 text-[14px]" style={{ color: "var(--ink-secondary)" }}>
                of businesses are completely invisible to AI. They appear in zero AI-generated answers across all five models tested.
              </p>
            </div>

            {/* Finding 2: Model Coverage */}
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="text-[18px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                  Multi-Model Coverage
                </h3>
              </div>
              <p className="text-[40px] font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
                {keyStats.allFiveModelsPct}%
              </p>
              <p className="mt-1 text-[14px]" style={{ color: "var(--ink-secondary)" }}>
                of businesses appear in all five AI models. Being visible in one model does not guarantee visibility in others.
              </p>
            </div>

            {/* Finding 3: Review Cliff */}
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
                </div>
                <h3 className="text-[18px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                  The 1,000 Review Cliff
                </h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-[40px] font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
                  2.4x
                </p>
                <p className="text-[16px]" style={{ color: "var(--ink-tertiary)" }}>higher visibility</p>
              </div>
              <p className="mt-1 text-[14px]" style={{ color: "var(--ink-secondary)" }}>
                Businesses with 1,000+ Google reviews score {keyStats.reviewCliff.aboveAvgScore} vs {keyStats.reviewCliff.belowAvgScore} average. Reviews are a strong signal AI models use to filter recommendations.
              </p>
            </div>

            {/* Finding 4: Top Predictor */}
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <h3 className="text-[18px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                  Top Predictors of Visibility
                </h3>
              </div>
              <div className="space-y-3 mt-2">
                {latest.topCorrelations.slice(0, 3).map((c) => (
                  <div key={c.factor}>
                    <div className="flex justify-between text-[13px] mb-1">
                      <span style={{ color: "var(--ink)" }}>{c.factor}</span>
                      <span className="font-mono font-medium" style={{ color: "var(--accent)" }}>
                        r={c.correlation.toFixed(3)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "var(--accent-subtle)" }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.abs(c.correlation) * 300}%`,
                          background: "var(--accent)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INTERACTIVE CHARTS (Client Component) ═══ */}
      <ResearchCharts
        snapshots={snapshots}
        industryBreakdown={industryBreakdown}
        latest={latest}
      />

      {/* ═══ METHODOLOGY ═══ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[32px] sm:text-[40px] tracking-tight" style={{ color: "var(--ink)" }}>
              Methodology
            </h2>
            <p className="mt-3 text-[16px] max-w-[520px] mx-auto" style={{ color: "var(--ink-secondary)" }}>
              How the AI Visibility Index is built each month.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Sample Selection", desc: `${keyStats.totalBusinesses.toLocaleString()} businesses across ${keyStats.industries} industries, balanced between local service businesses and SaaS companies.` },
              { step: "02", title: "AI Model Testing", desc: "Each business is queried across ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews using standardized buying-intent prompts." },
              { step: "03", title: "Signal Collection", desc: "We collect 27 technical and authority signals per business including schema markup, review counts, blog content, robots.txt, and crawl accessibility." },
              { step: "04", title: "Correlation Analysis", desc: "Pearson correlation coefficients are calculated between each signal and the composite visibility score to identify what actually drives AI recommendations." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl p-6" style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)" }}>
                <div className="text-[13px] font-semibold" style={{ color: "var(--accent)" }}>
                  Step {item.step}
                </div>
                <h3 className="mt-2 text-[16px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOWNLOAD ═══ */}
      <section id="download" className="py-16 sm:py-24" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-[32px] sm:text-[40px] tracking-tight" style={{ color: "var(--ink)" }}>
            Download the Data
          </h2>
          <p className="mt-3 text-[16px] max-w-[520px] mx-auto" style={{ color: "var(--ink-secondary)" }}>
            Full dataset available as CSV. Use it for your own analysis, research, or client reporting.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/data/ai-visibility-index-2026.csv"
              download
              className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
              style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Full Dataset ({keyStats.totalBusinesses.toLocaleString()} rows)
            </a>
            <a
              href="/data/ai-visibility-index-top-performers-2026.csv"
              download
              className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center gap-2 transition-colors"
              style={{ border: "1px solid rgba(61,43,224,0.2)", color: "var(--accent)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Top Performers Only
            </a>
          </div>
        </div>
      </section>

      {/* ═══ NEXT STUDY ═══ */}
      <section className="py-16 sm:py-20" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[900px] mx-auto px-6">
          <Link
            href="/research/q2-2026-off-page-decomposition"
            className="block rounded-2xl p-8 transition-transform hover:-translate-y-px"
            style={{ background: "var(--accent)", color: "#fff", boxShadow: "0 10px 30px -10px rgba(61,43,224,0.4)" }}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
              Continue · Study 2 · April 2026
            </div>
            <h3 className="text-[26px] sm:text-[30px] tracking-tight mb-3" style={{ fontFamily: "'Instrument Serif', Georgia, serif", lineHeight: 1.15 }}>
              We tested &ldquo;you need to be on Reddit&rdquo; across 2,729 businesses
            </h3>
            <p className="text-[15.5px] leading-[1.55] mb-4" style={{ color: "rgba(255,255,255,0.9)" }}>
              Reddit&apos;s predictive power collapsed from r=0.333 to r=0.000 once we controlled for general multi-platform presence. The contrarian sequel to Study 1 — 14 industries, 4 markets, 278,000+ data points.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[14px] font-semibold">
              Read the Off-Page Decomposition
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-[32px] sm:text-[40px] tracking-tight" style={{ color: "var(--ink)" }}>
            Where does your business stand?
          </h2>
          <p className="mt-3 text-[16px] max-w-[520px] mx-auto" style={{ color: "var(--ink-secondary)" }}>
            Run a free AI Visibility audit and get your score across all five AI models in under 60 seconds.
          </p>
          <Link
            href="/free-audit"
            className="mt-8 h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
            style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}
          >
            Run Free Visibility Audit
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      <MLFooter />
    </div>
  );
}
