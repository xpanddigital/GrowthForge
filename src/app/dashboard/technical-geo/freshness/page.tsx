"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";

interface FreshnessEntry {
  id: string;
  page_url: string;
  page_title: string | null;
  days_since_update: number | null;
  freshness_category: string;
  is_cited_by_ai: boolean;
  cited_by_models: string[];
  citation_at_risk: boolean;
  refresh_brief: string | null;
  refresh_priority: string;
}

function getCategoryBadge(category: string) {
  switch (category) {
    case "fresh":
      return <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800">Fresh</Badge>;
    case "aging":
      return <Badge className="bg-amber-900/50 text-amber-400 border-amber-800">Aging</Badge>;
    case "stale":
      return <Badge className="bg-orange-900/50 text-orange-400 border-orange-800">Stale</Badge>;
    case "expired":
      return <Badge className="bg-red-900/50 text-red-400 border-red-800">Expired</Badge>;
    default:
      return <Badge variant="outline">{category}</Badge>;
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "critical":
      return <Badge className="bg-red-900/50 text-red-400 border-red-800">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-900/50 text-orange-400 border-orange-800">High</Badge>;
    case "medium":
      return <Badge className="bg-amber-900/50 text-amber-400 border-amber-800">Medium</Badge>;
    default:
      return null;
  }
}

export default function FreshnessPage() {
  useEffect(() => { document.title = "Technical GEO — MentionLayer"; }, []);

  const { selectedClientId } = useClientContext();
  const [entries, setEntries] = useState<FreshnessEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!selectedClientId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/technical-geo/results?clientId=${selectedClientId}`
      );
      const json = await res.json();
      setEntries(json.data?.freshness || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const atRiskCount = entries.filter((e) => e.citation_at_risk).length;
  const staleCount = entries.filter(
    (e) => e.freshness_category === "stale" || e.freshness_category === "expired"
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Content Freshness</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Track page update recency and identify content at risk of losing AI citations
        </p>
      </div>

      {/* Summary stats */}
      {!loading && entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Pages</p>
            <p className="text-2xl font-bold text-zinc-100">{entries.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Fresh (&lt;30d)</p>
            <p className="text-2xl font-bold text-emerald-400">
              {entries.filter((e) => e.freshness_category === "fresh").length}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Stale/Expired</p>
            <p className="text-2xl font-bold text-orange-400">{staleCount}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> At Risk
            </p>
            <p className="text-2xl font-bold text-red-400">{atRiskCount}</p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No freshness data"
          description="Run a Technical GEO scan to analyze content freshness."
        />
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900 text-left text-xs text-zinc-400 uppercase tracking-wider">
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Days Old</th>
                <th className="px-4 py-3">AI Cited</th>
                <th className="px-4 py-3">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-zinc-200 truncate max-w-md">
                          {entry.page_title || entry.page_url}
                        </p>
                        <a
                          href={entry.page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                        >
                          <span className="truncate max-w-xs">
                            {entry.page_url}
                          </span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(entry.freshness_category)}
                      {entry.citation_at_risk && (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-300">
                      {entry.days_since_update !== null
                        ? `${entry.days_since_update}d`
                        : "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.is_cited_by_ai ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-emerald-400">Yes</span>
                        <span className="text-xs text-zinc-500">
                          ({entry.cited_by_models.join(", ")})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getPriorityBadge(entry.refresh_priority)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Refresh briefs */}
      {entries.some((e) => e.refresh_brief) && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-[#6C5CE7]" />
            Refresh Recommendations
          </h3>
          <div className="space-y-3">
            {entries
              .filter((e) => e.refresh_brief)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                >
                  <p className="text-sm font-medium text-zinc-300 mb-1">
                    {entry.page_title || entry.page_url}
                  </p>
                  <p className="text-sm text-zinc-400">{entry.refresh_brief}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
