"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClientContext } from "@/hooks/use-client-context";
import { cn } from "@/lib/utils";
import {
  MessageSquareQuote,
  Search,
  SlidersHorizontal,
  Radar,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Sparkles,
  X,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  History,
  SkipForward,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { IntentTag } from "@/components/shared/intent-tag";
import { StatusBadge } from "@/components/shared/status-badge";
import { RelevanceBar } from "@/components/shared/relevance-bar";
import type { Thread, Keyword, Response as GFResponse } from "@/types/database";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ThreadWithResponses extends Thread {
  responses: GFResponse[];
  keyword?: Keyword;
}

type SortField =
  | "opportunity_score"
  | "relevance_score"
  | "comment_count"
  | "discovered_at"
  | "google_position";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "...";
}

function communityLabel(thread: Thread): string {
  if (thread.subreddit) return `r/${thread.subreddit}`;
  if (thread.group_name) return thread.group_name;
  return thread.platform;
}

// ---------------------------------------------------------------------------
// Thread Filters
// ---------------------------------------------------------------------------

interface ThreadFiltersProps {
  platform: string;
  setPlatform: (v: string) => void;
  intent: string;
  setIntent: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  onRunScan: () => void;
  isScanRunning: boolean;
  threadCount: number;
  queuedCount: number;
  respondedCount: number;
}

function ThreadFilters({
  platform,
  setPlatform,
  intent,
  setIntent,
  status,
  setStatus,
  search,
  setSearch,
  onRunScan,
  isScanRunning,
  threadCount,
  queuedCount,
  respondedCount,
}: ThreadFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="reddit">Reddit</SelectItem>
            <SelectItem value="quora">Quora</SelectItem>
            <SelectItem value="facebook_groups">Facebook</SelectItem>
          </SelectContent>
        </Select>

        <Select value={intent} onValueChange={setIntent}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Intents</SelectItem>
            <SelectItem value="informational">Informational</SelectItem>
            <SelectItem value="transactional">Transactional</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="navigational">Navigational</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="classified">Classified</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="skipped">Skipped</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>

        <Link href="/dashboard/citations/runs">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <History className="h-3.5 w-3.5" />
            Runs
          </Button>
        </Link>

        <Button
          size="sm"
          className="h-9 gap-1.5"
          onClick={onRunScan}
          disabled={isScanRunning}
        >
          {isScanRunning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Radar className="h-3.5 w-3.5" />
          )}
          {isScanRunning ? "Scanning..." : "Run Scan"}
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{threadCount}</span>{" "}
          threads
        </span>
        <span className="text-border">|</span>
        <span>
          <span className="font-medium text-cyan-500">{queuedCount}</span>{" "}
          queued
        </span>
        <span className="text-border">|</span>
        <span>
          <span className="font-medium text-emerald-500">{respondedCount}</span>{" "}
          responded
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable Header
// ---------------------------------------------------------------------------

interface SortableHeadProps {
  label: string;
  field: SortField;
  currentSort: SortField;
  direction: "asc" | "desc";
  onSort: (field: SortField) => void;
  className?: string;
}

