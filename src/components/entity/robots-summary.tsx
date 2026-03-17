"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface RobotsSummaryProps {
  crawlerAccess: Record<string, { allowed: boolean; rule: string | null }>;
  score: number | null;
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

export function RobotsSummary({ crawlerAccess, score }: RobotsSummaryProps) {
  const crawlers = Object.entries(crawlerAccess);

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Crawler Access</h3>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            getScoreColor(score)
          )}
        >
          {score !== null ? `${score}/100` : "\u2014"}
        </span>
      </div>

      {/* Crawler grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {crawlers.map(([name, { allowed, rule }]) => (
          <div
            key={name}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2",
              allowed
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-red-500/20 bg-red-500/5"
            )}
          >
            {allowed ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <X className="h-4 w-4 shrink-0 text-red-500" />
            )}
            <div className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {name}
              </span>
              {rule && (
                <span className="block truncate text-xs text-muted-foreground">
                  {rule}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
