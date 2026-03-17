"use client";

import { cn } from "@/lib/utils";

interface Snapshot {
  snapshot_date: string;
  new_reviews_count: number;
}

interface VelocityChartProps {
  snapshots: Snapshot[];
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function VelocityChart({ snapshots }: VelocityChartProps) {
  if (snapshots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No velocity data available yet.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...snapshots.map((s) => s.new_reviews_count), 1);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Monthly New Reviews
        </h3>
        <span className="text-xs text-muted-foreground">
          Last {snapshots.length} months
        </span>
      </div>

      {/* Chart area */}
      <div className="flex items-end gap-1.5" style={{ height: 140 }}>
        {snapshots.map((snapshot) => {
          const date = new Date(snapshot.snapshot_date);
          const month = MONTH_LABELS[date.getMonth()];
          const heightPercent = (snapshot.new_reviews_count / maxCount) * 100;
          const barHeight = Math.max(heightPercent, 2);

          return (
            <div
              key={snapshot.snapshot_date}
              className="group flex flex-1 flex-col items-center gap-1"
              style={{ height: "100%" }}
            >
              {/* Tooltip on hover */}
              <div className="relative flex flex-1 w-full items-end justify-center">
                <div
                  className={cn(
                    "w-full max-w-[32px] rounded-t transition-all duration-500",
                    snapshot.new_reviews_count > 0
                      ? "bg-[#6C5CE7] group-hover:bg-[#5A4BD1]"
                      : "bg-muted"
                  )}
                  style={{ height: `${barHeight}%` }}
                />
                {/* Hover count label */}
                <div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background">
                    {snapshot.new_reviews_count}
                  </span>
                </div>
              </div>
              {/* Month label */}
              <span className="text-[10px] text-muted-foreground">{month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
