import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { createAdminClient, logAgentActionBg } from "./admin-client";
import { agents } from "@/lib/agents/registry";
import type { Client, Spokesperson } from "@/types/database";
import { nanoid } from "nanoid";

// ---------------------------------------------------------------------------
// press/ideate — Generate campaign ideas for a client + month
// ---------------------------------------------------------------------------
const pressIdeate = inngest.createFunction(
  {
    id: "press-ideate",
    name: "PressForge Campaign Ideation",
    retries: 1,
    concurrency: [{ limit: 3 }],
  },
  { event: "press/ideate" },
  async ({ event, step }) => {
    const { clientId, agencyId, spokespersonId, month, year, count } = event.data;
    const supabase = createAdminClient();

    const { client, spokesperson, calendarEvents, pastCampaigns } = await step.run(
      "load-data",
      async () => {
        const { data: cl } = await supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .single();
        if (!cl) throw new NonRetriableError(`Client ${clientId} not found`);

        const { data: sp } = await supabase
          .from("spokespersons")
          .select("*")
          .eq("id", spokespersonId)
          .single();
        if (!sp) throw new NonRetriableError(`Spokesperson ${spokespersonId} not found`);

        const { data: events } = await supabase
          .from("press_calendar_events")
          .select("*")
          .eq("month", month)
          .or(`agency_id.eq.${agencyId},agency_id.is.null`);

        const { data: past } = await supabase
          .from("press_campaigns")
          .select("headline, angle")
          .eq("client_id", clientId)
          .not("headline", "is", null)
          .limit(10);

        return {
          client: cl as Client,
          spokesperson: sp as Spokesperson,
          calendarEvents: events ?? [],
          pastCampaigns: (past ?? []).map((p) => ({
            title: (p as Record<string, unknown>).headline as string,
            angle: (p as Record<string, unknown>).angle as string,
          })),
        };
      }
    );

    const ideas = await step.run("run-ideation", async () => {
      return logAgentActionBg(
        {
          agencyId,
          clientId,
          agentType: "press_ideator",
          agentName: agents.press.campaignIdeator.name,
          trigger: "inngest_job",
          inputSummary: { month, year, count },
        },
        () =>
          agents.press.campaignIdeator.ideate({
            client,
            clientType: client.client_type as "business" | "thought_leader" | undefined,
            spokespersonName: spokesperson.name,
            spokespersonTitle: spokesperson.title,
            month,
            year,
            calendarEvents,
            pastCampaigns,
            count,
          })
      );
    });

    await step.run("save-ideas", async () => {
      for (const idea of ideas) {
        await supabase.from("press_campaign_ideas").insert({
          client_id: clientId,
          spokesperson_id: spokespersonId,
          title: idea.headline,
          angle: idea.angle,
          pr_type: idea.type,
          hook: idea.seasonal_hook,
          calendar_event_id: null,
          target_month: month,
          target_year: year,
          status: "pending",
        });
      }
    });

    return { status: "completed", ideas: ideas.length };
  }
);

