"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface UsageChartsProps {
  creditTrend: Array<{ date: string; credits: number }>;
  featureAdoption: Array<{
    agent_type: string;
    count: number;
    agencies: number;
  }>;
  loading?: boolean;
}

const AGENT_TYPE_COLORS: Record<string, string> = {
  discovery: "#6C5CE7",
  enrichment: "#A78BFA",
  classification: "#8B5CF6",
  response: "#7C3AED",
  audit_citation: "#00D2D3",
  audit_ai_presence: "#06B6D4",
  audit_entity: "#22D3EE",
  audit_review: "#67E8F9",
  audit_press: "#A5F3FC",
  monitor: "#10B981",
};

function getAgentColor(type: string): string {
  return AGENT_TYPE_COLORS[type] ?? "#6C5CE7";
}

function formatAgentType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function CreditTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover p-3 text-sm shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      <p className="text-muted-foreground">
        Credits: {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

function AdoptionTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { agencies: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover p-3 text-sm shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      <p className="text-muted-foreground">
        Runs: {payload[0].value.toLocaleString()}
      </p>
      <p className="text-muted-foreground">
        Agencies: {payload[0].payload.agencies}
      </p>
    </div>
  );
}

export function UsageCharts({
  creditTrend,
  featureAdoption,
  loading = false,
}: UsageChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credit Consumption (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feature Adoption</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const adoptionData = featureAdoption.map((item) => ({
    ...item,
    label: formatAgentType(item.agent_type),
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Credit Consumption (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={creditTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CreditTooltip />} />
              <Line
                type="monotone"
                dataKey="credits"
                stroke="#6C5CE7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Adoption</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={adoptionData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<AdoptionTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {adoptionData.map((entry) => (
                  <Cell
                    key={entry.agent_type}
                    fill={getAgentColor(entry.agent_type)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
