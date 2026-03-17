"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Send, MailOpen, MousePointerClick, Star } from "lucide-react";

export interface CampaignData {
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  target_count: number;
  requests_sent: number;
  requests_opened: number;
  reviews_received: number;
  conversion_rate: number;
  started_at: string | null;
}

interface CampaignTrackerProps {
  campaign: CampaignData;
}

const STATUS_STYLES: Record<
  string,
  { variant: "default" | "secondary" | "outline" | "destructive"; label: string }
> = {
  draft: { variant: "outline", label: "Draft" },
  active: { variant: "default", label: "Active" },
  paused: { variant: "secondary", label: "Paused" },
  completed: { variant: "secondary", label: "Completed" },
};

export function CampaignTracker({ campaign }: CampaignTrackerProps) {
  const statusStyle = STATUS_STYLES[campaign.status] ?? STATUS_STYLES.draft;
  const progressPercent =
    campaign.target_count > 0
      ? Math.min((campaign.reviews_received / campaign.target_count) * 100, 100)
      : 0;

  const stats = [
    {
      icon: Send,
      label: "Sent",
      value: campaign.requests_sent,
      color: "text-blue-400",
    },
    {
      icon: MailOpen,
      label: "Opened",
      value: campaign.requests_opened,
      color: "text-amber-400",
    },
    {
      icon: MousePointerClick,
      label: "Clicked",
      value: Math.round(
        campaign.requests_opened * (campaign.conversion_rate / 100 || 0) * 1.5
      ),
      color: "text-[#6C5CE7]",
    },
    {
      icon: Star,
      label: "Reviewed",
      value: campaign.reviews_received,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">
            {campaign.name}
          </h3>
          {campaign.started_at && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Started{" "}
              {new Date(campaign.started_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Progress to target
          </span>
          <span className="tabular-nums text-foreground">
            {campaign.reviews_received} / {campaign.target_count}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              progressPercent >= 100
                ? "bg-emerald-500"
                : progressPercent >= 50
                  ? "bg-[#6C5CE7]"
                  : "bg-[#6C5CE7]/70"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-md bg-muted/50 p-2">
            <Icon className={cn("h-3.5 w-3.5", color)} />
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {value.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Conversion rate */}
      <div className="mt-3 flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
        <span className="text-xs text-muted-foreground">Conversion Rate</span>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            campaign.conversion_rate >= 15
              ? "text-emerald-400"
              : campaign.conversion_rate >= 5
                ? "text-amber-400"
                : "text-red-400"
          )}
        >
          {campaign.conversion_rate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
