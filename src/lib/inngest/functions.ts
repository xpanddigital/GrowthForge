import { createClient } from "@supabase/supabase-js";
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { agents } from "@/lib/agents/registry";
import type { DiscoveredThread } from "@/lib/agents/interfaces";
import { createHash } from "crypto";

// ---------------------------------------------------------------------------
// Supabase admin client for background jobs (no cookies/sessions needed)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateContentHash(title: string, url: string): string {
  const stripped = url.split("?")[0].toLowerCase();
  const normalized = `${title.toLowerCase().trim()}|${stripped}`;
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Calculate opportunity score from multiple signals.
 *
 * opportunity_score = (
 *   relevance_score * 0.35 +
 *   google_authority * 0.25 +
 *   recency_score * 0.20 +
 *   engagement_score * 0.20
 * )
 */
function calculateOpportunityScore(params: {
  relevanceScore: number;
  googlePosition: number | null;
  threadDate: string | null;
  commentCount: number;
}): number {
  const { relevanceScore, googlePosition, threadDate, commentCount } = params;

  // Google authority: inverse of position (1 = 100, 10 = 50, 50 = 10)
  let googleAuthority = 20; // default if no position
  if (googlePosition !== null && googlePosition > 0) {
    if (googlePosition <= 1) googleAuthority = 100;
    else if (googlePosition <= 3) googleAuthority = 90;
    else if (googlePosition <= 5) googleAuthority = 75;
    else if (googlePosition <= 10) googleAuthority = 50;
    else if (googlePosition <= 20) googleAuthority = 30;
    else if (googlePosition <= 50) googleAuthority = 10;
    else googleAuthority = 5;
  }

  // Recency: how old is the thread?
  let recencyScore = 10;
  if (threadDate) {
    const ageMs = Date.now() - new Date(threadDate).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays < 7) recencyScore = 100;
    else if (ageDays < 30) recencyScore = 80;
    else if (ageDays < 90) recencyScore = 50;
    else if (ageDays < 365) recencyScore = 30;
    else recencyScore = 10;
  }

  // Engagement: based on comment count
  let engagementScore = 20;
  if (commentCount >= 100) engagementScore = 100;
  else if (commentCount >= 20) engagementScore = 75;
  else if (commentCount >= 5) engagementScore = 50;
  else engagementScore = 20;

  const score = Math.round(
    relevanceScore * 0.35 +
      googleAuthority * 0.25 +
      recencyScore * 0.2 +
      engagementScore * 0.2
  );

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Agent action logger for background jobs (uses admin client, not SSR)
// ---------------------------------------------------------------------------

async function logAgentActionBg<T>(
  params: {
    agencyId: string;
    clientId?: string;
    agentType: string;
    agentName: string;
    trigger: string;
    triggerReferenceId?: string;
    targetType?: string;
    targetId?: string;
    inputSummary?: Record<string, unknown>;
  },
  fn: () => Promise<T>
): Promise<T> {
  const supabase = createAdminClient();
  const startTime = Date.now();

  const { data: action } = await supabase
    .from("agent_actions")
    .insert({
      agency_id: params.agencyId,
      client_id: params.clientId || null,
      agent_type: params.agentType,
      agent_name: params.agentName,
      trigger: params.trigger,
      trigger_reference_id: params.triggerReferenceId || null,
      target_type: params.targetType || null,
      target_id: params.targetId || null,
      status: "started",
      input_summary: params.inputSummary || {},
    })
    .select("id")
    .single();

  const actionId = action?.id;

  try {
    const result = await fn();

    if (actionId) {
      const outputSummary = Array.isArray(result)
        ? { count: result.length }
        : typeof result === "object" && result !== null
          ? { keys: Object.keys(result as Record<string, unknown>), type: "object" }
          : { type: typeof result };

      await supabase
        .from("agent_actions")
        .update({
          status: "completed",
          duration_ms: Date.now() - startTime,
          output_summary: outputSummary,
        })
        .eq("id", actionId);
    }

    return result;
  } catch (error) {
    if (actionId) {
      const err = error instanceof Error ? error : new Error(String(error));
      await supabase
        .from("agent_actions")
        .update({
          status: "failed",
          duration_ms: Date.now() - startTime,
          error_code: (error as { code?: string }).code || "UNKNOWN",
          error_message: err.message,
        })
        .eq("id", actionId);
    }
    throw error;
  }
}

