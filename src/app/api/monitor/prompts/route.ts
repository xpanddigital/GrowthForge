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

// GET /api/monitor/prompts — list all prompts (custom + keyword-generated) for a client
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

  // 1. Load custom prompts from monitor_prompts table
  const { data: customPrompts } = await supabase
    .from("monitor_prompts")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  const formattedCustom = (customPrompts || []).map((p) => ({
    id: p.id as string,
    prompt_text: p.prompt_text as string,
    source: "manual",
    keyword: undefined as string | undefined,
    test_models: (p.test_models as string[]) || [],
    is_active: p.is_active as boolean,
    last_used_at: null as string | null,
    times_used: 0,
    last_brand_mentioned: null as boolean | null,
  }));

  // 2. Load AI-generated prompts from monitor_keyword_config
  const { data: keywordConfigs } = await supabase
    .from("monitor_keyword_config")
    .select("*, keywords!inner(keyword)")
    .eq("client_id", clientId)
    .eq("is_monitored", true);

  const formattedGenerated: typeof formattedCustom = [];
  for (const config of keywordConfigs || []) {
    const kw = config.keywords as { keyword: string };
    const generatedPrompts = (config.generated_prompts as Array<{ text?: string; prompt?: string; prompt_text?: string; type?: string }>) || [];
    const testModels = (config.test_models as string[]) || [];

    for (let i = 0; i < generatedPrompts.length; i++) {
      const gp = generatedPrompts[i];
      const promptText = gp.text || gp.prompt || gp.prompt_text || "";
      if (!promptText) continue;

      formattedGenerated.push({
        id: `${config.id}-${i}`,
        prompt_text: promptText,
        source: "ai_generated",
        keyword: kw.keyword,
        test_models: testModels,
        is_active: true,
        last_used_at: config.prompts_last_generated_at as string | null,
        times_used: 0,
        last_brand_mentioned: null,
      });
    }
  }

  // Combine: AI-generated first, then custom
  const allPrompts = [...formattedGenerated, ...formattedCustom];

  return NextResponse.json({ prompts: allPrompts });
}
