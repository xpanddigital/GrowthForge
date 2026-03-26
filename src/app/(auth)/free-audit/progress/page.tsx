"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PILLAR_LABELS: Record<string, string> = {
  citations: "Citation Audit",
  ai_presence: "AI Presence",
  entities: "Entity Consistency",
  reviews: "Review Presence",
  press: "Press & Earned Media",
};

interface PillarResult {
  pillar: string;
  status: string;
  score: number;
}

export default function FreeAuditProgressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auditId = searchParams.get("audit_id");
  const supabase = createClient();

  const [pillars, setPillars] = useState<PillarResult[]>([]);
  const [auditStatus, setAuditStatus] = useState("pending");
  const [error, setError] = useState("");

  const pollAudit = useCallback(async () => {
    if (!auditId) return;

    const { data: audit } = await supabase
      .from("audits")
      .select("status, composite_score")
      .eq("id", auditId)
      .single();

    if (audit) {
      setAuditStatus(audit.status);
      if (audit.status === "completed") {
        // Short delay for final animation then redirect
        setTimeout(() => {
          router.push(`/free-audit/results/${auditId}`);
        }, 1500);
        return;
      }
      if (audit.status === "failed") {
        setError("The audit encountered an error. Please try again.");
        return;
      }
    }

    const { data: pillarResults } = await supabase
      .from("audit_pillar_results")
      .select("pillar, status, score")
      .eq("audit_id", auditId)
      .order("created_at", { ascending: true });

    if (pillarResults) {
      setPillars(pillarResults);
    }
  }, [auditId, supabase, router]);

  useEffect(() => {
    if (!auditId) {
      router.push("/free-audit/setup");
      return;
    }

    // Poll every 3 seconds
    pollAudit();
    const interval = setInterval(pollAudit, 3000);
    return () => clearInterval(interval);
  }, [auditId, router, pollAudit]);

  const completedCount = pillars.filter((p) => p.status === "completed").length;
  const totalCount = pillars.length || 5;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Growth</span>Forge
          </h1>
          <h2 className="text-lg font-semibold">Running Your AI Visibility Audit</h2>
          <p className="text-sm text-muted-foreground">
            We&apos;re scanning across 5 pillars. This usually takes 2-5 minutes.
          </p>
        </div>

        {/* Progress ring */}
        <div className="flex justify-center">
          <div className="relative h-32 w-32">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(completedCount / totalCount) * 352} 352`}
                strokeLinecap="round"
                className="text-primary transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{completedCount}/{totalCount}</span>
              <span className="text-xs text-muted-foreground">pillars</span>
            </div>
          </div>
        </div>

        {/* Pillar status list */}
        <div className="space-y-3 text-left">
          {(pillars.length > 0 ? pillars : Object.keys(PILLAR_LABELS).map((p) => ({ pillar: p, status: "pending", score: 0 }))).map(
            (p) => (
              <div
                key={p.pillar}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {p.status === "completed" ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : p.status === "running" ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : p.status === "failed" ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10">
                      <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted" />
                  )}
                  <span className="text-sm font-medium">
                    {PILLAR_LABELS[p.pillar] || p.pillar}
                  </span>
                </div>
                {p.status === "completed" && (
                  <span className="text-sm font-semibold text-primary">{p.score}/100</span>
                )}
                {p.status === "running" && (
                  <span className="text-xs text-muted-foreground">Scanning...</span>
                )}
              </div>
            )
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {auditStatus === "completed" && (
          <p className="text-sm text-primary font-medium">
            Audit complete! Redirecting to your results...
          </p>
        )}
      </div>
    </div>
  );
}
