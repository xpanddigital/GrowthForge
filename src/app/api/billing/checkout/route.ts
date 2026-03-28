import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/billing/stripe";
import { handleApiError } from "@/lib/utils/errors";
import { z } from "zod";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  price_id: z.string(),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
  trial_period_days: z.number().optional(),
});

// POST /api/billing/checkout — Create a Stripe Checkout session
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("agency_id, role")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Allow prospects to upgrade (they become agency_owner after checkout)
    if (!["agency_owner", "platform_admin", "prospect"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only agency owners can manage billing" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    const { data: agency } = await supabase
      .from("agencies")
      .select("id, name, owner_email, stripe_customer_id")
      .eq("id", user.agency_id)
      .single();

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create or reuse Stripe customer
    let customerId = agency.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: agency.owner_email,
        name: agency.name,
        metadata: { agency_id: agency.id },
      });
      customerId = customer.id;

      await supabase
        .from("agencies")
        .update({ stripe_customer_id: customerId })
        .eq("id", agency.id);
    }

    // Create checkout session
    const defaultSuccessUrl = validated.trial_period_days
      ? `${appUrl}/dashboard/onboarding?checkout=success&session_id={CHECKOUT_SESSION_ID}`
      : `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: validated.price_id, quantity: 1 }],
      success_url: validated.success_url || defaultSuccessUrl,
      cancel_url:
        validated.cancel_url ||
        `${appUrl}/dashboard/settings?tab=billing&checkout=cancelled`,
      metadata: { agency_id: agency.id },
      subscription_data: {
        metadata: { agency_id: agency.id },
        trial_period_days: validated.trial_period_days || undefined,
      },
    });

    return NextResponse.json({ data: { url: session.url } });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
