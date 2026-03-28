"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Megaphone,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Mail,
  MousePointer,
  Star,
} from "lucide-react";
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
  subject_line: string;
  message_template: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  converted_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "border-muted-foreground/30 text-muted-foreground" },
  active: { label: "Active", color: "border-emerald-500/30 text-emerald-500" },
  paused: { label: "Paused", color: "border-amber-500/30 text-amber-500" },
  completed: { label: "Completed", color: "border-blue-500/30 text-blue-500" },
  cancelled: { label: "Cancelled", color: "border-red-500/30 text-red-400" },
};

const RECIPIENT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-muted-foreground" },
  sent: { label: "Sent", color: "text-blue-500" },
  opened: { label: "Opened", color: "text-amber-500" },
  clicked: { label: "Clicked", color: "text-primary" },
  converted: { label: "Converted", color: "text-emerald-500" },
  bounced: { label: "Bounced", color: "text-red-400" },
  unsubscribed: { label: "Unsubscribed", color: "text-muted-foreground" },
};

export default function CampaignDetailPage() {
  useEffect(() => { document.title = "Review Engine — MentionLayer"; }, []);

  const params = useParams();
  const campaignId = params.campaignId as string;
  const { selectedClientId } = useClientContext();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const [campaignRes, recipientsRes] = await Promise.all([
        fetch(`/api/reviews/campaigns/${campaignId}?clientId=${selectedClientId}`),
        fetch(`/api/reviews/campaigns/${campaignId}/recipients?clientId=${selectedClientId}`),
      ]);

      if (campaignRes.ok) {
        const data = await campaignRes.json();
        setCampaign(data.campaign || data.data || null);
      }
      if (recipientsRes.ok) {
        const data = await recipientsRes.json();
        setRecipients(data.recipients || data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, campaignId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (action: "activate" | "pause" | "approve" | "cancel") => {
    if (!selectedClientId || !campaign) return;
    setActionLoading(action);
    try {
      await fetch(`/api/reviews/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, action }),
      });
      await loadData();
    } catch {
      // handle error
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Campaign Detail</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/reviews/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Campaigns
        </Link>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Megaphone}
            title="Campaign not found"
            description="This campaign may have been removed or is not available."
          />
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft;
  const progress = campaign.target_count > 0
    ? Math.round((campaign.sent_count / campaign.target_count) * 100)
    : 0;
  const conversionRate = campaign.sent_count > 0
    ? Math.round((campaign.converted_count / campaign.sent_count) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/reviews/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Campaigns
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{campaign.name}</h2>
            <Badge variant="outline" className={cn("text-[10px]", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
          {campaign.description && (
            <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="capitalize">{campaign.target_platform.replace(/_/g, " ")}</span>
            <span>&middot;</span>
            <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === "draft" && (
            <button
              onClick={() => handleAction("approve")}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {actionLoading === "approve" ? "Approving..." : "Approve"}
            </button>
          )}
          {campaign.status === "draft" || campaign.status === "paused" ? (
            <button
              onClick={() => handleAction("activate")}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              {actionLoading === "activate" ? "Starting..." : "Activate"}
            </button>
          ) : null}
          {campaign.status === "active" && (
            <button
              onClick={() => handleAction("pause")}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Pause className="h-3.5 w-3.5" />
              {actionLoading === "pause" ? "Pausing..." : "Pause"}
            </button>
          )}
          {(campaign.status === "draft" || campaign.status === "paused") && (
            <button
              onClick={() => handleAction("cancel")}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 text-sm rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              {actionLoading === "cancel" ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>

      {/* Campaign Tracker Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Target", value: campaign.target_count, icon: Star, color: "text-foreground" },
          { label: "Sent", value: campaign.sent_count, icon: Mail, color: "text-blue-500" },
          { label: "Opened", value: campaign.opened_count, icon: Mail, color: "text-amber-500" },
          { label: "Clicked", value: campaign.clicked_count, icon: MousePointer, color: "text-primary" },
          { label: "Converted", value: campaign.converted_count, icon: CheckCircle2, color: "text-emerald-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
            <stat.icon className={cn("h-4 w-4 mx-auto mb-1", stat.color)} />
            <div className={cn("text-xl font-bold tabular-nums", stat.color)}>
              {stat.value}
            </div>
            <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Campaign Progress</span>
          <span className="font-medium text-foreground tabular-nums">{progress}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{campaign.sent_count} sent of {campaign.target_count}</span>
          <span>{conversionRate}% conversion rate</span>
        </div>
      </div>

      {/* Recipient Table */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Recipients ({recipients.length})
        </h3>

        {recipients.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <EmptyState
              icon={Mail}
              title="No recipients"
              description="Add recipients to this campaign to start sending review requests."
            />
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sent</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Opened</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Converted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recipients.map((recipient) => {
                    const recipStatus = RECIPIENT_STATUS[recipient.status] ?? RECIPIENT_STATUS.pending;
                    return (
                      <tr key={recipient.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-foreground">{recipient.name}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                          {recipient.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs font-medium", recipStatus.color)}>
                            {recipStatus.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {recipient.sent_at
                            ? new Date(recipient.sent_at).toLocaleDateString()
                            : "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {recipient.opened_at
                            ? new Date(recipient.opened_at).toLocaleDateString()
                            : "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {recipient.converted_at ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <span className="text-muted-foreground">\u2014</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
