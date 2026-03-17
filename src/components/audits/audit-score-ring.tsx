"use client";

import { cn } from "@/lib/utils";

interface AuditScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score <= 30) return "border-[#EF4444] text-[#EF4444]";
  if (score <= 60) return "border-[#F59E0B] text-[#F59E0B]";
  return "border-[#10B981] text-[#10B981]";
}

function getScoreLabel(score: number): string {
  if (score <= 30) return "Critical";
  if (score <= 50) return "Needs Work";
  if (score <= 70) return "Moderate";
  if (score <= 85) return "Good";
  return "Excellent";
}

const sizeConfig = {
  sm: {
    container: "h-12 w-12",
    score: "text-sm font-bold",
    border: "border-[3px]",
    label: "text-[8px]",
  },
  md: {
    container: "h-20 w-20",
    score: "text-xl font-bold",
    border: "border-[4px]",
    label: "text-[10px]",
  },
  lg: {
    container: "h-[140px] w-[140px]",
    score: "text-4xl font-bold",
    border: "border-[6px]",
    label: "text-xs",
  },
};

export function AuditScoreRing({
  score,
  size = "md",
  className,
  label,
}: AuditScoreRingProps) {
  const config = sizeConfig[size];
  const colorClass = getScoreColor(score);
  const scoreLabel = label || getScoreLabel(score);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-full bg-background",
        config.container,
        config.border,
        colorClass,
        className
      )}
    >
      <span className={config.score}>{score}</span>
      {size !== "sm" && (
        <span
          className={cn(
            config.label,
            "uppercase tracking-wider text-muted-foreground"
          )}
        >
          {scoreLabel}
        </span>
      )}
    </div>
  );
}

export { getScoreColor, getScoreLabel };
