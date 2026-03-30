"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Star,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  Globe,
  AlertTriangle,
  Plus,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface ReviewProfile {
  id: string;
  platform: string;
  profile_url: string | null;
  total_reviews: number;
  average_rating: number | null;
  velocity_30d: number;
  last_scraped_at: string | null;
}

interface ReviewSnapshot {
  id: string;
  snapshot_date: string;
  total_reviews: number;
  average_rating: number | null;
  velocity_30d: number;
  sentiment_positive: number;
  sentiment_neutral: number;
  sentiment_negative: number;
  authority_score: number | null;
}

interface ReviewCompetitor {
  id: string;
  name: string;
  total_reviews: number;
  average_rating: number | null;
  platforms: number;
}

interface FlaggedReview {
  id: string;
  platform: string;
  author: string;
  rating: number;
  title: string | null;
  body_preview: string;
  sentiment: string;
  created_at: string;
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

function getRatingColor(rating: number | null): string {
  if (rating === null) return "text-muted-foreground";
  if (rating >= 4.0) return "text-emerald-500";
  if (rating >= 3.0) return "text-amber-500";
  return "text-red-500";
}

function renderStars(rating: number | null) {
  if (rating === null) return null;
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
    </div>
  );
}

export default function ReviewsPage() {
  useEffect(() => { document.title = "Review Engine — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [profiles, setProfiles] = useState<ReviewProfile[]>([]);
  const [snapshots, setSnapshots] = useState<ReviewSnapshot[]>([]);
  const [competitors, setCompetitors] = useState<ReviewCompetitor[]>([]);
  const [flaggedReviews, setFlaggedReviews] = useState<FlaggedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const [profilesRes, snapshotsRes, competitorsRes, flaggedRes] = await Promise.all([
        fetch(`/api/reviews/profiles?clientId=${selectedClientId}`),
        fetch(`/api/reviews/snapshots?clientId=${selectedClientId}&limit=12`),
        fetch(`/api/reviews/competitors?clientId=${selectedClientId}`),
        fetch(`/api/reviews/feed?clientId=${selectedClientId}&flagged=true&limit=5`),
      ]);

      if (profilesRes.ok) {
        const data = await profilesRes.json();
        setProfiles(data.profiles || data.data || []);
      }
      if (snapshotsRes.ok) {
        const data = await snapshotsRes.json();
        setSnapshots(data.snapshots || data.data || []);
      }
      if (competitorsRes.ok) {
        const data = await competitorsRes.json();
        setCompetitors(data.competitors || data.data || []);
      }
      if (flaggedRes.ok) {
        const data = await flaggedRes.json();
        setFlaggedReviews(data.reviews || data.data || []);
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

  const handleScan = async () => {
    if (!selectedClientId) return;
    setScanning(true);
    try {
      await fetch("/api/reviews/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      setTimeout(() => loadData(), 3000);
    } catch {
      // handle error
    } finally {
      setScanning(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">Review Engine<Link href="/dashboard/academy/review-engine" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
          <p className="text-sm text-muted-foreground">
            Monitor and manage reviews across key platforms.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Star}
            title="No client selected"
            description="Select a client from the header to view their review dashboard."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">Review Engine<Link href="/dashboard/academy/review-engine" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
          <p className="text-sm text-muted-foreground">Loading review data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 h-32 animate-pulse" />
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-6 h-64 animate-pulse" />
      </div>
    );
  }

  // Compute aggregates
  const latestSnapshot = snapshots.length > 0 ? snapshots[0] : null;
  const totalReviews = profiles.reduce((sum, p) => sum + p.total_reviews, 0);
  const weightedRating = profiles.reduce((sum, p) => sum + (p.average_rating || 0) * p.total_reviews, 0);
  const avgRating = totalReviews > 0 ? weightedRating / totalReviews : null;
  const totalVelocity = profiles.reduce((sum, p) => sum + p.velocity_30d, 0);
  const platformCount = profiles.length;
  const authorityScore = latestSnapshot?.authority_score ?? null;

  // Velocity chart data (simple bar representation from snapshots)
  const velocityData = [...snapshots].reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">Review Engine<Link href="/dashboard/academy/review-engine" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
          <p className="text-sm text-muted-foreground">
            {selectedClientName}&apos;s review presence and reputation
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/reviews/campaigns/new"
            className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Campaign
          </Link>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", scanning && "animate-spin")} />
            {scanning ? "Scanning..." : "Run Scan"}
          </button>
        </div>
      </div>

      {/* Authority Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className={cn("text-3xl font-bold tabular-nums", getScoreColor(authorityScore))}>
              {authorityScore !== null ? authorityScore : "\u2014"}
            </div>
            <span className="text-sm text-muted-foreground">/100</span>
            <p className="text-xs font-medium text-foreground mt-1">Authority Score</p>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="rounded-full bg-muted p-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">{totalReviews}</div>
              <span className="text-xs text-muted-foreground">Total Reviews</span>
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="rounded-full bg-muted p-2">
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-bold tabular-nums", getRatingColor(avgRating))}>
                {avgRating !== null ? avgRating.toFixed(1) : "\u2014"}
              </div>
              <span className="text-xs text-muted-foreground">Avg Rating</span>
              {renderStars(avgRating)}
            </div>
          </div>
        </div>

        {/* Velocity */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="rounded-full bg-muted p-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">{totalVelocity.toFixed(1)}</div>
              <span className="text-xs text-muted-foreground">Velocity (30d)</span>
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="rounded-full bg-muted p-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">{platformCount}</div>
              <span className="text-xs text-muted-foreground">Platforms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Summary Grid */}
      {profiles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Platform Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-lg border border-border bg-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {profile.platform.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderStars(profile.average_rating)}
                      <span className={cn("text-xs font-medium tabular-nums", getRatingColor(profile.average_rating))}>
                        {profile.average_rating !== null ? profile.average_rating.toFixed(1) : "\u2014"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums">{profile.total_reviews}</div>
                  <span className="text-[10px] text-muted-foreground">
                    +{profile.velocity_30d}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Gap Bars */}
      {competitors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Competitor Comparison</h3>
            <Link
              href="/dashboard/reviews/competitors"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View All Competitors
            </Link>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            {/* Client bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-primary">{selectedClientName} (You)</span>
                <span className="tabular-nums text-foreground">{totalReviews} reviews</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, competitors.length > 0 ? (totalReviews / Math.max(...competitors.map((c) => c.total_reviews), totalReviews)) * 100 : 100)}%`,
                  }}
                />
              </div>
            </div>
            {competitors.slice(0, 5).map((comp) => {
              const maxReviews = Math.max(...competitors.map((c) => c.total_reviews), totalReviews);
              return (
                <div key={comp.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{comp.name}</span>
                    <span className="tabular-nums text-foreground">{comp.total_reviews} reviews</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-muted-foreground/40 transition-all"
                      style={{ width: `${(comp.total_reviews / maxReviews) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Velocity Chart */}
      {velocityData.length > 1 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Review Velocity Trend</h3>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-end gap-1 h-32">
              {velocityData.map((snap) => {
                const maxVelocity = Math.max(...velocityData.map((s) => s.velocity_30d), 1);
                const height = (snap.velocity_30d / maxVelocity) * 100;
                return (
                  <div key={snap.id} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                      <div
                        className="w-full max-w-8 rounded-t bg-primary/70 hover:bg-primary transition-colors"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${snap.velocity_30d} reviews - ${new Date(snap.snapshot_date).toLocaleDateString(undefined, { month: "short" })}`}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground tabular-nums">
                      {new Date(snap.snapshot_date).toLocaleDateString(undefined, { month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Breakdown */}
      {latestSnapshot && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Sentiment Breakdown</h3>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-6">
              {[
                { label: "Positive", value: latestSnapshot.sentiment_positive, color: "bg-emerald-500" },
                { label: "Neutral", value: latestSnapshot.sentiment_neutral, color: "bg-amber-500" },
                { label: "Negative", value: latestSnapshot.sentiment_negative, color: "bg-red-500" },
              ].map((item) => {
                const total =
                  latestSnapshot.sentiment_positive +
                  latestSnapshot.sentiment_neutral +
                  latestSnapshot.sentiment_negative;
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.label} className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-foreground tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", item.color)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{item.value} reviews</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Flagged Reviews */}
      {flaggedReviews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Flagged Reviews</h3>
            <Link
              href="/dashboard/reviews/feed?flagged=true"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View All Flagged
            </Link>
          </div>
          <div className="space-y-2">
            {flaggedReviews.map((review) => (
              <Link
                key={review.id}
                href={`/dashboard/reviews/${review.id}`}
                className="block rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {review.platform.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">by {review.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
                {review.title && (
                  <p className="text-sm font-medium text-foreground mt-1">{review.title}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {review.body_preview}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no profiles exist */}
      {profiles.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No review data yet</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Run a review scan to discover {selectedClientName}&apos;s review presence across
                Google, Trustpilot, G2, and other platforms.
              </p>
            </div>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", scanning && "animate-spin")} />
              {scanning ? "Scanning..." : "Run First Scan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
