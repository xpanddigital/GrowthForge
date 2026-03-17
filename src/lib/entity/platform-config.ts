// =============================================================================
// Entity Sync Module — Platform Configuration
// Step 2: Full platform registry, AI crawler definitions, schema expectations
// =============================================================================

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Vertical =
  | 'general'
  | 'legal'
  | 'music'
  | 'home_services'
  | 'saas'
  | 'ecommerce'
  | 'healthcare'
  | 'restaurant'
  | 'real_estate'
  | 'finance'
  | 'agency'
  | 'professional';

export type ScrapingMethod =
  | 'apify_google_search'
  | 'apify_direct'
  | 'api'
  | 'website_parse';

export type CrawlerCriticality = 'critical' | 'non_critical';

export interface PlatformConfig {
  platform: string;
  displayName: string;
  weight: number;
  quickScan: boolean;
  verticals: Vertical[];
  scrapingMethod: ScrapingMethod;
  urlPattern: RegExp;
  charLimit: number | null;
  claimUrl: string | null;
  instructions: string;
}

export interface AICrawler {
  name: string;
  userAgent: string;
  company: string;
  purpose: string;
  criticality: CrawlerCriticality;
}

export type PageType =
  | 'homepage'
  | 'about'
  | 'contact'
  | 'service'
  | 'product'
  | 'blog';

export interface SchemaExpectation {
  pageType: PageType;
  verticals: Vertical[] | null; // null = all verticals
  schemas: string[];
}

// -----------------------------------------------------------------------------
// Platform Configuration (30+ platforms)
// -----------------------------------------------------------------------------

