import { createServerClient } from "@/lib/supabase/server";
import type { CalendarEvent } from "@/types/database";

// Get calendar events for a specific month, filtered by regions and industries
export async function getCalendarEventsForMonth(
  month: number,
  regions: string[],
  industries: string[]
): Promise<CalendarEvent[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("press_calendar_events")
    .select("*")
    .eq("month", month)
    .eq("is_active", true);

  if (error) throw new Error(`Calendar query failed: ${error.message}`);
  if (!data) return [];

  // Filter by region and industry relevance
  return data.filter((event: CalendarEvent) => {
    const regionMatch =
      event.regions.includes("GLOBAL") ||
      regions.some((r) => event.regions.includes(r));

    const industryMatch =
      event.industries.includes("ALL") ||
      industries.some((i) => event.industries.includes(i));

    return regionMatch && industryMatch;
  });
}

// Get all events for a year (for calendar display)
export async function getCalendarEventsForYear(
  year: number,
  regions: string[],
  industries: string[]
): Promise<Record<number, CalendarEvent[]>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("press_calendar_events")
    .select("*")
    .eq("is_active", true);

  if (error) throw new Error(`Calendar query failed: ${error.message}`);
  if (!data) return {};

  const byMonth: Record<number, CalendarEvent[]> = {};

  for (const event of data) {
    const regionMatch =
      event.regions.includes("GLOBAL") ||
      regions.some((r: string) => event.regions.includes(r));

    const industryMatch =
      event.industries.includes("ALL") ||
      industries.some((i: string) => event.industries.includes(i));

    if (regionMatch && industryMatch) {
      if (!byMonth[event.month]) byMonth[event.month] = [];
      byMonth[event.month].push(event as CalendarEvent);
    }
  }

  return byMonth;
}
