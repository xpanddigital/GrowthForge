// =============================================================================
// Technical GEO — Content Citability Scorer
// Analyzes a page's content structure for AI citation-friendliness.
// 7 dimensions scored 0-100 each, weighted into a composite score.
// Provides actionable rewrite suggestions via Claude Sonnet.
// =============================================================================

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";
import { withRetry } from "@/lib/utils/retry";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CitabilityDimension {
  name: string;
  score: number;
  weight: number;
  details: string;
}

export interface CitabilityResult {
  compositeScore: number;
  dimensions: CitabilityDimension[];
  rewriteSuggestions: string[];
  highlights: string[];
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const FETCH_USER_AGENT =
  "Mozilla/5.0 (compatible; GrowthForge/1.0; +https://growthforge.io)";

const FETCH_TIMEOUT_MS = 15_000;

const DIMENSION_WEIGHTS = {
  citation_block_quality: 0.25,
  heading_structure: 0.15,
  stat_density: 0.15,
  section_length: 0.1,
  faq_presence: 0.15,
  comparison_content: 0.1,
  freshness_signals: 0.1,
} as const;

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function scoreContentCitability(
  pageUrl: string,
  pageHtml?: string
): Promise<CitabilityResult> {
  // Fetch page if HTML not provided
  let html = pageHtml;
  if (!html) {
    const response = await withRetry(
      () =>
        fetch(pageUrl, {
          headers: { "User-Agent": FETCH_USER_AGENT },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          redirect: "follow",
        }),
      { maxRetries: 2, baseDelayMs: 1000 }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${pageUrl}: ${response.status}`);
    }
    html = await response.text();
  }

  // Extract text content (strip HTML tags)
  const textContent = extractTextContent(html);
  const headings = extractHeadings(html);
  const sections = splitBySections(textContent, headings);

  // Heuristic scoring pass
  const dimensions: CitabilityDimension[] = [
    scoreCitationBlock(textContent),
    scoreHeadingStructure(headings, html),
    scoreStatDensity(textContent),
    scoreSectionLength(sections),
    scoreFaqPresence(html, textContent),
    scoreComparisonContent(html, textContent),
    scoreFreshnessSignals(html),
  ];

  // Calculate composite score
  const compositeScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  // Get AI-generated rewrite suggestions for low-scoring dimensions
  const lowDimensions = dimensions.filter((d) => d.score < 50);
  let rewriteSuggestions: string[] = [];
  const highlights: string[] = [];

  // Collect positive highlights
  for (const d of dimensions) {
    if (d.score >= 70) {
      highlights.push(`Strong ${d.name}: ${d.details}`);
    }
  }

  if (lowDimensions.length > 0) {
    try {
      rewriteSuggestions = await getRewriteSuggestions(
        pageUrl,
        textContent.substring(0, 3000),
        lowDimensions
      );
    } catch {
      // Static fallback suggestions
      rewriteSuggestions = lowDimensions.map(
        (d) => `Improve ${d.name} (currently ${d.score}/100): ${d.details}`
      );
    }
  }

  return { compositeScore, dimensions, rewriteSuggestions, highlights };
}

// -----------------------------------------------------------------------------
// Dimension Scoring Functions
// -----------------------------------------------------------------------------

function scoreCitationBlock(text: string): CitabilityDimension {
  // 44.2% of all LLM citations come from the first 30% of text
  // Check if the first 200 words provide a direct, clear answer
  const words = text.split(/\s+/);
  const first200 = words.slice(0, 200).join(" ");

  let score = 0;

  // Has a clear definition/answer in first 200 words
  const definitionPatterns = [
    /\b(?:is|are|refers to|means|defined as|involves)\b/i,
    /\b(?:the best|top|leading|most popular|recommended)\b/i,
    /\b(?:how to|steps to|guide to|way to)\b/i,
  ];
  const patternMatches = definitionPatterns.filter((p) =>
    p.test(first200)
  ).length;
  score += Math.min(40, patternMatches * 15);

  // First 200 words length (should be substantive, not just nav)
  if (first200.length > 500) score += 20;
  if (first200.length > 800) score += 10;

  // Contains specific claims or data points early
  const numberMatches = first200.match(/\d+(?:\.\d+)?%?/g);
  if (numberMatches && numberMatches.length >= 2) score += 20;
  if (numberMatches && numberMatches.length >= 4) score += 10;

  score = Math.min(100, score);

  return {
    name: "citation_block_quality",
    score,
    weight: DIMENSION_WEIGHTS.citation_block_quality,
    details:
      score >= 70
        ? "Opening content provides clear, direct answers suitable for AI citation"
        : "Opening content lacks clear answers or definitions that AI models can cite",
  };
}

function scoreHeadingStructure(
  headings: Array<{ level: number; text: string }>,
  html: string
): CitabilityDimension {
  let score = 0;

  // Has H1
  const hasH1 = headings.some((h) => h.level === 1);
  if (hasH1) score += 20;

  // Has H2s (main sections)
  const h2Count = headings.filter((h) => h.level === 2).length;
  if (h2Count >= 3) score += 30;
  else if (h2Count >= 1) score += 15;

  // Has H3s (subsections)
  const h3Count = headings.filter((h) => h.level === 3).length;
  if (h3Count >= 2) score += 15;

  // Descriptive headings (not generic like "About" or "Section 1")
  const descriptiveHeadings = headings.filter(
    (h) => h.text.split(/\s+/).length >= 3
  );
  if (descriptiveHeadings.length >= 3) score += 20;
  else if (descriptiveHeadings.length >= 1) score += 10;

  // Proper hierarchy (no skipping levels)
  let properHierarchy = true;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) {
      properHierarchy = false;
      break;
    }
  }
  if (properHierarchy && headings.length > 2) score += 15;

  score = Math.min(100, score);

  return {
    name: "heading_structure",
    score,
    weight: DIMENSION_WEIGHTS.heading_structure,
    details:
      score >= 70
        ? `Well-structured with ${h2Count} H2s and ${h3Count} H3s`
        : `Heading structure needs improvement (${h2Count} H2s, ${h3Count} H3s)`,
  };
}

function scoreStatDensity(text: string): CitabilityDimension {
  // Statistics every 150-200 words boost citation rates
  const words = text.split(/\s+/).length;

  // Count statistics/data points (numbers with context)
  const statPatterns = [
    /\d+(?:\.\d+)?%/g, // Percentages
    /\$\d+(?:,\d{3})*(?:\.\d+)?/g, // Dollar amounts
    /\d+(?:,\d{3})+/g, // Large numbers with commas
    /\b\d{4}\b/g, // Years
    /\d+x\b/gi, // Multipliers (2x, 10x)
  ];

  let totalStats = 0;
  for (const pattern of statPatterns) {
    const matches = text.match(pattern);
    if (matches) totalStats += matches.length;
  }

  // Ideal: 1 stat per 150-200 words
  const idealStatCount = Math.max(1, Math.floor(words / 175));
  const statRatio =
    idealStatCount > 0
      ? Math.min(1, totalStats / idealStatCount)
      : 0;

  let score = Math.round(statRatio * 100);

  // Bonus for having authoritative data citation patterns
  const citationPatterns =
    /according to|research shows|study found|data from|survey of|report by/gi;
  const citationMatches = text.match(citationPatterns);
  if (citationMatches && citationMatches.length >= 2) {
    score = Math.min(100, score + 15);
  }

  return {
    name: "stat_density",
    score,
    weight: DIMENSION_WEIGHTS.stat_density,
    details:
      score >= 70
        ? `Good stat density: ${totalStats} data points across ${words} words`
        : `Low stat density: ${totalStats} data points in ${words} words (target: 1 per 175 words)`,
  };
}

function scoreSectionLength(sections: string[]): CitabilityDimension {
  // Optimal: 120-180 words between headings (gets 70% more citations)
  if (sections.length === 0) {
    return {
      name: "section_length",
      score: 0,
      weight: DIMENSION_WEIGHTS.section_length,
      details: "No discernible content sections found",
    };
  }

  const optimalCount = sections.filter((s) => {
    const wordCount = s.split(/\s+/).length;
    return wordCount >= 100 && wordCount <= 250;
  }).length;

  const ratio = sections.length > 0 ? optimalCount / sections.length : 0;
  const score = Math.round(ratio * 100);

  const avgLength = Math.round(
    sections.reduce((sum, s) => sum + s.split(/\s+/).length, 0) /
      sections.length
  );

  return {
    name: "section_length",
    score,
    weight: DIMENSION_WEIGHTS.section_length,
    details:
      score >= 70
        ? `${optimalCount}/${sections.length} sections are optimal length (avg ${avgLength} words)`
        : `Only ${optimalCount}/${sections.length} sections are optimal 100-250 words (avg ${avgLength} words)`,
  };
}

function scoreFaqPresence(html: string, text: string): CitabilityDimension {
  let score = 0;

  // Check for FAQPage schema
  if (html.includes("FAQPage") && html.includes("application/ld+json")) {
    score += 40;
  }

  // Check for question-formatted headings
  const questionHeadings = (
    html.match(/<h[2-4][^>]*>[^<]*\?[^<]*<\/h[2-4]>/gi) || []
  ).length;
  if (questionHeadings >= 3) score += 30;
  else if (questionHeadings >= 1) score += 15;

  // Check for Q&A patterns in content
  const qaPatterns = [
    /\b(?:FAQ|frequently asked|common questions)\b/i,
    /\bQ:\s|A:\s/,
    /\b(?:What is|How do|Can I|Is it|Why should|When should|Where can)\b/i,
  ];
  const qaMatches = qaPatterns.filter((p) => p.test(text)).length;
  score += Math.min(30, qaMatches * 10);

  score = Math.min(100, score);

  return {
    name: "faq_presence",
    score,
    weight: DIMENSION_WEIGHTS.faq_presence,
    details:
      score >= 70
        ? "Page has FAQ content with prompt-aligned questions"
        : "No structured FAQ section — add questions AI users commonly ask",
  };
}

function scoreComparisonContent(
  html: string,
  text: string
): CitabilityDimension {
  let score = 0;

  // Check for comparison tables
  const tableCount = (html.match(/<table/gi) || []).length;
  if (tableCount >= 1) score += 30;

  // Check for comparison language
  const comparisonPatterns = [
    /\bvs\.?\b|\bversus\b/i,
    /\bcompared to\b|\bcomparison\b/i,
    /\bbest\s+\w+\s+(?:for|in|of)\b/i,
    /\btop\s+\d+\b/i,
    /\bpros\s+and\s+cons\b/i,
    /\balternatives?\s+to\b/i,
  ];
  const comparisonMatches = comparisonPatterns.filter((p) =>
    p.test(text)
  ).length;
  score += Math.min(40, comparisonMatches * 10);

  // Check for list formatting (ol/ul with multiple items)
  const listItemCount = (html.match(/<li/gi) || []).length;
  if (listItemCount >= 5) score += 20;
  else if (listItemCount >= 3) score += 10;

  // Check for bold/strong emphasis on key terms
  const boldCount = (html.match(/<(?:strong|b)>/gi) || []).length;
  if (boldCount >= 3) score += 10;

  score = Math.min(100, score);

  return {
    name: "comparison_content",
    score,
    weight: DIMENSION_WEIGHTS.comparison_content,
    details:
      score >= 70
        ? "Page contains structured comparison content (tables, lists, vs. language)"
        : "Add comparison elements: tables, pros/cons lists, 'vs.' comparisons",
  };
}

function scoreFreshnessSignals(html: string): CitabilityDimension {
  let score = 0;

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  // Check for current/recent year in content
  if (html.includes(String(currentYear))) score += 30;
  else if (html.includes(String(lastYear))) score += 15;

  // Check for "updated" or "last modified" timestamps
  const updatePatterns = [
    /\b(?:updated|last updated|modified|reviewed|revised)\b.*?\d{4}/i,
    /\bdate(?:Modified|Published)\b/i,
    /<time\s+datetime/i,
  ];
  const updateMatches = updatePatterns.filter((p) => p.test(html)).length;
  score += Math.min(40, updateMatches * 20);

  // Check for recent data citations
  const recentDataPatterns = [
    new RegExp(`\\b${currentYear}\\s+(?:study|report|survey|data)\\b`, "i"),
    new RegExp(`\\b(?:study|report|survey|data)\\s+${currentYear}\\b`, "i"),
    /\blatest\b|\brecent\b|\bnew\b/i,
  ];
  const recentDataMatches = recentDataPatterns.filter((p) =>
    p.test(html)
  ).length;
  score += Math.min(30, recentDataMatches * 10);

  score = Math.min(100, score);

  return {
    name: "freshness_signals",
    score,
    weight: DIMENSION_WEIGHTS.freshness_signals,
    details:
      score >= 70
        ? "Page contains current-year dates and freshness indicators"
        : `Add ${currentYear} data, "Updated" timestamps, and recent statistics`,
  };
}

// -----------------------------------------------------------------------------
// AI Rewrite Suggestions
// -----------------------------------------------------------------------------

async function getRewriteSuggestions(
  pageUrl: string,
  contentExcerpt: string,
  lowDimensions: CitabilityDimension[]
): Promise<string[]> {
  const dimensionList = lowDimensions
    .map((d) => `- ${d.name}: ${d.score}/100 — ${d.details}`)
    .join("\n");

  const result = await callSonnet(
    `You are an AI SEO content optimizer. A page at ${pageUrl} scored poorly on these AI citability dimensions:\n\n${dimensionList}\n\nHere's the first ~500 words of the page content:\n${contentExcerpt.substring(0, 2000)}\n\nProvide 3-5 specific, actionable rewrite suggestions to improve AI citation likelihood. Each suggestion should be 1-2 sentences.\n\nReturn JSON array of strings:\n["suggestion 1", "suggestion 2", ...]`,
    { maxTokens: 1024 }
  );

  return parseClaudeJson<string[]>(result.text);
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function extractTextContent(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHeadings(
  html: string
): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (text) {
      headings.push({ level, text });
    }
  }

  return headings;
}

function splitBySections(
  text: string,
  headings: Array<{ level: number; text: string }>
): string[] {
  if (headings.length === 0) {
    // No headings — split by paragraph breaks
    return text
      .split(/\n\n+/)
      .filter((s) => s.trim().length > 50);
  }

  const sections: string[] = [];
  let remaining = text;

  for (const heading of headings) {
    const idx = remaining.indexOf(heading.text);
    if (idx > 0) {
      const before = remaining.substring(0, idx).trim();
      if (before.length > 50) {
        sections.push(before);
      }
      remaining = remaining.substring(idx + heading.text.length);
    }
  }

  // Last section
  if (remaining.trim().length > 50) {
    sections.push(remaining.trim());
  }

  return sections;
}
