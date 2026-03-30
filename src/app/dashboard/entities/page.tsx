"use client";

import { useEffect, useState, useCallback } from "react";
import { Network, RefreshCw, Zap, Search, CheckCircle2, AlertTriangle, ExternalLink, BookOpen } from "lucide-react";
import Link from "next/link";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { ConsistencyScoreCard } from "@/components/entity/consistency-score-card";
import { PlatformGrid } from "@/components/entity/platform-grid";
import { RobotsSummary } from "@/components/entity/robots-summary";
import { Badge } from "@/components/ui/badge";

interface CanonicalData {
  id: string;
  canonical_name: string;
  canonical_description: string;
  status: "draft" | "approved";
  version: number;
  platformDescriptions?: Record<string, string>;
}

interface ProfileData {
  platform: string;
  status: string;
  consistencyScore: number | null;
  platformProfileUrl: string | null;
}

interface SchemaData {
  page_type: string;
  url: string;
  schemas_found: string[];
  schemas_missing: string[];
  robots_txt?: {
    score: number;
    crawlerAccess: Record<string, { allowed: boolean; rule: string | null }>;
  };
  llms_txt?: {
    exists: boolean;
    quality_score: number | null;
  };
  overall_score: number | null;
}

interface TaskData {
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

export default function EntitiesPage() {
  useEffect(() => { document.title = "Entity Sync — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [canonical, setCanonical] = useState<CanonicalData | null>(null);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [schema, setSchema] = useState<SchemaData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const [canonicalRes, profilesRes, schemaRes, tasksRes] = await Promise.all([
        fetch(`/api/entity/canonical?clientId=${selectedClientId}`),
        fetch(`/api/entity/profiles?clientId=${selectedClientId}`),
        fetch(`/api/entity/schema?clientId=${selectedClientId}`),
        fetch(`/api/entity/tasks?clientId=${selectedClientId}&status=pending`),
      ]);

      if (canonicalRes.ok) {
        const data = await canonicalRes.json();
        setCanonical(data.canonical || null);
      }
      if (profilesRes.ok) {
        const data = await profilesRes.json();
        setProfiles(data.profiles || []);
      }
      if (schemaRes.ok) {
        const data = await schemaRes.json();
        setSchema(data.results || []);
      }
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
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

  const handleScan = async (scanType: "full" | "quick" | "schema_only") => {
    if (!selectedClientId) return;
    setScanning(scanType);
    try {
      await fetch("/api/entity/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, scanType }),
      });
      // Reload after a short delay to show new data
      setTimeout(() => loadData(), 2000);
    } catch {
      // handle error
    } finally {
      setScanning(null);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">Entity Sync<Link href="/dashboard/academy/entity-sync" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
          <p className="text-sm text-muted-foreground">
            Select a client to manage entity consistency.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Network}
            title="No client selected"
            description="Select a client from the header to view their entity sync dashboard."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">Entity Sync<Link href="/dashboard/academy/entity-sync" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
          <p className="text-sm text-muted-foreground">Loading entity data...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 h-48 animate-pulse" />
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-6 h-64 animate-pulse" />
      </div>
    );
  }

  if (!canonical) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">Entity Sync<Link href="/dashboard/academy/entity-sync" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
          <p className="text-sm text-muted-foreground">
            Ensure {selectedClientName}&apos;s brand consistency across platforms.
          </p>
        </div>
        <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Network className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Set up your canonical brand description to start</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Define the authoritative version of your brand identity. This canonical description
                will be used to measure consistency across all platforms and directories.
              </p>
            </div>
            <Link
              href="/dashboard/entities/canonical"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Set Up Canonical
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const platformsFound = profiles.filter((p) => p.status === "found" || p.status === "matched").length;
  const platformsTotal = profiles.length;
  const scoredProfiles = profiles.filter((p) => p.consistencyScore !== null);
  const consistencyScore =
    scoredProfiles.length > 0
      ? Math.round(
          scoredProfiles.reduce((sum, p) => sum + (p.consistencyScore || 0), 0) /
            scoredProfiles.length
        )
      : null;

  const robotsResult = schema.find(
    (s) => s.page_type === "robots_txt" || s.robots_txt
  );
  const llmsResult = schema.find(
    (s) => s.page_type === "llms_txt" || s.llms_txt
  );
  const robotsScore = robotsResult?.robots_txt?.score ?? null;
  const llmsExists = llmsResult?.llms_txt?.exists ?? false;
  const crawlerAccess = robotsResult?.robots_txt?.crawlerAccess ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">Entity Sync<Link href="/dashboard/academy/entity-sync" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
          <p className="text-sm text-muted-foreground">
            {selectedClientName}&apos;s brand consistency across platforms
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleScan("schema_only")}
            disabled={scanning !== null}
            className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50"
          >
            {scanning === "schema_only" ? "Scanning..." : "Schema Only"}
          </button>
          <button
            onClick={() => handleScan("quick")}
            disabled={scanning !== null}
            className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            {scanning === "quick" ? "Scanning..." : "Quick Scan"}
          </button>
          <button
            onClick={() => handleScan("full")}
            disabled={scanning !== null}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${scanning === "full" ? "animate-spin" : ""}`} />
            {scanning === "full" ? "Scanning..." : "Full Scan"}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consistency Score */}
        <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center">
          <ConsistencyScoreCard
            score={consistencyScore}
            label="Consistency Score"
            subtitle="Average match across platforms"
          />
        </div>

        {/* Platform Coverage */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="rounded-full bg-muted p-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums">
                {platformsFound}
                <span className="text-lg text-muted-foreground font-normal">/{platformsTotal}</span>
              </div>
              <span className="text-sm font-medium text-foreground">Platform Coverage</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {platformsFound === platformsTotal
                  ? "All platforms found"
                  : `${platformsTotal - platformsFound} platforms missing`}
              </p>
            </div>
          </div>
        </div>

        {/* AI Accessibility */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="rounded-full bg-muted p-3">
              <Network className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-foreground">AI Accessibility</span>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-sm">
                  {robotsScore !== null ? (
                    <>
                      {robotsScore >= 70 ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-muted-foreground">robots.txt:</span>
                      <span className="font-medium">{robotsScore}/100</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">robots.txt: Not scanned</span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  {llmsExists ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground">llms.txt:</span>
                  <span className="font-medium">{llmsExists ? "Found" : "Missing"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canonical Status Bar */}
      <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Canonical:</span>
          {canonical.status === "approved" ? (
            <Badge variant="default" className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15">
              Approved (v{canonical.version})
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 border-amber-500/20 hover:bg-amber-500/15">
              Draft
            </Badge>
          )}
          <span className="text-sm text-muted-foreground truncate max-w-md">
            {canonical.canonical_name}
          </span>
        </div>
        <Link
          href="/dashboard/entities/canonical"
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Edit Canonical
        </Link>
      </div>

      {/* Platform Grid */}
      {profiles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Platform Profiles</h3>
          <PlatformGrid profiles={profiles} />
        </div>
      )}

      {/* AI Crawler Summary */}
      {robotsResult?.robots_txt && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">AI Crawler Access</h3>
          <RobotsSummary
            score={robotsResult.robots_txt.score}
            crawlerAccess={crawlerAccess}
          />
        </div>
      )}

      {/* Task Preview */}
      {tasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Pending Tasks</h3>
            <Link
              href="/dashboard/entities/tasks"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View All Tasks →
            </Link>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      task.priority === "critical"
                        ? "border-red-500/30 text-red-500"
                        : task.priority === "high"
                          ? "border-amber-500/30 text-amber-500"
                          : "border-muted-foreground/30 text-muted-foreground"
                    }
                  >
                    {task.priority}
                  </Badge>
                  <span className="text-sm text-foreground">{task.description}</span>
                </div>
                {task.platform && (
                  <span className="text-xs text-muted-foreground">{task.platform}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
