/* GEO Tracker Deep View Mockup — for screenshot capture */

function TrendBar({ week, height, color }: { week: string; height: number; color: string }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: 4 }}>
      <div style={{ width: 24, height: 80, background: "#f1f5f9", borderRadius: 4, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
        <div style={{ width: "100%", height: `${height}%`, background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 10, color: "#8e90a6" }}>{week}</span>
    </div>
  );
}

function Bar({ label, pct, color, rank }: { label: string; pct: number; color: string; rank: number }) {
  return (
    <div className="flex items-center" style={{ gap: 10 }}>
      <span style={{ fontSize: 11, color: "#8e90a6", width: 16, textAlign: "right" }}>{rank}</span>
      <div style={{ flex: 1 }}>
        <div className="flex justify-between" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: rank === 1 ? 600 : 400, color: rank === 1 ? color : "#555770" }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: rank === 1 ? 600 : 400, color: rank === 1 ? color : "#8e90a6" }}>{pct}%</span>
        </div>
        <div style={{ height: 7, borderRadius: 4, background: "#f1f5f9", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: rank === 1 ? color : "#cbd5e1" }} />
        </div>
      </div>
    </div>
  );
}

export default function GeoTrackerMockup() {
  return (
    <div style={{ width: 520, padding: 40, background: "#fcfbf9", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>Share of Model</p>
            <p style={{ fontSize: 12, color: "#8e90a6", marginTop: 2 }}>40 prompts · last 30 days</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "4px 10px", borderRadius: 20 }}>Live</span>
        </div>

        {/* Rankings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          <Bar label="Your Brand" pct={72} color="#3d2be0" rank={1} />
          <Bar label="Competitor A" pct={58} color="#cbd5e1" rank={2} />
          <Bar label="Competitor B" pct={41} color="#cbd5e1" rank={3} />
          <Bar label="Competitor C" pct={28} color="#cbd5e1" rank={4} />
        </div>

        {/* 12-week trend */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20, marginBottom: 20 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>12-week trend</p>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>+36 pts</span>
          </div>
          <div className="flex items-end justify-between" style={{ gap: 6 }}>
            {[
              { w: "W1", h: 35, c: "#dc2626" },
              { w: "W2", h: 38, c: "#dc2626" },
              { w: "W3", h: 40, c: "#d97706" },
              { w: "W4", h: 42, c: "#d97706" },
              { w: "W5", h: 48, c: "#d97706" },
              { w: "W6", h: 52, c: "#d97706" },
              { w: "W7", h: 55, c: "#d97706" },
              { w: "W8", h: 60, c: "#059669" },
              { w: "W9", h: 64, c: "#059669" },
              { w: "W10", h: 68, c: "#059669" },
              { w: "W11", h: 72, c: "#059669" },
              { w: "W12", h: 78, c: "#059669" },
            ].map(({ w, h, c }) => (
              <TrendBar key={w} week={w} height={h} color={c} />
            ))}
          </div>
        </div>

        {/* Alert */}
        <div className="flex items-center" style={{ gap: 8, background: "#ecfdf5", borderRadius: 10, padding: "10px 14px", border: "1px solid #a7f3d0" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669" }} />
          <span style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>New recommendation detected in ChatGPT</span>
          <span style={{ fontSize: 11, color: "#8e90a6", marginLeft: "auto" }}>2h ago</span>
        </div>
      </div>
    </div>
  );
}
