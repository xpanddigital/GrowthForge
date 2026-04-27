"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SlotData } from "@/lib/research/study2-data";
import { resolveSlot } from "@/lib/research/study2-data";

type Industry = { id: string; label: string };
type Market = { id: string; label: string };

interface Props {
  industries: Industry[];
  markets: Market[];
  slots: SlotData[];
}

const COLORS = {
  accent: "#3d2be0",
  accentSubtle: "#eeebfc",
  ink: "#1a1a2e",
  inkSecondary: "#555770",
  inkTertiary: "#8e90a6",
  border: "#e5e3df",
  surface: "#ffffff",
  surfaceRaised: "#fcfbf9",
  warm: "#e8723a",
};

const STORAGE_KEY = "ml_research_access_email";

export function ExplorerClient({ industries, markets, slots }: Props) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [industry, setIndustry] = useState("home_services");
  const [market, setMarket] = useState("nyc");

  // Initialize unlock state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setUnlocked(!!stored);
    } catch {
      setUnlocked(false);
    }
  }, []);

  const slotKey = useMemo(() => resolveSlot(industry, market), [industry, market]);
  const slotMap = useMemo(() => {
    const m = new Map<string, SlotData>();
    slots.forEach((s) => m.set(s.slot, s));
    return m;
  }, [slots]);
  const currentSlot = slotKey ? slotMap.get(slotKey) ?? null : null;

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Fire-and-forget — we don't block the unlock if the API is unavailable
      fetch("/api/research/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          referrer: typeof document !== "undefined" ? document.referrer : "",
          surface: "explorer",
        }),
      }).catch(() => {});
      try {
        localStorage.setItem(STORAGE_KEY, email);
      } catch {}
      setUnlocked(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (unlocked === null) {
    // Loading state — render a skeleton so SSR doesn't flash the gate
    return (
      <section className="py-12">
        <div className="max-w-[1100px] mx-auto px-6">
          <div
            style={{
              height: 400,
              background: COLORS.surfaceRaised,
              borderRadius: 16,
              border: `1px solid ${COLORS.border}`,
            }}
          />
        </div>
      </section>
    );
  }

  if (!unlocked) {
    return <EmailGate email={email} setEmail={setEmail} onSubmit={handleUnlock} submitting={submitting} error={error} />;
  }

  return (
    <section className="pt-2 pb-20">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* SELECTORS */}
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            padding: "24px 28px",
            marginBottom: 28,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
          }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Selector
              label="Industry"
              value={industry}
              onChange={setIndustry}
              options={industries.map((i) => ({ value: i.id, label: i.label }))}
            />
            <Selector
              label="Market"
              value={market}
              onChange={setMarket}
              options={markets.map((m) => ({ value: m.id, label: m.label }))}
            />
          </div>
        </div>

        {/* RESULTS */}
        {currentSlot ? (
          <SlotView slot={currentSlot} />
        ) : (
          <NoSlotView industry={industry} market={market} markets={markets} industries={industries} />
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Email gate
// ═══════════════════════════════════════════════════════════════════

function EmailGate({
  email,
  setEmail,
  onSubmit,
  submitting,
  error,
}: {
  email: string;
  setEmail: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-[680px] mx-auto px-6">
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 18,
            border: `1px solid ${COLORS.border}`,
            padding: "36px 32px",
            boxShadow: "0 4px 24px -8px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: COLORS.accent,
              marginBottom: 10,
            }}
          >
            Free · 30 seconds · No spam
          </div>
          <h2
            className="serif"
            style={{
              fontSize: 30,
              lineHeight: 1.15,
              color: COLORS.ink,
              fontFamily: "'Instrument Serif', Georgia, serif",
              marginBottom: 12,
            }}
          >
            Browse the 32-slot research data
          </h2>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.6,
              color: COLORS.inkSecondary,
              marginBottom: 22,
            }}
          >
            Drop your email to unlock the explorer. You&apos;ll see the top 5 predictors, addressable citation share, top cited domains, and visible-vs-invisible profile for any of the 32 industry × market slots in the study. Browse-only — no bulk export, no row-level data.
          </p>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: COLORS.inkTertiary,
              marginBottom: 22,
              padding: "10px 14px",
              background: COLORS.accentSubtle,
              borderRadius: 8,
            }}
          >
            We use your email for: notifying you when Layer 3 results ship, and inviting qualified researchers to apply for full dataset access. That&apos;s it. Unsubscribe anytime.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                flex: 1,
                height: 48,
                padding: "0 16px",
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                fontSize: 15,
                fontFamily: "'Outfit', system-ui, sans-serif",
                color: COLORS.ink,
                background: COLORS.surface,
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.accent)}
              onBlur={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                height: 48,
                padding: "0 28px",
                borderRadius: 10,
                background: COLORS.accent,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                cursor: submitting ? "wait" : "pointer",
                fontFamily: "'Outfit', system-ui, sans-serif",
                boxShadow: "0 2px 8px rgba(61,43,224,0.25)",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Unlocking..." : "Unlock the explorer"}
            </button>
          </form>
          {error && (
            <p style={{ fontSize: 13, color: COLORS.warm, marginTop: 10 }}>{error}</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Slot view
// ═══════════════════════════════════════════════════════════════════

function SlotView({ slot }: { slot: SlotData }) {
  const visibleDir = slot.visible_directory_avg ?? null;
  const invisibleDir = slot.invisible_directory_avg ?? null;
  const visibleReddit = slot.visible_reddit_avg ?? null;
  const invisibleReddit = slot.invisible_reddit_avg ?? null;
  const dirRatio =
    visibleDir && invisibleDir && invisibleDir > 0 ? visibleDir / invisibleDir : null;
  const redditRatio =
    visibleReddit && invisibleReddit && invisibleReddit > 0
      ? visibleReddit / invisibleReddit
      : null;

  const maxR = Math.max(0.01, ...slot.top_predictors.map((p) => Math.abs(p.r)));

  return (
    <div className="space-y-6">
      {/* Title + headline stat */}
      <div
        style={{
          background: COLORS.surface,
          borderRadius: 16,
          border: `1px solid ${COLORS.border}`,
          padding: "28px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 8,
          }}
        >
          Slot stats · {slot.slot}
        </div>
        <h2
          className="serif"
          style={{
            fontSize: 32,
            color: COLORS.ink,
            fontFamily: "'Instrument Serif', Georgia, serif",
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          {slot.label}
        </h2>
        <div className="grid grid-cols-3 gap-6 mt-2">
          <Stat
            value={slot.n_total.toString()}
            label="Businesses"
            sub="enriched in this slot"
          />
          <Stat
            value={slot.n_visible.toString()}
            label="Visible (≥2 models)"
            sub={`${Math.round((slot.n_visible / slot.n_total) * 100)}% of slot`}
          />
          <Stat
            value={`${slot.addressable_share}%`}
            label="Addressable share"
            sub="of AI citations"
            highlight={slot.addressable_share >= 20}
          />
        </div>
      </div>

      {/* Top predictors */}
      <div
        style={{
          background: COLORS.surface,
          borderRadius: 16,
          border: `1px solid ${COLORS.border}`,
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 6,
          }}
        >
          Top 5 predictors
        </div>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.ink,
            marginBottom: 16,
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}
        >
          Strongest signal correlations for this slot
        </h3>
        <div className="space-y-3">
          {slot.top_predictors.map((p, i) => (
            <div key={p.signal}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: COLORS.ink,
                  }}
                >
                  <span style={{ color: COLORS.inkTertiary, marginRight: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    #{i + 1}
                  </span>
                  {p.label}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 12,
                    color: COLORS.accent,
                    fontWeight: 600,
                  }}
                >
                  r = {p.r.toFixed(3)}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: COLORS.accentSubtle,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(Math.abs(p.r) / maxR) * 100}%`,
                    background: p.r < 0 ? COLORS.warm : COLORS.accent,
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visible vs invisible profile */}
      {(visibleDir !== null || visibleReddit !== null) && (
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: COLORS.accent,
              marginBottom: 6,
            }}
          >
            Visible vs invisible profile
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.ink,
              marginBottom: 16,
              fontFamily: "'Outfit', system-ui, sans-serif",
            }}
          >
            What the visible businesses in this slot look like
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {visibleDir !== null && invisibleDir !== null && (
              <ProfileCompare
                metric="Directory presence"
                visible={visibleDir}
                invisible={invisibleDir}
                ratio={dirRatio}
                unit=""
              />
            )}
            {visibleReddit !== null && invisibleReddit !== null && (
              <ProfileCompare
                metric="Reddit mention count"
                visible={visibleReddit}
                invisible={invisibleReddit}
                ratio={redditRatio}
                unit=""
              />
            )}
          </div>
        </div>
      )}

      {/* Top cited domains */}
      {slot.top_cited_domains.length > 0 && (
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: COLORS.accent,
              marginBottom: 6,
            }}
          >
            Top cited domains
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.ink,
              marginBottom: 16,
              fontFamily: "'Outfit', system-ui, sans-serif",
            }}
          >
            Where Perplexity and Google AIO actually pull from
          </h3>
          <div className="space-y-2">
            {slot.top_cited_domains.map((d, i) => (
              <div
                key={d.domain}
                className="flex items-center justify-between"
                style={{
                  padding: "12px 16px",
                  background: COLORS.surfaceRaised,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: COLORS.inkTertiary,
                      width: 18,
                    }}
                  >
                    #{i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: COLORS.ink,
                    }}
                  >
                    {d.domain}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: COLORS.inkSecondary,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {d.count} citations
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA — get YOUR brand on this view */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, #5443e8 100%)",
          borderRadius: 16,
          padding: "28px 32px",
          color: "#fff",
          boxShadow: "0 10px 30px -10px rgba(61,43,224,0.4)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            marginBottom: 8,
          }}
        >
          Run your brand against this benchmark
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 24,
            lineHeight: 1.2,
            color: "#fff",
            fontFamily: "'Instrument Serif', Georgia, serif",
            marginBottom: 12,
          }}
        >
          Where does your brand sit on this slot?
        </h3>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 18,
            maxWidth: 580,
          }}
        >
          Free audit. Drop your domain, we measure your directory count, off-page composite, and top vertical signal — live, against the {slot.label} benchmark.
        </p>
        <Link
          href="/free-audit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 46,
            padding: "0 24px",
            borderRadius: 10,
            background: "#fff",
            color: COLORS.accent,
            fontSize: 14.5,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          Run free audit
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function NoSlotView({
  industry,
  market,
  markets,
  industries,
}: {
  industry: string;
  market: string;
  markets: Market[];
  industries: Industry[];
}) {
  const industryLabel = industries.find((i) => i.id === industry)?.label ?? industry;
  const marketLabel = markets.find((m) => m.id === market)?.label ?? market;
  return (
    <div
      style={{
        background: COLORS.surfaceRaised,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        padding: "40px 32px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 14, color: COLORS.inkTertiary, marginBottom: 8 }}>
        No data for this combination
      </div>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: COLORS.ink,
          marginBottom: 8,
          fontFamily: "'Outfit', system-ui, sans-serif",
        }}
      >
        We didn&apos;t test {industryLabel} in {marketLabel}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: COLORS.inkSecondary,
          maxWidth: 480,
          margin: "0 auto",
          lineHeight: 1.6,
        }}
      >
        Local-services categories were tested in LA + Sydney + NYC + Chicago. National categories (SaaS, financial advisors, hospitality, etc.) only have a national slot. Try a different combination.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Primitives
// ═══════════════════════════════════════════════════════════════════

function Selector({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: COLORS.accent,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 44,
          padding: "0 14px",
          borderRadius: 10,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.surface,
          color: COLORS.ink,
          fontSize: 14.5,
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontWeight: 500,
          cursor: "pointer",
          outline: "none",
          appearance: "none",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238e90a6' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: 36,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Stat({
  value,
  label,
  sub,
  highlight,
}: {
  value: string;
  label: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: highlight ? COLORS.accent : COLORS.ink,
          letterSpacing: "-0.02em",
          fontFamily: "'Outfit', system-ui, sans-serif",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: COLORS.ink,
          marginTop: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12, color: COLORS.inkTertiary, marginTop: 1 }}>
        {sub}
      </div>
    </div>
  );
}

function ProfileCompare({
  metric,
  visible,
  invisible,
  ratio,
  unit,
}: {
  metric: string;
  visible: number;
  invisible: number;
  ratio: number | null;
  unit: string;
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        background: COLORS.surfaceRaised,
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="flex items-baseline justify-between mb-1">
        <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.ink }}>
          {metric}
        </span>
        {ratio !== null && (
          <span
            style={{
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              color: COLORS.accent,
              fontWeight: 600,
            }}
          >
            {ratio.toFixed(1)}x
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-[12px]" style={{ color: COLORS.inkSecondary }}>
        <span>
          Visible{" "}
          <strong style={{ color: COLORS.accent }}>
            {visible.toFixed(2)}
            {unit}
          </strong>
        </span>
        <span style={{ color: COLORS.inkTertiary }}>·</span>
        <span>
          Invisible{" "}
          <strong style={{ color: COLORS.warm }}>
            {invisible.toFixed(2)}
            {unit}
          </strong>
        </span>
      </div>
    </div>
  );
}
