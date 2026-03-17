"use client";

import { cn } from "@/lib/utils";

interface TrendDataPoint {
  date: string;
  score: number;
  som: number;
}

interface SomTrendChartProps {
  data: TrendDataPoint[];
}

export function SomTrendChart({ data }: SomTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          12-Week Trend
        </h3>
        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
          No trend data yet. Run your first monitoring scan.
        </div>
      </div>
    );
  }

  // Reverse so oldest is first (left to right)
  const sorted = [...data].reverse();
  const maxScore = Math.max(...sorted.map((d) => d.score), 1);
  const chartHeight = 120;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        12-Week Trend
      </h3>
      <div className="relative h-40">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-muted-foreground">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 h-full flex items-end gap-1 pb-6">
          {sorted.map((point, i) => {
            const barHeight = (point.score / maxScore) * chartHeight;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
              >
                {/* Bar */}
                <div className="w-full flex justify-center">
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t transition-all duration-300",
                      point.score >= 70
                        ? "bg-emerald-500/80"
                        : point.score >= 40
                          ? "bg-amber-500/80"
                          : "bg-red-500/80"
                    )}
                    style={{ height: `${Math.max(barHeight, 2)}px` }}
                    title={`Score: ${point.score} | SoM: ${point.som.toFixed(1)}%`}
                  />
                </div>
                {/* X-axis label */}
                <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                  {formatWeekLabel(point.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>70+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>40-69</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>&lt;40</span>
        </div>
      </div>
    </div>
  );
}

function formatWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return `W${getWeekNumber(date)}`;
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}
