// Claude Opus Response Agent — generates 3 response variants per thread.
// Wraps the response generation pipeline from src/lib/ai/generate-responses.ts
// to conform to the ResponseAgent interface.

import type { ResponseAgent, GeneratedResponse } from "../interfaces";
import { generateResponses } from "@/lib/ai/generate-responses";
import type { Client, Thread } from "@/types/database";

export class ClaudeOpusResponder implements ResponseAgent {
  name = "ClaudeOpusResponder";

  /**
   * Generate 3 response variants (casual, expert, story) for a thread.
   *
   * Uses Claude Opus 4 (claude-opus-4-20250514) for highest quality output.
   * DO NOT substitute Sonnet for this — Opus is required for response quality.
   *
   * @param thread - The enriched thread (Record<string, unknown> per interface,
   *                 but should contain Thread fields)
   * @param client - The client data (Record<string, unknown> per interface,
   *                 but should contain Client fields)
   * @returns Array of 3 GeneratedResponse objects: casual, expert, story
   */
  async generate(
    thread: Record<string, unknown>,
    client: Record<string, unknown>
  ): Promise<GeneratedResponse[]> {
    // Cast to typed objects — the interface uses Record<string, unknown>
    // for flexibility, but we need typed data for prompt construction.
    const typedThread = thread as unknown as Thread;
    const typedClient = client as unknown as Client;

    return generateResponses(typedThread, typedClient);
  }
}
