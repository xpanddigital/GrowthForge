"use client";

import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PressCalendarEvent } from "@/types/database";

interface CalendarMonthViewProps {
  events: PressCalendarEvent[];
  month: number;
  year: number;
}

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const eventTypeColors: Record<string, string> = {
  awareness_day: "bg-blue-500/10 text-blue-500",
  awareness_month: "bg-violet-500/10 text-violet-500",
  seasonal: "bg-amber-500/10 text-amber-500",
  industry: "bg-cyan-500/10 text-cyan-500",
  news_pattern: "bg-emerald-500/10 text-emerald-500",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

export function CalendarMonthView({ events, month, year }: CalendarMonthViewProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <Calendar className="mx-auto h-8 w-8 text-primary/50 mb-3" />
        <h3 className="font-medium mb-1">No events for {MONTH_NAMES[month]} {year}</h3>
        <p className="text-sm text-muted-foreground">
          Try selecting a different month or adding custom events.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">
        {MONTH_NAMES[month]} {year} — {events.length} event{events.length !== 1 ? "s" : ""}
      </h3>
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{event.name}</h4>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    eventTypeColors[event.event_type] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {event.event_type.replace(/_/g, " ")}
                </span>
                {event.is_custom && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Custom
                  </span>
                )}
              </div>
              {event.pr_angle_hint && (
                <p className="text-sm text-muted-foreground mb-2">{event.pr_angle_hint}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                {event.event_date && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(event.event_date)}
                  </span>
                )}
                {event.regions.length > 0 && (
                  <div className="flex items-center gap-1">
                    {event.regions.map((r) => (
                      <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {r}
                      </Badge>
                    ))}
                  </div>
                )}
                {event.industries.length > 0 && (
                  <div className="flex items-center gap-1">
                    {event.industries.map((ind) => (
                      <Badge key={ind} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {ind}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">
                Send by offset
              </p>
              <p className="text-sm font-medium">{event.send_by_offset_days}d before</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
