"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarMonthView } from "@/components/press/calendar-month-view";
import type { PressCalendarEvent } from "@/types/database";

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  useEffect(() => { document.title = "PressForge — MentionLayer"; }, []);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<PressCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: String(month) });
      if (regionFilter !== "all") params.set("region", regionFilter);

      const res = await fetch(`/api/press/calendar?${params}`);
      if (res.ok) {
        const { data } = await res.json();
        setEvents(data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [month, regionFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  }

  const filtered = events.filter((e) => {
    if (typeFilter !== "all" && e.event_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">PR Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Seasonal hooks, awareness days, and industry events for campaign ideation.
        </p>
      </div>

      {/* Month navigation + filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-32 text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="GLOBAL">Global</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="awareness_day">Awareness Day</SelectItem>
              <SelectItem value="awareness_month">Awareness Month</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="industry">Industry</SelectItem>
              <SelectItem value="news_pattern">News Pattern</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Calendar}
            title="No events found"
            description={`No events for ${MONTH_NAMES[month]} ${year} with the selected filters.`}
          />
        </div>
      ) : (
        <CalendarMonthView events={filtered} month={month} year={year} />
      )}
    </div>
  );
}
