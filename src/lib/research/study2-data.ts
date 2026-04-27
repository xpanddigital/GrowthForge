// ═══════════════════════════════════════════════════════════════════════
//  Study 2 — The Off-Page AI Visibility Index (Q2 2026)
//
//  All numbers below are sourced directly from the JSON outputs of the
//  Layer 2 statistical pipeline in study-output/. They are publishable
//  values — do NOT recompute or estimate.
//
//  Source files:
//    - layer2-correlations.json
//    - layer2-strict-isolation.json
//    - layer2-citation-correlation.json
//    - layer2-cross-reference.json
//    - layer2-logreg.json
//    - layer2-by-industry.json
//    - source-url-analysis.json
// ═══════════════════════════════════════════════════════════════════════

export const study2Headline = {
  totalBusinesses: 2729,
  industries: 14,
  markets: 4,
  industryCitySlots: 32,
  totalDataPoints: 278000,
  aiModels: 5,
  promptsPerSlot: 20,
  publicationDate: "April 2026",
  studyNumber: 2,
  previousStudy: {
    title: "AI Visibility Index",
    date: "April 10, 2026",
    businesses: 1004,
    dataPoints: 95392,
    headlineFinding: "66% of businesses are completely invisible to AI",
  },
};

// ─── FINDING 1: The new top of the table (raw correlations, n=2,648) ───

export type SignalLayer = "offpage" | "study1" | "spyfu";

export const topRawCorrelations: {
  variable: string;
  label: string;
  r: number;
  n: number;
  layer: SignalLayer;
  isNew?: boolean;
}[] = [
  { variable: "directory_count", label: "Directory presence (count of 12 platforms)", r: 0.391, n: 2648, layer: "offpage", isNew: true },
  { variable: "off_page_composite_score", label: "Off-page composite score", r: 0.384, n: 2648, layer: "offpage", isNew: true },
  { variable: "youtube_mention_count", label: "YouTube third-party mention count", r: 0.350, n: 2648, layer: "offpage", isNew: true },
  { variable: "review_platform_count", label: "Review platforms present", r: 0.340, n: 2648, layer: "offpage", isNew: true },
  { variable: "domain_authority", label: "Domain Authority (Moz)", r: 0.338, n: 998, layer: "study1" },
  { variable: "has_linkedin_company", label: "LinkedIn company page", r: 0.335, n: 2645, layer: "offpage", isNew: true },
  { variable: "has_bbb", label: "BBB profile present", r: 0.335, n: 2648, layer: "offpage", isNew: true },
  { variable: "reddit_mention_count", label: "Reddit mention count", r: 0.333, n: 2645, layer: "offpage", isNew: true },
  { variable: "quora_mention_count", label: "Quora mention count", r: 0.331, n: 2645, layer: "offpage", isNew: true },
  { variable: "has_crunchbase", label: "Crunchbase profile", r: 0.328, n: 2648, layer: "offpage", isNew: true },
  { variable: "has_youtube_channel", label: "Owned YouTube channel", r: 0.326, n: 2648, layer: "offpage", isNew: true },
  { variable: "has_wikipedia", label: "Wikipedia article", r: 0.321, n: 2645, layer: "offpage", isNew: true },
  { variable: "spyfu_domain_strength", label: "SpyFu domain strength", r: 0.306, n: 996, layer: "spyfu", isNew: true },
  { variable: "has_trustpilot", label: "Trustpilot profile", r: 0.305, n: 2648, layer: "offpage", isNew: true },
  { variable: "has_yelp", label: "Yelp profile", r: 0.302, n: 2648, layer: "offpage", isNew: true },
  { variable: "google_review_count", label: "Google review count", r: 0.149, n: 2475, layer: "study1" },
];

// ─── FINDING 2: The Reddit collapse (progressive controls) ───

