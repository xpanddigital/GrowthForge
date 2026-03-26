/**
 * Task Generator Agent — Entity Sync Module (Step 7)
 *
 * Generates prioritized remediation tasks from consistency and schema audit
 * results. This is purely deterministic logic — no AI calls. It examines the
 * issues found by the consistency scorer and schema auditor, then produces a
 * sorted list of actionable tasks with generated code where applicable.
 */

import type {
  EntityTaskGeneratorAgent,
  EntityTaskInput,
  GeneratedEntityTask,
  EntityConsistencyResult,
} from "../interfaces";
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateFAQSchema,
  generateWebSiteSchema,
} from "@/lib/entity/schema-generator";
import { getPlatformByKey } from "@/lib/entity/platform-config";

// Platforms that warrant boosted priority when issues are found
const CRITICAL_PLATFORMS = new Set(["google_business"]);
const HIGH_PRIORITY_PLATFORMS = new Set(["wikipedia", "linkedin"]);

export class TaskGeneratorAgent implements EntityTaskGeneratorAgent {
  name = "TaskGeneratorAgent";

  async generate(input: EntityTaskInput): Promise<GeneratedEntityTask[]> {
    const tasks: GeneratedEntityTask[] = [];

    // 1. Generate tasks from consistency results
    for (const result of input.consistencyResults) {
      tasks.push(...this.generateConsistencyTasks(result, input));
    }

    // 2. Generate tasks from schema audit
    tasks.push(...this.generateSchemaTasks(input));

    // 3. Generate robots.txt tasks
    tasks.push(...this.generateRobotsTasks(input));

    // 4. Generate llms.txt tasks
    tasks.push(...this.generateLlmsTxtTasks(input));

    // 5. Generate sameAs tasks
    tasks.push(...this.generateSameAsTasks(input));

    // Sort by priority score DESC
    tasks.sort((a, b) => b.priorityScore - a.priorityScore);

    return tasks;
  }

  // ---------------------------------------------------------------------------
  // Consistency tasks
  // ---------------------------------------------------------------------------

  private generateConsistencyTasks(
    result: EntityConsistencyResult,
    input: EntityTaskInput
  ): GeneratedEntityTask[] {
    const tasks: GeneratedEntityTask[] = [];
    const platformConfig = getPlatformByKey(result.platform);
    const platformDisplayName =
      platformConfig?.displayName ?? result.platform;

    for (const issue of result.issues) {
      let taskType: string;
      let basePriority: "critical" | "high" | "medium" | "low";
      let basePriorityScore: number;
      let description: string;
      let instructions: string;
      let platformDescription: string | null = null;
      let platformCharLimit: number | null = null;
      let generatedCode: string | null = null; // eslint-disable-line prefer-const

      switch (issue.field) {
        case "name": {
          taskType = "update_name";
          basePriority = "high";
          basePriorityScore = 85;
          description = `Update business name on ${platformDisplayName} — currently "${issue.found}", should be "${issue.expected}"`;
          instructions = `Change the business name on ${platformDisplayName} from "${issue.found}" to "${issue.expected}". ${issue.suggestion}`;
          break;
        }

        case "description": {
          taskType = "update_description";
          basePriority = "medium";
          basePriorityScore = 65;

          // Use the platform-adapted description from canonical if available
          const adaptedDescription =
            input.canonical.platformDescriptions?.[result.platform] ?? null;
          platformDescription = adaptedDescription;
          platformCharLimit = platformConfig?.charLimit ?? null;

          description = `Update description on ${platformDisplayName} to match canonical brand description`;
          instructions = adaptedDescription
            ? `Replace the current description on ${platformDisplayName} with the platform-adapted version below.${platformCharLimit ? ` Maximum ${platformCharLimit} characters.` : ""} ${issue.suggestion}`
            : `Update the description on ${platformDisplayName} to better match the canonical description. Current: "${issue.found}". Expected: "${issue.expected}". ${issue.suggestion}`;
          break;
        }

        case "category": {
          taskType = "update_category";
          basePriority = "medium";
          basePriorityScore = 55;
          description = `Update category on ${platformDisplayName} — currently "${issue.found}", should be "${issue.expected}"`;
          instructions = `Change the business category on ${platformDisplayName} from "${issue.found}" to "${issue.expected}". ${issue.suggestion}`;
          break;
        }

        case "contact":
        case "phone":
        case "email":
        case "address":
        case "website": {
          taskType = "update_contact";
          basePriority = "medium";
          basePriorityScore = 60;
          description = `Update ${issue.field} info on ${platformDisplayName} — currently "${issue.found}", should be "${issue.expected}"`;
          instructions = `Update the ${issue.field} information on ${platformDisplayName} from "${issue.found}" to "${issue.expected}". ${issue.suggestion}`;
          break;
        }

        default: {
          taskType = `update_${issue.field}`;
          basePriority = "low";
          basePriorityScore = 40;
          description = `Fix ${issue.field} on ${platformDisplayName} — "${issue.found}" should be "${issue.expected}"`;
          instructions = `Update the ${issue.field} field on ${platformDisplayName}. ${issue.suggestion}`;
          break;
        }
      }

      // Boost priority for critical and high-priority platforms
      if (CRITICAL_PLATFORMS.has(result.platform)) {
        basePriority = "critical";
        basePriorityScore = 95;
      } else if (HIGH_PRIORITY_PLATFORMS.has(result.platform)) {
        basePriority = "high";
        basePriorityScore = Math.max(basePriorityScore, 80);
      }

      tasks.push({
        taskType,
        description,
        instructions,
        generatedCode,
        platformDescription,
        platformCharLimit,
        platform: result.platform,
        priority: basePriority,
        priorityScore: basePriorityScore,
      });
    }

    return tasks;
  }