// ---------------------------------------------------------------------------
// press/generate-release — Generate a press release for a campaign
// ---------------------------------------------------------------------------
const pressGenerateRelease = inngest.createFunction(
  {
    id: "press-generate-release",
    name: "PressForge Release Generation",
    retries: 1,
    concurrency: [{ limit: 2 }],
  },
  { event: "press/generate-release" },
  async ({ event, step }) => {
    const { campaignId, clientId, agencyId } = event.data;
    const supabase = createAdminClient();

    const { campaign, client, spokesperson } = await step.run("load-data", async () => {
      const { data: camp } = await supabase
        .from("press_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();
      if (!camp) throw new NonRetriableError(`Campaign ${campaignId} not found`);

      const { data: cl } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();
      if (!cl) throw new NonRetriableError(`Client ${clientId} not found`);

      const { data: sp } = await supabase
        .from("spokespersons")
        .select("*")
        .eq("id", (camp as Record<string, unknown>).spokesperson_id)
        .single();
      if (!sp)
        throw new NonRetriableError(
          `Spokesperson ${(camp as Record<string, unknown>).spokesperson_id} not found`
        );

      return {
        campaign: camp as Record<string, unknown>,
        client: cl as Client,
        spokesperson: sp as Spokesperson,
      };
    });

    const result = await step.run("generate-release", async () => {
      return logAgentActionBg(
        {
          agencyId,
          clientId,
          agentType: "press_release_generator",
          agentName: agents.press.releaseGenerator.name,
          trigger: "inngest_job",
          targetType: "press_campaign",
          targetId: campaignId,
        },
        () =>
          agents.press.releaseGenerator.generate({
            headline: campaign.headline as string,
            angle: campaign.angle as string,
            type: (campaign.pr_type as "expert_commentary" | "data_driven") ?? "expert_commentary",
            client,
            spokesperson,
            region: (campaign.target_region as string) ?? "AU",
            length: (campaign.release_length as "short" | "standard" | "detailed") ?? "standard",
          })
      );
    });

    await step.run("save-release", async () => {
      // Mark previous versions as not current
      await supabase
        .from("press_releases")
        .update({ is_current: false })
        .eq("campaign_id", campaignId);

      // Get current version count
      const { count } = await supabase
        .from("press_releases")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", campaignId);

      await supabase.from("press_releases").insert({
        campaign_id: campaignId,
        title: result.title,
        subtitle: result.subtitle,
        body_html: result.body_html,
        body_text: result.body_text,
        word_count: result.word_count,
        quality_checks: result.quality_checks,
        version: (count ?? 0) + 1,
        is_current: true,
        status: "draft",
      });

      await supabase
        .from("press_campaigns")
        .update({ status: "release_draft", updated_at: new Date().toISOString() })
        .eq("id", campaignId);
    });

    return { status: "completed", campaignId, title: result.title };
  }
);

// ---------------------------------------------------------------------------
// press/model-voice — Generate a voice profile for a spokesperson
// ---------------------------------------------------------------------------
const pressModelVoice = inngest.createFunction(
  {
    id: "press-model-voice",
    name: "PressForge Voice Modeling",
    retries: 1,
    concurrency: [{ limit: 3 }],
  },
  { event: "press/model-voice" },
  async ({ event, step }) => {
    const { spokespersonId, clientId, agencyId, voiceSamples } = event.data;
    const supabase = createAdminClient();

    const { spokesperson, clientName } = await step.run("load-data", async () => {
      const { data: sp } = await supabase
        .from("spokespersons")
        .select("*")
        .eq("id", spokespersonId)
        .single();
      if (!sp) throw new NonRetriableError(`Spokesperson ${spokespersonId} not found`);

      const { data: cl } = await supabase
        .from("clients")
        .select("name")
        .eq("id", clientId)
        .single();

      return {
        spokesperson: sp as Spokesperson,
        clientName: (cl?.name as string) ?? "Unknown",
      };
    });

    const result = await step.run("model-voice", async () => {
      return logAgentActionBg(
        {
          agencyId,
          clientId,
          agentType: "press_voice_modeler",
          agentName: agents.press.voiceModeler.name,
          trigger: "inngest_job",
          targetType: "spokesperson",
          targetId: spokespersonId,
        },
        () =>
          agents.press.voiceModeler.model(
            {
              name: spokesperson.name,
              title: spokesperson.title,
              clientName,
            },
            voiceSamples
          )
      );
    });

    await step.run("save-profile", async () => {
      await supabase
        .from("spokespersons")
        .update({
          voice_profile: result.voice_profile,
          updated_at: new Date().toISOString(),
        })
        .eq("id", spokespersonId);
    });

    return { status: "completed", spokespersonId };
  }
);

// ---------------------------------------------------------------------------
// press/discover-journalists — Two-phase journalist discovery
// ---------------------------------------------------------------------------
const pressDiscoverJournalists = inngest.createFunction(
  {
    id: "press-discover-journalists",
    name: "PressForge Journalist Discovery",
    retries: 1,
    concurrency: [{ limit: 1 }],
  },
  { event: "press/discover-journalists" },
  async ({ event, step }) => {
    const { campaignId, clientId, agencyId, targetCount } = event.data;
    const supabase = createAdminClient();

    const pressRelease = await step.run("load-release", async () => {
      const { data: release } = await supabase
        .from("press_releases")
        .select("title, body_text")
        .eq("campaign_id", campaignId)
        .eq("is_current", true)
        .single();
      if (!release) throw new NonRetriableError(`No current release for campaign ${campaignId}`);

      const { data: campaign } = await supabase
        .from("press_campaigns")
        .select("target_region, pr_type")
        .eq("id", campaignId)
        .single();

      return {
        title: release.title as string,
        body: release.body_text as string,
        region: (campaign?.target_region as string) ?? "AU",
        type: (campaign?.pr_type as string) ?? "expert_commentary",
      };
    });

    const discovery = await step.run("discover", async () => {
      return logAgentActionBg(
        {
          agencyId,
          clientId,
          agentType: "press_journalist_discovery",
          agentName: agents.press.journalistDiscovery.name,
          trigger: "inngest_job",
          targetType: "press_campaign",
          targetId: campaignId,
        },
        () => agents.press.journalistDiscovery.discover(pressRelease, agencyId, targetCount)
      );
    });

    await step.run("save-scores", async () => {
      // Save scores for DB journalists
      for (const j of discovery.db_journalists) {
        if (!j.score) continue;
        await supabase.from("press_campaign_journalist_scores").insert({
          campaign_id: campaignId,
          journalist_id: j.id,
          total_score: j.score.total_score,
          tier: j.score.tier,
          breakdown: j.score.breakdown,
          why_selected: j.score.why_selected,
          personalization_hook: j.score.personalization_hook,
          source: "database",
        });
      }

      // Save scores for discovered journalists (need to look up their new IDs)
      for (const j of discovery.discovered_journalists) {
        if (!j.score) continue;
        const { data: journalist } = await supabase
          .from("journalists")
          .select("id")
          .eq("agency_id", agencyId)
          .eq("name", j.name)
          .eq("publication", j.publication)
          .maybeSingle();

        if (journalist) {
          await supabase.from("press_campaign_journalist_scores").insert({
            campaign_id: campaignId,
            journalist_id: journalist.id as string,
            total_score: j.score.total_score,
            tier: j.score.tier,
            breakdown: j.score.breakdown,
            why_selected: j.score.why_selected,
            personalization_hook: j.score.personalization_hook,
            source: "perplexity_discovery",
          });
        }
      }

      await supabase
        .from("press_campaigns")
        .update({ status: "journalists_scored", updated_at: new Date().toISOString() })
        .eq("id", campaignId);
    });

    return {
      status: "completed",
      campaignId,
      db_count: discovery.db_count,
      perplexity_count: discovery.perplexity_count,
      total: discovery.total_found,
    };
  }
);

// ---------------------------------------------------------------------------
// press/generate-pitches — Generate pitch emails for selected journalists
// ---------------------------------------------------------------------------
const pressGeneratePitches = inngest.createFunction(
  {
    id: "press-generate-pitches",
    name: "PressForge Pitch Generation",
    retries: 1,
    concurrency: [{ limit: 2 }],
  },
  { event: "press/generate-pitches" },
  async ({ event, step }) => {
    const { campaignId, clientId, agencyId, journalistScoreIds } = event.data;
    const supabase = createAdminClient();

    const campaignData = await step.run("load-data", async () => {
      const { data: campaign } = await supabase
        .from("press_campaigns")
        .select("*, press_releases!inner(title, body_text, public_slug)")
        .eq("id", campaignId)
        .eq("press_releases.is_current", true)
        .single();
      if (!campaign) throw new NonRetriableError(`Campaign ${campaignId} not found`);

      const { data: sp } = await supabase
        .from("spokespersons")
        .select("name, title")
        .eq("id", (campaign as Record<string, unknown>).spokesperson_id)
        .single();

      const { data: cl } = await supabase
        .from("clients")
        .select("name, client_type")
        .eq("id", clientId)
        .single();

      const { data: scores } = await supabase
        .from("press_campaign_journalist_scores")
        .select("*, journalists!inner(name, email, publication)")
        .in("id", journalistScoreIds)
        .eq("is_selected", true);

      return { campaign, spokesperson: sp, client: cl, scores: scores ?? [] };
    });

    const generated = await step.run("generate-pitches", async () => {
      const results: Array<{ scoreId: string; journalistId: string; pitch: unknown }> = [];
      const camp = campaignData.campaign as Record<string, unknown>;
      const releases = camp.press_releases as Array<Record<string, unknown>>;
      const release = releases[0];
      const publicUrl = release?.public_slug
        ? `${process.env.NEXT_PUBLIC_APP_URL}/press/${release.public_slug}`
        : undefined;

      for (const score of campaignData.scores) {
        const s = score as Record<string, unknown>;
        const journalist = s.journalists as Record<string, unknown>;

        const pitch = await logAgentActionBg(
          {
            agencyId,
            clientId,
            agentType: "press_pitch_generator",
            agentName: agents.press.pitchGenerator.name,
            trigger: "inngest_job",
            targetType: "press_campaign",
            targetId: campaignId,
          },
          () =>
            agents.press.pitchGenerator.generate({
              tier: s.tier as "tier_1" | "tier_2" | "tier_3",
              journalistName: journalist.name as string,
              publication: journalist.publication as string,
              personalizationHook: (s.personalization_hook as string) ?? "",
              headline: release.title as string,
              summary: (release.body_text as string).substring(0, 500),
              spokespersonName: (campaignData.spokesperson as Record<string, unknown>)?.name as string ?? "",
              spokespersonTitle: (campaignData.spokesperson as Record<string, unknown>)?.title as string ?? "",
              clientName: (campaignData.client as Record<string, unknown>)?.name as string ?? "",
              clientType: (campaignData.client as Record<string, unknown>)?.client_type as "business" | "thought_leader" | undefined,
              keyQuote: "",
              publicUrl,
            })
        );

        results.push({
          scoreId: s.id as string,
          journalistId: s.journalist_id as string,
          pitch,
        });
      }

      return results;
    });

    await step.run("save-pitches", async () => {
      for (const item of generated) {
        const pitch = item.pitch as Record<string, unknown>;
        await supabase.from("press_outreach_emails").insert({
          campaign_id: campaignId,
          journalist_id: item.journalistId,
          subject_line: (pitch.subject_lines as string[])?.[0] ?? "",
          subject_variants: pitch.subject_lines,
          body_html: pitch.body as string,
          body_text: pitch.body as string,
          status: "draft",
        });
      }

      await supabase
        .from("press_campaigns")
        .update({ status: "pitches_ready", updated_at: new Date().toISOString() })
        .eq("id", campaignId);
    });

    return { status: "completed", campaignId, pitches: generated.length };
  }
);

// ---------------------------------------------------------------------------
// press/send-outreach — Send emails to Instantly
// ---------------------------------------------------------------------------
const pressSendOutreach = inngest.createFunction(
  {
    id: "press-send-outreach",
    name: "PressForge Send Outreach",
    retries: 1,
    concurrency: [{ limit: 1 }],
  },
  { event: "press/send-outreach" },
  async ({ event, step }) => {
    const { campaignId, agencyId, emailIds } = event.data;
    const supabase = createAdminClient();

    await step.run("send-to-instantly", async () => {
      // Dynamic import to avoid loading Instantly module unless needed
      const { createInstantlyCampaign, addLeadsToInstantly } = await import(
        "@/lib/instantly/client"
      );

      const { data: emails } = await supabase
        .from("press_outreach_emails")
        .select("*, journalists!inner(name, email, publication)")
        .in("id", emailIds);

      if (!emails || emails.length === 0) return;

      const { data: campaign } = await supabase
        .from("press_campaigns")
        .select("headline")
        .eq("id", campaignId)
        .single();

      const campaignName = `PR: ${(campaign as Record<string, unknown>)?.headline ?? campaignId}`;
      const instantlyCampaignId = await createInstantlyCampaign(campaignName);

      const leads = (emails as Array<Record<string, unknown>>).map((e) => {
        const journalist = e.journalists as Record<string, unknown>;
        return {
          email: journalist.email as string,
          firstName: (journalist.name as string).split(" ")[0],
          lastName: (journalist.name as string).split(" ").slice(1).join(" "),
          companyName: journalist.publication as string,
          customVariables: {
            subject: e.subject_line as string,
            body: e.body_text as string,
          },
        };
      });

      await addLeadsToInstantly(instantlyCampaignId, leads);

      // Update email statuses
      for (const email of emails as Array<Record<string, unknown>>) {
        await supabase
          .from("press_outreach_emails")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            instantly_campaign_id: instantlyCampaignId,
          })
          .eq("id", email.id);
      }

      await supabase
        .from("press_campaigns")
        .update({ status: "outreach_sent", updated_at: new Date().toISOString() })
        .eq("id", campaignId);
    });

    return { status: "completed", campaignId, sent: emailIds.length };
  }
);

