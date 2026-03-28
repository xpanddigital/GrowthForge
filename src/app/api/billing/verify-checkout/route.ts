import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe, getPlanByPriceId, PLANS } from "@/lib/billing/stripe";
import { addCredits } from "@/lib/billing/credits";
import { sendPlanActivatedEmail } from "@/lib/email/notifications";
import { handleApiError } from "@/lib/utils/errors";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  session_id: z.string(),
});

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/billing/verify-checkout — Verify a completed Stripe checkout session
// Called when user returns from Stripe Checkout instead of relying on webhooks.
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("agency_id, role, email")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { session_id } = verifySchema.parse(body);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Verify the session belongs to this agency
    const agencyId = session.metadata?.agency_id || user.agency_id;
    if (agencyId !== user.agency_id) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
    }

    // Only process completed sessions (trials have "no_payment_required" status)
    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return NextResponse.json(
        { error: "Payment not completed", status: session.payment_status },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Check if we already processed this session (idempotency)
    const { data: agency } = await admin
      .from("agencies")
      .select("id, plan, stripe_subscription_id, owner_email, name")
      .eq("id", agencyId)
      .single();

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as { id?: string } | null)?.id;

    // If subscription already matches, we already processed this
    if (agency.stripe_subscription_id === subscriptionId) {
      return NextResponse.json({
        data: { already_processed: true, plan: agency.plan },
      });
    }

    // Get subscription details to find the plan
    let planKey = "solo";
    let plan = PLANS.solo;

    let isTrialing = false;

    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      isTrialing = sub.status === "trialing";
      const priceId = sub.items.data[0]?.price?.id;
      const resolved = priceId ? getPlanByPriceId(priceId) : null;
      if (resolved) {
        planKey = resolved;
        plan = PLANS[resolved];
      }
    }

    const creditsToGrant = isTrialing ? plan.trialCredits : plan.monthlyCredits;

    // Update agency: plan, subscription, credits, limits
    await admin
      .from("agencies")
      .update({
        plan: planKey,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id:
          typeof session.customer === "string"
            ? session.customer
            : (session.customer as { id?: string } | null)?.id || null,
        credits_balance: creditsToGrant,
        max_clients: plan.maxClients,
        max_keywords_per_client: plan.maxKeywordsPerClient,
        is_active: true,
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
    await admin
      .from("users")
      .update({ role: "agency_owner" })
      .eq("agency_id", agencyId)
      .eq("role", "prospect");

    // Send plan activation email (fire-and-forget)
    if (agency.owner_email) {
      sendPlanActivatedEmail(
        agency.owner_email,
        plan.name,
        creditsToGrant,
        agency.name
      ).catch((err) => console.error("[VerifyCheckout] Email failed:", err));
    }

    return NextResponse.json({
      data: {
        plan: planKey,
        credits: creditsToGrant,
        max_clients: plan.maxClients,
        is_trialing: isTrialing,
      },
    });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
