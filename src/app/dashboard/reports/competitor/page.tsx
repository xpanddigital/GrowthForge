"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";

interface CompetitorReport {
  clientName: string;
  competitors: string[];
  generatedAt: string;
  pillarComparison: Array<{
    pillar: string;
    clientScore: number | null;
    competitorScores: Record<string, number | null>;
  }>;
  shareOfModel: Array<{
    model: string;
    clientSom: number;
    competitorSom: Record<string, number>;
  }>;
  metrics: Array<{
    name: string;
    clientValue: number | string;
    competitorValues: Record<string, number | string>;
    unit: string;
    higherIsBetter: boolean;
  }>;
  executiveSummary: string;
  keyFindings: string[];
  recommendations: Array<{
    priority: number;
    action: string;
    impact: string;
    relatesTo: string;
  }>;
  clientCompositeScore: number | null;
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-zinc-500";
  if (score <= 30) return "text-red-400";
  if (score <= 60) return "text-amber-400";
  return "text-emerald-400";
}

function formatPillar(pillar: string): string {
  return pillar
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function CompetitorReportPage() {
  useEffect(() => { document.title = "Reports — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [report, setReport] = useState<CompetitorReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    if (!selectedClientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setReport(json.data);
      }
    } catch {
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={BarChart3}
          title="Select a client"
          description="Choose a client to generate a competitor benchmark report."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Competitor Benchmark
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            AI visibility comparison for {selectedClientName} vs competitors
          </p>
        </div>
        <Button
          onClick={generateReport}
          disabled={loading}
          className="bg-[#6C5CE7] hover:bg-[#5A4BD1]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <BarChart3 className="h-4 w-4 mr-2" />
          )}
          Generate Report
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {!report && !loading && !error && (
        <EmptyState
          icon={BarChart3}
          title="No report generated"
          description="Click Generate Report to create a competitor benchmark comparing your AI visibility metrics."
          action={
            <Button
              onClick={generateReport}
              className="bg-[#6C5CE7] hover:bg-[#5A4BD1]"
            >
              Generate Report
            </Button>
          }
        />
      )}

      {report && (
        <>
          {/* Executive Summary */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">
              Executive Summary
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {report.executiveSummary}
            </p>
          </div>

          {/* Key Findings */}
          {report.keyFindings.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-3">
                Key Findings
              </h2>
              <ul className="space-y-2">
                {report.keyFindings.map((finding, i) => (
                  <li
                    key={i}
                    className="text-sm text-zinc-300 flex items-start gap-2"
                  >
                    <span className="text-[#6C5CE7] font-bold mt-0.5">
                      {i + 1}.
                    </span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pillar Comparison */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-200 mb-4">
              Audit Pillar Scores
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3">Pillar</th>
                    <th className="pb-3">{report.clientName}</th>
                    {report.competitors.map((comp) => (
                      <th key={comp} className="pb-3">
                        {comp}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {report.pillarComparison.map((pillar) => (
                    <tr key={pillar.pillar}>
                      <td className="py-3 text-sm text-zinc-300">
                        {formatPillar(pillar.pillar)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-sm font-bold ${getScoreColor(pillar.clientScore)}`}
                        >
                          {pillar.clientScore ?? "—"}
                        </span>
                      </td>
                      {report.competitors.map((comp) => (
                        <td key={comp} className="py-3">
                          <span className="text-sm text-zinc-500">
                            {pillar.competitorScores[comp] ?? "—"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Share of Model */}
          {report.shareOfModel.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-4">
                Share of Model by Platform
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-zinc-400 uppercase tracking-wider">
                      <th className="pb-3">AI Model</th>
                      <th className="pb-3">{report.clientName}</th>
                      {report.competitors.map((comp) => (
                        <th key={comp} className="pb-3">
                          {comp}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {report.shareOfModel.map((row) => (
                      <tr key={row.model}>
                        <td className="py-3 text-sm text-zinc-300 capitalize">
                          {row.model}
                        </td>
                        <td className="py-3">
                          <span className="text-sm font-bold text-[#6C5CE7]">
                            {row.clientSom}%
                          </span>
                        </td>
                        {report.competitors.map((comp) => (
                          <td key={comp} className="py-3">
                            <span className="text-sm text-zinc-400">
                              {row.competitorSom[comp] ?? 0}%
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          {report.metrics.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-4">
                Key Metrics
              </h2>
              <div className="space-y-4">
                {report.metrics.map((metric, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm text-zinc-400 w-48">
                      {metric.name}
                    </span>
                    <span className="text-sm font-bold text-zinc-100">
                      {metric.clientValue}
                      {metric.unit}
                    </span>
                    {Object.entries(metric.competitorValues).map(
                      ([comp, val]) => (
                        <span
                          key={comp}
                          className="text-sm text-zinc-500"
                        >
                          {comp}: {val}
                          {metric.unit}
                        </span>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-4">
                Recommended Actions
              </h2>
              <div className="space-y-3">
                {report.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50"
                  >
                    <span className="text-sm font-bold text-[#6C5CE7] mt-0.5">
                      {rec.priority}.
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-300">{rec.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={
                            rec.impact === "high"
                              ? "text-red-400"
                              : rec.impact === "medium"
                                ? "text-amber-400"
                                : "text-zinc-500"
                          }
                        >
                          {rec.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-zinc-500">
                          {rec.relatesTo}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-xs text-zinc-600 text-center">
            Generated {new Date(report.generatedAt).toLocaleDateString()} by
            MentionLayer
          </p>
        </>
      )}
    </div>
  );
}
