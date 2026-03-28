"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { SpokespersonCard } from "@/components/press/spokesperson-card";
import { SpokespersonFormDialog } from "@/components/press/spokesperson-form-dialog";
import type { Spokesperson } from "@/types/database";

export default function SpokespersonsPage() {
  useEffect(() => { document.title = "PressForge — MentionLayer"; }, []);

  const { selectedClientId } = useClientContext();
  const [spokespersons, setSpokespersons] = useState<Spokesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSpokesperson, setEditingSpokesperson] = useState<Spokesperson | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedClientId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/press/spokespersons?clientId=${selectedClientId}`);
      if (res.ok) {
        const { data } = await res.json();
        setSpokespersons(data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleModelVoice(spokespersonId: string) {
    await fetch(`/api/press/spokespersons/${spokespersonId}/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spokesperson_id: spokespersonId }),
    });
    // Voice modeling happens in background — reload to see status
    setTimeout(loadData, 5000);
  }

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Spokespersons</h2>
          <p className="text-sm text-muted-foreground">Manage voice profiles for press campaigns.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState icon={Users2} title="Select a client" description="Choose a client to manage their spokespersons." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Spokespersons</h2>
          <p className="text-sm text-muted-foreground">Manage voice profiles for press campaigns.</p>
        </div>
        <Button onClick={() => { setEditingSpokesperson(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Spokesperson
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : spokespersons.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Users2}
            title="No spokespersons yet"
            description="Add a spokesperson to start modeling their voice for press releases."
            action={
              <Button variant="outline" onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Spokesperson
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {spokespersons.map((sp) => (
            <SpokespersonCard
              key={sp.id}
              spokesperson={sp}
              onEdit={() => { setEditingSpokesperson(sp); setFormOpen(true); }}
              onModelVoice={() => handleModelVoice(sp.id)}
            />
          ))}
        </div>
      )}

      <SpokespersonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        clientId={selectedClientId}
        spokesperson={editingSpokesperson}
        onSaved={loadData}
      />
    </div>
  );
}