export const redditDeepDive = [
  { stage: "Raw correlation\n(no controls)", short: "Raw", r: 0.333, n: 2645 },
  { stage: "Controlled for DA only", short: "+DA", r: 0.166, n: 995 },
  { stage: "Controlled for DA\n+ Google reviews", short: "+DA+Reviews", r: 0.135, n: 897 },
  { stage: "Controlled for DA + reviews\n+ on-page content", short: "+Study 1 controls", r: 0.118, n: 845 },
  { stage: "Controlled for ALL OTHER\noff-page signals", short: "+All off-page", r: 0.0, n: 2545 },
  { stage: "Controlled for EVERYTHING\nmeasured (strictest)", short: "+Everything", r: 0.034, n: 795 },
];

// Same decomposition for directory_count — for the "this isn't unique to Reddit" sidebar
export const directoryDeepDive = [
  { stage: "Raw correlation", short: "Raw", r: 0.391, n: 2648 },
  { stage: "Controlled for DA", short: "+DA", r: 0.186, n: 998 },
  { stage: "+DA + Reviews", short: "+DA+Reviews", r: 0.154, n: 899 },
  { stage: "+Study 1 controls", short: "+Study 1", r: 0.132, n: 847 },
  { stage: "+All off-page", short: "+Off-page", r: 0.0, n: 2545 },
  { stage: "+Everything", short: "+Everything", r: 0.0, n: 795 },
];

// ─── FINDING 3: Citation lift on the models that cite ───

export const citationLift = [
  {
    model: "Perplexity",
    n: 76457,
    pMentionGivenCited: 0.2827,
    pMentionGivenNotCited: 0.0517,
    lift: 5.5,
    phi: 0.167,
    perBusinessR: 0.194,
    citationEvents: 1104,
    businessesWithCitation: 131,
    apiReturnsSources: true,
  },
  {
    model: "Google AI Overview",
    n: 29379,
    pMentionGivenCited: 0.1429,
    pMentionGivenNotCited: 0.0347,
    lift: 4.1,
    phi: 0.018,
    perBusinessR: 0.086,
    citationEvents: 29,
    businessesWithCitation: 17,
    apiReturnsSources: true,
  },
  {
    model: "ChatGPT",
    n: 66918,
    pMentionGivenCited: null,
    pMentionGivenNotCited: 0.041,
    lift: null,
    phi: null,
    perBusinessR: 0,
    citationEvents: 0,
    businessesWithCitation: 0,
    apiReturnsSources: false,
  },
  {
    model: "Claude",
    n: 63480,
    pMentionGivenCited: null,
    pMentionGivenNotCited: 0.0374,
    lift: null,
    phi: null,
    perBusinessR: 0,
    citationEvents: 0,
    businessesWithCitation: 0,
    apiReturnsSources: false,
  },
  {
    model: "Gemini",
    n: 30610,
    pMentionGivenCited: null,
    pMentionGivenNotCited: 0.0253,
    lift: null,
    phi: null,
    perBusinessR: 0,
    citationEvents: 0,
    businessesWithCitation: 0,
    apiReturnsSources: false,
  },
];

// ─── FINDING 4: DA-quartile directory lift ───

export const directoryLiftByDAQuartile = [
  { quartile: "Q1", daRange: "DA 1–18", n: 249, lowDir: 1.7, highDir: 3.8, delta: 2.1 },
  { quartile: "Q2", daRange: "DA 18–36", n: 250, lowDir: 10.6, highDir: 9.3, delta: -1.3 },
  { quartile: "Q3", daRange: "DA 36–54", n: 249, lowDir: 13.2, highDir: 14.6, delta: 1.4 },
  { quartile: "Q4", daRange: "DA 54–98", n: 250, lowDir: 11.8, highDir: 28.2, delta: 16.3 },
];

// ─── FINDING 5: Industry × city addressability ───

