// Instantly API client wrapper for cold email outreach.
// REST API integration for creating campaigns, adding leads, and tracking results.

import { withRetry } from "@/lib/utils/retry";
import { GrowthForgeError } from "@/lib/utils/errors";

const INSTANTLY_BASE_URL = "https://api.instantly.ai/api/v1";

function getApiKey(): string {
  const key = process.env.INSTANTLY_API_KEY;
  if (!key) {
    throw new GrowthForgeError(
      "INSTANTLY_API_KEY environment variable is not set",
      "INSTANTLY_CONFIG_ERROR",
      500
    );
  }
  return key;
}

async function instantlyFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  getApiKey(); // Validate API key is configured
  const url = `${INSTANTLY_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body
      ? typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body)
      : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new GrowthForgeError(
      `Instantly API error: ${response.status} ${text}`,
      "INSTANTLY_API_ERROR",
      response.status
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Create a new campaign in Instantly.
 * Returns the campaign ID.
 */
export async function createInstantlyCampaign(name: string): Promise<string> {
  return withRetry(
    async () => {
      const result = await instantlyFetch<{ id: string }>("/campaign/create", {
        method: "POST",
        body: JSON.stringify({
          api_key: getApiKey(),
          name,
        }),
      });
      return result.id;
    },
    { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 10000 }
  );
}

/**
 * Add leads to an Instantly campaign.
 */
export async function addLeadsToInstantly(
  campaignId: string,
  leads: Array<{
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
    customVariables?: Record<string, string>;
  }>
): Promise<void> {
  return withRetry(
    async () => {
      await instantlyFetch("/lead/add", {
        method: "POST",
        body: JSON.stringify({
          api_key: getApiKey(),
          campaign_id: campaignId,
          skip_if_in_workspace: true,
          leads: leads.map((l) => ({
            email: l.email,
            first_name: l.firstName,
            last_name: l.lastName,
            company_name: l.companyName,
            custom_variables: l.customVariables,
          })),
        }),
      });
    },
    { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 10000 }
  );
}

/**
 * Get campaign summary from Instantly.
 */
export async function getCampaignSummary(
  campaignId: string
): Promise<{
  id: string;
  name: string;
  status: string;
  leads_count: number;
  sent_count: number;
  open_count: number;
  reply_count: number;
  bounce_count: number;
}> {
  return withRetry(
    async () => {
      return instantlyFetch(`/campaign/get?api_key=${getApiKey()}&campaign_id=${campaignId}`);
    },
    { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 10000 }
  );
}
