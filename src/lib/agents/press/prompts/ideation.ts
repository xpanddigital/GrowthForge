import type { Client, CalendarEvent, ClientType } from "@/types/database";

interface IdeationInput {
  client: Client;
  clientType?: ClientType;
  spokespersonName: string;
  spokespersonTitle: string;
  month: number;
  year: number;
  calendarEvents: CalendarEvent[];
  pastCampaigns?: Array<{ title: string; angle: string }>;
  count?: number;
}

export interface CampaignIdea {
  headline: string;
  angle: string;
  type: "expert_commentary" | "data_driven";
  press_release_brief: string;
  target_date: string;
  relevance_score: number;
  seasonal_hook: string;
}

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function buildIdeationPrompt(input: IdeationInput): { system: string; user: string } {
  const {
    client,
    clientType = client.client_type ?? "business",
    spokespersonName,
    spokespersonTitle,
    month,
    year,
    calendarEvents,
    pastCampaigns,
    count = 5,
  } = input;

  const isThoughtLeader = clientType === "thought_leader";

  const system = isThoughtLeader
    ? `You are a senior digital PR strategist with 15 years of experience getting thought leaders featured in mainstream press across Australia, the UK, and the US. You specialize in positioning personal brands as go-to experts in their field — the kind journalists call for quotes and commentary.`
    : `You are a senior digital PR strategist with 15 years of experience getting coverage in mainstream press across Australia, the UK, and the US. You specialize in creating newsworthy angles from ordinary businesses.`;

  const eventsText = calendarEvents.length > 0
    ? calendarEvents.map(e =>
        `- ${e.name}${e.event_date ? ` (${e.event_date})` : " (month-long)"}: ${e.pr_angle_hint} [Send ${e.send_by_offset_days} days before]`
      ).join("\n")
    : "No specific calendar events this month.";

  const pastText = pastCampaigns && pastCampaigns.length > 0
    ? pastCampaigns.map(c => `- "${c.title}": ${c.angle}`).join("\n")
    : "None yet.";

  const profileBlock = isThoughtLeader
    ? `THOUGHT LEADER PROFILE:
- Name: ${client.name}
- Expertise: ${client.industry}${client.sub_industry ? ` / ${client.sub_industry}` : ""}
- Title/Credentials: ${spokespersonTitle}
- Location: ${client.location || "Not specified"}
- Website: ${client.website_url}
- Bio: ${client.description || "No description provided."}
- Target regions: ${(client.target_regions || ["AU"]).join(", ")}

IMPORTANT: ${client.name} IS the brand. All campaign concepts should position them as THE expert — the person journalists call for commentary. Focus on their unique perspective, expertise, and thought leadership. The story is always ABOUT them or FROM them, not about a company they represent.`
    : `CLIENT PROFILE:
- Business: ${client.name}
- Industry: ${client.industry}${client.sub_industry ? ` / ${client.sub_industry}` : ""}
- Location: ${client.location || "Not specified"}
- Website: ${client.website_url}
- Description: ${client.description || "No description provided."}
- Spokesperson: ${spokespersonName}, ${spokespersonTitle}
- Target regions: ${(client.target_regions || ["AU"]).join(", ")}`;

  const user = `Generate ${count} PR campaign concepts for ${isThoughtLeader ? "the following thought leader" : "the following client"} for ${MONTH_NAMES[month]} ${year}.

${profileBlock}

CALENDAR EVENTS THIS MONTH:
${eventsText}

PAST SUCCESSFUL CAMPAIGNS (if any):
${pastText}

For each concept, provide:
1. HEADLINE: A press-ready headline that a journalist would actually use. Must be attention-grabbing, specific, and include a number or surprising claim where possible. Never use: "game-changing", "innovative", "groundbreaking", "passionate about". Write like a tabloid subeditor, not a marketer.
2. ANGLE: 2-3 sentences explaining the story hook and why a journalist would cover this.${isThoughtLeader ? " Frame around their personal expertise and unique perspective." : ""}
3. TYPE: "expert_commentary" or "data_driven"
4. PRESS_RELEASE_BRIEF: What the press release should cover, key talking points, suggested ${isThoughtLeader ? "quotes to write in their voice" : "spokesperson quotes to gather"}.
5. TARGET_DATE: When to send (ISO format YYYY-MM-DD, account for lead time — if tied to an event, send 5-7 days before).
6. RELEVANCE_SCORE: 1-10, how likely this is to get pickup in mainstream press.
7. SEASONAL_HOOK: Which calendar event or seasonal trend this ties to.

Return as a JSON array. Only return JSON, no other text.`;

  return { system, user };
}
