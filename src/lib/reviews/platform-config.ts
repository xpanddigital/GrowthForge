// Platform selection by vertical — determines which review platforms to scan for each client.

export type ReviewVertical =
  | "general"
  | "legal"
  | "music"
  | "home_services"
  | "construction"
  | "saas"
  | "ecommerce"
  | "finance";

export const REVIEW_PLATFORMS_BY_VERTICAL: Record<string, string[]> = {
  general: ["google", "trustpilot", "facebook", "bbb"],
  legal: [
    "google",
    "avvo",
    "super_lawyers",
    "martindale",
    "yelp",
    "facebook",
    "bbb",
  ],
  music: ["google", "trustpilot", "facebook"],
  home_services: [
    "google",
    "homeadvisor",
    "angi",
    "houzz",
    "yelp",
    "bbb",
    "facebook",
  ],
  construction: [
    "google",
    "homeadvisor",
    "angi",
    "houzz",
    "yelp",
    "bbb",
    "facebook",
  ],
  saas: [
    "google",
    "g2",
    "capterra",
    "trustpilot",
    "product_hunt",
    "trustradius",
  ],
  ecommerce: [
    "google",
    "trustpilot",
    "sitejabber",
    "reseller_ratings",
    "bbb",
    "amazon",
  ],
  finance: ["google", "trustpilot", "bbb", "yelp"],
};

/**
 * Get the list of review platforms relevant for a client's vertical.
 * Falls back to "general" if the vertical is not recognized.
 */
export function getPlatformsForVertical(vertical: string | null): string[] {
  if (!vertical) return REVIEW_PLATFORMS_BY_VERTICAL.general;
  return (
    REVIEW_PLATFORMS_BY_VERTICAL[vertical] ||
    REVIEW_PLATFORMS_BY_VERTICAL.general
  );
}