export const industryAddressability: {
  slot: string;
  label: string;
  market: string;
  addressableShare: number;
  addressable: number;
  total: number;
}[] = [
  { slot: "home_services_chicago", label: "Home Services (Plumbing)", market: "Chicago", addressableShare: 0.297, addressable: 58, total: 195 },
  { slot: "saas_crm", label: "SaaS — CRM", market: "National", addressableShare: 0.266, addressable: 228, total: 856 },
  { slot: "home_services", label: "Home Services (Plumbing)", market: "LA", addressableShare: 0.259, addressable: 93, total: 359 },
  { slot: "personal_finance_apps", label: "Personal Finance Apps", market: "National", addressableShare: 0.254, addressable: 227, total: 894 },
  { slot: "saas_project_management", label: "SaaS — Project Management", market: "National", addressableShare: 0.231, addressable: 452, total: 1953 },
  { slot: "home_services_nyc", label: "Home Services (Plumbing)", market: "NYC", addressableShare: 0.213, addressable: 43, total: 202 },
  { slot: "real_estate", label: "Real Estate", market: "LA", addressableShare: 0.199, addressable: 459, total: 2304 },
  { slot: "real_estate_chicago", label: "Real Estate", market: "Chicago", addressableShare: 0.159, addressable: 115, total: 725 },
  { slot: "dental_chicago", label: "Dental", market: "Chicago", addressableShare: 0.160, addressable: 115, total: 721 },
  { slot: "dental", label: "Dental", market: "LA", addressableShare: 0.140, addressable: 470, total: 3356 },
  { slot: "dental_nyc", label: "Dental", market: "NYC", addressableShare: 0.136, addressable: 80, total: 587 },
  { slot: "personal_injury_law_nyc", label: "Personal Injury Law", market: "NYC", addressableShare: 0.131, addressable: 51, total: 388 },
  { slot: "personal_injury_law_chicago", label: "Personal Injury Law", market: "Chicago", addressableShare: 0.116, addressable: 129, total: 1116 },
  { slot: "personal_injury_law", label: "Personal Injury Law", market: "LA", addressableShare: 0.107, addressable: 541, total: 5051 },
  { slot: "financial_advisors", label: "Financial Advisors", market: "National", addressableShare: 0.066, addressable: 25, total: 377 },
  { slot: "boutique_hospitality", label: "Boutique Hospitality", market: "National", addressableShare: 0.052, addressable: 24, total: 460 },
  { slot: "ecommerce_dtc_baby", label: "E-commerce DTC Baby", market: "National", addressableShare: 0.052, addressable: 63, total: 1216 },
  { slot: "insurance_brokers", label: "Insurance Brokers", market: "National", addressableShare: 0.046, addressable: 45, total: 971 },
  { slot: "home_services_sydney", label: "Home Services (Plumbing)", market: "Sydney", addressableShare: 0.040, addressable: 13, total: 327 },
  { slot: "digital_marketing", label: "Digital Marketing", market: "National", addressableShare: 0.026, addressable: 20, total: 780 },
  { slot: "accounting", label: "Accounting", market: "LA", addressableShare: 0.016, addressable: 21, total: 1309 },
  { slot: "real_estate_sydney", label: "Real Estate", market: "Sydney", addressableShare: 0.011, addressable: 6, total: 571 },
  { slot: "accounting_nyc", label: "Accounting", market: "NYC", addressableShare: 0.007, addressable: 6, total: 866 },
  { slot: "med_spa_nyc", label: "Med Spa", market: "NYC", addressableShare: 0.004, addressable: 4, total: 1088 },
  { slot: "personal_injury_law_sydney", label: "Personal Injury Law", market: "Sydney", addressableShare: 0.0, addressable: 0, total: 774 },
  { slot: "dental_sydney", label: "Dental", market: "Sydney", addressableShare: 0.0, addressable: 0, total: 692 },
  { slot: "med_spa", label: "Med Spa", market: "LA", addressableShare: 0.0, addressable: 0, total: 1167 },
  { slot: "med_spa_chicago", label: "Med Spa", market: "Chicago", addressableShare: 0.0, addressable: 0, total: 1192 },
  { slot: "accounting_chicago", label: "Accounting", market: "Chicago", addressableShare: 0.0, addressable: 0, total: 704 },
];

// ─── FINDING 6: Strict isolation (off-page-only controls, n=2,545) ───

