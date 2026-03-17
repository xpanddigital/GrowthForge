"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Newspaper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { CampaignHeader } from "@/components/press/campaign-header";
import { CampaignWorkflowStepper } from "@/components/press/campaign-workflow-stepper";
import { CampaignSetupPanel } from "@/components/press/campaign-setup-panel";
import { PressReleasePanel } from "@/components/press/press-release-panel";
import { JournalistScoreTable } from "@/components/press/journalist-score-table";
import { PitchPreviewPanel } from "@/components/press/pitch-preview-panel";
import { OutreachTracker } from "@/components/press/outreach-tracker";
import { CoverageFeed } from "@/components/press/coverage-feed";
import { CoverageFormDialog } from "@/components/press/coverage-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type {
  PressCampaign,
  Spokesperson,
  PressRelease,
  PressCampaignJournalistScore,
  PressOutreachEmail,
  PressCoverage,
  Journalist,
} from "@/types/database";

// ---------- Types ----------

interface ScoreWithJournalist extends PressCampaignJournalistScore {
  journalists: Pick<Journalist, "name" | "email" | "publication" | "region" | "beats">;
}

interface EmailWithJournalist extends PressOutreachEmail {
  journalists: Pick<Journalist, "name" | "email" | "publication">;
}

interface CampaignFull extends PressCampaign {
  spokespersons?: Spokesperson | null;
}

// ---------- Status-to-tab mapping ----------

const STATUS_TO_TAB: Record<string, string> = {
  draft: "setup",
  ideation_complete: "setup",
  press_release_draft: "release",
  press_release_approved: "release",
  journalists_found: "journalists",
  outreach_ready: "outreach",
  pitches_ready: "outreach",
  outreach_sent: "outreach",
  monitoring: "coverage",
  completed: "coverage",
  cancelled: "setup",
  archived: "coverage",
};

