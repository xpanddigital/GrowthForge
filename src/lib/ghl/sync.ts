// GHL CRM sync service for free audit funnel.
// Syncs prospects to GoHighLevel for marketing automation.
// All GHL operations are fire-and-forget — failures are logged but never block the user flow.

import { GHL_CONFIG } from "./config";

const GHL_API_BASE = "https://services.leadconnectorhq.com";

interface GHLSyncResult {
  contactId?: string;
  opportunityId?: string;
  error?: string;
}

async function ghlFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${GHL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GHL_CONFIG.apiKey}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
      ...options.headers,
    },
  });
  return res;
}

/**
 * Sync a new free-audit prospect to GHL.
 * Creates/upserts contact, adds tags, creates B2B pipeline opportunity.
 */
export async function syncProspectToGHL(params: {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  websiteUrl: string;
}): Promise<GHLSyncResult> {
  if (!GHL_CONFIG.apiKey) {
    console.warn("[GHL] No API key configured, skipping CRM sync");
    return { error: "No GHL API key" };
  }

  try {
    // 1. Upsert contact
    const contactRes = await ghlFetch("/contacts/upsert", {
      method: "POST",
      body: JSON.stringify({
        locationId: GHL_CONFIG.locationId,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        companyName: params.companyName,
        website: params.websiteUrl,
        source: "MentionLayer Free Audit",
        tags: [GHL_CONFIG.tags.freeAuditSignup, GHL_CONFIG.tags.newLead],
        customFields: [
          { id: GHL_CONFIG.customFields.websiteUrl, value: params.websiteUrl },
          { id: GHL_CONFIG.customFields.businessName, value: params.companyName },
        ],
      }),
    });

    if (!contactRes.ok) {
      const errBody = await contactRes.text();
      console.error("[GHL] Contact upsert failed:", errBody);
      return { error: `Contact upsert failed: ${contactRes.status}` };
    }

    const contactData = await contactRes.json();
    const contactId = contactData.contact?.id;

    if (!contactId) {
      return { error: "No contact ID returned" };
    }

    // 2. Create opportunity in B2B pipeline
    let opportunityId: string | undefined;
    try {
      const oppRes = await ghlFetch("/opportunities/", {
        method: "POST",
        body: JSON.stringify({
          pipelineId: GHL_CONFIG.b2bPipelineId,
          locationId: GHL_CONFIG.locationId,
          name: `${params.companyName} - Free Audit`,
          contactId,
          status: "open",
        }),
      });

      if (oppRes.ok) {
        const oppData = await oppRes.json();
        opportunityId = oppData.opportunity?.id;
      } else {
        console.warn("[GHL] Opportunity creation failed:", await oppRes.text());
      }
    } catch (oppErr) {
      console.warn("[GHL] Opportunity creation error:", oppErr);
    }

    return { contactId, opportunityId };
  } catch (error) {
    console.error("[GHL] Sync error:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Update GHL contact after audit completion.
 * Sets audit score, report URL, and advances opportunity.
 */
export async function updateGHLAuditComplete(params: {
  ghlContactId: string;
  auditScore: number;
  auditUrl: string;
}): Promise<void> {
  if (!GHL_CONFIG.apiKey || !params.ghlContactId) {
    return;
  }

  try {
    // Update contact with audit results
    await ghlFetch(`/contacts/${params.ghlContactId}`, {
      method: "PUT",
      body: JSON.stringify({
        customFields: [
          { id: GHL_CONFIG.customFields.grade, value: `${params.auditScore}/100` },
          { id: GHL_CONFIG.customFields.seoReportUrl, value: params.auditUrl },
        ],
      }),
    });

    // Add audit-complete tag
    await ghlFetch(`/contacts/${params.ghlContactId}/tags`, {
      method: "POST",
      body: JSON.stringify({
        tags: [GHL_CONFIG.tags.auditComplete],
      }),
    });
  } catch (error) {
    console.error("[GHL] Audit complete update error:", error);
  }
}
