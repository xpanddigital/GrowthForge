// Location wrapper for geo-targeted monitoring queries.
// For LLM models, appends location naturally to prompt text.
// For Google AI Overviews, location is handled via SerpApi API params.

export function wrapPromptWithLocation(
  promptText: string,
  location: { countryCode: string; locationString?: string } | undefined,
  model: string
): string {
  if (!location?.locationString) return promptText;

  // For Google AIO, location is handled via SerpApi API params, not prompt text
  if (model === "google_ai_overview") return promptText;

  // For LLM models, append location naturally (if not already present)
  if (
    promptText.toLowerCase().includes(location.locationString.toLowerCase())
  ) {
    return promptText; // Already contains location
  }

  return `${promptText} (I'm based in ${location.locationString})`;
}
