// Central registry that maps each capability to its current implementation.
// To swap an agent, change the registration — no other code changes needed.
//
// Today's implementations:
//   discovery: ApifySerpAgent (Google SERP via Apify)
//   aiProbe: PerplexityProbeAgent (Perplexity + OpenAI probing)
//   enrichment: ApifyRedditAgent (Apify reddit/quora/fb scrapers)
//   classification: ClaudeSonnetClassifier (Claude Sonnet batch classification)
//   response: ClaudeOpusResponder (Claude Opus 3-variant generation)
//   monitor.*: AI Monitor agents (ChatGPT, Perplexity, Gemini, Claude, AIO, Analyzer)

import { ApifySerpAgent } from "./discovery/apify-serp.agent";
import { PerplexityProbeAgent } from "./discovery/perplexity-probe.agent";
import { ApifyRedditAgent } from "./enrichment/apify-reddit.agent";
import { ClaudeSonnetClassifier } from "./classification/claude-sonnet.agent";
import { ClaudeOpusResponder } from "./response/claude-opus.agent";

// Monitor agents
import { ChatGPTTestAgent } from "./monitor/chatgpt-test.agent";
import { PerplexityTestAgent } from "./monitor/perplexity-test.agent";
import { GeminiTestAgent } from "./monitor/gemini-test.agent";
import { ClaudeTestAgent } from "./monitor/claude-test.agent";
import { AIOTestAgent } from "./monitor/aio-test.agent";
import { MonitorAnalyzerAgent } from "./monitor/response-analyzer.agent";

// Audit agents
import { CitationScanAgent } from "./audit/citation-scan.agent";
import { AIPresenceAgent } from "./audit/ai-presence.agent";
import { EntityCheckAgent } from "./audit/entity-check.agent";
import { ReviewScanAgent } from "./audit/review-scan.agent";
import { PressScanAgent } from "./audit/press-scan.agent";

// Entity Sync agents
import { DirectoryScannerAgent } from "./entity/directory-scanner.agent";
import { ConsistencyScorerAgent } from "./entity/consistency-scorer.agent";
import { SchemaAuditorAgent } from "./entity/schema-auditor.agent";
import { TaskGeneratorAgent } from "./entity/task-generator.agent";

// Review Engine agents
import { GoogleReviewsAgent } from "./review/google-reviews.agent";
import { PlatformReviewsAgent } from "./review/platform-reviews.agent";
import { SentimentAnalyzerAgent } from "./review/sentiment-analyzer.agent";
import { ReviewResponseAgent } from "./review/response-generator.agent";

// PressForge agents
import { VoiceModelerAgent } from "./press/voice-modeler.agent";
import { PressReleaseAgent } from "./press/release-generator.agent";
import { CampaignIdeatorAgent } from "./press/campaign-ideator.agent";
import { JournalistScorerAgent } from "./press/journalist-scorer.agent";
import { JournalistDiscoveryAgent } from "./press/journalist-discovery.agent";
import { PitchGeneratorAgent } from "./press/pitch-generator.agent";
import { CoverageScannerAgent } from "./press/coverage-scanner.agent";

import type {
  DiscoveryAgent,
  EnrichmentAgent,
  ClassificationAgent,
  ResponseAgent,
  AuditAgent,
} from "./interfaces";

export const agents = {
  // Phase 1: Citation Engine agents
  discovery: new ApifySerpAgent() as DiscoveryAgent,
  aiProbe: new PerplexityProbeAgent() as DiscoveryAgent,
  enrichment: new ApifyRedditAgent() as EnrichmentAgent,
  classification: new ClaudeSonnetClassifier() as ClassificationAgent,
  response: new ClaudeOpusResponder() as ResponseAgent,

  // Audit agents
  audit: {
    citations: new CitationScanAgent() as AuditAgent,
    ai_presence: new AIPresenceAgent() as AuditAgent,
    entities: new EntityCheckAgent() as AuditAgent,
    reviews: new ReviewScanAgent() as AuditAgent,
    press: new PressScanAgent() as AuditAgent,
  },

  // Phase 2: AI Monitor agents
  monitor: {
    chatgpt: new ChatGPTTestAgent(),
    perplexity: new PerplexityTestAgent(),
    gemini: new GeminiTestAgent(),
    claude: new ClaudeTestAgent(),
    google_ai_overview: new AIOTestAgent(),
    analyzer: new MonitorAnalyzerAgent(),
  },

  // Phase 2: Entity Sync agents
  entity: {
    directoryScanner: new DirectoryScannerAgent(),
    consistencyScorer: new ConsistencyScorerAgent(),
    schemaAuditor: new SchemaAuditorAgent(),
    taskGenerator: new TaskGeneratorAgent(),
  },

  // Review Engine agents
  review: {
    google: new GoogleReviewsAgent(),
    platform: new PlatformReviewsAgent(),
    sentiment: new SentimentAnalyzerAgent(),
    responseGenerator: new ReviewResponseAgent(),
  },

  // Phase 2: PressForge agents
  press: {
    voiceModeler: new VoiceModelerAgent(),
    releaseGenerator: new PressReleaseAgent(),
    campaignIdeator: new CampaignIdeatorAgent(),
    journalistScorer: new JournalistScorerAgent(),
    journalistDiscovery: new JournalistDiscoveryAgent(),
    pitchGenerator: new PitchGeneratorAgent(),
    coverageScanner: new CoverageScannerAgent(),
  },
} as const;

// Usage in Inngest jobs or API routes:
// const threads = await agents.discovery.discover(clientId, keywords);
// const aiThreads = await agents.aiProbe.discover(clientId, keywords);
// const enriched = await agents.enrichment.enrich(threadUrl, 'reddit');
// const classification = await agents.classification.classify(thread, brandBrief);
// const responses = await agents.response.generate(thread, client);
//
// Monitor:
// const result = await agents.monitor.chatgpt.test(input);
// const analysis = await agents.monitor.analyzer.analyze(analyzerInput);
//
// Entity Sync:
// const profiles = await agents.entity.directoryScanner.scan(clientId, canonical, platformKeys);
// const scores = await agents.entity.consistencyScorer.score(profiles, canonical);
// const schemaResult = await agents.entity.schemaAuditor.audit(websiteUrl, vertical, profileUrls);
// const tasks = await agents.entity.taskGenerator.generate(input);
//
// Review Engine:
// const googleResult = await agents.review.google.scan(input);
// const platformResult = await agents.review.platform.scan(input);
// const sentiment = await agents.review.sentiment.analyze(input);
// const response = await agents.review.responseGenerator.generate(input);
//
// PressForge:
// const voiceProfile = await agents.press.voiceModeler.model(spokesperson, samples);
// const release = await agents.press.releaseGenerator.generate(input);
// const ideas = await agents.press.campaignIdeator.ideate(input);
// const scores = await agents.press.journalistScorer.scoreBatch(journalists, pressRelease);
// const discovery = await agents.press.journalistDiscovery.discover(pressRelease, agencyId);
// const pitch = await agents.press.pitchGenerator.generate(input);
// const coverage = await agents.press.coverageScanner.scan(clientName, clientUrl);
