import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/monitor/keywords — list keyword monitoring configs with SoM data
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

  // Load keyword configs joined with keywords
  const { data: configs, error } = await supabase
    .from("monitor_keyword_config")
    .select("*, keywords!inner(id, keyword, tags, is_active)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // For each keyword config, calculate SoM from recent results
  const keywordRows = await Promise.all(
    (configs || []).map(async (config) => {
      const kw = config.keywords as {
        id: string;
        keyword: string;
        tags: string[];
        is_active: boolean;
      };
      const generatedPrompts = (config.generated_prompts as Array<Record<string, unknown>>) || [];

      // Get recent results for this keyword (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: results } = await supabase
        .from("monitor_results")
        .select("brand_mentioned, tested_at")
        .eq("client_id", clientId)
        .eq("keyword_id", kw.id)
        .gte("tested_at", thirtyDaysAgo.toISOString())
        .order("tested_at", { ascending: false });

      const totalTests = results?.length || 0;
      const mentions = results?.filter((r) => r.brand_mentioned).length || 0;
      const som = totalTests > 0 ? Math.round((mentions / totalTests) * 100) : null;

      // Get the most recent test date
      const lastTestedAt = results && results.length > 0
        ? (results[0].tested_at as string)
        : null;

      return {
        id: config.id,
        keyword_id: kw.id,
        keyword: kw.keyword,
        is_monitored: config.is_monitored,
        prompts_generated: generatedPrompts.length,
        last_tested_at: lastTestedAt,
        som,
        test_models: config.test_models,
        location_country: config.location_country,
        location_string: config.location_string,
        frequency: config.frequency,
      };
    })
  );

  return NextResponse.json({ keywords: keywordRows });
}
