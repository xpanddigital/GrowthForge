export interface MonthlySnapshot {
  month: string; // "2026-04"
  label: string; // "Apr 2026"
  totalBusinesses: number;
  invisiblePct: number;
  avgVisibilityScore: number;
  topPerformerAvgScore: number;
  modelCoverage: {
    chatgpt: number;
    perplexity: number;
    gemini: number;
    claude: number;
    googleAIO: number;
  };
  topCorrelations: Array<{
    factor: string;
    correlation: number;
  }>;
}

export interface IndustryBreakdown {
  industry: string;
  label: string;
  total: number;
  invisiblePct: number;
  avgScore: number;
}

// ─── April 2026 Snapshot (derived from CSV) ───────────────────

export const snapshots: MonthlySnapshot[] = [
  {
    month: "2026-04",
    label: "Apr 2026",
    totalBusinesses: 1000,
    invisiblePct: 65.9,
    avgVisibilityScore: 11.7,
    topPerformerAvgScore: 80.5,
    modelCoverage: {
      chatgpt: 15.9,
      perplexity: 22.5,
      gemini: 15.5,
      claude: 13.0,
      googleAIO: 15.5,
    },
    topCorrelations: [
      { factor: "Google Review Count", correlation: 0.306 },
      { factor: "Blog Post Count", correlation: 0.12 },
      { factor: "Schema Markup Score", correlation: 0.069 },
      { factor: "Total Indexed Pages", correlation: -0.02 },
      { factor: "Robots.txt Score", correlation: -0.008 },
    ],
  },
  // Joel: add new months here after each study rerun
  // Copy the object above, update month/label and all values
];

// ─── Industry breakdown (April 2026) ─────────────────────────

export const industryBreakdown: IndustryBreakdown[] = [
  { industry: "personal_injury_law", label: "Personal Injury Law", total: 100, invisiblePct: 29, avgScore: 16.2 },
  { industry: "accounting", label: "Accounting", total: 100, invisiblePct: 61, avgScore: 15.2 },
  { industry: "digital_marketing", label: "Digital Marketing", total: 104, invisiblePct: 65, avgScore: 14.8 },
  { industry: "real_estate", label: "Real Estate", total: 100, invisiblePct: 61, avgScore: 12.9 },
  { industry: "financial_advisors", label: "Financial Advisors", total: 100, invisiblePct: 70, avgScore: 12.0 },
  { industry: "saas_project_management", label: "SaaS (Project Mgmt)", total: 96, invisiblePct: 73, avgScore: 11.5 },
  { industry: "saas_crm", label: "SaaS (CRM)", total: 100, invisiblePct: 74, avgScore: 10.1 },
  { industry: "dental", label: "Dental", total: 100, invisiblePct: 67, avgScore: 9.3 },
  { industry: "home_services", label: "Home Services", total: 100, invisiblePct: 75, avgScore: 9.1 },
  { industry: "med_spa", label: "Med Spa", total: 100, invisiblePct: 84, avgScore: 5.7 },
];

// ─── Key stats for hero / data cards ─────────────────────────

export const keyStats = {
  totalBusinesses: 1000,
  totalDataPoints: 95392,
  aiModels: 5,
  industries: 10,
  invisiblePct: 65.9,
  allFiveModelsPct: 4.0,
  reviewCliff: {
    threshold: 1000,
    belowAvgScore: 9.8,
    aboveAvgScore: 23.6,
    belowCount: 864,
    aboveCount: 136,
  },
};
