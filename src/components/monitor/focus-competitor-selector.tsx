"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, Loader2 } from "lucide-react";

interface Competitor {
  id: string;
  competitor_name: string;
  is_focus: boolean;
  is_active: boolean;
  som: number;
  discovered_via?: string;
}

interface FocusCompetitorSelectorProps {
  competitors: Competitor[];
  onToggleFocus: (competitorId: string, isFocus: boolean) => Promise<void>;
}

export function FocusCompetitorSelector({
  competitors,
  onToggleFocus,
}: FocusCompetitorSelectorProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (comp: Competitor) => {
    setTogglingId(comp.id);
    try {
      await onToggleFocus(comp.id, !comp.is_focus);
    } finally {
      setTogglingId(null);
    }
  };

  if (competitors.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Focus Competitors
        </h3>
        <p className="text-xs text-muted-foreground">
          Competitors will be auto-discovered after your first scan.
        </p>
      </div>
    );
  }

  const focusCount = competitors.filter((c) => c.is_focus).length;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Focus Competitors
        </h3>
        <span className="text-xs text-muted-foreground">
          {focusCount} selected
        </span>
      </div>
      <div className="space-y-1.5">
        {competitors.map((comp) => {
          const isToggling = togglingId === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => handleToggle(comp)}
              disabled={isToggling}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                comp.is_focus
                  ? "bg-amber-500/10 border border-amber-500/30"
                  : "bg-muted/10 border border-transparent hover:bg-muted/20"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {isToggling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
                ) : (
                  <Star
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      comp.is_focus
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "truncate",
                    comp.is_focus ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {comp.competitor_name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono ml-2 shrink-0">
                {comp.som.toFixed(0)}%
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        Click to toggle. Focus competitors are highlighted in charts.
      </p>
    </div>
  );
}
