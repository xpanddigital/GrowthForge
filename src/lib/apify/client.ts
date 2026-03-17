import { ApifyClient as ApifyClientSDK } from "apify-client";
import { withRetry } from "@/lib/utils/retry";
import { ApifyActorError } from "@/lib/utils/errors";

// Default timeout for actor runs: 10 minutes
const DEFAULT_TIMEOUT_SECS = 600;

// Polling interval when waiting for actor run completion: 5 seconds
const POLL_INTERVAL_MS = 5_000;

// Maximum number of items to fetch from a dataset per page
const DEFAULT_DATASET_PAGE_LIMIT = 1000;

interface RunActorOptions {
  /** Timeout in seconds for the actor run. Defaults to 600 (10 minutes). */
  timeoutSecs?: number;
  /** Memory allocation in MB for the actor. */
  memoryMbytes?: number;
  /** Maximum number of items to return from the default dataset. */
  maxItems?: number;
  /** Custom build tag to use for the actor run. */
  build?: string;
}

interface ActorRunResult<T = Record<string, unknown>> {
  /** The Apify run ID */
  runId: string;
  /** The default dataset ID for this run */
  datasetId: string;
  /** The items from the default dataset */
  items: T[];
  /** Run status */
  status: string;
  /** Run statistics */
  stats: {
    durationMillis: number;
    resurrectCount: number;
  };
}

let _client: ApifyClientSDK | null = null;

function getClient(): ApifyClientSDK {
  if (!_client) {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      throw new ApifyActorError(
        "N/A",
        "APIFY_API_TOKEN environment variable is not set"
      );
    }
    _client = new ApifyClientSDK({ token });
  }
  return _client;
}

/**
 * Starts an Apify actor run, waits for it to complete, and returns the
 * results from the default dataset.
 *
 * Includes retry logic for transient failures and enforces a timeout.
 * If the actor run exceeds the timeout, it is aborted and an error is thrown.
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
    build,
  } = options;

  return withRetry(
    async () => {
      const client = getClient();

      // Start the actor run
      let run;
      try {
        run = await client.actor(actorId).start(input as Record<string, unknown>, {
          timeout: timeoutSecs,
          memory: memoryMbytes,
          build,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new ApifyActorError(actorId, `Failed to start actor: ${message}`, {
          input: summarizeInput(input),
        });
      }

      const runId = run.id;

      // Wait for the run to complete by polling status
      const deadline = Date.now() + timeoutSecs * 1000;

      while (Date.now() < deadline) {
        let runInfo;
        try {
          runInfo = await client.run(runId).get();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new ApifyActorError(actorId, `Failed to get run status: ${message}`, {
            runId,
          });
        }

        if (!runInfo) {
          throw new ApifyActorError(actorId, "Run not found after starting", {
            runId,
          });
        }

        const status = runInfo.status;

        if (status === "SUCCEEDED") {
          // Fetch results from the default dataset
          const datasetId = runInfo.defaultDatasetId;
          const items = await getDatasetItems<TOutput>(datasetId, maxItems);

          return {
            runId,
            datasetId,
            items,
            status,
            stats: {
              durationMillis: runInfo.stats?.durationMillis ?? 0,
              resurrectCount: runInfo.stats?.resurrectCount ?? 0,
            },
          };
        }

        if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
          throw new ApifyActorError(
            actorId,
            `Actor run finished with status: ${status}`,
            {
              runId,
              status,
              exitCode: runInfo.exitCode,
            }
          );
        }

        // Still running — wait before polling again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      // Timeout reached — abort the run and throw
      try {
        await client.run(runId).abort();
      } catch {
        // Best-effort abort; ignore errors
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
 * Fetches all items from an Apify dataset, paginating if necessary.
 * Optionally limits the total number of items returned.
 */
export async function getDatasetItems<T = Record<string, unknown>>(
  datasetId: string,
  maxItems?: number
): Promise<T[]> {
  const client = getClient();
  const allItems: T[] = [];
  let offset = 0;
  const limit = DEFAULT_DATASET_PAGE_LIMIT;

  try {
    while (true) {
      const effectiveLimit = maxItems
        ? Math.min(limit, maxItems - allItems.length)
        : limit;

      if (effectiveLimit <= 0) break;

      const response = await client
        .dataset(datasetId)
        .listItems({ offset, limit: effectiveLimit });

      const items = (response.items ?? []) as T[];
      allItems.push(...items);

      // If we got fewer items than requested, we've reached the end
      if (items.length < effectiveLimit) break;

      // If we've reached the max, stop
      if (maxItems && allItems.length >= maxItems) break;

      offset += items.length;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ApifyActorError(
      "dataset",
      `Failed to fetch dataset items: ${message}`,
      { datasetId, offset }
    );
  }

  return maxItems ? allItems.slice(0, maxItems) : allItems;
}

/**
 * Creates a safe summary of input for error logging.
 * Truncates large values to avoid bloating error details.
 */
function summarizeInput(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") {
    return { raw: String(input)?.slice(0, 200) };
  }

  const summary: Record<string, unknown> = {};
  const obj = input as Record<string, unknown>;

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      summary[key] = `Array(${value.length})`;
    } else if (typeof value === "string" && value.length > 100) {
      summary[key] = value.slice(0, 100) + "...";
    } else {
      summary[key] = value;
    }
  }

  return summary;
}
