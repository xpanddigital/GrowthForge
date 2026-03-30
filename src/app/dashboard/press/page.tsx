"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Newspaper, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { PressStatsCards } from "@/components/press/press-stats-cards";
import { CampaignTable } from "@/components/press/campaign-table";
import { CampaignCreateDialog } from "@/components/press/campaign-create-dialog";
import type { PressCampaign, Spokesperson } from "@/types/database";

interface CampaignWithRelations extends PressCampaign {
  spokespersons?: { name: string; title: string } | null;
  press_releases?: Array<{ id: string; title: string; status: string; is_current: boolean }>;
}

export default function PressPage() {
  useEffect(() => { document.title = "PressForge — MentionLayer"; }, []);

  const { selectedClientId } = useClientContext();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignWithRelations[]>([]);
  const [spokespersons, setSpokespersons] = useState<Spokesperson[]>([]);
  const [stats, setStats] = useState({
    active_campaigns: 0,
    pitches_sent: 0,
    coverage_secured: 0,
    backlinks_earned: 0,
    journalists_in_database: 0,
    ideas_pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedClientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [campaignsRes, spokesRes, journalistsRes, ideasRes, coverageRes] = await Promise.all([
        fetch(`/api/press/campaigns?clientId=${selectedClientId}`),
        fetch(`/api/press/spokespersons?clientId=${selectedClientId}`),
        fetch(`/api/press/journalists?limit=1`),
        fetch(`/api/press/ideas?clientId=${selectedClientId}`),
        fetch(`/api/press/coverage?clientId=${selectedClientId}`),
      ]);

      const [campaignsData, spokesData, journalistsData, ideasData, coverageData] = await Promise.all([
        campaignsRes.ok ? campaignsRes.json() : { data: [] },
        spokesRes.ok ? spokesRes.json() : { data: [] },
        journalistsRes.ok ? journalistsRes.json() : { data: [], total: 0 },
        ideasRes.ok ? ideasRes.json() : { data: [] },
        coverageRes.ok ? coverageRes.json() : { data: [] },
      ]);

      const campaignsList: CampaignWithRelations[] = campaignsData.data ?? [];
      setCampaigns(campaignsList);
      setSpokespersons(spokesData.data ?? []);

      const activeCampaigns = campaignsList.filter(
        (c) => !["completed", "cancelled", "archived"].includes(c.status)
      );
      const totalPitches = campaignsList.reduce((sum, c) => sum + c.pitches_sent, 0);
      const totalCoverage = (coverageData.data ?? []).length;
      const totalBacklinks = (coverageData.data ?? []).filter(
        (c: { has_backlink: boolean }) => c.has_backlink
      ).length;
      const pendingIdeas = (ideasData.data ?? []).filter(
        (i: { is_approved: boolean; is_rejected: boolean }) => !i.is_approved && !i.is_rejected
      );

      setStats({
        active_campaigns: activeCampaigns.length,
        pitches_sent: totalPitches,
        coverage_secured: totalCoverage,
        backlinks_earned: totalBacklinks,
        journalists_in_database: journalistsData.total ?? (journalistsData.data ?? []).length,
        ideas_pending: pendingIdeas.length,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(campaignId: string) {
    const res = await fetch(`/api/press/campaigns/${campaignId}`, { method: "DELETE" });
    if (res.ok) {
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    }
  }

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">PressForge<Link href="/dashboard/academy/pressforge" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
          <p className="text-sm text-muted-foreground">
            Manage digital PR campaigns and press distribution.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Newspaper}
            title="Select a client"
            description="Choose a client from the header selector to manage their press campaigns."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">PressForge<Link href="/dashboard/academy/pressforge" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
          <p className="text-sm text-muted-foreground">
            Manage digital PR campaigns and press distribution.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <PressStatsCards stats={stats} loading={loading} />

      {!loading && campaigns.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Newspaper}
            title="No campaigns yet"
            description="Create your first press campaign to start building authority signals."
            action={
              <Button onClick={() => setCreateOpen(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            }
          />
        </div>
      ) : (
        <CampaignTable
          campaigns={campaigns}
          onDelete={handleDelete}
          loading={loading}
        />
      )}

      <CampaignCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clientId={selectedClientId}
        spokespersons={spokespersons}
        onCreated={(id) => {
          router.push(`/dashboard/press/${id}`);
        }}
      />
    </div>
  );
}
