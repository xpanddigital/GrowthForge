"use client";

import { cn } from "@/lib/utils";
import { Star, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

export interface PlatformProfileData {
  platform: string;
  total_reviews: number;
  average_rating: number;
  rating_scale: number;
  review_velocity_30d: number;
  scrape_error?: string | null;
  last_scraped_at?: string | null;
}

interface PlatformCardProps {
  profile: PlatformProfileData;
}

const PLATFORM_COLORS: Record<string, string> = {
  google: "#4285F4",
  trustpilot: "#00B67A",
  g2: "#FF492C",
  yelp: "#D32323",
  facebook: "#1877F2",
};

const PLATFORM_NAMES: Record<string, string> = {
  google: "Google",
  trustpilot: "Trustpilot",
  g2: "G2",
  yelp: "Yelp",
  facebook: "Facebook",
  capterra: "Capterra",
  apple: "Apple App Store",
  tripadvisor: "Tripadvisor",
  bbb: "BBB",
  glassdoor: "Glassdoor",
};

function getVelocityIndicator(velocity: number) {
  if (velocity > 2) return { icon: TrendingUp, label: "Growing", color: "text-emerald-400" };
  if (velocity >= 0.5) return { icon: Minus, label: "Steady", color: "text-amber-400" };
  return { icon: TrendingDown, label: "Declining", color: "text-red-400" };
}

function renderStars(rating: number, scale: number) {
  const normalized = (rating / scale) * 5;
  const full = Math.floor(normalized);
  const partial = normalized - full;
  const empty = 5 - full - (partial > 0 ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
        />
      ))}
      {partial > 0 && (
        <div className="relative h-3.5 w-3.5">
          <Star className="absolute h-3.5 w-3.5 text-muted-foreground/40" />
          <div
            className="absolute overflow-hidden"
            style={{ width: `${partial * 100}%` }}
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="h-3.5 w-3.5 text-muted-foreground/40"
        />
      ))}
    </div>
  );
}

export function PlatformCard({ profile }: PlatformCardProps) {
  const brandColor = PLATFORM_COLORS[profile.platform] ?? "#6B7280";
  const displayName = PLATFORM_NAMES[profile.platform] ?? profile.platform;
  const velocity = getVelocityIndicator(profile.review_velocity_30d);
  const VelocityIcon = velocity.icon;

  if (profile.scrape_error) {
    return (
      <div className="rounded-lg border-2 border-red-500/20 bg-card p-4">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: brandColor }}
          />
          <h3 className="text-sm font-medium text-foreground">{displayName}</h3>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="truncate">{profile.scrape_error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-border bg-card p-4 transition-colors hover:border-border/80">
      {/* Platform name with color dot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: brandColor }}
          />
          <h3 className="text-sm font-medium text-foreground">{displayName}</h3>
        </div>
        <span
          className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            velocity.color
          )}
        >
          <VelocityIcon className="h-3 w-3" />
          {velocity.label}
        </span>
      </div>

      {/* Star rating */}
      <div className="mt-3 flex items-center gap-2">
        {renderStars(profile.average_rating, profile.rating_scale)}
        <span className="text-sm font-medium tabular-nums text-foreground">
          {profile.average_rating.toFixed(1)}
        </span>
      </div>

      {/* Stats row */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-medium tabular-nums text-foreground">
            {profile.total_reviews.toLocaleString()}
          </span>{" "}
          reviews
        </span>
        <span>
          <span className="font-medium tabular-nums text-foreground">
            {profile.review_velocity_30d.toFixed(1)}
          </span>
          /mo
        </span>
      </div>

      {/* Last scraped */}
      {profile.last_scraped_at && (
        <div className="mt-2 text-[10px] text-muted-foreground/60">
          Last checked:{" "}
          {new Date(profile.last_scraped_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>
      )}
    </div>
  );
}
