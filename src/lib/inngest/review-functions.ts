import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { createAdminClient, logAgentActionBg } from "./admin-client";
import { runReviewScan } from "@/lib/reviews/run-review-scan";
import { agents } from "@/lib/agents/registry";

const reviewScan = inngest.createFunction(
  {
    id: "review-scan",
    name: "Review Engine Scan",
    retries: 1,
    concurrency: [{ limit: 2 }],
  },
  { event: "review/scan" },
  async ({ event, step }) => {
    const { clientId, scanType, platform } = event.data;
    const supabase = createAdminClient();

    const agencyId = await step.run("load-agency", async () => {
      const { data: client } = await supabase
        .from("clients")
        .select("agency_id")
        .eq("id", clientId)
        .single();
      if (!client) throw new NonRetriableError(`Client ${clientId} not found`);
      return client.agency_id as string;
    });

    await step.run("run-scan", async () => {
      await runReviewScan({
        clientId,
        agencyId,
        scanType,
        singlePlatform: platform,
      });
    });

    return { status: "completed", clientId, scanType };
  }
);

const reviewGenerateResponse = inngest.createFunction(
  {
    id: "review-generate-response",
    name: "Review Response Generation",
    retries: 1,
    concurrency: [{ limit: 3 }],
  },
  { event: "review/generate-response" },
  async ({ event, step }) => {
    const { reviewId, clientId } = event.data;
    const supabase = createAdminClient();

    const reviewData = await step.run("load-review", async () => {
      const { data: review } = await supabase
        .from("reviews")
        .select("*, review_profiles!inner(platform)")
        .eq("id", reviewId)
        .single();
      if (!review) throw new NonRetriableError(`Review ${reviewId} not found`);
      return review;
    });

    const clientData = await step.run("load-client", async () => {
      const { data: client } = await supabase
        .from("clients")
        .select("name, tone_guidelines, agency_id")
        .eq("id", clientId)
        .single();
      if (!client) throw new NonRetriableError(`Client ${clientId} not found`);
      return client;
    });

    const result = await step.run("generate-response", async () => {
      return logAgentActionBg(
        {
          agencyId: clientData.agency_id as string,
          clientId,
          agentType: "review_response",
          agentName: agents.review.responseGenerator.name,
          trigger: "manual",
          targetType: "review",
          targetId: reviewId,
        },
        () =>
          agents.review.responseGenerator.generate({
            reviewText: (reviewData.review_text as string) || "",
            reviewerName: (reviewData.reviewer_name as string) || null,
            rating: (reviewData.rating as number) || 0,
            sentiment:
              (reviewData.sentiment as "positive" | "neutral" | "negative") ||
              "neutral",
            topics: (reviewData.topics as string[]) || [],
            clientName: clientData.name as string,
            clientToneGuidelines:
              (clientData.tone_guidelines as string) || null,
          })
      );
    });

    return { status: "completed", reviewId, tone: result.tone };
  }
);

const reviewSendCampaign = inngest.createFunction(
  {
    id: "review-send-campaign",
    name: "Review Campaign Send",
    retries: 1,
    concurrency: [{ limit: 1 }],
  },
  { event: "review/send-campaign" },
  async ({ event, step }) => {
    const { campaignId, clientId } = event.data;
    const supabase = createAdminClient();

    const campaign = await step.run("load-campaign", async () => {
      const { data } = await supabase
        .from("review_campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("status", "active")
        .single();
      if (!data)
        throw new NonRetriableError(`Campaign ${campaignId} not found or not active`);
      return data;
    });

    const client = await step.run("load-client", async () => {
      const { data } = await supabase
        .from("clients")
        .select("name")
        .eq("id", clientId)
        .single();
      if (!data) throw new NonRetriableError(`Client ${clientId} not found`);
      return data;
    });

    await step.run("send-emails", async () => {
      // Load pending recipients
      const { data: recipients } = await supabase
        .from("review_campaign_recipients")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("status", "pending")
        .limit(50); // Batch of 50 for Resend rate limiting

      if (!recipients || recipients.length === 0) {
        // No more pending — mark campaign complete
        await supabase
          .from("review_campaigns")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", campaignId);
        return;
      }

      let sentCount = 0;
      const businessName = client.name as string;
      const template = campaign.message_template as string;
      const subjectLine = (campaign.subject_line as string) || `Quick favor?`;
      const targetUrl = campaign.target_url as string;

      for (const recipient of recipients) {
        const recipientName = (recipient.recipient_name as string) || "there";
        const recipientEmail = recipient.recipient_email as string;
        if (!recipientEmail) continue;

        // Render template variables
        const rendered = template
          .replace(/\{customer_name\}/g, recipientName)
          .replace(/\{business_name\}/g, businessName)
          .replace(/\{review_url\}/g, targetUrl);

        const renderedSubject = subjectLine
          .replace(/\{customer_name\}/g, recipientName)
          .replace(/\{business_name\}/g, businessName);

        try {
          // Send via Resend
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: `${businessName} <reviews@notifications.growthforge.io>`,
                to: [recipientEmail],
                subject: renderedSubject,
                text: rendered,
              }),
            });
          }

          await supabase
            .from("review_campaign_recipients")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", recipient.id);
          sentCount++;
        } catch {
          await supabase
            .from("review_campaign_recipients")
            .update({ status: "bounced" })
            .eq("id", recipient.id);
        }
      }

      // Update campaign counters
      const currentSent = (campaign.requests_sent as number) || 0;
      await supabase
        .from("review_campaigns")
        .update({
          requests_sent: currentSent + sentCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId);

      // Check if more recipients remain
      const { count: remaining } = await supabase
        .from("review_campaign_recipients")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaignId)
        .eq("status", "pending");

      if (remaining && remaining > 0) {
        // Queue another batch
        await inngest.send({
          name: "review/send-campaign",
          data: { campaignId, clientId },
        });
      } else {
        await supabase
          .from("review_campaigns")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", campaignId);
      }
    });

    return { status: "completed", campaignId };
  }
);

export const reviewFunctions = [
  reviewScan,
  reviewGenerateResponse,
  reviewSendCampaign,
];
