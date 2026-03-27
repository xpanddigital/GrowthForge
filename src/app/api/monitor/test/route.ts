import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { agents } from "@/lib/agents/registry";
import type { MonitorTestInput } from "@/lib/agents/interfaces";

export const dynamic = "force-dynamic";

const VALID_MODELS = [
  "chatgpt",
  "perplexity",
  "gemini",
  "claude",
  "google_ai_overview",
] as const;

type ValidModel = (typeof VALID_MODELS)[number];

// POST /api/monitor/test — run a single prompt against a single model (synchronous)
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, promptText, model } = body as {
    clientId: string;
    promptText: string;
    model: string;
  };

  if (!clientId || !promptText || !model) {
    return NextResponse.json(
      { error: "clientId, promptText, and model are required" },
      { status: 400 }
    );
  }

  if (!VALID_MODELS.includes(model as ValidModel)) {
    return NextResponse.json(
      {
        error: `Invalid model. Must be one of: ${VALID_MODELS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Load client data
  const serviceClient = await createServiceRoleClient();
  const { data: client, error: clientErr } = await serviceClient
    .from("clients")
    .select("id, name, urls_to_mention, brand_brief")
    .eq("id", clientId)
    .single();

  if (clientErr || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Load competitors for this client
  const { data: competitors } = await serviceClient
    .from("monitor_competitors")
    .select("name, aliases, url")
    .eq("client_id", clientId);

  const competitorList = (competitors || []).map((c) => ({
    name: c.name as string,
    aliases: (c.aliases as string[]) || [],
    url: c.url as string | undefined,
  }));

  // Build test input
  const testInput: MonitorTestInput = {
    promptText,
    clientName: client.name as string,
    clientAliases: [],
    clientUrls: (client.urls_to_mention as string[]) || [],
    competitors: competitorList,
  };

  // Get the agent
  const agentKey = model as ValidModel;
  const agent = agents.monitor[agentKey];
  if (!agent || !("test" in agent)) {
    return NextResponse.json(
      { error: `Agent not available for model: ${model}` },
      { status: 500 }
    );
  }

  // Run the test synchronously
  try {
    const startTime = Date.now();
    const result = await agent.test(testInput);
    const durationMs = Date.now() - startTime;

    // Save the result to monitor_results so it's visible in the dashboard
    await serviceClient.from("monitor_results").insert({
      client_id: clientId,
      ai_model: model,
      brand_mentioned: result.brandMentioned,
      brand_linked: result.brandLinked,
      brand_recommended: result.brandRecommended,
      brand_source_urls: result.brandSourceUrls,
      mention_context: result.mentionContext,
      mention_position: result.mentionPosition,
      competitor_mentions: result.competitorDetails
        .filter((c) => c.mentioned)
        .map((c) => c.name),
      competitor_details: result.competitorDetails,
      sources_cited: result.sourcesCited,
      full_response: result.fullResponse,
      response_hash: result.responseHash,
      sentiment: result.sentiment,
      prominence_score: result.prominenceScore,
      tested_at: new Date().toISOString(),
    });

    return NextResponse.json({
      result: {
        model: result.aiModel,
        brandMentioned: result.brandMentioned,
        brandRecommended: result.brandRecommended,
        brandLinked: result.brandLinked,
        prominenceScore: result.prominenceScore,
        sentiment: result.sentiment,
        mentionContext: result.mentionContext,
        competitorsMentioned: result.competitorDetails
          .filter((c) => c.mentioned)
          .map((c) => c.name),
        sourcesCited: result.sourcesCited,
        fullResponse: result.fullResponse,
      },
      durationMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[monitor/test] Test failed for ${model}:`, message);
    return NextResponse.json(
      { error: "Test failed", details: message },
      { status: 500 }
    );
  }
}

// Increase timeout for this route since AI API calls can take 30+ seconds
export const maxDuration = 60;