// ===========================================================================
// FUNCTION: discovery/scan
// Full discovery pipeline: SERP + AI probe -> dedup -> insert threads
// ===========================================================================

const discoveryScan = inngest.createFunction(
  {
    id: "discovery-scan",
    name: "Discovery Scan",
    retries: 2,
    concurrency: [{ limit: 3 }],
  },
  { event: "discovery/scan" },
  async ({ event, step }) => {
    const { clientId, keywordIds, runId } = event.data;
    const supabase = createAdminClient();

    // -----------------------------------------------------------------------
    // Step 1: Load client and keywords
    // -----------------------------------------------------------------------
    const { agencyId, keywords } = await step.run(
      "load-client-and-keywords",
      async () => {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("*, agencies!inner(id)")
          .eq("id", clientId)
          .eq("is_active", true)
          .single();

        if (clientError || !clientData) {
          throw new NonRetriableError(
            `Client ${clientId} not found or inactive`
          );
        }

        const agencyRow = clientData.agencies as unknown as { id: string };

        // Get keywords — either specific IDs or all active for client
        let keywordQuery = supabase
          .from("keywords")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_active", true);

        if (keywordIds && keywordIds.length > 0) {
          keywordQuery = keywordQuery.in("id", keywordIds);
        }

        const { data: keywordData, error: keywordError } = await keywordQuery;

        if (keywordError) {
          throw new Error(`Failed to load keywords: ${keywordError.message}`);
        }

        if (!keywordData || keywordData.length === 0) {
          throw new NonRetriableError(
            `No active keywords found for client ${clientId}`
          );
        }

        return {
          agencyId: agencyRow.id,
          keywords: keywordData.map(
            (kw: { id: string; keyword: string; scan_platforms: string[] }) => ({
              id: kw.id,
              keyword: kw.keyword,
              platforms: kw.scan_platforms,
            })
          ),
        };
      }
    );

    // Update discovery run status to 'running'
    await step.run("update-run-status-running", async () => {
      await supabase
        .from("discovery_runs")
        .update({
          status: "running",
          items_total: keywords.length,
        })
        .eq("id", runId);
    });

    // -----------------------------------------------------------------------
    // Step 2 & 3: Run SERP scanner and AI prober in parallel
    // Both are wrapped in try/catch — if SERP fails, we still enrich
    // existing un-enriched threads. The pipeline never fully stops.
    // -----------------------------------------------------------------------
    let serpResults: DiscoveredThread[] = [];
    try {
      serpResults = await step.run("serp-scan", async () => {
        return logAgentActionBg(
          {
            agencyId,
            clientId,
            agentType: "discovery",
            agentName: agents.discovery.name,
            trigger: "inngest_job",
            triggerReferenceId: runId,
            inputSummary: { keywordCount: keywords.length },
          },
          () => agents.discovery.discover(clientId, keywords)
        );
      });
    } catch (serpError) {
      console.error("[discovery] SERP scan failed, will still try to enrich existing threads:", serpError);
    }

    // AI probing runs as a separate step (effectively parallel at Inngest level)
    let aiProbeResults: DiscoveredThread[] = [];
    try {
      aiProbeResults = await step.run("ai-probe", async () => {
        // Only probe top 20 keywords to stay within rate limits
        const topKeywords = keywords.slice(0, 20);
        return logAgentActionBg(
          {
            agencyId,
            clientId,
            agentType: "discovery",
            agentName: "aiProbe",
            trigger: "inngest_job",
            triggerReferenceId: runId,
            inputSummary: { keywordCount: topKeywords.length },
          },
          async () => {
            // aiProbe agent uses the same DiscoveryAgent interface
            if ("discover" in agents && "aiProbe" in agents) {
              const aiProbeAgent = (agents as Record<string, unknown>)["aiProbe"] as {
                discover: (
                  clientId: string,
                  keywords: Array<{ id: string; keyword: string; platforms: string[] }>
                ) => Promise<DiscoveredThread[]>;
              };
              return aiProbeAgent.discover(clientId, topKeywords);
            }
            return [];
          }
        );
      });
    } catch {
      // AI probing is supplementary — don't fail the whole pipeline
      console.warn("AI probing failed, continuing with SERP results only");
    }

    // Combine all discovered threads
    const allDiscovered = [...serpResults, ...aiProbeResults];

    // -----------------------------------------------------------------------
    // Step 4 & 5: Dedup and insert new threads
    // -----------------------------------------------------------------------
    const { insertedCount, skippedCount } = await step.run(
      "dedup-and-insert",
      async () => {
        if (allDiscovered.length === 0) {
          return { insertedCount: 0, skippedCount: 0, newThreadIds: [] as string[] };
        }

        // Get existing content hashes for this client
        const { data: existingThreads } = await supabase
          .from("threads")
          .select("content_hash")
          .eq("client_id", clientId);

        const existingHashes = new Set(
          (existingThreads || []).map(
            (t: { content_hash: string }) => t.content_hash
          )
        );

        // Dedup against existing threads
        const newThreads: Array<{
          client_id: string;
          keyword_id: string;
          platform: string;
          title: string;
          url: string;
          body_text: string | null;
          discovered_via: string;
          google_position: number | null;
          content_hash: string;
          status: string;
        }> = [];

        const seenHashes = new Set<string>();
        let skipped = 0;

        for (const thread of allDiscovered) {
          const hash = generateContentHash(thread.title, thread.url);

          if (existingHashes.has(hash) || seenHashes.has(hash)) {
            skipped++;
            continue;
          }

          seenHashes.add(hash);
          newThreads.push({
            client_id: clientId,
            keyword_id: thread.keywordId,
            platform: thread.platform,
            title: thread.title,
            url: thread.url,
            body_text: thread.snippet || null,
            discovered_via:
              aiProbeResults.includes(thread) ? "ai_probe_perplexity" : "serp",
            google_position: thread.position ?? null,
            content_hash: hash,
            status: "new",
          });
        }

        if (newThreads.length === 0) {
          return { insertedCount: 0, skippedCount: skipped, newThreadIds: [] as string[] };
        }

        // Insert in batches of 50 to avoid payload limits
        const batchSize = 50;
        const insertedIds: string[] = [];

        for (let i = 0; i < newThreads.length; i += batchSize) {
          const batch = newThreads.slice(i, i + batchSize);
          const { data: inserted, error } = await supabase
            .from("threads")
            .insert(batch)
            .select("id");

          if (error) {
            console.error(
              `Failed to insert thread batch ${i / batchSize + 1}:`,
              error.message
            );
            continue;
          }

          if (inserted) {
            insertedIds.push(
              ...inserted.map((t: { id: string }) => t.id)
            );
          }
        }

        return {
          insertedCount: insertedIds.length,
          skippedCount: skipped,
          newThreadIds: insertedIds,
        };
      }
    );

    // -----------------------------------------------------------------------
    // Step 6: Update discovery run with results
    // -----------------------------------------------------------------------
    await step.run("update-run-completed", async () => {
      await supabase
        .from("discovery_runs")
        .update({
          status: "completed",
          items_processed: allDiscovered.length,
          items_succeeded: insertedCount,
          items_failed: skippedCount,
          completed_at: new Date().toISOString(),
          metadata: {
            serp_results: serpResults.length,
            ai_probe_results: aiProbeResults.length,
            duplicates_skipped: skippedCount,
          },
        })
        .eq("id", runId);
    });

    // -----------------------------------------------------------------------
    // Step 7: Trigger enrichment — include both new threads AND any existing
    // un-enriched threads (e.g. from previous failed enrichment runs).
    // This ensures the pipeline recovers from partial failures.
    // -----------------------------------------------------------------------
    await step.run("trigger-enrichment", async () => {
      // Find ALL un-enriched threads for this client, not just new ones
      const { data: unenriched } = await supabase
        .from("threads")
        .select("id")
        .eq("client_id", clientId)
        .eq("is_enriched", false)
        .in("status", ["new", "enriching"]);

      const allThreadIds = (unenriched || []).map((t: { id: string }) => t.id);

      if (allThreadIds.length > 0) {
        await inngest.send({
          name: "discovery/enrich",
          data: {
            clientId,
            threadIds: allThreadIds,
            runId,
          },
        });
      }
    });

    return {
      status: "completed",
      discovered: allDiscovered.length,
      inserted: insertedCount,
      skipped: skippedCount,
    };
  }
);

