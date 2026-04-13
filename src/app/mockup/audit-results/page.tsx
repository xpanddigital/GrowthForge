/* Audit Results Mockup — for screenshot capture */

function ScoreRing({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
  const r = 46, c = 2 * Math.PI * r, off = c - (score / 100) * c;
  const color = score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#dc2626";
  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} viewBox="0 0 108 108" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="54" cy="54" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <circle cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: size > 100 ? 40 : 20, color: "#1a1a2e" }}>{score}</span>
        </div>
      </div>
      {label && <span style={{ fontSize: 12, color: "#8e90a6", marginTop: 6, fontWeight: 500 }}>{label}</span>}
    </div>
  );
}

function PillarCard({ name, score, color }: { name: string; score: number; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", border: "1px solid #f1f5f9", textAlign: "center", minWidth: 0 }}>
      <p style={{ fontSize: 11, color: "#8e90a6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{name}</p>
      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color }}>{score}</span>
      <div style={{ height: 4, borderRadius: 2, background: "#f1f5f9", marginTop: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 2, width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AuditResultsMockup() {
  const pillars = [
    { name: "Citations", score: 72, color: "#3d2be0" },
    { name: "AI Presence", score: 85, color: "#059669" },
    { name: "Entities", score: 68, color: "#2563eb" },
    { name: "Reviews", score: 81, color: "#d97706" },
    { name: "Press", score: 64, color: "#7c3aed" },
  ];

  return (
    <div style={{ width: 600, padding: 40, background: "#fcfbf9", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>AI Visibility Audit</p>
            <p style={{ fontSize: 12, color: "#8e90a6", marginTop: 2 }}>Completed · April 2026</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#3d2be0", background: "#eef2ff", padding: "4px 12px", borderRadius: 20 }}>Full audit</span>
        </div>

        {/* Before → After */}
        <div className="flex items-center justify-center" style={{ gap: 32, marginBottom: 32 }}>
          {/* Before */}
          <div className="flex flex-col items-center" style={{ opacity: 0.45 }}>
            <ScoreRing score={36} size={80} />
            <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, marginTop: 8 }}>Before</span>
          </div>

          {/* Arrow */}
          <svg width="32" height="16" viewBox="0 0 32 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M0 8h28M22 2l6 6-6 6" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* After */}
          <div className="flex flex-col items-center">
            <ScoreRing score={78} size={130} />
            <span style={{ fontSize: 12, color: "#059669", fontWeight: 700, marginTop: 8 }}>+42 points</span>
          </div>
        </div>

        {/* Pillar cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {pillars.map((p) => (
            <PillarCard key={p.name} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
