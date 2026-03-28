"use client";

import { useEffect, useState, useCallback } from "react";
import { History, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface Scan {
  id: string;
  scan_type: string;
  status: string;
  platforms_scanned: string[];
  profiles_checked: number;
  profiles_found: number;
  profiles_consistent: number;
  profiles_inconsistent: number;
  profiles_missing: number;
  issues_found: number;
  tasks_created: number;
  overall_consistency_score: number | null;
  credits_used: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    label: "Completed",
  },
  failed: { icon: XCircle, color: "text-red-400", label: "Failed" },
  running: { icon: Loader2, color: "text-blue-500", label: "Running" },
  pending: { icon: Clock, color: "text-muted-foreground", label: "Pending" },
  cancelled: { icon: XCircle, color: "text-zinc-400", label: "Cancelled" },
};

const SCAN_TYPE_LABELS: Record<string, string> = {
  full: "Full Scan",
  quick: "Quick Scan",
  single: "Single Platform",
  schema_only: "Schema Only",
};

function getScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "\u2014";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

export default function ScansPage() {
  useEffect(() => { document.title = "Entity Sync — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/entity/scans?clientId=${selectedClientId}&limit=50`
      );
      if (res.ok) {
        const data = await res.json();
        setScans(data.data || []);
      }
    } catch {
      // silently fail
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
        <h2 className="text-lg font-semibold">Scan History</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={History}
            title="No client selected"
            description="Select a client to view their entity scan history."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Scan History</h2>
        <p className="text-sm text-muted-foreground">Loading scans...</p>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 h-24 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Scan History</h2>
        <p className="text-sm text-muted-foreground">
          Entity scan runs for {selectedClientName}
        </p>
      </div>

      {scans.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={History}
            title="No scans yet"
            description="Run an entity scan from the overview page to get started."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => {
            const statusConfig =
              STATUS_CONFIG[scan.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            const duration = formatDuration(scan.started_at, scan.completed_at);

            return (
              <div
                key={scan.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        statusConfig.color,
                        scan.status === "running" && "animate-spin"
                      )}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {SCAN_TYPE_LABELS[scan.scan_type] ?? scan.scan_type}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            scan.status === "completed"
                              ? "border-emerald-500/30 text-emerald-500"
                              : scan.status === "failed"
                                ? "border-red-500/30 text-red-400"
                                : "border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(scan.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        <span>&middot;</span>
                        <span>Duration: {duration}</span>
                        {scan.credits_used > 0 && (
                          <>
                            <span>&middot;</span>
                            <span>{scan.credits_used} credits</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consistency score */}
                  {scan.overall_consistency_score !== null && (
                    <div className="text-right">
                      <span
                        className={cn(
                          "text-xl font-bold tabular-nums",
                          getScoreColor(scan.overall_consistency_score)
                        )}
                      >
                        {scan.overall_consistency_score}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /100
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                {scan.status === "completed" && (
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground">
                        {scan.platforms_scanned?.length ?? 0}
                      </span>{" "}
                      platforms scanned
                    </span>
                    <span>
                      <span className="font-medium text-foreground">
                        {scan.profiles_found}
                      </span>{" "}
                      found
                    </span>
                    <span>
                      <span className="font-medium text-emerald-500">
                        {scan.profiles_consistent}
                      </span>{" "}
                      consistent
                    </span>
                    <span>
                      <span className="font-medium text-amber-500">
                        {scan.profiles_inconsistent}
                      </span>{" "}
                      inconsistent
                    </span>
                    <span>
                      <span className="font-medium text-muted-foreground">
                        {scan.profiles_missing}
                      </span>{" "}
                      missing
                    </span>
                    {scan.issues_found > 0 && (
                      <span>
                        <span className="font-medium text-amber-500">
                          {scan.issues_found}
                        </span>{" "}
                        issues
                      </span>
                    )}
                    {scan.tasks_created > 0 && (
                      <span>
                        <span className="font-medium text-primary">
                          {scan.tasks_created}
                        </span>{" "}
                        tasks created
                      </span>
                    )}
                  </div>
                )}

                {/* Error message */}
                {scan.error_message && (
                  <div className="mt-3 rounded-md bg-red-500/5 border border-red-500/20 px-3 py-2">
                    <p className="text-xs text-red-400">
                      {scan.error_message}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
