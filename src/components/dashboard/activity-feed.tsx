"use client";

import { useEffect, useState } from "react";
import { Clock, Search, Sparkles, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientContext } from "@/hooks/use-client-context";

interface ActivityItem {
  id: string;
  type: "discovery_run" | "response_generated" | "response_posted";
  description: string;
  clientName: string;
  timestamp: string;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "discovery_run":
      return { icon: Search, bg: "bg-[#6C5CE7]/10", color: "text-[#6C5CE7]" };
    case "response_generated":
      return { icon: Sparkles, bg: "bg-amber-500/10", color: "text-amber-500" };
    case "response_posted":
      return { icon: Send, bg: "bg-emerald-500/10", color: "text-emerald-500" };
  }
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedClientId } = useClientContext();
  const supabase = createClient();

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      const items: ActivityItem[] = [];

      // Fetch discovery runs with client name
      let discoveryQuery = supabase
        .from("discovery_runs")
        .select("id, run_type, status, items_succeeded, started_at, client_id, clients(name)")
        .order("started_at", { ascending: false })
        .limit(10);

      if (selectedClientId) {
        discoveryQuery = discoveryQuery.eq("client_id", selectedClientId);
      }

      const { data: runs } = await discoveryQuery;

      if (runs) {
        for (const run of runs) {
          const clientName =
            (run.clients as unknown as { name: string })?.name ?? "Unknown";
          const runTypeLabel =
            run.run_type === "serp_scan"
              ? "SERP Scan"
              : run.run_type === "ai_probe"
              ? "AI Probe"
              : run.run_type === "classification"
              ? "Classification"
              : run.run_type === "response_gen"
              ? "Response Generation"
              : run.run_type === "thread_enrich"
              ? "Thread Enrichment"
              : run.run_type;

          const statusLabel =
            run.status === "completed"
              ? `completed — ${run.items_succeeded ?? 0} items processed`
              : run.status === "running"
              ? "in progress..."
              : run.status === "failed"
              ? "failed"
              : run.status;

          items.push({
            id: `run-${run.id}`,
            type: "discovery_run",
            description: `${runTypeLabel} ${statusLabel} for ${clientName}`,
            clientName,
            timestamp: run.started_at,
          });
        }
      }

      // Fetch recent responses with client name and thread title
      let responsesQuery = supabase
        .from("responses")
        .select("id, variant, status, created_at, posted_at, client_id, clients(name), threads(title)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (selectedClientId) {
        responsesQuery = responsesQuery.eq("client_id", selectedClientId);
      }

      const { data: responses } = await responsesQuery;

      if (responses) {
        for (const resp of responses) {
          const clientName =
            (resp.clients as unknown as { name: string })?.name ?? "Unknown";
          const threadTitle =
            (resp.threads as unknown as { title: string })?.title ?? "Untitled thread";
          const truncatedTitle =
            threadTitle.length > 50
              ? threadTitle.substring(0, 50) + "..."
              : threadTitle;

          if (resp.status === "posted" && resp.posted_at) {
            items.push({
              id: `resp-posted-${resp.id}`,
              type: "response_posted",
              description: `${resp.variant} response posted for "${truncatedTitle}"`,
              clientName,
              timestamp: resp.posted_at,
            });
          }

          items.push({
            id: `resp-${resp.id}`,
            type: "response_generated",
            description: `${resp.variant} response generated for "${truncatedTitle}"`,
            clientName,
            timestamp: resp.created_at,
          });
        }
      }

      // Sort all items by timestamp descending and take the top 10
      items.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(items.slice(0, 10));
      setLoading(false);
    }

    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <div className="p-2">
        {loading ? (
          <div className="space-y-1 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Clock}
              title="No activity yet"
              description="Add a client and run your first discovery scan to get started."
            />
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {activities.map((activity) => {
              const { icon: Icon, bg, color } = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-foreground">
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
