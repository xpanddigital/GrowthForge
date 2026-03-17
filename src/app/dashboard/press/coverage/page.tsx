"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trophy, Link2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { CoverageFeed } from "@/components/press/coverage-feed";
import { CoverageFormDialog } from "@/components/press/coverage-form-dialog";
import type { PressCoverage } from "@/types/database";

export default function CoveragePage() {
  const { selectedClientId } = useClientContext();
  const [items, setItems] = useState<PressCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedClientId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/press/coverage?clientId=${selectedClientId}`);
      if (res.ok) {
        const { data } = await res.json();
        setItems(data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Press Coverage</h2>
          <p className="text-sm text-muted-foreground">Track earned media and backlinks.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState icon={Trophy} title="Select a client" description="Choose a client to view their press coverage." />
        </div>
      </div>
    );
  }

  const totalBacklinks = items.filter((i) => i.has_backlink).length;
  const dofollowLinks = items.filter((i) => i.has_backlink && i.is_dofollow).length;
  const avgDA = items.filter((i) => i.estimated_domain_authority).length > 0
    ? Math.round(
        items
          .filter((i) => i.estimated_domain_authority)
          .reduce((sum, i) => sum + (i.estimated_domain_authority || 0), 0) /
        items.filter((i) => i.estimated_domain_authority).length
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Press Coverage</h2>
          <p className="text-sm text-muted-foreground">Track earned media and backlinks.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coverage
        </Button>
      </div>

      {/* Stats */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Total Coverage</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">{items.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="h-4 w-4" />
              <span>Backlinks</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">{totalBacklinks}</p>
            <p className="text-xs text-muted-foreground">{dofollowLinks} dofollow</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Avg Domain Authority</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">{avgDA || "-"}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Features</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">
              {items.filter((i) => i.coverage_type === "feature").length}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Trophy}
            title="No coverage yet"
            description="Press coverage will appear here as journalists publish stories about this client."
            action={
              <Button variant="outline" onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Coverage Manually
              </Button>
            }
          />
        </div>
      ) : (
        <CoverageFeed items={items} />
      )}

      <CoverageFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        clientId={selectedClientId}
        onCreated={loadData}
      />
    </div>
  );
}
