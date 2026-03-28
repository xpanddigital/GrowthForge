"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";

interface MentionSource {
  id: string;
  platform: string;
  source_url: string;
  source_title: string;
  mention_type: string;
  mentioned_entity: string | null;
  context_snippet: string | null;
  authority_estimate: string;
  discovered_at: string;
}

interface Stats {
  total: number;
  brand: number;
  competitor: number;
  platforms: string[];
}

function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    linkedin: "bg-blue-900/50 text-blue-400 border-blue-800",
    youtube: "bg-red-900/50 text-red-400 border-red-800",
    review_sites: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
  };
  return colors[platform] || "bg-zinc-800 text-zinc-400 border-zinc-700";
}

function getMentionTypeBadge(type: string) {
  switch (type) {
    case "brand":
      return <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800">Brand</Badge>;
    case "competitor":
      return <Badge className="bg-amber-900/50 text-amber-400 border-amber-800">Competitor</Badge>;
    case "both":
      return <Badge className="bg-blue-900/50 text-blue-400 border-blue-800">Both</Badge>;
    default:
      return <Badge variant="outline" className="text-zinc-500">None</Badge>;
  }
}

export default function MentionsPage() {
  useEffect(() => { document.title = "Mentions — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [sources, setSources] = useState<MentionSource[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedClientId) {
      setSources([]);
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/mentions/sources?clientId=${selectedClientId}`
      );
      const json = await res.json();
      setSources(json.data || []);
      setStats(json.stats || null);
    } catch {
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerScan = async () => {
    if (!selectedClientId) return;
    setScanning(true);
    try {
      await fetch("/api/mentions/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      setTimeout(() => fetchData(), 5000);
      setTimeout(() => fetchData(), 15000);
      setTimeout(() => fetchData(), 45000);
    } finally {
      setScanning(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Search}
          title="Select a client"
          description="Choose a client to view their mention gap analysis."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Brand Mentions
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Track where {selectedClientName} and competitors are mentioned
            across LinkedIn, YouTube, and review sites
          </p>
        </div>
        <Button
          onClick={triggerScan}
          disabled={scanning || loading}
          className="bg-[#6C5CE7] hover:bg-[#5A4BD1]"
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Scan Mentions
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No mentions scanned yet"
          description="Run a mention scan to discover where your brand and competitors appear across LinkedIn, YouTube, and review platforms."
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
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Total Sources
                </p>
                <p className="text-2xl font-bold text-zinc-100">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Brand Mentions
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {stats.brand}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Competitor Mentions
                </p>
                <p className="text-2xl font-bold text-amber-400">
                  {stats.competitor}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Platforms Covered
                </p>
                <p className="text-2xl font-bold text-zinc-100">
                  {stats.platforms.length}
                </p>
              </div>
            </div>
          )}

          {/* Sources table */}
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-900 text-left text-xs text-zinc-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Mention</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {sources.slice(0, 50).map((source) => (
                  <tr
                    key={source.id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Badge className={getPlatformColor(source.platform)}>
                        {source.platform}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <a
                          href={source.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-zinc-200 hover:text-zinc-100 flex items-center gap-1"
                        >
                          <span className="truncate max-w-xs">
                            {source.source_title || source.source_url}
                          </span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                        {source.context_snippet && (
                          <p className="text-xs text-zinc-500 mt-1 truncate max-w-md">
                            {source.context_snippet}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getMentionTypeBadge(source.mention_type)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-400">
                        {source.mentioned_entity || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-500 capitalize">
                        {source.authority_estimate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
