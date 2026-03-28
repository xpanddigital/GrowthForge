"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { ConsistencyScoreCard } from "@/components/entity/consistency-score-card";
import { TaskCard } from "@/components/entity/task-card";

interface Profile {
  id: string;
  client_id: string;
  platform: string;
  platform_profile_url: string | null;
  platform_profile_id: string | null;
  is_claimed: boolean | null;
  description_text: string | null;
  category: string | null;
  contact_info: Record<string, unknown>;
  additional_fields: Record<string, unknown>;
  consistency_score: number | null;
  consistency_details: Record<string, number>;
  issues: Array<{
    field: string;
    severity: string;
    description: string;
    current_value?: string;
    expected_value?: string;
  }>;
  status: string;
  last_scraped_at: string | null;
  scrape_error: string | null;
}

interface Canonical {
  canonical_name: string;
  canonical_description: string;
  canonical_category: string;
  canonical_contact: Record<string, unknown>;
}

interface Task {
  id: string;
  taskType: string;
  description: string;
  instructions: string | null;
  generatedCode: string | null;
  platformDescription: string | null;
  platformCharLimit: number | null;
  platform: string | null;
  priority: string;
  priorityScore: number;
  status: string;
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

const SEVERITY_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-500" },
  high: { bg: "bg-orange-500/10", text: "text-orange-500" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  low: { bg: "bg-zinc-500/10", text: "text-zinc-400" },
};

const DETAIL_WEIGHTS: Record<string, string> = {
  name: "20%",
  description: "30%",
  category: "15%",
  contact: "20%",
  other: "15%",
};

export default function ProfileDetailPage() {
  useEffect(() => { document.title = "Entity Sync — MentionLayer"; }, []);

  const params = useParams();
  const profileId = params.profileId as string;
  const { selectedClientId } = useClientContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [canonical, setCanonical] = useState<Canonical | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescanning, setRescanning] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const [profilesRes, canonicalRes] = await Promise.all([
        fetch(`/api/entity/profiles?clientId=${selectedClientId}`),
        fetch(`/api/entity/canonical?clientId=${selectedClientId}`),
      ]);

