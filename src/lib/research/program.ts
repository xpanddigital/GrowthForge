// ═══════════════════════════════════════════════════════════════════════
//  AI Visibility Index Research Program — hub-level metadata
//
//  This file is the single source of truth for the /research master hub.
//  Add a new study by appending to `studies`. Add a monthly update by
//  prepending to `researchUpdates` (newest first).
//
//  Both arrays are typed; the hub page renders them as a timeline + a
//  changelog. Once a study moves from "in-progress" → "published",
//  flip its status and set publishedAt.
// ═══════════════════════════════════════════════════════════════════════

export type StudyStatus =
  | "published"
  | "in-progress"
  | "in-recruitment"
  | "planned";

export interface Study {
  id: string;            // URL slug fragment under /research
  number: number;        // 1, 2, 3, ...
  status: StudyStatus;
  href: string | null;   // null if not yet linkable
  date: string;          // human-readable timeframe (e.g. "April 2026", "Q3 2026")
  title: string;
  subtitle: string;
  headlineFinding: string;
  stats: { value: string; label: string }[];
  hueAccent?: "purple" | "warm" | "ink";
}

export const studies: Study[] = [
  {
    id: "q1-2026-ai-visibility-index",
    number: 1,
    status: "published",
    href: "/research/q1-2026-ai-visibility-index",
    date: "April 2026",
    title: "AI Visibility Index",
    subtitle:
      "The baseline. Which businesses get recommended by AI models — and why.",
    headlineFinding:
      "66% of businesses are completely invisible to AI. Domain Authority (r=0.337) and Google reviews (r=0.333) are the strongest single predictors.",
    stats: [
      { value: "1,004", label: "businesses" },
      { value: "10", label: "industries" },
      { value: "5", label: "AI models" },
      { value: "95k+", label: "data points" },
    ],
    hueAccent: "purple",
  },
  {
    id: "q2-2026-off-page-decomposition",
    number: 2,
    status: "published",
    href: "/research/q2-2026-off-page-decomposition",
    date: "April 2026",
    title: "The Off-Page AI Visibility Index",
    subtitle:
      "What's INSIDE Domain Authority? Decomposing the strongest predictor into actionable off-page signals.",
    headlineFinding:
      "Reddit's predictive power collapsed from r=0.333 to r=0.000 once we controlled for general multi-platform presence. Directory presence (r=0.391) is the new #1 predictor — beating DA itself.",
    stats: [
      { value: "2,729", label: "businesses" },
      { value: "14", label: "industries" },
      { value: "4", label: "markets" },
      { value: "278k+", label: "data points" },
    ],
    hueAccent: "purple",
  },
  {
    id: "q3-2026-controlled-intervention",
    number: 3,
    status: "in-recruitment",
    href: null,
    date: "May–July 2026",
    title: "Layer 3: Controlled Intervention",
    subtitle:
      "Phase 2 was observational. Phase 3 is causal. The first controlled before-and-after experiment in GEO.",
    headlineFinding:
      "25–30 businesses · 60-day intervention · two dose groups · pre-registered success thresholds. Result published regardless of direction — including null results.",
    stats: [
      { value: "25–30", label: "participants" },
      { value: "60", label: "days" },
      { value: "6", label: "metric deltas" },
      { value: "Pre-reg", label: "thresholds" },
    ],
    hueAccent: "warm",
  },
  {
    id: "q4-2026-rebaseline",
    number: 4,
    status: "planned",
    href: null,
    date: "October 2026",
    title: "Re-baseline + Layer 4",
    subtitle:
      "Quarterly re-run of the full Layer 1+2 pipeline against the same 2,729 businesses. Tracks how AI visibility distributions shift over six months. Plus Layer 4 — competitor delta tracking.",
    headlineFinding:
      "What changed in 6 months? Did the visible stay visible? Did Layer 3 interventions move the needle? Quarterly cadence — same methodology, same sample, fresh data.",
    stats: [
      { value: "Same", label: "sample" },
      { value: "Q4 ’26", label: "ships" },
      { value: "Quarterly", label: "cadence" },
      { value: "5+", label: "AI models" },
    ],
    hueAccent: "ink",
  },
];

