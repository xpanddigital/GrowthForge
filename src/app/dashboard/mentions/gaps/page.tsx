"use client";

import { useEffect, useState, useCallback } from "react";
import { Lightbulb, ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";

interface MentionGap {
  id: string;
  platform: string;
  gap_type: string;
  competitor_name: string | null;
  opportunity_url: string | null;
  opportunity_title: string | null;
  recommended_action: string;
  action_module: string;
  impact: string;
  effort: string;
  opportunity_score: number | null;
  status: string;
}

function getImpactBadge(impact: string) {
  switch (impact) {
    case "high":
      return <Badge className="bg-red-900/50 text-red-400 border-red-800">High Impact</Badge>;
    case "medium":
      return <Badge className="bg-amber-900/50 text-amber-400 border-amber-800">Med Impact</Badge>;
    default:
      return <Badge variant="outline" className="text-zinc-500">Low Impact</Badge>;
  }
}

function getEffortBadge(effort: string) {
  switch (effort) {
    case "low":
      return <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800">Easy</Badge>;
    case "medium":
      return <Badge variant="outline" className="text-zinc-500">Medium</Badge>;
    default:
      return <Badge className="bg-orange-900/50 text-orange-400 border-orange-800">Hard</Badge>;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "open":
      return "text-amber-400";
    case "in_progress":
      return "text-blue-400";
    case "resolved":
      return "text-emerald-400";
    case "dismissed":
      return "text-zinc-500";
    default:
      return "text-zinc-400";
  }
}

function formatGapType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatModule(module: string): string {
  const names: Record<string, string> = {
    citation_engine: "Citation Engine",
    entity_sync: "Entity Sync",
    review_engine: "Review Engine",
    youtube_geo: "YouTube GEO",
    press: "PressForge",
  };
  return names[module] || module;
}

export default function MentionGapsPage() {
  useEffect(() => { document.title = "Mentions — MentionLayer"; }, []);

  const { selectedClientId } = useClientContext();
  const [gaps, setGaps] = useState<MentionGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("open");

  const fetchGaps = useCallback(async () => {
    if (!selectedClientId) {
      setGaps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        clientId: selectedClientId,
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/mentions/gaps?${params}`);
      const json = await res.json();
      setGaps(json.data || []);
    } catch {
      setGaps([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, statusFilter]);

  useEffect(() => {
    fetchGaps();
  }, [fetchGaps]);

  const updateGapStatus = async (gapId: string, newStatus: string) => {
    try {
      await fetch("/api/mentions/gaps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gapId, status: newStatus }),
      });
      fetchGaps();
    } catch {
      // Ignore
    }
  };

  if (!selectedClientId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Lightbulb}
          title="Select a client"
          description="Choose a client to view mention gaps."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Mention Gaps</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Opportunities where competitors are mentioned but you are not
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["open", "in_progress", "resolved", "dismissed"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={
                statusFilter === s
                  ? "bg-[#6C5CE7] hover:bg-[#5A4BD1]"
                  : ""
              }
            >
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : gaps.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={
            statusFilter === "open"
              ? "No open gaps"
              : `No ${statusFilter.replace("_", " ")} gaps`
          }
          description="Run a mention scan to discover gaps in your brand presence."
        />
      ) : (
        <div className="space-y-3">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-zinc-400">
                      {gap.platform}
                    </Badge>
                    <Badge variant="outline" className="text-zinc-500 text-xs">
                      {formatGapType(gap.gap_type)}
                    </Badge>
                    {gap.competitor_name && (
                      <span className="text-xs text-amber-400">
                        vs {gap.competitor_name}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-zinc-200 mb-2">
                    {gap.recommended_action}
                  </p>

                  {gap.opportunity_url && (
                    <a
                      href={gap.opportunity_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-2"
                    >
                      <span className="truncate max-w-md">
                        {gap.opportunity_title || gap.opportunity_url}
                      </span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  )}

                  <div className="flex items-center gap-2">
                    {getImpactBadge(gap.impact)}
                    {getEffortBadge(gap.effort)}
                    <Badge variant="outline" className="text-zinc-500 text-xs">
                      {formatModule(gap.action_module)}
                    </Badge>
                    {gap.opportunity_score && (
                      <span className="text-xs text-zinc-500">
                        Score: {gap.opportunity_score}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <span
                    className={`text-xs capitalize ${getStatusColor(gap.status)}`}
                  >
                    {gap.status.replace("_", " ")}
                  </span>
                  <div className="relative group">
                    <Button variant="ghost" size="sm">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-1 hidden group-hover:block z-10 min-w-[140px]">
                      {["open", "in_progress", "resolved", "dismissed"]
                        .filter((s) => s !== gap.status)
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => updateGapStatus(gap.id, s)}
                            className="w-full text-left px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 capitalize"
                          >
                            {s.replace("_", " ")}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
