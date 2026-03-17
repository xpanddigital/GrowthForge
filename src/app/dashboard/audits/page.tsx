"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Plus, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { AuditScoreRing } from "@/components/audits/audit-score-ring";
import { useClientContext } from "@/hooks/use-client-context";
import { createClient } from "@/lib/supabase/client";
import type { Audit } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PILLARS = ["citations", "ai_presence", "entities", "reviews", "press"] as const;

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "running":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

function getAuditTypeLabel(type: string): string {
  switch (type) {
    case "full":
      return "Full Audit";
    case "citation_only":
      return "Citation Only";
    case "ai_presence_only":
      return "AI Presence Only";
    case "quick":
      return "Quick Audit";
    default:
      return type;
  }
}

function getScoreBarColor(score: number): string {
  if (score <= 30) return "bg-[#EF4444]";
  if (score <= 60) return "bg-[#F59E0B]";
  return "bg-[#10B981]";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AuditsPage() {
  const router = useRouter();
  const { selectedClientId, selectedClientName } = useClientContext();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchAudits = useCallback(async () => {
    if (!selectedClientId) {
      setAudits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("client_id", selectedClientId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAudits(data as Audit[]);
    }
    setLoading(false);
  }, [selectedClientId]);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  async function handleRunAudit() {
    if (!selectedClientId) return;

    setCreating(true);

    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClientId,
          audit_type: "full",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.data?.auditId) {
        console.error("Failed to create audit:", result.error);
        setCreating(false);
        return;
      }

      setCreating(false);
      router.push(`/dashboard/audits/${result.data.auditId}`);
    } catch (error) {
      console.error("Failed to create audit:", error);
      setCreating(false);
    }
  }

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">AI Visibility Audits</h2>
          <p className="text-sm text-muted-foreground">
            Run comprehensive audits to measure AI visibility across 5 pillars.
          </p>
        </div>
        <EmptyState
          icon={ClipboardCheck}
          title="No client selected"
          description="Select a client from the header dropdown to view and run AI Visibility Audits."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Visibility Audits</h2>
          <p className="text-sm text-muted-foreground">
            Audit history for {selectedClientName}
          </p>
        </div>
        <Button onClick={handleRunAudit} disabled={creating}>
          {creating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Run New Audit
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && audits.length === 0 && (
        <EmptyState
          icon={ClipboardCheck}
          title="No audits yet"
          description="Run your first AI Visibility Audit to establish a baseline score and identify opportunities."
          action={
            <Button onClick={handleRunAudit} disabled={creating}>
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="mr-2 h-4 w-4" />
              )}
              Run AI Visibility Audit
            </Button>
          }
        />
      )}

      {/* Audit list */}
      {!loading && audits.length > 0 && (
        <div className="space-y-3">
          {audits.map((audit) => (
            <div
              key={audit.id}
              className="group flex items-center gap-6 rounded-lg border bg-card p-4 transition-colors hover:border-primary/30"
            >
              {/* Composite score */}
              <div className="shrink-0">
                {audit.composite_score != null ? (
                  <AuditScoreRing score={audit.composite_score} size="md" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-muted">
                    {audit.status === "running" ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <span className="text-sm text-muted-foreground">--</span>
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getStatusBadgeVariant(audit.status)}>
                    {audit.status}
                  </Badge>
                  <Badge variant="outline">{getAuditTypeLabel(audit.audit_type)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(audit.created_at)}
                  </span>
                </div>

                {/* Pillar mini bars */}
                {audit.status === "completed" && (
                  <div className="mt-2 flex items-center gap-4">
                    {[
                      { key: "citation_score", label: "CIT" },
                      { key: "ai_presence_score", label: "AI" },
                      { key: "entity_score", label: "ENT" },
                      { key: "review_score", label: "REV" },
                      { key: "press_score", label: "PRS" },
                    ].map(({ key, label }) => {
                      const score = audit[key as keyof Audit] as number | null;
                      return (
                        <div key={key} className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-6">
                            {label}
                          </span>
                          <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score != null ? getScoreBarColor(score) : "bg-muted"
                              }`}
                              style={{ width: `${score ?? 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium w-5 text-right">
                            {score ?? "--"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/audits/${audit.id}`)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
