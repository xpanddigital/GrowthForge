"use client";

import { useEffect, useState, useCallback } from "react";
import { Globe, ExternalLink, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  platform: string;
  platform_profile_url: string | null;
  is_claimed: boolean | null;
  description_text: string | null;
  category: string | null;
  consistency_score: number | null;
  status: string;
  issues: Array<{ field: string; severity: string; description: string }>;
  last_scraped_at: string | null;
}

const DISPLAY_NAMES: Record<string, string> = {
  google_business: "Google Business Profile",
  linkedin: "LinkedIn",
  wikipedia: "Wikipedia",
  wikidata: "Wikidata",
  crunchbase: "Crunchbase",
  facebook: "Facebook",
  twitter: "Twitter/X",
  instagram: "Instagram",
  youtube: "YouTube",
  trustpilot: "Trustpilot",
  g2: "G2",
  capterra: "Capterra",
  yelp: "Yelp",
  bbb: "BBB",
  apple_maps: "Apple Maps",
  bing_places: "Bing Places",
  foursquare: "Foursquare",
  avvo: "Avvo",
  super_lawyers: "Super Lawyers",
  findlaw: "FindLaw",
  justia: "Justia",
  martindale: "Martindale",
  allmusic: "AllMusic",
  musicbrainz: "MusicBrainz",
  discogs: "Discogs",
  homeadvisor: "HomeAdvisor",
  angi: "Angi",
  houzz: "Houzz",
  product_hunt: "Product Hunt",
  angellist: "AngelList",
  alternativeto: "AlternativeTo",
  industry_specific: "Industry Specific",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  not_checked: { label: "Not Checked", color: "text-muted-foreground" },
  not_found: { label: "Not Found", color: "text-zinc-400" },
  found_unclaimed: { label: "Found (Unclaimed)", color: "text-amber-500" },
  claimed_inconsistent: { label: "Inconsistent", color: "text-amber-500" },
  claimed_consistent: { label: "Consistent", color: "text-emerald-500" },
  needs_creation: { label: "Needs Creation", color: "text-red-400" },
};

type FilterStatus = "all" | "found" | "missing" | "inconsistent" | "consistent";

function getScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

export default function ProfilesPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [rescanning, setRescanning] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/entity/profiles?clientId=${selectedClientId}&sortBy=consistency`
      );
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.data || []);
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

  const handleRescan = async (platform: string) => {
    if (!selectedClientId) return;
    setRescanning(platform);
    try {
      await fetch("/api/entity/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          scanType: "single",
          platform,
        }),
      });
      setTimeout(() => loadData(), 3000);
    } catch {
      // handle error
    } finally {
      setRescanning(null);
    }
  };

  const filtered = profiles.filter((p) => {
    if (filter === "all") return true;
    if (filter === "found")
      return !["not_found", "not_checked", "needs_creation"].includes(p.status);
    if (filter === "missing")
      return ["not_found", "needs_creation"].includes(p.status);
    if (filter === "inconsistent") return p.status === "claimed_inconsistent";
    if (filter === "consistent") return p.status === "claimed_consistent";
    return true;
  });

  const counts = {
    all: profiles.length,
    found: profiles.filter(
      (p) => !["not_found", "not_checked", "needs_creation"].includes(p.status)
    ).length,
    missing: profiles.filter((p) =>
      ["not_found", "needs_creation"].includes(p.status)
    ).length,
    inconsistent: profiles.filter(
      (p) => p.status === "claimed_inconsistent"
    ).length,
    consistent: profiles.filter((p) => p.status === "claimed_consistent")
      .length,
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Platform Profiles</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Globe}
            title="No client selected"
            description="Select a client to view their platform profiles."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Platform Profiles</h2>
        <p className="text-sm text-muted-foreground">Loading profiles...</p>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 h-20 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Platform Profiles</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Globe}
            title="No profiles discovered"
            description="Run an entity scan to discover your brand's presence across platforms."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Platform Profiles</h2>
        <p className="text-sm text-muted-foreground">
          {selectedClientName}&apos;s brand presence across directories and platforms
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["found", "Found"],
            ["missing", "Missing"],
            ["inconsistent", "Inconsistent"],
            ["consistent", "Consistent"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Profiles table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Platform
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Consistency
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Issues
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Last Scanned
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((profile) => {
                const statusConfig =
                  STATUS_CONFIG[profile.status] ?? STATUS_CONFIG.not_checked;
                const issueCount = Array.isArray(profile.issues)
                  ? profile.issues.length
                  : 0;

                return (
                  <tr
                    key={profile.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/entities/profiles/${profile.id}`}
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                      >
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {DISPLAY_NAMES[profile.platform] ?? profile.platform}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium", statusConfig.color)}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              profile.consistency_score !== null &&
                                profile.consistency_score >= 70
                                ? "bg-emerald-500"
                                : profile.consistency_score !== null &&
                                    profile.consistency_score >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            )}
                            style={{
                              width: `${profile.consistency_score ?? 0}%`,
                            }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs tabular-nums font-medium",
                            getScoreColor(profile.consistency_score)
                          )}
                        >
                          {profile.consistency_score !== null
                            ? `${profile.consistency_score}%`
                            : "\u2014"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {issueCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-amber-500/30 text-amber-500"
                        >
                          {issueCount} issue{issueCount !== 1 ? "s" : ""}
                        </Badge>
                      ) : profile.status === "claimed_consistent" ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 text-emerald-500"
                        >
                          Clean
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          \u2014
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {profile.last_scraped_at
                        ? new Date(profile.last_scraped_at).toLocaleDateString()
                        : "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {profile.platform_profile_url && (
                          <a
                            href={profile.platform_profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            title="Open profile"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleRescan(profile.platform)}
                          disabled={rescanning === profile.platform}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                          title="Re-scan this platform"
                        >
                          <RefreshCw
                            className={cn(
                              "h-3.5 w-3.5",
                              rescanning === profile.platform && "animate-spin"
                            )}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
