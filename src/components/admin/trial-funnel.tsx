"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TrialFunnelProps {
  total: number;
  trialing: number;
  converted: number;
  loading?: boolean;
}

function FunnelBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const barWidth = total > 0 ? Math.max((count / total) * 100, 4) : 4;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-8 w-full rounded-md bg-muted/50">
        <div
          className={cn("h-full rounded-md transition-all", color)}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

export function TrialFunnel({
  total,
  trialing,
  converted,
  loading = false,
}: TrialFunnelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trial Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const trialToConvertRate =
    trialing > 0 ? Math.round((converted / trialing) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Trial Funnel</CardTitle>
          <span className="text-sm text-muted-foreground">
            Trial-to-paid: {trialToConvertRate}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FunnelBar
          label="Total Signups"
          count={total}
          total={total}
          color="bg-gray-500"
        />
        <FunnelBar
          label="Active Trials"
          count={trialing}
          total={total}
          color="bg-blue-500"
        />
        <FunnelBar
          label="Converted to Paid"
          count={converted}
          total={total}
          color="bg-emerald-500"
        />
      </CardContent>
    </Card>
  );
}
