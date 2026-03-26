"use client";

interface CompetitorInputProps {
  competitors: string[];
  onCompetitorsChange: (competitors: string[]) => void;
}

export function CompetitorInput({
  competitors,
  onCompetitorsChange,
}: CompetitorInputProps) {
  function updateCompetitor(index: number, value: string) {
    const updated = [...competitors];
    updated[index] = value;
    onCompetitorsChange(updated);
  }

  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-1">
          <label className="text-sm text-muted-foreground">
            Competitor {i + 1} {i === 0 ? "" : "(optional)"}
          </label>
          <input
            type="text"
            placeholder={
              i === 0
                ? "e.g. DistroKid"
                : i === 1
                ? "e.g. TuneCore"
                : "e.g. CD Baby"
            }
            value={competitors[i] || ""}
            onChange={(e) => updateCompetitor(i, e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Adding competitors lets us compare your AI visibility against theirs.
      </p>
    </div>
  );
}
