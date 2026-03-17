"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Client, Keyword } from "@/types/database";
import { KeywordManager } from "./keyword-manager";
import {
  Globe,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface ClientDetailProps {
  client: Client;
  keywords: Keyword[];
  maxKeywords: number;
}

export function ClientDetail({
  client,
  keywords: initialKeywords,
  maxKeywords,
}: ClientDetailProps) {
  const router = useRouter();
  const [keywords, setKeywords] = useState(initialKeywords);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${client.name}" and all associated data? This cannot be undone.`)) return;
    setDeleting(true);

    const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/clients");
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{client.name}</h2>
          {client.website_url && (
            <a
              href={client.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <Globe className="h-3.5 w-3.5" />
              {client.website_url.replace(/^https?:\/\//, "")}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/clients/${client.id}/settings`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-input px-3 text-sm hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-destructive/50 px-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Brand Brief Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Brand Brief
          </h3>
          <p className="text-sm leading-relaxed">{client.brand_brief}</p>
        </div>

        <div className="space-y-4">
          {client.tone_guidelines && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Tone Guidelines
              </h3>
              <p className="mt-2 text-sm">{client.tone_guidelines}</p>
            </div>
          )}
          {client.target_audience && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Target Audience
              </h3>
              <p className="mt-2 text-sm">{client.target_audience}</p>
            </div>
          )}
          {client.key_differentiators && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Key Differentiators
              </h3>
              <p className="mt-2 text-sm">{client.key_differentiators}</p>
            </div>
          )}
        </div>
      </div>

      {/* Keywords Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Keywords</h3>
          <span className="text-sm text-muted-foreground">
            {keywords.length} / {maxKeywords} keywords
          </span>
        </div>
        <KeywordManager
          clientId={client.id}
          keywords={keywords}
          maxKeywords={maxKeywords}
          onKeywordsChange={setKeywords}
        />
      </div>
    </div>
  );
}