      if (profilesRes.ok) {
        const data = await profilesRes.json();
        const allProfiles: Profile[] = data.data || [];
        const found = allProfiles.find((p) => p.id === profileId);
        setProfile(found || null);

        // Load tasks for this platform
        if (found) {
          const tasksRes = await fetch(
            `/api/entity/tasks?clientId=${selectedClientId}&platform=${found.platform}`
          );
          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            const rawTasks = tasksData.data || [];
            setTasks(
              rawTasks.map(
                (t: {
                  id: string;
                  task_type: string;
                  description: string;
                  instructions: string | null;
                  generated_code: string | null;
                  platform_description: string | null;
                  platform_char_limit: number | null;
                  platform: string | null;
                  priority: string;
                  priority_score: number;
                  status: string;
                }) => ({
                  id: t.id,
                  taskType: t.task_type,
                  description: t.description,
                  instructions: t.instructions,
                  generatedCode: t.generated_code,
                  platformDescription: t.platform_description,
                  platformCharLimit: t.platform_char_limit,
                  platform: t.platform,
                  priority: t.priority,
                  priorityScore: t.priority_score,
                  status: t.status,
                })
              )
            );
          }
        }
      }
      if (canonicalRes.ok) {
        const data = await canonicalRes.json();
        setCanonical(data.data || null);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, profileId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRescan = async () => {
    if (!selectedClientId || !profile) return;
    setRescanning(true);
    try {
      await fetch("/api/entity/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          scanType: "single",
          platform: profile.platform,
        }),
      });
      setTimeout(() => loadData(), 3000);
    } catch {
      // handle error
    } finally {
      setRescanning(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/entity/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch {
      // handle error
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Profile Detail</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-6 h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/entities/profiles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Profiles
        </Link>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={AlertTriangle}
            title="Profile not found"
            description="This profile may have been removed or the scan hasn't completed yet."
          />
        </div>
      </div>
    );
  }

  const displayName = DISPLAY_NAMES[profile.platform] ?? profile.platform;
  const issues = Array.isArray(profile.issues) ? profile.issues : [];
  const details = profile.consistency_details || {};

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <Link
        href="/dashboard/entities/profiles"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Profiles
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{displayName}</h2>
          <div className="mt-1 flex items-center gap-3">
            {profile.platform_profile_url && (
              <a
                href={profile.platform_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View Profile
              </a>
            )}
            {profile.is_claimed !== null && (
              <Badge
                variant="outline"
                className={
                  profile.is_claimed
                    ? "border-emerald-500/30 text-emerald-500"
                    : "border-muted-foreground/30 text-muted-foreground"
                }
              >
                {profile.is_claimed ? "Claimed" : "Unclaimed"}
              </Badge>
            )}
            {profile.last_scraped_at && (
              <span className="text-xs text-muted-foreground">
                Last scanned:{" "}
                {new Date(profile.last_scraped_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleRescan}
          disabled={rescanning}
          className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", rescanning && "animate-spin")}
          />
          {rescanning ? "Scanning..." : "Re-scan"}
        </button>
      </div>

      {/* Score + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score card */}
        <div className="rounded-lg border border-border bg-card p-6 flex items-center justify-center">
          <ConsistencyScoreCard
            score={profile.consistency_score}
            label="Consistency Score"
            subtitle={`Match against canonical`}
          />
        </div>

        {/* Score breakdown */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">
            Score Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(DETAIL_WEIGHTS).map(([field, weight]) => {
              const fieldScore =
                details[field] !== undefined ? details[field] : null;
              return (
                <div key={field} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize text-muted-foreground">
                      {field}{" "}
                      <span className="text-muted-foreground/60">
                        ({weight})
                      </span>
                    </span>
                    <span
                      className={cn(
                        "tabular-nums font-medium",
                        fieldScore !== null && fieldScore >= 70
                          ? "text-emerald-500"
                          : fieldScore !== null && fieldScore >= 40
                            ? "text-amber-500"
                            : "text-red-500"
                      )}
                    >
                      {fieldScore !== null ? `${fieldScore}%` : "\u2014"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        fieldScore !== null && fieldScore >= 70
                          ? "bg-emerald-500"
                          : fieldScore !== null && fieldScore >= 40
                            ? "bg-amber-500"
                            : "bg-red-500"
                      )}
                      style={{ width: `${fieldScore ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrape error */}
        {profile.scrape_error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
            <h3 className="text-sm font-medium text-red-400 mb-2">
              Scrape Error
            </h3>
            <p className="text-xs text-red-400/80">{profile.scrape_error}</p>
          </div>
        )}
      </div>

      {/* Side-by-side comparison */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Canonical vs Platform
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canonical side */}
          <div className="space-y-4">
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              Canonical (Source of Truth)
            </span>
            {canonical ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Name
                  </span>
                  <p className="text-sm text-foreground">
                    {canonical.canonical_name}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </span>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {canonical.canonical_description}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Category
                  </span>
                  <p className="text-sm text-foreground">
                    {canonical.canonical_category}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No canonical defined
              </p>
            )}
          </div>

          {/* Platform side */}
          <div className="space-y-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {displayName}
            </span>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </span>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {profile.description_text || (
                    <span className="italic text-muted-foreground">
                      Not available
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </span>
                <p className="text-sm text-foreground">
                  {profile.category || (
                    <span className="italic text-muted-foreground">
                      Not available
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">
            Issues ({issues.length})
          </h3>
          <div className="space-y-2">
            {issues.map((issue, idx) => {
              const style =
                SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.low;
              return (
                <div
                  key={idx}
                  className="rounded-md border border-border bg-background p-3 flex items-start gap-3"
                >
                  {issue.severity === "critical" || issue.severity === "high" ? (
                    <XCircle
                      className={cn("h-4 w-4 mt-0.5 shrink-0", style.text)}
                    />
                  ) : (
                    <AlertTriangle
                      className={cn("h-4 w-4 mt-0.5 shrink-0", style.text)}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          style.bg,
                          style.text
                        )}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-xs font-medium text-foreground capitalize">
                        {issue.field}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {issue.description}
                    </p>
                    {issue.current_value && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">Current: </span>
                        <span className="text-red-400">
                          {issue.current_value}
                        </span>
                      </div>
                    )}
                    {issue.expected_value && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">
                          Expected:{" "}
                        </span>
                        <span className="text-emerald-500">
                          {issue.expected_value}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {issues.length === 0 &&
        profile.status === "claimed_consistent" && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-sm text-emerald-500 font-medium">
              This profile is fully consistent with your canonical description.
            </p>
          </div>
        )}

      {/* Related tasks */}
      {tasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            Related Tasks ({tasks.length})
          </h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleTaskStatusChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
