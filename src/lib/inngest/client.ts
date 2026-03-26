import { EventSchemas, Inngest } from "inngest";

// Define event types for type-safe event sending and function triggers.
type Events = {
  // Phase 1: Citation Engine events
  "discovery/scan": {
    data: {
      clientId: string;
      keywordIds?: string[];
      runId: string;
    };
  };
  "discovery/enrich": {
    data: {
      clientId: string;
      threadIds: string[];
      runId?: string;
    };
  };
  "discovery/classify": {
    data: {
      clientId: string;
      threadIds: string[];
      runId?: string;
    };
  };
  "responses/generate": {
    data: {
      threadId: string;
    };
  };
  // Phase 2: AI Monitor events
  "monitor/run": {
    data: {
      clientId: string;
      runContentGaps?: boolean;
    };
  };
  "monitor/run-weekly": {
    data: Record<string, never>;
  };
  // Audit events
  "audit/run": {
    data: {
      auditId: string;
      clientId: string;
      agencyId: string;
      auditType: "full" | "citation_only" | "ai_presence_only" | "quick";
    };
  };
  // GHL CRM sync after free audit completion
  "audit/ghl-sync": {
    data: {
      auditId: string;
      ghlContactId: string;
      auditScore: number;
      auditUrl: string;
    };
  };
  // Entity Sync events
  "entity/scan": {
    data: {
      clientId: string;
      scanId: string;
      scanType: string;
      singlePlatform?: string;
    };
  };
  "entity/verify-task": {
    data: {
      taskId: string;
      clientId: string;
    };
  };
  // Review Engine events
  "review/scan": {
    data: {
      clientId: string;
      scanType: "full" | "single";
      platform?: string;
    };
  };
  "review/generate-response": {
    data: {
      reviewId: string;
      clientId: string;
    };
  };
  "review/send-campaign": {
    data: {
      campaignId: string;
      clientId: string;
    };
  };
  // PressForge events
  "press/ideate": {
    data: {
      clientId: string;
      agencyId: string;
      spokespersonId: string;
      month: number;
      year: number;
      count?: number;
    };
  };
  "press/generate-release": {
    data: {
      campaignId: string;
      clientId: string;
      agencyId: string;
    };
  };
  "press/model-voice": {
    data: {
      spokespersonId: string;
      clientId: string;
      agencyId: string;
      voiceSamples: string[];
    };
  };
  "press/discover-journalists": {
    data: {
      campaignId: string;
      clientId: string;
      agencyId: string;
      targetCount?: number;
    };
  };
  "press/score-journalists": {
    data: {
      campaignId: string;
      clientId: string;
      agencyId: string;
      journalistIds: string[];
    };
  };
  "press/generate-pitches": {
    data: {
      campaignId: string;
      clientId: string;
      agencyId: string;
      journalistScoreIds: string[];
    };
  };
  "press/send-outreach": {
    data: {
      campaignId: string;
      agencyId: string;
      emailIds: string[];
    };
  };
  "press/scan-coverage": {
    data: {
      clientId: string;
      agencyId: string;
      campaignIds?: string[];
    };
  };
  "press/update-journalist-stats": {
    data: {
      journalistId: string;
      agencyId: string;
      event: "open" | "reply" | "bounce" | "click";
    };
  };
  // Technical GEO events
  "technical-geo/scan": {
    data: {
      scanId: string;
      clientId: string;
      agencyId: string;
      scanType: "full" | "robots_only" | "freshness_only" | "citability_only" | "schema_ssr_only";
    };
  };
  // Mention Gap Analyzer events
  "mentions/scan": {
    data: {
      clientId: string;
      agencyId: string;
      scanId?: string;
    };
  };
  "mentions/analyze-gaps": {
    data: {
      clientId: string;
      agencyId: string;
    };
  };
  // YouTube GEO events
  "youtube-geo/scan": {
    data: {
      clientId: string;
      agencyId: string;
      scanId?: string;
    };
  };
  // Analytics events
  "analytics/pull-traffic": {
    data: {
      clientId: string;
      propertyId: string;
    };
  };
  // Journalist Query events
  "journalist-queries/scan": {
    data: {
      clientId: string;
      agencyId: string;
    };
  };
  // Report events
  "reports/generate-competitor": {
    data: {
      clientId: string;
      agencyId: string;
    };
  };
};

export const inngest = new Inngest({
  id: "growthforge",
  schemas: new EventSchemas().fromRecord<Events>(),
});
