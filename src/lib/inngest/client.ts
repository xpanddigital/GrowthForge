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
};

export const inngest = new Inngest({
  id: "growthforge",
  schemas: new EventSchemas().fromRecord<Events>(),
});
