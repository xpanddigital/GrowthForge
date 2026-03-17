"use client";

import { cn } from "@/lib/utils";

const intentConfig = {
  informational: { label: "Info", className: "bg-blue-500/10 text-blue-500" },
  transactional: {
    label: "Transact",
    className: "bg-emerald-500/10 text-emerald-500",
  },
  commercial: {
    label: "Commercial",
    className: "bg-amber-500/10 text-amber-500",
  },
  navigational: {
    label: "Nav",
    className: "bg-violet-500/10 text-violet-500",
  },
};

interface IntentTagProps {
  intent: string | null;
  className?: string;
}

export function IntentTag({ intent, className }: IntentTagProps) {
  if (!intent) return null;

  const config =
    intentConfig[intent as keyof typeof intentConfig] ||
    intentConfig.informational;

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
