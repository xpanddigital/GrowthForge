"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/lib/billing/plans";
import type { PlanId } from "@/lib/billing/plans";
import Link from "next/link";

function getPriceId(planKey: string): string | null {
  const mapping: Record<string, string | undefined> = {
    solo: process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO,
    growth: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH,
    agency: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY,
    agency_pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_PRO,
  };
  return mapping[planKey] || null;
}

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan");

  useEffect(() => { document.title = "Sign Up \u2014 MentionLayer"; }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const supabase = createClient();

  // Redirect to plan selection if no plan chosen
  if (!plan) {
    router.push("/signup/plan");
    return null;
  }

  const planConfig = PLANS[plan as PlanId];
  const planName = planConfig?.name || plan;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    // Password signup — create account, then redirect to Stripe
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          agency_name: agencyName || undefined,
          selected_plan: plan,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setIsError(true);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Sign in immediately so we have a session for the checkout call
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If email confirmation is required, use server-side checkout
        try {
          const checkoutRes = await fetch("/api/billing/signup-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              full_name: fullName,
              agency_name: agencyName || undefined,
              user_id: data.user.id,
              plan,
              price_id: plan ? getPriceId(plan) : null,
            }),
          });

          const checkoutResult = await checkoutRes.json();
          if (checkoutResult.data?.url) {
            window.location.href = checkoutResult.data.url;
            return;
          }
        } catch {
          // Fall through to message
        }

        setMessage("Account created! Check your email to confirm, then sign in to start your trial.");
        setLoading(false);
        return;
      }

      // Session available — create user row + redirect to Stripe
      await fetch("/api/auth/ensure-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agency_name: agencyName || undefined }),
      });

      const priceId = plan ? getPriceId(plan) : null;
      if (!priceId) {
        window.location.href = "/dashboard/onboarding";
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/dashboard/onboarding";
        return;
      }

      try {
        const checkoutRes = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            trial_period_days: 14,
            success_url: `${window.location.origin}/dashboard/onboarding?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${window.location.origin}/signup?plan=${plan}`,
          }),
        });

        const checkoutResult = await checkoutRes.json();
        if (checkoutResult.data?.url) {
          window.location.href = checkoutResult.data.url;
          return;
        }
      } catch {
        // Fall back to onboarding
      }

      window.location.href = "/dashboard/onboarding";
      return;
    }

    setMessage("Account created! Check your email to confirm, then sign in to start your trial.");
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-sm space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Mention</span>Layer
          </h1>
          <p className="text-sm text-muted-foreground">
            Start your 14-day {planName} trial
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="text-sm font-medium leading-none"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Joel House"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="agencyName"
              className="text-sm font-medium leading-none"
            >
              Agency Name
            </label>
            <input
              id="agencyName"
              type="text"
              placeholder="Your Agency"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Optional &mdash; we&apos;ll create one from your name if left blank.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Continue to payment"}
          </button>
        </form>

        {message && (
          <p
            className={`text-center text-sm ${
              isError ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          14-day free trial. Cancel anytime before you&apos;re charged.
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