export const strictIsolation = [
  { feature: "has_bbb", label: "BBB profile", r: 0.097 },
  { feature: "press_mention_count_12mo", label: "Press mentions (12mo)", r: -0.065, note: "likely measurement noise" },
  { feature: "has_yelp", label: "Yelp profile", r: 0.052 },
  { feature: "has_google_business", label: "Google Business Profile", r: 0.048 },
  { feature: "has_wikipedia", label: "Wikipedia article", r: 0.046 },
  { feature: "has_trustpilot", label: "Trustpilot profile", r: 0.043 },
  { feature: "has_capterra", label: "Capterra listing", r: -0.039 },
  { feature: "quora_mention_count", label: "Quora mentions", r: 0.034 },
  { feature: "has_linkedin_company", label: "LinkedIn page", r: 0.026 },
  { feature: "has_youtube_channel", label: "YouTube channel", r: 0.023 },
  { feature: "youtube_mention_count", label: "YouTube mentions", r: 0.019 },
  { feature: "has_crunchbase", label: "Crunchbase profile", r: 0.006 },
  { feature: "has_g2", label: "G2 listing", r: -0.002 },
  { feature: "reddit_mention_count", label: "Reddit mentions", r: 0.0, isHero: true },
];

// ─── FINDING 7: Visible vs Invisible profiles ───

export const visibleVsInvisible = {
  visible: {
    n: 401,
    label: "Multi-model visible (≥2 models)",
    avgDirectoryCount: 6.09,
    avgRedditMentions: 7.16,
    avgReviewPlatforms: 3.27,
    youtubePct: 86.8,
    wikipediaPct: 65.3,
    crunchbasePct: 72.6,
    avgComposite: 52.99,
  },
  invisible: {
    n: 1841,
    label: "Invisible (0 models)",
    avgDirectoryCount: 2.67,
    avgRedditMentions: 3.16,
    avgReviewPlatforms: 1.83,
    youtubePct: 46.1,
    wikipediaPct: 26.2,
    crunchbasePct: 31.1,
    avgComposite: 25.84,
  },
};

// Self-audit metrics — the radar chart features
export const profileMetrics = [
  { metric: "Directory count", visibleVal: 6.09, invisibleVal: 2.67, max: 12, format: "raw" as const },
  { metric: "Reddit mentions", visibleVal: 7.16, invisibleVal: 3.16, max: 12, format: "raw" as const },
  { metric: "Review platforms", visibleVal: 3.27, invisibleVal: 1.83, max: 6, format: "raw" as const },
  { metric: "YouTube presence", visibleVal: 86.8, invisibleVal: 46.1, max: 100, format: "pct" as const },
  { metric: "Wikipedia presence", visibleVal: 65.3, invisibleVal: 26.2, max: 100, format: "pct" as const },
  { metric: "Crunchbase presence", visibleVal: 72.6, invisibleVal: 31.1, max: 100, format: "pct" as const },
];

// ─── FINDING 8: Cross-market spotlight (industry × city extremes) ───

export const crossMarketSpotlight: {
  slot: string;
  label: string;
  signal: string;
  r: number;
  insight: string;
}[] = [
  { slot: "home_services_nyc", label: "Home Services — NYC", signal: "off_page_composite", r: 0.683, insight: "Strongest off-page correlation in the entire study. NYC plumbing is the cleanest case for an off-page playbook anywhere." },
  { slot: "home_services_nyc", label: "Home Services — NYC", signal: "directory_count", r: 0.679, insight: "Directory presence alone explains the bulk of visibility variance." },
  { slot: "accounting_nyc", label: "Accounting — NYC", signal: "quora_mention_count", r: 0.674, insight: "Quora is the dominant signal — not Reddit. A Quora-led playbook would outperform anything else." },
  { slot: "accounting_nyc", label: "Accounting — NYC", signal: "directory_count", r: 0.651, insight: "Directories carry the rest of the load." },
  { slot: "real_estate_la", label: "Real Estate — LA", signal: "reddit_mention_count", r: 0.589, insight: "The one industry-city slot where the 'post on Reddit' advice plausibly survives. LA buyers do end up in Reddit threads." },
  { slot: "accounting_la", label: "Accounting — LA", signal: "domain_authority", r: 0.573, insight: "DA still rules in LA accounting. Off-page does not substitute for foundational authority here." },
];

