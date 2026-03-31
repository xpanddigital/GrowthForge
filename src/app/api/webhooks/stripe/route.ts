import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getStripe, getPlanByPriceId, PLANS } from "@/lib/billing/stripe";
import { addCredits } from "@/lib/billing/credits";
import { sendPlanActivatedEmail } from "@/lib/email/notifications";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Log a subscription lifecycle event for BI tracking.
 * Uses ON CONFLICT to ensure idempotency (Stripe may retry webhooks).
 */
async function logSubscriptionEvent(
  supabase: SupabaseClient,
  params: {
    agencyId: string;
    stripeEventId: string;
    stripeSubscriptionId?: string | null;
    eventType: string;
    previousPlan?: string | null;
    newPlan?: string | null;
    previousStatus?: string | null;
    newStatus?: string | null;
    mrrDelta?: number;
    amountCents?: number;
    metadata?: Record<string, unknown>;
    occurredAt: string;
  }
) {
  const { error } = await supabase.from("subscription_events").upsert(
    {
      agency_id: params.agencyId,
      stripe_event_id: params.stripeEventId,
      stripe_subscription_id: params.stripeSubscriptionId || null,
      event_type: params.eventType,
      previous_plan: params.previousPlan || null,
      new_plan: params.newPlan || null,
      previous_status: params.previousStatus || null,
      new_status: params.newStatus || null,
      mrr_delta: params.mrrDelta || 0,
      amount_cents: params.amountCents || 0,
      metadata: params.metadata || {},
      occurred_at: params.occurredAt,
    },
    { onConflict: "stripe_event_id", ignoreDuplicates: true }
  );

  if (error) {
    console.error("[Webhook] Failed to log subscription event:", error);
  }
}

/**
 * Get MRR in cents for a plan (monthly price * 100).
 */
function getPlanMrrCents(planKey: string | null): number {
  if (!planKey) return 0;
  const plan = PLANS[planKey as keyof typeof PLANS];
  return plan ? plan.priceMonthly * 100 : 0;
}

