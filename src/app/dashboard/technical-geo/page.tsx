"use client";

import { useEffect, useState, useCallback } from "react";
import { Globe, RefreshCw, Loader2, Bot, Clock, FileText, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { TechGeoScoreCard } from "@/components/technical-geo/score-card";
import { useClientContext } from "@/hooks/use-client-context";

interface TechnicalGeoScan {
  id: string;
  client_id: string;
  scan_type: string;
  status: string;
  robots_score: number | null;
  freshness_score: number | null;
  citability_score: number | null;
  schema_ssr_score: number | null;
  composite_score: number | null;
  findings: Record<string, unknown>;
  recommendations: Array<{
    action: string;
    impact: string;
    effort: string;
    module: string;
  }>;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

function getImpactColor(impact: string): string {
  switch (impact) {
    case "high":
      return "text-red-400";
    case "medium":
      return "text-amber-400";
    case "low":
      return "text-emerald-400";
    default:
      return "text-zinc-400";
  }
}

export default function TechnicalGeoPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [scan, setScan] = useState<TechnicalGeoScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchLatest = useCallback(async () => {
    if (!selectedClientId) {
      setScan(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/technical-geo/results?clientId=${selectedClientId}`
      );
      const json = await res.json();
      setScan(json.data?.scan || null);
    } catch {
      setScan(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const triggerScan = async () => {
    if (!selectedClientId) return;
    setTriggering(true);
    try {
      await fetch("/api/technical-geo/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, scanType: "full" }),
      });
      // Poll for completion
      setTimeout(() => fetchLatest(), 3000);
      setTimeout(() => fetchLatest(), 10000);
      setTimeout(() => fetchLatest(), 30000);
    } finally {
      setTriggering(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Globe}
          title="Select a client"
          description="Choose a client from the dropdown to view their Technical GEO data."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Technical GEO</h1>
          <p className="text-sm text-zinc-400 mt-1">
            AI crawler access, content freshness, citability, and schema
            verification for {selectedClientName}
          </p>
        </div>
        <Button
          onClick={triggerScan}
          disabled={triggering || loading}
          className="bg-[#6C5CE7] hover:bg-[#5A4BD1]"
        >
          {triggering ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Run Scan
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : !scan ? (
        <EmptyState
          icon={Globe}
          title="No scans yet"
          description="Run your first Technical GEO scan to analyze AI crawler access, content freshness, citability, and schema rendering."
          action={
            <Button
              onClick={triggerScan}
              className="bg-[#6C5CE7] hover:bg-[#5A4BD1]"
            >
              Run First Scan
            </Button>
          }
        />
      ) : (
        <>
          {/* Status banner */}
          {scan.status === "running" && (
            <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              <span className="text-sm text-amber-300">
                Scan in progress... This may take a few minutes.
              </span>
            </div>
          )}

          {scan.status === "failed" && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              <span className="text-sm text-red-300">
                Scan failed: {scan.error_message || "Unknown error"}
              </span>
            </div>
          )}

          {/* Score cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TechGeoScoreCard
              title="robots.txt"
              score={scan.robots_score}
              icon={<Bot className="h-5 w-5" />}
              status={scan.status as "completed" | "running"}
              description="AI crawler access configuration"
            />
            <TechGeoScoreCard
              title="Content Freshness"
              score={scan.freshness_score}
              icon={<Clock className="h-5 w-5" />}
              status={scan.status as "completed" | "running"}
              description="Page update recency across your site"
            />
            <TechGeoScoreCard
              title="Citability"
              score={scan.citability_score}
              icon={<FileText className="h-5 w-5" />}
              status={scan.status as "completed" | "running"}
              description="Content structure for AI citation"
            />
            <TechGeoScoreCard
              title="Schema SSR"
              score={scan.schema_ssr_score}
              icon={<Code className="h-5 w-5" />}
              status={scan.status as "completed" | "running"}
              description="Server-side rendered schema markup"
            />
          </div>

          {/* Composite score */}
          {scan.composite_score !== null && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-zinc-100">
                  {scan.composite_score}
                  <span className="text-lg text-zinc-500">/100</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-200">
                    Technical GEO Score
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Last scanned{" "}
                    {scan.completed_at
                      ? new Date(scan.completed_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {scan.recommendations && scan.recommendations.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-lg font-semibold text-zinc-200 mb-4">
                Recommendations
              </h3>
              <div className="space-y-3">
                {scan.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50"
                  >
                    <span className="text-sm font-medium text-zinc-500 mt-0.5">
                      {i + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-300">{rec.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={getImpactColor(rec.impact)}
                        >
                          {rec.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-zinc-500">
                          {rec.effort} effort
                        </Badge>
                        <Badge variant="outline" className="text-zinc-500">
                          {rec.module}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
