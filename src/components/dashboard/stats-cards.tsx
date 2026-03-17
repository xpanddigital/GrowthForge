"use client";

import { MessageSquareQuote, Sparkles, Send, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types/api";

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

const statItems = [
  {
    key: "threads_this_month" as const,
    label: "Threads Discovered",
    sublabel: "This month",
    icon: MessageSquareQuote,
    iconBg: "bg-[#6C5CE7]/10",
    iconColor: "text-[#6C5CE7]",
  },
  {
    key: "responses_this_month" as const,
    label: "Responses Generated",
    sublabel: "This month",
    icon: Sparkles,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    key: "responses_posted" as const,
    label: "Responses Posted",
    sublabel: "This month",
    icon: Send,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    key: "queued_threads" as const,
    label: "Queued Threads",
    sublabel: "Awaiting action",
    icon: Clock,
    iconBg: "bg-[#00D2D3]/10",
    iconColor: "text-[#00D2D3]",
  },
];

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key];
        return (
          <div
            key={item.key}
            className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-border/80"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconBg}`}>
                <Icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold tracking-tight">{value}</p>
                </div>
                <p className="text-xs text-muted-foreground/70">{item.sublabel}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
