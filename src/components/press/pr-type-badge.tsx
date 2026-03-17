"use client";

import { cn } from "@/lib/utils";

const prTypeConfig: Record<string, { label: string; className: string }> = {
  expert_commentary: { label: "Expert Commentary", className: "bg-blue-500/10 text-blue-500" },
  data_driven: { label: "Data Driven", className: "bg-cyan-500/10 text-cyan-500" },
  case_study: { label: "Case Study", className: "bg-emerald-500/10 text-emerald-500" },
  thought_leadership: { label: "Thought Leadership", className: "bg-violet-500/10 text-violet-500" },
  event: { label: "Event", className: "bg-amber-500/10 text-amber-500" },
  award: { label: "Award", className: "bg-yellow-500/10 text-yellow-500" },
  partnership: { label: "Partnership", className: "bg-pink-500/10 text-pink-500" },
  launch: { label: "Launch", className: "bg-orange-500/10 text-orange-500" },
};

interface PrTypeBadgeProps {
  prType: string;
  className?: string;
}

export function PrTypeBadge({ prType, className }: PrTypeBadgeProps) {
  const config = prTypeConfig[prType] || {
    label: prType.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
