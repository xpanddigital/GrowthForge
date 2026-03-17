/**
 * Schema Generator — JSON-LD template functions
 *
 * Pure template functions (no AI calls) that generate ready-to-paste
 * JSON-LD code blocks from canonical entity data. Each function returns
 * a complete <script type="application/ld+json"> block as a string.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CanonicalInput {
  canonicalName: string;
  canonicalDescription: string;
  canonicalTagline?: string | null;
  canonicalCategory: string;
  canonicalSubcategories?: string[];
  canonicalContact?: Record<string, unknown>;
  canonicalUrls?: Record<string, unknown>;
  canonicalFoundingYear?: number | null;
  canonicalFounderName?: string | null;
  canonicalEmployeeCount?: string | null;
  canonicalServiceAreas?: string[];
}

interface LocalBusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface GeoCoordinates {
  lat: number;
  lng: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceInput {
  name: string;
  description: string;
  url?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively strips null, undefined, and empty-string values from an object
 * so the serialized JSON-LD stays clean.
 */
function stripEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      const filtered = value
        .map((v) =>
          typeof v === 'object' && v !== null && !Array.isArray(v)
            ? stripEmpty(v as Record<string, unknown>)
            : v,
        )
        .filter((v) => v !== null && v !== undefined && v !== '');
      if (filtered.length > 0) {
        result[key] = filtered;
      }
    } else if (typeof value === 'object') {
      const cleaned = stripEmpty(value as Record<string, unknown>);
      if (Object.keys(cleaned).length > 0) {
        result[key] = cleaned;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Wraps a data object in a `<script type="application/ld+json">` block
 * with pretty-printed (2-space indent) JSON.
 */
export function wrapJsonLd(data: Record<string, unknown>): string {
  const cleaned = stripEmpty(data);
  const json = JSON.stringify(cleaned, null, 2);
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

// ---------------------------------------------------------------------------
// Schema generators
// ---------------------------------------------------------------------------

/**
 * Generate an Organization JSON-LD block.
 */
export function generateOrganizationSchema(
  canonical: CanonicalInput,
  sameAsUrls?: string[],
): string {
  const websiteUrl =
    (canonical.canonicalUrls?.website as string | undefined) ?? undefined;
  const logoUrl =
    (canonical.canonicalUrls?.logo as string | undefined) ?? undefined;

  const telephone =
    (canonical.canonicalContact?.telephone as string | undefined) ??
    (canonical.canonicalContact?.phone as string | undefined) ??
    undefined;
  const email =
    (canonical.canonicalContact?.email as string | undefined) ?? undefined;

  const contactPoint =
    telephone || email
      ? {
          '@type': 'ContactPoint',
          telephone: telephone ?? undefined,
          email: email ?? undefined,
          contactType: 'customer service',
        }
      : undefined;

  const founder = canonical.canonicalFounderName
    ? {
        '@type': 'Person',
        name: canonical.canonicalFounderName,
      }
    : undefined;

  const foundingDate = canonical.canonicalFoundingYear
    ? String(canonical.canonicalFoundingYear)
    : undefined;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: canonical.canonicalName,
    description: canonical.canonicalDescription,
    url: websiteUrl,
    logo: logoUrl,
    founder,
    foundingDate,
    numberOfEmployees: canonical.canonicalEmployeeCount
      ? {
          '@type': 'QuantitativeValue',
          value: canonical.canonicalEmployeeCount,
        }
      : undefined,
    contactPoint,
    sameAs: sameAsUrls && sameAsUrls.length > 0 ? sameAsUrls : undefined,
  };

  return wrapJsonLd(data);
}

/**
 * Generate a LocalBusiness JSON-LD block.
 * Extends Organization with address, geo coordinates, and optional priceRange.
 */
export function generateLocalBusinessSchema(
  canonical: CanonicalInput,
  address?: LocalBusinessAddress,
  geo?: GeoCoordinates,
  sameAsUrls?: string[],
): string {
  const websiteUrl =
    (canonical.canonicalUrls?.website as string | undefined) ?? undefined;
  const logoUrl =
    (canonical.canonicalUrls?.logo as string | undefined) ?? undefined;

  const telephone =
    (canonical.canonicalContact?.telephone as string | undefined) ??
    (canonical.canonicalContact?.phone as string | undefined) ??
    undefined;
  const email =
    (canonical.canonicalContact?.email as string | undefined) ?? undefined;
  const priceRange =
    (canonical.canonicalContact?.priceRange as string | undefined) ?? undefined;

  const contactPoint =
    telephone || email
      ? {
          '@type': 'ContactPoint',
          telephone: telephone ?? undefined,
          email: email ?? undefined,
          contactType: 'customer service',
        }
      : undefined;

  const founder = canonical.canonicalFounderName
    ? {
        '@type': 'Person',
        name: canonical.canonicalFounderName,
      }
    : undefined;

  const foundingDate = canonical.canonicalFoundingYear
    ? String(canonical.canonicalFoundingYear)
    : undefined;

  const postalAddress = address
    ? {
        '@type': 'PostalAddress',
        streetAddress: address.street,
        addressLocality: address.city,
        addressRegion: address.state,
        postalCode: address.zip,
        addressCountry: address.country,
      }
    : undefined;

  const geoCoordinates = geo
    ? {
        '@type': 'GeoCoordinates',
        latitude: geo.lat,
        longitude: geo.lng,
      }
    : undefined;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: canonical.canonicalName,
    description: canonical.canonicalDescription,
    url: websiteUrl,
    logo: logoUrl,
    founder,
    foundingDate,
    address: postalAddress,
    geo: geoCoordinates,
    telephone,
    priceRange,
    numberOfEmployees: canonical.canonicalEmployeeCount
      ? {
          '@type': 'QuantitativeValue',
          value: canonical.canonicalEmployeeCount,
        }
      : undefined,
    contactPoint,
    sameAs: sameAsUrls && sameAsUrls.length > 0 ? sameAsUrls : undefined,
  };

  return wrapJsonLd(data);
}

/**
 * Generate a FAQPage JSON-LD block.
 */
export function generateFAQSchema(faqs: FAQItem[]): string {
  const mainEntity = faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };

  return wrapJsonLd(data);
}

