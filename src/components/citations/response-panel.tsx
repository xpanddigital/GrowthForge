"use client";

import { useState, useEffect, useCallback } from "react";
import type { ThreadWithResponses } from "@/types/api";
import { cn } from "@/lib/utils";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { ResponseCard } from "@/components/citations/response-card";
import {
  X,
  ExternalLink,
  MessageSquare,
  Calendar,
  Sparkles,
  Loader2,
} from "lucide-react";

interface ResponsePanelProps {
  thread: ThreadWithResponses | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateResponses: (threadId: string) => void;
  onResponseStatusChange: (responseId: string, status: string) => void;
  isGenerating: boolean;
}

const VARIANT_TABS = [
  { key: "casual", label: "Casual" },
  { key: "expert", label: "Expert" },
  { key: "story", label: "Story" },
] as const;

function getRelativeTime(date: string | null): string {
  if (!date) return "-";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function ResponsePanel({
  thread,
  isOpen,
  onClose,
  onGenerateResponses,
  onResponseStatusChange,
  isGenerating,
}: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<string>("casual");

  // Reset active tab when thread changes
  useEffect(() => {
    setActiveTab("casual");
  }, [thread?.id]);

  // Close on escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when panel is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const hasResponses = thread && thread.responses && thread.responses.length > 0;
  const activeResponse = hasResponses
    ? thread.responses.find((r) => r.variant === activeTab)
    : null;

  const community = thread?.subreddit
    ? `r/${thread.subreddit}`
    : thread?.group_name || null;

  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-background shadow-xl transition-transform duration-300 ease-in-out md:w-[480px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {thread && (
          <>
            {/* Header */}
            <div className="flex-shrink-0 border-b border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold leading-snug line-clamp-2">
                    {thread.title}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <PlatformBadge platform={thread.platform} />
                    {community && (
                      <span className="text-xs font-mono text-muted-foreground">
                        {community}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {thread.comment_count} comments
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {getRelativeTime(thread.thread_date)}
                    </span>
                    <a
                      href={thread.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View thread
                    </a>
                  </div>
                  {thread.suggested_angle && (
                    <p className="mt-2 text-xs text-muted-foreground italic">
                      Suggested angle: {thread.suggested_angle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isGenerating ? (
                /* Generating state */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <p className="mt-4 text-sm font-medium">
                    Generating responses...
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Creating 3 unique variants with Claude Opus
                  </p>
                </div>
              ) : hasResponses ? (
                /* Responses available */
                <div>
                  {/* Variant tabs */}
                  <div className="flex border-b border-border">
                    {VARIANT_TABS.map((tab) => {
                      const responseForTab = thread.responses.find(
                        (r) => r.variant === tab.key
                      );
                      const isActive = activeTab === tab.key;

                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveTab(tab.key)}
                          className={cn(
                            "flex-1 px-4 py-2.5 text-sm font-medium transition-colors relative",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {tab.label}
                          {responseForTab?.status === "posted" && (
                            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          )}
                          {responseForTab?.status === "rejected" && (
                            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                          )}
                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active variant card */}
                  <div className="p-4">
                    {activeResponse ? (
                      <ResponseCard
                        response={activeResponse}
                        onStatusChange={onResponseStatusChange}
                      />
                    ) : (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        No {activeTab} variant available
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* No responses yet */
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">
                    No responses yet
                  </h3>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Generate three response variants (Casual, Expert, Story)
                    tailored for this thread.
                  </p>
                  <button
                    type="button"
                    onClick={() => onGenerateResponses(thread.id)}
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Replies
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
