"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClientContext } from "@/hooks/use-client-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  SlidersHorizontal,
  Activity,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Zap,
  Search as SearchIcon,
  Brain,
  Layers,
  Tag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DiscoveryRun } from "@/types/database";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "Running...";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const diffMs = end - start;
  if (diffMs < 1000) return `${diffMs}ms`;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// ---------------------------------------------------------------------------
// Run Type Badge
// ---------------------------------------------------------------------------

const runTypeConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  serp_scan: {
    label: "SERP Scan",
    className: "bg-blue-500/10 text-blue-500",
    icon: SearchIcon,
  },
  ai_probe: {
    label: "AI Probe",
    className: "bg-violet-500/10 text-violet-500",
    icon: Brain,
  },
  thread_enrich: {
    label: "Enrichment",
    className: "bg-amber-500/10 text-amber-500",
    icon: Layers,
  },
  classification: {
    label: "Classification",
    className: "bg-cyan-500/10 text-cyan-500",
    icon: Tag,
  },
  response_gen: {
    label: "Response Gen",
    className: "bg-emerald-500/10 text-emerald-500",
    icon: Sparkles,
  },
};

interface RunTypeBadgeProps {
  runType: string;
}

function RunTypeBadge({ runType }: RunTypeBadgeProps) {
  const config = runTypeConfig[runType] || {
    label: runType,
    className: "bg-muted text-muted-foreground",
    icon: Zap,
  };
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      <IconComponent className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Expandable Error Row
// ---------------------------------------------------------------------------

interface ErrorDetailsProps {
  errorMessage: string;
  errorDetails: Record<string, unknown> | null;
}

function ErrorDetails({ errorMessage, errorDetails }: ErrorDetailsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400"
      >
        <AlertCircle className="h-3 w-3" />
        Error
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      {expanded && (
        <div className="mt-1.5 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
          <p className="text-xs text-red-400">{errorMessage}</p>
          {errorDetails && Object.keys(errorDetails).length > 0 && (
            <pre className="mt-1.5 overflow-x-auto text-[10px] text-red-300/70">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function RunsTableSkeleton() {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Failed</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-6" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-6" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function DiscoveryRunsPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const supabase = createClient();

  const [runs, setRuns] = useState<DiscoveryRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = useCallback(async () => {
    if (!selectedClientId) {
      setRuns([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from("discovery_runs")
      .select("*")
      .eq("client_id", selectedClientId)
      .order("started_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setRuns(data as DiscoveryRun[]);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // ---------- No client selected ----------
  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/citations">
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold">Discovery Runs</h2>
            <p className="text-sm text-muted-foreground">
              History of discovery scans and processing jobs.
            </p>
          </div>
        </div>
        <EmptyState
          icon={SlidersHorizontal}
          title="Select a client"
          description="Choose a client from the dropdown in the header to view their discovery runs."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/citations">
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-semibold">Discovery Runs</h2>
          <p className="text-sm text-muted-foreground">
            History of discovery scans and processing jobs for{" "}
            <span className="font-medium text-foreground">
              {selectedClientName}
            </span>
            .
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <RunsTableSkeleton />
      ) : runs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No discovery runs yet"
          description="Run a scan from the Citation Engine to get started."
          action={
            <Link href="/dashboard/citations">
              <Button size="sm" className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Go to Citation Engine
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <RunTypeBadge runType={run.run_type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={run.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      <span className="font-medium text-foreground">
                        {run.items_succeeded}
                      </span>
                      <span className="text-muted-foreground">
                        /{run.items_total}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    {run.items_failed > 0 ? (
                      <span className="text-sm font-medium text-red-500">
                        {run.items_failed}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {run.credits_used}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {relativeTime(run.started_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {run.status === "running" ? (
                        <span className="inline-flex items-center gap-1 text-blue-500">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                          </span>
                          In progress
                        </span>
                      ) : (
                        formatDuration(run.started_at, run.completed_at)
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Expanded error messages rendered below relevant rows */}
          {runs.some((r) => r.error_message) && (
            <div className="border-t border-border px-4 py-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Errors
              </p>
              {runs
                .filter((r) => r.error_message)
                .map((run) => (
                  <div key={run.id} className="flex items-start gap-2">
                    <RunTypeBadge runType={run.run_type} />
                    <ErrorDetails
                      errorMessage={run.error_message!}
                      errorDetails={run.error_details}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