/**
 * Generate a Service JSON-LD block with provider as Organization.
 */
export function generateServiceSchema(
  canonical: CanonicalInput,
  service: ServiceInput,
): string {
  const websiteUrl =
    (canonical.canonicalUrls?.website as string | undefined) ?? undefined;

  const areaServed =
    canonical.canonicalServiceAreas && canonical.canonicalServiceAreas.length > 0
      ? canonical.canonicalServiceAreas.map((area) => ({
          '@type': 'Place',
          name: area,
        }))
      : undefined;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      '@type': 'Organization',
      name: canonical.canonicalName,
      url: websiteUrl,
    },
    areaServed,
  };

  return wrapJsonLd(data);
}

/**
 * Generate a BreadcrumbList JSON-LD block.
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };

  return wrapJsonLd(data);
}

/**
 * Generate a WebSite JSON-LD block with optional SearchAction.
 */
export function generateWebSiteSchema(canonical: CanonicalInput): string {
  const websiteUrl =
    (canonical.canonicalUrls?.website as string | undefined) ?? undefined;
  const searchUrlTemplate =
    (canonical.canonicalUrls?.searchUrlTemplate as string | undefined) ??
    undefined;

  const potentialAction = searchUrlTemplate
    ? {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: searchUrlTemplate,
        },
        'query-input': 'required name=search_term_string',
      }
    : undefined;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: canonical.canonicalName,
    url: websiteUrl,
    description: canonical.canonicalDescription,
    potentialAction,
  };

  return wrapJsonLd(data);
}