// ===========================================================================
// FUNCTION: discovery/enrich
// Enrich threads with full content from platform-specific scrapers
// ===========================================================================

const discoveryEnrich = inngest.createFunction(
  {
    id: "discovery-enrich",
    name: "Discovery Enrich",
    retries: 2,
    concurrency: [{ limit: 5 }],
  },
  { event: "discovery/enrich" },
  async ({ event, step }) => {
    const { clientId, threadIds } = event.data;
    const supabase = createAdminClient();

    // -----------------------------------------------------------------------
    // Step 1: Load threads that need enrichment
    // -----------------------------------------------------------------------
    const { threads, agencyId } = await step.run(
      "load-threads",
      async () => {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("agency_id")
          .eq("id", clientId)
          .single();

        if (clientError || !clientData) {
          throw new NonRetriableError(
            `Client ${clientId} not found`
          );
        }

        const { data: threadData, error: threadError } = await supabase
          .from("threads")
          .select("*")
          .in("id", threadIds)
          .eq("client_id", clientId)
          .eq("is_enriched", false);

        if (threadError) {
          throw new Error(`Failed to load threads: ${threadError.message}`);
        }

        return {
          threads: threadData || [],
          agencyId: clientData.agency_id as string,
        };
      }
    );

    if (threads.length === 0) {
      return { status: "completed", enriched: 0, message: "No threads to enrich" };
    }

    // -----------------------------------------------------------------------
    // Step 2: Set threads to 'enriching' status
    // -----------------------------------------------------------------------
    await step.run("set-status-enriching", async () => {
      const ids = threads.map(
        (t: { id: string }) => t.id
      );
      await supabase
        .from("threads")
        .update({
          status: "enriching",
          status_changed_at: new Date().toISOString(),
          enrichment_error: null, // Clear old errors for retry
        })
        .in("id", ids);
    });

    // -----------------------------------------------------------------------
    // Step 3: Enrich each thread via the enrichment agent
    // -----------------------------------------------------------------------
    let enrichedCount = 0;
    let failedCount = 0;
    const enrichedThreadIds: string[] = [];

    // Process threads sequentially to respect rate limits
    for (const thread of threads) {
      const t = thread as {
        id: string;
        url: string;
        platform: string;
        title: string;
      };

      try {
        await step.run(`enrich-thread-${t.id}`, async () => {
          const enriched = await logAgentActionBg(
            {
              agencyId,
              clientId,
              agentType: "enrichment",
              agentName: agents.enrichment.name,
              trigger: "inngest_job",
              targetType: "thread",
              targetId: t.id,
              inputSummary: {
                url: t.url,
                platform: t.platform,
              },
            },
            () => agents.enrichment.enrich(t.url, t.platform)
          );

          // Update thread with enriched content
          await supabase
            .from("threads")
            .update({
              body_text: enriched.body_text,
              author: enriched.author,
              comment_count: enriched.comment_count,
              upvote_count: enriched.upvote_count,
              thread_date: enriched.thread_date,
              top_comments: enriched.top_comments,
              is_enriched: true,
              enriched_at: new Date().toISOString(),
              enrichment_error: null,
            })
            .eq("id", t.id);

          enrichedCount++;
          enrichedThreadIds.push(t.id);
        });
      } catch (error) {
        failedCount++;
        const err = error instanceof Error ? error : new Error(String(error));

        // Mark the specific thread with an enrichment error
        await step.run(`mark-enrich-error-${t.id}`, async () => {
          // Check if thread was deleted/locked
          const isExpired =
            err.message.includes("deleted") ||
            err.message.includes("locked") ||
            err.message.includes("404") ||
            err.message.includes("not found");

          await supabase
            .from("threads")
            .update({
              status: isExpired ? "expired" : "new",
              status_changed_at: new Date().toISOString(),
              enrichment_error: err.message,
            })
            .eq("id", t.id);
        });
      }
    }

    // -----------------------------------------------------------------------
    // Step 4: Trigger classification for enriched threads
    // -----------------------------------------------------------------------
    if (enrichedThreadIds.length > 0) {
      await step.run("trigger-classification", async () => {
        await inngest.send({
          name: "discovery/classify",
          data: {
            clientId,
            threadIds: enrichedThreadIds,
          },
        });
      });
    }

    return {
      status: "completed",
      enriched: enrichedCount,
      failed: failedCount,
      total: threads.length,
    };
  }
);