export const PLATFORM_CONFIG: PlatformConfig[] = [
  // ---------------------------------------------------------------------------
  // Universal platforms (all verticals)
  // ---------------------------------------------------------------------------
  {
    platform: 'google_business',
    displayName: 'Google Business Profile',
    weight: 100,
    quickScan: true,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /business\.google\.com|google\.com\/maps/i,
    charLimit: 750,
    claimUrl: 'https://business.google.com/',
    instructions:
      'Claim or create your Google Business Profile at business.google.com. Verify via postcard, phone, or email.',
  },
  {
    platform: 'wikipedia',
    displayName: 'Wikipedia',
    weight: 95,
    quickScan: true,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /wikipedia\.org/i,
    charLimit: null,
    claimUrl: null,
    instructions:
      'Wikipedia pages must meet notability guidelines. Do not create your own page — instead, ensure sufficient third-party coverage exists and request creation via the Articles for Creation process.',
  },
  {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    weight: 90,
    quickScan: true,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /linkedin\.com\/company/i,
    charLimit: 2000,
    claimUrl: 'https://www.linkedin.com/company/setup/new/',
    instructions:
      'Create a LinkedIn Company Page. Add a complete description, logo, cover image, and website URL. Ensure admin access is assigned to a verified employee.',
  },
  {
    platform: 'wikidata',
    displayName: 'Wikidata',
    weight: 85,
    quickScan: false,
    verticals: ['general'],
    scrapingMethod: 'api',
    urlPattern: /wikidata\.org/i,
    charLimit: null,
    claimUrl: 'https://www.wikidata.org/wiki/Special:NewItem',
    instructions:
      'Create a Wikidata item for your organization. Include instance_of (Q4830453 for business), official website, founding date, and industry classification.',
  },
  {
    platform: 'crunchbase',
    displayName: 'Crunchbase',
    weight: 75,
    quickScan: true,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /crunchbase\.com/i,
    charLimit: 2000,
    claimUrl: 'https://www.crunchbase.com/add-organization',
    instructions:
      'Add your organization to Crunchbase. Complete the full profile including description, founding date, founders, funding (if applicable), headquarters, and categories.',
  },
  {
    platform: 'trustpilot',
    displayName: 'Trustpilot',
    weight: 70,
    quickScan: false,
    verticals: ['general', 'saas', 'ecommerce'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /trustpilot\.com/i,
    charLimit: 500,
    claimUrl: 'https://business.trustpilot.com/',
    instructions:
      'Claim your free Trustpilot business profile. Add your logo, business description, and category. Respond to all reviews within 48 hours.',
  },
  {
    platform: 'apple_maps',
    displayName: 'Apple Maps',
    weight: 65,
    quickScan: false,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /maps\.apple\.com/i,
    charLimit: null,
    claimUrl: 'https://mapsconnect.apple.com/',
    instructions:
      'Claim your Apple Maps listing via Apple Maps Connect. Verify ownership and ensure business name, address, phone, and category match your Google Business Profile.',
  },
  {
    platform: 'yelp',
    displayName: 'Yelp',
    weight: 65,
    quickScan: false,
    verticals: ['general', 'home_services', 'restaurant'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /yelp\.com/i,
    charLimit: 1500,
    claimUrl: 'https://biz.yelp.com/',
    instructions:
      'Claim your Yelp Business Page. Add photos, complete your business description, set business hours, and respond to reviews promptly.',
  },
  {
    platform: 'facebook',
    displayName: 'Facebook',
    weight: 60,
    quickScan: true,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /facebook\.com/i,
    charLimit: 255,
    claimUrl: 'https://www.facebook.com/pages/create',
    instructions:
      'Create a Facebook Business Page. Add profile photo, cover image, short description (255 chars), about section, website, and contact details.',
  },
  {
    platform: 'bing_places',
    displayName: 'Bing Places',
    weight: 60,
    quickScan: false,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /bing\.com\/maps/i,
    charLimit: null,
    claimUrl: 'https://www.bingplaces.com/',
    instructions:
      'Claim your Bing Places listing. You can import directly from Google Business Profile for consistency. Verify via phone or postcard.',
  },
  {
    platform: 'bbb',
    displayName: 'Better Business Bureau',
    weight: 60,
    quickScan: false,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /bbb\.org/i,
    charLimit: 500,
    claimUrl: 'https://www.bbb.org/get-listed',
    instructions:
      'Request a BBB listing (free) or accreditation (paid). Ensure your business name and contact information match other listings exactly.',
  },
  {
    platform: 'twitter',
    displayName: 'X (Twitter)',
    weight: 55,
    quickScan: false,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /twitter\.com|x\.com/i,
    charLimit: 160,
    claimUrl: 'https://x.com/i/flow/signup',
    instructions:
      'Create or claim your X (Twitter) business account. Add a profile photo, header image, bio (160 chars), website link, and location.',
  },
  {
    platform: 'instagram',
    displayName: 'Instagram',
    weight: 50,
    quickScan: false,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /instagram\.com/i,
    charLimit: 150,
    claimUrl: 'https://www.instagram.com/accounts/emailsignup/',
    instructions:
      'Create an Instagram Business account. Add a profile photo, bio (150 chars), website link, and category. Convert to a Professional account for analytics.',
  },
  {
    platform: 'youtube',
    displayName: 'YouTube',
    weight: 50,
    quickScan: false,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /youtube\.com/i,
    charLimit: 1000,
    claimUrl: 'https://www.youtube.com/account',
    instructions:
      'Create a YouTube Brand Account. Add a channel description (1000 chars), banner image, profile photo, website links, and contact email.',
  },
  {
    platform: 'foursquare',
    displayName: 'Foursquare',
    weight: 40,
    quickScan: false,
    verticals: ['general'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /foursquare\.com/i,
    charLimit: null,
    claimUrl: 'https://foursquare.com/business/claim',
    instructions:
      'Claim your Foursquare listing. This feeds data to Apple Maps and many navigation apps. Ensure NAP (name, address, phone) consistency.',
  },

  // ---------------------------------------------------------------------------
  // Legal vertical
  // ---------------------------------------------------------------------------
  {
    platform: 'avvo',
    displayName: 'Avvo',
    weight: 85,
    quickScan: true,
    verticals: ['legal'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /avvo\.com/i,
    charLimit: 1000,
    claimUrl: 'https://www.avvo.com/for-lawyers',
    instructions:
      'Claim your free Avvo attorney profile. Add a detailed biography, practice areas, education, awards, and client reviews. Respond to legal questions to build authority.',
  },
  {
    platform: 'super_lawyers',
    displayName: 'Super Lawyers',
    weight: 80,
    quickScan: true,
    verticals: ['legal'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /superlawyers\.com/i,
    charLimit: null,
    claimUrl: 'https://attorneys.superlawyers.com/',
    instructions:
      'Claim your Super Lawyers profile if selected. Add a professional photo, biography, and practice area details. Selection is by peer nomination and research.',
  },
  {
    platform: 'findlaw',
    displayName: 'FindLaw',
    weight: 75,
    quickScan: false,
    verticals: ['legal'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /findlaw\.com/i,
    charLimit: null,
    claimUrl: 'https://www.findlaw.com/',
    instructions:
      'Create or claim your FindLaw lawyer directory profile. Ensure practice areas, office locations, and contact details are accurate and consistent.',
  },
  {
    platform: 'justia',
    displayName: 'Justia',
    weight: 75,
    quickScan: false,
    verticals: ['legal'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /justia\.com/i,
    charLimit: null,
    claimUrl: 'https://www.justia.com/lawyers',
    instructions:
      'Claim your free Justia lawyer profile. Add biography, practice areas, education, bar admissions, and publications.',
  },
  {
    platform: 'martindale',
    displayName: 'Martindale-Hubbell',
    weight: 70,
    quickScan: false,
    verticals: ['legal'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /martindale\.com/i,
    charLimit: null,
    claimUrl: 'https://www.martindale.com/',
    instructions:
      'Claim your Martindale-Hubbell profile. Add AV Preeminent rating if eligible, client reviews, peer endorsements, and complete practice area details.',
  },

  // ---------------------------------------------------------------------------
  // Music vertical
  // ---------------------------------------------------------------------------
  {
    platform: 'musicbrainz',
    displayName: 'MusicBrainz',
    weight: 80,
    quickScan: true,
    verticals: ['music'],
    scrapingMethod: 'api',
    urlPattern: /musicbrainz\.org/i,
    charLimit: null,
    claimUrl: 'https://musicbrainz.org/register',
    instructions:
      'Create a MusicBrainz artist or label entry. Add ISNI, discography, relationships, and external links. This feeds into many music discovery services.',
  },
  {
    platform: 'allmusic',
    displayName: 'AllMusic',
    weight: 70,
    quickScan: true,
    verticals: ['music'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /allmusic\.com/i,
    charLimit: null,
    claimUrl: null,
    instructions:
      'AllMusic profiles are editorially managed. Ensure your MusicBrainz and Discogs entries are complete, as AllMusic cross-references these databases.',
  },
  {
    platform: 'discogs',
    displayName: 'Discogs',
    weight: 65,
    quickScan: false,
    verticals: ['music'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /discogs\.com/i,
    charLimit: null,
    claimUrl: 'https://www.discogs.com/',
    instructions:
      'Create or edit your Discogs artist/label page. Add a biography, profile image, member list, and complete discography. Link to other databases.',
  },

  // ---------------------------------------------------------------------------
  // Home services vertical
  // ---------------------------------------------------------------------------
  {
    platform: 'homeadvisor',
    displayName: 'HomeAdvisor',
    weight: 80,
    quickScan: true,
    verticals: ['home_services'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /homeadvisor\.com/i,
    charLimit: null,
    claimUrl: 'https://pro.homeadvisor.com/',
    instructions:
      'Register as a HomeAdvisor Pro. Complete your business profile with services offered, service area, license numbers, and insurance verification.',
  },
  {
    platform: 'angi',
    displayName: 'Angi',
    weight: 80,
    quickScan: true,
    verticals: ['home_services'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /angi\.com/i,
    charLimit: null,
    claimUrl: 'https://www.angi.com/for-business',
    instructions:
      'Claim your Angi (formerly Angie\'s List) business profile. Respond to reviews, add project photos, and keep service descriptions current.',
  },
  {
    platform: 'houzz',
    displayName: 'Houzz',
    weight: 70,
    quickScan: false,
    verticals: ['home_services'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /houzz\.com/i,
    charLimit: null,
    claimUrl: 'https://www.houzz.com/professionals',
    instructions:
      'Create a Houzz Pro profile. Upload project photos organized by room/type, add a detailed business description, and encourage client reviews.',
  },

  // ---------------------------------------------------------------------------
  // SaaS / Tech vertical
  // ---------------------------------------------------------------------------
  {
    platform: 'g2',
    displayName: 'G2',
    weight: 85,
    quickScan: true,
    verticals: ['saas'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /g2\.com/i,
    charLimit: 1500,
    claimUrl: 'https://sell.g2.com/',
    instructions:
      'Claim your G2 product profile. Add a complete description, feature list, screenshots, pricing info, and integration details. Actively collect verified reviews.',
  },
  {
    platform: 'capterra',
    displayName: 'Capterra',
    weight: 80,
    quickScan: true,
    verticals: ['saas'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /capterra\.com/i,
    charLimit: 1000,
    claimUrl: 'https://www.capterra.com/vendors/sign-up',
    instructions:
      'List your software on Capterra. Add a detailed description, feature list, screenshots, pricing, and deployment details. Encourage verified user reviews.',
  },
  {
    platform: 'product_hunt',
    displayName: 'Product Hunt',
    weight: 70,
    quickScan: false,
    verticals: ['saas'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /producthunt\.com/i,
    charLimit: null,
    claimUrl: 'https://www.producthunt.com/posts/new',
    instructions:
      'Launch or claim your Product Hunt page. Add a tagline, description, media (images/video), maker profiles, and respond to community comments.',
  },
  {
    platform: 'angellist',
    displayName: 'AngelList / Wellfound',
    weight: 60,
    quickScan: false,
    verticals: ['saas'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /angel\.co|wellfound\.com/i,
    charLimit: null,
    claimUrl: 'https://wellfound.com/',
    instructions:
      'Create your Wellfound (formerly AngelList) company profile. Add team members, funding info, company size, tech stack, and open positions.',
  },
  {
    platform: 'alternativeto',
    displayName: 'AlternativeTo',
    weight: 55,
    quickScan: false,
    verticals: ['saas'],
    scrapingMethod: 'apify_google_search',
    urlPattern: /alternativeto\.net/i,
    charLimit: null,
    claimUrl: 'https://alternativeto.net/manage/',
    instructions:
      'Add your software to AlternativeTo. Tag relevant categories and platforms. This is heavily cited by AI models when users ask for alternatives.',
  },
];

// -----------------------------------------------------------------------------
// AI Crawlers
// -----------------------------------------------------------------------------

export const AI_CRAWLERS: AICrawler[] = [
  {
    name: 'GPTBot',
    userAgent: 'GPTBot',
    company: 'OpenAI',
    purpose: 'ChatGPT training data',
    criticality: 'critical',
  },
  {
    name: 'ChatGPT-User',
    userAgent: 'ChatGPT-User',
    company: 'OpenAI',
    purpose: 'ChatGPT live browsing',
    criticality: 'critical',
  },
  {
    name: 'Google-Extended',
    userAgent: 'Google-Extended',
    company: 'Google',
    purpose: 'Gemini training data',
    criticality: 'critical',
  },
  {
    name: 'Googlebot',
    userAgent: 'Googlebot',
    company: 'Google',
    purpose: 'Google Search and AI Overviews',
    criticality: 'critical',
  },
  {
    name: 'PerplexityBot',
    userAgent: 'PerplexityBot',
    company: 'Perplexity',
    purpose: 'Perplexity AI search',
    criticality: 'critical',
  },
  {
    name: 'ClaudeBot',
    userAgent: 'ClaudeBot',
    company: 'Anthropic',
    purpose: 'Claude training data',
    criticality: 'non_critical',
  },
  {
    name: 'Bytespider',
    userAgent: 'Bytespider',
    company: 'ByteDance',
    purpose: 'TikTok and ByteDance AI services',
    criticality: 'non_critical',
  },
  {
    name: 'CCBot',
    userAgent: 'CCBot',
    company: 'Common Crawl',
    purpose: 'Open web corpus used by many AI models',
    criticality: 'non_critical',
  },
  {
    name: 'anthropic-ai',
    userAgent: 'anthropic-ai',
    company: 'Anthropic',
    purpose: 'Claude web fetching',
    criticality: 'non_critical',
  },
  {
    name: 'cohere-ai',
    userAgent: 'cohere-ai',
    company: 'Cohere',
    purpose: 'Cohere AI training data',
    criticality: 'non_critical',
  },
];

// -----------------------------------------------------------------------------
// Expected Schema.org Markup
// -----------------------------------------------------------------------------

const LOCAL_VERTICALS: Vertical[] = [
  'home_services',
  'restaurant',
  'legal',
  'real_estate',
];

export const EXPECTED_SCHEMAS: SchemaExpectation[] = [
  // Homepage — all verticals
  {
    pageType: 'homepage',
    verticals: null,
    schemas: ['Organization', 'WebSite', 'BreadcrumbList'],
  },
  // Homepage — local verticals get LocalBusiness too
  {
    pageType: 'homepage',
    verticals: LOCAL_VERTICALS,
    schemas: ['Organization', 'WebSite', 'BreadcrumbList', 'LocalBusiness'],
  },
  // About
  {
    pageType: 'about',
    verticals: null,
    schemas: ['Organization', 'BreadcrumbList'],
  },
  // Contact
  {
    pageType: 'contact',
    verticals: null,
    schemas: ['Organization', 'ContactPoint', 'BreadcrumbList'],
  },
  // Service
  {
    pageType: 'service',
    verticals: null,
    schemas: ['Service', 'BreadcrumbList'],
  },
  // Product
  {
    pageType: 'product',
    verticals: null,
    schemas: ['Product', 'BreadcrumbList', 'AggregateRating'],
  },
  // Blog
  {
    pageType: 'blog',
    verticals: null,
    schemas: ['Article', 'BreadcrumbList'],
  },
];

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Returns all platforms relevant to a given vertical.
 * Includes universal platforms (verticals includes 'general') and
 * vertical-specific platforms. Sorted by weight descending.
 */
export function getPlatformsForVertical(
  vertical: Vertical | null
): PlatformConfig[] {
  return PLATFORM_CONFIG.filter((p) => {
    if (p.verticals.includes('general')) return true;
    if (vertical && p.verticals.includes(vertical)) return true;
    return false;
  }).sort((a, b) => b.weight - a.weight);
}

/**
 * Returns only quick-scan platforms for a given vertical.
 * These are the highest-priority platforms checked first during audits.
 * Sorted by weight descending.
 */
export function getQuickScanPlatforms(
  vertical: Vertical | null
): PlatformConfig[] {
  return getPlatformsForVertical(vertical)
    .filter((p) => p.quickScan)
    .sort((a, b) => b.weight - a.weight);
}

/**
 * Finds a platform configuration by its key.
 */
export function getPlatformByKey(key: string): PlatformConfig | undefined {
  return PLATFORM_CONFIG.find((p) => p.platform === key);
}

/**
 * Returns the character limit for a platform's description field.
 * Returns null if the platform has no defined limit or is not found.
 */
export function getPlatformCharLimit(key: string): number | null {
  const platform = getPlatformByKey(key);
  return platform?.charLimit ?? null;
}

/**
 * Returns the expected schema.org types for a given page type and vertical.
 * Merges base schemas (verticals: null) with vertical-specific schemas.
 */
export function getExpectedSchemas(
  pageType: PageType,
  vertical: Vertical | null
): string[] {
  const schemas = new Set<string>();

  for (const expectation of EXPECTED_SCHEMAS) {
    if (expectation.pageType !== pageType) continue;

    // Add base schemas (verticals: null applies to all)
    if (expectation.verticals === null) {
      for (const schema of expectation.schemas) {
        schemas.add(schema);
      }
    }

    // Add vertical-specific schemas
    if (
      vertical &&
      expectation.verticals !== null &&
      expectation.verticals.includes(vertical)
    ) {
      for (const schema of expectation.schemas) {
        schemas.add(schema);
      }
    }
  }

  return Array.from(schemas);
}