// ─── Monthly research updates (newest first) ───
//
// Format: prepend a new entry each month with a dated update. The hub
// renders this as a vertical changelog. Keep entries punchy — one
// quotable line per update.

export type UpdateKind =
  | "study-published"
  | "milestone"
  | "explorer"
  | "press"
  | "operations";

export interface ResearchUpdate {
  date: string;         // ISO yyyy-mm-dd
  kind: UpdateKind;
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
}

export const researchUpdates: ResearchUpdate[] = [
  {
    date: "2026-04-27",
    kind: "study-published",
    title: "Study 2 shipped — Off-Page Decomposition",
    body:
      "The contrarian sequel to Study 1. Reddit's predictive power collapses to r=0.000 once we control for general multi-platform presence. Directory count overtakes Domain Authority as the #1 raw predictor of AI visibility.",
    href: "/research/q2-2026-off-page-decomposition",
    hrefLabel: "Read the study",
  },
  {
    date: "2026-04-27",
    kind: "explorer",
    title: "Interactive explorer launched",
    body:
      "Pick any of 30 industry × city slots. See top predictors, addressable citation share, top cited domains, and visible-vs-invisible profile for that exact slot. Browse-only.",
    href: "/research/explore",
    hrefLabel: "Open the explorer",
  },
  {
    date: "2026-04-27",
    kind: "milestone",
    title: "Layer 3 recruitment opening soon",
    body:
      "Recruitment for the controlled intervention trial opens in May. 25–30 spots across SaaS, home services, real estate, personal-finance apps, personal injury law. Email Joel for first access.",
    href: "mailto:joel@xpanddigital.io?subject=Layer%203%20participation%20interest",
    hrefLabel: "Express interest",
  },
  {
    date: "2026-04-10",
    kind: "study-published",
    title: "Study 1 shipped — AI Visibility Index baseline",
    body:
      "1,004 businesses. 10 industries. 95,392 mention checks across ChatGPT, Perplexity, Gemini, Claude, and Google AI Overview. Headline: 66% of businesses are completely invisible to AI.",
    href: "/research/q1-2026-ai-visibility-index",
    hrefLabel: "Read the study",
  },
];

// ─── Hub-level rollup stats ───

export const hubStats = {
  totalStudies: studies.filter((s) => s.status === "published").length,
  totalBusinesses: 2729 + 1004,           // Sum of unique-ish samples (Study 2 superset of Study 1)
  totalDataPoints: "370k+",                // 95k (Study 1) + 278k (Study 2)
  totalIndustryCitySlots: 32,              // From Study 2
  programLaunch: "April 2026",
  cadence: "Quarterly",
  nextUpdate: "May 2026 — Layer 3 recruitment opens",
};

// ─── Cross-study quotable findings (rotated on the hub) ───

export type Finding = {
  text: string;
  studyId: string;
  metric: string;
};

export const crossStudyFindings: Finding[] = [
  {
    text: "Reddit's predictive power collapses from r=0.333 to r=0.000 once you control for general multi-platform presence.",
    studyId: "q2-2026-off-page-decomposition",
    metric: "n=2,545 · strict isolation",
  },
  {
    text: "When a brand IS the URL Perplexity cites, it's 5.5x more likely to be mentioned in the response text.",
    studyId: "q2-2026-off-page-decomposition",
    metric: "n=76,457 · phi=0.167",
  },
  {
    text: "66% of businesses are completely invisible to AI — zero mentions across all five major models.",
    studyId: "q1-2026-ai-visibility-index",
    metric: "n=1,004 · 5 models",
  },
  {
    text: "Directory presence delivers a +16 visibility-point lift specifically in the top Domain Authority quartile.",
    studyId: "q2-2026-off-page-decomposition",
    metric: "DA Q4 (54+) · n=250",
  },
  {
    text: "Off-page leverage varies 30x across verticals — from 0% addressable in Med Spa to 30% in NYC plumbing.",
    studyId: "q2-2026-off-page-decomposition",
    metric: "32 industry × city slots",
  },
  {
    text: "The ChatGPT API doesn't return source URLs. Claims about 'what ChatGPT cites' built from API data are not supported by API data.",
    studyId: "q2-2026-off-page-decomposition",
    metric: "n=66,918 responses · 0 sources",
  },
];
