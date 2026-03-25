"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";

interface CitabilityDimension {
  name: string;
  score: number;
  weight: number;
  details: string;
}

interface ScanFindings {
  citability?: {
    compositeScore: number;
    dimensions: CitabilityDimension[];
    highlights: string[];
  };
}

interface ScanData {
  scan: {
    id: string;
    citability_score: number | null;
    findings: ScanFindings;
    recommendations: Array<{
      action: string;
      impact: string;
      effort: string;
      module: string;
    }>;
    completed_at: string | null;
  } | null;
}

function getScoreColor(score: number): string {
  if (score <= 30) return "text-red-400";
  if (score <= 60) return "text-amber-400";
  return "text-emerald-400";
}

function getBarColor(score: number): string {
  if (score <= 30) return "bg-red-500";
  if (score <= 60) return "bg-amber-500";
  return "bg-emerald-500";
}

function formatDimensionName(name: string): string {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function CitabilityPage() {
  const { selectedClientId } = useClientContext();
  const [data, setData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!selectedClientId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/technical-geo/results?clientId=${selectedClientId}`
      );
      const json = await res.json();
      setData(json.data || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const citability = data?.scan?.findings?.citability;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Content Citability
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          How well your content is structured for AI citation across 7
          dimensions
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : !citability ? (
        <EmptyState
          icon={FileText}
          title="No citability data"
          description="Run a Technical GEO scan to analyze content citability."
        />
      ) : (
        <>
          {/* Overall score */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 flex items-center gap-6">
            <div
              className={`text-5xl font-bold ${getScoreColor(citability.compositeScore)}`}
            >
              {citability.compositeScore}
              <span className="text-lg text-zinc-500">/100</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-200">
                Citability Score
              </h3>
              <p className="text-sm text-zinc-400">
                Composite score across 7 dimensions of AI citation
                friendliness
              </p>
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            {citability.dimensions
              .sort((a, b) => b.weight - a.weight)
              .map((dim) => (
                <div
                  key={dim.name}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-zinc-200">
                        {formatDimensionName(dim.name)}
                      </h4>
                      <Badge variant="outline" className="text-zinc-500 text-xs">
                        {Math.round(dim.weight * 100)}% weight
                      </Badge>
                    </div>
                    <span
                      className={`text-lg font-bold ${getScoreColor(dim.score)}`}
                    >
                      {dim.score}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${getBarColor(dim.score)}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-400">{dim.details}</p>
                </div>
              ))}
          </div>

          {/* Highlights */}
          {citability.highlights && citability.highlights.length > 0 && (
            <div className="rounded-lg border border-emerald-900/50 bg-emerald-900/10 p-4">
              <h4 className="text-sm font-medium text-emerald-400 mb-2">
                Strengths
              </h4>
              <ul className="space-y-1">
                {citability.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">+</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
