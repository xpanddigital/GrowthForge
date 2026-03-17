"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthorityScoreCardProps {
  score: number;
  delta?: number | null;
  loading?: boolean;
}

function scoreColor(score: number): string {
  if (score <= 30) return "text-red-400";
  if (score <= 60) return "text-amber-400";
  return "text-emerald-400";
}

function ringStroke(score: number): string {
  if (score <= 30) return "stroke-red-400";
  if (score <= 60) return "stroke-amber-400";
  return "stroke-emerald-400";
}

function scoreLabel(score: number): string {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Weak";
  if (score <= 60) return "Developing";
  if (score <= 80) return "Strong";
  return "Excellent";
}

export function AuthorityScoreCard({
  score,
  delta,
  loading = false,
}: AuthorityScoreCardProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <Skeleton className="mb-4 h-4 w-40" />
        <div className="flex items-center justify-center">
          <Skeleton className="h-36 w-36 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Review Authority Score
      </h3>

      <div className="flex flex-col items-center gap-3">
        {/* SVG ring */}
        <div className="relative h-36 w-36 flex-shrink-0">
          <svg className="-rotate-90 h-full w-full" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="8"
              className="stroke-muted/30"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn("transition-all duration-1000", ringStroke(score))}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold", scoreColor(score))}>
              {score}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Label and delta */}
        <div className="flex flex-col items-center gap-1">
          <span
            className={cn(
              "text-sm font-medium",
              scoreColor(score)
            )}
          >
            {scoreLabel(score)}
          </span>
          {delta !== null && delta !== undefined && (
            <span
              className={cn(
                "text-xs font-medium",
                delta > 0
                  ? "text-emerald-400"
                  : delta < 0
                    ? "text-red-400"
                    : "text-muted-foreground"
              )}
            >
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"}{" "}
              {delta > 0 ? "+" : ""}
              {delta} vs previous
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
