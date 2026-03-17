"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PrTypeBadge } from "@/components/press/pr-type-badge";
import type { PressCampaign, Spokesperson } from "@/types/database";

interface CampaignHeaderProps {
  campaign: PressCampaign;
  spokesperson?: Spokesperson | null;
  onDelete: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CampaignHeader({ campaign, spokesperson, onDelete }: CampaignHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard/press")}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold">
            {campaign.headline || campaign.name}
          </h2>
          <StatusBadge status={campaign.status} />
          <PrTypeBadge prType={campaign.pr_type} />
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground pl-7">
          {campaign.angle && <span>{campaign.angle}</span>}
          {spokesperson && (
            <>
              <span className="text-border">|</span>
              <span>{spokesperson.name}, {spokesperson.title}</span>
            </>
          )}
          {campaign.target_date && (
            <>
              <span className="text-border">|</span>
              <span>Target: {formatDate(campaign.target_date)}</span>
            </>
          )}
          <span className="text-border">|</span>
          <span>{campaign.target_region}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-red-500"
        onClick={() => {
          if (confirm("Delete this campaign?")) onDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
