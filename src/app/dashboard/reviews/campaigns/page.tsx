"use client";

import { useEffect, useState, useCallback } from "react";
import { Megaphone, Plus, Target, Mail, CheckCircle2, Clock, Pause } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  target_platform: string;
  target_url: string | null;
  target_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  converted_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  draft: { label: "Draft", color: "border-muted-foreground/30 text-muted-foreground", icon: Clock },
  active: { label: "Active", color: "border-emerald-500/30 text-emerald-500", icon: Mail },
  paused: { label: "Paused", color: "border-amber-500/30 text-amber-500", icon: Pause },
  completed: { label: "Completed", color: "border-blue-500/30 text-blue-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "border-red-500/30 text-red-400", icon: Clock },
};

export default function CampaignsPage() {
  useEffect(() => { document.title = "Review Engine — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/campaigns?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || data.data || []);
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
        <div>
          <h2 className="text-lg font-semibold">Review Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            Manage review request campaigns.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Megaphone}
            title="No client selected"
            description="Select a client from the header to manage their review campaigns."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Review Campaigns</h2>
          <p className="text-sm text-muted-foreground">Loading campaigns...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Review Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            Review request campaigns for {selectedClientName}
          </p>
        </div>
        <Link
          href="/dashboard/reviews/campaigns/new"
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          New Campaign
        </Link>
      </div>

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Create a review request campaign to boost your review volume."
            action={
              <Link
                href="/dashboard/reviews/campaigns/new"
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Campaign
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => {
            const statusConfig = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft;
            const progress = campaign.target_count > 0
              ? Math.round((campaign.sent_count / campaign.target_count) * 100)
              : 0;
            const conversionRate = campaign.sent_count > 0
              ? Math.round((campaign.converted_count / campaign.sent_count) * 100)
              : 0;

            return (
              <Link
                key={campaign.id}
                href={`/dashboard/reviews/campaigns/${campaign.id}`}
                className="block rounded-lg border border-border bg-card p-5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {campaign.name}
                    </h3>
                    {campaign.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={cn("ml-2 text-[10px] shrink-0", statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Target Platform */}
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground capitalize">
                    {campaign.target_platform.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {campaign.sent_count}/{campaign.target_count} sent
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">{campaign.opened_count}</span> opened
                  </span>
                  <span>
                    <span className="font-medium text-foreground">{campaign.clicked_count}</span> clicked
                  </span>
                  <span>
                    <span className="font-medium text-emerald-500">{conversionRate}%</span> conversion
                  </span>
                </div>

                {/* Dates */}
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Created {new Date(campaign.created_at).toLocaleDateString()}
                  {campaign.started_at && (
                    <> &middot; Started {new Date(campaign.started_at).toLocaleDateString()}</>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
