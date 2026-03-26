"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UpgradeCTA } from "@/components/free-audit/upgrade-cta";
import type { Audit, AuditPillarResult } from "@/types/database";

const PILLAR_LABELS: Record<string, string> = {
  citations: "Citations",
  ai_presence: "AI Presence",
  entities: "Entities",
  reviews: "Reviews",
  press: "Press",
};

const PILLAR_COLORS: Record<string, string> = {
  citations: "bg-blue-500",
  ai_presence: "bg-purple-500",
  entities: "bg-teal-500",
  reviews: "bg-amber-500",
  press: "bg-pink-500",
};

function ScoreRing({ score }: { score: number | null }) {
  const s = score ?? 0;
  const color = s >= 70 ? "text-green-500" : s >= 40 ? "text-amber-500" : "text-red-500";
  const dashOffset = 352 - (s / 100) * 352;

  return (
    <div className="relative h-40 w-40">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
        <circle
          cx="64"
          cy="64"
          r="56"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray="352"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={`${color} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{s}</span>
        <span className="text-sm text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function PillarBar({ pillar, score }: { pillar: string; score: number }) {
  const color = PILLAR_COLORS[pillar] || "bg-primary";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{PILLAR_LABELS[pillar] || pillar}</span>
        <span className="text-muted-foreground">{score}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function FreeAuditResultsPage() {
  const { auditId } = useParams<{ auditId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [audit, setAudit] = useState<Audit | null>(null);
  const [pillars, setPillars] = useState<AuditPillarResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      if (!auditId) return;

      const { data: auditData } = await supabase
        .from("audits")
        .select("*")
        .eq("id", auditId)
        .single();

      if (!auditData) {
        router.push("/free-audit/setup");
        return;
      }

      // If audit is still running, redirect to progress
      if (auditData.status !== "completed") {
        router.push(`/free-audit/progress?audit_id=${auditId}`);
        return;
      }

      setAudit(auditData);

      const { data: pillarData } = await supabase
        .from("audit_pillar_results")
        .select("*")
        .eq("audit_id", auditId)
        .order("created_at", { ascending: true });

      if (pillarData) {
        setPillars(pillarData);
      }

      setLoading(false);
    }

    loadAudit();
  }, [auditId, supabase, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!audit) return null;

  const actionPlan = (audit.action_plan || []) as Array<{
    priority?: number;
    pillar?: string;
    action?: string;
    impact?: string;
    effort?: string;
    timeline?: string;
  }>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-primary">Growth</span>Forge
          </h1>
          <span className="text-sm text-muted-foreground">AI Visibility Audit</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {/* Composite Score */}
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold">Your AI Visibility Score</h2>
          <ScoreRing score={audit.composite_score} />
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {(audit.composite_score ?? 0) < 30
              ? "Your brand has very low AI visibility. There's significant opportunity to improve."
              : (audit.composite_score ?? 0) < 60
              ? "Your brand has moderate AI visibility with clear room for improvement."
              : "Your brand has strong AI visibility. Focus on maintaining and expanding."}
          </p>
        </div>

        {/* Pillar Scores */}
        <div className="rounded-lg border border-border p-6 space-y-4">
          <h3 className="font-semibold">Pillar Breakdown</h3>
          {pillars.map((p) => (
            <PillarBar key={p.pillar} pillar={p.pillar} score={p.score} />
          ))}
        </div>

        {/* Executive Summary */}
        {audit.executive_summary && (
          <div className="rounded-lg border border-border p-6 space-y-3">
            <h3 className="font-semibold">Executive Summary</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {audit.executive_summary}
            </div>
          </div>
        )}

        {/* Top 3 Actions */}
        {actionPlan.length > 0 && (
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold">Recommended Actions</h3>
            <div className="space-y-3">
              {actionPlan.slice(0, 3).map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-muted/50 p-4"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {action.priority || i + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{action.action}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {action.impact && (
                        <span>
                          Impact:{" "}
                          <span
                            className={
                              action.impact === "high"
                                ? "text-green-500"
                                : action.impact === "medium"
                                ? "text-amber-500"
                                : "text-muted-foreground"
                            }
                          >
                            {action.impact}
                          </span>
                        </span>
                      )}
                      {action.effort && <span>Effort: {action.effort}</span>}
                      {action.timeline && <span>{action.timeline}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {actionPlan.length > 3 && (
              <p className="text-xs text-muted-foreground">
                + {actionPlan.length - 3} more actions in the full report
              </p>
            )}
          </div>
        )}

        {/* Upgrade CTA */}
        <UpgradeCTA />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-8">
          Powered by GrowthForge — The AI SEO Platform by Xpand Digital
        </p>
      </div>
    </div>
  );
}
