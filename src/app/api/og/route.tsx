import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const categoryColors: Record<string, string> = {
  fundamentals: "#3B82F6",
  strategy: "#10B981",
  technical: "#F59E0B",
  industry: "#8B5CF6",
  tools: "#EC4899",
};

const categoryLabels: Record<string, string> = {
  fundamentals: "Fundamentals",
  strategy: "Strategy",
  technical: "Technical",
  industry: "Industry",
  tools: "Tools & Comparisons",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "MentionLayer Blog";
  const category = searchParams.get("category") || "fundamentals";
  const author = searchParams.get("author") || "Joel House";

  const accentColor = categoryColors[category] || "#6C5CE7";
  const categoryLabel = categoryLabels[category] || "Blog";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: accentColor + "20",
              color: accentColor,
              fontSize: "20px",
              fontWeight: 600,
              padding: "6px 16px",
              borderRadius: "8px",
              border: `1px solid ${accentColor}40`,
            }}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Middle: title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? "42px" : "52px",
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              maxWidth: "90%",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom: author + brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Author avatar circle */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#6C5CE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              JH
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#fafafa",
                }}
              >
                {author}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "#a1a1aa",
                }}
              >
                Founder, MentionLayer
              </div>
            </div>
          </div>

          {/* Brand mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#6C5CE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              M
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "#a1a1aa",
              }}
            >
              mentionlayer.com
            </div>
          </div>
        </div>

        {/* Accent line at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(to right, ${accentColor}, #6C5CE7)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
