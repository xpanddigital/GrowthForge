"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-500/10 text-blue-500" },
  enriching: {
    label: "Enriching",
    className: "bg-amber-500/10 text-amber-500",
  },
  classified: {
    label: "Classified",
    className: "bg-violet-500/10 text-violet-500",
  },
  queued: { label: "Queued", className: "bg-cyan-500/10 text-cyan-500" },
  generating: {
    label: "Generating",
    className: "bg-amber-500/10 text-amber-500",
  },
  responded: {
    label: "Responded",
    className: "bg-emerald-500/10 text-emerald-500",
  },
  posted: { label: "Posted", className: "bg-emerald-500/10 text-emerald-500" },
  skipped: {
    label: "Skipped",
    className: "bg-muted text-muted-foreground",
  },
  expired: { label: "Expired", className: "bg-red-500/10 text-red-500" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-500",
  },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-500" },
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-500" },
  running: { label: "Running", className: "bg-blue-500/10 text-blue-500" },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-500",
  },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-500" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
