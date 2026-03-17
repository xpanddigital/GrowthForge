import { createAdminClient } from "@/lib/inngest/admin-client";
import { logAgentActionBg } from "@/lib/inngest/admin-client";
import { agents } from "@/lib/agents/registry";
import { getPlatformsForVertical, getQuickScanPlatforms } from "@/lib/entity/platform-config";
import type { EntityCanonical, EntityProfileData, EntityConsistencyResult, EntitySchemaAuditResult } from "@/lib/agents/interfaces";
import type { Vertical } from "@/lib/entity/platform-config";

interface ScanOptions {
  clientId: string;
  agencyId: string;
  scanId: string;
  scanType: 'full' | 'quick' | 'single' | 'schema_only';
  singlePlatform?: string;
}

export async function runEntityScan(options: ScanOptions): Promise<void> {
  const { clientId, agencyId, scanId, scanType, singlePlatform } = options;
  const supabase = createAdminClient();

  // Step 0: Load client + canonical (MUST be approved)
  const { data: client } = await supabase
    .from("clients")
    .select("*, entity_canonical!inner(*)")
    .eq("id", clientId)
    .eq("entity_canonical.status", "approved")
    .order("version", { referencedTable: "entity_canonical", ascending: false })
    .limit(1, { referencedTable: "entity_canonical" })
    .single();

  if (!client) throw new Error("Client not found or no approved canonical");

  const canonicalRow = (client.entity_canonical as unknown[])[0] as Record<string, unknown>;
  const canonical: EntityCanonical = {
    id: canonicalRow.id as string,
    clientId: canonicalRow.client_id as string,
    canonicalName: canonicalRow.canonical_name as string,
    canonicalDescription: canonicalRow.canonical_description as string,
    canonicalTagline: canonicalRow.canonical_tagline as string | null,
    canonicalCategory: canonicalRow.canonical_category as string,
    canonicalSubcategories: (canonicalRow.canonical_subcategories as string[]) || [],
    canonicalContact: (canonicalRow.canonical_contact as Record<string, unknown>) || {},
    canonicalUrls: (canonicalRow.canonical_urls as Record<string, unknown>) || {},
    canonicalFoundingYear: canonicalRow.canonical_founding_year as number | null,
    canonicalFounderName: canonicalRow.canonical_founder_name as string | null,
    canonicalEmployeeCount: canonicalRow.canonical_employee_count as string | null,
    canonicalServiceAreas: (canonicalRow.canonical_service_areas as string[]) || [],
    platformDescriptions: (canonicalRow.platform_descriptions as Record<string, string>) || {},
  };

  const vertical = (client.vertical as string) || null;
  const websiteUrl = client.website_url as string;

  // Step 1: Determine platforms
  let platformKeys: string[];
  if (scanType === 'single' && singlePlatform) {
    platformKeys = [singlePlatform];
  } else if (scanType === 'quick') {
    platformKeys = getQuickScanPlatforms(vertical as Vertical).map(p => p.platform);
  } else if (scanType === 'schema_only') {
    platformKeys = [];
  } else {
    platformKeys = getPlatformsForVertical(vertical as Vertical).map(p => p.platform);
  }

  // Update scan to running
  await supabase.from("entity_scans").update({
    status: "running",
    started_at: new Date().toISOString(),
    platforms_scanned: platformKeys,
  }).eq("id", scanId);

  let profiles: EntityProfileData[] = [];
  let consistencyResults: EntityConsistencyResult[] = [];
  let schemaResult: EntitySchemaAuditResult | null = null;

  try {
    // Step 2: Run directory scanner + schema auditor in PARALLEL
    const [scannerResult, schemaAuditResult] = await Promise.all([
      platformKeys.length > 0
        ? logAgentActionBg(
            { agencyId, clientId, agentType: "entity_scanner", agentName: agents.entity.directoryScanner.name, trigger: "inngest_job", triggerReferenceId: scanId },
            () => agents.entity.directoryScanner.scan(clientId, canonical, platformKeys)
          )
        : Promise.resolve([]),
      websiteUrl
        ? logAgentActionBg(
            { agencyId, clientId, agentType: "entity_schema", agentName: agents.entity.schemaAuditor.name, trigger: "inngest_job", triggerReferenceId: scanId },
            () => {
              // Get claimed profile URLs for sameAs validation
              const claimedUrls = profiles
                .filter(p => p.platformProfileUrl)
                .map(p => p.platformProfileUrl!);
              return agents.entity.schemaAuditor.audit(websiteUrl, vertical, claimedUrls);
            }
          )
        : Promise.resolve(null),
    ]);

    profiles = scannerResult;
    schemaResult = schemaAuditResult;

    // Step 3: Consistency scoring (needs scanner results)
    if (profiles.length > 0) {
      consistencyResults = await logAgentActionBg(
        { agencyId, clientId, agentType: "entity_consistency", agentName: agents.entity.consistencyScorer.name, trigger: "inngest_job", triggerReferenceId: scanId },
        () => agents.entity.consistencyScorer.score(profiles, canonical)
      );
    }

    // Step 4: Upsert entity_profiles
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const consistency = consistencyResults.find(c => c.platform === profile.platform);

      const profileStatus = !profile.platformProfileUrl
        ? 'not_found'
        : consistency && consistency.consistencyScore >= 80
          ? 'claimed_consistent'
          : consistency
            ? 'claimed_inconsistent'
            : 'not_checked';

      await supabase.from("entity_profiles").upsert({
        client_id: clientId,
        platform: profile.platform,
        platform_profile_url: profile.platformProfileUrl,
        platform_profile_id: profile.platformProfileId,
        is_claimed: profile.isClaimed,
        description_text: profile.descriptionText,
        category: profile.category,
        contact_info: profile.contactInfo,
        additional_fields: profile.additionalFields,
        consistency_score: consistency?.consistencyScore ?? null,
        consistency_details: consistency?.consistencyDetails ?? {},
        issues: consistency?.issues ?? [],
        status: profileStatus,
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "client_id,platform" });
    }

    // Step 5: Insert schema results
    if (schemaResult) {
      for (const sr of schemaResult.schemaResults) {
        await supabase.from("entity_schema_results").upsert({
          client_id: clientId,
          scan_id: scanId,
          page_url: sr.pageUrl,
          page_type: sr.pageType,
          schemas_found: sr.schemasFound,
          schemas_missing: sr.schemasMissing,
          schema_score: sr.schemaScore,
          raw_jsonld: sr.rawJsonld,
          raw_microdata: sr.rawMicrodata,
          raw_rdfa: sr.rawRdfa,
          sameas_validation: sr.sameasValidation || {},
          scanned_at: new Date().toISOString(),
        }, { onConflict: "client_id,page_url,scan_id" });
      }

      if (schemaResult.robotsResult) {
        await supabase.from("entity_schema_results").upsert({
          client_id: clientId,
          scan_id: scanId,
          page_url: schemaResult.robotsResult.pageUrl,
          page_type: 'robots_txt',
          schemas_found: [],
          crawler_access: schemaResult.robotsResult.crawlerAccess,
          robots_score: schemaResult.robotsResult.robotsScore,
          scanned_at: new Date().toISOString(),
        }, { onConflict: "client_id,page_url,scan_id" });
      }

      if (schemaResult.llmsTxtResult) {
        await supabase.from("entity_schema_results").upsert({
          client_id: clientId,
          scan_id: scanId,
          page_url: schemaResult.llmsTxtResult.pageUrl,
          page_type: 'llms_txt',
          schemas_found: [],
          llms_txt_exists: schemaResult.llmsTxtResult.exists,
          llms_txt_content: schemaResult.llmsTxtResult.content,
          llms_txt_score: schemaResult.llmsTxtResult.score,
          llms_txt_issues: schemaResult.llmsTxtResult.issues,
          scanned_at: new Date().toISOString(),
        }, { onConflict: "client_id,page_url,scan_id" });
      }
    }

    // Step 6: Generate remediation tasks
    const profileUrls: Record<string, string> = {};
    for (const p of profiles) {
      if (p.platformProfileUrl) {
        profileUrls[p.platform] = p.platformProfileUrl;
      }
    }

    if (schemaResult || consistencyResults.length > 0) {
      const tasks = await logAgentActionBg(
        { agencyId, clientId, agentType: "entity_tasks", agentName: agents.entity.taskGenerator.name, trigger: "inngest_job", triggerReferenceId: scanId },
        () => agents.entity.taskGenerator.generate({
          consistencyResults,
          schemaResult: schemaResult || { schemaResults: [], robotsResult: null, llmsTxtResult: null },
          canonical,
          vertical,
          profileUrls,
        })
      );

      // Insert tasks
      for (const task of tasks) {
        // Find matching profile ID if applicable
        let entityProfileId: string | null = null;
        if (task.platform) {
          const { data: profileRow } = await supabase
            .from("entity_profiles")
            .select("id")
            .eq("client_id", clientId)
            .eq("platform", task.platform)
            .single();
          entityProfileId = profileRow?.id || null;
        }

        await supabase.from("entity_tasks").insert({
          client_id: clientId,
          entity_profile_id: entityProfileId,
          task_type: task.taskType,
          description: task.description,
          instructions: task.instructions,
          generated_code: task.generatedCode,
          platform_description: task.platformDescription,
          platform_char_limit: task.platformCharLimit,
          platform: task.platform,
          priority: task.priority,
          priority_score: task.priorityScore,
          status: "pending",
        });
      }

      // Step 7: Calculate overall score
      const profileScores = consistencyResults.map(r => r.consistencyScore);
      const avgProfileScore = profileScores.length > 0
        ? profileScores.reduce((a, b) => a + b, 0) / profileScores.length
        : 0;

      const schemaScore = schemaResult?.schemaResults?.[0]?.schemaScore ?? 0;
      const robotsScore = schemaResult?.robotsResult?.robotsScore ?? 100;
      const llmsScore = schemaResult?.llmsTxtResult?.score ?? 0;

      const overallScore = Math.round(
        avgProfileScore * 0.35 +
        (profiles.filter(p => p.platformProfileUrl).length / Math.max(platformKeys.length, 1)) * 100 * 0.25 +
        schemaScore * 0.20 +
        ((robotsScore * 0.6 + llmsScore * 0.4) * 0.20)
      );

      // Update scan record
      await supabase.from("entity_scans").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        profiles_checked: platformKeys.length,
        profiles_found: profiles.filter(p => p.platformProfileUrl).length,
        profiles_consistent: consistencyResults.filter(r => r.consistencyScore >= 80).length,
        profiles_inconsistent: consistencyResults.filter(r => r.consistencyScore < 80).length,
        profiles_missing: profiles.filter(p => !p.platformProfileUrl).length,
        issues_found: consistencyResults.reduce((sum, r) => sum + r.issues.length, 0),
        tasks_created: tasks.length,
        overall_consistency_score: Math.max(0, Math.min(100, overallScore)),
      }).eq("id", scanId);
    }
  } catch (error) {
    // Mark scan as failed
    await supabase.from("entity_scans").update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: error instanceof Error ? error.message : String(error),
    }).eq("id", scanId);
    throw error;
  }
}
