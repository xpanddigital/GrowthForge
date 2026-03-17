"use client";

import { useEffect, useState, useCallback } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { CompetitorComparison } from "@/components/monitor/competitor-comparison";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface Competitor {
  id: string;
  competitor_name: string;
  competitor_urls: string[];
  aliases: string[];
  is_active: boolean;
  som: number | null;
  mentions: number;
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

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/monitor/competitors?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        setCompetitors(data.competitors || []);
      }

      // Also load latest snapshot for client SoM
      const snapRes = await fetch(`/api/monitor/snapshots?clientId=${selectedClientId}&limit=1`);
      if (snapRes.ok) {
        const snaps = await snapRes.json();
        if (snaps.length > 0) {
          setClientSom(snaps[0].overall_som || 0);
        }
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
          competitorUrls: newUrls
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean),
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

  const competitorSomMap: Record<string, number> = {};
  for (const c of competitors) {
    if (c.som !== null) {
      competitorSomMap[c.competitor_name] = c.som || 0;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Competitor Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Monitor competitor visibility across AI models for {selectedClientName}
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
              placeholder="Website URLs (one per line)"
              rows={2}
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
          title="No competitors tracked"
          description="Add competitors to compare their AI visibility against yours."
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Competitor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">URLs</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">SoM</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Mentions</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp) => (
                <tr key={comp.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <span className="text-foreground font-medium">{comp.competitor_name}</span>
                    {comp.aliases.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        aka: {comp.aliases.join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {comp.competitor_urls.slice(0, 2).map((url, i) => (
                      <p key={i} className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {url}
                      </p>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {comp.som !== null ? (
                      <span className="font-medium text-foreground">{comp.som}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {comp.mentions}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        comp.is_active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {comp.is_active ? "Active" : "Paused"}
                    </span>
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
