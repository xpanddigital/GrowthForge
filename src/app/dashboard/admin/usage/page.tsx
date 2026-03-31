"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/admin/kpi-card";
import { UsageCharts } from "@/components/admin/usage-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck, FileText, MessageSquare, CreditCard } from "lucide-react";

interface UsageData {
  totalAudits: number;
  totalThreads: number;
  totalResponses: number;
  creditsConsumed30d: number;
  creditTrend: Array<{ date: string; credits: number }>;
  featureAdoption: Array<{
    agent_type: string;
    count: number;
    agencies: number;
  }>;
  topAgencies: Array<{
    agency_id: string;
    agency_name: string;
    credits_used: number;
  }>;
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/usage");
        if (!res.ok) throw new Error("Failed to load usage data");
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

  // Calculate total credits for percentage column
  const totalCredits =
    data?.topAgencies?.reduce((sum, a) => sum + a.credits_used, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Usage</h1>
        <p className="text-sm text-muted-foreground">
          Feature adoption, credit consumption, and activity metrics
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Audits"
          value={data?.totalAudits ?? 0}
          icon={ShieldCheck}
          loading={loading}
        />
        <KpiCard
          title="Total Threads"
          value={data?.totalThreads ?? 0}
          icon={FileText}
          loading={loading}
        />
        <KpiCard
          title="Total Responses"
          value={data?.totalResponses ?? 0}
          icon={MessageSquare}
          loading={loading}
        />
        <KpiCard
          title="Credits Consumed (30d)"
          value={data?.creditsConsumed30d?.toLocaleString() ?? "0"}
          icon={CreditCard}
          iconColor="bg-amber-500/10"
          iconTextColor="text-amber-500"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <UsageCharts
        creditTrend={data?.creditTrend ?? []}
        featureAdoption={data?.featureAdoption ?? []}
        loading={loading}
      />

      {/* Top agencies table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Agencies by Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Agency Name</TableHead>
                <TableHead className="text-right">Credits Used</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.topAgencies ?? []).map((agency, index) => (
                <TableRow key={agency.agency_id}>
                  <TableCell className="font-medium text-muted-foreground">
                    #{index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {agency.agency_name}
                  </TableCell>
                  <TableCell className="text-right">
                    {agency.credits_used.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {totalCredits > 0
                      ? `${((agency.credits_used / totalCredits) * 100).toFixed(1)}%`
                      : "---"}
                  </TableCell>
                </TableRow>
              ))}
              {(data?.topAgencies ?? []).length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No usage data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
