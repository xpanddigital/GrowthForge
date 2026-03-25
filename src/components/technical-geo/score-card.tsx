"use client";

import { cn } from "@/lib/utils";

interface TechGeoScoreCardProps {
  title: string;
  score: number | null;
  icon: React.ReactNode;
  status?: "completed" | "running" | "pending" | "failed";
  description?: string;
  onClick?: () => void;
}

function getScoreColor(score: number): string {
  if (score <= 30) return "text-red-500";
  if (score <= 60) return "text-amber-500";
  return "text-emerald-500";
}

function getBarColor(score: number): string {
  if (score <= 30) return "bg-red-500";
  if (score <= 60) return "bg-amber-500";
  return "bg-emerald-500";
}

export function TechGeoScoreCard({
  title,
  score,
  icon,
  status,
  description,
  onClick,
}: TechGeoScoreCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800 bg-zinc-900 p-5",
        onClick && "cursor-pointer hover:border-zinc-600 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-zinc-400">{icon}</div>
          <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
        </div>
        {status === "running" && (
          <span className="text-xs text-amber-400 animate-pulse">
            Scanning...
          </span>
        )}
      </div>

      {score !== null ? (
        <>
          <div className={cn("text-3xl font-bold mb-2", getScoreColor(score))}>
            {score}
            <span className="text-sm text-zinc-500 font-normal">/100</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", getBarColor(score))}
              style={{ width: `${score}%` }}
            />
          </div>
        </>
      ) : (
        <div className="text-2xl text-zinc-600 font-bold mb-2">—</div>
      )}

      {description && (
        <p className="text-xs text-zinc-500 mt-2">{description}</p>
      )}
    </div>
  );
}
