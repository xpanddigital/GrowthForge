"use client";

import { useEffect, useState, useCallback } from "react";
import { Network, Sparkles, Copy, Check, Save, CheckCircle2 } from "lucide-react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface CanonicalData {
  id: string;
  canonical_name: string;
  canonical_description: string;
  canonical_tagline: string;
  canonical_category: string;
  canonical_subcategories: string[];
  canonical_founding_year: number | null;
  canonical_founder_name: string;
  canonical_employee_count: string;
  canonical_service_areas: string[];
  status: "draft" | "approved";
  version: number;
  platformDescriptions?: Record<string, string>;
}

interface FormState {
  canonical_name: string;
  canonical_description: string;
  canonical_tagline: string;
  canonical_category: string;
  canonical_subcategories: string;
  canonical_founding_year: string;
  canonical_founder_name: string;
  canonical_employee_count: string;
  canonical_service_areas: string;
}

const CATEGORY_OPTIONS = [
  "Technology",
  "SaaS",
  "E-commerce",
  "Marketing Agency",
  "Legal Services",
  "Financial Services",
  "Healthcare",
  "Education",
  "Real Estate",
  "Entertainment",
  "Music",
  "Food & Beverage",
  "Professional Services",
  "Manufacturing",
  "Consulting",
  "Nonprofit",
  "Other",
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function CanonicalPage() {
  useEffect(() => { document.title = "Entity Sync — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [canonical, setCanonical] = useState<CanonicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [regeneratingDescriptions, setRegeneratingDescriptions] = useState(false);
  const [approving, setApproving] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    canonical_name: "",
    canonical_description: "",
    canonical_tagline: "",
    canonical_category: "",
    canonical_subcategories: "",
    canonical_founding_year: "",
    canonical_founder_name: "",
    canonical_employee_count: "",
    canonical_service_areas: "",
  });

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/entity/canonical?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        const c = data.canonical;
        if (c) {
          setCanonical(c);
          setForm({
            canonical_name: c.canonical_name || "",
            canonical_description: c.canonical_description || "",
            canonical_tagline: c.canonical_tagline || "",
            canonical_category: c.canonical_category || "",
            canonical_subcategories: (c.canonical_subcategories || []).join(", "),
            canonical_founding_year: c.canonical_founding_year?.toString() || "",
            canonical_founder_name: c.canonical_founder_name || "",
            canonical_employee_count: c.canonical_employee_count || "",
            canonical_service_areas: (c.canonical_service_areas || []).join(", "),
          });
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    if (!selectedClientId) return;
    setSaving(true);
    try {
      const payload = {
        clientId: selectedClientId,
        canonical_name: form.canonical_name,
        canonical_description: form.canonical_description,
        canonical_tagline: form.canonical_tagline,
        canonical_category: form.canonical_category,
        canonical_subcategories: form.canonical_subcategories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        canonical_founding_year: form.canonical_founding_year
          ? parseInt(form.canonical_founding_year, 10)
          : null,
        canonical_founder_name: form.canonical_founder_name,
        canonical_employee_count: form.canonical_employee_count,
        canonical_service_areas: form.canonical_service_areas
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await fetch("/api/entity/canonical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadData();
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!canonical?.id) return;
    setApproving(true);
    try {
      await fetch(`/api/entity/canonical/${canonical.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      await loadData();
    } catch {
      // handle error
    } finally {
      setApproving(false);
    }
  };

  const handleAutoGenerate = async () => {
    if (!selectedClientId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/entity/canonical/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch {
      // handle error
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateDescriptions = async () => {
    if (!selectedClientId) return;
    setRegeneratingDescriptions(true);
    try {
      const res = await fetch("/api/entity/canonical/descriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch {
      // handle error
    } finally {
      setRegeneratingDescriptions(false);
    }
  };

  const handleCopyPlatformDescription = async (platform: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch {
      // fallback
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Canonical Brand Identity</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Network}
            title="No client selected"
            description="Select a client to manage their canonical brand identity."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Canonical Brand Identity</h2>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 h-96 animate-pulse" />
      </div>
    );
  }

  const descriptionWordCount = countWords(form.canonical_description);
  const wordCountColor =
    descriptionWordCount >= 150 && descriptionWordCount <= 250
      ? "text-emerald-500"
      : descriptionWordCount > 250
        ? "text-red-500"
        : "text-amber-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Canonical Brand Identity</h2>
          <p className="text-sm text-muted-foreground">
            Define {selectedClientName}&apos;s authoritative brand description
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canonical && (
            <div className="flex items-center gap-2 mr-2">
              {canonical.status === "approved" ? (
                <Badge variant="default" className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15">
                  Approved (v{canonical.version})
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 border-amber-500/20 hover:bg-amber-500/15">
                  Draft (v{canonical.version})
                </Badge>
              )}
            </div>
          )}
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generating ? "Generating..." : "Auto-Generate from Brief"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Canonical Name</label>
          <input
            type="text"
            value={form.canonical_name}
            onChange={(e) => handleFieldChange("canonical_name", e.target.value)}
            placeholder="e.g. ABC Music"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Canonical Description</label>
            <span className={`text-xs ${wordCountColor}`}>
              {descriptionWordCount} words (target: 150-250)
            </span>
          </div>
          <textarea
            value={form.canonical_description}
            onChange={(e) => handleFieldChange("canonical_description", e.target.value)}
            placeholder="The definitive description of your brand. This is the source of truth for all platforms."
            rows={6}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Tagline</label>
          <input
            type="text"
            value={form.canonical_tagline}
            onChange={(e) => handleFieldChange("canonical_tagline", e.target.value)}
            placeholder="e.g. Empowering independent musicians"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Category</label>
          <select
            value={form.canonical_category}
            onChange={(e) => handleFieldChange("canonical_category", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select a category...</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategories */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Subcategories</label>
          <input
            type="text"
            value={form.canonical_subcategories}
            onChange={(e) => handleFieldChange("canonical_subcategories", e.target.value)}
            placeholder="e.g. Music Distribution, Licensing, Artist Services (comma-separated)"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">Separate multiple subcategories with commas</p>
        </div>

        {/* Two-column row: Founding Year + Founder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Founding Year</label>
            <input
              type="text"
              value={form.canonical_founding_year}
              onChange={(e) => handleFieldChange("canonical_founding_year", e.target.value)}
              placeholder="e.g. 2019"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Founder Name</label>
            <input
              type="text"
              value={form.canonical_founder_name}
              onChange={(e) => handleFieldChange("canonical_founder_name", e.target.value)}
              placeholder="e.g. Jane Smith"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Two-column row: Employee Count + Service Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Employee Count</label>
            <input
              type="text"
              value={form.canonical_employee_count}
              onChange={(e) => handleFieldChange("canonical_employee_count", e.target.value)}
              placeholder="e.g. 11-50"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Service Areas</label>
            <input
              type="text"
              value={form.canonical_service_areas}
              onChange={(e) => handleFieldChange("canonical_service_areas", e.target.value)}
              placeholder="e.g. USA, UK, Australia (comma-separated)"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground">Separate multiple areas with commas</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          {canonical && canonical.status === "draft" && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {approving ? "Approving..." : "Approve"}
            </button>
          )}
        </div>
      </div>

      {/* Platform Descriptions */}
      {canonical?.platformDescriptions && Object.keys(canonical.platformDescriptions).length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Platform-Specific Descriptions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tailored versions of your canonical description for each platform
              </p>
            </div>
            <button
              onClick={handleRegenerateDescriptions}
              disabled={regeneratingDescriptions}
              className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {regeneratingDescriptions ? "Regenerating..." : "Regenerate Descriptions"}
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(canonical.platformDescriptions).map(([platform, description]) => (
              <div
                key={platform}
                className="rounded-md border border-border bg-background p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground capitalize">{platform}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {description.length} chars
                    </span>
                    <button
                      onClick={() => handleCopyPlatformDescription(platform, description)}
                      className="p-1 rounded hover:bg-muted/40 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedPlatform === platform ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
