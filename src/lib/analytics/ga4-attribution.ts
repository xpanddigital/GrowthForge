// =============================================================================
// GA4 Attribution — AI Referral Traffic Tracking
// Connects to Google Analytics Data API to track traffic from AI platforms.
// Identifies sessions from ChatGPT, Perplexity, Gemini, Claude, and other
// AI referrers to measure real business impact of GEO campaigns.
//
// Requires: GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_JSON env vars.
// Uses the GA4 Data API v1 via REST (no SDK dependency needed).
// =============================================================================

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface AIReferralData {
  dateRange: { start: string; end: string };
  totalSessions: number;
  aiSessions: number;
  aiPercentage: number;
  bySource: Array<{
    source: string;
    sessions: number;
    users: number;
    pageviews: number;
    avgDuration: number;
    bounceRate: number;
  }>;
  byLandingPage: Array<{
    page: string;
    sessions: number;
    source: string;
  }>;
  trend: Array<{
    date: string;
    aiSessions: number;
    totalSessions: number;
  }>;
}

// Known AI referral sources
const AI_REFERRER_PATTERNS = [
  { pattern: "perplexity.ai", label: "Perplexity" },
  { pattern: "chatgpt.com", label: "ChatGPT" },
  { pattern: "chat.openai.com", label: "ChatGPT" },
  { pattern: "gemini.google.com", label: "Gemini" },
  { pattern: "claude.ai", label: "Claude" },
  { pattern: "you.com", label: "You.com" },
  { pattern: "bard.google.com", label: "Gemini" },
  { pattern: "copilot.microsoft.com", label: "Copilot" },
  { pattern: "bing.com/chat", label: "Copilot" },
  { pattern: "meta.ai", label: "Meta AI" },
  { pattern: "poe.com", label: "Poe" },
  { pattern: "phind.com", label: "Phind" },
];

// -----------------------------------------------------------------------------
// GA4 API Client (REST-based, no SDK dependency)
// -----------------------------------------------------------------------------

interface GA4ReportResponse {
  rows?: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  rowCount?: number;
}

async function getAccessToken(): Promise<string> {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON not set — required for GA4 integration"
    );
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  // Build JWT for service account authentication
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  // Use native crypto for JWT signing
  const { createSign } = await import("crypto");

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signInput = `${headerB64}.${payloadB64}`;

  const sign = createSign("RSA-SHA256");
  sign.update(signInput);
  const signature = sign.sign(serviceAccount.private_key, "base64url");

  const jwt = `${signInput}.${signature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Failed to get GA4 access token: ${err}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function runGA4Report(
  propertyId: string,
  accessToken: string,
  body: Record<string, unknown>
): Promise<GA4ReportResponse> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GA4 API error: ${response.status} ${err}`);
  }

  return response.json();
}

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function getAIReferralTraffic(
  propertyId: string,
  dateRange: { start: string; end: string }
): Promise<AIReferralData> {
  const accessToken = await getAccessToken();

  // Query 1: All sessions by source for the date range
  const sourceReport = await runGA4Report(propertyId, accessToken, {
    dateRanges: [
      { startDate: dateRange.start, endDate: dateRange.end },
    ],
    dimensions: [{ name: "sessionSource" }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
  });

  // Query 2: Daily AI referral trend
  const trendReport = await runGA4Report(propertyId, accessToken, {
    dateRanges: [
      { startDate: dateRange.start, endDate: dateRange.end },
    ],
    dimensions: [{ name: "date" }, { name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
  });

  // Query 3: AI referral landing pages
  const landingReport = await runGA4Report(propertyId, accessToken, {
    dateRanges: [
      { startDate: dateRange.start, endDate: dateRange.end },
    ],
    dimensions: [
      { name: "landingPage" },
      { name: "sessionSource" },
    ],
    metrics: [{ name: "sessions" }],
    dimensionFilter: {
      orGroup: {
        expressions: AI_REFERRER_PATTERNS.map((p) => ({
          filter: {
            fieldName: "sessionSource",
            stringFilter: {
              matchType: "CONTAINS",
              value: p.pattern,
              caseSensitive: false,
            },
          },
        })),
      },
    },
    limit: 50,
  });

  // Parse source report
  let totalSessions = 0;
  const aiSources: AIReferralData["bySource"] = [];

  for (const row of sourceReport.rows || []) {
    const source = row.dimensionValues[0].value;
    const sessions = parseInt(row.metricValues[0].value, 10);
    totalSessions += sessions;

    const aiMatch = AI_REFERRER_PATTERNS.find((p) =>
      source.toLowerCase().includes(p.pattern)
    );

    if (aiMatch) {
      aiSources.push({
        source: aiMatch.label,
        sessions,
        users: parseInt(row.metricValues[1].value, 10),
        pageviews: parseInt(row.metricValues[2].value, 10),
        avgDuration: parseFloat(row.metricValues[3].value),
        bounceRate: parseFloat(row.metricValues[4].value),
      });
    }
  }

  // Merge duplicate AI sources (e.g., chatgpt.com + chat.openai.com → ChatGPT)
  const mergedSources = new Map<string, AIReferralData["bySource"][0]>();
  for (const src of aiSources) {
    const existing = mergedSources.get(src.source);
    if (existing) {
      existing.sessions += src.sessions;
      existing.users += src.users;
      existing.pageviews += src.pageviews;
    } else {
      mergedSources.set(src.source, { ...src });
    }
  }

  const aiSessionsTotal = Array.from(mergedSources.values()).reduce(
    (sum, s) => sum + s.sessions,
    0
  );

  // Parse trend data
  const trendMap = new Map<
    string,
    { aiSessions: number; totalSessions: number }
  >();

  for (const row of trendReport.rows || []) {
    const date = row.dimensionValues[0].value;
    const source = row.dimensionValues[1].value;
    const sessions = parseInt(row.metricValues[0].value, 10);

    if (!trendMap.has(date)) {
      trendMap.set(date, { aiSessions: 0, totalSessions: 0 });
    }
    const entry = trendMap.get(date)!;
    entry.totalSessions += sessions;

    if (
      AI_REFERRER_PATTERNS.some((p) =>
        source.toLowerCase().includes(p.pattern)
      )
    ) {
      entry.aiSessions += sessions;
    }
  }

  const trend = Array.from(trendMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Parse landing pages
  const landingPages: AIReferralData["byLandingPage"] = (
    landingReport.rows || []
  ).map((row) => ({
    page: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value, 10),
    source:
      AI_REFERRER_PATTERNS.find((p) =>
        row.dimensionValues[1].value.toLowerCase().includes(p.pattern)
      )?.label || row.dimensionValues[1].value,
  }));

  return {
    dateRange,
    totalSessions,
    aiSessions: aiSessionsTotal,
    aiPercentage:
      totalSessions > 0
        ? Math.round((aiSessionsTotal / totalSessions) * 10000) / 100
        : 0,
    bySource: Array.from(mergedSources.values()).sort(
      (a, b) => b.sessions - a.sessions
    ),
    byLandingPage: landingPages.sort((a, b) => b.sessions - a.sessions),
    trend,
  };
}

// -----------------------------------------------------------------------------
// Exports for use by other modules
// -----------------------------------------------------------------------------

export { AI_REFERRER_PATTERNS };
