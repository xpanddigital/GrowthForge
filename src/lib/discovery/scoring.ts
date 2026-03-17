// ============================================
// Opportunity Scoring
//
// Calculates a composite score (0-100) for each thread
// based on multiple signals that indicate citation opportunity value.
//
// Formula:
//   opportunity_score = (
//     relevance_score * 0.35 +
//     google_authority * 0.25 +
//     recency_score * 0.20 +
//     engagement_score * 0.20
//   )
//
// Threads scoring >= 70 auto-advance to status='queued'
// Threads scoring 40-69 stay as status='classified' for manual review
// Threads scoring < 40 are auto-skipped
// ============================================

/** Scoring weights for the composite opportunity score */
const WEIGHTS = {
  relevance: 0.35,
  googleAuthority: 0.25,
  recency: 0.20,
  engagement: 0.20,
} as const;

/** Auto-queue threshold: threads above this score skip manual review */
export const AUTO_QUEUE_THRESHOLD = 70;

/** Auto-skip threshold: threads below this score are automatically skipped */
export const AUTO_SKIP_THRESHOLD = 40;

// ============================================
// Thread Input Type (partial thread data needed for scoring)
// ============================================

interface ScoringInput {
  /** AI-assigned relevance score (0-100). Null if not yet classified. */
  relevance_score: number | null;
  /** Google SERP position where this thread was found (1-100). Null if found via AI probe. */
  google_position: number | null;
  /** When the thread was originally posted. Null if unknown. */
  thread_date: string | null;
  /** Number of comments on the thread. */
  comment_count: number;
}

// ============================================
// Main Scoring Function
// ============================================

/**
 * Calculates the composite opportunity score for a thread.
 *
 * The score combines four signals:
 * - Relevance (35%): How relevant the thread is to the client's brand (AI-assigned)
 * - Google Authority (25%): SERP position — higher-ranked threads have more visibility
 * - Recency (20%): Fresher threads are more valuable for engagement
 * - Engagement (20%): More comments = more visibility and natural place for a response
 *
 * @param thread - Thread data needed for scoring
 * @returns Composite opportunity score (0-100, integer)
 */
export function calculateOpportunityScore(thread: ScoringInput): number {
  const relevance = thread.relevance_score ?? 50; // Default to moderate if unclassified
  const authority = calculateGoogleAuthority(thread.google_position);
  const recency = calculateRecencyScore(thread.thread_date);
  const engagement = calculateEngagementScore(thread.comment_count);

  const rawScore =
    relevance * WEIGHTS.relevance +
    authority * WEIGHTS.googleAuthority +
    recency * WEIGHTS.recency +
    engagement * WEIGHTS.engagement;

  // Clamp to 0-100 and round to integer
  return Math.round(Math.min(100, Math.max(0, rawScore)));
}

/**
 * Determines the recommended thread status based on the opportunity score.
 *
 * @param score - The opportunity score (0-100)
 * @returns Recommended status: 'queued', 'classified', or 'skipped'
 */
export function getStatusForScore(
  score: number
): "queued" | "classified" | "skipped" {
  if (score >= AUTO_QUEUE_THRESHOLD) return "queued";
  if (score >= AUTO_SKIP_THRESHOLD) return "classified";
  return "skipped";
}

// ============================================
// Individual Score Components
// ============================================

/**
 * Calculates the Google authority score based on SERP position.
 *
 * Threads ranking higher in Google have more organic visibility,
 * making them more valuable for citation placement.
 *
 * Scoring curve:
 *   Position 1:    100
 *   Position 3:    85
 *   Position 5:    70
 *   Position 10:   50
 *   Position 20:   30
 *   Position 50:   10
 *   Position 100+: 5
 *   No position:   40 (default for AI-probed threads)
 *
 * @param position - Google SERP position (1-based), null if not from SERP
 * @returns Authority score (0-100)
 */
export function calculateGoogleAuthority(
  position: number | null
): number {
  if (position === null || position === undefined) {
    // Thread was found via AI probe, not SERP
    // Give a moderate default — AI-referenced threads have implicit authority
    return 40;
  }

  if (position <= 0) return 0;
  if (position === 1) return 100;
  if (position === 2) return 92;
  if (position === 3) return 85;
  if (position <= 5) return 70;
  if (position <= 10) return 50;
  if (position <= 20) return 30;
  if (position <= 50) return 10;

  return 5;
}

