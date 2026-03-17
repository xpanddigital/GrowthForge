"use client";

import { cn } from "@/lib/utils";

interface RelevanceBarProps {
  score: number | null;
  className?: string;
}

export function RelevanceBar({ score, className }: RelevanceBarProps) {
  if (score === null) return <span className="text-xs text-muted-foreground">-</span>;

  const color =
    score >= 61
      ? "bg-emerald-500"
      : score >= 31
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{score}</span>
    </div>
  );
}
