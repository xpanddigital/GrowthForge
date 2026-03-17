// Campaign Ideator Agent — Claude Opus for creative campaign concept generation.
// Takes client profile + calendar events + past campaigns, generates PR concepts.

import { callOpus, parseClaudeJson } from "@/lib/ai/claude";
import { buildIdeationPrompt } from "./prompts/ideation";
import type { CampaignIdea } from "./prompts/ideation";
import type {
  PressCampaignIdeatorAgent,
} from "@/lib/agents/interfaces";
import type { Client, CalendarEvent, ClientType } from "@/types/database";

export class CampaignIdeatorAgent implements PressCampaignIdeatorAgent {
  name = "CampaignIdeatorAgent";

  async ideate(input: {
    client: Client;
    clientType?: ClientType;
    spokespersonName: string;
    spokespersonTitle: string;
    month: number;
    year: number;
    calendarEvents: CalendarEvent[];
    pastCampaigns?: Array<{ title: string; angle: string }>;
    count?: number;
  }): Promise<CampaignIdea[]> {
    const { system, user } = buildIdeationPrompt({
      client: input.client,
      clientType: input.clientType,
      spokespersonName: input.spokespersonName,
      spokespersonTitle: input.spokespersonTitle,
      month: input.month,
      year: input.year,
      calendarEvents: input.calendarEvents,
      pastCampaigns: input.pastCampaigns,
      count: input.count,
    });

    const response = await callOpus(user, {
      systemPrompt: system,
      maxTokens: 8192,
      temperature: 0.8,
    });

    return parseClaudeJson<CampaignIdea[]>(response.text);
  }
}
