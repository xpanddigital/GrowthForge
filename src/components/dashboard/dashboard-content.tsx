"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useClientContext } from "@/hooks/use-client-context";
import { StatsCards } from "./stats-cards";
import { ActivityFeed } from "./activity-feed";
import { ModuleStatus } from "./module-status";
import { Button } from "@/components/ui/button";
import { Radar, ListChecks, UserPlus } from "lucide-react";
import type { DashboardStats } from "@/types/api";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    threads_this_month: 0,
    responses_this_month: 0,
    responses_posted: 0,
    queued_threads: 0,
    total_clients: 0,
    total_keywords: 0,
  });
  const [loading, setLoading] = useState(true);
  const { selectedClientId, selectedClientName } = useClientContext();
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Build queries with optional client filtering
      let threadsQuery = supabase
        .from("threads")
        .select("id", { count: "exact", head: true })
        .gte("discovered_at", startOfMonth);

      let responsesQuery = supabase
        .from("responses")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth);

      let postedQuery = supabase
        .from("responses")
        .select("id", { count: "exact", head: true })
        .eq("status", "posted")
        .gte("created_at", startOfMonth);

      let queuedQuery = supabase
        .from("threads")
        .select("id", { count: "exact", head: true })
        .in("status", ["queued", "classified"]);

      if (selectedClientId) {
        threadsQuery = threadsQuery.eq("client_id", selectedClientId);
        responsesQuery = responsesQuery.eq("client_id", selectedClientId);
        postedQuery = postedQuery.eq("client_id", selectedClientId);
        queuedQuery = queuedQuery.eq("client_id", selectedClientId);
      }

      const [
        threadsResult,
        responsesResult,
        postedResult,
        queuedResult,
        clientsResult,
        keywordsResult,
      ] = await Promise.all([
        threadsQuery,
        responsesQuery,
        postedQuery,
        queuedQuery,
        selectedClientId
          ? Promise.resolve({ count: 1 })
          : supabase
              .from("clients")
              .select("id", { count: "exact", head: true })
              .eq("is_active", true),
        selectedClientId
          ? supabase
              .from("keywords")
              .select("id", { count: "exact", head: true })
              .eq("client_id", selectedClientId)
              .eq("is_active", true)
          : supabase
              .from("keywords")
              .select("id", { count: "exact", head: true })
              .eq("is_active", true),
      ]);

      setStats({
        threads_this_month: threadsResult.count ?? 0,
        responses_this_month: responsesResult.count ?? 0,
        responses_posted: postedResult.count ?? 0,
        queued_threads: queuedResult.count ?? 0,
        total_clients: clientsResult.count ?? 0,
        total_keywords: keywordsResult.count ?? 0,
      });
      setLoading(false);
    }

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  const contextLabel = selectedClientName ?? "All Clients";

  const searchParams = useSearchParams();
  const isCheckoutSuccess = searchParams.get("checkout") === "success";
  const sessionId = searchParams.get("session_id");
  const [showBanner, setShowBanner] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // When returning from Stripe checkout, verify the session and activate the plan
  useEffect(() => {
    if (!isCheckoutSuccess || !sessionId || verifying) return;

    async function verifyCheckout() {
      setVerifying(true);
      try {
        const res = await fetch("/api/billing/verify-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (res.ok) {
          setShowBanner(true);
          // Clean up URL params
          window.history.replaceState({}, "", "/dashboard");
        }
      } catch (err) {
        console.error("Checkout verification failed:", err);
      }
      setVerifying(false);
    }

    verifyCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutSuccess, sessionId]);

  return (
    <div className="space-y-6">
      {/* Checkout Verification */}
      {verifying && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          Activating your plan...
        </div>
      )}

      {/* Checkout Success Banner */}
      {showBanner && (
        <div className="relative rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
          <h3 className="font-semibold text-green-600 dark:text-green-400">
            Welcome to MentionLayer! 🎉
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your plan is now active. Get started by adding your first client and running a discovery scan.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate()} &middot; {contextLabel} &middot;{" "}
            {stats.total_clients} client{stats.total_clients !== 1 ? "s" : ""},{" "}
            {stats.total_keywords} keyword{stats.total_keywords !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/citations/runs">
              <Radar className="mr-2 h-4 w-4" />
              Run Discovery Scan
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/citations">
              <ListChecks className="mr-2 h-4 w-4" />
              Review Queue
              {stats.queued_threads > 0 && (
                <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6C5CE7] px-1.5 text-xs font-medium text-white">
                  {stats.queued_threads}
                </span>
              )}
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/clients/new">
              <UserPlus className="mr-2 h-4 w-4" />
              New Client
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} loading={loading} />

      {/* Activity + Modules */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed />
        <ModuleStatus />
      </div>
    </div>
  );
}
