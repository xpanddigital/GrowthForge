import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/monitor/alerts — get alert events
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const acknowledged = searchParams.get("acknowledged");
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  let query = supabase
    .from("monitor_alert_events")
    .select("*, monitor_alerts!inner(*)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (acknowledged !== null && acknowledged !== undefined) {
    query = query.eq("acknowledged", acknowledged === "true");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alertEvents: data });
}

// POST /api/monitor/alerts — create alert rule
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, alertType, threshold, notifyEmail } = body as {
    clientId: string;
    alertType: string;
    threshold?: number;
    notifyEmail?: boolean;
  };

  if (!clientId || !alertType) {
    return NextResponse.json(
      { error: "clientId and alertType are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("monitor_alerts")
    .insert({
      client_id: clientId,
      alert_type: alertType,
      threshold: threshold || null,
      notify_email: notifyEmail !== false,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alert: data }, { status: 201 });
}
