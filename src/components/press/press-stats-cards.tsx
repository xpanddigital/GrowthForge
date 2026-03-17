"use client";

import {
  Newspaper,
  Send,
  Trophy,
  Link2,
  Users,
  Lightbulb,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PressStats {
  active_campaigns: number;
  pitches_sent: number;
  coverage_secured: number;
  backlinks_earned: number;
  journalists_in_database: number;
  ideas_pending: number;
}

interface PressStatsCardsProps {
  stats: PressStats;
  loading?: boolean;
}

const statCards = [
  { key: "active_campaigns" as const, label: "Active Campaigns", icon: Newspaper },
  { key: "pitches_sent" as const, label: "Pitches Sent", icon: Send },
  { key: "coverage_secured" as const, label: "Coverage Secured", icon: Trophy },
  { key: "backlinks_earned" as const, label: "Backlinks Earned", icon: Link2 },
  { key: "journalists_in_database" as const, label: "Journalists in DB", icon: Users },
  { key: "ideas_pending" as const, label: "Ideas Pending", icon: Lightbulb },
];

export function PressStatsCards({ stats, loading }: PressStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{stats[key]}</p>
        </div>
      ))}
    </div>
  );
}
