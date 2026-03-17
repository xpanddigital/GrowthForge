// Run this script once to seed the press_calendar_events table from calendar-data.json
// Usage: npx tsx src/data/seed.ts <agency_id>

import { createClient } from "@supabase/supabase-js";
import calendarData from "./calendar-data.json";

async function seedCalendar() {
  const agencyId = process.argv[2];
  if (!agencyId) {
    console.error("Usage: npx tsx src/data/seed.ts <agency_id>");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Check if already seeded for this agency
  const { count } = await supabase
    .from("press_calendar_events")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId);

  if (count && count > 0) {
    console.log(`Calendar already has ${count} events for this agency. Skipping seed.`);
    return;
  }

  const events = calendarData.events.map((e) => ({
    ...e,
    agency_id: agencyId,
    is_custom: false,
  }));

  console.log(`Seeding ${events.length} calendar events for agency ${agencyId}...`);

  const { error } = await supabase
    .from("press_calendar_events")
    .insert(events);

  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }

  console.log("Calendar seeded successfully.");
}

seedCalendar();
