"use client";

import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface PlatformProfile {
  platform: string;
  status: string;
  consistencyScore: number | null;
  platformProfileUrl: string | null;
}

interface PlatformGridProps {
  profiles: PlatformProfile[];
}

const DISPLAY_NAMES: Record<string, string> = {
  google_business: "Google Business",
  linkedin: "LinkedIn",
  wikipedia: "Wikipedia",
  crunchbase: "Crunchbase",
  facebook: "Facebook",
  twitter: "Twitter/X",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  github: "GitHub",
  trustpilot: "Trustpilot",
  g2: "G2",
  capterra: "Capterra",
  yelp: "Yelp",
  apple_maps: "Apple Maps",
  bing_places: "Bing Places",
  bbb: "BBB",
  glassdoor: "Glassdoor",
};

const STATUS_STYLES: Record<string, { border: string; label: string; dot: string }> = {
  claimed_consistent: {
    border: "border-emerald-500/40",
    label: "Consistent",
    dot: "bg-emerald-500",
  },
  claimed_inconsistent: {
    border: "border-amber-500/40",
    label: "Inconsistent",
    dot: "bg-amber-500",
  },
  not_found: {
    border: "border-muted",
    label: "Missing",
    dot: "bg-muted-foreground",
  },
  not_checked: {
    border: "border-border",
    label: "Not Checked",
    dot: "bg-muted-foreground/50",
  },
  needs_creation: {
    border: "border-red-500/40",
    label: "Needs Creation",
    dot: "bg-red-500",
  },
};

function getScoreBarColor(score: number | null) {
  if (score === null) return "bg-muted";
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export function PlatformGrid({ profiles }: PlatformGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {profiles.map((profile) => {
        const style = STATUS_STYLES[profile.status] ?? STATUS_STYLES.not_checked;
        const displayName =
          DISPLAY_NAMES[profile.platform] ?? profile.platform;

        return (
          <div
            key={profile.platform}
            className={cn(
              "rounded-lg border-2 bg-card p-4 transition-colors",
              style.border
            )}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-foreground">
                  {displayName}
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={cn("inline-block h-2 w-2 rounded-full", style.dot)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {style.label}
                  </span>
                </div>
              </div>
              {profile.platformProfileUrl && (
                <a
                  href={profile.platformProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Consistency score bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Consistency</span>
                <span className="tabular-nums text-foreground">
                  {profile.consistencyScore !== null
                    ? `${profile.consistencyScore}%`
                    : "\u2014"}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getScoreBarColor(profile.consistencyScore)
                  )}
                  style={{
                    width: `${profile.consistencyScore ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
