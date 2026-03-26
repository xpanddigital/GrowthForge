"use client";

import { useEffect, useState, useCallback } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { CorrelationTimeline } from "@/components/monitor/correlation-timeline";
import { Activity } from "lucide-react";

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

export default function MonitorTimelinePage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/monitor/timeline?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data);
      }
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Correlation Timeline</h2>
        <EmptyState
          icon={Activity}
          title="No client selected"
          description="Select a client to view the correlation timeline."
        />
      </div>
    );
  }

  // Aggregate correlation notes across all entries
  const allNotes = timeline.flatMap((entry) =>
    (entry.correlation_notes || []).map((note) => ({
      ...note,
      week: entry.week_start,
    }))
  );

  const highConfNotes = allNotes.filter((n) => n.confidence === "high");
  const medConfNotes = allNotes.filter((n) => n.confidence === "medium");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Correlation Timeline</h2>
        <p className="text-sm text-muted-foreground">
          Cross-module correlation between Citation Engine activity and AI visibility for{" "}
          {selectedClientName}
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-6 h-64 animate-pulse" />
      ) : timeline.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No correlation data"
          description="Run monitoring scans and Citation Engine campaigns to build correlation data."
        />
      ) : (
        <>
          {/* Main chart */}
          <CorrelationTimeline data={timeline} />

          {/* Insight summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* High confidence insights */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                High Confidence Correlations
              </h3>
              {highConfNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No high-confidence correlations detected yet. Continue running campaigns to build data.
                </p>
              ) : (
                <div className="space-y-2">
                  {highConfNotes.map((note, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs rounded p-2 bg-emerald-500/10 text-emerald-400"
                    >
                      <span className="mt-0.5">
                        {note.type === "aio_proof" ? "🎯" : "📈"}
                      </span>
                      <div>
                        <p>{note.message}</p>
                        <p className="text-[10px] text-emerald-400/60 mt-0.5">
                          Week of {new Date(note.week).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medium confidence insights */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Emerging Patterns
              </h3>
              {medConfNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No emerging patterns detected yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {medConfNotes.map((note, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs rounded p-2 bg-amber-500/10 text-amber-400"
                    >
                      <span className="mt-0.5">📊</span>
                      <div>
                        <p>{note.message}</p>
                        <p className="text-[10px] text-amber-400/60 mt-0.5">
                          Week of {new Date(note.week).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-lg border border-border bg-muted/10 p-4">
            <h4 className="text-xs font-medium text-foreground mb-2">How Correlation Works</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              MentionLayer tracks your Citation Engine activity (responses posted per week) alongside
              your AI Visibility Score over time. When AI models update their training data or re-crawl
              sources, there is typically a 2-3 week lag between posting activity and visibility changes.
              Direct proof occurs when Google AI Overviews cite a specific thread where your response was
              posted. These correlations are automatically detected and flagged.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
