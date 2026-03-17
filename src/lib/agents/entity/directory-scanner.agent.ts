// Directory Scanner Agent — discovers brand presence across directory platforms
// using Google SERP searches via Apify.
//
// For each requested platform, searches Google for "{brandName}" site:{domain}
// and parses results to find matching profile URLs.
// Conforms to the EntityDirectoryScannerAgent interface.

import type {
  EntityDirectoryScannerAgent,
  EntityCanonical,
  EntityProfileData,
} from "../interfaces";
import { runActor } from "@/lib/apify/client";
import { ACTOR_IDS, type GoogleSearchResult } from "@/lib/apify/actors";
import {
  getPlatformByKey,
  type PlatformConfig,
} from "@/lib/entity/platform-config";

// Maps platform keys to the Google site: search domain.
// Some platforms need a more specific path to avoid false positives.
const PLATFORM_SEARCH_DOMAINS: Record<string, string> = {
  google_business: "google.com/maps",
  wikipedia: "wikipedia.org",
  linkedin: "linkedin.com/company",
  wikidata: "wikidata.org",
  crunchbase: "crunchbase.com",
  trustpilot: "trustpilot.com",
  apple_maps: "maps.apple.com",
  yelp: "yelp.com",
  facebook: "facebook.com",
  bing_places: "bing.com/maps",
  bbb: "bbb.org",
  twitter: "x.com",
  instagram: "instagram.com",
  youtube: "youtube.com",
  foursquare: "foursquare.com",
  // Legal
  avvo: "avvo.com",
  super_lawyers: "superlawyers.com",
  findlaw: "findlaw.com",
  justia: "justia.com",
  martindale: "martindale.com",
  // Music
  musicbrainz: "musicbrainz.org",
  allmusic: "allmusic.com",
  discogs: "discogs.com",
  // Home services
  homeadvisor: "homeadvisor.com",
  angi: "angi.com",
  houzz: "houzz.com",
  // SaaS
  g2: "g2.com",
  capterra: "capterra.com",
  product_hunt: "producthunt.com",
  angellist: "wellfound.com",
  alternativeto: "alternativeto.net",
};

/**
 * Returns the site: domain to use for a given platform key.
 * Falls back to extracting a domain from the platform's urlPattern if not
 * explicitly mapped.
 */
function getSearchDomain(platformKey: string): string | null {
  if (PLATFORM_SEARCH_DOMAINS[platformKey]) {
    return PLATFORM_SEARCH_DOMAINS[platformKey];
  }
  // No mapping found
  return null;
}

export class DirectoryScannerAgent implements EntityDirectoryScannerAgent {
  name = "DirectoryScannerAgent";

