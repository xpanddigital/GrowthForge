"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Building2, Search, BarChart3, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "client" | "keywords" | "audit" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Client step
  const [clientName, setClientName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandBrief, setBrandBrief] = useState("");
  const [clientId, setClientId] = useState("");

  // Keywords step
  const [keywordsText, setKeywordsText] = useState("");

  // Audit step
  const [auditStarted, setAuditStarted] = useState(false);

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: clientName,
        website_url: websiteUrl || undefined,
        brand_brief: brandBrief || `${clientName} is a business that serves its customers.`,
        slug: clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create client");
      setLoading(false);
      return;
    }

    setClientId(data.data.id);
    setLoading(false);
    setStep("keywords");
  }

  async function handleAddKeywords(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const keywords = keywordsText
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .map((keyword) => ({ keyword }));

    if (keywords.length === 0) {
      setError("Add at least one keyword");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, keywords }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add keywords");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("audit");
  }

  async function handleRunAudit() {
    setLoading(true);
    setError("");
    setAuditStarted(true);

    const res = await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, audit_type: "quick" }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to start audit");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("done");
  }

  function handleGoToDashboard() {
    router.push("/dashboard");
  }

  const steps = [
    { key: "client", label: "Add Client", icon: Building2 },
    { key: "keywords", label: "Add Keywords", icon: Search },
    { key: "audit", label: "Run Audit", icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to <span className="text-primary">Growth</span>Forge
        </h1>
        <p className="mt-2 text-muted-foreground">
          Let&apos;s set up your first client in 3 quick steps.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map(({ key, label, icon: Icon }, i) => {
          const isActive = step === key;
          const isDone =
            steps.findIndex((s) => s.key === step) > i || step === "done";
          return (
            <div key={key} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`h-px w-8 ${isDone ? "bg-primary" : "bg-border"}`}
                />
              )}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone && !isActive ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1: Add Client */}
      {step === "client" && (
        <form onSubmit={handleCreateClient} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Add your first client</h2>
          <p className="text-sm text-muted-foreground">
            This is the brand you want AI models to recommend.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand / Company Name *</label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Website URL</label>
            <Input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://acmecorp.com"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand Brief</label>
            <textarea
              value={brandBrief}
              onChange={(e) => setBrandBrief(e.target.value)}
              placeholder="Describe what this business does, who it serves, and what makes it different. This powers the AI response quality."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              250 words or less. You can refine this later.
            </p>
          </div>

          <Button type="submit" disabled={loading || !clientName} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {loading ? "Creating..." : "Next: Add Keywords"}
          </Button>
        </form>
      )}

      {/* Step 2: Add Keywords */}
      {step === "keywords" && (
        <form onSubmit={handleAddKeywords} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Add keywords for {clientName}</h2>
          <p className="text-sm text-muted-foreground">
            These are the topics you want this brand to appear for in AI answers.
            Enter one keyword per line.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords (one per line) *</label>
            <textarea
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder={"best project management tools\nproject management for agencies\nalternatives to Monday.com\ntask management software\nteam collaboration tools"}
              rows={8}
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Include buying-intent keywords like &quot;best [category]&quot;,
              &quot;[category] alternatives&quot;, &quot;[category] for [audience]&quot;.
            </p>
          </div>

          <Button type="submit" disabled={loading || !keywordsText.trim()} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {loading ? "Adding keywords..." : "Next: Run AI Audit"}
          </Button>
        </form>
      )}

      {/* Step 3: Run Audit */}
      {step === "audit" && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-lg font-semibold">Run your first AI Visibility Audit</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We&apos;ll scan how {clientName} currently appears across ChatGPT,
            Perplexity, Gemini, and Claude — plus check citations, entity consistency,
            and more. Takes about 3-5 minutes.
          </p>

          <Button
            onClick={handleRunAudit}
            disabled={loading || auditStarted}
            size="lg"
            className="w-full max-w-xs"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="mr-2 h-4 w-4" />
            )}
            {loading ? "Starting audit..." : "Run Free AI Audit"}
          </Button>

          <button
            type="button"
            onClick={handleGoToDashboard}
            className="block w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="text-lg font-semibold">You&apos;re all set!</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your AI Visibility Audit is running in the background. You&apos;ll see
            results on the Audits page in a few minutes. In the meantime, explore
            your dashboard.
          </p>

          <Button onClick={handleGoToDashboard} size="lg" className="w-full max-w-xs">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
