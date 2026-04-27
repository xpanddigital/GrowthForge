"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  topRawCorrelations,
  redditDeepDive,
  citationLift,
  directoryLiftByDAQuartile,
  industryAddressability,
  strictIsolation,
  visibleVsInvisible,
  profileMetrics,
  sourceCategoryBreakdown,
  crossMarketSpotlight,
} from "@/lib/research/study2-data";

// Design system colors
const COLORS = {
  accent: "#3d2be0",
  accentLight: "#7a6df0",
  accentSubtle: "#eeebfc",
  warm: "#e8723a",
  warmLight: "#f4a373",
  ink: "#1a1a2e",
  inkSecondary: "#555770",
  inkTertiary: "#8e90a6",
  border: "#e5e3df",
  surface: "#ffffff",
  surfaceRaised: "#fcfbf9",
  green: "#1f9d5e",
  red: "#c4423a",
  amber: "#d97706",
};

// Color a bar by signal layer
function layerColor(layer: string): string {
  switch (layer) {
    case "offpage":
      return COLORS.accent;
    case "study1":
      return COLORS.warm;
    case "spyfu":
      return COLORS.amber;
    default:
      return COLORS.inkTertiary;
  }
}

const cardStyle = {
  background: COLORS.surface,
  borderRadius: "16px",
  padding: "32px 28px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
  border: `1px solid ${COLORS.border}`,
};

const labelStyle = {
  color: COLORS.inkSecondary,
  fontSize: 13,
  fontFamily: "'Outfit', system-ui, sans-serif",
};

// ═══════════════════════════════════════════════════════════════════
//  CHART 1 — The Reddit Collapse (THE money chart)
// ═══════════════════════════════════════════════════════════════════

export function RedditCollapseChart() {
  const data = redditDeepDive.map((d) => ({
    label: d.short,
    fullLabel: d.stage,
    r: d.r,
    n: d.n,
    fill: d.r === 0 ? COLORS.red : d.r < 0.1 ? COLORS.warm : COLORS.accent,
  }));

  return (
    <div style={cardStyle}>
      <div className="mb-2 flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: COLORS.accent,
              marginBottom: 4,
            }}
          >
            The contrarian centerpiece
          </div>
          <h3
            className="serif"
            style={{
              fontSize: 26,
              color: COLORS.ink,
              fontFamily: "'Instrument Serif', Georgia, serif",
              lineHeight: 1.15,
            }}
          >
            Reddit&apos;s predictive power collapses under controls
          </h3>
        </div>
        <div style={{ ...labelStyle, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
          n=2,545 (full); n=795 (strictest)
        </div>
      </div>
      <p
        style={{
          color: COLORS.inkSecondary,
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 24,
          maxWidth: 720,
        }}
      >
        Reddit&apos;s raw correlation with AI visibility is real (r=0.333). Add controls and it falls off a cliff. By the time we control for whether the same brand also shows up on Wikipedia, LinkedIn, BBB, Yelp, Trustpilot, GBP, YouTube, Crunchbase, and Quora —{" "}
        <strong style={{ color: COLORS.red }}>
          Reddit&apos;s independent contribution is statistically zero.
        </strong>
      </p>
      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 24, right: 24, bottom: 60, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={70}
            />
            <YAxis
              domain={[0, 0.4]}
              tick={{ fontSize: 12, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              label={{
                value: "Pearson r",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: COLORS.inkTertiary },
              }}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(v: number) => [`r = ${v.toFixed(3)}`, "Reddit correlation"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel || label}
            />
            <Bar dataKey="r" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div
        className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3"
        style={{ fontSize: 12 }}
      >
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSecondary }}>
          <span style={{ width: 10, height: 10, background: COLORS.accent, borderRadius: 2 }} />
          Strong correlation (r ≥ 0.10)
        </div>
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSecondary }}>
          <span style={{ width: 10, height: 10, background: COLORS.warm, borderRadius: 2 }} />
          Marginal (0 &lt; r &lt; 0.10)
        </div>
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSecondary }}>
          <span style={{ width: 10, height: 10, background: COLORS.red, borderRadius: 2 }} />
          Zero independent effect
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CHART 2 — Top 16 Raw Correlations (the new top of the table)
// ═══════════════════════════════════════════════════════════════════

