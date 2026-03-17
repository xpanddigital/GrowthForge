"use client";

import { cn } from "@/lib/utils";

interface TimelineEntry {
  week_start: string;
  responses_posted: number;
  ai_visibility_score: number | null;
  som_delta: number | null;
  correlation_notes: Array<{
    type: string;
    confidence: string;
    message: string;
  }>;
}

interface CorrelationTimelineProps {
  data: TimelineEntry[];
}

export function CorrelationTimeline({ data }: CorrelationTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Correlation Timeline
        </h3>
        <p className="text-sm text-muted-foreground">
          Run monitoring scans to build correlation data between Citation Engine activity and AI visibility.
        </p>
      </div>
    );
  }

  const sorted = [...data].reverse(); // oldest first
  const maxPosts = Math.max(...sorted.map((d) => d.responses_posted), 1);
  const maxScore = Math.max(
    ...sorted.map((d) => d.ai_visibility_score || 0),
    1
  );

  // Collect all correlation notes
  const allNotes = sorted.flatMap((entry) =>
    (entry.correlation_notes || []).map((note) => ({
      ...note,
      week: entry.week_start,
    }))
  );

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Citation Activity vs AI Visibility Score
      </h3>

      {/* Chart */}
      <div className="relative h-32 mb-2">
        <div className="flex items-end gap-1 h-full">
          {sorted.map((entry, i) => {
            const barHeight =
              (entry.responses_posted / maxPosts) * 100;
            const scoreHeight =
              ((entry.ai_visibility_score || 0) / maxScore) * 100;

            return (
              <div key={i} className="flex-1 relative h-full">
                {/* Activity bar */}
                <div className="absolute bottom-0 left-[10%] right-[10%]">
                  <div
                    className="bg-primary/40 rounded-t"
                    style={{ height: `${Math.max(barHeight, 1)}%` }}
                    title={`${entry.responses_posted} posts`}
                  />
                </div>
                {/* Score dot */}
                {entry.ai_visibility_score !== null && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 z-10"
                    style={{ bottom: `${scoreHeight}%` }}
                    title={`Score: ${entry.ai_visibility_score}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1 mb-3">
        {sorted.map((entry, i) => (
          <div
            key={i}
            className="flex-1 text-center text-[9px] text-muted-foreground"
          >
            {formatWeekShort(entry.week_start)}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded bg-primary/40" />
          <span>Responses posted</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Visibility Score</span>
        </div>
      </div>

      {/* Correlation insights */}
      {allNotes.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          {allNotes.slice(0, 3).map((note, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2 text-xs rounded p-2",
                note.confidence === "high"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : note.confidence === "medium"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-muted/10 text-muted-foreground"
              )}
            >
              <span className="mt-0.5">
                {note.type === "aio_proof" ? "🎯" : "📈"}
              </span>
              <span>{note.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatWeekShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
