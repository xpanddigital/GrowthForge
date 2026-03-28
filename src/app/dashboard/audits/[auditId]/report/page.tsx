"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditData {
  id: string;
  client_id: string;
  audit_type: string;
  status: string;
  composite_score: number | null;
  citation_score: number | null;
  ai_presence_score: number | null;
  entity_score: number | null;
  review_score: number | null;
  press_score: number | null;
  executive_summary: string | null;
  action_plan: Array<{
    priority: number;
    pillar: string;
    action: string;
    impact: string;
    effort: string;
    timeline: string;
    module: string;
  }>;
  completed_at: string | null;
  created_at: string;
}

interface PillarResult {
  pillar: string;
  score: number;
  status: string;
  summary: string | null;
  findings: Record<string, unknown>;
  recommendations: Array<{
    action: string;
    impact: string;
    effort: string;
  }>;
}

interface ClientData {
  name: string;
  website_url: string | null;
}

const PILLAR_LABELS: Record<string, string> = {
  citations: "Citation Presence",
  ai_presence: "AI Model Visibility",
  entities: "Entity Consistency",
  reviews: "Review Authority",
  press: "Press & Earned Media",
};

function getScoreColor(score: number): string {
  if (score <= 30) return "#EF4444";
  if (score <= 60) return "#F59E0B";
  return "#10B981";
}

function getScoreLabel(score: number): string {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Poor";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "Good";
  return "Excellent";
}

function getImpactColor(impact: string): string {
  if (impact === "high") return "#EF4444";
  if (impact === "medium") return "#F59E0B";
  return "#10B981";
}

export default function AuditReportPage() {
  useEffect(() => { document.title = "Audit Results — MentionLayer"; }, []);

  const params = useParams();
  const auditId = params.auditId as string;
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [pillars, setPillars] = useState<PillarResult[]>([]);
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: auditData } = await supabase
        .from("audits")
        .select("*")
        .eq("id", auditId)
        .single();

      if (!auditData) return;
      setAudit(auditData as AuditData);

      const { data: pillarData } = await supabase
        .from("audit_pillar_results")
        .select("*")
        .eq("audit_id", auditId)
        .order("pillar");

      if (pillarData) setPillars(pillarData as PillarResult[]);

      const { data: clientData } = await supabase
        .from("clients")
        .select("name, website_url")
        .eq("id", auditData.client_id)
        .single();

      if (clientData) setClient(clientData as ClientData);
      setLoading(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading report...</p>
      </div>
    );
  }

  if (!audit || !client) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Audit not found</p>
      </div>
    );
  }

  const completedPillars = pillars.filter((p) => p.status === "completed");

  return (
    <>
      {/* Print controls — hidden when printing */}
      <div className="fixed right-4 top-4 z-50 flex gap-2 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print / Save PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
        >
          Back
        </Button>
      </div>

      {/* Report content — print-optimized */}
      <div className="mx-auto max-w-4xl bg-white p-8 text-black print:p-0">
        {/* Header */}
        <div className="mb-8 border-b-2 border-gray-900 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Visibility Audit Report
              </h1>
              <p className="mt-1 text-lg text-gray-600">{client.name}</p>
              {client.website_url && (
                <p className="text-sm text-gray-400">{client.website_url}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-purple-600">
                GrowthForge
              </p>
              <p className="text-xs text-gray-500">
                {audit.completed_at
                  ? new Date(audit.completed_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "In Progress"}
              </p>
            </div>
          </div>
        </div>

        {/* Composite Score */}
        <div className="mb-8 rounded-lg border-2 border-gray-200 p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            AI Visibility Score
          </p>
          <p
            className="mt-2 text-6xl font-bold"
            style={{ color: getScoreColor(audit.composite_score || 0) }}
          >
            {audit.composite_score || 0}
            <span className="text-2xl text-gray-400">/100</span>
          </p>
          <p
            className="mt-1 text-lg font-medium"
            style={{ color: getScoreColor(audit.composite_score || 0) }}
          >
            {getScoreLabel(audit.composite_score || 0)}
          </p>
        </div>

        {/* Pillar Scores */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Pillar Breakdown
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {["citations", "ai_presence", "entities", "reviews", "press"].map(
              (pillarKey) => {
                const pillar = completedPillars.find(
                  (p) => p.pillar === pillarKey
                );
                const score = pillar?.score || 0;
                return (
                  <div
                    key={pillarKey}
                    className="rounded-lg border border-gray-200 p-4 text-center"
                  >
                    <p className="text-xs font-medium text-gray-500">
                      {PILLAR_LABELS[pillarKey] || pillarKey}
                    </p>
                    <p
                      className="mt-2 text-3xl font-bold"
                      style={{ color: getScoreColor(score) }}
                    >
                      {score}
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${score}%`,
                          backgroundColor: getScoreColor(score),
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {audit.executive_summary && (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              Executive Summary
            </h2>
            <div className="rounded-lg bg-gray-50 p-5">
              {audit.executive_summary.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mb-3 text-sm leading-relaxed text-gray-700 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Action Plan */}
        {audit.action_plan && audit.action_plan.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              Recommended Action Plan
            </h2>
            <div className="space-y-3">
              {audit.action_plan.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                      backgroundColor: getImpactColor(action.impact),
                    }}
                  >
                    {action.priority}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {action.action}
                    </p>
                    <div className="mt-1 flex gap-4 text-xs text-gray-500">
                      <span>
                        Impact:{" "}
                        <span
                          className="font-medium"
                          style={{ color: getImpactColor(action.impact) }}
                        >
                          {action.impact}
                        </span>
                      </span>
                      <span>Effort: {action.effort}</span>
                      <span>Timeline: {action.timeline}</span>
                      <span>Module: {action.module}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pillar Detail Sections */}
        {completedPillars.map((pillar) => (
          <div
            key={pillar.pillar}
            className="mb-6 break-inside-avoid rounded-lg border border-gray-200 p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {PILLAR_LABELS[pillar.pillar] || pillar.pillar}
              </h3>
              <span
                className="text-2xl font-bold"
                style={{ color: getScoreColor(pillar.score) }}
              >
                {pillar.score}/100
              </span>
            </div>
            {pillar.summary && (
              <p className="mb-3 text-sm text-gray-600">{pillar.summary}</p>
            )}
            {pillar.recommendations && pillar.recommendations.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Recommendations
                </p>
                <ul className="space-y-1">
                  {pillar.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-0.5 text-gray-400">-</span>
                      {rec.action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-400">
            Generated by GrowthForge — AI Visibility Platform
          </p>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </>
  );
}