export function TopCorrelationsChart() {
  const data = [...topRawCorrelations]
    .sort((a, b) => b.r - a.r)
    .map((c) => ({
      label: c.label,
      r: c.r,
      n: c.n,
      layer: c.layer,
      isNew: c.isNew,
      fill: layerColor(c.layer),
    }));

  return (
    <div style={cardStyle}>
      <div className="mb-2">
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 4,
          }}
        >
          Finding 1 · The new top of the table
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 26,
            color: COLORS.ink,
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.15,
          }}
        >
          Off-page signals dethrone Domain Authority
        </h3>
      </div>
      <p
        style={{
          color: COLORS.inkSecondary,
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        Raw Pearson correlations vs. visibility_score across 2,648 businesses. Four off-page signals now sit ahead of Domain Authority. Six are ahead of Google review count.
      </p>
      <div style={{ width: "100%", height: 540 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 56, bottom: 8, left: 200 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 0.45]}
              tick={{ fontSize: 11, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11.5, fill: COLORS.ink }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              width={195}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(v: number, _: unknown, p: { payload?: { n?: number } }) => [
                `r = ${v.toFixed(3)}  (n = ${p.payload?.n?.toLocaleString() ?? "?"})`,
                "Correlation",
              ]}
            />
            <Bar dataKey="r" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
            <ReferenceLine x={0.338} stroke={COLORS.warm} strokeDasharray="4 4" label={{ value: "DA threshold (0.338)", fill: COLORS.warm, fontSize: 11, position: "top" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-4" style={{ fontSize: 12 }}>
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSecondary }}>
          <span style={{ width: 10, height: 10, background: COLORS.accent, borderRadius: 2 }} />
          Off-page (Layer 2 · new this study)
        </div>
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSecondary }}>
          <span style={{ width: 10, height: 10, background: COLORS.amber, borderRadius: 2 }} />
          SpyFu (Layer 2 · new)
        </div>
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSecondary }}>
          <span style={{ width: 10, height: 10, background: COLORS.warm, borderRadius: 2 }} />
          Study 1 baseline
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CHART 3 — DA-quartile directory lift
// ═══════════════════════════════════════════════════════════════════

export function DAQuartileLiftChart() {
  const data = directoryLiftByDAQuartile.map((q) => ({
    label: `${q.quartile} (${q.daRange})`,
    "Below-median directory presence": q.lowDir,
    "Above-median directory presence": q.highDir,
    delta: q.delta,
  }));

  return (
    <div style={cardStyle}>
      <div className="mb-2">
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 4,
          }}
        >
          Finding 4 · Directories as a force multiplier
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 26,
            color: COLORS.ink,
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.15,
          }}
        >
          +16 visibility points in the top DA quartile
        </h3>
      </div>
      <p
        style={{
          color: COLORS.inkSecondary,
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        Within each Domain Authority quartile, businesses with above-median directory presence vs. below-median. The compounding kicks in only when underlying authority is already there.
      </p>
      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 24, right: 24, bottom: 50, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              label={{
                value: "Avg visibility score",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: COLORS.inkTertiary },
              }}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Below-median directory presence" fill={COLORS.warm} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Above-median directory presence" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          marginTop: 12,
          padding: "12px 16px",
          background: COLORS.accentSubtle,
          borderRadius: 10,
          fontSize: 13,
          color: COLORS.ink,
        }}
      >
        <strong>Q4 lift: +16.3 visibility points.</strong> If your DA is in the top quartile and your directory stack is below median, you&apos;re leaving roughly 16 points of AI visibility on the table.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CHART 4 — Industry × city addressability
// ═══════════════════════════════════════════════════════════════════

