// =============================================================================
// PressForge — Newsroom Page Generator
// Generates a complete /newsroom or /press HTML page from approved press
// releases, coverage items, and client brand data. Includes proper
// Organization schema markup. 18% of ChatGPT citations come from brand
// newsrooms, making this higher ROI than wire distribution.
// =============================================================================

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface NewsroomPageResult {
  html: string;
  jsonLdSchema: string;
  metadata: {
    title: string;
    description: string;
    releaseCount: number;
    coverageCount: number;
  };
}

interface PressRelease {
  id: string;
  title: string;
  subtitle: string | null;
  body_html: string;
  body_text: string;
  pr_type: string | null;
  target_region: string | null;
  created_at: string;
  public_slug: string | null;
  public_url: string | null;
}

interface CoverageItem {
  title: string;
  url: string;
  publication: string;
  publish_date: string | null;
  coverage_type: string;
}

interface ClientInfo {
  name: string;
  website_url: string | null;
  brand_brief: string;
  logo_url: string | null;
  industry: string | null;
  location: string | null;
}

interface Spokesperson {
  name: string;
  title: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  photo_url: string | null;
}

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

export function generateNewsroomPage(
  client: ClientInfo,
  releases: PressRelease[],
  coverage: CoverageItem[],
  spokesperson: Spokesperson | null
): NewsroomPageResult {
  const baseUrl = client.website_url?.replace(/\/+$/, "") || "";
  const pageTitle = `${client.name} — Newsroom`;
  const pageDescription = `Latest press releases, media coverage, and company news from ${client.name}.`;

  // Generate Organization + NewsMediaOrganization schema
  const jsonLdSchema = generateSchema(client, baseUrl, spokesperson);

  // Generate HTML
  const html = generateHtml(
    client,
    releases,
    coverage,
    spokesperson,
    baseUrl,
    jsonLdSchema
  );

  return {
    html,
    jsonLdSchema,
    metadata: {
      title: pageTitle,
      description: pageDescription,
      releaseCount: releases.length,
      coverageCount: coverage.length,
    },
  };
}

// -----------------------------------------------------------------------------
// Schema Generation
// -----------------------------------------------------------------------------

function generateSchema(
  client: ClientInfo,
  baseUrl: string,
  spokesperson: Spokesperson | null
): string {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: client.name,
    description: client.brand_brief.substring(0, 250),
    url: baseUrl || undefined,
    logo: client.logo_url || undefined,
  };

  if (client.industry) {
    schema.industry = client.industry;
  }

  if (client.location) {
    schema.address = {
      "@type": "PostalAddress",
      addressLocality: client.location,
    };
  }

  if (spokesperson) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      contactType: "media",
      name: spokesperson.name,
      email: spokesperson.email || undefined,
      telephone: spokesperson.phone || undefined,
    };
  }

  // Strip undefined values
  const cleaned = JSON.parse(
    JSON.stringify(schema, (_, v) => (v === undefined ? undefined : v))
  );

  return JSON.stringify(cleaned, null, 2);
}

// -----------------------------------------------------------------------------
// HTML Generation
// -----------------------------------------------------------------------------

