"use client";

import { cn } from "@/lib/utils";
import { Search, Play, Loader2 } from "lucide-react";

interface ThreadFiltersProps {
  platform: string;
  setPlatform: (v: string) => void;
  intent: string;
  setIntent: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  threadCount: number;
  onRunScan: () => void;
  isScanRunning: boolean;
}

const selectClassName =
  "flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none cursor-pointer";

export function ThreadFilters({
  platform,
  setPlatform,
  intent,
  setIntent,
  status,
  setStatus,
  search,
  setSearch,
  threadCount,
  onRunScan,
  isScanRunning,
}: ThreadFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Platform */}
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className={selectClassName}
        >
          <option value="">All Platforms</option>
          <option value="reddit">Reddit</option>
          <option value="quora">Quora</option>
          <option value="facebook_groups">Facebook Groups</option>
        </select>

        {/* Intent */}
        <select
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          className={selectClassName}
        >
          <option value="">All Intents</option>
          <option value="informational">Informational</option>
          <option value="transactional">Transactional</option>
          <option value="commercial">Commercial</option>
          <option value="navigational">Navigational</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectClassName}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="classified">Classified</option>
          <option value="queued">Queued</option>
          <option value="responded">Responded</option>
          <option value="posted">Posted</option>
          <option value="skipped">Skipped</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search threads..."
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          />
        </div>

        {/* Run Scan button */}
        <button
          type="button"
          onClick={onRunScan}
          disabled={isScanRunning}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
        >
          {isScanRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Scan
            </>
          )}
        </button>
      </div>

      {/* Stats bar */}
      <div className="text-xs text-muted-foreground">
        {threadCount} {threadCount === 1 ? "thread" : "threads"}
      </div>
    </div>
  );
}
