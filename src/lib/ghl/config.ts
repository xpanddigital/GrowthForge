// GoHighLevel CRM configuration
// GHL is used for marketing automation (email nurture, tagging, pipeline tracking).
// Supabase remains source of truth for app auth and data.

export const GHL_CONFIG = {
  locationId: process.env.GHL_LOCATION_ID || "w1vVSrFC2gEKCeSRQh6v",
  apiKey: process.env.GHL_API_KEY || "",

  // B2B Pipeline for tracking free audit prospects
  b2bPipelineId: "IQVepz4hbLcONjMyuRV0",

  // Custom field IDs (from GHL exploration)
  customFields: {
    websiteUrl: "KaHd0BWqPD9CfjS8qI7n",
    businessName: "kw1EfdbQfTisMokUEVvi",
    grade: "fUTOtFN3ZPCb185bpjsA",
    seoReportUrl: "s2XXuCd0tNG5usuy5Gcw",
  },

  // Tags for prospect lifecycle
  tags: {
    freeAuditSignup: "mentionlayer-free-audit",
    auditComplete: "mentionlayer-audit-complete",
    newLead: "new lead",
  },
} as const;
