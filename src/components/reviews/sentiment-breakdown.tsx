"use client";

import { cn } from "@/lib/utils";

interface SentimentBreakdownProps {
  positive: number;
  neutral: number;
  negative: number;
}

export function SentimentBreakdown({
  positive,
  neutral,
  negative,
}: SentimentBreakdownProps) {
  const total = positive + neutral + negative;
  if (total === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No sentiment data available.</p>
      </div>
    );
  }

  const pctPositive = (positive / total) * 100;
  const pctNeutral = (neutral / total) * 100;
  const pctNegative = (negative / total) * 100;

  const segments = [
    {
      label: "Positive",
      count: positive,
      pct: pctPositive,
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      dotColor: "bg-emerald-400",
    },
    {
      label: "Neutral",
      count: neutral,
      pct: pctNeutral,
      color: "bg-zinc-500",
      textColor: "text-zinc-400",
      dotColor: "bg-zinc-400",
    },
    {
      label: "Negative",
      count: negative,
      pct: pctNegative,
      color: "bg-red-500",
      textColor: "text-red-400",
      dotColor: "bg-red-400",
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Sentiment Breakdown
      </h3>

      {/* Stacked bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {segments.map(
          (seg) =>
            seg.pct > 0 && (
              <div
                key={seg.label}
                className={cn("h-full transition-all duration-700", seg.color)}
                style={{ width: `${seg.pct}%` }}
              />
            )
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", seg.dotColor)} />
            <div className="flex items-baseline gap-1.5">
              <span className={cn("text-sm font-medium", seg.textColor)}>
                {seg.pct.toFixed(0)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {seg.label} ({seg.count})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
