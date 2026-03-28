"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { IdeaCard } from "@/components/press/idea-card";
import { IdeaGenerationDialog } from "@/components/press/idea-generation-dialog";
import type { PressCampaignIdea, Spokesperson } from "@/types/database";

export default function IdeasPage() {
  useEffect(() => { document.title = "PressForge — MentionLayer"; }, []);

  const { selectedClientId } = useClientContext();
  const router = useRouter();
  const [ideas, setIdeas] = useState<PressCampaignIdea[]>([]);
  const [spokespersons, setSpokespersons] = useState<Spokesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    if (!selectedClientId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [ideasRes, spokesRes] = await Promise.all([
        fetch(`/api/press/ideas?clientId=${selectedClientId}`),
        fetch(`/api/press/spokespersons?clientId=${selectedClientId}`),
      ]);
      const [ideasData, spokesData] = await Promise.all([
        ideasRes.ok ? ideasRes.json() : { data: [] },
        spokesRes.ok ? spokesRes.json() : { data: [] },
      ]);
      setIdeas(ideasData.data ?? []);
      setSpokespersons(spokesData.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleApprove(ideaId: string) {
    const res = await fetch("/api/press/ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId, action: "approve" }),
    });
    if (res.ok) {
      const { data } = await res.json();
      // Navigate to newly created campaign if returned
      if (data?.campaign_id) {
        router.push(`/dashboard/press/${data.campaign_id}`);
      } else {
        loadData();
      }
    }
  }

  async function handleReject(ideaId: string) {
    const res = await fetch("/api/press/ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId, action: "reject" }),
    });
    if (res.ok) loadData();
  }

  const filtered = ideas.filter((idea) => {
    if (statusFilter === "pending") return !idea.is_approved && !idea.is_rejected;
    if (statusFilter === "approved") return idea.is_approved;
    if (statusFilter === "rejected") return idea.is_rejected;
    return true;
  });

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Campaign Ideas</h2>
          <p className="text-sm text-muted-foreground">AI-generated press campaign ideas.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState icon={Lightbulb} title="Select a client" description="Choose a client to manage their campaign ideas." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Campaign Ideas</h2>
          <p className="text-sm text-muted-foreground">AI-generated press campaign ideas.</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)} disabled={spokespersons.length === 0}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Ideas
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ideas</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} ideas</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Lightbulb}
            title="No ideas yet"
            description="Generate AI-powered campaign ideas based on your client's industry and seasonal calendar."
            action={
              spokespersons.length > 0 ? (
                <Button variant="outline" onClick={() => setGenerateOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Ideas
                </Button>
              ) : (
                <Button variant="outline" onClick={() => router.push("/dashboard/press/spokespersons")}>
                  Add a spokesperson first
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onApprove={handleApprove} onReject={handleReject} />
          ))}
        </div>
      )}

      <IdeaGenerationDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        clientId={selectedClientId}
        spokespersons={spokespersons}
        onGenerated={loadData}
      />
    </div>
  );
}
