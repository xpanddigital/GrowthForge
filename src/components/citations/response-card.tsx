"use client";

import type { Response } from "@/types/database";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/citations/copy-button";
import { CheckCircle2, XCircle, Tag, Link2 } from "lucide-react";

interface ResponseCardProps {
  response: Response;
  onStatusChange: (responseId: string, status: string) => void;
}

export function ResponseCard({ response, onStatusChange }: ResponseCardProps) {
  const isActionsDisabled =
    response.status === "posted" || response.status === "rejected";

  const displayText = response.was_edited && response.edited_text
    ? response.edited_text
    : response.body_text;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Response body */}
      <div className="p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {displayText}
        </p>
      </div>

      {/* Scores and indicators */}
      <div className="border-t border-border px-4 py-3 space-y-3">
        {/* Score bars */}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {/* Quality score */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Quality</span>
            <div className="h-1.5 w-20 rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  (response.quality_score ?? 0) >= 61
                    ? "bg-emerald-500"
                    : (response.quality_score ?? 0) >= 31
                      ? "bg-amber-500"
                      : "bg-red-500"
                )}
                style={{ width: `${response.quality_score ?? 0}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums">
              {response.quality_score ?? "-"}
            </span>
          </div>

          {/* Tone match score */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tone</span>
            <div className="h-1.5 w-20 rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  (response.tone_match_score ?? 0) >= 61
                    ? "bg-emerald-500"
                    : (response.tone_match_score ?? 0) >= 31
                      ? "bg-amber-500"
                      : "bg-red-500"
                )}
                style={{ width: `${response.tone_match_score ?? 0}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums">
              {response.tone_match_score ?? "-"}
            </span>
          </div>
        </div>

        {/* Mention badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              response.mentions_brand
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Tag className="h-3 w-3" />
            {response.mentions_brand ? "Mentions brand" : "No brand mention"}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              response.mentions_url
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Link2 className="h-3 w-3" />
            {response.mentions_url ? "Includes URL" : "No URL"}
          </span>
        </div>
      </div>

      {/* Action row */}
      <div className="border-t border-border px-4 py-3">
        {response.status === "posted" ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Posted
            </span>
            {response.posted_at && (
              <span className="text-xs text-muted-foreground">
                {new Date(response.posted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : response.status === "rejected" ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-500">
              <XCircle className="h-3.5 w-3.5" />
              Rejected
            </span>
            {response.rejection_reason && (
              <span className="text-xs text-muted-foreground">
                {response.rejection_reason}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CopyButton text={displayText} />
            <button
              type="button"
              disabled={isActionsDisabled}
              onClick={() => onStatusChange(response.id, "posted")}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark Posted
            </button>
            <button
              type="button"
              disabled={isActionsDisabled}
              onClick={() => onStatusChange(response.id, "rejected")}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