export function AddressabilityChart() {
  const data = [...industryAddressability]
    .sort((a, b) => b.addressableShare - a.addressableShare)
    .map((d) => ({
      label: `${d.label} — ${d.market}`,
      pct: Number((d.addressableShare * 100).toFixed(1)),
      market: d.market,
      fill: d.market === "Sydney"
        ? COLORS.warm
        : d.market === "National"
          ? COLORS.accentLight
          : COLORS.accent,
    }));

  return (
    <div style={cardStyle}>
      <div className="mb-2">
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 4,
          }}
        >
          Finding 5 · The 26x leverage gap
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 26,
            color: COLORS.ink,
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.15,
          }}
        >
          Off-page leverage by industry × market
        </h3>
      </div>
      <p
        style={{
          color: COLORS.inkSecondary,
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        Percentage of AI citations sourced from MentionLayer-addressable surfaces (forums + directories + YouTube + review sites) per industry-city slot. Off-page intervention has roughly 26x more leverage in SaaS CRM than in Med Spa.
      </p>
      <div style={{ width: "100%", height: 720 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 60, bottom: 8, left: 220 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 32]}
              tick={{ fontSize: 11, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: COLORS.ink }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              width={215}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(v: number) => [`${v}% addressable`, "Citation share"]}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10.5, fill: COLORS.inkSecondary, formatter: (v: number) => `${v}%` }}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-4" style={{ fontSize: 12 }}>
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSecondary }}>
          <span style={{ width: 10, height: 10, background: COLORS.accent, borderRadius: 2 }} />
          US local market
        </div>
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSecondary }}>
          <span style={{ width: 10, height: 10, background: COLORS.accentLight, borderRadius: 2 }} />
          National (US-centric)
        </div>
        <div className="flex items-center gap-2" style={{ color: COLORS.inkSecondary }}>
          <span style={{ width: 10, height: 10, background: COLORS.warm, borderRadius: 2 }} />
          Sydney
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CHART 5 — Visible vs Invisible Profile (radar chart)
// ═══════════════════════════════════════════════════════════════════

