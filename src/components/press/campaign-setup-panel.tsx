"use client";

import { Loader2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PressCampaign, Spokesperson, PressRelease } from "@/types/database";

interface CampaignSetupPanelProps {
  campaign: PressCampaign;
  spokesperson?: Spokesperson | null;
  releases: PressRelease[];
  onGenerateRelease: () => void;
  generating?: boolean;
}

export function CampaignSetupPanel({
  campaign,
  spokesperson,
  releases,
  onGenerateRelease,
  generating,
}: CampaignSetupPanelProps) {
  const hasRelease = releases.length > 0;

  return (
    <div className="space-y-6">
      {/* Spokesperson info */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Spokesperson</h3>
        {spokesperson ? (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">{spokesperson.name}</p>
              <p className="text-sm text-muted-foreground">{spokesperson.title}</p>
              {spokesperson.bio && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {spokesperson.bio}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {spokesperson.voice_profile ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                    Voice profile ready
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                    No voice profile
                  </span>
                )}
                {spokesperson.is_primary && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Primary
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No spokesperson assigned. Edit the campaign to assign one.
          </p>
        )}
      </div>

      {/* Campaign details */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Campaign Details</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Headline</dt>
            <dd className="mt-0.5 font-medium">{campaign.headline || "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Angle</dt>
            <dd className="mt-0.5">{campaign.angle || "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Target Region</dt>
            <dd className="mt-0.5">{campaign.target_region}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Target Publications</dt>
            <dd className="mt-0.5">
              {campaign.target_publications.length > 0
                ? campaign.target_publications.join(", ")
                : "-"}
            </dd>
          </div>
          {campaign.notes && (
            <div className="col-span-2">
              <dt className="text-muted-foreground">Notes</dt>
              <dd className="mt-0.5">{campaign.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Generate release CTA */}
      {!hasRelease && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary/50 mb-3" />
          <h3 className="font-medium mb-1">Ready to generate a press release</h3>
          <p className="text-sm text-muted-foreground mb-4">
            AI will write a press release based on your campaign details and spokesperson voice profile.
          </p>
          <Button onClick={onGenerateRelease} disabled={generating}>
            {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Press Release
          </Button>
        </div>
      )}
    </div>
  );
}
