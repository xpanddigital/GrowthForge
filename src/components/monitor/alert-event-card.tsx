"use client";

import { cn } from "@/lib/utils";

interface AlertEvent {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

interface AlertEventCardProps {
  event: AlertEvent;
  onAcknowledge?: (eventId: string) => void;
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  high: { label: "High", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  medium: { label: "Medium", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  low: { label: "Low", color: "text-muted-foreground", bg: "bg-muted/10 border-border" },
};

const TYPE_ICONS: Record<string, string> = {
  som_drop: "📉",
  som_rise: "📈",
  visibility_drop: "⚠️",
  new_competitor: "🆕",
  brand_mentioned: "🎯",
  response_change: "🔄",
};

export function AlertEventCard({ event, onAcknowledge }: AlertEventCardProps) {
  const severity = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.low;
  const icon = TYPE_ICONS[event.alert_type] || "🔔";

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-opacity",
        event.is_acknowledged ? "opacity-60" : "",
        severity.bg
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-foreground truncate">
                {event.title}
              </h4>
              <span className={cn("text-[10px] font-medium uppercase", severity.color)}>
                {severity.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{event.message}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatTimeAgo(event.created_at)}
              {event.is_acknowledged && event.acknowledged_at && (
                <> · Acknowledged {formatTimeAgo(event.acknowledged_at)}</>
              )}
            </p>
          </div>
        </div>
        {!event.is_acknowledged && onAcknowledge && (
          <button
            onClick={() => onAcknowledge(event.id)}
            className="flex-shrink-0 text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
