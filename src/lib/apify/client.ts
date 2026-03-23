// Apify REST API client using fetch — no SDK dependency.
// Replaces apify-client npm package to avoid proxy-agent bundling
// issues on Vercel serverless.

import { withRetry } from "@/lib/utils/retry";
import { ApifyActorError } from "@/lib/utils/errors";

const APIFY_BASE_URL = "https://api.apify.com/v2";
const DEFAULT_TIMEOUT_SECS = 600;
const POLL_INTERVAL_MS = 5_000;
const DEFAULT_DATASET_PAGE_LIMIT = 1000;

interface RunActorOptions {
  timeoutSecs?: number;
  memoryMbytes?: number;
  maxItems?: number;
  build?: string;
}

interface ActorRunResult<T = Record<string, unknown>> {
  runId: string;
  datasetId: string;
  items: T[];
  status: string;
  stats: {
    durationMillis: number;
    resurrectCount: number;
  };
}

function getToken(): string {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new ApifyActorError(
      "N/A",
      "APIFY_API_TOKEN environment variable is not set"
    );
  }
  return token;
}

async function apifyFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const url = `${APIFY_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res;
}

/**
 * Starts an Apify actor run, waits for completion, returns dataset items.
 */
export async function runActor<TInput = Record<string, unknown>, TOutput = Record<string, unknown>>(
  actorId: string,
  input: TInput,
  options: RunActorOptions = {}
): Promise<ActorRunResult<TOutput>> {
  const {
    timeoutSecs = DEFAULT_TIMEOUT_SECS,
    memoryMbytes,
    maxItems,
  } = options;

  return withRetry(
    async () => {
      // Start the actor run
      const params = new URLSearchParams();
      if (timeoutSecs) params.set("timeout", String(timeoutSecs));
      if (memoryMbytes) params.set("memory", String(memoryMbytes));

      const startRes = await apifyFetch(
        `/acts/${encodeURIComponent(actorId)}/runs?${params.toString()}`,
        {
          method: "POST",
          body: JSON.stringify(input),
        }
      );

      if (!startRes.ok) {
        const text = await startRes.text();
        throw new ApifyActorError(
          actorId,
          `Failed to start actor (${startRes.status}): ${text.substring(0, 200)}`
        );
      }

      const startData = await startRes.json();
      const runId = startData.data?.id;

      if (!runId) {
        throw new ApifyActorError(actorId, "No run ID returned from start");
      }

      // Poll for completion
      const deadline = Date.now() + timeoutSecs * 1000;

      while (Date.now() < deadline) {
        const statusRes = await apifyFetch(`/actor-runs/${runId}`);
        if (!statusRes.ok) {
          throw new ApifyActorError(actorId, `Failed to get run status: ${statusRes.status}`);
        }

        const statusData = await statusRes.json();
        const status = statusData.data?.status;

        if (status === "SUCCEEDED") {
          const datasetId = statusData.data.defaultDatasetId;
          const items = await getDatasetItems<TOutput>(datasetId, maxItems);

          return {
            runId,
            datasetId,
            items,
            status,
            stats: {
              durationMillis: statusData.data.stats?.durationMillis ?? 0,
              resurrectCount: statusData.data.stats?.resurrectCount ?? 0,
            },
          };
        }

        if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
          throw new ApifyActorError(
            actorId,
            `Actor run finished with status: ${status}`,
            { runId, status }
          );
        }

        // Still running — wait before polling again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      // Timeout — abort
      try {
        await apifyFetch(`/actor-runs/${runId}/abort`, { method: "POST" });
      } catch {
        // Best-effort abort
      }

      throw new ApifyActorError(
        actorId,
        `Actor run timed out after ${timeoutSecs} seconds`,
        { runId, timeoutSecs }
      );
    },
    {
      maxRetries: 1,
      baseDelayMs: 5000,
      maxDelayMs: 30000,
      retryableErrors: ["APIFY_ACTOR_ERROR"],
    }
  );
}

/**
 * Fetches items from an Apify dataset, paginating if necessary.
 */
export async function getDatasetItems<T = Record<string, unknown>>(
  datasetId: string,
  maxItems?: number
): Promise<T[]> {
  const allItems: T[] = [];
  let offset = 0;
  const limit = DEFAULT_DATASET_PAGE_LIMIT;

  while (true) {
    const effectiveLimit = maxItems
      ? Math.min(limit, maxItems - allItems.length)
      : limit;

    if (effectiveLimit <= 0) break;

    const res = await apifyFetch(
      `/datasets/${datasetId}/items?offset=${offset}&limit=${effectiveLimit}&format=json`
    );

    if (!res.ok) {
      const text = await res.text();
      throw new ApifyActorError(
        "dataset",
        `Failed to fetch dataset items (${res.status}): ${text.substring(0, 200)}`,
        { datasetId, offset }
      );
    }

    const items = (await res.json()) as T[];
    allItems.push(...items);

    if (items.length < effectiveLimit) break;
    if (maxItems && allItems.length >= maxItems) break;

    offset += items.length;
  }

  return maxItems ? allItems.slice(0, maxItems) : allItems;
}
