"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  ExternalLink,
  Flag,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface ReviewData {
  id: string;
  platform: string;
  reviewer_name: string;
  rating: number;
  rating_scale: number;
  review_text: string;
  review_date: string;
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  has_owner_response: boolean;
  is_highlighted: boolean;
  is_flagged: boolean;
  source_url?: string;
}

interface ReviewCardProps {
  review: ReviewData;
  onHighlight?: (id: string) => void;
  onFlag?: (id: string) => void;
  onGenerateResponse?: (id: string) => void;
}

const SENTIMENT_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  positive: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Positive",
  },
  neutral: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    label: "Neutral",
  },
  negative: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Negative",
  },
};

const PLATFORM_NAMES: Record<string, string> = {
  google: "Google",
  trustpilot: "Trustpilot",
  g2: "G2",
  yelp: "Yelp",
  facebook: "Facebook",
  capterra: "Capterra",
};

function renderStars(rating: number, scale: number) {
  const normalized = (rating / scale) * 5;
  const full = Math.floor(normalized);
  const empty = 5 - full;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-3 w-3 fill-amber-400 text-amber-400"
        />
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="h-3 w-3 text-muted-foreground/40"
        />
      ))}
    </div>
  );
}

export function ReviewCard({
  review,
  onHighlight,
  onFlag,
  onGenerateResponse,
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sentiment = SENTIMENT_STYLES[review.sentiment] ?? SENTIMENT_STYLES.neutral;
  const platformName = PLATFORM_NAMES[review.platform] ?? review.platform;
  const isTruncated = review.review_text.length > 300;
  const displayText =
    expanded || !isTruncated
      ? review.review_text
      : review.review_text.slice(0, 300) + "...";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        review.is_highlighted
          ? "border-[#6C5CE7]/40 bg-[#6C5CE7]/5"
          : "border-border"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {renderStars(review.rating, review.rating_scale)}
            <Badge variant="outline" className="text-[10px]">
              {platformName}
            </Badge>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                sentiment.bg,
                sentiment.text
              )}
            >
              {sentiment.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {review.reviewer_name}
            </span>
            <span>
              {new Date(review.review_date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {review.has_owner_response && (
              <span className="flex items-center gap-0.5 text-[#00D2D3]">
                <MessageSquare className="h-3 w-3" />
                Responded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Review text */}
      <div className="mt-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {displayText}
        </p>
        {isTruncated && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 flex items-center gap-0.5 text-xs font-medium text-[#6C5CE7] hover:text-[#5A4BD1]"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Topics */}
      {review.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {review.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1 px-2 text-xs",
            review.is_highlighted && "text-amber-400"
          )}
          onClick={() => onHighlight?.(review.id)}
        >
          <Star
            className={cn(
              "h-3.5 w-3.5",
              review.is_highlighted && "fill-amber-400"
            )}
          />
          {review.is_highlighted ? "Highlighted" : "Highlight"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1 px-2 text-xs",
            review.is_flagged && "text-red-400"
          )}
          onClick={() => onFlag?.(review.id)}
        >
          <Flag
            className={cn("h-3.5 w-3.5", review.is_flagged && "fill-red-400")}
          />
          {review.is_flagged ? "Flagged" : "Flag"}
        </Button>
        {!review.has_owner_response && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-[#6C5CE7] hover:text-[#5A4BD1]"
            onClick={() => onGenerateResponse?.(review.id)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate Response
          </Button>
        )}
        {review.source_url && (
          <a
            href={review.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto"
          >
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
