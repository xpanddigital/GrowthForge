"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import type { MonthlySnapshot, IndustryBreakdown } from "@/lib/research/study-data";

interface Props {
  snapshots: MonthlySnapshot[];
  industryBreakdown: IndustryBreakdown[];
  latest: MonthlySnapshot;
}

export function ResearchCharts({ snapshots, industryBreakdown, latest }: Props) {
  // Model coverage data for radar chart
  const modelData = [
    { model: "Perplexity", coverage: latest.modelCoverage.perplexity },
    { model: "ChatGPT", coverage: latest.modelCoverage.chatgpt },
    { model: "Gemini", coverage: latest.modelCoverage.gemini },
    { model: "Google AIO", coverage: latest.modelCoverage.googleAIO },
    { model: "Claude", coverage: latest.modelCoverage.claude },
  ];

  // Trend data for line chart
  const trendData = snapshots.map((s) => ({
    name: s.label,
    "% Invisible": s.invisiblePct,
    "Avg Score": s.avgVisibilityScore,
    "Top Performer Avg": s.topPerformerAvgScore,
  }));

  // Industry data sorted by avg score descending
  const sortedIndustry = [...industryBreakdown].sort(
    (a, b) => b.avgScore - a.avgScore,
  );

  return (
    <>
      {/* ═══ MONTHLY TREND CHART ═══ */}
      <section className="py-16 sm:py-24" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2
              className="text-[32px] sm:text-[40px] tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Monthly Trend
            </h2>
            <p
              className="mt-3 text-[16px] max-w-[520px] mx-auto"
              style={{ color: "var(--ink-secondary)" }}
            >
              How AI visibility metrics evolve as we rerun the study each month.
            </p>
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "var(--surface)",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
            }}
          >
            {snapshots.length === 1 ? (
              <div className="text-center py-8">
                <p
                  className="text-[15px] font-medium"
                  style={{ color: "var(--ink)" }}
                >
                  Trend data starts with the April 2026 baseline.
                </p>
                <p
                  className="mt-1 text-[14px]"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  New data points will appear here after each monthly study
                  rerun.
                </p>
                <div className="mt-6 grid sm:grid-cols-3 gap-4 max-w-[600px] mx-auto">
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "var(--surface-raised)" }}
                  >
                    <div
                      className="text-[28px] font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      {latest.invisiblePct}%
                    </div>
                    <div
                      className="text-[13px] mt-1"
                      style={{ color: "var(--ink-tertiary)" }}
                    >
                      Invisible
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "var(--surface-raised)" }}
                  >
                    <div
                      className="text-[28px] font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      {latest.avgVisibilityScore}
                    </div>
                    <div
                      className="text-[13px] mt-1"
                      style={{ color: "var(--ink-tertiary)" }}
                    >
                      Avg Score
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "var(--surface-raised)" }}
                  >
                    <div
                      className="text-[28px] font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      {latest.topPerformerAvgScore}
                    </div>
                    <div
                      className="text-[13px] mt-1"
                      style={{ color: "var(--ink-tertiary)" }}
                    >
                      Top Performer Avg
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,46,0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#8e90a6" }} />
                  <YAxis tick={{ fontSize: 13, fill: "#8e90a6" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid rgba(26,26,46,0.08)",
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Line
                    type="monotone"
                    dataKey="% Invisible"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Avg Score"
                    stroke="#3d2be0"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Top Performer Avg"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* ═══ MODEL COVERAGE RADAR ═══ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-[32px] sm:text-[40px] tracking-tight"
                style={{ color: "var(--ink)" }}
              >
                AI Model Coverage
              </h2>
              <p
                className="mt-3 text-[16px] leading-relaxed"
                style={{ color: "var(--ink-secondary)" }}
              >
                Percentage of businesses that appear in each AI model&apos;s
                recommendations. Perplexity leads at {latest.modelCoverage.perplexity}%, while Claude
                mentions only {latest.modelCoverage.claude}% of businesses tested.
              </p>
              <div className="mt-6 space-y-3">
                {modelData
                  .sort((a, b) => b.coverage - a.coverage)
                  .map((m) => (
                    <div key={m.model} className="flex items-center gap-3">
                      <div
                        className="w-24 text-[14px] font-medium"
                        style={{ color: "var(--ink)" }}
                      >
                        {m.model}
                      </div>
                      <div
                        className="flex-1 h-3 rounded-full overflow-hidden"
                        style={{ background: "var(--accent-subtle)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${m.coverage}%`,
                            background: "var(--accent)",
                          }}
                        />
                      </div>
                      <div
                        className="w-12 text-right text-[14px] font-mono font-medium"
                        style={{ color: "var(--accent)" }}
                      >
                        {m.coverage}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--surface-raised)",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
              }}
            >
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={modelData}>
                  <PolarGrid stroke="rgba(26,26,46,0.08)" />
                  <PolarAngleAxis
                    dataKey="model"
                    tick={{ fontSize: 13, fill: "#555770" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 30]}
                    tick={{ fontSize: 11, fill: "#8e90a6" }}
                  />
                  <Radar
                    name="Coverage %"
                    dataKey="coverage"
                    stroke="#3d2be0"
                    fill="#3d2be0"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid rgba(26,26,46,0.08)",
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                    formatter={(value) => [`${value}%`, "Coverage"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INDUSTRY BREAKDOWN ═══ */}
      <section className="py-16 sm:py-24" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2
              className="text-[32px] sm:text-[40px] tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Industry Breakdown
            </h2>
            <p
              className="mt-3 text-[16px] max-w-[520px] mx-auto"
              style={{ color: "var(--ink-secondary)" }}
            >
              Average AI visibility score by industry. Personal injury law leads;
              med spas trail significantly.
            </p>
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "var(--surface)",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
            }}
          >
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={sortedIndustry}
                layout="vertical"
                margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(26,26,46,0.06)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 13, fill: "#8e90a6" }}
                  domain={[0, 20]}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={160}
                  tick={{ fontSize: 13, fill: "#555770" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid rgba(26,26,46,0.08)",
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                  formatter={(value, name) => {
                    if (name === "avgScore") return [`${value}`, "Avg Score"];
                    return [`${value}`, `${name}`];
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar
                  dataKey="avgScore"
                  fill="#3d2be0"
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Industry stat cards */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {sortedIndustry.slice(0, 5).map((ind) => (
              <div
                key={ind.industry}
                className="rounded-xl p-4 text-center"
                style={{
                  background: "var(--surface)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="text-[13px]"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  {ind.label}
                </div>
                <div
                  className="text-[24px] font-semibold mt-1"
                  style={{ color: "var(--accent)" }}
                >
                  {ind.avgScore}
                </div>
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  {ind.invisiblePct}% invisible
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
