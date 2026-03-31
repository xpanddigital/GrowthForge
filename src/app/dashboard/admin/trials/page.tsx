"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/admin/kpi-card";
import { TrialFunnel } from "@/components/admin/trial-funnel";
import { RevenueEventFeed } from "@/components/admin/revenue-event-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Activity, ShieldCheck } from "lucide-react";

interface ExpiringAgency {
  id: string;
  name: string;
  slug: string;
  plan: string;
  trial_ends_at: string;
  owner_email: string;
  created_at: string;
}

interface ConversionEvent {
  id: string;
  event_type: string;
  agency_name?: string;
  previous_plan?: string;
  new_plan?: string;
  mrr_delta: number;
  amount_cents: number;
  occurred_at: string;
}

interface TrialsData {
  onTrialCount: number;
  totalSignups: number;
  convertedCount: number;
  conversionRate: number;
  avgDaysToConvert: number | null;
  expiringSoon: ExpiringAgency[];
  recentConversions: ConversionEvent[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysRemaining(dateString: string): number {
  const end = new Date(dateString);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function TrialsPage() {
  const [data, setData] = useState<TrialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/trials");
        if (!res.ok) throw new Error("Failed to load trials data");
        const json = await res.json();
        setData(json);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trial Management</h1>
        <p className="text-sm text-muted-foreground">
          Track trial signups, conversions, and expiring accounts
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="On Trial"
          value={data?.onTrialCount ?? 0}
          icon={Clock}
          iconColor="bg-blue-500/10"
          iconTextColor="text-blue-500"
          loading={loading}
        />
        <KpiCard
          title="Conversion Rate"
          value={data ? `${data.conversionRate}%` : "0%"}
          icon={TrendingUp}
          loading={loading}
        />
        <KpiCard
          title="Avg Days to Convert"
          value={
            data?.avgDaysToConvert != null
              ? `${Math.round(data.avgDaysToConvert)}d`
              : "---"
          }
          icon={Activity}
          loading={loading}
        />
        <KpiCard
          title="Expiring This Week"
          value={data?.expiringSoon.length ?? 0}
          icon={ShieldCheck}
          iconColor="bg-amber-500/10"
          iconTextColor="text-amber-500"
          loading={loading}
        />
      </div>

      {/* Funnel */}
      <TrialFunnel
        total={data?.totalSignups ?? 0}
        trialing={data?.onTrialCount ?? 0}
        converted={data?.convertedCount ?? 0}
        loading={loading}
      />

      {/* Expiring Soon table */}
      <Card>
        <CardHeader>
          <CardTitle>Expiring Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Trial Ends</TableHead>
                <TableHead>Days Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.expiringSoon ?? []).map((agency) => {
                const remaining = daysRemaining(agency.trial_ends_at);
                return (
                  <TableRow key={agency.id}>
                    <TableCell className="font-medium">{agency.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {agency.owner_email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{agency.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(agency.trial_ends_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={remaining <= 2 ? "destructive" : "outline"}
                      >
                        {remaining}d
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(data?.expiringSoon ?? []).length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No trials expiring this week
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Conversions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <RevenueEventFeed
            events={(data?.recentConversions ?? []).map((e) => ({
              ...e,
              agency_name: e.agency_name,
            }))}
            showAgencyName={true}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