// ---------------------------------------------------------------------------
// press/scan-coverage — Scan for press coverage
// ---------------------------------------------------------------------------
const pressScanCoverage = inngest.createFunction(
  {
    id: "press-scan-coverage",
    name: "PressForge Coverage Scan",
    retries: 1,
    concurrency: [{ limit: 2 }],
  },
  { event: "press/scan-coverage" },
  async ({ event, step }) => {
    const { clientId, agencyId, campaignIds } = event.data;
    const supabase = createAdminClient();

    const clientData = await step.run("load-client", async () => {
      const { data: cl } = await supabase
        .from("clients")
        .select("name, website_url")
        .eq("id", clientId)
        .single();
      if (!cl) throw new NonRetriableError(`Client ${clientId} not found`);
      return cl as { name: string; website_url: string | null };
    });

    const coverage = await step.run("scan-coverage", async () => {
      return logAgentActionBg(
        {
          agencyId,
          clientId,
          agentType: "press_coverage_scanner",
          agentName: agents.press.coverageScanner.name,
          trigger: "inngest_job",
        },
        () =>
          agents.press.coverageScanner.scan(
            clientData.name,
            clientData.website_url ?? "",
            campaignIds
          )
      );
    });

    await step.run("save-coverage", async () => {
      for (const item of coverage) {
        // Check for duplicates by URL
        const { data: existing } = await supabase
          .from("press_coverage")
          .select("id")
          .eq("client_id", clientId)
          .eq("url", item.url)
          .maybeSingle();

        if (existing) continue;

        await supabase.from("press_coverage").insert({
          client_id: clientId,
          campaign_id: campaignIds?.[0] ?? null,
          title: item.title,
          url: item.url,
          publication: item.publication,
          author: item.author,
          publish_date: item.publish_date,
          coverage_type: item.coverage_type,
          has_backlink: item.has_backlink,
          backlink_url: item.backlink_url,
          is_dofollow: item.is_dofollow,
          estimated_domain_authority: item.estimated_domain_authority,
          sentiment: item.sentiment,
          source: "auto_scan",
        });
      }
    });

    return { status: "completed", clientId, items: coverage.length };
  }
);

