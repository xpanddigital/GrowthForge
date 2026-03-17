"use client";

import {
  Shield,
  Brain,
  Building2,
  Star,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PillarScoreCardProps {
  pillar: string;
  score: number;
  status: string;
  onClick?: () => void;
  className?: string;
}

const pillarConfig: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  citations: { label: "Citations", icon: Shield },
  ai_presence: { label: "AI Presence", icon: Brain },
  entities: { label: "Entities", icon: Building2 },
  reviews: { label: "Reviews", icon: Star },
  press: { label: "Press", icon: Newspaper },
};

function getScoreBarColor(score: number): string {
  if (score <= 30) return "bg-[#EF4444]";
  if (score <= 60) return "bg-[#F59E0B]";
  return "bg-[#10B981]";
}

function getScoreTextColor(score: number): string {
  if (score <= 30) return "text-[#EF4444]";
  if (score <= 60) return "text-[#F59E0B]";
  return "text-[#10B981]";
}

export function PillarScoreCard({
  pillar,
  score,
  status,
  onClick,
  className,
}: PillarScoreCardProps) {
  const config = pillarConfig[pillar] || {
    label: pillar,
    icon: Shield,
  };
  const Icon = config.icon;
  const isClickable = !!onClick;
  const isCompleted = status === "completed";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        isClickable && "cursor-pointer hover:border-primary/50 hover:bg-card/80",
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick?.();
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          {config.label}
        </span>
      </div>

      {isCompleted ? (
        <>
          <div className={cn("text-2xl font-bold mb-2", getScoreTextColor(score))}>
            {score}
            <span className="text-sm font-normal text-muted-foreground">/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", getScoreBarColor(score))}
              style={{ width: `${score}%` }}
            />
          </div>
        </>
      ) : (
        <div className="text-sm text-muted-foreground italic">
          {status === "running" ? "Scanning..." : "Pending"}
        </div>
      )}
    </div>
  );
}

export { pillarConfig };
