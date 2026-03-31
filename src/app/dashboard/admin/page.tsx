"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/admin/kpi-card";
import { MrrChart } from "@/components/admin/mrr-chart";
import { MrrByPlanChart } from "@/components/admin/mrr-by-plan-chart";
import {
  DollarSign,
  Users,
  TrendingUp,
  UserPlus,
  Clock,
} from "lucide-react";

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
    total: number;
    active: number;
    trialing: number;
    past_due: number;
    canceled: number;
    none: number;
  };
  signupsThisWeek: number;
  signupsThisMonth: number;
  trialConversionRate: number;
  mrrByPlan: Array<{ plan: string; count: number; mrr: number }>;
}

interface RevenueData {
  monthlyTrend: Array<{
    month: string;
    new_mrr: number;
    churned_mrr: number;
    net_mrr: number;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
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

        setData(overviewJson);
        setRevenueData(revenueJson);
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

  const mrrChartData = (revenueData?.monthlyTrend ?? []).map((m) => {
    let runningMrr = 0;
    for (const entry of revenueData?.monthlyTrend ?? []) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Admin</h1>
        <p className="text-sm text-muted-foreground">
          Business intelligence dashboard
        </p>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Monthly Recurring Revenue"
          value={data ? formatCurrency(data.mrr / 100) : "$0"}
          icon={DollarSign}
          loading={loading}
        />
        <KpiCard
          title="Active Subscribers"
          value={data?.counts.active ?? 0}
          icon={Users}
          loading={loading}
        />
        <KpiCard
          title="Trial Conversion Rate"
          value={data ? `${data.trialConversionRate}%` : "0%"}
          icon={TrendingUp}
          loading={loading}
        />
        <KpiCard
          title="Signups This Month"
          value={data?.signupsThisMonth ?? 0}
          icon={UserPlus}
          loading={loading}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MrrChart data={mrrChartData} loading={loading} />
        <MrrByPlanChart data={data?.mrrByPlan ?? []} loading={loading} />
      </div>

      {/* Row 3: Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="On Trial"
          value={data?.counts.trialing ?? 0}
          icon={Clock}
          iconColor="bg-blue-500/10"
          iconTextColor="text-blue-500"
          loading={loading}
        />
        <KpiCard
          title="Past Due"
          value={data?.counts.past_due ?? 0}
          icon={DollarSign}
          iconColor="bg-amber-500/10"
          iconTextColor="text-amber-500"
          loading={loading}
        />
        <KpiCard
          title="Churned"
          value={data?.counts.canceled ?? 0}
          icon={Users}
          iconColor="bg-red-500/10"
          iconTextColor="text-red-500"
          loading={loading}
        />
        <KpiCard
          title="Annual Revenue"
          value={data ? formatCurrency(data.arr / 100) : "$0"}
          icon={DollarSign}
          iconColor="bg-emerald-500/10"
          iconTextColor="text-emerald-500"
          loading={loading}
        />
      </div>
    </div>
  );
}
