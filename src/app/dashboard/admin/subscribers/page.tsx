"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SubscriberTable } from "@/components/admin/subscriber-table";

interface Agency {
  id: string;
  name: string;
  owner_email: string;
  plan: string;
  subscription_status: string;
  credits_balance: number;
  client_count?: number;
  user_count?: number;
  last_active_at?: string;
  created_at: string;
}

interface Filters {
  plan?: string;
  status?: string;
  search?: string;
}

export default function SubscribersPage() {
  const router = useRouter();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (filters.plan) params.set("plan", filters.plan);
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load subscribers");

      const json = await res.json();
      setAgencies(json.agencies ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscribers</h1>
        <p className="text-sm text-muted-foreground">
          All agencies and their subscription details
        </p>
      </div>

      <div
        onClick={(e) => {
          const row = (e.target as HTMLElement).closest("tr[data-agency-id]");
          if (row) {
            const agencyId = row.getAttribute("data-agency-id");
            if (agencyId) {
              router.push(`/dashboard/admin/subscribers/${agencyId}`);
            }
          }
        }}
      >
        <SubscriberTable
          agencies={agencies}
          total={total}
          page={page}
          limit={25}
          onPageChange={(p) => setPage(p)}
          onFilterChange={(f) => setFilters(f)}
          loading={loading}
        />
      </div>
    </div>
  );
}
