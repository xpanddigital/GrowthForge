import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createCalendarEventSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/press/calendar — List calendar events
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("agency_id")
      .eq("id", authUser.user.id)
      .single();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const region = searchParams.get("region");
    const industry = searchParams.get("industry");

    let query = supabase
      .from("press_calendar_events")
      .select("*")
      .or(`agency_id.eq.${user.agency_id},agency_id.is.null`)
      .order("month")
      .order("event_date", { nullsFirst: false });

    if (month) query = query.eq("month", parseInt(month));
    if (region) query = query.contains("regions", [region]);
    if (industry) query = query.contains("industries", [industry]);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/press/calendar — Add a custom calendar event
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("agency_id")
      .eq("id", authUser.user.id)
      .single();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const validated = createCalendarEventSchema.parse(body);

    const { data, error } = await supabase
      .from("press_calendar_events")
      .insert({
        agency_id: user.agency_id as string,
        ...validated,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
