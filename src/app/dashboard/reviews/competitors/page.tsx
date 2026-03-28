"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Star, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface Competitor {
  id: string;
  name: string;
  url: string | null;
  total_reviews: number;
  average_rating: number | null;
  platforms: number;
  platform_breakdown: Record<string, { reviews: number; rating: number | null }>;
  created_at: string;
}

function getRatingColor(rating: number | null): string {
  if (rating === null) return "text-muted-foreground";
  if (rating >= 4.0) return "text-emerald-500";
  if (rating >= 3.0) return "text-amber-500";
  return "text-red-500";
}

function renderStars(rating: number | null) {
  if (rating === null) return null;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < full
              ? "fill-amber-400 text-amber-400"
              : i === full && hasHalf
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function CompetitorsPage() {
  useEffect(() => { document.title = "Review Engine — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/competitors?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        setCompetitors(data.competitors || data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCompetitor = async () => {
    if (!selectedClientId || !newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/reviews/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          name: newName.trim(),
          url: newUrl.trim() || null,
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewUrl("");
        setShowForm(false);
        await loadData();
      }
    } catch {
      // handle error
    } finally {
      setAdding(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Competitor Comparison</h2>
          <p className="text-sm text-muted-foreground">
            Compare your review presence against competitors.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Users}
            title="No client selected"
            description="Select a client from the header to view competitor comparisons."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Competitor Comparison</h2>
          <p className="text-sm text-muted-foreground">Loading competitors...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const maxReviews = competitors.length > 0
    ? Math.max(...competitors.map((c) => c.total_reviews))
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Competitor Comparison</h2>
          <p className="text-sm text-muted-foreground">
            Review comparison for {selectedClientName}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Competitor
        </button>
      </div>

      {/* Add Competitor Form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Add Competitor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Competitor Name *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. DistroKid"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Website URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="e.g. https://distrokid.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setNewName("");
                setNewUrl("");
              }}
              className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCompetitor}
              disabled={adding || !newName.trim()}
              className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Competitor"}
            </button>
          </div>
        </div>
      )}

      {/* Competitor Table */}
      {competitors.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Users}
            title="No competitors added"
            description="Add competitors to compare your review presence against them."
            action={
              !showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Competitor
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Competitor</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total Reviews</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Avg Rating</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Platforms</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Review Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {competitors.map((comp) => (
                    <tr key={comp.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{comp.name}</span>
                          {comp.url && (
                            <a
                              href={comp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Globe className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium tabular-nums">{comp.total_reviews}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {renderStars(comp.average_rating)}
                          <span className={cn("text-xs font-medium tabular-nums", getRatingColor(comp.average_rating))}>
                            {comp.average_rating !== null ? comp.average_rating.toFixed(1) : "\u2014"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs tabular-nums">
                          {comp.platforms}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-32">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-muted-foreground/40 transition-all"
                              style={{ width: `${(comp.total_reviews / maxReviews) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gap Visualization */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Review Volume Gap</h3>
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              {competitors.map((comp) => (
                <div key={comp.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{comp.name}</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {comp.total_reviews} reviews
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-muted-foreground/30 transition-all"
                      style={{ width: `${(comp.total_reviews / maxReviews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
