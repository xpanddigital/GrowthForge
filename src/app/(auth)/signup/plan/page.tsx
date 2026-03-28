"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PLANS,
  PUBLIC_PLANS,
  isUnlimited,
} from "@/lib/billing/plans";

export default function PlanSelectionPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Choose Your Plan \u2014 MentionLayer";
  }, []);

  const plans = PUBLIC_PLANS.map((id) => PLANS[id]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Mention</span>Layer
          </h1>
          <p className="text-lg font-medium text-foreground">
            Choose your plan
          </p>
          <p className="text-sm text-muted-foreground">
            All plans include every feature. Pick the scale that fits.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const clients = isUnlimited(plan.maxClients)
              ? "Unlimited websites"
              : `${plan.maxClients} website${plan.maxClients === 1 ? "" : "s"}`;
            const keywords = isUnlimited(plan.maxKeywordsPerClient)
              ? "Unlimited keywords"
              : `${plan.maxKeywordsPerClient} keywords per site`;
            const credits = isUnlimited(plan.monthlyCredits)
              ? "Unlimited credits"
              : `${plan.monthlyCredits.toLocaleString()} credits/mo`;
            const audits = isUnlimited(plan.maxAuditsPerMonth)
              ? "Unlimited audits"
              : `${plan.maxAuditsPerMonth} audit${plan.maxAuditsPerMonth === 1 ? "" : "s"}/mo`;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border p-6 ${
                  plan.popular
                    ? "border-primary bg-card shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.tagline}
                  </p>
                </div>

                <div className="mt-4">
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  ${plan.priceAnnualMonthly}/mo billed annually
                </p>

                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {[clients, keywords, credits, audits, "All features included"].map(
                    (feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-[#00D2D3]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    )
                  )}
                  {plan.whiteLabel && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-[#00D2D3]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>White-label reports</span>
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => router.push(`/signup?plan=${plan.id}`)}
                  className={`mt-5 block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  Start 14-day free trial
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          All plans include a 14-day free trial. Your card won&apos;t be charged
          until the trial ends.
        </p>
      </div>
    </div>
  );
}
