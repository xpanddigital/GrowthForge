// Inngest functions for Journalist Query Matching.

import { createClient } from "@supabase/supabase-js";
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { scanJournalistQueries } from "@/lib/mentions/journalist-query-matcher";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new NonRetriableError("Missing Supabase environment variables");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const journalistQueryScan = inngest.createFunction(
  {
    id: "journalist-queries-scan",
    name: "Scan Journalist Queries",
    retries: 1,
  },
  { event: "journalist-queries/scan" },
  async ({ event }) => {
    const { clientId } = event.data;
    const supabase = createAdminClient();

    // Load client
    const { data: client } = await supabase
      .from("clients")
      .select("id, name, brand_brief")
      .eq("id", clientId)
      .single();

    if (!client) {
      throw new NonRetriableError(`Client ${clientId} not found`);
    }

    // Load keywords
    const { data: keywords } = await supabase
      .from("keywords")
      .select("keyword")
      .eq("client_id", clientId)
      .eq("is_active", true)
      .limit(10);

    // Load primary spokesperson
    const { data: spokesperson } = await supabase
      .from("spokespersons")
      .select("name, title, voice_profile")
      .eq("client_id", clientId)
      .eq("is_primary", true)
      .single();

    const result = await scanJournalistQueries(
      client.name,
      client.brand_brief,
      spokesperson?.name || null,
      spokesperson?.title || null,
      spokesperson?.voice_profile || null,
      (keywords || []).map((k) => k.keyword)
    );

    // Store matched queries
    const queryRows = result.matchedQueries
      .filter((m) => m.relevanceScore >= 40)
      .map((m) => ({
        client_id: clientId,
        query_text: m.query.queryText,
        source: m.query.source,
        journalist_name: m.query.journalistName,
        publication: m.query.publication,
        deadline: m.query.deadline,
        relevance_score: m.relevanceScore,
        match_reason: m.matchReason,
        draft_response: m.draftResponse,
        status: m.relevanceScore >= 70 ? "drafted" : "matched",
      }));

    if (queryRows.length > 0) {
      await supabase.from("journalist_queries").insert(queryRows);
    }

    return {
      status: "completed",
      totalQueries: result.totalQueries,
      matched: queryRows.length,
      highRelevance: result.highRelevanceCount,
    };
  }
);

export const journalistQueryFunctions = [journalistQueryScan];