// ─── Source URL category breakdown (where AI actually pulls from) ───
// From source-url-analysis.json — global distribution

export const sourceCategoryBreakdown = [
  { category: "Editorial blogs / publications", count: 3279, pct: 69.2 },
  { category: "Own-site (brand websites)", count: 855, pct: 18.0 },
  { category: "Industry directories", count: 288, pct: 6.1 },
  { category: "YouTube", count: 186, pct: 3.9 },
  { category: "News media", count: 117, pct: 2.5 },
  { category: "G2", count: 7, pct: 0.1 },
  { category: "BBB", count: 2, pct: 0.04 },
  { category: "Wikipedia", count: 2, pct: 0.04 },
  { category: "Quora", count: 1, pct: 0.02 },
  { category: "Reddit", count: 0, pct: 0.0 },
];

// Top industry directories AI actually cites
export const topCitedDirectories = [
  { domain: "zillow.com", count: 59, vertical: "Real Estate" },
  { domain: "justia.com", count: 56, vertical: "Personal Injury Law" },
  { domain: "angi.com", count: 56, vertical: "Home Services" },
  { domain: "zocdoc.com", count: 55, vertical: "Dental / Medical" },
  { domain: "thumbtack.com", count: 27, vertical: "Home Services" },
  { domain: "healthgrades.com", count: 15, vertical: "Dental / Medical" },
  { domain: "realtor.com", count: 7, vertical: "Real Estate" },
  { domain: "lawyers.com", count: 6, vertical: "Personal Injury Law" },
  { domain: "homeadvisor.com", count: 6, vertical: "Home Services" },
  { domain: "avvo.com", count: 1, vertical: "Personal Injury Law" },
];

// ─── Logistic regression coefficients (top 10 by absolute importance) ───

export const logregTopFeatures = [
  { feature: "review_platform_count", layer: "offpage", coef: -0.625, abs: 0.625, note: "L2 redistribution to correlated features" },
  { feature: "spyfu_domain_strength", layer: "spyfu", coef: 0.399, abs: 0.399 },
  { feature: "spyfu_organic_growth_rate", layer: "spyfu", coef: 0.396, abs: 0.396 },
  { feature: "has_bbb", layer: "offpage", coef: 0.387, abs: 0.387 },
  { feature: "has_yelp", layer: "offpage", coef: 0.375, abs: 0.375 },
  { feature: "citability_score", layer: "study1", coef: 0.300, abs: 0.300 },
  { feature: "has_trustpilot", layer: "offpage", coef: 0.295, abs: 0.295 },
  { feature: "has_youtube_channel", layer: "offpage", coef: 0.248, abs: 0.248 },
  { feature: "spyfu_monthly_organic_clicks", layer: "spyfu", coef: 0.236, abs: 0.236 },
  { feature: "domain_authority", layer: "study1", coef: 0.215, abs: 0.215 },
];

// ─── Quotable summary ───

export const quotables = [
  "Directory count just dethroned Domain Authority as the #1 predictor of AI visibility — r=0.391 vs r=0.338, n=2,648.",
  "We tested 'you need to be on Reddit' across 2,729 businesses. Reddit's predictive power collapses from r=0.333 to r=0.000 once you control for general multi-platform presence.",
  "When a brand IS the URL Perplexity cites, it's 5.5x more likely to be mentioned in the response text.",
  "The ChatGPT API doesn't return source URLs. Anyone confidently telling you 'this is what ChatGPT cites' is using a different data source — or making it up.",
  "26x more addressable: 26.6% of SaaS CRM AI citations are MentionLayer-actionable vs 0% of Med Spa citations.",
  "+16 visibility points: that's the lift directory presence delivers within the top Domain Authority quartile.",
  "AI visibility is a SYSTEM, not a SIGNAL.",
  "The largest cross-market controlled GEO study published anywhere: 2,729 businesses, 14 industries, 4 markets, 278,000+ data points, 32 industry-city slots.",
];

