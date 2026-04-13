/* Hero Dashboard Mockup — for screenshot capture */

function Ring({ score, size = 140 }: { score: number; size?: number }) {
  const r = 50, c = 2 * Math.PI * r, off = c - (score / 100) * c;
  const color = score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#dc2626";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, fontWeight: 400, color: "#1a1a2e" }}>{score}</span>
        <span style={{ fontSize: 12, color: "#8e90a6" }}>/100</span>
      </div>
    </div>
  );
}

function Bar({ label, pct, color, bold }: { label: string; pct: number; color: string; bold?: boolean }) {
  return (
    <div>
      <div className="flex justify-between" style={{ marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: bold ? 600 : 400, color: bold ? color : "#555770", fontFamily: "'Outfit', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: bold ? 600 : 400, color: bold ? color : "#8e90a6", fontFamily: "'Outfit', sans-serif" }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "#f1f5f9", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: bold ? color : "#cbd5e1" }} />
      </div>
    </div>
  );
}

export default function DashboardHeroMockup() {
  return (
    <div style={{ width: 520, padding: 40, background: "#fcfbf9", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8e90a6" }}>AI Visibility Score</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#d97706", marginTop: 2 }}>Live GEO Tracker</p>
          </div>
          <span className="flex items-center" style={{ gap: 5, fontSize: 11, fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "4px 10px", borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
            Live
          </span>
        </div>

        {/* Score Ring */}
        <div className="flex justify-center" style={{ marginBottom: 24 }}>
          <Ring score={78} size={150} />
        </div>

        {/* Delta */}
        <div className="flex justify-center" style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "4px 14px", borderRadius: 20 }}>↑ +12 pts vs last month</span>
        </div>

        {/* Share of Model */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 14 }}>Share of Model</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Bar label="Your Brand" pct={72} color="#3d2be0" bold />
            <Bar label="Competitor A" pct={58} color="#cbd5e1" />
            <Bar label="Competitor B" pct={35} color="#cbd5e1" />
          </div>
        </div>

        {/* Model breakdown */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>By model</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { m: "ChatGPT", p: 78, c: "#059669" },
              { m: "Perplexity", p: 85, c: "#059669" },
              { m: "Gemini", p: 52, c: "#d97706" },
              { m: "Claude", p: 68, c: "#059669" },
            ].map(({ m, p, c }) => (
              <div key={m} className="flex items-center justify-between" style={{ background: "#fafaf9", borderRadius: 8, padding: "10px 14px" }}>
                <span style={{ fontSize: 12, color: "#555770" }}>{m}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: c }}>{p}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
