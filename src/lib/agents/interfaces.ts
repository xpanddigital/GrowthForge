// All agent implementations must conform to these interfaces.
// The platform orchestrates agents — it never calls Apify or Claude directly
// outside of an agent implementation.

export interface DiscoveredThread {
  url: string;
  title: string;
  snippet: string;
  position?: number;
  platform: "reddit" | "quora" | "facebook_groups";
  keyword: string;
  keywordId: string;
}

export interface EnrichedThread {
  body_text: string;
  author: string;
  comment_count: number;
  upvote_count: number;
  thread_date: string;
  top_comments: Array<{ author: string; body: string; upvotes: number }>;
}

export interface ClassificationResult {
  intent: "informational" | "transactional" | "commercial" | "navigational";
  relevance_score: number;
  can_mention_brand: boolean;
  suggested_angle: string;
  tags: string[];
}

export interface GeneratedResponse {
  variant: "casual" | "expert" | "story";
  body_text: string;
  quality_score: number;
  tone_match_score: number;
  mentions_brand: boolean;
  mentions_url: boolean;
}

export interface AuditPillarResult {
  score: number;
  findings: Record<string, unknown>;
  summary: string;
  recommendations: Array<{
    action: string;
    impact: "high" | "medium" | "low";
    effort: "high" | "medium" | "low";
  }>;
}

// --- Agent interfaces ---

export interface DiscoveryAgent {
  name: string;
  discover(
    clientId: string,
    keywords: Array<{ id: string; keyword: string; platforms: string[] }>
  ): Promise<DiscoveredThread[]>;
}

export interface EnrichmentAgent {
  name: string;
  enrich(threadUrl: string, platform: string): Promise<EnrichedThread>;
}

export interface ClassificationAgent {
  name: string;
  classify(
    thread: { title: string; body_text: string; platform: string },
    brandBrief: string
  ): Promise<ClassificationResult>;
}

export interface ResponseAgent {
  name: string;
  generate(
    thread: Record<string, unknown>,
    client: Record<string, unknown>
  ): Promise<GeneratedResponse[]>;
}

export interface AuditAgent {
  name: string;
  pillar: string;
  scan(
    client: Record<string, unknown>,
    keywords: Array<Record<string, unknown>>
  ): Promise<AuditPillarResult>;
}

// --- Monitor Agent Interfaces ---

export interface MonitorTestInput {
  promptText: string;
  clientName: string;
  clientAliases?: string[];
  clientUrls: string[];
  competitors: Array<{
    name: string;
    aliases: string[];
    url?: string;
  }>;
  // Location context for geo-targeted testing
  location?: {
    countryCode: string;
    locationString?: string;
  };
}

export interface MonitorTestResult {
  aiModel:
    | "chatgpt"
    | "perplexity"
    | "gemini"
    | "claude"
    | "google_ai_overview";
  fullResponse: string;
  responseHash: string;
  brandMentioned: boolean;
  brandRecommended: boolean;
  brandLinked: boolean;
  brandSourceUrls: string[];
  mentionContext: string | null;
  mentionPosition: number | null;
  prominenceScore: number;
  sentiment: "positive" | "neutral" | "negative" | null;
  sourcesCited: string[];
  competitorDetails: Array<{
    name: string;
    mentioned: boolean;
    recommended: boolean;
    sentiment: "positive" | "neutral" | "negative" | null;
    context: string | null;
  }>;
  metadata?: Record<string, unknown>;
}

export interface MonitorTestAgent {
  name: string;
  model: string;
  test(input: MonitorTestInput): Promise<MonitorTestResult>;
}

export interface MonitorAnalyzerInput {
  response: string;
  clientName: string;
  clientAliases: string[];
  clientUrls: string[];
  competitors: Array<{ name: string; aliases: string[] }>;
}

export interface MonitorAnalyzerOutput {
  brandMentioned: boolean;
  brandRecommended: boolean;
  brandLinked: boolean;
  brandSourceUrls: string[];
  mentionContext: string | null;
  mentionPosition: number | null;
  prominenceScore: number;
  sentiment: "positive" | "neutral" | "negative" | null;
  competitorDetails: Array<{
    name: string;
    mentioned: boolean;
    recommended: boolean;
    sentiment: "positive" | "neutral" | "negative" | null;
    context: string | null;
  }>;
}

// --- Entity Sync Agent Interfaces ---

export interface EntityCanonical {
  id: string;
  clientId: string;
  canonicalName: string;
  canonicalDescription: string;
  canonicalTagline: string | null;
  canonicalCategory: string;
  canonicalSubcategories: string[];
  canonicalContact: Record<string, unknown>;
  canonicalUrls: Record<string, unknown>;
  canonicalFoundingYear: number | null;
  canonicalFounderName: string | null;
  canonicalEmployeeCount: string | null;
  canonicalServiceAreas: string[];
  platformDescriptions: Record<string, string>;
}

