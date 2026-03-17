"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Building2,
  CreditCard,
  Key,
  Bell,
  Globe,
  Loader2,
  Save,
  CheckCircle2,
  Zap,
  Database,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Agency } from "@/types/database";

export default function SettingsPage() {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchAgency() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!userData) return;

      const { data: agencyData } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", userData.agency_id)
        .single();

      if (agencyData) {
        setAgency(agencyData);
        setAgencyName(agencyData.name);
        setOwnerEmail(agencyData.owner_email);
      }
      setLoading(false);
    }
    fetchAgency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveGeneral() {
    if (!agency) return;
    setSaving(true);

    await supabase
      .from("agencies")
      .update({ name: agencyName, owner_email: ownerEmail })
      .eq("id", agency.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your agency configuration, API keys, and billing.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-1.5">
            <Key className="h-3.5 w-3.5" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold">Agency Profile</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Agency Name
                </label>
                <Input
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Owner Email
                </label>
                <Input
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Agency Slug
                </label>
                <Input
                  value={agency?.slug || ""}
                  disabled
                  className="bg-muted/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Plan
                </label>
                <div className="flex h-10 items-center gap-2">
                  <Badge className="bg-primary/10 text-primary">
                    {agency?.plan === "agency_unlimited"
                      ? "Agency Unlimited"
                      : agency?.plan || "Free"}
                  </Badge>
                  {agency?.is_platform_owner && (
                    <Badge className="bg-amber-400/10 text-amber-400">
                      Platform Owner
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={handleSaveGeneral}
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold">Limits</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Max Clients</p>
                <p className="mt-1 text-2xl font-bold">
                  {agency?.max_clients || 0}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">
                  Keywords per Client
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {agency?.max_keywords_per_client || 0}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Credits Balance</p>
                <p className="mt-1 text-2xl font-bold">
                  {agency?.credits_balance?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-1 text-sm font-semibold">API Connections</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Configure external service API keys. Keys are configured via
              environment variables.
            </p>

            <div className="space-y-3">
              {[
                {
                  name: "Anthropic (Claude)",
                  icon: Bot,
                  envKey: "ANTHROPIC_API_KEY",
                  status: "connected",
                  description: "Classification + Response Generation",
                },
                {
                  name: "Apify",
                  icon: Globe,
                  envKey: "APIFY_API_TOKEN",
                  status: "connected",
                  description: "SERP Scanning + Thread Enrichment",
                },
                {
                  name: "Perplexity",
                  icon: Zap,
                  envKey: "PERPLEXITY_API_KEY",
                  status: "connected",
                  description: "AI Probing + Citation Discovery",
                },
                {
                  name: "OpenAI",
                  icon: Bot,
                  envKey: "OPENAI_API_KEY",
                  status: "connected",
                  description: "ChatGPT Citation Detection",
                },
                {
                  name: "Supabase",
                  icon: Database,
                  envKey: "SUPABASE_SERVICE_ROLE_KEY",
                  status: "connected",
                  description: "Database + Auth",
                },
                {
                  name: "Resend",
                  icon: Bell,
                  envKey: "RESEND_API_KEY",
                  status: "not_configured",
                  description: "Transactional Emails",
                },
                {
                  name: "Stripe",
                  icon: CreditCard,
                  envKey: "STRIPE_SECRET_KEY",
                  status: "not_configured",
                  description: "Billing (Phase 3)",
                },
              ].map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.name}
                    className="flex items-center justify-between rounded-md border border-border bg-background p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-muted p-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={
                          service.status === "connected"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {service.status === "connected"
                          ? "Connected"
                          : "Not configured"}
                      </Badge>
                      <code className="hidden text-xs text-muted-foreground sm:block">
                        {service.envKey}
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Update your{" "}
              <code className="rounded bg-muted px-1 py-0.5">.env.local</code>{" "}
              file and restart the server to apply changes.
            </p>
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-1 text-sm font-semibold">Current Plan</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Manage your subscription and credit usage.
            </p>

            <div className="rounded-md border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="mb-2 bg-primary/10 text-primary">
                    Agency Unlimited
                  </Badge>
                  <p className="text-2xl font-bold">Phase 1 — Free</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Unlimited credits, unlimited clients during development.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Credits remaining
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {agency?.credits_balance?.toLocaleString() || "∞"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-background p-4 text-center">
                <p className="text-xs text-muted-foreground">SERP Scan</p>
                <p className="mt-1 text-lg font-bold">1 credit</p>
                <p className="text-xs text-muted-foreground">per keyword</p>
              </div>
              <div className="rounded-md border border-border bg-background p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Response Generation
                </p>
                <p className="mt-1 text-lg font-bold">10 credits</p>
                <p className="text-xs text-muted-foreground">3 variants</p>
              </div>
              <div className="rounded-md border border-border bg-background p-4 text-center">
                <p className="text-xs text-muted-foreground">Full Audit</p>
                <p className="mt-1 text-lg font-bold">50 credits</p>
                <p className="text-xs text-muted-foreground">5 pillars</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Credit-based billing with Stripe will be available in Phase 3.
            </p>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-1 text-sm font-semibold">
              Notification Preferences
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Configure how and when you receive notifications.
            </p>

            <div className="space-y-4">
              {[
                {
                  label: "Discovery scan completed",
                  description:
                    "Get notified when a scheduled or manual scan finishes",
                  enabled: true,
                },
                {
                  label: "Responses ready for review",
                  description:
                    "New AI-generated responses are ready in the queue",
                  enabled: true,
                },
                {
                  label: "Audit completed",
                  description: "AI Visibility Audit results are ready",
                  enabled: true,
                },
                {
                  label: "Weekly performance digest",
                  description: "Summary of citation activity and metrics",
                  enabled: false,
                },
                {
                  label: "Credit usage alerts",
                  description:
                    "Warnings when credit balance drops below threshold",
                  enabled: true,
                },
              ].map((pref) => (
                <div
                  key={pref.label}
                  className="flex items-center justify-between rounded-md border border-border bg-background p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {pref.description}
                    </p>
                  </div>
                  <button
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      pref.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        pref.enabled ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Email notifications powered by Resend. Slack integration coming in
              Phase 2.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
