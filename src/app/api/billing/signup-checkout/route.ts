import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/billing/stripe";
import { handleApiError } from "@/lib/utils/errors";
import { PLANS } from "@/lib/billing/plans";
import type { PlanId } from "@/lib/billing/plans";
import { z } from "zod";

export const dynamic = "force-dynamic";

const signupCheckoutSchema = z.object({
  email: z.string().email(),
  full_name: z.string().optional(),
  agency_name: z.string().optional(),
  user_id: z.string().uuid(),
  plan: z.string(),
  price_id: z.string().nullable(),
});

// POST /api/billing/signup-checkout
// Creates a Stripe checkout session for a new user who hasn't confirmed email yet.
// Uses service role to create agency + user row, then creates checkout.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = signupCheckoutSchema.parse(body);

    if (!validated.price_id) {
      return NextResponse.json({ error: "No price configured for this plan" }, { status: 400 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user row already exists
    const { data: existingUser } = await adminClient
      .from("users")
      .select("id, agency_id")
      .eq("id", validated.user_id)
      .single();

    let agencyId: string;

    if (existingUser) {
      agencyId = existingUser.agency_id;
    } else {
      // Create agency
      const agencyName = validated.agency_name || validated.full_name || "My Agency";
      const slug = agencyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-agency";

      const planConfig = PLANS[validated.plan as PlanId];

      const { data: newAgency, error: agencyError } = await adminClient
        .from("agencies")
        .insert({
          name: agencyName,
          slug: `${slug}-${Date.now()}`,
          owner_email: validated.email,
          plan: validated.plan,
          credits_balance: 0,
          max_clients: planConfig?.maxClients || 5,
          max_keywords_per_client: planConfig?.maxKeywordsPerClient || 50,
          is_active: true,
        })
        .select("id")
        .single();

      if (agencyError || !newAgency) {
        return NextResponse.json({ error: "Failed to create agency" }, { status: 500 });
      }

      agencyId = newAgency.id;

      // Create user row
      await adminClient.from("users").insert({
        id: validated.user_id,
        agency_id: agencyId,
        email: validated.email,
        full_name: validated.full_name || null,
        role: "agency_owner",
      });
    }

    // Create Stripe customer + checkout session
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const customer = await stripe.customers.create({
      email: validated.email,
      name: validated.agency_name || validated.full_name || undefined,
      metadata: { agency_id: agencyId },
    });

    // Store Stripe customer ID
    await adminClient
      .from("agencies")
      .update({ stripe_customer_id: customer.id })
      .eq("id", agencyId);

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: validated.price_id, quantity: 1 }],
      success_url: `${appUrl}/dashboard/onboarding?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/signup/plan`,
      metadata: { agency_id: agencyId },
      subscription_data: {
        metadata: { agency_id: agencyId },
        trial_period_days: 14,
      },
    });

    return NextResponse.json({ data: { url: session.url } });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
