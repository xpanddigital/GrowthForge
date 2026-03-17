"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client } from "@/types/database";
import { X } from "lucide-react";

interface ClientFormProps {
  client?: Client;
  mode: "create" | "edit";
}

export function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(client?.name || "");
  const [websiteUrl, setWebsiteUrl] = useState(client?.website_url || "");
  const [brandBrief, setBrandBrief] = useState(client?.brand_brief || "");
  const [toneGuidelines, setToneGuidelines] = useState(
    client?.tone_guidelines || ""
  );
  const [targetAudience, setTargetAudience] = useState(
    client?.target_audience || ""
  );
  const [keyDifferentiators, setKeyDifferentiators] = useState(
    client?.key_differentiators || ""
  );
  const [urlsToMention, setUrlsToMention] = useState<string[]>(
    client?.urls_to_mention || []
  );
  const [newUrl, setNewUrl] = useState("");
  const [responseRules, setResponseRules] = useState(
    client?.response_rules || ""
  );

  function addUrl() {
    const trimmed = newUrl.trim();
    if (trimmed && !urlsToMention.includes(trimmed)) {
      setUrlsToMention([...urlsToMention, trimmed]);
      setNewUrl("");
    }
  }

  function removeUrl(url: string) {
    setUrlsToMention(urlsToMention.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name,
      website_url: websiteUrl || undefined,
      brand_brief: brandBrief,
      tone_guidelines: toneGuidelines || undefined,
      target_audience: targetAudience || undefined,
      key_differentiators: keyDifferentiators || undefined,
      urls_to_mention: urlsToMention,
      response_rules: responseRules || undefined,
    };

    try {
      const url =
        mode === "create"
          ? "/api/clients"
          : `/api/clients/${client?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(
        mode === "create"
          ? `/dashboard/clients/${result.data.id}`
          : `/dashboard/clients/${client?.id}`
      );
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Client Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. RUN Music"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Website URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Website URL</label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Brand Brief */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Brand Brief <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Describe the business in 250 words or less. Include what they do, who
          they serve, and what makes them different. This is injected into every
          AI prompt.
        </p>
        <textarea
          value={brandBrief}
          onChange={(e) => setBrandBrief(e.target.value)}
          placeholder="Money for musicians through simple, data-driven licensing deals..."
          required
          rows={5}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground text-right">
          {brandBrief.split(/\s+/).filter(Boolean).length} / 250 words
        </p>
      </div>

      {/* Tone Guidelines */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tone Guidelines</label>
        <textarea
          value={toneGuidelines}
          onChange={(e) => setToneGuidelines(e.target.value)}
          placeholder="Casual and helpful. Never salesy. Use specific numbers..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Target Audience */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Audience</label>
        <textarea
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="Independent musicians aged 20-35 looking for..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Key Differentiators */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Key Differentiators</label>
        <textarea
          value={keyDifferentiators}
          onChange={(e) => setKeyDifferentiators(e.target.value)}
          placeholder="Transparent short-term financing. No exclusivity required..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* URLs to Mention */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          URLs to Mention (use sparingly)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com/page"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={addUrl}
            className="h-10 rounded-md border border-input px-3 text-sm hover:bg-accent"
          >
            Add
          </button>
        </div>
        {urlsToMention.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {urlsToMention.map((url) => (
              <span
                key={url}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs"
              >
                {url}
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Response Rules */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Response Rules</label>
        <textarea
          value={responseRules}
          onChange={(e) => setResponseRules(e.target.value)}
          placeholder="Never mention pricing. Always suggest they 'check out' rather than 'sign up for'..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Client"
              : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-10 items-center rounded-md border border-input px-6 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
