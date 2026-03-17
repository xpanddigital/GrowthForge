// Platform-adapted description generator for Entity Sync.
// Uses Claude Sonnet to adapt a canonical brand description
// to each platform's style, tone, and character limits.

import { callSonnet, parseClaudeJson } from "@/lib/ai/claude";

// Hard character limits per platform
const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  google_business: 750,
  linkedin: 2000,
  twitter: 160,
  instagram: 150,
  facebook: 255,
  crunchbase: 2000,
  youtube: 1000,
  trustpilot: 500,
  g2: 1500,
  capterra: 1000,
  bbb: 500,
  yelp: 1500,
  avvo: 1000,
};

/**
 * Returns the character limit for a platform, or null if unknown.
 */
export function getCharLimit(platform: string): number | null {
  return PLATFORM_CHAR_LIMITS[platform] ?? null;
}

const SYSTEM_PROMPT = `You are an expert copywriter adapting brand descriptions for different online platforms. You must follow these rules strictly:

1. Each description MUST be UNDER the specified character limit. This is a hard constraint — never exceed it.
2. Platform-specific tone guidelines:
   - Twitter/Instagram: Punchy, concise, may incorporate the tagline. No filler words or fluff.
   - LinkedIn/Crunchbase: Professional, detailed, value-focused. Highlight expertise and market position.
   - Google Business: Optimized for local search keywords. Include service areas naturally if provided. Focus on what the business does and where it operates.
   - Trustpilot/G2/Capterra: Focus on what makes the product or service stand out to potential reviewers and buyers. Emphasize outcomes and differentiators.
   - Yelp: Conversational, customer-focused. Write as if describing the business to a friend.
   - YouTube: Informative, engaging. Describe what content or value the brand provides.
   - Facebook: Approachable, clear. Suitable for a general audience.
   - BBB: Straightforward, trust-focused. Emphasize reliability and service commitment.
   - Avvo: Professional, credentials-focused. Highlight legal expertise and client outcomes.
3. Never use marketing buzzwords like "game-changer", "revolutionary", "best-in-class", "cutting-edge", "seamless", "robust", or "leverage".
4. Each description must accurately represent the brand — do not invent services or claims.
5. Return ONLY valid JSON with platform keys mapped to description strings.`;

interface CanonicalBrand {
  canonicalName: string;
  canonicalDescription: string;
  canonicalTagline: string | null;
  canonicalCategory: string;
  canonicalServiceAreas: string[];
}

/**
 * Generates platform-adapted descriptions from a canonical brand profile.
 * Makes a single Claude Sonnet call for all platforms, then validates char limits.
 */
export async function generatePlatformDescriptions(
  canonical: CanonicalBrand,
  platforms: string[]
): Promise<Record<string, string>> {
  // Filter to only platforms with known character limits
  const validPlatforms = platforms.filter(
    (p) => PLATFORM_CHAR_LIMITS[p] !== undefined
  );

  if (validPlatforms.length === 0) {
    return {};
  }

  // Build the platform list with limits for the prompt
  const platformList = validPlatforms
    .map((p) => `- ${p}: max ${PLATFORM_CHAR_LIMITS[p]} characters`)
    .join("\n");

  const serviceAreasText =
    canonical.canonicalServiceAreas.length > 0
      ? `Service Areas: ${canonical.canonicalServiceAreas.join(", ")}`
      : "Service Areas: Not specified";

  const taglineText = canonical.canonicalTagline
    ? `Tagline: ${canonical.canonicalTagline}`
    : "Tagline: None";

  const userPrompt = `Adapt the following brand description for each platform listed below. Each adapted description must stay UNDER the platform's character limit.

Brand Name: ${canonical.canonicalName}
Category: ${canonical.canonicalCategory}
${taglineText}
${serviceAreasText}

Canonical Description:
${canonical.canonicalDescription}

Platforms and character limits:
${platformList}

Return a JSON object where each key is the platform name and each value is the adapted description string. Example format:
{
  "twitter": "Short description here",
  "linkedin": "Longer professional description here"
}`;

  const result = await callSonnet(userPrompt, {
    systemPrompt: SYSTEM_PROMPT,
    maxTokens: 4096,
    temperature: 0.4,
  });

  const descriptions = parseClaudeJson<Record<string, string>>(result.text);

  // Validate and enforce character limits
  const validated: Record<string, string> = {};

  for (const platform of validPlatforms) {
    const description = descriptions[platform];
    if (!description || typeof description !== "string") {
      continue;
    }

    const limit = PLATFORM_CHAR_LIMITS[platform];
    if (description.length <= limit) {
      validated[platform] = description;
    } else {
      // Truncate with ellipsis if over limit
      validated[platform] = description.substring(0, limit - 3) + "...";
    }
  }

  return validated;
}
