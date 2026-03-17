"use client";

import { cn } from "@/lib/utils";

const platformConfig = {
  reddit: { label: "Reddit", className: "bg-[#FF4500]/10 text-[#FF4500]" },
  quora: { label: "Quora", className: "bg-[#B92B27]/10 text-[#B92B27]" },
  facebook_groups: {
    label: "Facebook",
    className: "bg-[#1877F2]/10 text-[#1877F2]",
  },
};

interface PlatformBadgeProps {
  platform: string;
  className?: string;
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config =
    platformConfig[platform as keyof typeof platformConfig] ||
    platformConfig.reddit;

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