  // ---------------------------------------------------------------------------
  // Schema tasks
  // ---------------------------------------------------------------------------

  private generateSchemaTasks(input: EntityTaskInput): GeneratedEntityTask[] {
    const tasks: GeneratedEntityTask[] = [];
    const { schemaResult, canonical, profileUrls } = input;

    for (const pageResult of schemaResult.schemaResults) {
      const isHomepage = pageResult.pageType === "homepage";

      for (const missingSchema of pageResult.schemasMissing) {
        let generatedCode: string | null = null; // eslint-disable-line prefer-const
        const priorityScore = isHomepage ? 60 : 40;

        // Generate the actual JSON-LD code for known schema types
        switch (missingSchema) {
          case "Organization": {
            const sameAsUrls = Object.values(profileUrls).filter(Boolean);
            generatedCode = generateOrganizationSchema(canonical, sameAsUrls);
            break;
          }
          case "LocalBusiness": {
            generatedCode = generateLocalBusinessSchema(canonical);
            break;
          }
          case "WebSite": {
            generatedCode = generateWebSiteSchema(canonical);
            break;
          }
          case "FAQPage": {
            generatedCode = generateFAQSchema([]);
            break;
          }
          default: {
            // For other schema types (Service, Product, Article, etc.)
            // we cannot auto-generate — leave generatedCode as null
            break;
          }
        }

        const pageLabel = isHomepage
          ? "homepage"
          : pageResult.pageType || "page";

        tasks.push({
          taskType: "add_schema",
          description: `Add ${missingSchema} schema markup to ${pageLabel} (${pageResult.pageUrl})`,
          instructions:
            generatedCode
              ? `Add the following JSON-LD schema markup to the <head> of your ${pageLabel}. Copy and paste the code below.`
              : `Add ${missingSchema} schema markup to your ${pageLabel} at ${pageResult.pageUrl}. Use Google's Structured Data Markup Helper or manually create a JSON-LD block for the ${missingSchema} type.`,
          generatedCode,
          platformDescription: null,
          platformCharLimit: null,
          platform: null,
          priority: "medium",
          priorityScore,
        });
      }
    }

    return tasks;
  }

  // ---------------------------------------------------------------------------
  // Robots.txt tasks
  // ---------------------------------------------------------------------------

