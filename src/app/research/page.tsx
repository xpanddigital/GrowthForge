import type { Metadata } from "next";
import Link from "next/link";
import { MLNav } from "@/components/marketing/ml-nav";
import { MLFooter } from "@/components/marketing/ml-footer";
import {
  studies,
  researchUpdates,
  hubStats,
  crossStudyFindings,
  whitePapers,
  type Study,
  type ResearchUpdate,
  type WhitePaper,
} from "@/lib/research/program";

// Build marker: 2026-04-28 (post-Cloudflare cache invalidation)
export const metadata: Metadata = {
  title: "AI Visibility Index Research Program | MentionLayer",
  description:
    "The AI Visibility Index research program — a quarterly study on which businesses get recommended by AI models, and why. Live findings from 2,729 businesses across 14 industries and 4 markets, plus the controlled intervention trial that proves causation.",
  openGraph: {
    title: "AI Visibility Index Research | MentionLayer",
    description:
      "Quarterly research on AI visibility. 2,729 businesses, 14 industries, 4 markets, 370k+ data points, and counting.",
    type: "website",
    images: ["/api/og?title=AI+Visibility+Index+Research"],
  },
};

const STATUS_TONE: Record<
  Study["status"],
  { label: string; bg: string; fg: string }
> = {
  published: { label: "Published", bg: "rgba(31,157,94,0.12)", fg: "#1f9d5e" },
  "in-recruitment": {
    label: "Recruiting now",
    bg: "rgba(232,114,58,0.12)",
    fg: "#e8723a",
  },
  "in-progress": {
    label: "In progress",
    bg: "rgba(61,43,224,0.12)",
    fg: "#3d2be0",
  },
  planned: {
    label: "Planned",
    bg: "rgba(142,144,166,0.12)",
    fg: "#555770",
  },
};

