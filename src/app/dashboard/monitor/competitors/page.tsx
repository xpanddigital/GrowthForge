"use client";

import { useEffect, useState, useCallback } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { CompetitorComparison } from "@/components/monitor/competitor-comparison";
import { cn } from "@/lib/utils";
import { Users, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

interface Competitor {
  id: string;
  competitor_name: string;
  competitor_url: string | null;
  competitor_aliases: string[];
  is_active: boolean;
  discovered_via: "manual" | "auto_scan" | "audit";
  mention_count: number;
  last_seen_at: string | null;
  created_at: string;
  // Enriched by API
  som: number;
  previous_som: number | null;
  som_delta: number | null;
}

export default function MonitorCompetitorsPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrls, setNewUrls] = useState("");
  const [newAliases, setNewAliases] = useState("");
  const [saving, setSaving] = useState(false);
  const [clientSom, setClientSom] = useState<number>(0);
  const [snapshotDate, setSnapshotDate] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/monitor/competitors?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        setCompetitors(data.competitors || []);
        setClientSom(data.client_som || 0);
        setSnapshotDate(data.snapshot_date || null);
      }
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCompetitor = async () => {
    if (!selectedClientId || !newName.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/monitor/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          competitorName: newName.trim(),
          competitorUrl: newUrls.split("\n").map((u) => u.trim()).filter(Boolean)[0] || null,
          aliases: newAliases
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        }),
      });
      setNewName("");
      setNewUrls("");
      setNewAliases("");
      setShowAddForm(false);
      await loadData();
    } catch {
      // handle
    } finally {
      setSaving(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Competitors</h2>
        <EmptyState
          icon={Users}
          title="No client selected"
          description="Select a client to manage competitors."
        />
      </div>
    );
  }

  const activeCompetitors = competitors.filter((c) => c.is_active);
  const competitorSomMap: Record<string, number> = {};
  for (const c of activeCompetitors) {
    competitorSomMap[c.competitor_name] = c.som || 0;
  }

  const previousSomMap: Record<string, number> = {};
  for (const c of activeCompetitors) {
    if (c.previous_som !== null) {
      previousSomMap[c.competitor_name] = c.previous_som;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Competitor Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Monitor competitor visibility across AI models for {selectedClientName}
            {snapshotDate && (
              <span className="ml-2 text-xs">
                · Last scan: {new Date(snapshotDate).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Add Competitor
        </button>
      </div>

      {/* Comparison chart */}
      {Object.keys(competitorSomMap).length > 0 && (
        <CompetitorComparison
          clientName={selectedClientName || "You"}
          clientSom={clientSom}
          competitors={competitorSomMap}
          previousCompetitors={Object.keys(previousSomMap).length > 0 ? previousSomMap : undefined}
        />
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Add Competitor</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Competitor name"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <textarea
              value={newUrls}
              onChange={(e) => setNewUrls(e.target.value)}
              placeholder="Website URL"
              rows={1}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <input
              type="text"
              value={newAliases}
              onChange={(e) => setNewAliases(e.target.value)}
              placeholder="Aliases (comma separated)"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCompetitor}
              disabled={saving || !newName.trim()}
              className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Competitor list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No competitors tracked yet"
          description="Competitors are automatically discovered when you run an AI Monitor scan. You can also add them manually."
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Competitor</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Share of Model</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Trend</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Mentions</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Last Seen</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Source</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp) => (
                <tr key={comp.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{comp.competitor_name}</span>
                    </div>
                    {comp.competitor_aliases && comp.competitor_aliases.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        aka: {comp.competitor_aliases.join(", ")}
                      </p>
                    )}
                    {comp.competitor_url && (
                      <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {comp.competitor_url}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium text-foreground">
                      {comp.som > 0 ? `${comp.som.toFixed(1)}%` : "0%"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {comp.som_delta !== null ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-medium",
                          comp.som_delta > 2
                            ? "text-emerald-400"
                            : comp.som_delta < -2
                              ? "text-red-400"
                              : "text-muted-foreground"
                        )}
                      >
                        {comp.som_delta > 2 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : comp.som_delta < -2 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        {comp.som_delta > 0 ? "+" : ""}
                        {comp.som_delta.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {comp.mention_count || 0}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {comp.last_seen_at
                      ? new Date(comp.last_seen_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {comp.discovered_via === "auto_scan" ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-purple-500/10 text-purple-400">
                        <Sparkles className="h-2.5 w-2.5" />
                        Auto
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted/30 text-muted-foreground">
                        Manual
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
