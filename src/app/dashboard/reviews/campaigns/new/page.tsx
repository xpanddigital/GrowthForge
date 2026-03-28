"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Megaphone } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";

const PLATFORM_OPTIONS = [
  { value: "google", label: "Google Reviews" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "g2", label: "G2" },
  { value: "capterra", label: "Capterra" },
  { value: "yelp", label: "Yelp" },
  { value: "facebook", label: "Facebook" },
];

const STEPS = [
  { label: "Campaign Details", description: "Name, platform, and target" },
  { label: "Message Template", description: "Email subject and body" },
  { label: "Recipients", description: "Add recipient list" },
];

interface FormData {
  name: string;
  description: string;
  target_platform: string;
  target_url: string;
  target_count: number;
  subject_line: string;
  message_template: string;
  recipients_csv: string;
}

export default function NewCampaignPage() {
  useEffect(() => { document.title = "Review Engine — MentionLayer"; }, []);

  const router = useRouter();
  const { selectedClientId, selectedClientName } = useClientContext();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    target_platform: "google",
    target_url: "",
    target_count: 50,
    subject_line: "",
    message_template:
      "Hi {customer_name},\n\nThank you for choosing {business_name}! We'd love to hear about your experience.\n\nIf you have a moment, could you leave us a review? It only takes a minute and helps us improve.\n\n{review_url}\n\nThank you!\n{business_name} Team",
    recipients_csv: "",
  });

  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canAdvance = () => {
    if (step === 0) return form.name.trim() && form.target_platform;
    if (step === 1) return form.subject_line.trim() && form.message_template.trim();
    if (step === 2) return true;
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedClientId) return;
    setSubmitting(true);
    try {
      // Create campaign
      const campaignRes = await fetch("/api/reviews/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          target_platform: form.target_platform,
          target_url: form.target_url.trim() || null,
          target_count: form.target_count,
          subject_line: form.subject_line.trim(),
          message_template: form.message_template.trim(),
        }),
      });

      if (campaignRes.ok) {
        const data = await campaignRes.json();
        const campaignId = data.campaign?.id || data.id;

        // Parse and submit recipients
        if (form.recipients_csv.trim() && campaignId) {
          const lines = form.recipients_csv
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
          const recipients = lines.map((line) => {
            const [name, email] = line.split(",").map((s) => s.trim());
            return { name: name || "", email: email || "" };
          }).filter((r) => r.email);

          if (recipients.length > 0) {
            await fetch(`/api/reviews/campaigns/${campaignId}/recipients`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ recipients }),
            });
          }
        }

        router.push(campaignId ? `/dashboard/reviews/campaigns/${campaignId}` : "/dashboard/reviews/campaigns");
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">New Campaign</h2>
          <p className="text-sm text-muted-foreground">
            Create a review request campaign.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Megaphone}
            title="No client selected"
            description="Select a client from the header to create a campaign."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/reviews/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Campaigns
      </Link>

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">New Review Campaign</h2>
        <p className="text-sm text-muted-foreground">
          Create a review request campaign for {selectedClientName}
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="tabular-nums">{i + 1}</span>
              )}
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-5">
        {step === 0 && (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Campaign Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="e.g. Q1 2026 Google Review Drive"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Optional description for this campaign..."
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Target Platform *</label>
                <select
                  value={form.target_platform}
                  onChange={(e) => handleFieldChange("target_platform", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Target Count</label>
                <input
                  type="number"
                  value={form.target_count}
                  onChange={(e) => handleFieldChange("target_count", parseInt(e.target.value) || 0)}
                  min={1}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Target Review URL</label>
              <input
                type="url"
                value={form.target_url}
                onChange={(e) => handleFieldChange("target_url", e.target.value)}
                placeholder="e.g. https://g.page/r/your-business/review"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                The direct link where customers can leave a review
              </p>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email Subject Line *</label>
              <input
                type="text"
                value={form.subject_line}
                onChange={(e) => handleFieldChange("subject_line", e.target.value)}
                placeholder="e.g. How was your experience with us?"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Message Template *</label>
                <span className="text-xs text-muted-foreground">
                  {form.message_template.length} chars
                </span>
              </div>
              <textarea
                value={form.message_template}
                onChange={(e) => handleFieldChange("message_template", e.target.value)}
                rows={10}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <p className="text-xs font-medium text-foreground mb-1">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {["{customer_name}", "{business_name}", "{review_url}"].map((v) => (
                    <code
                      key={v}
                      className="rounded bg-background px-1.5 py-0.5 text-[10px] font-mono text-primary border border-border"
                    >
                      {v}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Recipients (CSV)</label>
              <textarea
                value={form.recipients_csv}
                onChange={(e) => handleFieldChange("recipients_csv", e.target.value)}
                placeholder={"John Smith, john@example.com\nJane Doe, jane@example.com"}
                rows={10}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Paste one recipient per line in the format: name, email
              </p>
            </div>

            {form.recipients_csv.trim() && (
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {form.recipients_csv.split("\n").filter((l) => l.trim()).length}
                  </span>{" "}
                  recipients detected
                </p>
              </div>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {submitting ? "Creating..." : "Create Campaign"}
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
