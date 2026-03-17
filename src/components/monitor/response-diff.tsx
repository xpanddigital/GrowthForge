"use client";

import { cn } from "@/lib/utils";

interface ResponseDiffProps {
  oldResponse: string;
  newResponse: string;
  oldHash: string;
  newHash: string;
  oldDate: string;
  newDate: string;
  model: string;
}

export function ResponseDiff({
  oldResponse,
  newResponse,
  oldHash,
  newHash,
  oldDate,
  newDate,
  model,
}: ResponseDiffProps) {
  const oldLines = oldResponse.split("\n");
  const newLines = newResponse.split("\n");

  // Simple line-based diff
  const diff = computeSimpleDiff(oldLines, newLines);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Response Change Detected</h3>
        <span className="text-xs text-muted-foreground">{model}</span>
      </div>

      <div className="grid grid-cols-2 gap-0 border-b border-border">
        <div className="border-r border-border px-3 py-2">
          <span className="text-xs text-red-400 font-medium">Previous</span>
          <span className="text-[10px] text-muted-foreground ml-2">
            {new Date(oldDate).toLocaleDateString()}
          </span>
        </div>
        <div className="px-3 py-2">
          <span className="text-xs text-emerald-400 font-medium">Current</span>
          <span className="text-[10px] text-muted-foreground ml-2">
            {new Date(newDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="font-mono text-xs leading-relaxed">
          {diff.map((line, i) => (
            <div
              key={i}
              className={cn(
                "px-4 py-0.5",
                line.type === "removed" && "bg-red-500/10 text-red-300",
                line.type === "added" && "bg-emerald-500/10 text-emerald-300",
                line.type === "unchanged" && "text-muted-foreground"
              )}
            >
              <span className="inline-block w-4 text-muted-foreground/50 select-none">
                {line.type === "removed" ? "−" : line.type === "added" ? "+" : " "}
              </span>
              {line.text}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>Old: {oldHash.substring(0, 12)}...</span>
        <span>New: {newHash.substring(0, 12)}...</span>
      </div>
    </div>
  );
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
}

function computeSimpleDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  let oi = 0;
  let ni = 0;

  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      result.push({ type: "unchanged", text: oldLines[oi] });
      oi++;
      ni++;
    } else if (oi < oldLines.length && !newSet.has(oldLines[oi])) {
      result.push({ type: "removed", text: oldLines[oi] });
      oi++;
    } else if (ni < newLines.length && !oldSet.has(newLines[ni])) {
      result.push({ type: "added", text: newLines[ni] });
      ni++;
    } else {
      // Fallback: show as removed then added
      if (oi < oldLines.length) {
        result.push({ type: "removed", text: oldLines[oi] });
        oi++;
      }
      if (ni < newLines.length) {
        result.push({ type: "added", text: newLines[ni] });
        ni++;
      }
    }
  }

  return result;
}
