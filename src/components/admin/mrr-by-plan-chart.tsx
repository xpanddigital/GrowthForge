"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MrrByPlanChartProps {
  data: Array<{ plan: string; count: number; mrr: number }>;
  loading?: boolean;
}

const PLAN_COLORS: Record<string, string> = {
  solo: "#A78BFA",
  growth: "#8B5CF6",
  agency: "#7C3AED",
  agency_pro: "#6D28D9",
  agency_unlimited: "#5B21B6",
};

function getPlanColor(plan: string): string {
  return PLAN_COLORS[plan] ?? "#6C5CE7";
}

function formatCurrencyShort(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${value}`;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { count: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover p-3 text-sm shadow-md">
      <p className="mb-1 font-medium capitalize">{label}</p>
      <p className="text-muted-foreground">
        MRR: {currencyFormatter.format(payload[0].value)}
      </p>
      <p className="text-muted-foreground">
        Subscribers: {payload[0].payload.count}
      </p>
    </div>
  );
}

export function MrrByPlanChart({ data, loading = false }: MrrByPlanChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">MRR by Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">MRR by Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="plan"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => v.replace("_", " ")}
            />
            <YAxis
              tickFormatter={formatCurrencyShort}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.plan} fill={getPlanColor(entry.plan)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