// ─── FAQ — common attacks pre-empted ───

export type FAQItem = {
  q: string;
  a: string;
};

export const faqAttacks: FAQItem[] = [
  {
    q: "Your Reddit measurement is too crude — you used SERP results, not actual Reddit data.",
    a: "Correct. We measured Reddit mention count via Google SERP results for `site:reddit.com \"{brand}\"`. That captures volume but not subreddit authority, upvote weight, or recency. A higher-quality measurement could find a stronger isolated effect than the zero we recorded. We say so in the limitations. The collapse from r=0.333 to r=0.000 still holds for the volume metric — and volume is what every other GEO measurement tool also relies on. Show us better data and we'll re-run. Layer 3 will use a finer Reddit-quality signal.",
  },
  {
    q: "Consumer Perplexity surfaces Reddit far more than the API. Your study is API-only.",
    a: "Also correct. Perplexity's sonar-pro API in our sample returned 0% Reddit citations, while consumer Perplexity surfaces Reddit far more visibly. We say this in the limitations. But: ~95% of GEO measurement tools and dashboards built today read the API, not the consumer interface. The world your tools measure has Reddit at zero independent effect. If your concern is the consumer experience specifically, this study is suggestive but not definitive there.",
  },
  {
    q: "ChatGPT's API doesn't return sources, so how can you say anything about ChatGPT?",
    a: "We don't claim to. We explicitly write: 'the citation-correlation finding is untestable for ChatGPT specifically with API data.' Anyone in the GEO industry confidently telling you what ChatGPT cites is either using a different data source or fabricating. We tested the models that DO return sources — Perplexity and Google AI Overview. The 5.5x Perplexity lift is the testable claim.",
  },
  {
    q: "Correlation is not causation. You haven't proven anything.",
    a: "Right — Phase 2 is observational. The strict-isolation methodology (OLS-residual partial correlation controlling for 24+ other features) is the cleanest causal-adjacent test possible on observational data, but it is not a controlled experiment. Phase 3 (Layer 3 — controlled intervention with 25–30 businesses, pre-registered success thresholds, before/after data) starts May 2026 and will provide causal evidence. We commit to publishing Phase 3 results regardless of direction, including null results.",
  },
  {
    q: "Your sample skews toward US large markets — LA, NYC, Chicago. The 'national' slots are also US-centric.",
    a: "Largely true. Sydney was added explicitly to test cross-market generalisability. The Sydney findings are striking: 0% addressable citation share across all Sydney slots, very different top predictors versus US equivalents. So the answer is: **playbooks should be vertical-AND-market specific.** Phase 3 will recruit globally where vertical addressability supports it.",
  },
  {
    q: "L2 regularization on correlated features creates noise. Your logistic regression is unreliable.",
    a: "Yes — and we say so. L2 redistributing weight across `has_bbb`, `has_yelp`, and `has_trustpilot` (highly correlated platforms) is almost certainly why `review_platform_count` ends up with a negative coefficient. We disclose this in section 9 and direct readers to the strict-isolation analysis (which uses a different methodology) for cleaner per-feature numbers. The L2 result is included as a sanity-check, not as the per-feature ground truth.",
  },
  {
    q: "Some Sydney slots had only 80% enrichment coverage due to a batch failure. Did you cherry-pick?",
    a: "No. Reduced enrichment coverage means missing data — for those rows, off-page signal collection was incomplete. This *adds noise* to estimates, it does not cherry-pick in either direction. We disclose the issue in limitations and ran the headline analyses both with and without the affected slots. The directional findings are unchanged. Anonymised per-row enrichment-coverage flags are included in the downloadable CSV so you can replicate.",
  },
  {
    q: "What about Reddit-specific tools like Hyros, Reddit Pro Search, etc. that use proprietary signals?",
    a: "Out of scope here. We tested whether *generic, repeatable, business-level* off-page signals predict AI visibility. If a proprietary tool has a private Reddit signal that adds independent predictive power above the 24+ features we measured, that's an empirical claim they should publish. We'd happily co-replicate.",
  },
  {
    q: "Why didn't you measure paid placement, sponsored content, or influencer mentions?",
    a: "Three reasons. (1) Most are unmeasurable from the outside (you can't crawl a private influencer-rate-card). (2) AI training data ingestion of paid content is murky and changes monthly. (3) For the 'what does an off-page program move' question, paid placement is largely outside what an off-page agency executes. Layer 3's intervention design will test some of these directly via influencer/PR distribution dose treatments.",
  },
];

