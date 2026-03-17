"use client";

import { cn } from "@/lib/utils";

interface ContentGap {
  id: string;
  topic: string;
  competitor_advantage: string;
  recommended_content: string;
  content_type: string;
  publish_target: string;
  impact: "high" | "medium" | "low";
  detail: string;
  status: string;
  created_at: string;
}

interface ContentGapCardProps {
  gap: ContentGap;
  onStatusChange?: (gapId: string, status: string) => void;
}

const IMPACT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "High Impact", color: "text-red-400", bg: "bg-red-500/10" },
  medium: { label: "Medium Impact", color: "text-amber-400", bg: "bg-amber-500/10" },
  low: { label: "Low Impact", color: "text-blue-400", bg: "bg-blue-500/10" },
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  blog_post: "Blog Post",
  comparison_page: "Comparison Page",
  faq: "FAQ",
  case_study: "Case Study",
  forum_post: "Forum Post",
  data_study: "Data Study",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "text-blue-400" },
  in_progress: { label: "In Progress", color: "text-amber-400" },
  completed: { label: "Completed", color: "text-emerald-400" },
  dismissed: { label: "Dismissed", color: "text-muted-foreground" },
};

export function ContentGapCard({ gap, onStatusChange }: ContentGapCardProps) {
  const impact = IMPACT_CONFIG[gap.impact] || IMPACT_CONFIG.medium;
  const status = STATUS_CONFIG[gap.status] || STATUS_CONFIG.open;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">{gap.topic}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", impact.bg, impact.color)}>
              {impact.label}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
              {CONTENT_TYPE_LABELS[gap.content_type] || gap.content_type}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
              {gap.publish_target}
            </span>
          </div>
        </div>
        <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <span className="text-muted-foreground">Competitor Advantage: </span>
          <span className="text-foreground/80">{gap.competitor_advantage}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Recommended: </span>
          <span className="text-foreground/80">{gap.recommended_content}</span>
        </div>
        {gap.detail && (
          <p className="text-muted-foreground italic">{gap.detail}</p>
        )}
      </div>

      {onStatusChange && gap.status === "open" && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={() => onStatusChange(gap.id, "in_progress")}
            className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Start Working
          </button>
          <button
            onClick={() => onStatusChange(gap.id, "dismissed")}
            className="text-xs px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
