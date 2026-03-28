"use client";

import { useEffect, useState, useCallback } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { ContentGapCard } from "@/components/monitor/content-gap-card";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

interface ContentGap {
  id: string;
  topic: string;
  competitor_advantage: string;
  recommended_content: string;
  content_type: string;
  publish_target: string;
  impact: "high" | "medium" | "low";
  detail: string;
  status: string;
  created_at: string;
}

export default function MonitorGapsPage() {
  useEffect(() => { document.title = "AI Monitor — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("open");

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ clientId: selectedClientId });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/monitor/content-gaps?${params}`);
      if (res.ok) {
        const data = await res.json();
        setGaps(data);
      }
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (gapId: string, status: string) => {
    // Optimistic update
    setGaps((prev) =>
      prev.map((g) => (g.id === gapId ? { ...g, status } : g))
    );
    // In production: PATCH /api/monitor/content-gaps
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Content Gaps</h2>
        <EmptyState
          icon={Lightbulb}
          title="No client selected"
          description="Select a client to view content gap recommendations."
        />
      </div>
    );
  }

  const filteredGaps = statusFilter === "all" ? gaps : gaps.filter((g) => g.status === statusFilter);

  const highImpactCount = gaps.filter((g) => g.impact === "high" && g.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Content Gaps</h2>
          <p className="text-sm text-muted-foreground">
            AI-identified content opportunities for {selectedClientName}
          </p>
        </div>
        {highImpactCount > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 font-medium">
            {highImpactCount} high-impact gap{highImpactCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-1">
        {["all", "open", "in_progress", "completed", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "text-xs px-2.5 py-1 rounded transition-colors capitalize",
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {s === "in_progress" ? "In Progress" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-32 animate-pulse" />
          ))}
        </div>
      ) : filteredGaps.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={statusFilter === "open" ? "No open content gaps" : "No gaps found"}
          description={
            statusFilter === "open"
              ? "Content gap analysis runs monthly. Check back after the next scan."
              : "Try changing the status filter."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredGaps.map((gap) => (
            <ContentGapCard
              key={gap.id}
              gap={gap}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="rounded-lg border border-border bg-muted/10 p-4">
        <p className="text-xs text-muted-foreground">
          Content gap analysis runs automatically on the first week of each month, or can be
          triggered manually during a monitoring scan. It identifies topics where competitors are
          cited by AI models but your brand is not, and recommends specific content to create.
        </p>
      </div>
    </div>
  );
}
