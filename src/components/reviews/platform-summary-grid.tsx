"use client";

import { PlatformCard, type PlatformProfileData } from "./platform-card";

interface PlatformSummaryGridProps {
  profiles: PlatformProfileData[];
}

export function PlatformSummaryGrid({ profiles }: PlatformSummaryGridProps) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No review platforms found. Add platform profiles to begin tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {profiles.map((profile) => (
        <PlatformCard key={profile.platform} profile={profile} />
      ))}
    </div>
  );
}