function generateHtml(
  client: ClientInfo,
  releases: PressRelease[],
  coverage: CoverageItem[],
  spokesperson: Spokesperson | null,
  baseUrl: string,
  jsonLd: string
): string {
  const sortedReleases = [...releases].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const sortedCoverage = [...coverage].sort((a, b) => {
    const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
    const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
    return dateB - dateA;
  });

  const releaseListHtml = sortedReleases
    .map((r) => {
      const date = new Date(r.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const link = r.public_url || r.public_slug
        ? `${baseUrl}/press/${r.public_slug}`
        : "#";
      return `      <article class="newsroom-release">
        <time datetime="${r.created_at}">${date}</time>
        <h3><a href="${escapeHtml(link)}">${escapeHtml(r.title)}</a></h3>
        ${r.subtitle ? `<p class="newsroom-subtitle">${escapeHtml(r.subtitle)}</p>` : ""}
        <p class="newsroom-excerpt">${escapeHtml(r.body_text.substring(0, 200))}...</p>
      </article>`;
    })
    .join("\n\n");

  const coverageListHtml = sortedCoverage
    .map((c) => {
      const date = c.publish_date
        ? new Date(c.publish_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "";
      return `      <li class="newsroom-coverage-item">
        <a href="${escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer">
          <span class="newsroom-publication">${escapeHtml(c.publication)}</span>
          <span class="newsroom-coverage-title">${escapeHtml(c.title)}</span>
          ${date ? `<time>${date}</time>` : ""}
        </a>
      </li>`;
    })
    .join("\n");

  const mediaContactHtml = spokesperson
    ? `
    <section class="newsroom-contact">
      <h2>Media Contact</h2>
      ${spokesperson.photo_url ? `<img src="${escapeHtml(spokesperson.photo_url)}" alt="${escapeHtml(spokesperson.name)}" class="newsroom-contact-photo" />` : ""}
      <p class="newsroom-contact-name">${escapeHtml(spokesperson.name)}</p>
      <p class="newsroom-contact-title">${escapeHtml(spokesperson.title)}</p>
      ${spokesperson.bio ? `<p class="newsroom-contact-bio">${escapeHtml(spokesperson.bio)}</p>` : ""}
      ${spokesperson.email ? `<p>Email: <a href="mailto:${escapeHtml(spokesperson.email)}">${escapeHtml(spokesperson.email)}</a></p>` : ""}
      ${spokesperson.phone ? `<p>Phone: ${escapeHtml(spokesperson.phone)}</p>` : ""}
    </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(client.name)} — Newsroom</title>
  <meta name="description" content="Latest press releases, media coverage, and company news from ${escapeHtml(client.name)}." />
  <meta property="og:title" content="${escapeHtml(client.name)} — Newsroom" />
  <meta property="og:description" content="Latest press releases and media coverage from ${escapeHtml(client.name)}." />
  <meta property="og:type" content="website" />
  ${client.logo_url ? `<meta property="og:image" content="${escapeHtml(client.logo_url)}" />` : ""}
  <script type="application/ld+json">
${jsonLd}
  </script>
  <style>
    .newsroom { max-width: 800px; margin: 0 auto; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; }
    .newsroom h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .newsroom h2 { font-size: 1.5rem; margin-top: 2.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    .newsroom-release { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .newsroom-release time { font-size: 0.85rem; color: #64748b; }
    .newsroom-release h3 { margin: 0.25rem 0 0.5rem; }
    .newsroom-release h3 a { color: #1a1a2e; text-decoration: none; }
    .newsroom-release h3 a:hover { color: #6C5CE7; }
    .newsroom-subtitle { color: #475569; font-style: italic; }
    .newsroom-excerpt { color: #64748b; }
    .newsroom-coverage-item { margin-bottom: 0.75rem; }
    .newsroom-coverage-item a { text-decoration: none; color: #1a1a2e; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .newsroom-coverage-item a:hover { color: #6C5CE7; }
    .newsroom-publication { font-weight: 600; color: #6C5CE7; min-width: 120px; }
    .newsroom-coverage-item time { color: #94a3b8; font-size: 0.85rem; }
    .newsroom-contact { background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 2rem; }
    .newsroom-contact-photo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
    .newsroom-contact-name { font-weight: 600; font-size: 1.1rem; }
    .newsroom-contact-title { color: #64748b; }
    .newsroom-about { color: #475569; line-height: 1.6; }
  </style>
</head>
<body>
  <main class="newsroom">
    <header>
      ${client.logo_url ? `<img src="${escapeHtml(client.logo_url)}" alt="${escapeHtml(client.name)} logo" style="height: 48px; margin-bottom: 1rem;" />` : ""}
      <h1>${escapeHtml(client.name)} Newsroom</h1>
      <p class="newsroom-about">${escapeHtml(client.brand_brief.substring(0, 300))}</p>
    </header>

    <section>
      <h2>Press Releases</h2>
${releaseListHtml || "      <p>No press releases published yet.</p>"}
    </section>

${
  sortedCoverage.length > 0
    ? `    <section>
      <h2>Media Coverage</h2>
      <ul style="list-style: none; padding: 0;">
${coverageListHtml}
      </ul>
    </section>`
    : ""
}

${mediaContactHtml}

    <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 0.85rem;">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(client.name)}. All rights reserved.</p>
    </footer>
  </main>
</body>
</html>`;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
