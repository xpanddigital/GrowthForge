"use client";

import { cn } from "@/lib/utils";

interface VisibilityScoreCardProps {
  score: number;
  somPercent: number;
  scoreDelta?: number | null;
  somDelta?: number | null;
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function ringColor(score: number): string {
  if (score >= 70) return "stroke-emerald-400";
  if (score >= 40) return "stroke-amber-400";
  return "stroke-red-400";
}

export function VisibilityScoreCard({
  score,
  somPercent,
  scoreDelta,
  somDelta,
}: VisibilityScoreCardProps) {
  const circumference = 2 * Math.PI * 54; // radius 54
  const progress = (score / 100) * circumference;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        AI Visibility Score
      </h3>
      <div className="flex items-center gap-6">
        {/* Circular score ring */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              className="stroke-muted/30"
            />
            {/* Progress ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn("transition-all duration-1000", ringColor(score))}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", scoreColor(score))}>
              {score}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          {scoreDelta !== null && scoreDelta !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-sm font-medium",
                  scoreDelta > 0
                    ? "text-emerald-400"
                    : scoreDelta < 0
                      ? "text-red-400"
                      : "text-muted-foreground"
                )}
              >
                {scoreDelta > 0 ? "▲" : scoreDelta < 0 ? "▼" : "—"}{" "}
                {scoreDelta > 0 ? "+" : ""}
                {scoreDelta.toFixed(0)} vs last week
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">
              SoM: {somPercent.toFixed(1)}%
            </span>
            {somDelta !== null && somDelta !== undefined && (
              <span
                className={cn(
                  "text-xs",
                  somDelta > 0
                    ? "text-emerald-400"
                    : somDelta < 0
                      ? "text-red-400"
                      : "text-muted-foreground"
                )}
              >
                ({somDelta > 0 ? "+" : ""}
                {somDelta.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
