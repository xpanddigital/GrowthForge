"use client";

import { Check, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrTypeBadge } from "@/components/press/pr-type-badge";
import { RelevanceBar } from "@/components/shared/relevance-bar";
import type { PressCampaignIdea } from "@/types/database";

interface IdeaCardProps {
  idea: PressCampaignIdea;
  onApprove: (ideaId: string) => void;
  onReject: (ideaId: string) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

export function IdeaCard({ idea, onApprove, onReject }: IdeaCardProps) {
  const isPending = !idea.is_approved && !idea.is_rejected;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-sm leading-snug">{idea.headline}</h3>
        <PrTypeBadge prType={idea.pr_type} />
      </div>
      <p className="text-sm text-muted-foreground mb-3">{idea.angle}</p>

      {idea.seasonal_hook && (
        <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>{idea.seasonal_hook}</span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        {idea.relevance_score !== null && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Relevance</span>
            <RelevanceBar score={idea.relevance_score} />
          </div>
        )}
        {idea.target_date && (
          <span className="text-xs text-muted-foreground">
            Target: {formatDate(idea.target_date)}
          </span>
        )}
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button
            size="sm"
            onClick={() => onApprove(idea.id)}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(idea.id)}
            className="text-muted-foreground"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      ) : (
        <div className="pt-3 border-t border-border">
          {idea.is_approved ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
              <Check className="h-3.5 w-3.5" />
              Approved
              {idea.promoted_to_campaign_id && " — Campaign created"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-red-500">
              <X className="h-3.5 w-3.5" />
              Rejected
            </span>
          )}
        </div>
      )}
    </div>
  );
}
