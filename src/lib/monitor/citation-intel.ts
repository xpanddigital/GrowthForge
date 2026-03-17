// Citation Engine Integration — when the Monitor detects competitors cited from
// specific Reddit/Quora/Facebook threads, auto-create thread records for the Citation Engine.
//
// This bridges the Monitor's findings back into actionable Citation Engine work:
// "Competitor X is getting cited from this Reddit thread — we should be there too."

import { createAdminClient } from "@/lib/inngest/admin-client";
import { createHash } from "crypto";

const FORUM_PATTERNS = [
  { pattern: /reddit\.com\/r\/[\w]+\/comments/i, platform: "reddit" as const },
  { pattern: /quora\.com\/[\w-]+/i, platform: "quora" as const },
  {
    pattern: /facebook\.com\/groups\//i,
    platform: "facebook_groups" as const,
  },
];

function detectForumUrl(
  url: string
): { platform: "reddit" | "quora" | "facebook_groups"; url: string } | null {
  for (const { pattern, platform } of FORUM_PATTERNS) {
    if (pattern.test(url)) {
      return { platform, url };
    }
  }
  return null;
}

function generateContentHash(title: string, url: string): string {
  const stripped = url.split("?")[0].toLowerCase();
  const normalized = `${title.toLowerCase().trim()}|${stripped}`;
  return createHash("sha256").update(normalized).digest("hex");
}

interface MonitorResult {
  brandMentioned: boolean;
  competitorDetails: Array<{ name: string; mentioned: boolean }>;
  sourcesCited: string[];
  promptText: string;
}

/**
 * Process monitor results to find forum threads where competitors are cited
 * but our client is not. Create or re-queue these as Citation Engine opportunities.
 */
export async function processMonitorIntel(
  clientId: string,
  results: MonitorResult[]
): Promise<{ threadsCreated: number; threadsRequeued: number }> {
  const supabase = createAdminClient();
  let threadsCreated = 0;
  let threadsRequeued = 0;

  // Collect all forum URLs from results where brand is NOT mentioned but competitor IS
  const forumOpportunities: Array<{
    url: string;
    platform: "reddit" | "quora" | "facebook_groups";
    prompt: string;
  }> = [];

  for (const result of results) {
    if (result.brandMentioned) continue; // Skip if brand already mentioned
    const hasCompetitorMention = result.competitorDetails.some(
      (c) => c.mentioned
    );
    if (!hasCompetitorMention) continue; // Skip if no competitor mentioned either

    for (const url of result.sourcesCited) {
      const forum = detectForumUrl(url);
      if (forum) {
        forumOpportunities.push({
          ...forum,
          prompt: result.promptText,
        });
      }
    }
  }

  if (forumOpportunities.length === 0) {
    return { threadsCreated: 0, threadsRequeued: 0 };
  }

  // Deduplicate by URL
  const uniqueUrls = new Map<
    string,
    {
      url: string;
      platform: "reddit" | "quora" | "facebook_groups";
      prompt: string;
    }
  >();
  for (const opp of forumOpportunities) {
    const key = opp.url.split("?")[0].toLowerCase();
    if (!uniqueUrls.has(key)) {
      uniqueUrls.set(key, opp);
    }
  }

  for (const opp of Array.from(uniqueUrls.values())) {
    // Generate hash for the URL (use URL as title placeholder since we don't know the thread title yet)
    const contentHash = generateContentHash(opp.url, opp.url);

    // Check if thread already exists
    const { data: existing } = await supabase
      .from("threads")
      .select("id, status")
      .eq("client_id", clientId)
      .eq("content_hash", contentHash)
      .single();

    if (existing) {
      // If thread was previously skipped, re-queue it (now confirmed as AI-cited)
      if (existing.status === "skipped") {
        await supabase
          .from("threads")
          .update({
            status: "new",
            status_changed_at: new Date().toISOString(),
            discovered_via: "monitor_intel",
            ai_query: opp.prompt,
          })
          .eq("id", existing.id);
        threadsRequeued++;
      }
      // Otherwise, thread exists in another state — don't touch it
    } else {
      // Create new thread record for Citation Engine
      const { error } = await supabase.from("threads").insert({
        client_id: clientId,
        platform: opp.platform,
        title: opp.url, // Placeholder — will be enriched later
        url: opp.url,
        discovered_via: "monitor_intel",
        ai_query: opp.prompt,
        content_hash: contentHash,
        status: "new",
      });

      if (!error) {
        threadsCreated++;
      }
    }
  }

  return { threadsCreated, threadsRequeued };
}
