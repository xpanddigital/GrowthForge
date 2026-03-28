"use client";

import { useEffect, useState } from "react";
import { Sidebar, SidebarProvider } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { WelcomeGuide } from "@/components/onboarding/welcome-guide";
import { HelpWidget } from "@/components/help/help-widget";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

function TrialBanner() {
  const [trialInfo, setTrialInfo] = useState<{
    daysRemaining: number;
    plan: string;
    chargeDate: string;
  } | null>(null);

  useEffect(() => {
    async function checkTrialStatus() {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: dbUser } = await supabase
          .from("users")
          .select("agency_id")
          .eq("id", user.id)
          .single();
        if (!dbUser) return;

        const { data: agency } = await supabase
          .from("agencies")
          .select("plan, stripe_subscription_id, created_at")
          .eq("id", dbUser.agency_id)
          .single();
        if (!agency) return;

        // Show trial banner if no subscription ID and created within 14 days
        // OR if we detect the plan was recently activated (subscription exists but still in trial window)
        const createdAt = new Date(agency.created_at);
        const trialEnd = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        // Only show if within trial period and plan is not "starter" (free/default)
        if (daysRemaining > 0 && agency.plan && agency.plan !== "starter") {
          setTrialInfo({
            daysRemaining,
            plan: agency.plan,
            chargeDate: trialEnd.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          });
        }
      } catch {
        // Silently fail — banner is non-critical
      }
    }

    checkTrialStatus();
  }, []);

  if (!trialInfo) return null;

  const planLabel = trialInfo.plan.charAt(0).toUpperCase() + trialInfo.plan.slice(1);

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm text-white">
      <span>
        You&apos;re on a 14-day <strong>{planLabel}</strong> trial.{" "}
        {trialInfo.daysRemaining} {trialInfo.daysRemaining === 1 ? "day" : "days"} remaining.
        Your card will be charged on {trialInfo.chargeDate}.
      </span>
      <Link
        href="/dashboard/settings?tab=billing"
        className="ml-4 whitespace-nowrap text-white/90 underline underline-offset-2 hover:text-white"
      >
        Manage billing &rarr;
      </Link>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <TrialBanner />
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <WelcomeGuide />
      <HelpWidget />
    </SidebarProvider>
  );
}
