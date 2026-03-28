"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";

interface CorrelationData {
  dateRange: { start: string; end: string };
  aiSessions: number;
  somAverage: number;
  correlations: Array<{
    keyword: string;
    somCurrent: number;
    somPrevious: number;
    somChange: number;
    trafficCurrent: number;
    trafficPrevious: number;
    trafficChange: number;
    correlation: "positive" | "negative" | "neutral";
    insight: string;
  }>;
  overallTrend: "improving" | "stable" | "declining";
  insightSummary: string;
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-5 w-5 text-emerald-400" />;
    case "declining":
      return <TrendingDown className="h-5 w-5 text-red-400" />;
    default:
      return <Minus className="h-5 w-5 text-zinc-400" />;
  }
}

function getCorrelationBadge(corr: string) {
  switch (corr) {
    case "positive":
      return <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800">Positive</Badge>;
    case "negative":
      return <Badge className="bg-red-900/50 text-red-400 border-red-800">Negative</Badge>;
    default:
      return <Badge variant="outline" className="text-zinc-500">Neutral</Badge>;
  }
}

function getChangeColor(change: number): string {
  if (change > 5) return "text-emerald-400";
  if (change < -5) return "text-red-400";
  return "text-zinc-400";
}

export default function AnalyticsPage() {
  useEffect(() => { document.title = "Analytics — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [data, setData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedClientId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNoData(false);
    try {
      const res = await fetch(
        `/api/analytics/correlations?clientId=${selectedClientId}`
      );
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      } else {
        setNoData(true);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!selectedClientId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={BarChart3}
          title="Select a client"
          description="Choose a client to view AI attribution analytics."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">AI Attribution</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Track how AI visibility improvements correlate with traffic for{" "}
          {selectedClientName}
        </p>
      </div>

      {/* GA4 setup notice */}
      <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-300 font-medium">
            GA4 Integration
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            To see AI referral traffic data, configure GA4_PROPERTY_ID and
            GOOGLE_SERVICE_ACCOUNT_JSON in your environment variables. The
            correlation engine currently uses AI Monitor SoM data.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-lg bg-zinc-800" />
          <Skeleton className="h-64 rounded-lg bg-zinc-800" />
        </div>
      ) : noData ? (
        <EmptyState
          icon={BarChart3}
          title="Not enough data"
          description="Need at least 2 AI Monitor snapshots to calculate correlations. Run the AI Monitor weekly to build trend data."
        />
      ) : data ? (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Overall Trend
                </p>
                {getTrendIcon(data.overallTrend)}
              </div>
              <p className="text-lg font-semibold text-zinc-100 capitalize">
                {data.overallTrend}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Average SoM
              </p>
              <p className="text-3xl font-bold text-zinc-100">
                {data.somAverage}%
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Keywords Tracked
              </p>
              <p className="text-3xl font-bold text-zinc-100">
                {data.correlations.length}
              </p>
            </div>
          </div>

          {/* Insight summary */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-300">{data.insightSummary}</p>
          </div>

          {/* Keyword correlations */}
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-900 text-left text-xs text-zinc-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Keyword</th>
                  <th className="px-4 py-3">SoM</th>
                  <th className="px-4 py-3">SoM Change</th>
                  <th className="px-4 py-3">Correlation</th>
                  <th className="px-4 py-3">Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.correlations.map((corr, i) => (
                  <tr
                    key={i}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-200">
                        {corr.keyword}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-300">
                        {corr.somCurrent}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${getChangeColor(corr.somChange)}`}
                      >
                        {corr.somChange > 0 ? "+" : ""}
                        {corr.somChange}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getCorrelationBadge(corr.correlation)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-zinc-400 max-w-md">
                        {corr.insight}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