/**
 * Calculates the recency score based on the thread's post date.
 *
 * Fresher threads are more valuable because:
 * 1. They're more likely to still accept new comments
 * 2. New responses appear more natural
 * 3. Google may give recency weight to the page
 *
 * Scoring tiers:
 *   < 7 days:   100
 *   < 14 days:  90
 *   < 30 days:  80
 *   < 60 days:  65
 *   < 90 days:  50
 *   < 180 days: 35
 *   < 1 year:   30
 *   > 1 year:   10
 *   Unknown:    50 (moderate default)
 *
 * @param threadDate - ISO date string of when the thread was posted
 * @returns Recency score (0-100)
 */
export function calculateRecencyScore(
  threadDate: string | null
): number {
  if (!threadDate) return 50; // Unknown date — moderate default

  const now = new Date();
  const posted = new Date(threadDate);

  // Validate the date
  if (isNaN(posted.getTime())) return 50;

  // Future dates get max score (likely a timezone issue)
  if (posted > now) return 100;

  const daysSincePosted = Math.floor(
    (now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSincePosted < 7) return 100;
  if (daysSincePosted < 14) return 90;
  if (daysSincePosted < 30) return 80;
  if (daysSincePosted < 60) return 65;
  if (daysSincePosted < 90) return 50;
  if (daysSincePosted < 180) return 35;
  if (daysSincePosted < 365) return 30;

  return 10;
}

/**
 * Calculates the engagement score based on comment count.
 *
 * Threads with more comments indicate an active discussion where
 * a new response is more natural and valuable.
 *
 * Uses a logarithmic scale to prevent extreme comment counts
 * from dominating the score.
 *
 * Scoring tiers:
 *   0 comments:     10  (no discussion yet — risky)
 *   1-4 comments:   20  (small thread)
 *   5-9 comments:   40  (decent discussion)
 *   10-19 comments: 50  (good discussion)
 *   20-49 comments: 65  (active thread)
 *   50-99 comments: 75  (popular thread)
 *   100-199:        85  (hot thread)
 *   200-499:        92  (viral territory)
 *   500+:           100 (extremely active)
 *
 * @param commentCount - Number of comments on the thread
 * @returns Engagement score (0-100)
 */
export function calculateEngagementScore(commentCount: number): number {
  if (commentCount <= 0) return 10;
  if (commentCount < 5) return 20;
  if (commentCount < 10) return 40;
  if (commentCount < 20) return 50;
  if (commentCount < 50) return 65;
  if (commentCount < 100) return 75;
  if (commentCount < 200) return 85;
  if (commentCount < 500) return 92;

  return 100;
}

// ============================================
// Batch Scoring
// ============================================

interface ScoredThread<T extends ScoringInput> {
  thread: T;
  opportunityScore: number;
  recommendedStatus: "queued" | "classified" | "skipped";
  scoreBreakdown: {
    relevance: number;
    googleAuthority: number;
    recency: number;
    engagement: number;
  };
}

/**
 * Scores a batch of threads and returns them with their opportunity scores
 * and recommended statuses.
 *
 * @param threads - Array of threads to score
 * @returns Array of threads with scores and status recommendations
 */
export function scoreThreadBatch<T extends ScoringInput>(
  threads: T[]
): ScoredThread<T>[] {
  return threads.map((thread) => {
    const relevanceComponent = (thread.relevance_score ?? 50) * WEIGHTS.relevance;
    const authorityComponent =
      calculateGoogleAuthority(thread.google_position) * WEIGHTS.googleAuthority;
    const recencyComponent =
      calculateRecencyScore(thread.thread_date) * WEIGHTS.recency;
    const engagementComponent =
      calculateEngagementScore(thread.comment_count) * WEIGHTS.engagement;

    const opportunityScore = Math.round(
      Math.min(
        100,
        Math.max(
          0,
          relevanceComponent +
            authorityComponent +
            recencyComponent +
            engagementComponent
        )
      )
    );

    return {
      thread,
      opportunityScore,
      recommendedStatus: getStatusForScore(opportunityScore),
      scoreBreakdown: {
        relevance: Math.round(relevanceComponent),
        googleAuthority: Math.round(authorityComponent),
        recency: Math.round(recencyComponent),
        engagement: Math.round(engagementComponent),
      },
    };
  });
}

/**
 * Sorts scored threads by opportunity score (highest first).
 */
export function sortByOpportunity<T extends ScoringInput>(
  scoredThreads: ScoredThread<T>[]
): ScoredThread<T>[] {
  return [...scoredThreads].sort(
    (a, b) => b.opportunityScore - a.opportunityScore
  );
}
