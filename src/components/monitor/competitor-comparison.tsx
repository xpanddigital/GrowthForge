"use client";

import { cn } from "@/lib/utils";

interface CompetitorComparisonProps {
  clientName: string;
  clientSom: number;
  competitors: Record<string, number>;
}

export function CompetitorComparison({
  clientName,
  clientSom,
  competitors,
}: CompetitorComparisonProps) {
  // Sort competitors by SoM descending
  const sorted = Object.entries(competitors).sort(([, a], [, b]) => b - a);

  // All entries (client + competitors) for display
  const allEntries = [
    { name: clientName, som: clientSom, isClient: true },
    ...sorted.map(([name, som]) => ({ name, som, isClient: false })),
  ].sort((a, b) => b.som - a.som);

  const maxSom = Math.max(...allEntries.map((e) => e.som), 1);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Competitor Comparison
      </h3>
      {allEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add competitors to see comparison data.
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
                      : "text-foreground"
                  )}
                >
                  {entry.isClient ? `You (${entry.name})` : entry.name}
                </span>
                <span className="text-muted-foreground font-mono">
                  {entry.som.toFixed(0)}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    entry.isClient ? "bg-primary" : "bg-muted-foreground/50"
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
