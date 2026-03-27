import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/reviews/campaigns — list campaigns
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

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("review_campaigns")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data });
}

// POST /api/reviews/campaigns — create campaign
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    clientId,
    name,
    description,
    targetPlatform,
    targetUrl,
    targetCount,
    method,
    subjectLine,
    messageTemplate,
  } = body as {
    clientId: string;
    name: string;
    description?: string;
    targetPlatform: string;
    targetUrl: string;
    targetCount?: number;
    method?: string;
    subjectLine?: string;
    messageTemplate: string;
  };

  if (!clientId || !name || !targetPlatform || !targetUrl || !messageTemplate) {
    return NextResponse.json(
      { error: "clientId, name, targetPlatform, targetUrl, and messageTemplate are required" },
      { status: 400 }
    );
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("review_campaigns")
    .insert({
      client_id: clientId,
      name,
      description: description || null,
      target_platform: targetPlatform,
      target_url: targetUrl,
      target_count: targetCount || null,
      method: method || "email",
      subject_line: subjectLine || null,
      message_template: messageTemplate,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaign: data }, { status: 201 });
}
