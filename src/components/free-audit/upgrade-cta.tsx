"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PLANS = [
  {
    key: "solo",
    name: "Solo",
    price: "$97/mo",
    credits: "500 credits",
    features: ["1 website", "20 keywords", "All features included"],
  },
  {
    key: "growth",
    name: "Growth",
    price: "$297/mo",
    credits: "2,500 credits",
    features: ["5 websites", "50 keywords", "All features included"],
    popular: true,
  },
  {
    key: "agency",
    name: "Agency",
    price: "$397/mo",
    credits: "7,500 credits",
    features: ["15 websites", "100 keywords", "White-label reports"],
  },
];

export function UpgradeCTA() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(planKey: string) {
    setLoading(planKey);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const priceId = getPriceId(planKey);
      if (!priceId) {
        setError("Plan not available yet. Please book a call to get started.");
        setLoading(null);
        return;
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          trial_period_days: 14,
          success_url: `${window.location.origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/free-audit/results/${window.location.pathname.split("/").pop()}`,
        }),
      });

      const result = await response.json();

      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setError(result.error || "Failed to start checkout");
        setLoading(null);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Ready to improve your AI visibility?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          MentionLayer automates citation seeding, AI monitoring, entity optimization,
          and press distribution — everything in your action plan, handled for you.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500 text-center">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`rounded-xl border p-5 space-y-3 ${
              plan.popular
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Most Popular
              </span>
            )}
            <div>
              <h4 className="font-semibold">{plan.name}</h4>
              <p className="text-2xl font-bold">{plan.price}</p>
              <p className="text-xs text-muted-foreground">{plan.credits}/month</p>
            </div>
            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="h-3.5 w-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.key)}
              disabled={loading !== null}
              className={`w-full h-9 rounded-md text-sm font-medium transition-colors ${
                plan.popular
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted hover:bg-muted/80"
              } ${loading === plan.key ? "opacity-50" : ""}`}
            >
              {loading === plan.key ? "Redirecting..." : `Start ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href="https://xpanddigital.io/book-a-call"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Need a custom plan? Book a strategy call →
        </a>
      </div>
    </div>
  );
}

function getPriceId(planKey: string): string | null {
  // These are exposed as NEXT_PUBLIC_ env vars for client-side access
  const mapping: Record<string, string | undefined> = {
    solo: process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO,
    growth: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH,
    agency: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY,
    agency_pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_PRO,
  };
  return mapping[planKey] || null;
}
