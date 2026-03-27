import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe, getPlanByPriceId, PLANS } from "@/lib/billing/stripe";
import { addCredits } from "@/lib/billing/credits";
import { sendPlanActivatedEmail } from "@/lib/email/notifications";
import type Stripe from "stripe";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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
          const priceId = sub.items.data[0]?.price?.id;
          const planKey = priceId ? getPlanByPriceId(priceId) : null;
          const plan = planKey ? PLANS[planKey] : PLANS.starter;

          await supabase
            .from("agencies")
            .update({
              plan: planKey || "starter",
              stripe_subscription_id: subscriptionId,
              credits_balance: plan.monthlyCredits,
              max_clients: plan.maxClients,
              max_keywords_per_client: plan.maxKeywordsPerClient,
              is_active: true,
            })
            .eq("id", agencyId);

          // Log the initial credit grant
          await addCredits({
            agencyId,
            amount: plan.monthlyCredits,
            reason: "purchase",
            description: `${plan.name} plan activated — ${plan.monthlyCredits} credits`,
          });

          // Upgrade any prospect users to agency_owner
          await supabase
            .from("users")
            .update({ role: "agency_owner" })
            .eq("agency_id", agencyId)
            .eq("role", "prospect");

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
              plan.monthlyCredits,
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

        const plan = PLANS[agency.plan as keyof typeof PLANS] || PLANS.starter;

        // Refill credits to the plan's monthly amount
        await supabase
          .from("agencies")
          .update({ credits_balance: plan.monthlyCredits })
          .eq("id", agency.id);

        await addCredits({
          agencyId: agency.id,
          amount: plan.monthlyCredits,
          reason: "purchase",
          description: `Monthly credit refill — ${plan.monthlyCredits} credits`,
        });
        break;
      }

      // Subscription cancelled — deactivate
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = subscription.metadata?.agency_id;

        if (agencyId) {
          await supabase
            .from("agencies")
            .update({
              plan: "starter",
              stripe_subscription_id: null,
              max_clients: 5,
              max_keywords_per_client: 50,
              credits_balance: 0,
            })
            .eq("id", agencyId);
        }
        break;
      }

      // Subscription updated (upgrade/downgrade)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = subscription.metadata?.agency_id;
        if (!agencyId) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const planKey = priceId ? getPlanByPriceId(priceId) : null;

        if (planKey) {
          const plan = PLANS[planKey];
          await supabase
            .from("agencies")
            .update({
              plan: planKey,
              max_clients: plan.maxClients,
              max_keywords_per_client: plan.maxKeywordsPerClient,
            })
            .eq("id", agencyId);
        }
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