// POST /api/webhooks/stripe — Handle Stripe webhook events
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const eventTimestamp = new Date(event.created * 1000).toISOString();

  try {
    switch (event.type) {
      // Checkout completed — activate subscription
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const agencyId = session.metadata?.agency_id;
        if (!agencyId) break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (subscriptionId) {
          // Get the subscription to find the price/plan
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const isTrialing = sub.status === "trialing";
          const priceId = sub.items.data[0]?.price?.id;
          const planKey = priceId ? getPlanByPriceId(priceId) : null;
          const plan = planKey ? PLANS[planKey] : PLANS.solo;
          const creditsToGrant = isTrialing ? plan.trialCredits : plan.monthlyCredits;

          // Calculate trial end date
          const trialEndsAt = isTrialing
            ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString()
            : null;

          await supabase
            .from("agencies")
            .update({
              plan: planKey || "solo",
              stripe_subscription_id: subscriptionId,
              credits_balance: creditsToGrant,
              max_clients: plan.maxClients,
              max_keywords_per_client: plan.maxKeywordsPerClient,
              is_active: true,
              subscription_status: isTrialing ? "trialing" : "active",
              trial_ends_at: trialEndsAt,
            })
            .eq("id", agencyId);

          // Log the initial credit grant
          const creditDescription = isTrialing
            ? `${plan.name} trial started — ${creditsToGrant} trial credits`
            : `${plan.name} plan activated — ${creditsToGrant} credits`;

          await addCredits({
            agencyId,
            amount: creditsToGrant,
            reason: "purchase",
            description: creditDescription,
          });

          // Upgrade any prospect users to agency_owner
          await supabase
            .from("users")
            .update({ role: "agency_owner" })
            .eq("agency_id", agencyId)
            .eq("role", "prospect");

          // Log subscription event for BI
          await logSubscriptionEvent(supabase, {
            agencyId,
            stripeEventId: event.id,
            stripeSubscriptionId: subscriptionId,
            eventType: "checkout_completed",
            newPlan: planKey || "solo",
            newStatus: isTrialing ? "trialing" : "active",
            mrrDelta: isTrialing ? 0 : getPlanMrrCents(planKey),
          occurredAt: eventTimestamp,
          });

          // Send plan activation email
          const { data: agencyForEmail } = await supabase
            .from("agencies")
            .select("owner_email, name")
            .eq("id", agencyId)
            .single();

          if (agencyForEmail?.owner_email) {
            sendPlanActivatedEmail(
              agencyForEmail.owner_email,
              plan.name,
              creditsToGrant,
              agencyForEmail.name
            ).catch((err) => console.error("[Webhook] Email send failed:", err));
          }
        }
        break;
      }

      // Monthly invoice paid — refill credits
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        // Skip the first invoice (handled by checkout.session.completed)
        if (invoice.billing_reason === "subscription_create") break;

        // Extract subscription ID — handle both string and object forms
        const invoiceData = invoice as unknown as Record<string, unknown>;
        const rawSub = invoiceData.subscription;
        const subscriptionId =
          typeof rawSub === "string"
            ? rawSub
            : (rawSub as { id?: string } | null)?.id;
        if (!subscriptionId) break;

        // Find the agency by subscription ID
        const { data: agency } = await supabase
          .from("agencies")
          .select("id, plan")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (!agency) break;

        const plan = PLANS[agency.plan as keyof typeof PLANS] || PLANS.solo;

        // Refill credits to the plan's monthly amount
        await supabase
          .from("agencies")
          .update({
            credits_balance: plan.monthlyCredits,
            subscription_status: "active",
          })
          .eq("id", agency.id);

        await addCredits({
          agencyId: agency.id,
          amount: plan.monthlyCredits,
          reason: "purchase",
          description: `Monthly credit refill — ${plan.monthlyCredits} credits`,
        });

        // Log subscription event for BI
        await logSubscriptionEvent(supabase, {
          agencyId: agency.id,
          stripeEventId: event.id,
          stripeSubscriptionId: subscriptionId,
          eventType: "invoice_paid",
          newPlan: agency.plan,
          newStatus: "active",
          amountCents: invoice.amount_paid || 0,
          occurredAt: eventTimestamp,
        });
        break;
      }

      // Invoice payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceData = invoice as unknown as Record<string, unknown>;
        const rawSub = invoiceData.subscription;
        const subscriptionId =
          typeof rawSub === "string"
            ? rawSub
            : (rawSub as { id?: string } | null)?.id;
        if (!subscriptionId) break;

        const { data: agency } = await supabase
          .from("agencies")
          .select("id, plan")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (!agency) break;

        await supabase
          .from("agencies")
          .update({ subscription_status: "past_due" })
          .eq("id", agency.id);

        await logSubscriptionEvent(supabase, {
          agencyId: agency.id,
          stripeEventId: event.id,
          stripeSubscriptionId: subscriptionId,
          eventType: "invoice_payment_failed",
          newPlan: agency.plan,
          previousStatus: "active",
          newStatus: "past_due",
          amountCents: invoice.amount_due || 0,
          occurredAt: eventTimestamp,
        });
        break;
      }

      // Subscription cancelled — deactivate
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = subscription.metadata?.agency_id;

        if (agencyId) {
          // Get current plan before we reset it
          const { data: currentAgency } = await supabase
            .from("agencies")
            .select("plan")
            .eq("id", agencyId)
            .single();

          const previousPlan = currentAgency?.plan || null;

          await supabase
            .from("agencies")
            .update({
              plan: "solo",
              stripe_subscription_id: null,
              max_clients: 5,
              max_keywords_per_client: 50,
              credits_balance: 0,
              subscription_status: "canceled",
              churned_at: new Date().toISOString(),
            })
            .eq("id", agencyId);

          await logSubscriptionEvent(supabase, {
            agencyId,
            stripeEventId: event.id,
            stripeSubscriptionId: subscription.id,
            eventType: "subscription_deleted",
            previousPlan,
            newPlan: null,
            previousStatus: "active",
            newStatus: "canceled",
            mrrDelta: -getPlanMrrCents(previousPlan),
            occurredAt: eventTimestamp,
          });
        }
        break;
      }

      // Subscription updated (upgrade/downgrade/trial→active)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = subscription.metadata?.agency_id;
        if (!agencyId) break;

        // Get current state before update
        const { data: currentAgency } = await supabase
          .from("agencies")
          .select("plan, subscription_status")
          .eq("id", agencyId)
          .single();

        const previousPlan = currentAgency?.plan || null;
        const previousStatus = currentAgency?.subscription_status || null;

        const priceId = subscription.items.data[0]?.price?.id;
        const planKey = priceId ? getPlanByPriceId(priceId) : null;
        const newStatus = subscription.status === "trialing" ? "trialing"
          : subscription.status === "active" ? "active"
          : subscription.status === "past_due" ? "past_due"
          : subscription.status;

        if (planKey) {
          const plan = PLANS[planKey];
          await supabase
            .from("agencies")
            .update({
              plan: planKey,
              max_clients: plan.maxClients,
              max_keywords_per_client: plan.maxKeywordsPerClient,
              subscription_status: newStatus,
            })
            .eq("id", agencyId);
        } else {
          // No plan change, just status update
          await supabase
            .from("agencies")
            .update({ subscription_status: newStatus })
            .eq("id", agencyId);
        }

        // Calculate MRR delta
        let mrrDelta = 0;
        const isConversion = previousStatus === "trialing" && newStatus === "active";
        if (isConversion) {
          // Trial converting to paid: MRR increases by the plan price
          mrrDelta = getPlanMrrCents(planKey || previousPlan);
        } else if (planKey && previousPlan && planKey !== previousPlan) {
          // Plan change (upgrade/downgrade)
          mrrDelta = getPlanMrrCents(planKey) - getPlanMrrCents(previousPlan);
        }

        await logSubscriptionEvent(supabase, {
          agencyId,
          stripeEventId: event.id,
          stripeSubscriptionId: subscription.id,
          eventType: "subscription_updated",
          previousPlan,
          newPlan: planKey || previousPlan,
          previousStatus,
          newStatus,
          mrrDelta,
          occurredAt: eventTimestamp,
        });
        break;
      }

      // Trial ending soon (Stripe sends 3 days before)
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = subscription.metadata?.agency_id;
        if (!agencyId) break;

        await logSubscriptionEvent(supabase, {
          agencyId,
          stripeEventId: event.id,
          stripeSubscriptionId: subscription.id,
          eventType: "trial_will_end",
          occurredAt: eventTimestamp,
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
