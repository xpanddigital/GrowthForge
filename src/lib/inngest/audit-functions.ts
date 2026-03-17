// Inngest function for running AI Visibility Audits.
// Delegates to the audit orchestrator which runs all 5 pillar scans in parallel.

import { inngest } from "./client";
import { runAudit } from "@/lib/audit/orchestrator";

const auditRun = inngest.createFunction(
  {
    id: "audit-run",
    name: "Run AI Visibility Audit",
    retries: 1,
  },
  { event: "audit/run" },
  async ({ event }) => {
    const { auditId, clientId, agencyId, auditType } = event.data;

    await runAudit({ auditId, clientId, agencyId, auditType });

    return { status: "completed", auditId };
  }
);

export const auditFunctions = [auditRun];
