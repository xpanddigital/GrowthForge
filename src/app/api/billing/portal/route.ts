import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/billing/stripe";
import { handleApiError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

// POST /api/billing/portal — Create a Stripe Customer Portal session
export async function POST() {
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

    if (!user || !["agency_owner", "platform_admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only agency owners can manage billing" },
        { status: 403 }
      );
    }

    const { data: agency } = await supabase
      .from("agencies")
      .select("stripe_customer_id")
      .eq("id", user.agency_id)
      .single();

    if (!agency?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe to a plan first." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: agency.stripe_customer_id,
      return_url: `${appUrl}/dashboard/settings?tab=billing`,
    });

    return NextResponse.json({ data: { url: session.url } });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