// ─── Per-slot data for the interactive explorer ───

import slotDataRaw from "./study2-slot-data.json";

export type SlotData = {
  slot: string;
  label: string;
  n_total: number;
  n_visible: number;
  n_invisible: number;
  top_predictors: { signal: string; label: string; r: number }[];
  visible_directory_avg: number | null;
  invisible_directory_avg: number | null;
  visible_reddit_avg: number | null;
  invisible_reddit_avg: number | null;
  addressable_share: number;
  top_cited_domains: { domain: string; count: number }[];
};

export const slotData: SlotData[] = slotDataRaw as SlotData[];

// Industries grouped for the explorer dropdown
export const industries = [
  { id: "accounting", label: "Accounting" },
  { id: "boutique_hospitality", label: "Boutique Hospitality" },
  { id: "dental", label: "Dental" },
  { id: "digital_marketing", label: "Digital Marketing" },
  { id: "ecommerce_dtc_baby", label: "E-commerce DTC (Baby)" },
  { id: "financial_advisors", label: "Financial Advisors" },
  { id: "home_services", label: "Home Services / Plumbing" },
  { id: "insurance_brokers", label: "Insurance Brokers" },
  { id: "med_spa", label: "Med Spa" },
  { id: "personal_finance_apps", label: "Personal Finance Apps" },
  { id: "personal_injury_law", label: "Personal Injury Law" },
  { id: "real_estate", label: "Real Estate" },
  { id: "saas_crm", label: "SaaS — CRM" },
  { id: "saas_project_management", label: "SaaS — Project Management" },
];

export const markets = [
  { id: "la", label: "Los Angeles" },
  { id: "nyc", label: "New York" },
  { id: "chicago", label: "Chicago" },
  { id: "sydney", label: "Sydney" },
  { id: "national", label: "National (US-centric)" },
];

// Map (industry, market) → slot key
const NATIONAL_INDUSTRIES = new Set([
  "boutique_hospitality",
  "digital_marketing",
  "ecommerce_dtc_baby",
  "financial_advisors",
  "insurance_brokers",
  "personal_finance_apps",
  "saas_crm",
  "saas_project_management",
]);

export function resolveSlot(industry: string, market: string): string | null {
  if (NATIONAL_INDUSTRIES.has(industry)) {
    return market === "national" ? industry : null;
  }
  if (market === "la") return industry;
  if (market === "national") return null;
  return `${industry}_${market}`;
}

// ─── Layer 3 forward-look ───

export const layer3 = {
  durationDays: 60,
  participantsTarget: { min: 25, max: 30 },
  doseGroups: [
    { name: "Partial dose", clients: "15–20 client-level treatments", scope: "Directory build-out, Reddit/Quora seeding (vertical-relevant), press distribution, review campaigns" },
    { name: "Full dose", clients: "5–7 Joel-portfolio businesses", scope: "Everything in partial dose + YouTube + on-site GEO build-out" },
  ],
  successThresholds: [
    { metric: "visibility_score", delta: "+10" },
    { metric: "model_count", delta: "+1" },
    { metric: "directory_count", delta: "+3" },
    { metric: "reddit_mention_count", delta: "+5" },
    { metric: "off_page_composite", delta: "+10" },
    { metric: "review_platform_count", delta: "+1" },
  ],
  successRule: "≥ 4 of 6 metric deltas hit (pre-registered)",
  controlGroup: "1,004-business Layer 1 sample (natural-drift comparison)",
  publishCommitment: "Result published regardless of direction — including null results",
  startWindow: "May–July 2026",
};
