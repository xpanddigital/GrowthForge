"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Building2, Plus, Globe, Key } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { Client } from "@/types/database";

interface ClientWithCount extends Client {
  keyword_count: number;
}

export default function ClientsPage() {
  useEffect(() => { document.title = "Clients — MentionLayer"; }, []);

  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase
        .from("clients")
        .select("*, keywords(count)")
        .order("name");

      if (data) {
        const transformed = data.map((c) => ({
          ...c,
          keyword_count:
            (c.keywords as unknown as { count: number }[])?.[0]?.count ?? 0,
          keywords: undefined,
        })) as ClientWithCount[];
        setClients(transformed);
      }
      setLoading(false);
    }
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-lg border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Clients</h2>
          <p className="text-sm text-muted-foreground">
            Manage your client brands and their keywords.
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          description="Add your first client to start discovering high-authority threads."
          action={
            <Link
              href="/dashboard/clients/new"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">
                      {client.name}
                    </h3>
                    {client.website_url && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {client.website_url.replace(/^https?:\/\//, "")}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    client.is_active
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {client.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {client.brand_brief}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <Key className="h-3 w-3" />
                {client.keyword_count} keywords
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
