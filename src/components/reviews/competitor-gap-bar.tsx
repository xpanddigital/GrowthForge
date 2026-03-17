"use client";

import { cn } from "@/lib/utils";

interface Competitor {
  name: string;
  reviews: number;
}

interface CompetitorGapBarProps {
  clientName: string;
  clientReviews: number;
  competitors: Competitor[];
}

export function CompetitorGapBar({
  clientName,
  clientReviews,
  competitors,
}: CompetitorGapBarProps) {
  const allEntries = [
    { name: clientName, reviews: clientReviews, isClient: true },
    ...competitors.map((c) => ({ ...c, isClient: false })),
  ].sort((a, b) => b.reviews - a.reviews);

  const maxReviews = Math.max(...allEntries.map((e) => e.reviews), 1);
  const leader = allEntries[0];
  const gap =
    leader && !leader.isClient ? leader.reviews - clientReviews : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-1 text-sm font-medium text-muted-foreground">
        Review Volume Comparison
      </h3>
      {gap > 0 && (
        <p className="mb-4 text-xs text-red-400">
          Gap to leader: {gap.toLocaleString()} reviews
        </p>
      )}

      <div className="space-y-3">
        {allEntries.map((entry) => {
          const widthPercent = Math.max((entry.reviews / maxReviews) * 100, 2);

          return (
            <div key={entry.name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span
                  className={cn(
                    "font-medium",
                    entry.isClient ? "text-[#6C5CE7]" : "text-muted-foreground"
                  )}
                >
                  {entry.name}
                  {entry.isClient && (
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      (you)
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-foreground">
                  {entry.reviews.toLocaleString()}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    entry.isClient ? "bg-[#6C5CE7]" : "bg-zinc-500"
                  )}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
