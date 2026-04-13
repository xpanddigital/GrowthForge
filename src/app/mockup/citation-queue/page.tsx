/* Citation Engine Queue Mockup — for screenshot capture */

function PlatformDot({ platform }: { platform: string }) {
  const colors: Record<string, string> = { reddit: "#FF4500", quora: "#B92B27", facebook: "#1877F2" };
  return <span style={{ width: 10, height: 10, borderRadius: "50%", background: colors[platform] || "#8e90a6", display: "inline-block", flexShrink: 0 }} />;
}

function RelevanceBar({ score }: { score: number }) {
  const color = score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#dc2626";
  return (
    <div className="flex items-center" style={{ gap: 6 }}>
      <div style={{ width: 48, height: 5, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 3, background: color }} />
      </div>
      <span style={{ fontSize: 11, color: "#8e90a6" }}>{score}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    queued: { bg: "#eef2ff", color: "#3d2be0" },
    responded: { bg: "#ecfdf5", color: "#059669" },
    classified: { bg: "#fffbeb", color: "#d97706" },
    new: { bg: "#f1f5f9", color: "#64748b" },
  };
  const s = styles[status] || styles.new;
  return <span style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20 }}>{status}</span>;
}

export default function CitationQueueMockup() {
  const threads = [
    { platform: "reddit", community: "r/DigitalMarketing", title: "Best tools for tracking AI visibility in 2026?", keyword: "AI visibility tools", relevance: 92, status: "queued", highlight: true },
    { platform: "quora", community: "SEO Strategies", title: "How do you get your brand mentioned by ChatGPT?", keyword: "brand AI mentions", relevance: 87, status: "responded" },
    { platform: "reddit", community: "r/SEO", title: "Anyone tracking their Share of Model score?", keyword: "share of model", relevance: 78, status: "classified" },
    { platform: "facebook", community: "Agency Growth", title: "What's working for GEO in 2026? Thread.", keyword: "GEO strategy", relevance: 71, status: "new" },
  ];

  return (
    <div style={{ width: 680, padding: 40, background: "#fcfbf9", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {/* Header bar */}
        <div className="flex items-center justify-between" style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>Citation Engine</p>
            <span style={{ fontSize: 12, color: "#8e90a6" }}>142 threads</span>
          </div>
          <button style={{ fontSize: 12, fontWeight: 600, color: "white", background: "#3d2be0", padding: "6px 14px", borderRadius: 8, border: "none" }}>Run Discovery Scan</button>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              {["", "Thread", "Keyword", "Rel.", "Status"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#8e90a6", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {threads.map((t, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f8f8f8", background: t.highlight ? "#fafafe" : "transparent" }}>
                <td style={{ padding: "12px 12px", width: 40 }}><PlatformDot platform={t.platform} /></td>
                <td style={{ padding: "12px 0" }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e", lineHeight: 1.3 }}>{t.title}</p>
                  <p style={{ fontSize: 11, color: "#8e90a6", marginTop: 2 }}>{t.community}</p>
                </td>
                <td style={{ padding: "12px 12px" }}>
                  <span style={{ fontSize: 11, color: "#555770", background: "#f1f5f9", padding: "3px 8px", borderRadius: 4 }}>{t.keyword}</span>
                </td>
                <td style={{ padding: "12px 12px" }}><RelevanceBar score={t.relevance} /></td>
                <td style={{ padding: "12px 12px" }}><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Response preview */}
        <div style={{ padding: 24, borderTop: "1px solid #f1f5f9", background: "#fafafe" }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#3d2be0" }}>Response Preview</span>
            <span style={{ fontSize: 11, color: "#8e90a6" }}>— Casual variant</span>
          </div>
          <div style={{ background: "white", borderRadius: 10, padding: 16, border: "1px solid #e5e7eb", fontSize: 13, color: "#374151", lineHeight: 1.65 }}>
            Honestly been down this rabbit hole myself. We switched to tracking our Share of Model about 3 months ago and the difference is wild — you can actually see which Reddit threads are feeding into ChatGPT&apos;s recommendations. The tool we use handles the whole pipeline from finding the threads to generating replies...
          </div>
          <div className="flex items-center" style={{ gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 500 }}>Quality: 87/100</span>
            <span style={{ fontSize: 11, color: "#8e90a6" }}>·</span>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 500 }}>Tone match: 92/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