// ---------------------------------------------------------------------------
// press/update-journalist-stats — Update engagement stats from webhooks
// ---------------------------------------------------------------------------
const pressUpdateJournalistStats = inngest.createFunction(
  {
    id: "press-update-journalist-stats",
    name: "PressForge Update Journalist Stats",
    retries: 2,
    concurrency: [{ limit: 5 }],
  },
  { event: "press/update-journalist-stats" },
  async ({ event, step }) => {
    const { journalistId, agencyId, event: eventType } = event.data;
    const supabase = createAdminClient();

    await step.run("update-stats", async () => {
      const { data: journalist } = await supabase
        .from("journalists")
        .select("total_pitches, total_opens, total_replies, total_bounces")
        .eq("id", journalistId)
        .single();

      if (!journalist) return;

      const j = journalist as Record<string, unknown>;
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      switch (eventType) {
        case "open":
          updates.total_opens = ((j.total_opens as number) ?? 0) + 1;
          break;
        case "reply":
          updates.total_replies = ((j.total_replies as number) ?? 0) + 1;
          updates.last_contacted_at = new Date().toISOString();
          break;
        case "bounce":
          updates.total_bounces = ((j.total_bounces as number) ?? 0) + 1;
          // Auto-blacklist at 3 bounces
          if (((j.total_bounces as number) ?? 0) + 1 >= 3) {
            updates.is_blacklisted = true;
          }
          break;
        case "click":
          // Track engagement
          break;
      }

      await supabase.from("journalists").update(updates).eq("id", journalistId);
    });

    return { status: "completed", journalistId, event: eventType };
  }
);

export const pressFunctions = [
  pressIdeate,
  pressGenerateRelease,
  pressModelVoice,
  pressDiscoverJournalists,
  pressGeneratePitches,
  pressSendOutreach,
  pressScanCoverage,
  pressUpdateJournalistStats,
];