export default function ResearchHubPage() {
  const studyById = Object.fromEntries(studies.map((s) => [s.id, s]));
  const publishedCount = studies.filter((s) => s.status === "published").length;

  return (
    <div className="ml">
      <MLNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(61,43,224,0.08) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative max-w-[1100px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-[13px] mb-5">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "#1f9d5e",
                  borderRadius: 3,
                  display: "inline-block",
                  boxShadow: "0 0 0 4px rgba(31,157,94,0.18)",
                }}
              />
              Live · {hubStats.cadence}
            </span>
            <span style={{ color: "var(--ink-tertiary)" }}>·</span>
            <span style={{ color: "var(--ink-tertiary)" }}>
              Last updated{" "}
              {new Date(researchUpdates[0]?.date ?? "2026-04-27").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span style={{ color: "var(--ink-tertiary)" }}>·</span>
            <span style={{ color: "var(--ink-tertiary)" }}>
              {hubStats.nextUpdate}
            </span>
          </div>
          <h1
            className="text-[40px] sm:text-[56px] lg:text-[64px] leading-[1.04] tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            The AI Visibility Index
            <br />
            <span style={{ color: "var(--accent)" }}>Research Program</span>
          </h1>
          <p
            className="mt-6 text-[18px] sm:text-[20px] leading-[1.55] max-w-[760px]"
            style={{ color: "var(--ink-secondary)" }}
          >
            A quarterly empirical study on which businesses get recommended by AI models — and why.{" "}
            <strong style={{ color: "var(--ink)" }}>
              {hubStats.totalStudies} studies published
            </strong>
            ,{" "}
            <strong style={{ color: "var(--ink)" }}>
              {hubStats.totalBusinesses.toLocaleString()} businesses analysed
            </strong>
            ,{" "}
            <strong style={{ color: "var(--ink)" }}>
              {hubStats.totalDataPoints} individual mention checks
            </strong>{" "}
            and counting. Built by Joel House (Forbes Agency Council) at MentionLayer. Updated monthly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/free-audit"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
              style={{
                background: "var(--accent)",
                boxShadow: "0 2px 8px rgba(61,43,224,0.25)",
              }}
            >
              Run your brand against the benchmarks
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link
              href="/research/explore"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center gap-2"
              style={{
                border: "1px solid rgba(61,43,224,0.2)",
                color: "var(--accent)",
              }}
            >
              Explore the data
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ HUB STATS BAND ═══ */}
      <section
        className="py-10 sm:py-12"
        style={{ background: "var(--surface-raised)" }}
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                v: publishedCount.toString(),
                l: "Studies published",
                s: `${studies.length - publishedCount} more in the pipeline`,
              },
              {
                v: hubStats.totalBusinesses.toLocaleString(),
                l: "Businesses analysed",
                s: "across both studies",
              },
              {
                v: hubStats.totalDataPoints,
                l: "Mention checks",
                s: "individual data points",
              },
              {
                v: hubStats.totalIndustryCitySlots.toString(),
                l: "Industry × market slots",
                s: "in the live explorer",
              },
            ].map((stat) => (
              <div
                key={stat.l}
                className="rounded-2xl p-5"
                style={{
                  background: "var(--surface)",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="text-[30px] sm:text-[36px] font-semibold tracking-tight"
                  style={{
                    color: "var(--accent)",
                    fontFamily: "'Outfit', system-ui, sans-serif",
                  }}
                >
                  {stat.v}
                </div>
                <div
                  className="mt-1 text-[13.5px] font-medium"
                  style={{ color: "var(--ink)" }}
                >
                  {stat.l}
                </div>
                <div
                  className="text-[12px]"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  {stat.s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MISSION ═══ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[820px] mx-auto px-6">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
            }}
          >
            The mission
          </div>
          <h2
            className="text-[28px] sm:text-[36px] tracking-tight mb-5"
            style={{ color: "var(--ink)", lineHeight: 1.15 }}
          >
            We&apos;re running the largest, most rigorous public study on AI visibility — and re-running it every quarter.
          </h2>
          <p
            className="text-[17px] leading-[1.65] mb-4"
            style={{ color: "var(--ink-secondary)" }}
          >
            AI search is rewriting how businesses get found. ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews now mediate billions of buying-intent queries per month — and the rules for being recommended are completely different from classical SEO.
          </p>
          <p
            className="text-[17px] leading-[1.65] mb-4"
            style={{ color: "var(--ink-secondary)" }}
          >
            Most published GEO advice is built on case studies of N=1, hot takes from a single account, or rebranded SEO playbooks. We wanted to know what actually moves AI visibility — across thousands of businesses, multiple verticals and markets, with statistical controls strong enough to hold up under attack.
          </p>
          <p
            className="text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            So we built a research program. <strong style={{ color: "var(--ink)" }}>Same sample, same methodology, re-run quarterly.</strong> Each study layer adds a deeper question on top of the last. Findings published whether they validate our product or not.
          </p>
          <div
            style={{
              marginTop: 28,
              padding: "20px 24px",
              borderRadius: 12,
              background: "var(--accent-subtle)",
              borderLeft: "3px solid var(--accent)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 6,
              }}
            >
              Data posture
            </div>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              <strong>Findings are public. Methodology is public. Per-slot statistics are public. Individual brand lookup is free.</strong> The 2,729-row underlying dataset is licensed to research partners under NDA — same posture as Pew, MIT Tech Review, Backlinko, GitHub Octoverse.{" "}
              <a
                href="mailto:joel@xpanddigital.io?subject=Research%20access%20application"
                style={{
                  color: "var(--accent)",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(61,43,224,0.3)",
                  textUnderlineOffset: 3,
                }}
              >
                Apply for full access →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CROSS-STUDY HEADLINE FINDINGS ═══ */}
      <section
        className="py-16 sm:py-20"
        style={{ background: "var(--surface-raised)" }}
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              The headlines so far
            </div>
            <h2
              className="text-[30px] sm:text-[40px] tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Six findings that will outlive the studies
            </h2>
            <p
              className="mt-3 text-[16px] max-w-[600px] mx-auto"
              style={{ color: "var(--ink-secondary)" }}
            >
              Pulled from across the published studies. Click any card to read the full evidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crossStudyFindings.map((f, i) => {
              const study = studyById[f.studyId];
              return (
                <Link
                  key={i}
                  href={study?.href ?? "#"}
                  className="block rounded-2xl p-6 transition-transform hover:-translate-y-px"
                  style={{
                    background: "var(--surface)",
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
                    border: "1px solid var(--accent-subtle)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      marginBottom: 10,
                    }}
                  >
                    Study {study?.number ?? "?"} · {f.metric}
                  </div>
                  <p
                    className="serif"
                    style={{
                      fontSize: 17,
                      lineHeight: 1.4,
                      color: "var(--ink)",
                      fontFamily:
                        "'Instrument Serif', Georgia, 'Times New Roman', serif",
                      letterSpacing: "-0.01em",
                      marginBottom: 14,
                    }}
                  >
                    &ldquo;{f.text}&rdquo;
                  </p>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--accent)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Read the study
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ PUBLISHED PAPERS ═══ */}
      <section id="papers" className="py-16 sm:py-20">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="mb-10">
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              Published academic-format papers
            </div>
            <h2
              className="text-[30px] sm:text-[40px] tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              White papers
            </h2>
            <p
              className="mt-3 text-[16px] max-w-[660px]"
              style={{ color: "var(--ink-secondary)" }}
            >
              The findings of each study, repackaged in formal academic register — abstract, methodology, results, discussion, limitations, references. Cite these versions in research, journalism, and analyst work.
            </p>
          </div>

          <div className="space-y-5">
            {whitePapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STUDIES TIMELINE ═══ */}
      <section className="py-16 sm:py-20" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              The study program
            </div>
            <h2
              className="text-[30px] sm:text-[40px] tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Phase 1 → 2 → 3 → 4 — and beyond
            </h2>
            <p
              className="mt-3 text-[16px] max-w-[600px] mx-auto"
              style={{ color: "var(--ink-secondary)" }}
            >
              Each study layer answers a question the previous one couldn&apos;t.
            </p>
          </div>

          <div className="space-y-4">
            {studies.map((s) => (
              <StudyTimelineCard key={s.id} study={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MONTHLY UPDATES (CHANGELOG) ═══ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[820px] mx-auto px-6">
          <div className="mb-10">
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              Updates
            </div>
            <h2
              className="text-[30px] sm:text-[40px] tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              What&apos;s new in the research
            </h2>
            <p
              className="mt-3 text-[16px]"
              style={{ color: "var(--ink-secondary)" }}
            >
              Every release, milestone, and operational note. Newest first. Updated monthly.
            </p>
          </div>

          <ol className="space-y-2" style={{ listStyle: "none", padding: 0 }}>
            {researchUpdates.map((u, i) => (
              <UpdateCard key={i} update={u} />
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ SUBSCRIBE / CTA ═══ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[920px] mx-auto px-6">
          <div
            style={{
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #2a2547 100%)",
              borderRadius: 20,
              padding: "44px 40px",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 280,
                height: 280,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(122,109,240,0.32) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#a59cf2",
                  marginBottom: 12,
                }}
              >
                Three ways to plug in
              </div>
              <h2
                className="serif"
                style={{
                  fontSize: 32,
                  lineHeight: 1.15,
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  marginBottom: 14,
                }}
              >
                Get on the research distribution list
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.9)",
                  marginBottom: 24,
                  maxWidth: 600,
                }}
              >
                Each new study, each monthly update, and every Layer 3 result lands first with people on the research distribution list. Early access, no spam, unsubscribe anytime.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <SubscribeCard
                  title="Run your brand"
                  body="Free · 60 sec · benchmarks live"
                  cta="Run free audit"
                  href="/free-audit"
                  primary
                />
                <SubscribeCard
                  title="Explore the data"
                  body="Email · 30 industry × city slots"
                  cta="Open the explorer"
                  href="/research/explore"
                />
                <SubscribeCard
                  title="Layer 3 trial"
                  body="25–30 spots · 60-day intervention"
                  cta="Apply now"
                  href="mailto:joel@xpanddigital.io?subject=Layer%203%20trial%20application"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT THE AUTHOR ═══ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[820px] mx-auto px-6">
          <div
            style={{
              padding: "24px 28px",
              borderRadius: 16,
              border: "1px solid var(--accent-subtle)",
              background: "var(--surface-raised)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                JH
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--ink)",
                    marginBottom: 4,
                  }}
                >
                  Joel House
                </div>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: "var(--ink-secondary)",
                    marginBottom: 8,
                  }}
                >
                  Founder of MentionLayer (GEO platform). Founder of Joel House Search Media (one of Australia&apos;s largest SEO agencies by headcount). Forbes Agency Council. The research program is funded by MentionLayer and runs as an independent quarterly study — Joel publishes findings whether they validate our product or not.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                  <a
                    href="mailto:joel@xpanddigital.io"
                    style={{
                      color: "var(--accent)",
                      fontWeight: 500,
                    }}
                  >
                    joel@xpanddigital.io
                  </a>
                  <span style={{ color: "var(--ink-tertiary)" }}>·</span>
                  <span style={{ color: "var(--ink-tertiary)" }}>
                    Sydney + Los Angeles
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MLFooter />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Components
// ═══════════════════════════════════════════════════════════════════

function StudyTimelineCard({ study: s }: { study: Study }) {
  const tone = STATUS_TONE[s.status];
  const isLinkable = !!s.href;
  const Wrapper = isLinkable ? Link : "div";
  const wrapperProps = isLinkable ? { href: s.href as string } : {};

  return (
    <Wrapper
      {...(wrapperProps as { href: string })}
      className="block rounded-2xl p-6 sm:p-7 transition-transform"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--accent-subtle)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        textDecoration: "none",
        ...(isLinkable ? { cursor: "pointer" } : {}),
      }}
    >
      <div className="flex items-start gap-5">
        {/* Number bubble */}
        <div
          style={{
            flexShrink: 0,
            width: 56,
            height: 56,
            borderRadius: 16,
            background: s.status === "published" ? "var(--accent)" : "var(--accent-subtle)",
            color: s.status === "published" ? "#fff" : "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          {s.number}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 999,
                background: tone.bg,
                color: tone.fg,
              }}
            >
              {tone.label}
            </span>
            <span style={{ color: "var(--ink-tertiary)", fontSize: 13 }}>·</span>
            <span style={{ color: "var(--ink-tertiary)", fontSize: 13 }}>
              {s.date}
            </span>
          </div>

          <h3
            className="serif"
            style={{
              fontSize: 24,
              lineHeight: 1.2,
              color: "var(--ink)",
              fontFamily: "'Instrument Serif', Georgia, serif",
              marginBottom: 6,
            }}
          >
            Study {s.number} — {s.title}
          </h3>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: "var(--ink-secondary)",
              marginBottom: 14,
            }}
          >
            {s.subtitle}
          </p>

          <div
            style={{
              padding: "12px 16px",
              background: "var(--surface-raised)",
              borderRadius: 10,
              borderLeft: "3px solid var(--accent)",
              marginBottom: 14,
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--ink)",
              fontStyle: "italic",
              fontFamily: "'Instrument Serif', Georgia, serif",
            }}
          >
            {s.headlineFinding}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3">
            {s.stats.map((st) => (
              <div key={st.label}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--accent)",
                    fontFamily: "'Outfit', system-ui, sans-serif",
                  }}
                >
                  {st.value}
                </span>{" "}
                <span style={{ fontSize: 12, color: "var(--ink-tertiary)" }}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          {isLinkable && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--accent)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Read the study
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
          )}
          {!isLinkable && s.status === "in-recruitment" && (
            <a
              href="mailto:joel@xpanddigital.io?subject=Layer%203%20trial%20interest"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#e8723a",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Apply for the trial
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          )}
          {!isLinkable && s.status === "planned" && (
            <span style={{ fontSize: 13, color: "var(--ink-tertiary)" }}>
              On the roadmap. Subscribe to be notified when it ships.
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

const KIND_LABELS: Record<ResearchUpdate["kind"], string> = {
  "study-published": "Study published",
  milestone: "Milestone",
  explorer: "New tool",
  press: "Press",
  operations: "Ops",
};

const KIND_COLORS: Record<ResearchUpdate["kind"], string> = {
  "study-published": "#1f9d5e",
  milestone: "#e8723a",
  explorer: "#3d2be0",
  press: "#7a6df0",
  operations: "#8e90a6",
};

function UpdateCard({ update: u }: { update: ResearchUpdate }) {
  const dateObj = new Date(u.date);
  const dateLabel = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <li
      style={{
        position: "relative",
        padding: "20px 24px",
        background: "var(--surface)",
        borderRadius: 14,
        border: "1px solid var(--accent-subtle)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-tertiary)",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              marginBottom: 4,
              minWidth: 92,
            }}
          >
            {dateLabel}
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: KIND_COLORS[u.kind],
            }}
          >
            {KIND_LABELS[u.kind]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3
            style={{
              fontSize: 16.5,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 6,
              fontFamily: "'Outfit', system-ui, sans-serif",
              lineHeight: 1.3,
            }}
          >
            {u.title}
          </h3>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink-secondary)",
              marginBottom: u.href ? 8 : 0,
            }}
          >
            {u.body}
          </p>
          {u.href && (
            <a
              href={u.href}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--accent)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                textDecoration: "none",
              }}
            >
              {u.hrefLabel ?? "Open"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  PaperCard — academic-publication-style listing
// ═══════════════════════════════════════════════════════════════════

function PaperCard({ paper }: { paper: WhitePaper }) {
  return (
    <article
      style={{
        background: "var(--surface)",
        borderRadius: 14,
        border: "1px solid var(--accent-subtle)",
        padding: "26px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 999,
            background: "var(--accent-subtle)",
            color: "var(--accent)",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          }}
        >
          Paper {paper.number} · v{paper.version}
        </span>
        <span style={{ color: "var(--ink-tertiary)", fontSize: 13 }}>·</span>
        <span style={{ color: "var(--ink-tertiary)", fontSize: 13 }}>
          {paper.date}
        </span>
        <span style={{ color: "var(--ink-tertiary)", fontSize: 13 }}>·</span>
        <span style={{ color: "var(--ink-tertiary)", fontSize: 13 }}>
          ~{paper.pageCount} pages · {paper.wordCount.toLocaleString()} words
        </span>
      </div>

      <h3
        className="serif"
        style={{
          fontSize: 22,
          lineHeight: 1.25,
          color: "var(--ink)",
          fontFamily: "'Instrument Serif', Georgia, serif",
          marginBottom: 6,
          letterSpacing: "-0.01em",
        }}
      >
        {paper.title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-secondary)",
          marginBottom: 12,
          fontStyle: "italic",
        }}
      >
        {paper.subtitle}
      </p>

      <div
        style={{
          padding: "14px 18px",
          background: "var(--surface-raised)",
          borderRadius: 10,
          borderLeft: "3px solid var(--accent)",
          marginBottom: 16,
          fontSize: 13.5,
          lineHeight: 1.65,
          color: "var(--ink)",
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 6,
          }}
        >
          Abstract excerpt
        </div>
        {paper.abstractExcerpt}
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--ink-tertiary)",
          marginBottom: 16,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          padding: "10px 14px",
          background: "var(--accent-subtle)",
          borderRadius: 8,
          lineHeight: 1.55,
        }}
      >
        <span style={{ fontWeight: 600 }}>Cite as:</span> {paper.citation}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {paper.formats.map((f) => (
          <a
            key={f.format}
            href={f.href}
            download
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 18px",
              borderRadius: 8,
              background: f.format === "pdf" ? "var(--accent)" : "var(--surface)",
              color: f.format === "pdf" ? "#fff" : "var(--accent)",
              border: f.format === "pdf" ? "none" : "1px solid var(--accent)",
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow:
                f.format === "pdf"
                  ? "0 2px 8px rgba(61,43,224,0.25)"
                  : "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download {f.format.toUpperCase()}
            <span style={{ fontSize: 11, opacity: 0.75, fontFamily: "'JetBrains Mono', monospace" }}>
              {(f.bytes / 1024).toFixed(0)} KB
            </span>
          </a>
        ))}
        {paper.studyIds.length > 0 && (
          <Link
            href={`/research/${paper.studyIds[0]}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--accent)",
              textDecoration: "none",
              marginLeft: "auto",
            }}
          >
            View web version
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </article>
  );
}

function SubscribeCard({
  title,
  body,
  cta,
  href,
  primary,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "18px 20px",
        borderRadius: 12,
        background: primary ? "#fff" : "rgba(255,255,255,0.08)",
        color: primary ? "#1a1a2e" : "#fff",
        textDecoration: "none",
        transition: "transform 0.15s ease",
        border: primary ? "none" : "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <div
        style={{
          fontSize: 14.5,
          fontWeight: 600,
          marginBottom: 4,
          color: primary ? "#1a1a2e" : "#fff",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: primary ? "rgba(26,26,46,0.7)" : "rgba(255,255,255,0.7)",
          marginBottom: 12,
        }}
      >
        {body}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: primary ? "var(--accent)" : "#a59cf2",
          marginTop: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {cta}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </div>
    </a>
  );
}