  private generateRobotsTasks(input: EntityTaskInput): GeneratedEntityTask[] {
    const tasks: GeneratedEntityTask[] = [];
    const { robotsResult } = input.schemaResult;

    if (!robotsResult) return tasks;

    const blockedCrawlers: string[] = [];
    for (const [crawlerName, access] of Object.entries(
      robotsResult.crawlerAccess
    )) {
      if (!access.allowed) {
        blockedCrawlers.push(crawlerName);
      }
    }

    if (blockedCrawlers.length === 0) return tasks;

    // Generate the robots.txt lines to allow blocked crawlers
    const robotsLines = blockedCrawlers
      .map((crawler) => `User-agent: ${crawler}\nAllow: /`)
      .join("\n\n");

    const isBlanketBlock = robotsResult.blanketBlock;
    const description = isBlanketBlock
      ? `robots.txt is blocking all AI crawlers with a blanket rule — update to allow critical crawlers`
      : `robots.txt is blocking ${blockedCrawlers.length} AI crawler${blockedCrawlers.length === 1 ? "" : "s"}: ${blockedCrawlers.join(", ")}`;

    tasks.push({
      taskType: "fix_robots_txt",
      description,
      instructions: isBlanketBlock
        ? `Your robots.txt contains a blanket block rule that prevents AI crawlers from accessing your site. Update your robots.txt to explicitly allow the following crawlers. This is critical for AI visibility — if crawlers cannot access your site, AI models cannot learn about or recommend your business.`
        : `Your robots.txt is currently blocking the following AI crawlers: ${blockedCrawlers.join(", ")}. Add the rules below to your robots.txt file to allow these crawlers to index your content.`,
      generatedCode: robotsLines,
      platformDescription: null,
      platformCharLimit: null,
      platform: null,
      priority: "high",
      priorityScore: 80,
    });

    return tasks;
  }

  // ---------------------------------------------------------------------------
  // llms.txt tasks
  // ---------------------------------------------------------------------------

  private generateLlmsTxtTasks(
    input: EntityTaskInput
  ): GeneratedEntityTask[] {
    const tasks: GeneratedEntityTask[] = [];
    const { llmsTxtResult } = input.schemaResult;

    if (!llmsTxtResult) return tasks;

    // Generate a task if llms.txt does not exist or scores below 50
    if (!llmsTxtResult.exists || llmsTxtResult.score < 50) {
      const taskType = llmsTxtResult.exists
        ? "update_llms_txt"
        : "create_llms_txt";
      const description = llmsTxtResult.exists
        ? `Improve llms.txt file — current score is ${llmsTxtResult.score}/100`
        : `Create an llms.txt file to help AI models understand your business`;

      const issuesList =
        llmsTxtResult.issues.length > 0
          ? ` Current issues: ${llmsTxtResult.issues.join("; ")}.`
          : "";

      tasks.push({
        taskType,
        description,
        instructions: llmsTxtResult.exists
          ? `Your llms.txt file at ${llmsTxtResult.pageUrl} scored ${llmsTxtResult.score}/100.${issuesList} Update it to include a clear business description, key services, target audience, and differentiators. The llms.txt content can be generated via the MentionLayer API.`
          : `Create an llms.txt file at the root of your website (${llmsTxtResult.pageUrl}). This file helps AI language models understand your business context and improves how they represent your brand. The llms.txt content can be generated via the MentionLayer API.`,
        generatedCode: null, // Content generated on-demand via API
        platformDescription: null,
        platformCharLimit: null,
        platform: null,
        priority: "medium",
        priorityScore: 50,
      });
    }

    return tasks;
  }

  // ---------------------------------------------------------------------------
  // sameAs tasks
  // ---------------------------------------------------------------------------

  private generateSameAsTasks(input: EntityTaskInput): GeneratedEntityTask[] {
    const tasks: GeneratedEntityTask[] = [];
    const { schemaResult, profileUrls } = input;

    for (const pageResult of schemaResult.schemaResults) {
      if (!pageResult.sameasValidation) continue;
      if (pageResult.sameasValidation.missing.length === 0) continue;

      // Build the complete sameAs array including all claimed profile URLs
      const allProfileUrls = Object.values(profileUrls).filter(Boolean);
      const sameAsJson = JSON.stringify(allProfileUrls, null, 2);

      const missingCount = pageResult.sameasValidation.missing.length;

      tasks.push({
        taskType: "fix_sameas",
        description: `Add ${missingCount} missing profile URL${missingCount === 1 ? "" : "s"} to sameAs schema on ${pageResult.pageType || "page"} (${pageResult.pageUrl})`,
        instructions: `Your Organization or LocalBusiness schema on ${pageResult.pageUrl} is missing ${missingCount} claimed profile URL${missingCount === 1 ? "" : "s"} from the sameAs property: ${pageResult.sameasValidation.missing.join(", ")}. Replace the current sameAs array with the complete list below.`,
        generatedCode: `"sameAs": ${sameAsJson}`,
        platformDescription: null,
        platformCharLimit: null,
        platform: null,
        priority: "high",
        priorityScore: 70,
      });
    }

    return tasks;
  }
}
