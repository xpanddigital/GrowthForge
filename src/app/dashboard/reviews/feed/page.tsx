"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Star,
  MessageSquare,
  Flag,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  platform: string;
  author: string;
  rating: number;
  title: string | null;
  body_text: string;
  sentiment: string | null;
  sentiment_score: number | null;
  is_highlighted: boolean;
  is_flagged: boolean;
  has_owner_response: boolean;
  review_url: string | null;
  created_at: string;
}

const PLATFORM_OPTIONS = [
  { value: "all", label: "All Platforms" },
  { value: "google", label: "Google" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "g2", label: "G2" },
  { value: "capterra", label: "Capterra" },
  { value: "yelp", label: "Yelp" },
  { value: "facebook", label: "Facebook" },
];

const SENTIMENT_OPTIONS = [
  { value: "all", label: "All Sentiments" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < full
              ? "fill-amber-400 text-amber-400"
              : i === full && hasHalf
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

function getSentimentColor(sentiment: string | null): string {
  if (sentiment === "positive") return "border-emerald-500/30 text-emerald-500";
  if (sentiment === "negative") return "border-red-500/30 text-red-500";
  if (sentiment === "neutral") return "border-amber-500/30 text-amber-500";
  return "border-muted-foreground/30 text-muted-foreground";
}

export default function ReviewFeedPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}</div>}>
      <ReviewFeedPageInner />
    </Suspense>
  );
}

function ReviewFeedPageInner() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [platformFilter, setPlatformFilter] = useState(
    searchParams.get("platform") || "all"
  );
  const [sentimentFilter, setSentimentFilter] = useState(
    searchParams.get("sentiment") || "all"
  );
  const [highlightedOnly, setHighlightedOnly] = useState(
    searchParams.get("highlighted") === "true"
  );
  const [flaggedOnly, setFlaggedOnly] = useState(
    searchParams.get("flagged") === "true"
  );

  const buildUrl = useCallback(
    (newOffset: number) => {
      if (!selectedClientId) return "";
      const params = new URLSearchParams();
      params.set("clientId", selectedClientId);
      params.set("limit", String(limit));
      params.set("offset", String(newOffset));
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (sentimentFilter !== "all") params.set("sentiment", sentimentFilter);
      if (highlightedOnly) params.set("highlighted", "true");
      if (flaggedOnly) params.set("flagged", "true");
      return `/api/reviews/feed?${params.toString()}`;
    },
    [selectedClientId, platformFilter, sentimentFilter, highlightedOnly, flaggedOnly]
  );

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    setOffset(0);
    try {
      const res = await fetch(buildUrl(0));
      if (res.ok) {
        const data = await res.json();
        const items = data.reviews || data.data || [];
        setReviews(items);
        setHasMore(items.length >= limit);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, buildUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLoadMore = async () => {
    const newOffset = offset + limit;
    setLoadingMore(true);
    try {
      const res = await fetch(buildUrl(newOffset));
      if (res.ok) {
        const data = await res.json();
        const items = data.reviews || data.data || [];
        setReviews((prev) => [...prev, ...items]);
        setOffset(newOffset);
        setHasMore(items.length >= limit);
      }
    } catch {
      // handle error
    } finally {
      setLoadingMore(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Review Feed</h2>
          <p className="text-sm text-muted-foreground">
            Browse and manage all reviews.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={MessageSquare}
            title="No client selected"
            description="Select a client from the header to view their review feed."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Review Feed</h2>
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Review Feed</h2>
        <p className="text-sm text-muted-foreground">
          All reviews for {selectedClientName} across platforms
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {PLATFORM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SENTIMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setHighlightedOnly(!highlightedOnly)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5",
            highlightedOnly
              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Sparkles className="h-3 w-3" />
          Highlighted
        </button>

        <button
          onClick={() => setFlaggedOnly(!flaggedOnly)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5",
            flaggedOnly
              ? "bg-red-500/15 text-red-500 border border-red-500/30"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Flag className="h-3 w-3" />
          Flagged
        </button>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={MessageSquare}
            title="No reviews found"
            description="Try adjusting your filters or run a review scan to discover reviews."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/dashboard/reviews/${review.id}`}
              className="block rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {review.platform.replace(/_/g, " ")}
                    </Badge>
                    {renderStars(review.rating)}
                    {review.sentiment && (
                      <Badge variant="outline" className={cn("text-[10px] capitalize", getSentimentColor(review.sentiment))}>
                        {review.sentiment}
                      </Badge>
                    )}
                    {review.is_highlighted && (
                      <Sparkles className="h-3 w-3 text-amber-400" />
                    )}
                    {review.is_flagged && (
                      <Flag className="h-3 w-3 text-red-400" />
                    )}
                    {review.has_owner_response && (
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500">
                        Responded
                      </Badge>
                    )}
                  </div>
                  {review.title && (
                    <p className="text-sm font-medium text-foreground mt-1.5">{review.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {review.body_text}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                    <span>by {review.author}</span>
                    <span>&middot;</span>
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {review.review_url && (
                  <a
                    href={review.review_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground shrink-0"
                    title="Open original review"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </Link>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
