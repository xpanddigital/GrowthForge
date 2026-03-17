"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Clock, CheckCircle2, FileEdit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface CanonicalVersion {
  id: string;
  canonical_name: string;
  canonical_description: string;
  canonical_category: string;
  status: "draft" | "approved" | "needs_update";
  version: number;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
  approved: {
    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
    label: "Approved",
  },
  draft: {
    className: "bg-amber-500/15 text-amber-500 border-amber-500/20",
    label: "Draft",
  },
  needs_update: {
    className: "bg-red-500/15 text-red-400 border-red-500/20",
    label: "Needs Update",
  },
};

export default function CanonicalHistoryPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [versions, setVersions] = useState<CanonicalVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/entity/canonical?clientId=${selectedClientId}&history=true`
      );
      if (res.ok) {
        const data = await res.json();
        setVersions(data.data || []);
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

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Canonical History</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Clock}
            title="No client selected"
            description="Select a client to view canonical version history."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Canonical History</h2>
        <p className="text-sm text-muted-foreground">Loading versions...</p>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 h-20 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/entities/canonical"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Canonical
      </Link>

      <div>
        <h2 className="text-lg font-semibold">Version History</h2>
        <p className="text-sm text-muted-foreground">
          {selectedClientName}&apos;s canonical description versions
        </p>
      </div>

      {versions.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Clock}
            title="No versions yet"
            description="Create your first canonical description to start tracking versions."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version, idx) => {
            const statusBadge =
              STATUS_BADGE[version.status] ?? STATUS_BADGE.draft;
            const isExpanded = expandedId === version.id;
            const isLatest = idx === 0;
            const prevVersion = versions[idx + 1];

            return (
              <div
                key={version.id}
                className={cn(
                  "rounded-lg border bg-card transition-colors",
                  version.status === "approved"
                    ? "border-emerald-500/30"
                    : "border-border"
                )}
              >
                {/* Header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : version.id)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    {version.status === "approved" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <FileEdit className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          Version {version.version}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", statusBadge.className)}
                        >
                          {statusBadge.label}
                        </Badge>
                        {isLatest && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-primary/30 text-primary"
                          >
                            Latest
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          Created{" "}
                          {new Date(version.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        {version.approved_at && (
                          <>
                            <span>&middot;</span>
                            <span>
                              Approved{" "}
                              {new Date(
                                version.approved_at
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isExpanded ? "Collapse" : "Expand"}
                  </span>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 space-y-4">
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Name
                      </span>
                      <p className="text-sm text-foreground">
                        {version.canonical_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Category
                      </span>
                      <p className="text-sm text-foreground">
                        {version.canonical_category}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Description
                      </span>
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {version.canonical_description}
                      </p>
                    </div>

                    {/* Diff indicator against previous version */}
                    {prevVersion && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Changes from v{prevVersion.version}
                        </span>
                        <div className="mt-2 space-y-1">
                          {version.canonical_name !==
                            prevVersion.canonical_name && (
                            <div className="flex items-center gap-2 text-xs">
                              <Badge
                                variant="outline"
                                className="text-[10px] border-amber-500/30 text-amber-500"
                              >
                                Changed
                              </Badge>
                              <span className="text-muted-foreground">
                                Name
                              </span>
                            </div>
                          )}
                          {version.canonical_category !==
                            prevVersion.canonical_category && (
                            <div className="flex items-center gap-2 text-xs">
                              <Badge
                                variant="outline"
                                className="text-[10px] border-amber-500/30 text-amber-500"
                              >
                                Changed
                              </Badge>
                              <span className="text-muted-foreground">
                                Category
                              </span>
                            </div>
                          )}
                          {version.canonical_description !==
                            prevVersion.canonical_description && (
                            <div className="flex items-center gap-2 text-xs">
                              <Badge
                                variant="outline"
                                className="text-[10px] border-amber-500/30 text-amber-500"
                              >
                                Changed
                              </Badge>
                              <span className="text-muted-foreground">
                                Description
                              </span>
                            </div>
                          )}
                          {version.canonical_name ===
                            prevVersion.canonical_name &&
                            version.canonical_category ===
                              prevVersion.canonical_category &&
                            version.canonical_description ===
                              prevVersion.canonical_description && (
                              <span className="text-xs text-muted-foreground">
                                No changes to core fields (other fields may
                                differ)
                              </span>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
