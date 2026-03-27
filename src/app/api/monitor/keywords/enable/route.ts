import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generatePromptVariations } from "@/lib/monitor/prompt-generator";

export const dynamic = "force-dynamic";

// POST /api/monitor/keywords/enable — enable keyword monitoring + generate prompt variations
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, keywordIds } = body as {
    clientId: string;
    keywordIds: string[];
  };

  if (!clientId || !keywordIds || keywordIds.length === 0) {
    return NextResponse.json(
      { error: "clientId and keywordIds are required" },
      { status: 400 }
    );
  }

  // Load client for context
  const { data: client } = await supabase
    .from("clients")
    .select("name, brand_brief")
    .eq("id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Load competitors for prompt generation
  const { data: competitors } = await supabase
    .from("monitor_competitors")
    .select("competitor_name")
    .eq("client_id", clientId)
    .eq("is_active", true);

  // Load keywords
  const { data: keywords } = await supabase
    .from("keywords")
    .select("id, keyword")
    .in("id", keywordIds)
    .eq("client_id", clientId);

  if (!keywords || keywords.length === 0) {
    return NextResponse.json(
      { error: "No valid keywords found" },
      { status: 400 }
    );
  }

  const results: Array<{ keywordId: string; keyword: string; promptCount: number }> = [];

  for (const kw of keywords) {
    // Check if config already exists
    const { data: existing } = await supabase
      .from("monitor_keyword_config")
      .select("id")
      .eq("client_id", clientId)
      .eq("keyword_id", kw.id)
      .single();

    // Generate prompt variations
    const prompts = await generatePromptVariations({
      keyword: kw.keyword as string,
      clientName: client.name as string,
      brandBrief: (client.brand_brief as string) || "",
      competitors: (competitors || []).map(
        (c: { competitor_name: string }) => c.competitor_name
      ),
    });

    if (existing) {
      // Update existing config
      await supabase
        .from("monitor_keyword_config")
        .update({
          is_monitored: true,
          generated_prompts: prompts,
          prompts_last_generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Create new config
      await supabase.from("monitor_keyword_config").insert({
        client_id: clientId,
        keyword_id: kw.id,
        is_monitored: true,
        generated_prompts: prompts,
        prompts_last_generated_at: new Date().toISOString(),
      });
    }

    results.push({
      keywordId: kw.id as string,
      keyword: kw.keyword as string,
      promptCount: prompts.length,
    });
  }

  return NextResponse.json({
    status: "enabled",
    keywords: results,
    totalPrompts: results.reduce((sum, r) => sum + r.promptCount, 0),
  });
}
