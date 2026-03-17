"use client";

import { ExternalLink, Link2, Trophy } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { PressCoverage } from "@/types/database";

interface CoverageFeedProps {
  items: PressCoverage[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const coverageTypeColors: Record<string, string> = {
  feature: "bg-emerald-500/10 text-emerald-500",
  mention: "bg-blue-500/10 text-blue-500",
  quote: "bg-violet-500/10 text-violet-500",
  syndication: "bg-cyan-500/10 text-cyan-500",
  backlink_only: "bg-amber-500/10 text-amber-500",
};

export function CoverageFeed({ items }: CoverageFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <Trophy className="mx-auto h-8 w-8 text-primary/50 mb-3" />
        <h3 className="font-medium mb-1">No coverage yet</h3>
        <p className="text-sm text-muted-foreground">
          Coverage will appear here as journalists publish stories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sm hover:text-primary transition-colors truncate"
                >
                  {item.title}
                  <ExternalLink className="inline-block ml-1 h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">{item.publication}</span>
                {item.author && (
                  <>
                    <span className="text-border">·</span>
                    <span className="text-xs text-muted-foreground">{item.author}</span>
                  </>
                )}
                <span className="text-border">·</span>
                <span className="text-xs text-muted-foreground">{formatDate(item.publish_date)}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    coverageTypeColors[item.coverage_type] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.coverage_type.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {item.has_backlink && (
                <div className="flex items-center gap-1 text-xs">
                  <Link2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className={item.is_dofollow ? "text-emerald-500" : "text-amber-500"}>
                    {item.is_dofollow ? "dofollow" : "nofollow"}
                  </span>
                </div>
              )}
              {item.estimated_domain_authority && (
                <div className="text-center">
                  <p className="text-sm font-semibold">{item.estimated_domain_authority}</p>
                  <p className="text-[10px] text-muted-foreground">DA</p>
                </div>
              )}
              {item.sentiment && (
                <StatusBadge status={item.sentiment === "positive" ? "approved" : item.sentiment === "negative" ? "rejected" : "pending"} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