export interface EntityProfileData {
  platform: string;
  platformProfileUrl: string | null;
  platformProfileId: string | null;
  isClaimed: boolean | null;
  descriptionText: string | null;
  category: string | null;
  contactInfo: Record<string, unknown>;
  additionalFields: Record<string, unknown>;
}

export interface EntityConsistencyResult {
  platform: string;
  consistencyScore: number;
  consistencyDetails: {
    nameMatch: number;
    descriptionMatch: number;
    categoryMatch: number;
    contactMatch: number;
    otherMatch: number;
  };
  issues: Array<{
    field: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    expected: string;
    found: string;
    suggestion: string;
  }>;
}

export interface EntitySchemaAuditResult {
  schemaResults: Array<{
    pageUrl: string;
    pageType: string;
    schemasFound: Array<{ type: string; valid: boolean; errors: string[] }>;
    schemasMissing: string[];
    schemaScore: number;
    rawJsonld: unknown[];
    rawMicrodata: unknown[];
    rawRdfa: unknown[];
    sameasValidation: {
      urlsInSchema: string[];
      expectedFromProfiles: string[];
      missing: string[];
      score: number;
    } | null;
  }>;
  robotsResult: {
    pageUrl: string;
    crawlerAccess: Record<string, { allowed: boolean; rule: string | null }>;
    robotsScore: number;
    blanketBlock: boolean;
  } | null;
  llmsTxtResult: {
    pageUrl: string;
    exists: boolean;
    content: string | null;
    score: number;
    issues: string[];
  } | null;
}

export interface EntityTaskInput {
  consistencyResults: EntityConsistencyResult[];
  schemaResult: EntitySchemaAuditResult;
  canonical: EntityCanonical;
  vertical: string | null;
  profileUrls: Record<string, string>;
}

export interface GeneratedEntityTask {
  taskType: string;
  description: string;
  instructions: string;
  generatedCode: string | null;
  platformDescription: string | null;
  platformCharLimit: number | null;
  platform: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priorityScore: number;
  entityProfileId?: string;
}

export interface EntityDirectoryScannerAgent {
  name: string;
  scan(
    clientId: string,
    canonical: EntityCanonical,
    platformKeys: string[]
  ): Promise<EntityProfileData[]>;
}

export interface EntityConsistencyScorerAgent {
  name: string;
  score(
    profiles: EntityProfileData[],
    canonical: EntityCanonical
  ): Promise<EntityConsistencyResult[]>;
}

export interface EntitySchemaAuditorAgent {
  name: string;
  audit(
    websiteUrl: string,
    vertical: string | null,
    claimedProfileUrls: string[]
  ): Promise<EntitySchemaAuditResult>;
}

export interface EntityTaskGeneratorAgent {
  name: string;
  generate(input: EntityTaskInput): Promise<GeneratedEntityTask[]>;
}

// --- Review Engine Agent Interfaces ---

export interface ReviewScanInput {
  clientName: string;
  clientUrl: string;
  platform: string;
  existingProfileUrl?: string;
  location?: string; // For local businesses: "Perth, Western Australia"
}

export interface ReviewScanResult {
  platform: string;
  found: boolean;
  profileUrl: string | null;
  isClaimed: boolean | null;
  totalReviews: number;
  averageRating: number | null;
  ratingScale: number;
  mostRecentReviewDate: string | null;
  ratingDistribution: Record<string, number>;
  totalResponded: number;
  recentReviews: Array<{
    reviewerName: string | null;
    reviewText: string | null;
    rating: number;
    reviewDate: string | null;
    reviewUrl: string | null;
    hasOwnerResponse: boolean;
    ownerResponseText: string | null;
  }>;
  scrapeError: string | null;
}

export interface SentimentAnalysisInput {
  reviews: Array<{
    id: string;
    reviewText: string;
    rating: number;
    platform: string;
  }>;
  clientName: string;
  clientVertical: string;
}

export interface SentimentAnalysisResult {
  reviews: Array<{
    id: string;
    sentiment: "positive" | "neutral" | "negative";
    sentimentScore: number; // -1.0 to 1.0
    topics: string[];
    keyPhrases: string[];
    shouldFlag: boolean;
    flagReason: string | null;
  }>;
  aggregateTopics: Array<{
    topic: string;
    count: number;
    avgSentiment: "positive" | "neutral" | "negative";
  }>;
}

export interface ReviewResponseInput {
  reviewText: string;
  reviewerName: string | null;
  rating: number;
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  clientName: string;
  clientToneGuidelines: string | null;
}

export interface ReviewResponseResult {
  responseText: string;
  tone: string;
}

export interface ReviewScanAgent {
  name: string;
  scan(input: ReviewScanInput): Promise<ReviewScanResult>;
}

export interface ReviewSentimentAgent {
  name: string;
  analyze(input: SentimentAnalysisInput): Promise<SentimentAnalysisResult>;
}

export interface ReviewResponseGeneratorAgent {
  name: string;
  generate(input: ReviewResponseInput): Promise<ReviewResponseResult>;
}