function SortableHead({
  label,
  field,
  currentSort,
  direction,
  onSort,
  className,
}: SortableHeadProps) {
  const isActive = currentSort === field;
  return (
    <TableHead className={cn("cursor-pointer select-none", className)}>
      <button
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        {isActive ? (
          direction === "desc" ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUp className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}

// ---------------------------------------------------------------------------
// Thread Table
// ---------------------------------------------------------------------------

interface ThreadTableProps {
  threads: Thread[];
  sortField: SortField;
  sortDirection: "asc" | "desc";
  onSort: (field: SortField) => void;
  onSelectThread: (thread: Thread) => void;
  onGenerate: (threadId: string) => void;
  onSkip: (threadId: string) => void;
  isGenerating: boolean;
  generatingThreadId: string | null;
  selectedThreadId: string | null;
  checkedIds: Set<string>;
  onToggleCheck: (threadId: string) => void;
  onToggleAll: () => void;
}

function ThreadTable({
  threads,
  sortField,
  sortDirection,
  onSort,
  onSelectThread,
  onGenerate,
  onSkip,
  isGenerating,
  generatingThreadId,
  selectedThreadId,
  checkedIds,
  onToggleCheck,
  onToggleAll,
}: ThreadTableProps) {
  const allChecked = threads.length > 0 && threads.every((t) => checkedIds.has(t.id));
  const someChecked = threads.some((t) => checkedIds.has(t.id));

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked && !allChecked;
                }}
                onChange={onToggleAll}
                className="h-4 w-4 rounded border-border accent-primary"
              />
            </TableHead>
            <TableHead className="w-[80px]">Platform</TableHead>
            <TableHead className="w-[120px]">Community</TableHead>
            <TableHead className="min-w-[240px]">Title</TableHead>
            <TableHead className="w-[60px]">Pos</TableHead>
            <TableHead className="w-[80px]">Intent</TableHead>
            <SortableHead
              label="Relevance"
              field="relevance_score"
              currentSort={sortField}
              direction={sortDirection}
              onSort={onSort}
              className="w-[120px]"
            />
            <SortableHead
              label="Opportunity"
              field="opportunity_score"
              currentSort={sortField}
              direction={sortDirection}
              onSort={onSort}
              className="w-[120px]"
            />
            <SortableHead
              label="Comments"
              field="comment_count"
              currentSort={sortField}
              direction={sortDirection}
              onSort={onSort}
              className="w-[90px]"
            />
            <SortableHead
              label="Date"
              field="discovered_at"
              currentSort={sortField}
              direction={sortDirection}
              onSort={onSort}
              className="w-[80px]"
            />
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {threads.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            const isThisGenerating =
              isGenerating && generatingThreadId === thread.id;
            return (
              <TableRow
                key={thread.id}
                className={cn(
                  "cursor-pointer",
                  isSelected && "bg-muted/60"
                )}
                onClick={() => onSelectThread(thread)}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={checkedIds.has(thread.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleCheck(thread.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </TableCell>
                <TableCell>
                  <PlatformBadge platform={thread.platform} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {truncate(communityLabel(thread), 18)}
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1 text-sm font-medium">
                    {thread.title}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {thread.google_position ? `#${thread.google_position}` : "-"}
                </TableCell>
                <TableCell>
                  <IntentTag intent={thread.intent} />
                </TableCell>
                <TableCell>
                  <RelevanceBar score={thread.relevance_score} />
                </TableCell>
                <TableCell>
                  <RelevanceBar score={thread.opportunity_score} />
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                    {thread.comment_count}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {relativeTime(thread.thread_date || thread.discovered_at)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={thread.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(thread.status === "queued" ||
                      thread.status === "classified") && (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => onGenerate(thread.id)}
                        disabled={isThisGenerating}
                      >
                        {isThisGenerating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        Generate
                      </Button>
                    )}
                    {thread.status === "responded" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => onSelectThread(thread)}
                      >
                        <ChevronRight className="h-3 w-3" />
                        View
                      </Button>
                    )}
                    <a
                      href={thread.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {thread.status !== "skipped" &&
                      thread.status !== "posted" && (
                        <button
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={() => onSkip(thread.id)}
                          title="Skip thread"
                        >
                          <SkipForward className="h-3.5 w-3.5" />
                        </button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Response Panel (Slide-out)
// ---------------------------------------------------------------------------

interface ResponsePanelProps {
  thread: ThreadWithResponses;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (threadId: string) => void;
  isGenerating: boolean;
  onResponseStatusChange: (responseId: string, newStatus: string) => void;
}

function ResponsePanel({
  thread,
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  onResponseStatusChange,
}: ResponsePanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  if (!isOpen) return null;

  const hasResponses = thread.responses.length > 0;
  const defaultTab =
    thread.responses.length > 0 ? thread.responses[0].variant : "casual";

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-border bg-background shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-4">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2">
            <PlatformBadge platform={thread.platform} />
            <span className="text-xs text-muted-foreground">
              {communityLabel(thread)}
            </span>
            <span className="text-xs text-muted-foreground">
              {thread.comment_count} comments
            </span>
            <span className="text-xs text-muted-foreground">
              {relativeTime(thread.thread_date || thread.discovered_at)}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-snug">
            {thread.title}
          </h3>
          {thread.keyword && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className="text-[10px] font-normal"
              >
                {thread.keyword.keyword}
              </Badge>
              {thread.google_position && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  SERP #{thread.google_position}
                </span>
              )}
            </div>
          )}
          {thread.suggested_angle && (
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Suggested angle:
              </span>{" "}
              {thread.suggested_angle}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Thread body preview */}
          {thread.body_text && (
            <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Original Post
              </p>
              <p className="text-sm text-foreground/80 line-clamp-6">
                {thread.body_text}
              </p>
            </div>
          )}

          {!hasResponses ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium">No responses yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Generate three response variants tailored to this thread.
              </p>
              <Button
                className="mt-4 gap-1.5"
                size="sm"
                onClick={() => onGenerate(thread.id)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {isGenerating ? "Generating..." : "Generate Responses"}
              </Button>
            </div>
          ) : (
            <Tabs defaultValue={defaultTab}>
              <TabsList className="w-full">
                {thread.responses.map((r) => (
                  <TabsTrigger
                    key={r.variant}
                    value={r.variant}
                    className="flex-1 capitalize"
                  >
                    {r.variant}
                  </TabsTrigger>
                ))}
              </TabsList>
              {thread.responses.map((response) => (
                <TabsContent key={response.variant} value={response.variant}>
                  <div className="rounded-lg border border-border bg-card p-4">
                    {/* Response text */}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {response.edited_text || response.body_text}
                    </div>

                    {/* Quality indicators */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                      {response.quality_score !== null && (
                        <span>
                          Quality:{" "}
                          <span className="font-medium text-foreground">
                            {response.quality_score}/100
                          </span>
                        </span>
                      )}
                      {response.tone_match_score !== null && (
                        <span>
                          Tone:{" "}
                          <span className="font-medium text-foreground">
                            {response.tone_match_score}/100
                          </span>
                        </span>
                      )}
                      <span className="text-border">|</span>
                      <span>
                        {response.mentions_brand ? (
                          <span className="text-emerald-500">
                            Mentions brand
                          </span>
                        ) : (
                          <span>No brand mention</span>
                        )}
                      </span>
                      <span>
                        {response.mentions_url ? (
                          <span className="text-emerald-500">
                            Includes URL
                          </span>
                        ) : (
                          <span>No URL</span>
                        )}
                      </span>
                    </div>

                    {/* Status + actions */}
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <StatusBadge status={response.status} />

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() =>
                            handleCopy(
                              response.edited_text || response.body_text,
                              response.id
                            )
                          }
                        >
                          {copiedId === response.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copiedId === response.id ? "Copied" : "Copy"}
                        </Button>
                        {response.status === "draft" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 text-xs text-emerald-500 hover:text-emerald-400"
                              onClick={() =>
                                onResponseStatusChange(
                                  response.id,
                                  "approved"
                                )
                              }
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 text-xs text-red-500 hover:text-red-400"
                              onClick={() =>
                                onResponseStatusChange(
                                  response.id,
                                  "rejected"
                                )
                              }
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}
                        {(response.status === "draft" ||
                          response.status === "approved") && (
                          <Button
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() =>
                              onResponseStatusChange(response.id, "posted")
                            }
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Mark Posted
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton Loading Table
// ---------------------------------------------------------------------------

function ThreadTableSkeleton() {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead className="w-[80px]">Platform</TableHead>
            <TableHead className="w-[120px]">Community</TableHead>
            <TableHead className="min-w-[240px]">Title</TableHead>
            <TableHead className="w-[60px]">Pos</TableHead>
            <TableHead className="w-[80px]">Intent</TableHead>
            <TableHead className="w-[120px]">Relevance</TableHead>
            <TableHead className="w-[120px]">Opportunity</TableHead>
            <TableHead className="w-[90px]">Comments</TableHead>
            <TableHead className="w-[80px]">Date</TableHead>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-full max-w-[260px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-6" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-7 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function CitationsPage() {
  useEffect(() => { document.title = "Citation Engine — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const supabase = createClient();

  // Filter state
  const [platform, setPlatform] = useState("all");
  const [intent, setIntent] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Sort state
  const [sortField, setSortField] = useState<SortField>("opportunity_score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Data state
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  // Panel state
  const [selectedThread, setSelectedThread] =
    useState<ThreadWithResponses | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingThreadId, setGeneratingThreadId] = useState<string | null>(
    null
  );
  const [isScanRunning, setIsScanRunning] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // ---------- Computed stats ----------
  const queuedCount = useMemo(
    () => threads.filter((t) => t.status === "queued").length,
    [threads]
  );
  const respondedCount = useMemo(
    () =>
      threads.filter(
        (t) => t.status === "responded" || t.status === "posted"
      ).length,
    [threads]
  );

  // ---------- Fetch threads ----------
  const fetchThreads = useCallback(async () => {
    if (!selectedClientId) {
      setThreads([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    let query = supabase
      .from("threads")
      .select("*")
      .eq("client_id", selectedClientId);

    // Apply filters
    if (platform !== "all") {
      query = query.eq("platform", platform);
    }
    if (intent !== "all") {
      query = query.eq("intent", intent);
    }
    if (status !== "all") {
      query = query.eq("status", status);
    }
    if (search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    // Apply sorting
    const isAsc = sortDirection === "asc";
    query = query.order(sortField, {
      ascending: isAsc,
      nullsFirst: false,
    });

    // Limit to 100 for performance
    query = query.limit(100);

    const { data, error } = await query;

    if (!error && data) {
      setThreads(data as Thread[]);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId, platform, intent, status, search, sortField, sortDirection]);

  useEffect(() => {
    setCheckedIds(new Set());
    fetchThreads();
  }, [fetchThreads]);

  // ---------- Handlers ----------

  function handleToggleCheck(threadId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId);
      else next.add(threadId);
      return next;
    });
  }

  function handleToggleAll() {
    if (threads.every((t) => checkedIds.has(t.id))) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(threads.map((t) => t.id)));
    }
  }

  async function handleBulkSkip() {
    const ids = Array.from(checkedIds);
    if (ids.length === 0) return;
    const now = new Date().toISOString();
    await supabase
      .from("threads")
      .update({ status: "skipped", status_changed_at: now })
      .in("id", ids);
    setCheckedIds(new Set());
    fetchThreads();
  }

  async function handleBulkGenerate() {
    const ids = Array.from(checkedIds).filter((id) => {
      const t = threads.find((th) => th.id === id);
      return t && (t.status === "queued" || t.status === "classified");
    });
    if (ids.length === 0) return;
    // Generate responses sequentially for each checked thread
    for (const id of ids) {
      handleGenerateResponses(id);
    }
    setCheckedIds(new Set());
  }

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  async function handleSelectThread(thread: Thread) {
    // Fetch responses for this thread
    const { data: responses } = await supabase
      .from("responses")
      .select("*")
      .eq("thread_id", thread.id)
      .order("variant");

    // Also fetch keyword info if keyword_id exists
    let keyword: Keyword | undefined = undefined;
    if (thread.keyword_id) {
      const { data } = await supabase
        .from("keywords")
        .select("*")
        .eq("id", thread.keyword_id)
        .single();
      keyword = (data as Keyword) || undefined;
    }

    setSelectedThread({
      ...thread,
      responses: (responses as GFResponse[]) || [],
      keyword,
    });
    setIsPanelOpen(true);
  }

  async function handleGenerateResponses(threadId: string) {
    setIsGenerating(true);
    setGeneratingThreadId(threadId);
    try {
      const res = await fetch("/api/responses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId }),
      });
      if (res.ok) {
        // Poll for completion - check thread status every 3 seconds
        const pollInterval = setInterval(async () => {
          const { data } = await supabase
            .from("threads")
            .select("status")
            .eq("id", threadId)
            .single();
          if (data?.status === "responded") {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setGeneratingThreadId(null);
            // Refresh the selected thread to get responses
            const { data: thread } = await supabase
              .from("threads")
              .select("*")
              .eq("id", threadId)
              .single();
            if (thread) handleSelectThread(thread as Thread);
            // Refresh thread list
            fetchThreads();
          }
        }, 3000);
        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setGeneratingThreadId(null);
        }, 60000);
      } else {
        setIsGenerating(false);
        setGeneratingThreadId(null);
      }
    } catch {
      setIsGenerating(false);
      setGeneratingThreadId(null);
    }
  }

  async function handleRunScan() {
    if (!selectedClientId) return;
    setIsScanRunning(true);
    try {
      await fetch("/api/discovery/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: selectedClientId }),
      });
      // Show scan running state for 5 seconds then refresh
      setTimeout(() => {
        setIsScanRunning(false);
        fetchThreads();
      }, 5000);
    } catch {
      setIsScanRunning(false);
    }
  }

  async function handleSkipThread(threadId: string) {
    await supabase
      .from("threads")
      .update({ status: "skipped", status_changed_at: new Date().toISOString() })
      .eq("id", threadId);
    fetchThreads();
    if (selectedThread?.id === threadId) {
      setIsPanelOpen(false);
      setSelectedThread(null);
    }
  }

  async function handleResponseStatusChange(
    responseId: string,
    newStatus: string
  ) {
    const updatePayload: Record<string, string> = { status: newStatus };

    // Add timestamp fields based on status
    const now = new Date().toISOString();
    if (newStatus === "approved") {
      updatePayload.approved_at = now;
    } else if (newStatus === "posted") {
      updatePayload.posted_at = now;
    } else if (newStatus === "rejected") {
      updatePayload.rejected_at = now;
    }

    await supabase.from("responses").update(updatePayload).eq("id", responseId);

    // If marking as posted, also update the thread status
    if (newStatus === "posted" && selectedThread) {
      await supabase
        .from("threads")
        .update({
          status: "posted",
          status_changed_at: now,
        })
        .eq("id", selectedThread.id);
    }
    // Refresh selected thread
    if (selectedThread) {
      const { data: refreshedThread } = await supabase
        .from("threads")
        .select("*")
        .eq("id", selectedThread.id)
        .single();
      if (refreshedThread) {
        handleSelectThread(refreshedThread as Thread);
      }
    }
    fetchThreads();
  }

  // ---------- No client selected ----------
  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Citation Engine</h2>
          <p className="text-sm text-muted-foreground">
            Discover and respond to high-authority threads across Reddit, Quora,
            and Facebook Groups.
          </p>
        </div>
        <EmptyState
          icon={SlidersHorizontal}
          title="Select a client"
          description="Choose a client from the dropdown in the header to view their citation threads."
        />
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">Citation Engine</h2>
        <p className="text-sm text-muted-foreground">
          Discover and respond to high-authority threads for{" "}
          <span className="font-medium text-foreground">
            {selectedClientName}
          </span>
          .
        </p>
      </div>

      {/* Filters */}
      <ThreadFilters
        platform={platform}
        setPlatform={setPlatform}
        intent={intent}
        setIntent={setIntent}
        status={status}
        setStatus={setStatus}
        search={search}
        setSearch={setSearch}
        onRunScan={handleRunScan}
        isScanRunning={isScanRunning}
        threadCount={threads.length}
        queuedCount={queuedCount}
        respondedCount={respondedCount}
      />

      {/* Bulk action bar */}
      {checkedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-medium">
            {checkedIds.size} thread{checkedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={handleBulkGenerate}
            >
              <Sparkles className="h-3 w-3" />
              Generate All
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleBulkSkip}
            >
              <SkipForward className="h-3 w-3" />
              Skip All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setCheckedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table or loading or empty */}
      {loading ? (
        <ThreadTableSkeleton />
      ) : threads.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="No threads found"
          description={
            search || platform !== "all" || intent !== "all" || status !== "all"
              ? "No threads match your current filters. Try adjusting them."
              : "Run a discovery scan to find high-authority threads for this client."
          }
          action={
            !(search || platform !== "all" || intent !== "all" || status !== "all") ? (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleRunScan}
                disabled={isScanRunning}
              >
                {isScanRunning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Radar className="h-3.5 w-3.5" />
                )}
                Run Scan
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ThreadTable
          threads={threads}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSelectThread={handleSelectThread}
          onGenerate={handleGenerateResponses}
          onSkip={handleSkipThread}
          isGenerating={isGenerating}
          generatingThreadId={generatingThreadId}
          selectedThreadId={selectedThread?.id || null}
          checkedIds={checkedIds}
          onToggleCheck={handleToggleCheck}
          onToggleAll={handleToggleAll}
        />
      )}

      {/* Backdrop overlay when panel is open */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => {
            setIsPanelOpen(false);
            setSelectedThread(null);
          }}
        />
      )}

      {/* Response slide-out panel */}
      {selectedThread && (
        <ResponsePanel
          thread={selectedThread}
          isOpen={isPanelOpen}
          onClose={() => {
            setIsPanelOpen(false);
            setSelectedThread(null);
          }}
          onGenerate={handleGenerateResponses}
          isGenerating={isGenerating}
          onResponseStatusChange={handleResponseStatusChange}
        />
      )}
    </div>
  );
}
