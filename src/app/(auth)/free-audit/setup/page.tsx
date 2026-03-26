"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { KeywordPicker } from "@/components/free-audit/keyword-picker";
import { CompetitorInput } from "@/components/free-audit/competitor-input";

type Step = 1 | 2 | 3;

export default function FreeAuditSetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Client data
  const [clientId, setClientId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");

  // Keywords & competitors
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<string[]>(["", "", ""]);

  // Load user data and auto-created client on mount
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/free-audit");
        return;
      }

      // Get the auto-created client
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, website_url, brand_brief")
        .eq("created_by_signup", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (clients && clients.length > 0) {
        setClientId(clients[0].id);
        setCompanyName(clients[0].name);
        setWebsiteUrl(clients[0].website_url || "");
      } else {
        // Fallback: get from user metadata
        setCompanyName(user.user_metadata?.company_name || "");
        setWebsiteUrl(user.user_metadata?.website_url || "");
      }

      // Check if there's already an audit running/completed
      if (clients && clients.length > 0) {
        const { data: existingAudits } = await supabase
          .from("audits")
          .select("id, status")
          .eq("client_id", clients[0].id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (existingAudits && existingAudits.length > 0) {
          const audit = existingAudits[0];
          if (audit.status === "completed") {
            router.push(`/free-audit/results/${audit.id}`);
            return;
          } else if (audit.status === "running" || audit.status === "pending") {
            router.push(`/free-audit/progress?audit_id=${audit.id}`);
            return;
          }
        }
      }

      setLoading(false);
    }

    loadData();
  }, [supabase, router]);

  async function handleSubmit() {
    if (selectedKeywords.length < 3) {
      setError("Please select at least 3 keywords");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Update client record if description was added
      if (clientId && description) {
        await supabase
          .from("clients")
          .update({
            brand_brief: `${companyName} — ${description}`,
            website_url: websiteUrl,
          })
          .eq("id", clientId);
      }

      // If no client exists yet, we need to create one
      let finalClientId = clientId;
      if (!finalClientId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: userRow } = await supabase
          .from("users")
          .select("agency_id")
          .eq("id", user.id)
          .single();

        if (!userRow) throw new Error("User not found");

        const slug = companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        const { data: newClient } = await supabase
          .from("clients")
          .insert({
            agency_id: userRow.agency_id,
            name: companyName,
            slug: slug || "my-business",
            website_url: websiteUrl,
            brand_brief: description
              ? `${companyName} — ${description}`
              : `${companyName} — visit ${websiteUrl} for more.`,
            created_by_signup: true,
          })
          .select("id")
          .single();

        if (newClient) {
          finalClientId = newClient.id;
        }
      }

      if (!finalClientId) {
        throw new Error("Failed to create client");
      }

      // Trigger the audit
      const res = await fetch("/api/free-audit/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: finalClientId,
          keywords: selectedKeywords,
          competitors: competitors.filter((c) => c.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger audit");
      }

      router.push(`/free-audit/progress?audit_id=${data.data.auditId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your audit setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Growth</span>Forge
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your AI Visibility Audit
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Business Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Confirm your business details</h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ll use this to tailor your audit and keyword suggestions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Website URL</label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Brief description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your business do? Who do you serve?"
                  rows={3}
                  maxLength={500}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!companyName || !websiteUrl}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Keywords */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Choose your target keywords</h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ve suggested keywords based on your business. Select at least 3.
              </p>
            </div>

            <KeywordPicker
              websiteUrl={websiteUrl}
              companyName={companyName}
              selectedKeywords={selectedKeywords}
              onKeywordsChange={setSelectedKeywords}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedKeywords.length < 3}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Competitors */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Add competitors</h2>
              <p className="text-sm text-muted-foreground">
                Optional — we&apos;ll compare your AI visibility against theirs.
              </p>
            </div>

            <CompetitorInput
              competitors={competitors}
              onCompetitorsChange={setCompetitors}
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Starting audit...
                  </>
                ) : (
                  "Start Audit"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