export function VisibleVsInvisibleRadar() {
  const data = profileMetrics.map((m) => ({
    metric: m.metric,
    Visible: Math.round((m.visibleVal / m.max) * 100),
    Invisible: Math.round((m.invisibleVal / m.max) * 100),
    visibleRaw: m.visibleVal,
    invisibleRaw: m.invisibleVal,
    format: m.format,
    max: m.max,
  }));

  return (
    <div style={cardStyle}>
      <div className="mb-2">
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 4,
          }}
        >
          The self-audit
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 26,
            color: COLORS.ink,
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.15,
          }}
        >
          Visible vs invisible — where do you sit?
        </h3>
      </div>
      <p
        style={{
          color: COLORS.inkSecondary,
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        Average profile of multi-model-visible businesses (n=401) vs. invisible businesses (n=1,841). Run your own brand against these benchmarks. Visible brands carry roughly 2.3x more directories, 2.3x more Reddit mentions, and 2.5x more Wikipedia/Crunchbase coverage.
      </p>
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div style={{ width: "100%", height: 380 }}>
          <ResponsiveContainer>
            <RadarChart data={data}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 11, fill: COLORS.ink }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: COLORS.inkTertiary }}
                tickFormatter={(v) => `${v}%`}
              />
              <Radar
                name="Visible (≥2 models)"
                dataKey="Visible"
                stroke={COLORS.accent}
                fill={COLORS.accent}
                fillOpacity={0.4}
              />
              <Radar
                name="Invisible (0 models)"
                dataKey="Invisible"
                stroke={COLORS.warm}
                fill={COLORS.warm}
                fillOpacity={0.3}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Tooltip
                contentStyle={{
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
                formatter={(_: number, name: string, p: { payload?: { metric?: string; visibleRaw?: number; invisibleRaw?: number; format?: "raw" | "pct" } }) => {
                  const isVisible = name === "Visible (≥2 models)";
                  const raw = isVisible ? p.payload?.visibleRaw : p.payload?.invisibleRaw;
                  const fmt = p.payload?.format === "pct" ? `${raw}%` : raw?.toFixed(2);
                  return [fmt, p.payload?.metric];
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {profileMetrics.map((m) => {
            const ratio = m.visibleVal / m.invisibleVal;
            const display = m.format === "pct" ? "%" : "";
            return (
              <div
                key={m.metric}
                style={{
                  padding: "14px 16px",
                  background: COLORS.surfaceRaised,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.ink }}>
                    {m.metric}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      color: COLORS.accent,
                      fontWeight: 600,
                    }}
                  >
                    {ratio.toFixed(1)}x
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12px]" style={{ color: COLORS.inkSecondary }}>
                  <span>
                    Visible{" "}
                    <strong style={{ color: COLORS.accent }}>
                      {m.visibleVal.toFixed(m.format === "pct" ? 1 : 2)}{display}
                    </strong>
                  </span>
                  <span style={{ color: COLORS.inkTertiary }}>·</span>
                  <span>
                    Invisible{" "}
                    <strong style={{ color: COLORS.warm }}>
                      {m.invisibleVal.toFixed(m.format === "pct" ? 1 : 2)}{display}
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CHART 6 — Citation lift on the models that cite
// ═══════════════════════════════════════════════════════════════════

export function CitationLiftChart() {
  const data = citationLift
    .filter((m) => m.apiReturnsSources)
    .map((m) => ({
      model: m.model,
      "When cited as a source": Number(((m.pMentionGivenCited ?? 0) * 100).toFixed(2)),
      "When NOT cited": Number(((m.pMentionGivenNotCited ?? 0) * 100).toFixed(2)),
      lift: m.lift,
    }));

  return (
    <div style={cardStyle}>
      <div className="mb-2">
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 4,
          }}
        >
          Finding 3 · Be the URL the AI cites
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 26,
            color: COLORS.ink,
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.15,
          }}
        >
          5.5x lift when Perplexity cites you as a source
        </h3>
      </div>
      <p
        style={{
          color: COLORS.inkSecondary,
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        Probability that a brand is mentioned in a response, conditional on whether its URL was cited as a source. Only Perplexity and Google AI Overview return source URLs in their APIs. ChatGPT, Claude, and Gemini do not — making this finding untestable for those models.
      </p>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 24, right: 24, bottom: 16, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis
              dataKey="model"
              tick={{ fontSize: 13, fill: COLORS.ink, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              tickFormatter={(v) => `${v}%`}
              label={{
                value: "P(brand mentioned)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: COLORS.inkTertiary },
              }}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(v: number) => [`${v}%`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="When NOT cited" fill={COLORS.warm} radius={[4, 4, 0, 0]} />
            <Bar dataKey="When cited as a source" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div
          style={{
            padding: "12px 16px",
            background: COLORS.accentSubtle,
            borderRadius: 10,
            fontSize: 13,
            color: COLORS.ink,
          }}
        >
          <strong style={{ color: COLORS.accent }}>Perplexity: 5.5x lift</strong>
          <div style={{ color: COLORS.inkSecondary, marginTop: 2 }}>
            n=76,457 responses · phi = 0.167
          </div>
        </div>
        <div
          style={{
            padding: "12px 16px",
            background: COLORS.surfaceRaised,
            borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
            fontSize: 13,
            color: COLORS.ink,
          }}
        >
          <strong style={{ color: COLORS.accent }}>Google AIO: 4.1x lift</strong>
          <div style={{ color: COLORS.inkSecondary, marginTop: 2 }}>
            n=29,379 responses · phi = 0.018
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          padding: "12px 16px",
          background: "#fdf3f1",
          borderRadius: 10,
          fontSize: 13,
          color: COLORS.ink,
          border: `1px solid ${COLORS.warmLight}`,
        }}
      >
        <strong>ChatGPT, Claude, Gemini APIs return zero source URLs.</strong>{" "}
        <span style={{ color: COLORS.inkSecondary }}>
          The &quot;be in the threads ChatGPT cites&quot; claim is literally untestable from API data. Anyone confidently asserting otherwise is using a different data source — or making it up.
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CHART 7 — Where AI actually pulls from (source category breakdown)
// ═══════════════════════════════════════════════════════════════════

export function SourceCategoryChart() {
  const data = sourceCategoryBreakdown
    .filter((d) => d.count > 0)
    .map((d) => ({
      label: d.category,
      pct: d.pct,
      count: d.count,
    }));

  return (
    <div style={cardStyle}>
      <div className="mb-2">
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 4,
          }}
        >
          Where the citations actually come from
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 26,
            color: COLORS.ink,
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.15,
          }}
        >
          AI cites editorial blogs first, Reddit zero
        </h3>
      </div>
      <p
        style={{
          color: COLORS.inkSecondary,
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        Reverse-classification of every URL Perplexity and Google AIO cited in our 95,000+ Study 1 responses, into 16 source-type categories. Reddit&apos;s share of citations:{" "}
        <strong style={{ color: COLORS.red }}>0.0%</strong>. Quora: 0.02%. The discourse and the data have been disagreeing for a year.
      </p>
      <div style={{ width: "100%", height: 380 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 60, bottom: 8, left: 200 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 80]}
              tick={{ fontSize: 11, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12, fill: COLORS.ink }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              width={195}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(v: number, _: unknown, p: { payload?: { count?: number } }) => [
                `${v}%  (${p.payload?.count?.toLocaleString() ?? "?"} citations)`,
                "Share",
              ]}
            />
            <Bar dataKey="pct" fill={COLORS.accent} radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11, fill: COLORS.inkSecondary, formatter: (v: number) => `${v}%` }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CHART 8 — Cross-market spotlight (which signal wins where)
// ═══════════════════════════════════════════════════════════════════

export function CrossMarketChart() {
  const data = crossMarketSpotlight.map((d) => ({
    label: `${d.label}\n(${d.signal})`,
    short: `${d.label}: ${d.signal.replace(/_/g, " ")}`,
    r: d.r,
    insight: d.insight,
  }));

  return (
    <div style={cardStyle}>
      <div className="mb-2">
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 4,
          }}
        >
          Finding 6 · Cross-market spotlight
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 26,
            color: COLORS.ink,
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.15,
          }}
        >
          The dominant signal changes per industry × market
        </h3>
      </div>
      <p
        style={{
          color: COLORS.inkSecondary,
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        Top single-signal correlations within specific industry-city slots. NYC plumbing has the strongest off-page correlation in the entire study (r=0.683). NYC accounting is Quora-dominated. LA real estate is the one Reddit-led market.
      </p>
      <div style={{ width: "100%", height: 380 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 80, bottom: 8, left: 220 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 0.75]}
              tick={{ fontSize: 11, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
            />
            <YAxis
              type="category"
              dataKey="short"
              tick={{ fontSize: 11, fill: COLORS.ink }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              width={215}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 13,
                maxWidth: 360,
              }}
              formatter={(v: number, _: unknown, p: { payload?: { insight?: string } }) => [
                `r = ${v.toFixed(3)}`,
                p.payload?.insight ?? "",
              ]}
            />
            <Bar dataKey="r" fill={COLORS.accent} radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11, fill: COLORS.inkSecondary, formatter: (v: number) => `r=${v.toFixed(3)}` }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CHART 9 — Strict isolation (small dot plot)
// ═══════════════════════════════════════════════════════════════════

export function StrictIsolationChart() {
  const data = [...strictIsolation]
    .sort((a, b) => b.r - a.r)
    .map((d) => ({
      label: d.label,
      r: d.r,
      isHero: d.isHero,
      fill: d.feature === "reddit_mention_count" ? COLORS.red : d.r > 0 ? COLORS.accent : COLORS.warm,
    }));

  return (
    <div style={cardStyle}>
      <div className="mb-2">
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COLORS.accent,
            marginBottom: 4,
          }}
        >
          Finding 7 · Strict isolation, off-page-only controls
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 26,
            color: COLORS.ink,
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.15,
          }}
        >
          No single off-page signal exceeds r=0.10
        </h3>
      </div>
      <p
        style={{
          color: COLORS.inkSecondary,
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        OLS-residual partial correlation for each off-page signal, controlling for every other off-page feature simultaneously (n=2,545). Not Reddit, not BBB, not Wikipedia, not LinkedIn — no individual platform is the secret. The system is the secret.
      </p>
      <div style={{ width: "100%", height: 460 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 60, bottom: 8, left: 180 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis
              type="number"
              domain={[-0.1, 0.12]}
              tick={{ fontSize: 11, fill: COLORS.inkSecondary }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: COLORS.ink }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              width={175}
            />
            <Tooltip
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(v: number) => [`r = ${v.toFixed(3)}`, "Strict isolated"]}
            />
            <ReferenceLine x={0} stroke={COLORS.ink} strokeWidth={1} />
            <ReferenceLine x={0.10} stroke={COLORS.warm} strokeDasharray="4 4" label={{ value: "r = 0.10", fill: COLORS.warm, fontSize: 10, position: "top" }} />
            <Bar dataKey="r" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
