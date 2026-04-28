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
    kind: "press",
    title: "Combined Phase 1 + 2 white paper published (v1.1)",
    body:
      "Formal academic-format white paper combining both phases of the research program. 38 pages, 20 tables, 6 inline figures, full methodology, pre-registration of Phase 3, and complete reference apparatus. Released alongside the standalone Phase 1 paper.",
    href: "/research#papers",
    hrefLabel: "Download papers",
  },
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

// ─── Published white papers (academic-format) ───
//
// The hub displays these as a "Published Papers" section. Each paper is a
// formal repackaging of one or both phases' findings in academic register
// (abstract, methodology, results, discussion, limitations, references).
//
// PDFs are produced from the canonical DOCX via the user's PDF workflow.
// Both formats live under /public/research/whitepapers/.

export type PaperFormat = "pdf" | "docx";

export interface WhitePaper {
  id: string;
  number: number;             // 1, 2, 3, ...
  status: "published" | "in-progress";
  title: string;
  subtitle: string;
  date: string;               // human-readable
  isoDate: string;            // ISO yyyy-mm-dd for sorting
  version: string;
  pageCount: number;          // estimated typeset
  wordCount: number;
  abstractExcerpt: string;    // first ~200 words of abstract
  citation: string;           // APA-style
  formats: { format: PaperFormat; href: string; bytes: number }[];
  studyIds: string[];         // links back to study deep-dive pages
}

export const whitePapers: WhitePaper[] = [
  {
    id: "phase-1-v1.1",
    number: 1,
    status: "published",
    title:
      "The AI Visibility Index: An Empirical Baseline of Business Visibility Across Five Generative AI Models, Ten Industries, and 1,004 Businesses",
    subtitle: "Phase 1 of the AI Visibility Index Research Program",
    date: "April 10, 2026",
    isoDate: "2026-04-10",
    version: "1.1",
    pageCount: 16,
    wordCount: 5538,
    abstractExcerpt:
      "This paper reports the results of an empirical baseline study examining business visibility within five generative AI search engines: ChatGPT (gpt-4o), Perplexity (sonar-pro), Gemini (2.5-flash), Claude (Sonnet), and Google AI Overview (via SerpApi). Conducted between February and April 2026, the study evaluated 1,004 businesses across ten industry verticals, probing each business against 100 prompt-model combinations and producing 95,392 individual mention checks. Three findings are reported: 66% of the sample is completely invisible to AI; Domain Authority (Pearson r = 0.337) and Google review count (r = 0.333) are the strongest single predictors; and AI models exhibit substantial cross-model disagreement on which businesses to recommend.",
    citation:
      "House, J. (2026). The AI Visibility Index: An empirical baseline of business visibility across five generative AI models, ten industries, and 1,004 businesses (Phase 1 white paper, v1.1). MentionLayer Research.",
    formats: [
      {
        format: "docx",
        href: "/research/whitepapers/ai-visibility-index-phase-1-v1.1.docx",
        bytes: 200_903,
      },
      // PDF will be added when the PDF workflow runs:
      // { format: "pdf", href: "/research/whitepapers/ai-visibility-index-phase-1-v1.1.pdf", bytes: 0 },
    ],
    studyIds: ["q1-2026-ai-visibility-index"],
  },
  {
    id: "combined-v1.1",
    number: 2,
    status: "published",
    title:
      "The AI Visibility Index: A Cross-Market Empirical Study of Generative Engine Optimization Signals Across 2,729 Businesses, Five AI Models, Fourteen Industries, and Thirty-Two Industry-Market Slots",
    subtitle:
      "Phase 1 + Phase 2 Combined Findings, with Pre-Registration of Phase 3 Controlled Intervention",
    date: "April 27, 2026",
    isoDate: "2026-04-27",
    version: "1.1",
    pageCount: 38,
    wordCount: 13510,
    abstractExcerpt:
      "This study examines the empirical predictors of business visibility within generative search engines, applying OLS-residual partial-correlation methodology to disentangle the independent contributions of 24 measurable off-page signals. Phase 2 (n = 2,729) finds that directory presence (r = 0.391) outranks Domain Authority (r = 0.338) as the top raw predictor, but no single off-page signal exceeds r = 0.10 in strict isolation; Reddit's predictive power collapses from r = 0.333 to r = 0.000 once general multi-platform presence is controlled for. The two AI models that return source URLs (Perplexity, Google AI Overview) exhibit a 5.5× lift in mention probability when the brand is the cited source. Phase 3 controlled-intervention design is pre-registered.",
    citation:
      "House, J. (2026). The AI Visibility Index: A cross-market empirical study of generative engine optimization signals across 2,729 businesses, five AI models, fourteen industries, and thirty-two industry-market slots (Phase 1 + 2 combined white paper, v1.1). MentionLayer Research.",
    formats: [
      {
        format: "docx",
        href: "/research/whitepapers/ai-visibility-index-combined-v1.1.docx",
        bytes: 709_818,
      },
      // PDF coming via user's workflow:
      // { format: "pdf", href: "/research/whitepapers/ai-visibility-index-combined-v1.1.pdf", bytes: 0 },
    ],
    studyIds: ["q1-2026-ai-visibility-index", "q2-2026-off-page-decomposition"],
  },
];

// Helper for the hub to display the latest paper
export const latestPaper = whitePapers[whitePapers.length - 1];

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
