import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { inngest } from "@/lib/inngest/client";

// POST /api/webhooks/instantly — Handle Instantly webhook events
// Events: open, reply, bounce, click
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Instantly sends: { event_type, email, campaign_id, ... }
    const eventType = body.event_type as string;
    const email = body.email as string;
    const instantlyCampaignId = body.campaign_id as string;

    if (!eventType || !email) {
      return NextResponse.json({ error: "Missing event_type or email" }, { status: 400 });
    }

    const validEvents = ["open", "reply", "bounce", "click"];
    if (!validEvents.includes(eventType)) {
      return NextResponse.json({ ok: true }); // Ignore unknown events
    }

    // Look up the journalist and outreach email
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find journalist by email
    const { data: journalist } = await supabase
      .from("journalists")
      .select("id, agency_id")
      .eq("email", email)
      .maybeSingle();

    if (!journalist) {
      // Unknown email — silently ignore
      return NextResponse.json({ ok: true });
    }

    // Update the outreach email record
    if (instantlyCampaignId) {
      const updateField: Record<string, unknown> = {};
      if (eventType === "open") updateField.opened_at = new Date().toISOString();
      if (eventType === "reply") updateField.replied_at = new Date().toISOString();
      if (eventType === "bounce") {
        updateField.status = "bounced";
        updateField.bounce_reason = body.reason ?? null;
      }

      if (Object.keys(updateField).length > 0) {
        await supabase
          .from("press_outreach_emails")
          .update(updateField)
          .eq("journalist_id", journalist.id)
          .eq("instantly_campaign_id", instantlyCampaignId);
      }
    }

    // Queue journalist stats update via Inngest
    await inngest.send({
      name: "press/update-journalist-stats",
      data: {
        journalistId: journalist.id as string,
        agencyId: journalist.agency_id as string,
        event: eventType as "open" | "reply" | "bounce" | "click",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Instantly webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
