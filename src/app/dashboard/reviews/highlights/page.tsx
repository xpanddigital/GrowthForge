"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Star, Trophy, ExternalLink, X, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HighlightedReview {
  id: string;
  platform: string;
  author: string;
  rating: number;
  title: string | null;
  body_text: string;
  sentiment: string | null;
  is_highlighted: boolean;
  review_url: string | null;
  review_date: string;
  created_at: string;
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < full
              ? "fill-amber-400 text-amber-400"
              : i === full && hasHalf
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1 text-xs font-medium tabular-nums text-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function getSentimentVariant(sentiment: string | null): string {
  if (sentiment === "positive") return "border-emerald-500/30 text-emerald-500";
  if (sentiment === "negative") return "border-red-500/30 text-red-500";
  if (sentiment === "neutral") return "border-amber-500/30 text-amber-500";
  return "border-muted-foreground/30 text-muted-foreground";
}

const platformOptions = [
  { value: "all", label: "All Platforms" },
  { value: "google", label: "Google" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "g2", label: "G2" },
  { value: "capterra", label: "Capterra" },
  { value: "yelp", label: "Yelp" },
];

const ratingOptions = [
  { value: "all", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
];

const dateOptions = [
  { value: "all", label: "All Time" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "365", label: "Last Year" },
];

export default function HighlightsPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [reviews, setReviews] = useState<HighlightedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Filters
  const [platformFilter, setPlatformFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews/feed?clientId=${selectedClientId}&highlighted=true`
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUnhighlight = async (reviewId: string) => {
    setRemovingId(reviewId);
    try {
      await fetch(`/api/reviews/${reviewId}/highlight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ highlighted: false }),
      });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      // handle error
    } finally {
      setRemovingId(null);
    }
  };

  const handleExport = () => {
    alert(
      `Export ${filteredReviews.length} highlighted review(s) for reporting. This feature is coming soon.`
    );
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // Platform filter
      if (platformFilter !== "all" && review.platform !== platformFilter) {
        return false;
      }

      // Rating filter
      if (ratingFilter !== "all") {
        const minRating = parseInt(ratingFilter, 10);
        if (ratingFilter === "5") {
          if (review.rating < 5) return false;
        } else if (review.rating < minRating) {
          return false;
        }
      }

      // Date filter
      if (dateFilter !== "all") {
        const daysAgo = parseInt(dateFilter, 10);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysAgo);
        const reviewDate = new Date(review.review_date || review.created_at);
        if (reviewDate < cutoff) return false;
      }

      return true;
    });
  }, [reviews, platformFilter, ratingFilter, dateFilter]);

  const hasActiveFilters =
    platformFilter !== "all" || ratingFilter !== "all" || dateFilter !== "all";

  const clearFilters = () => {
    setPlatformFilter("all");
    setRatingFilter("all");
    setDateFilter("all");
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Highlighted Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Your best reviews, curated for reporting.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Trophy}
              title="No client selected"
              description="Select a client from the header to view their highlighted reviews."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Highlighted Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Loading highlighted reviews...
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-36 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-5 w-16 rounded bg-muted animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded bg-muted animate-pulse" />
                  <div className="h-3 w-full rounded bg-muted animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Highlighted Reviews</h2>
          <p className="text-sm text-muted-foreground">
            {selectedClientName}&apos;s curated reviews for reporting
            {reviews.length > 0 && (
              <span className="ml-1 font-medium text-foreground">
                ({reviews.length} total{hasActiveFilters ? `, ${filteredReviews.length} shown` : ""})
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={filteredReviews.length === 0}
          className="gap-1.5"
        >
          <Trophy className="h-3.5 w-3.5" />
          Export for Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter:</span>
        </div>

        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {platformOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            {ratingOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {dateOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Content */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Trophy}
              title="No highlighted reviews"
              description="Highlight your best reviews from the review feed to showcase them here."
              action={
                <Link
                  href="/dashboard/reviews/feed"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Go to Review Feed
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Filter}
              title="No reviews match filters"
              description="Try adjusting your filters to see highlighted reviews."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((review) => (
            <Card
              key={review.id}
              className="border-amber-500/20 relative group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {review.platform.replace(/_/g, " ")}
                    </Badge>
                    {review.sentiment && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] capitalize",
                          getSentimentVariant(review.sentiment)
                        )}
                      >
                        {review.sentiment}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {review.review_url && (
                      <a
                        href={review.review_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Open original review"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleUnhighlight(review.id)}
                      disabled={removingId === review.id}
                      className="relative z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                      title="Remove highlight"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Star Rating */}
                {renderStars(review.rating)}

                {/* Title */}
                {review.title && (
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {review.title}
                  </p>
                )}

                {/* Body snippet */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                  {review.body_text}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
                  <span className="font-medium">{review.author}</span>
                  <span>
                    {new Date(
                      review.review_date || review.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>

              {/* Card link overlay */}
              <Link
                href={`/dashboard/reviews/${review.id}`}
                className="absolute inset-0 rounded-lg"
                aria-label={`View review by ${review.author}`}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