// ===========================================================================
// FUNCTION: discovery/classify
// Batch classify threads using AI and calculate opportunity scores
// ===========================================================================

const discoveryClassify = inngest.createFunction(
  {
    id: "discovery-classify",
    name: "Discovery Classify",
    retries: 2,
    concurrency: [{ limit: 3 }],
  },
  { event: "discovery/classify" },
  async ({ event, step }) => {
    const { clientId, threadIds } = event.data;
    const supabase = createAdminClient();

    // -----------------------------------------------------------------------
    // Step 1: Load client and enriched threads
    // -----------------------------------------------------------------------
    const { client, threads, agencyId } = await step.run(
      "load-data",
      async () => {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .single();

        if (clientError || !clientData) {
          throw new NonRetriableError(
            `Client ${clientId} not found`
          );
        }

        const { data: threadData, error: threadError } = await supabase
          .from("threads")
          .select("*")
          .in("id", threadIds)
          .eq("client_id", clientId)
          .eq("is_enriched", true);

        if (threadError) {
          throw new Error(
            `Failed to load threads: ${threadError.message}`
          );
        }

        return {
          client: clientData,
          threads: threadData || [],
          agencyId: clientData.agency_id as string,
        };
      }
    );

    if (threads.length === 0) {
      return {
        status: "completed",
        classified: 0,
        message: "No enriched threads to classify",
      };
    }

    // -----------------------------------------------------------------------
    // Step 2: Classify each thread via the classification agent
    // -----------------------------------------------------------------------
    let classifiedCount = 0;
    let queuedCount = 0;
    let skippedCount = 0;

    // Process in batches (the classification agent handles individual threads,
    // but we batch the step runs for efficiency)
    const batchSize = 10;

    for (let i = 0; i < threads.length; i += batchSize) {
      const batch = threads.slice(i, i + batchSize);

      await step.run(
        `classify-batch-${Math.floor(i / batchSize)}`,
        async () => {
          for (const thread of batch) {
            const t = thread as {
              id: string;
              title: string;
              body_text: string | null;
              platform: string;
              google_position: number | null;
              thread_date: string | null;
              comment_count: number;
            };

            try {
              const classification = await logAgentActionBg(
                {
                  agencyId,
                  clientId,
                  agentType: "classification",
                  agentName: agents.classification.name,
                  trigger: "inngest_job",
                  targetType: "thread",
                  targetId: t.id,
                },
                () =>
                  agents.classification.classify(
                    {
                      title: t.title,
                      body_text: t.body_text || "",
                      platform: t.platform,
                    },
                    (client as { brand_brief: string }).brand_brief
                  )
              );

              // Calculate opportunity score
              const opportunityScore = calculateOpportunityScore({
                relevanceScore: classification.relevance_score,
                googlePosition: t.google_position,
                threadDate: t.thread_date,
                commentCount: t.comment_count,
              });

              // Determine status based on opportunity score
              let newStatus: string;
              if (opportunityScore >= 70) {
                newStatus = "queued";
                queuedCount++;
              } else if (opportunityScore >= 40) {
                newStatus = "classified";
                classifiedCount++;
              } else {
                newStatus = "skipped";
                skippedCount++;
              }

              // Update thread with classification data
              await supabase
                .from("threads")
                .update({
                  intent: classification.intent,
                  relevance_score: classification.relevance_score,
                  opportunity_score: opportunityScore,
                  can_mention_brand: classification.can_mention_brand,
                  suggested_angle: classification.suggested_angle,
                  classification_tags: classification.tags,
                  status: newStatus,
                  status_changed_at: new Date().toISOString(),
                })
                .eq("id", t.id);
            } catch (error) {
              console.error(
                `Classification failed for thread ${t.id}:`,
                error instanceof Error ? error.message : error
              );
              // Leave thread in current status for manual review
            }
          }
        }
      );
    }

    return {
      status: "completed",
      total: threads.length,
      queued: queuedCount,
      classified: classifiedCount,
      skipped: skippedCount,
    };
  }
);

