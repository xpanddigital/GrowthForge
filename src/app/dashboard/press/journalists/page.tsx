"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { JournalistTable } from "@/components/press/journalist-table";
import type { Journalist } from "@/types/database";

export default function JournalistsPage() {
  useEffect(() => { document.title = "PressForge — MentionLayer"; }, []);

  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (region !== "all") params.set("region", region);

      const res = await fetch(`/api/press/journalists?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJournalists(data.data ?? []);
        setTotal(data.total ?? (data.data ?? []).length);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, region]);

  useEffect(() => { loadData(); }, [loadData]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Journalist Database</h2>
          <p className="text-sm text-muted-foreground">
            {total} journalists across all campaigns.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or publication..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={region} onValueChange={(v) => { setRegion(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="AU">Australia</SelectItem>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="UK">United Kingdom</SelectItem>
            <SelectItem value="GLOBAL">Global</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!loading && journalists.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Users}
            title="No journalists found"
            description={search ? "Try adjusting your search criteria." : "Journalists are added automatically when you discover them for campaigns."}
          />
        </div>
      ) : (
        <JournalistTable journalists={journalists} loading={loading} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
