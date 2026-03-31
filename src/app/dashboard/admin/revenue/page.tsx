"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/admin/kpi-card";
import { MrrChart } from "@/components/admin/mrr-chart";
import { RevenueEventFeed } from "@/components/admin/revenue-event-feed";
import { DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

interface OverviewData {
  mrr: number;
  arr: number;
  arpa: number;
  counts: {
    active: number;
  };
}

interface RevenueEvent {
  id: string;
  event_type: string;
  agency_name?: string;
  agencyName?: string;
  previous_plan?: string;
  new_plan?: string;
  mrr_delta: number;
  amount_cents: number;
  occurred_at: string;
}

interface RevenueData {
  monthlyTrend: Array<{
    month: string;
    new_mrr: number;
    churned_mrr: number;
    net_mrr: number;
  }>;
  recentEvents: RevenueEvent[];
}

export default function RevenuePage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, revenueRes] = await Promise.all([
          fetch("/api/admin/overview"),
          fetch("/api/admin/revenue"),
        ]);

        if (!overviewRes.ok) throw new Error("Failed to load overview data");
        if (!revenueRes.ok) throw new Error("Failed to load revenue data");

        const [overviewJson, revenueJson] = await Promise.all([
          overviewRes.json(),
          revenueRes.json(),
        ]);

        setOverview(overviewJson);
        setRevenue(revenueJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
        {error}
      </div>
    );
  }

  // Calculate running MRR for chart
  const mrrChartData = (revenue?.monthlyTrend ?? []).map((m) => {
    let runningMrr = 0;
    for (const entry of revenue?.monthlyTrend ?? []) {
      if (entry.month <= m.month) {
        runningMrr += entry.net_mrr;
      }
    }
    return {
      month: m.month,
      mrr: Math.round(runningMrr / 100),
      newMrr: Math.round(m.new_mrr / 100),
      churnedMrr: Math.round(m.churned_mrr / 100),
    };
  });

  // Calculate net MRR change this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTrend = revenue?.monthlyTrend.find(
    (m) => m.month === currentMonth
  );
  const netMrrChangeThisMonth = thisMonthTrend?.net_mrr ?? 0;

  // Map recentEvents to the shape RevenueEventFeed expects
  const events = (revenue?.recentEvents ?? []).map((e) => ({
    ...e,
    agency_name: e.agencyName ?? e.agency_name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Revenue</h1>
        <p className="text-sm text-muted-foreground">
          MRR trends and subscription events
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Monthly Recurring Revenue"
          value={overview ? formatCurrency(overview.mrr / 100) : "$0"}
          icon={DollarSign}
          loading={loading}
        />
        <KpiCard
          title="Annual Revenue"
          value={overview ? formatCurrency(overview.arr / 100) : "$0"}
          icon={TrendingUp}
          loading={loading}
        />
        <KpiCard
          title="ARPA"
          value={overview ? formatCurrency(overview.arpa / 100) : "$0"}
          subtitle="Average revenue per account"
          icon={Users}
          loading={loading}
        />
        <KpiCard
          title="Net MRR Change"
          value={formatCurrency(netMrrChangeThisMonth / 100)}
          subtitle="This month"
          icon={BarChart3}
          iconColor={
            netMrrChangeThisMonth >= 0
              ? "bg-emerald-500/10"
              : "bg-red-500/10"
          }
          iconTextColor={
            netMrrChangeThisMonth >= 0 ? "text-emerald-500" : "text-red-500"
          }
          loading={loading}
        />
      </div>

      {/* Full MRR trend chart */}
      <MrrChart data={mrrChartData} loading={loading} />

      {/* Subscription events table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Subscription Events</h2>
        </div>
        <RevenueEventFeed
          events={events}
          showAgencyName={true}
          loading={loading}
        />
      </div>
    </div>
  );
}
