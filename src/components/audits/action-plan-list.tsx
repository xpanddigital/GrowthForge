"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActionItem {
  priority: number;
  pillar: string;
  action: string;
  impact: string;
  effort: string;
  timeline: string;
  module: string;
}

interface ActionPlanListProps {
  actions: ActionItem[];
  className?: string;
}

const pillarColors: Record<string, string> = {
  citations: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ai_presence: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  entities: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  reviews: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  press: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const pillarLabels: Record<string, string> = {
  citations: "Citations",
  ai_presence: "AI Presence",
  entities: "Entities",
  reviews: "Reviews",
  press: "Press",
};

function getImpactStyle(impact: string): string {
  switch (impact) {
    case "high":
      return "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30";
    case "medium":
      return "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30";
    case "low":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function getEffortStyle(effort: string): string {
  switch (effort) {
    case "low":
      return "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30";
    case "medium":
      return "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30";
    case "high":
      return "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function getPriorityColor(priority: number): string {
  if (priority <= 2) return "bg-[#EF4444] text-white";
  if (priority <= 4) return "bg-[#F59E0B] text-white";
  return "bg-gray-500 text-white";
}

export function ActionPlanList({ actions, className }: ActionPlanListProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {actions.map((item) => (
        <div
          key={item.priority}
          className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/20"
        >
          <div className="flex items-start gap-3">
            {/* Priority badge */}
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                getPriorityColor(item.priority)
              )}
            >
              {item.priority}
            </div>

            <div className="flex-1 min-w-0">
              {/* Action text */}
              <p className="text-sm font-medium leading-snug">
                {item.action}
              </p>

              {/* Metadata row */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase tracking-wider",
                    pillarColors[item.pillar]
                  )}
                >
                  {pillarLabels[item.pillar] || item.pillar}
                </Badge>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase tracking-wider",
                    getImpactStyle(item.impact)
                  )}
                >
                  Impact: {item.impact}
                </Badge>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase tracking-wider",
                    getEffortStyle(item.effort)
                  )}
                >
                  Effort: {item.effort}
                </Badge>

                <span className="text-xs text-muted-foreground">
                  {item.timeline}
                </span>

                <span className="text-xs text-muted-foreground">
                  via {item.module}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
