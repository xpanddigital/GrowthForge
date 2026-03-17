"use client";

import { cn } from "@/lib/utils";

interface ConsistencyScoreCardProps {
  score: number | null;
  label?: string;
  subtitle?: string;
  delta?: number | null;
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

function getStrokeColor(score: number | null) {
  if (score === null) return "stroke-muted";
  if (score >= 70) return "stroke-emerald-500";
  if (score >= 40) return "stroke-amber-500";
  return "stroke-red-500";
}

export function ConsistencyScoreCard({
  score,
  label,
  subtitle,
  delta,
}: ConsistencyScoreCardProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? (score / 100) * circumference : 0;
  const offset = circumference - progress;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-36 w-36">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 120 120"
          fill="none"
        >
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-muted"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={cn("transition-all duration-700", getStrokeColor(score))}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-4xl font-bold tabular-nums",
              getScoreColor(score)
            )}
          >
            {score !== null ? score : "\u2014"}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
      {subtitle && (
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      )}

      {delta !== undefined && delta !== null && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium",
            delta > 0
              ? "text-emerald-500"
              : delta < 0
                ? "text-red-500"
                : "text-muted-foreground"
          )}
        >
          {delta > 0 ? "\u25B2" : delta < 0 ? "\u25BC" : "\u2014"}
          {delta !== 0 && ` ${Math.abs(delta)} pts`}
        </span>
      )}
    </div>
  );
}