// ===========================================================================
// FUNCTION: responses/generate
// Generate 3 response variants for a single thread using Claude Opus
// ===========================================================================

const responsesGenerate = inngest.createFunction(
  {
    id: "responses-generate",
    name: "Response Generation",
    retries: 1,
    concurrency: [{ limit: 5 }],
  },
  { event: "responses/generate" },
  async ({ event, step }) => {
    const { threadId } = event.data;
    const supabase = createAdminClient();

    // -----------------------------------------------------------------------
    // Step 1: Set thread status to 'generating'
    // -----------------------------------------------------------------------
    const { thread, client, agencyId } = await step.run(
      "load-and-set-generating",
      async () => {
        // Fetch thread with its client data
        const { data: threadData, error: threadError } = await supabase
          .from("threads")
          .select("*, clients!inner(*)")
          .eq("id", threadId)
          .single();

        if (threadError || !threadData) {
          throw new NonRetriableError(
            `Thread ${threadId} not found`
          );
        }

        const clientData = threadData.clients as Record<string, unknown>;
        const agencyIdValue = clientData.agency_id as string;

        // Set thread status to 'generating'
        await supabase
          .from("threads")
          .update({
            status: "generating",
            status_changed_at: new Date().toISOString(),
          })
          .eq("id", threadId);

        // Strip joined client data from thread for clean separation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { clients: _clients, ...cleanThread } = threadData;

        return {
          thread: cleanThread,
          client: clientData,
          agencyId: agencyIdValue,
        };
      }
    );

    // -----------------------------------------------------------------------
    // Step 2: Generate 3 response variants via Claude Opus
    // -----------------------------------------------------------------------
    const variants = await step.run("generate-responses", async () => {
      return logAgentActionBg(
        {
          agencyId,
          clientId: client.id as string,
          agentType: "response",
          agentName: agents.response.name,
          trigger: "inngest_job",
          targetType: "thread",
          targetId: threadId,
          inputSummary: {
            platform: thread.platform,
            title: thread.title,
          },
        },
        () => agents.response.generate(thread, client)
      );
    });

    // -----------------------------------------------------------------------
    // Step 3: Insert response variants into the database
    // -----------------------------------------------------------------------
    await step.run("insert-responses", async () => {
      const responseRows = variants.map(
        (v: {
          variant: string;
          body_text: string;
          quality_score: number;
          tone_match_score: number;
          mentions_brand: boolean;
          mentions_url: boolean;
        }) => ({
          thread_id: threadId,
          client_id: client.id as string,
          variant: v.variant,
          body_text: v.body_text,
          quality_score: v.quality_score,
          tone_match_score: v.tone_match_score,
          mentions_brand: v.mentions_brand,
          mentions_url: v.mentions_url,
          status: "draft",
        })
      );

      const { error } = await supabase
        .from("responses")
        .insert(responseRows);

      if (error) {
        throw new Error(`Failed to insert responses: ${error.message}`);
      }
    });

    // -----------------------------------------------------------------------
    // Step 4: Set thread status to 'responded'
    // -----------------------------------------------------------------------
    await step.run("set-status-responded", async () => {
      await supabase
        .from("threads")
        .update({
          status: "responded",
          status_changed_at: new Date().toISOString(),
        })
        .eq("id", threadId);
    });

    return {
      status: "completed",
      threadId,
      variants: variants.length,
    };
  }
);

// ===========================================================================
// Export all functions for the Inngest handler
// ===========================================================================

import { monitorFunctions } from "./monitor-functions";
import { auditFunctions } from "./audit-functions";
import { entityFunctions } from "./entity-functions";
import { reviewFunctions } from "./review-functions";
import { pressFunctions } from "./press-functions";

export const functions = [
  discoveryScan,
  discoveryEnrich,
  discoveryClassify,
  responsesGenerate,
  ...monitorFunctions,
  ...auditFunctions,
  ...entityFunctions,
  ...reviewFunctions,
  ...pressFunctions,
];
