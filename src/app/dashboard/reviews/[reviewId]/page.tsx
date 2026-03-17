"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  ExternalLink,
  Flag,
  Sparkles,
  MessageSquare,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface ReviewDetail {
  id: string;
  platform: string;
  author: string;
  rating: number;
  title: string | null;
  body_text: string;
  sentiment: string | null;
  sentiment_score: number | null;
  sentiment_topics: string[];
  sentiment_key_phrases: string[];
  is_highlighted: boolean;
  is_flagged: boolean;
  has_owner_response: boolean;
  owner_response_text: string | null;
  owner_response_date: string | null;
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
            "h-4 w-4",
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

function getScoreBarColor(score: number | null): string {
  if (score === null) return "bg-muted-foreground/30";
  if (score >= 0.6) return "bg-emerald-500";
  if (score >= 0.3) return "bg-amber-500";
  return "bg-red-500";
}

export default function ReviewDetailPage() {
  const params = useParams();
  const reviewId = params.reviewId as string;
  const { selectedClientId } = useClientContext();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [editedResponse, setEditedResponse] = useState("");
  const [copied, setCopied] = useState(false);
  const [togglingHighlight, setTogglingHighlight] = useState(false);
  const [togglingFlag, setTogglingFlag] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews/feed/${reviewId}?clientId=${selectedClientId}`
      );
      if (res.ok) {
        const data = await res.json();
        setReview(data.review || data.data || null);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, reviewId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateResponse = async () => {
    if (!review) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/generate-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.response || data.text || "";
        setGeneratedResponse(text);
        setEditedResponse(text);
      }
    } catch {
      // handle error
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleHighlight = async () => {
    if (!review) return;
    setTogglingHighlight(true);
    try {
      await fetch(`/api/reviews/feed/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          is_highlighted: !review.is_highlighted,
        }),
      });
      setReview((prev) =>
        prev ? { ...prev, is_highlighted: !prev.is_highlighted } : prev
      );
    } catch {
      // handle error
    } finally {
      setTogglingHighlight(false);
    }
  };

  const handleToggleFlag = async () => {
    if (!review) return;
    setTogglingFlag(true);
    try {
      await fetch(`/api/reviews/feed/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          is_flagged: !review.is_flagged,
        }),
      });
      setReview((prev) =>
        prev ? { ...prev, is_flagged: !prev.is_flagged } : prev
      );
    } catch {
      // handle error
    } finally {
      setTogglingFlag(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Review Detail</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/reviews/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Feed
        </Link>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={MessageSquare}
            title="Review not found"
            description="This review may have been removed or is not available."
          />
        </div>
      </div>
    );
  }

  const sentimentScorePercent = review.sentiment_score !== null
    ? Math.round(review.sentiment_score * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/reviews/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Feed
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="capitalize">
              {review.platform.replace(/_/g, " ")}
            </Badge>
            {renderStars(review.rating)}
            {review.sentiment && (
              <Badge
                variant="outline"
                className={cn("capitalize", getSentimentColor(review.sentiment))}
              >
                {review.sentiment}
              </Badge>
            )}
          </div>
          {review.title && (
            <h2 className="text-lg font-semibold mt-2">{review.title}</h2>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>by {review.author}</span>
            <span>&middot;</span>
            <span>{new Date(review.review_date || review.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleHighlight}
            disabled={togglingHighlight}
            className={cn(
              "rounded-md p-2 transition-colors disabled:opacity-50",
              review.is_highlighted
                ? "bg-amber-500/10 text-amber-400"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            title={review.is_highlighted ? "Remove highlight" : "Highlight review"}
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleFlag}
            disabled={togglingFlag}
            className={cn(
              "rounded-md p-2 transition-colors disabled:opacity-50",
              review.is_flagged
                ? "bg-red-500/10 text-red-400"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            title={review.is_flagged ? "Remove flag" : "Flag review"}
          >
            <Flag className="h-4 w-4" />
          </button>
          {review.review_url && (
            <a
              href={review.review_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Open original review"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Review Body */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {review.body_text}
        </p>
      </div>

      {/* Sentiment Analysis */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-medium text-foreground">Sentiment Analysis</h3>

        {/* Score Bar */}
        {sentimentScorePercent !== null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Sentiment Score</span>
              <span className="font-medium text-foreground tabular-nums">
                {sentimentScorePercent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  getScoreBarColor(review.sentiment_score)
                )}
                style={{ width: `${sentimentScorePercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Topics */}
        {review.sentiment_topics && review.sentiment_topics.length > 0 && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Topics</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {review.sentiment_topics.map((topic, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Key Phrases */}
        {review.sentiment_key_phrases && review.sentiment_key_phrases.length > 0 && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Key Phrases</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {review.sentiment_key_phrases.map((phrase, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  &ldquo;{phrase}&rdquo;
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Existing Owner Response */}
      {review.has_owner_response && review.owner_response_text && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-emerald-500">Owner Response</h3>
            {review.owner_response_date && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(review.owner_response_date).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {review.owner_response_text}
          </p>
        </div>
      )}

      {/* Generate Response */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Generate Response</h3>
          <button
            onClick={handleGenerateResponse}
            disabled={generating}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {generating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <MessageSquare className="h-3.5 w-3.5" />
                Generate Response
              </>
            )}
          </button>
        </div>

        {generatedResponse && (
          <div className="space-y-3">
            <textarea
              value={editedResponse}
              onChange={(e) => setEditedResponse(e.target.value)}
              rows={8}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors inline-flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!generatedResponse && !generating && (
          <p className="text-xs text-muted-foreground">
            Use AI to generate a professional response to this review. You can edit the generated
            text before copying.
          </p>
        )}
      </div>
    </div>
  );
}