  async scan(
    clientId: string,
    canonical: EntityCanonical,
    platformKeys: string[]
  ): Promise<EntityProfileData[]> {
    const results: EntityProfileData[] = [];

    // Resolve platform configs and build search queries
    const platformEntries: Array<{
      key: string;
      config: PlatformConfig;
      searchDomain: string;
    }> = [];

    for (const key of platformKeys) {
      const config = getPlatformByKey(key);
      if (!config) {
        console.warn(
          `[DirectoryScannerAgent] Unknown platform key: ${key} (clientId=${clientId})`
        );
        continue;
      }

      const searchDomain = getSearchDomain(key);
      if (!searchDomain) {
        console.warn(
          `[DirectoryScannerAgent] No search domain for platform: ${key} (clientId=${clientId})`
        );
        // Return a not-found result for unmapped platforms
        results.push(buildEmptyProfile(key));
        continue;
      }

      platformEntries.push({ key, config, searchDomain });
    }

    if (platformEntries.length === 0) {
      return results;
    }

    // Build all search queries as newline-separated string for a single actor run
    const queries = platformEntries.map(
      (entry) =>
        `"${canonical.canonicalName}" site:${entry.searchDomain}`
    );

    // Run SERP search via Apify
    let serpItems: GoogleSearchResult[] = [];
    try {
      const serpInput = {
        queries: queries.join("\n"),
        maxPagesPerQuery: 1,
        resultsPerPage: 10,
        languageCode: "en",
        countryCode: "us",
        mobileResults: false,
        includeUnfilteredResults: false,
        saveHtml: false,
        saveHtmlToKeyValueStore: false,
      };

      const serpResult = await runActor<typeof serpInput, GoogleSearchResult>(
        ACTOR_IDS.GOOGLE_SEARCH_SCRAPER,
        serpInput,
        { timeoutSecs: 300, maxItems: platformEntries.length * 10 }
      );

      serpItems = serpResult.items;
    } catch (error) {
      console.error(
        `[DirectoryScannerAgent] SERP scan failed for client ${clientId}:`,
        error instanceof Error ? error.message : error
      );
      // Total failure: return empty profiles for all platforms
      for (const entry of platformEntries) {
        results.push(buildEmptyProfile(entry.key));
      }
      return results;
    }

    // Build a lookup: for each SERP result page, find which platform it belongs to
    // by matching the search query term back to our platform entries.
    // Each SERP result page corresponds to one query (one platform).
    const serpResultsByPlatform = new Map<string, GoogleSearchResult>();

    for (const serpPage of serpItems) {
      const queryTerm = serpPage.searchQuery?.term;
      if (!queryTerm) continue;

      // Match query term back to platform by checking if the domain appears
      for (const entry of platformEntries) {
        if (queryTerm.includes(`site:${entry.searchDomain}`)) {
          serpResultsByPlatform.set(entry.key, serpPage);
          break;
        }
      }
    }

    // Process each platform
    for (const entry of platformEntries) {
      try {
        const serpPage = serpResultsByPlatform.get(entry.key);
        const profile = parsePlatformResult(
          entry.key,
          entry.config,
          canonical.canonicalName,
          serpPage
        );
        results.push(profile);
      } catch (error) {
        console.error(
          `[DirectoryScannerAgent] Failed to parse results for platform ${entry.key} (clientId=${clientId}):`,
          error instanceof Error ? error.message : error
        );
        results.push(buildEmptyProfile(entry.key));
      }
    }

    return results;
  }
}

/**
 * Parses SERP results for a single platform, returning an EntityProfileData.
 * If no matching result is found, returns a profile with null data
 * (indicating not_found).
 */
function parsePlatformResult(
  platformKey: string,
  config: PlatformConfig,
  brandName: string,
  serpPage: GoogleSearchResult | undefined
): EntityProfileData {
  if (!serpPage || !serpPage.organicResults || serpPage.organicResults.length === 0) {
    return buildEmptyProfile(platformKey);
  }

  // Find the first organic result whose URL matches the platform's urlPattern
  for (const result of serpPage.organicResults) {
    if (!result.url) continue;

    if (config.urlPattern.test(result.url)) {
      // Verify the result is actually relevant by checking the title or
      // description contains the brand name (case-insensitive)
      const titleMatch = result.title
        ?.toLowerCase()
        .includes(brandName.toLowerCase());
      const descMatch = result.description
        ?.toLowerCase()
        .includes(brandName.toLowerCase());

      if (!titleMatch && !descMatch) {
        // Result matches platform URL but doesn't seem related to the brand
        continue;
      }

      return {
        platform: platformKey,
        platformProfileUrl: result.url,
        platformProfileId: extractProfileId(result.url, platformKey),
        isClaimed: null, // Unknown until manually verified
        descriptionText: result.description || null,
        category: null,
        contactInfo: {},
        additionalFields: {
          serpTitle: result.title || null,
          serpPosition: result.position ?? null,
        },
      };
    }
  }

  // No matching result found for this platform
  return buildEmptyProfile(platformKey);
}

/**
 * Builds an empty EntityProfileData for a platform that was not found.
 */
function buildEmptyProfile(platformKey: string): EntityProfileData {
  return {
    platform: platformKey,
    platformProfileUrl: null,
    platformProfileId: null,
    isClaimed: null,
    descriptionText: null,
    category: null,
    contactInfo: {},
    additionalFields: {},
  };
}

/**
 * Attempts to extract a platform-specific profile ID from the URL.
 * Returns null if extraction is not possible.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractProfileId(url: string, _platformKey: string): string | null {
  try {
    const parsed = new URL(url);
    // Return the pathname as a simple identifier
    return parsed.pathname.replace(/\/+$/, "") || null;
  } catch {
    return null;
  }
}
