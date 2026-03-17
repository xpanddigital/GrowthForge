"use client";

import type { Thread } from "@/types/database";
import { cn } from "@/lib/utils";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { IntentTag } from "@/components/shared/intent-tag";
import { RelevanceBar } from "@/components/shared/relevance-bar";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  X,
  MessageSquare,
} from "lucide-react";

interface ThreadTableProps {
  threads: Thread[];
  onSelectThread: (thread: Thread) => void;
  onSkipThread: (threadId: string) => void;
  selectedThreadId: string | null;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}

function getRelativeTime(date: string | null): string {
  if (!date) return "-";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  className?: string;
}

function SortableHeader({
  label,
  field,
  currentSortField,
  sortDirection,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = currentSortField === field;

  return (
    <th
      className={cn(
        "h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors",
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
        )}
      </div>
    </th>
  );
}

export function ThreadTable({
  threads,
  onSelectThread,
  onSkipThread,
  selectedThreadId,
  sortField,
  sortDirection,
  onSort,
}: ThreadTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <SortableHeader
              label="Platform"
              field="platform"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label="Community"
              field="subreddit"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label="Title"
              field="title"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              className="min-w-[200px]"
            />
            <SortableHeader
              label="Pos"
              field="google_position"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              className="hidden md:table-cell"
            />
            <SortableHeader
              label="Intent"
              field="intent"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label="Relevance"
              field="relevance_score"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label="Comments"
              field="comment_count"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              className="hidden md:table-cell"
            />
            <SortableHeader
              label="Age"
              field="thread_date"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              className="hidden md:table-cell"
            />
            <SortableHeader
              label="Status"
              field="status"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <th className="h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {threads.map((thread) => {
            const community = thread.subreddit
              ? `r/${thread.subreddit}`
              : thread.group_name || "-";

            return (
              <tr
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={cn(
                  "border-b border-border cursor-pointer transition-colors",
                  selectedThreadId === thread.id
                    ? "bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                {/* Platform */}
                <td className="px-3 py-3">
                  <PlatformBadge platform={thread.platform} />
                </td>

                {/* Community */}
                <td className="px-3 py-3">
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px] inline-block">
                    {community}
                  </span>
                </td>

                {/* Title */}
                <td className="px-3 py-3 min-w-[200px] max-w-[300px]">
                  <span className="font-medium text-sm line-clamp-2 leading-snug">
                    {thread.title}
                  </span>
                </td>

                {/* Google position */}
                <td className="px-3 py-3 hidden md:table-cell">
                  <span className="text-xs font-mono tabular-nums text-muted-foreground">
                    {thread.google_position != null
                      ? `#${thread.google_position}`
                      : "-"}
                  </span>
                </td>

                {/* Intent */}
                <td className="px-3 py-3">
                  <IntentTag intent={thread.intent} />
                </td>

                {/* Relevance */}
                <td className="px-3 py-3">
                  <RelevanceBar score={thread.relevance_score} />
                </td>

                {/* Comments */}
                <td className="px-3 py-3 hidden md:table-cell">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {thread.comment_count}
                  </span>
                </td>

                {/* Age */}
                <td className="px-3 py-3 hidden md:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {getRelativeTime(thread.thread_date)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-3">
                  <StatusBadge status={thread.status} />
                </td>

                {/* Actions */}
                <td className="px-3 py-3">
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={thread.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="View thread"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => onSkipThread(thread.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                      title="Skip thread"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {threads.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="px-3 py-12 text-center text-sm text-muted-foreground"
              >
                No threads found matching your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