// ---------- Page Component ----------

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.campaignId as string;

  // Data
  const [campaign, setCampaign] = useState<CampaignFull | null>(null);
  const [releases, setReleases] = useState<PressRelease[]>([]);
  const [scores, setScores] = useState<ScoreWithJournalist[]>([]);
  const [emails, setEmails] = useState<EmailWithJournalist[]>([]);
  const [coverage, setCoverage] = useState<PressCoverage[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("setup");
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [generatingPitches, setGeneratingPitches] = useState(false);
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [coverageDialogOpen, setCoverageDialogOpen] = useState(false);

  // Polling ref
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ---------- Data loading ----------

  const loadCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/press/campaigns/${campaignId}`);
      if (!res.ok) return;
      const { data } = await res.json();
      setCampaign(data);
      // Set initial tab from status if not already set by user
      if (data && !pollRef.current) {
        setActiveTab(STATUS_TO_TAB[data.status] || "setup");
      }
    } catch { /* silent */ }
  }, [campaignId]);

  const loadReleases = useCallback(async () => {
    try {
      const res = await fetch(`/api/press/campaigns/${campaignId}/release`);
      if (!res.ok) return;
      const { data } = await res.json();
      setReleases(data ?? []);
    } catch { /* silent */ }
  }, [campaignId]);

  const loadJournalists = useCallback(async () => {
    try {
      const res = await fetch(`/api/press/campaigns/${campaignId}/journalists`);
      if (!res.ok) return;
      const { data } = await res.json();
      setScores(data ?? []);
    } catch { /* silent */ }
  }, [campaignId]);

  const loadOutreach = useCallback(async () => {
    try {
      const res = await fetch(`/api/press/campaigns/${campaignId}/outreach`);
      if (!res.ok) return;
      const { data } = await res.json();
      setEmails(data ?? []);
    } catch { /* silent */ }
  }, [campaignId]);

  const loadCoverage = useCallback(async () => {
    if (!campaign?.client_id) return;
    try {
      const res = await fetch(`/api/press/coverage?clientId=${campaign.client_id}&campaignId=${campaignId}`);
      if (!res.ok) return;
      const { data } = await res.json();
      setCoverage(data ?? []);
    } catch { /* silent */ }
  }, [campaignId, campaign?.client_id]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await loadCampaign();
    await Promise.all([loadReleases(), loadJournalists(), loadOutreach()]);
    setLoading(false);
  }, [loadCampaign, loadReleases, loadJournalists, loadOutreach]);

  useEffect(() => {
    loadAll();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadAll]);

  // Load coverage once campaign is loaded (needs client_id)
  useEffect(() => {
    if (campaign?.client_id) loadCoverage();
  }, [campaign?.client_id, loadCoverage]);

  // ---------- Polling helper ----------

  function startPolling(refreshFn: () => Promise<void>, checkDone?: () => boolean) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      await loadCampaign();
      await refreshFn();
      if (checkDone?.()) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 4000);
  }

  // ---------- Actions ----------

  async function handleGenerateRelease() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/press/campaigns/${campaignId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId }),
      });
      if (res.ok) {
        setActiveTab("release");
        startPolling(loadReleases);
        // Poll will detect new release and stop
        setTimeout(() => {
          setGenerating(false);
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          loadReleases();
          loadCampaign();
        }, 30000);
      }
    } catch {
      setGenerating(false);
    }
  }

  async function handleApproveRelease(releaseId: string) {
    setApproving(true);
    try {
      const res = await fetch(`/api/press/campaigns/${campaignId}/release`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ release_id: releaseId, action: "approve" }),
      });
      if (res.ok) {
        await loadReleases();
        await loadCampaign();
      }
    } finally {
      setApproving(false);
    }
  }

  async function handleRejectRelease(releaseId: string) {
    const res = await fetch(`/api/press/campaigns/${campaignId}/release`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ release_id: releaseId, action: "reject" }),
    });
    if (res.ok) {
      await loadReleases();
      await loadCampaign();
    }
  }

  async function handleDiscoverJournalists() {
    setDiscovering(true);
    try {
      const res = await fetch(`/api/press/campaigns/${campaignId}/journalists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId }),
      });
      if (res.ok) {
        startPolling(loadJournalists);
        setTimeout(() => {
          setDiscovering(false);
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          loadJournalists();
          loadCampaign();
        }, 60000);
      }
    } catch {
      setDiscovering(false);
    }
  }

  async function handleSelectToggle(scoreIds: string[], selected: boolean) {
    // Optimistic update
    setScores((prev) =>
      prev.map((s) =>
        scoreIds.includes(s.id) ? { ...s, is_selected: selected } : s
      )
    );
    await fetch(`/api/press/campaigns/${campaignId}/journalists`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scoreIds, selected }),
    });
  }

  async function handleGeneratePitches() {
    setGeneratingPitches(true);
    try {
      const selectedScoreIds = scores.filter((s) => s.is_selected).map((s) => s.id);
      const res = await fetch(`/api/press/campaigns/${campaignId}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_pitches", journalistScoreIds: selectedScoreIds }),
      });
      if (res.ok) {
        setActiveTab("outreach");
        startPolling(loadOutreach);
        setTimeout(() => {
          setGeneratingPitches(false);
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          loadOutreach();
          loadCampaign();
        }, 60000);
      }
    } catch {
      setGeneratingPitches(false);
    }
  }

  async function handleSendOutreach(emailIds: string[]) {
    setSendingOutreach(true);
    try {
      const res = await fetch(`/api/press/campaigns/${campaignId}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_outreach", emailIds }),
      });
      if (res.ok) {
        await loadOutreach();
        await loadCampaign();
      }
    } finally {
      setSendingOutreach(false);
    }
  }

  async function handleDeleteCampaign() {
    const res = await fetch(`/api/press/campaigns/${campaignId}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/press");
  }

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <EmptyState
          icon={Newspaper}
          title="Campaign not found"
          description="This campaign may have been deleted."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CampaignHeader
        campaign={campaign}
        spokesperson={campaign.spokespersons}
        onDelete={handleDeleteCampaign}
      />

      <CampaignWorkflowStepper
        currentStatus={campaign.status}
        activeTab={activeTab}
        onStepClick={setActiveTab}
      />

      <div className="rounded-lg border border-border bg-card p-6">
        {activeTab === "setup" && (
          <CampaignSetupPanel
            campaign={campaign}
            spokesperson={campaign.spokespersons}
            releases={releases}
            onGenerateRelease={handleGenerateRelease}
            generating={generating}
          />
        )}

        {activeTab === "release" && (
          <PressReleasePanel
            releases={releases}
            onGenerate={handleGenerateRelease}
            onApprove={handleApproveRelease}
            onReject={handleRejectRelease}
            generating={generating}
            approving={approving}
          />
        )}

        {activeTab === "journalists" && (
          <JournalistScoreTable
            scores={scores}
            onSelectToggle={handleSelectToggle}
            onDiscoverMore={handleDiscoverJournalists}
            onGeneratePitches={handleGeneratePitches}
            discovering={discovering}
            generatingPitches={generatingPitches}
          />
        )}

        {activeTab === "outreach" && (
          <div className="space-y-6">
            <PitchPreviewPanel
              emails={emails}
              onSend={handleSendOutreach}
              sending={sendingOutreach}
            />
            {emails.some((e) => e.status !== "pending") && (
              <>
                <div className="border-t border-border" />
                <h3 className="font-semibold">Engagement Tracking</h3>
                <OutreachTracker emails={emails} />
              </>
            )}
          </div>
        )}

        {activeTab === "coverage" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Coverage</h3>
              <Button variant="outline" size="sm" onClick={() => setCoverageDialogOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Coverage
              </Button>
            </div>
            <CoverageFeed items={coverage} />
            {campaign.client_id && (
              <CoverageFormDialog
                open={coverageDialogOpen}
                onOpenChange={setCoverageDialogOpen}
                clientId={campaign.client_id}
                campaignId={campaignId}
                onCreated={loadCoverage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
