// Inngest functions for Technical GEO scans.
// Delegates to the TechnicalGeoScanAgent which orchestrates all sub-scans.

import { createClient } from "@supabase/supabase-js";
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { agents } from "@/lib/agents/registry";
import { logAgentAction } from "@/lib/agents/logger";

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

const technicalGeoScan = inngest.createFunction(
  {
    id: "technical-geo-scan",
    name: "Run Technical GEO Scan",
    retries: 1,
  },
  { event: "technical-geo/scan" },
  async ({ event }) => {
    const { scanId, clientId, agencyId, scanType } = event.data;
    const supabase = createAdminClient();

    // Mark scan as running
    await supabase
      .from("technical_geo_scans")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", scanId);

    try {
      // Load client data
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id, name, website_url")
        .eq("id", clientId)
        .single();

      if (clientError || !client?.website_url) {
        throw new NonRetriableError(
          `Client ${clientId} not found or missing website URL`
        );
      }

      // Load AI citation data from monitor results for cross-referencing
      const { data: monitorResults } = await supabase
        .from("monitor_results")
        .select("sources_cited, ai_model")
        .eq("client_id", clientId)
        .not("sources_cited", "is", null)
        .order("tested_at", { ascending: false })
        .limit(100);

      // Build AI citation map: URL → model names
      const aiCitations: Record<string, string[]> = {};
      if (monitorResults) {
        for (const result of monitorResults) {
          if (result.sources_cited) {
            for (const url of result.sources_cited) {
              if (!aiCitations[url]) {
                aiCitations[url] = [];
              }
              if (!aiCitations[url].includes(result.ai_model)) {
                aiCitations[url].push(result.ai_model);
              }
            }
          }
        }
      }

      // Run the scan via agent with logging
      const scanResult = await logAgentAction(
        {
          agencyId,
          clientId,
          agentType: "technical_geo",
          agentName: agents.technicalGeo.name,
          trigger: "manual",
          triggerReferenceId: scanId,
          targetType: "client",
          targetId: clientId,
          inputSummary: { scanType, websiteUrl: client.website_url },
        },
        () =>
          agents.technicalGeo.scan(
            client.website_url,
            scanType,
            aiCitations
          )
      );

      // Store freshness data
      if (scanResult.freshnessResult) {
        const freshnessRows = scanResult.freshnessResult.pages.map((page) => ({
          client_id: clientId,
          scan_id: scanId,
          page_url: page.url,
          page_title: page.title,
          last_modified_header: page.lastModifiedHeader,
          content_date_detected: page.contentDateDetected,
          days_since_update: page.daysSinceUpdate,
          freshness_category: page.category,
          is_cited_by_ai: page.isCitedByAi,
          cited_by_models: page.citedByModels,
          citation_at_risk: page.citationAtRisk,
          refresh_brief: page.refreshBrief,
          refresh_priority: page.refreshPriority,
        }));

        if (freshnessRows.length > 0) {
          await supabase.from("content_freshness").insert(freshnessRows);
        }
      }

      // Update scan record with results
      await supabase
        .from("technical_geo_scans")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          robots_score: scanResult.robotsResult?.score ?? null,
          freshness_score: scanResult.freshnessResult?.overallScore ?? null,
          citability_score:
            scanResult.citabilityResult?.compositeScore ?? null,
          schema_ssr_score: scanResult.schemaSSRResult?.score ?? null,
          composite_score: scanResult.compositeScore,
          findings: {
            robots: scanResult.robotsResult,
            freshness: scanResult.freshnessResult
              ? {
                  summary: scanResult.freshnessResult.summary,
                  overallScore: scanResult.freshnessResult.overallScore,
                }
              : null,
            citability: scanResult.citabilityResult
              ? {
                  compositeScore: scanResult.citabilityResult.compositeScore,
                  dimensions: scanResult.citabilityResult.dimensions,
                  highlights: scanResult.citabilityResult.highlights,
                }
              : null,
            schemaSSR: scanResult.schemaSSRResult,
          },
          recommendations: scanResult.recommendations,
        })
        .eq("id", scanId);

      return { status: "completed", scanId, score: scanResult.compositeScore };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      await supabase
        .from("technical_geo_scans")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: message,
        })
        .eq("id", scanId);

      throw error;
    }
  }
);

export const technicalGeoFunctions = [technicalGeoScan];
