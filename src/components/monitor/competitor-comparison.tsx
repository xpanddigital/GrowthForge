"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Star } from "lucide-react";

interface CompetitorComparisonProps {
  clientName: string;
  clientSom: number;
  competitors: Record<string, number>;
  previousCompetitors?: Record<string, number>;
  previousClientSom?: number;
  focusCompetitors?: Set<string>;
}

export function CompetitorComparison({
  clientName,
  clientSom,
  competitors,
  previousCompetitors,
  previousClientSom,
  focusCompetitors,
}: CompetitorComparisonProps) {
  // Sort competitors by SoM descending
  const sorted = Object.entries(competitors).sort(([, a], [, b]) => b - a);

  // If focus competitors are set, filter to only show them (plus client)
  const filteredSorted = focusCompetitors && focusCompetitors.size > 0
    ? sorted.filter(([name]) => focusCompetitors.has(name))
    : sorted;

  // All entries (client + competitors) for display
  const allEntries = [
    {
      name: clientName,
      som: clientSom,
      isClient: true,
      isFocus: false,
      delta: previousClientSom !== undefined ? clientSom - previousClientSom : null,
    },
    ...filteredSorted.map(([name, som]) => ({
      name,
      som,
      isClient: false,
      isFocus: focusCompetitors?.has(name) || false,
      delta: previousCompetitors?.[name] !== undefined
        ? som - previousCompetitors[name]
        : null,
    })),
  ].sort((a, b) => b.som - a.som);

  const maxSom = Math.max(...allEntries.map((e) => e.som), 1);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Share of Model — AI Visibility Ranking
        </h3>
        {focusCompetitors && focusCompetitors.size > 0 && (
          <span className="text-[10px] text-amber-400 flex items-center gap-1">
            <Star className="h-2.5 w-2.5 fill-amber-400" />
            Showing focus competitors
          </span>
        )}
      </div>
      {allEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Competitors will be auto-discovered after your first scan.
        </p>
      ) : (
        <div className="space-y-3">
          {allEntries.map((entry) => (
            <div key={entry.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span
                  className={cn(
                    entry.isClient
                      ? "text-primary font-medium"
                      : entry.isFocus
                        ? "text-foreground font-medium"
                        : "text-foreground"
                  )}
                >
                  {entry.isClient ? `You (${entry.name})` : entry.name}
                  {entry.isFocus && (
                    <Star className="h-3 w-3 inline ml-1.5 text-amber-400 fill-amber-400 -mt-0.5" />
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {entry.delta !== null && Math.abs(entry.delta) > 1 && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-[10px] font-medium",
                        entry.delta > 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {entry.delta > 0 ? (
                        <TrendingUp className="h-2.5 w-2.5" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5" />
                      )}
                      {entry.delta > 0 ? "+" : ""}
                      {entry.delta.toFixed(0)}%
                    </span>
                  )}
                  <span className="text-muted-foreground font-mono w-10 text-right">
                    {entry.som.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    entry.isClient
                      ? "bg-primary"
                      : entry.isFocus
                        ? "bg-amber-500"
                        : "bg-muted-foreground/50"
                  )}
                  style={{
                    width: `${(entry.som / maxSom) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
