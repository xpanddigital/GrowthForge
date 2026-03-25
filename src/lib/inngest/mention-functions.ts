// Inngest functions for Mention Gap Analysis.
// Runs platform scanners in parallel, then analyzes gaps.

import { createClient } from "@supabase/supabase-js";
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { agents } from "@/lib/agents/registry";
import { analyzeMentionGaps } from "@/lib/mentions/gap-analyzer";
import { logAgentAction } from "@/lib/agents/logger";
import type { MentionScanResult } from "@/lib/agents/interfaces";

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

const mentionScan = inngest.createFunction(
  {
    id: "mentions-scan",
    name: "Run Mention Gap Scan",
    retries: 1,
  },
  { event: "mentions/scan" },
  async ({ event }) => {
    const { clientId, agencyId } = event.data;
    const supabase = createAdminClient();

    // Load client data
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, website_url")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      throw new NonRetriableError(`Client ${clientId} not found`);
    }

    // Load keywords
    const { data: keywords } = await supabase
      .from("keywords")
      .select("keyword")
      .eq("client_id", clientId)
      .eq("is_active", true)
      .limit(20);

    const keywordList = (keywords || []).map((k) => k.keyword);

    // Load competitors from monitor_competitors
    const { data: competitors } = await supabase
      .from("monitor_competitors")
      .select("name")
      .eq("client_id", clientId)
      .limit(5);

    const competitorNames = (competitors || []).map((c) => c.name);

    // Run all platform scanners in parallel with logging
    const scannerEntries = Object.entries(agents.mentions) as Array<
      [string, (typeof agents.mentions)[keyof typeof agents.mentions]]
    >;

    const scanPromises = scannerEntries.map(([key, scanner]) =>
      logAgentAction(
        {
          agencyId,
          clientId,
          agentType: "mention_scan",
          agentName: scanner.name,
          trigger: "manual",
          targetType: "client",
          targetId: clientId,
          inputSummary: {
            platform: scanner.platform,
            keywordCount: keywordList.length,
            competitorCount: competitorNames.length,
          },
        },
        () =>
          scanner.scan(
            client.name,
            client.website_url || "",
            keywordList,
            competitorNames
          )
      ).catch((err): MentionScanResult => {
        console.error(`[Mentions] ${key} scanner failed:`, err);
        return {
          platform: scanner.platform,
          sources: [],
          profileExists: false,
          profileUrl: null,
        };
      })
    );

    const scanResults = await Promise.all(scanPromises);

    // Store mention sources in DB
    const sourceRows = scanResults.flatMap((scan) =>
      scan.sources.map((source) => ({
        client_id: clientId,
        platform: scan.platform,
        source_url: source.url,
        source_title: source.title,
        mention_type: source.mentionType,
        mentioned_entity: source.mentionedEntity,
        context_snippet: source.contextSnippet,
        discovery_method: "serp",
        authority_estimate: source.authorityEstimate,
      }))
    );

    if (sourceRows.length > 0) {
      await supabase.from("mention_sources").insert(sourceRows);
    }

    // Run gap analysis
    const analysis = await analyzeMentionGaps(
      client.name,
      scanResults,
      competitorNames
    );

    // Store gaps in DB
    const gapRows = analysis.gaps.map((gap) => ({
      client_id: clientId,
      platform: gap.platform,
      gap_type: gap.gapType,
      competitor_name: gap.competitorName,
      opportunity_url: gap.opportunityUrl,
      opportunity_title: gap.opportunityTitle,
      recommended_action: gap.recommendedAction,
      action_module: gap.actionModule,
      impact: gap.impact,
      effort: gap.effort,
      opportunity_score: gap.opportunityScore,
      status: "open",
    }));

    if (gapRows.length > 0) {
      await supabase.from("mention_gaps").insert(gapRows);
    }

    return {
      status: "completed",
      totalSources: sourceRows.length,
      totalGaps: gapRows.length,
      coverageScore: analysis.coverageScore,
    };
  }
);

export const mentionFunctions = [mentionScan];
