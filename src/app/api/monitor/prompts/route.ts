import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// POST /api/monitor/prompts — create custom prompt
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, promptText, testModels, frequency } = body as {
    clientId: string;
    promptText: string;
    testModels?: string[];
    frequency?: string;
  };

  if (!clientId || !promptText) {
    return NextResponse.json(
      { error: "clientId and promptText are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("monitor_prompts")
    .insert({
      client_id: clientId,
      prompt_text: promptText,
      test_models: testModels || [
        "chatgpt",
        "perplexity",
        "gemini",
        "claude",
        "google_ai_overview",
      ],
      frequency: frequency || "weekly",
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prompt: data }, { status: 201 });
}

// GET /api/monitor/prompts — list custom prompts for a client
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
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("monitor_prompts")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prompts: data });
}
