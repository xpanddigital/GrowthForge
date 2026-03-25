// =============================================================================
// YouTube GEO — Description Optimizer
// Analyzes YouTube video descriptions for AI-friendly formatting.
// Checks for timestamps, links, keyword density, and structured content
// that makes descriptions more likely to be cited by AI models.
// =============================================================================

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface DescriptionAnalysis {
  url: string;
  title: string;
  score: number;
  checks: Array<{
    name: string;
    passed: boolean;
    details: string;
  }>;
  suggestions: string[];
}

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export async function analyzeVideoDescription(
  videoUrl: string,
  videoTitle: string,
  description: string | null,
  brandName: string
): Promise<DescriptionAnalysis> {
  if (!description || description.trim().length === 0) {
    return {
      url: videoUrl,
      title: videoTitle,
      score: 0,
      checks: [
        {
          name: "Has description",
          passed: false,
          details: "Video has no description — AI crawlers have nothing to index",
        },
      ],
      suggestions: [
        "Add a detailed description with keywords, timestamps, and links",
      ],
    };
  }

  const checks: DescriptionAnalysis["checks"] = [];
  let score = 0;

  // Check 1: Minimum length (200+ chars)
  const hasMinLength = description.length >= 200;
  checks.push({
    name: "Minimum length",
    passed: hasMinLength,
    details: hasMinLength
      ? `Description is ${description.length} characters (good)`
      : `Description is only ${description.length} characters — aim for 200+`,
  });
  if (hasMinLength) score += 15;

  // Check 2: Contains timestamps
  const hasTimestamps = /\d{1,2}:\d{2}/.test(description);
  checks.push({
    name: "Timestamps",
    passed: hasTimestamps,
    details: hasTimestamps
      ? "Contains timestamps for chapter navigation"
      : "No timestamps — add chapter markers (e.g., 0:00 Intro, 2:30 Topic)",
  });
  if (hasTimestamps) score += 15;

  // Check 3: Contains links
  const hasLinks = /https?:\/\/\S+/.test(description);
  checks.push({
    name: "Contains links",
    passed: hasLinks,
    details: hasLinks
      ? "Contains reference links"
      : "No links — add relevant links to your website or resources",
  });
  if (hasLinks) score += 10;

  // Check 4: Brand mention
  const hasBrandMention = description
    .toLowerCase()
    .includes(brandName.toLowerCase());
  checks.push({
    name: "Brand mention",
    passed: hasBrandMention,
    details: hasBrandMention
      ? `Mentions ${brandName}`
      : `Does not mention ${brandName} — ensure brand is referenced`,
  });
  if (hasBrandMention) score += 15;

  // Check 5: Keyword density (has topical keywords)
  const wordCount = description.split(/\s+/).length;
  const hasGoodLength = wordCount >= 50;
  checks.push({
    name: "Content depth",
    passed: hasGoodLength,
    details: hasGoodLength
      ? `${wordCount} words — sufficient depth for AI indexing`
      : `Only ${wordCount} words — expand to 50+ words for better AI citation`,
  });
  if (hasGoodLength) score += 15;

  // Check 6: Structured sections (uses line breaks and headers)
  const hasStructure =
    description.includes("\n\n") ||
    /^[A-Z][A-Z\s]+:/m.test(description) ||
    /^[-•]/m.test(description);
  checks.push({
    name: "Structured format",
    passed: hasStructure,
    details: hasStructure
      ? "Uses structured formatting (sections, bullets, or headers)"
      : "Unstructured text — add section headers and bullet points",
  });
  if (hasStructure) score += 15;

  // Check 7: Call to action or summary in first line
  const firstLine = description.split("\n")[0];
  const hasStrongOpening = firstLine.length >= 50;
  checks.push({
    name: "Strong opening",
    passed: hasStrongOpening,
    details: hasStrongOpening
      ? "First line provides a clear summary"
      : "Weak opening — first line should summarize the video content",
  });
  if (hasStrongOpening) score += 15;

  score = Math.min(100, score);

  // Generate AI suggestions for low scores
  let suggestions: string[] = [];
  if (score < 70) {
    try {
      suggestions = await generateOptimizationSuggestions(
        videoTitle,
        description,
        brandName,
        checks.filter((c) => !c.passed)
      );
    } catch {
      suggestions = checks
        .filter((c) => !c.passed)
        .map((c) => c.details);
    }
  }

  return { url: videoUrl, title: videoTitle, score, checks, suggestions };
}

async function generateOptimizationSuggestions(
  title: string,
  description: string,
  brandName: string,
  failedChecks: DescriptionAnalysis["checks"]
): Promise<string[]> {
  const issues = failedChecks.map((c) => `- ${c.name}: ${c.details}`).join("\n");

  const result = await callSonnet(
    `You are a YouTube SEO specialist optimizing video descriptions for AI citation. Video: "${title}" by ${brandName}.\n\nCurrent description (first 500 chars):\n${description.substring(0, 500)}\n\nFailed checks:\n${issues}\n\nProvide 3-4 specific, actionable suggestions to optimize this description for AI crawler indexing and citation. Return JSON array of strings.\n["suggestion 1", "suggestion 2", ...]`,
    { maxTokens: 512 }
  );

  return parseClaudeJson<string[]>(result.text);
}
