"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditScoreRing } from "@/components/audits/audit-score-ring";
import { PillarScoreCard } from "@/components/audits/pillar-score-card";
import { ActionPlanList } from "@/components/audits/action-plan-list";
import { createClient } from "@/lib/supabase/client";
import type { Audit, AuditPillarResult } from "@/types/database";

const PILLAR_ORDER = [
  "citations",
  "ai_presence",
  "entities",
  "reviews",
  "press",
] as const;

const PILLAR_LABELS: Record<string, string> = {
  citations: "Citations",
  ai_presence: "AI Presence",
  entities: "Entities",
  reviews: "Reviews",
  press: "Press",
};

// ------------------------------------------------------------------
// No mock data — audit uses real backend pipeline via /api/audits
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function AuditDetailPage() {
  useEffect(() => { document.title = "Audit Results — MentionLayer"; }, []);

  const params = useParams();
  const router = useRouter();
  const auditId = params.auditId as string;

  const [audit, setAudit] = useState<Audit | null>(null);
  const [pillars, setPillars] = useState<AuditPillarResult[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAuditData = useCallback(async () => {
    const supabase = createClient();

    const [auditRes, pillarsRes] = await Promise.all([
      supabase.from("audits").select("*").eq("id", auditId).single(),
      supabase
        .from("audit_pillar_results")
        .select("*")
        .eq("audit_id", auditId)
        .order("created_at", { ascending: true }),
    ]);

    if (auditRes.data) setAudit(auditRes.data as Audit);
    if (pillarsRes.data) setPillars(pillarsRes.data as AuditPillarResult[]);
    setLoading(false);

    return auditRes.data as Audit | null;
  }, [auditId]);

  // Initial fetch
  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  // Polling for running audits
  useEffect(() => {
    if (audit?.status === "running") {
      pollRef.current = setInterval(() => {
        fetchAuditData();
      }, 3000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [audit?.status, fetchAuditData]);

  // Stop polling when audit completes
  useEffect(() => {
    if (audit?.status === "completed" && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [audit?.status]);

  // Polling also covers "pending" status (backend will flip to "running")
  useEffect(() => {
    if (audit?.status === "pending") {
      pollRef.current = setInterval(() => {
        fetchAuditData();
      }, 3000);
    }

    return () => {
      if (pollRef.current && audit?.status === "pending") {
        clearInterval(pollRef.current);
      }
    };
  }, [audit?.status, fetchAuditData]);

  async function handleRerunAudit() {
    if (!audit) return;

    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: audit.client_id,
          audit_type: "full",
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.data?.auditId) return;

      router.push(`/dashboard/audits/${result.data.auditId}`);
    } catch (error) {
      console.error("Failed to re-run audit:", error);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-40 rounded-full mx-auto" />
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/audits")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Audits
        </Button>
        <p className="text-muted-foreground">Audit not found.</p>
      </div>
    );
  }

  const isRunning = audit.status === "running" || audit.status === "pending";
  const isCompleted = audit.status === "completed";
  const completedPillars = pillars.filter((p) => p.status === "completed").length;

  // Sort pillars to match PILLAR_ORDER
  const orderedPillars = PILLAR_ORDER.map(
    (name) => pillars.find((p) => p.pillar === name) || null
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/audits")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Audits
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Visibility Audit</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  audit.status === "completed"
                    ? "default"
                    : audit.status === "running"
                    ? "secondary"
                    : audit.status === "failed"
                    ? "destructive"
                    : "outline"
                }
              >
                {audit.status}
              </Badge>
              <Badge variant="outline">
                {audit.audit_type === "full" ? "Full Audit" : audit.audit_type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(audit.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {isCompleted && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `/dashboard/audits/${auditId}/report`,
                    "_blank"
                  )
                }
              >
                Download Report
              </Button>
              <Button variant="outline" onClick={handleRerunAudit}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-run Audit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Running / Progress view */}
      {isRunning && (
        <div className="rounded-lg border bg-card p-8">
          <div className="text-center mb-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Audit in Progress</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Scanning across 5 pillars...
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {completedPillars}/5 pillars complete
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(completedPillars / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Pillar status list */}
          <div className="space-y-3">
            {orderedPillars.map((pillar, idx) => {
              const name = PILLAR_ORDER[idx];
              const status = pillar?.status || "pending";
              const score = pillar?.score;

              return (
                <div
                  key={name}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                    ) : status === "running" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : status === "failed" ? (
                      <XCircle className="h-5 w-5 text-[#EF4444]" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                    <span
                      className={
                        status === "completed" || status === "running"
                          ? "font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {PILLAR_LABELS[name]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {status === "completed" && score != null && (
                      <span
                        className={`text-sm font-bold ${
                          score <= 30
                            ? "text-[#EF4444]"
                            : score <= 60
                            ? "text-[#F59E0B]"
                            : "text-[#10B981]"
                        }`}
                      >
                        {score}/100
                      </span>
                    )}
                    {status === "running" && (
                      <span className="text-xs text-muted-foreground">
                        Scanning...
                      </span>
                    )}
                    {status === "pending" && (
                      <span className="text-xs text-muted-foreground">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed results view */}
      {isCompleted && (
        <>
          {/* Composite score hero */}
          <div className="flex flex-col items-center py-8">
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
              AI Visibility Score
            </p>
            <AuditScoreRing
              score={audit.composite_score ?? 0}
              size="lg"
            />
            <p className="text-sm text-muted-foreground mt-3">out of 100</p>
          </div>

          {/* 5 Pillar score cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {orderedPillars.map((pillar, idx) => {
              const name = PILLAR_ORDER[idx];
              return (
                <PillarScoreCard
                  key={name}
                  pillar={name}
                  score={pillar?.score ?? 0}
                  status={pillar?.status ?? "pending"}
                />
              );
            })}
          </div>

          {/* Executive Summary */}
          {audit.executive_summary && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-base font-semibold mb-3">
                Executive Summary
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {audit.executive_summary}
              </p>
            </div>
          )}

          {/* Action Plan */}
          {audit.action_plan && audit.action_plan.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-4">
                Recommended Action Plan
              </h3>
              <ActionPlanList
                actions={
                  audit.action_plan as Array<{
                    priority: number;
                    pillar: string;
                    action: string;
                    impact: string;
                    effort: string;
                    timeline: string;
                    module: string;
                  }>
                }
              />
            </div>
          )}

          {/* Pillar details */}
          <div>
            <h3 className="text-base font-semibold mb-4">Pillar Details</h3>
            <div className="space-y-4">
              {orderedPillars.map((pillar, idx) => {
                const name = PILLAR_ORDER[idx];
                if (!pillar || pillar.status !== "completed") return null;

                return (
                  <div
                    key={name}
                    className="rounded-lg border bg-card p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">
                        {PILLAR_LABELS[name]}
                      </h4>
                      <span
                        className={`text-lg font-bold ${
                          pillar.score <= 30
                            ? "text-[#EF4444]"
                            : pillar.score <= 60
                            ? "text-[#F59E0B]"
                            : "text-[#10B981]"
                        }`}
                      >
                        {pillar.score}/100
                      </span>
                    </div>
                    {pillar.summary && (
                      <p className="text-sm text-muted-foreground">
                        {pillar.summary}
                      </p>
                    )}
                    {pillar.findings &&
                      Object.keys(pillar.findings).length > 0 && (
                        <div className="mt-3 rounded-md bg-muted/30 p-3">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            Key Findings
                          </p>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                            {Object.entries(pillar.findings)
                              .filter(
                                ([, v]) =>
                                  typeof v === "number" ||
                                  typeof v === "string" ||
                                  typeof v === "boolean"
                              )
                              .map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs py-0.5">
                                  <span className="text-muted-foreground">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <span className="font-medium ml-2">
                                    {typeof value === "boolean"
                                      ? value
                                        ? "Yes"
                                        : "No"
                                      : String(value)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Failed state */}
      {audit.status === "failed" && (
        <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/5 p-8 text-center">
          <XCircle className="h-10 w-10 text-[#EF4444] mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">Audit Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Something went wrong during the audit. Please try again.
          </p>
          <Button onClick={handleRerunAudit}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Audit
          </Button>
        </div>
      )}
    </div>
  );
}
