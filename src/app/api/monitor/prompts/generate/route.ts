import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generatePromptVariations } from "@/lib/monitor/prompt-generator";

// POST /api/monitor/prompts/generate — AI-powered prompt generation from a keyword
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, keywordId } = body as {
    clientId: string;
    keywordId: string;
  };

  if (!clientId || !keywordId) {
    return NextResponse.json(
      { error: "clientId and keywordId are required" },
      { status: 400 }
    );
  }

  // Load client and keyword
  const { data: client } = await supabase
    .from("clients")
    .select("name, brand_brief")
    .eq("id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: keyword } = await supabase
    .from("keywords")
    .select("keyword")
    .eq("id", keywordId)
    .eq("client_id", clientId)
    .single();

  if (!keyword) {
    return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
  }

  // Load competitors
  const { data: competitors } = await supabase
    .from("monitor_competitors")
    .select("competitor_name")
    .eq("client_id", clientId)
    .eq("is_active", true);

  const prompts = await generatePromptVariations({
    keyword: keyword.keyword as string,
    clientName: client.name as string,
    brandBrief: (client.brand_brief as string) || "",
    competitors: (competitors || []).map(
      (c: { competitor_name: string }) => c.competitor_name
    ),
  });

  return NextResponse.json({ prompts });
}
