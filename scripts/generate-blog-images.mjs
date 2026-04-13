#!/usr/bin/env node

/**
 * Blog Image Generator — Uses Gemini Nano Banana 2 to generate
 * unique featured images for all 81 MentionLayer blog posts.
 *
 * Usage:
 *   node scripts/generate-blog-images.mjs                    # Generate all missing
 *   node scripts/generate-blog-images.mjs --batch 1          # Generate batch 1 only (posts 1-10)
 *   node scripts/generate-blog-images.mjs --slug ai-seo-vs-traditional-seo  # Single post
 *   node scripts/generate-blog-images.mjs --force            # Regenerate all (overwrites)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "blog");
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyCcXMLanRNfI1hi5RPWaF9htP4yZhg-gmU";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";

// Brand style prefix — prepended to every prompt
const STYLE_PREFIX = `A warm editorial flat-design illustration in the MentionLayer brand style. Deep indigo (hex 3d2be0) as primary color, warm cream (hex fcfbf9) as background, with navy (hex 1a1a2e) accents. Clean geometric minimal flat illustration style — think Stripe, Linear, or Notion marketing illustrations. Premium SaaS editorial quality. No photorealism. No text, no words, no numbers, no labels, no UI text anywhere in the image.`;

// Category accent colors
const ACCENT = {
  fundamentals: "Use blue (#3B82F6) as secondary accent for highlights.",
  strategy: "Use emerald green (#059669) as secondary accent for growth indicators.",
  technical: "Use amber (#d97706) as secondary accent for technical elements.",
  industry: "Use purple (#7c3aed) as secondary accent for industry elements.",
  tools: "Use rose/pink (#e11d48) as secondary accent for tool elements.",
};

// All 81 posts with their visual concepts
const POSTS = [
  // === FUNDAMENTALS ===
  { slug: "brand-invisible-to-ai", category: "fundamentals", concept: "A brand icon fading to transparent/invisible against a backdrop of AI model interfaces showing competitor logos prominently" },
  { slug: "ai-seo-vs-traditional-seo", category: "fundamentals", concept: "A split composition — left side shows traditional search results with blue links, right side shows AI chat interface with recommendations. A dividing line between old and new" },
  { slug: "what-is-geo-complete-guide", category: "fundamentals", concept: "A comprehensive blueprint/architectural diagram showing the pillars of GEO — forums, press, entities, reviews, monitoring — all connected to a central brand node" },
  { slug: "share-of-model-metric", category: "fundamentals", concept: "A podium/leaderboard with brand icons ranked by percentage bars, with AI model logos as the judges" },
  { slug: "what-is-ai-visibility-score", category: "fundamentals", concept: "A large circular score gauge with a needle pointing high, surrounded by five pillar icons radiating outward" },
  { slug: "ai-seo-statistics-2026", category: "fundamentals", concept: "An array of floating data cards and chart snippets showing upward trends, percentages, and growth indicators" },
  { slug: "what-is-consensus-layer-ai-search", category: "fundamentals", concept: "Multiple data sources (discussion forums, news, reviews, encyclopedia) flowing into a funnel that produces a single AI recommendation" },
  { slug: "chatgpt-recommends-competitors-not-you", category: "fundamentals", concept: "An AI chat-style interface highlighting competitor names in green while one brand name is crossed out in red" },
  { slug: "topical-authority-complete-guide", category: "fundamentals", concept: "A tree with deep roots (content depth) and wide branches (topic coverage), with knowledge nodes at each branch point" },
  { slug: "what-is-topical-authority-ai", category: "fundamentals", concept: "An authoritative pillar structure with interconnected topic clusters orbiting around it" },
  { slug: "content-refresh-playbook-ai-citations", category: "fundamentals", concept: "A document being polished/renewed with sparkling refresh indicators and upward-trending citation graphs" },
  { slug: "how-ai-models-choose", category: "fundamentals", concept: "An AI model brain/neural network with weighted pathways leading to different brand options, showing the decision process" },
  { slug: "what-is-ai-brand-sentiment", category: "fundamentals", concept: "A sentiment spectrum from negative (red) through neutral (yellow) to positive (green) with a brand icon being measured" },
  { slug: "what-is-knowledge-graph", category: "fundamentals", concept: "An interconnected web of entity nodes (brand, products, people, locations) with relationship lines between them" },
  { slug: "what-is-structured-data-ai", category: "fundamentals", concept: "Clean code brackets containing organized brand information, with AI model icons reading and parsing it" },
  { slug: "ai-visibility-index-study", category: "fundamentals", concept: "A large research report cover with data visualizations — bar charts, scatter plots, and prominent data points" },

  // === STRATEGY ===
  { slug: "ai-citation-index", category: "strategy", concept: "A map/network showing data flowing from discussion forums, Q&A sites, encyclopedia, news sites into AI model brains" },
  { slug: "digital-pr-ai-era", category: "strategy", concept: "A newspaper/press release transforming into digital signals that feed into AI recommendation engines" },
  { slug: "roi-ai-visibility", category: "strategy", concept: "A revenue chart with an upward curve, with AI visibility score correlating alongside it" },
  { slug: "ninety-day-playbook", category: "strategy", concept: "A calendar/roadmap with three phases marked (30/60/90 days) showing progressive growth milestones" },
  { slug: "monitor-what-ai-says-about-brand", category: "strategy", concept: "A radar/monitoring station scanning multiple AI model outputs with alert indicators" },
  { slug: "brand-not-appearing-ai-search-fix", category: "strategy", concept: "A broken chain being repaired — disconnected brand signal being reconnected to AI recommendation flow" },
  { slug: "best-ways-get-brand-recommended-by-ai", category: "strategy", concept: "A podium with a brand icon receiving a gold recommendation badge from multiple AI model judges" },
  { slug: "ai-visibility-gap-businesses", category: "strategy", concept: "A wide canyon/gap between a few visible brands on a cliff and many invisible brands below in darkness" },
  { slug: "share-of-model-vs-share-of-voice", category: "strategy", concept: "A side-by-side comparison — old megaphone (share of voice) vs new AI recommendation bar chart (share of model)" },
  { slug: "build-topical-authority-ai-models-trust", category: "strategy", concept: "A trust badge/shield being constructed brick by brick with content, citations, and entity signals" },
  { slug: "pillar-pages-topic-clusters-ai", category: "strategy", concept: "A hub-and-spoke diagram with a central pillar surrounded by connected topic cluster pages" },
  { slug: "internal-linking-strategy-ai", category: "strategy", concept: "A web of interconnected document pages with visible link pathways highlighted in indigo" },
  { slug: "glossary-play-definition-pages-authority", category: "strategy", concept: "A dictionary/encyclopedia with glowing definition entries that AI models reference" },
  { slug: "topical-authority-vs-domain-authority", category: "strategy", concept: "Two pillars side by side — one showing topic depth, the other showing domain breadth" },
  { slug: "semantic-seo-ai-citations", category: "strategy", concept: "A word cloud or semantic map with related terms connected by meaning relationships" },
  { slug: "what-is-content-cluster", category: "strategy", concept: "A solar system metaphor — central sun (pillar) with orbiting planets (cluster pages)" },
  { slug: "content-marketing-strategy-2026-ai", category: "strategy", concept: "A forward-looking roadmap with content types mapped to AI visibility impact" },
  { slug: "multi-source-consensus-ai-recommendations", category: "strategy", concept: "Multiple sources (forum, news, review, directory) all pointing arrows toward a single consensus node" },
  { slug: "content-seeding-strategy-ai-threads", category: "strategy", concept: "Seeds being planted in forum soil with discussion platform icons growing into recommendation trees" },
  { slug: "what-is-content-seeding", category: "strategy", concept: "A hand scattering seeds across a landscape of discussion forums and community platforms" },
  { slug: "reddit-posts-ai-cites-most", category: "strategy", concept: "An orange-highlighted discussion thread with citation lines flowing from it into AI model outputs" },
  { slug: "llm-seeding-vs-link-building", category: "strategy", concept: "Two parallel paths — one showing traditional backlink chains, the other showing conversation-based citation seeding" },
  { slug: "best-platforms-llm-seeding", category: "strategy", concept: "A ranked list of platform icons (forums, Q&A sites, social groups) with effectiveness bars" },
  { slug: "youtube-geo-video-ai-citations", category: "strategy", concept: "A video player frame with AI citation signals emanating from the video content" },
  { slug: "citation-seeding-vs-content-marketing", category: "strategy", concept: "A comparison — slow content funnel on one side, fast citation seeding pipeline on the other" },
  { slug: "linkedin-ai-visibility-strategy", category: "strategy", concept: "A professional social network interface with thought leadership posts generating AI model attention" },
  { slug: "citable-content-structure-ai", category: "strategy", concept: "A document being structured with clear headings, data points, and citation-worthy blocks highlighted" },
  { slug: "medium-guest-posts-citation-layer", category: "strategy", concept: "A guest post being published on an external platform with citation ripple effects" },
  { slug: "brand-mentions-vs-backlinks-ai", category: "strategy", concept: "A balance scale — mentions outweighing backlinks 3:1 for AI recommendations" },
  { slug: "best-content-formats-ai-citations", category: "strategy", concept: "A gallery of content format cards (listicles, comparisons, how-tos) ranked by AI citation frequency" },
  { slug: "does-reddit-activity-help-ai-recommend", category: "strategy", concept: "A pipeline showing forum engagement converting into AI model training data and recommendations" },
  { slug: "faq-optimization-ai-search", category: "strategy", concept: "A FAQ accordion interface with answers being extracted and cited by AI models" },
  { slug: "listicle-optimization-ai-citations", category: "strategy", concept: "A numbered list format with items being pulled into AI recommendation outputs" },
  { slug: "ai-search-traffic-converts-better", category: "strategy", concept: "A conversion funnel comparing AI-referred traffic (high conversion) vs organic (lower)" },
  { slug: "reddit-most-important-platform", category: "strategy", concept: "A giant discussion forum icon casting a long shadow over other platform icons, emphasizing its dominance" },
  { slug: "citation-seeding-playbook", category: "strategy", concept: "An open playbook/manual with tactical diagrams showing thread discovery to response to citation flow" },
  { slug: "platform-by-platform-geo", category: "strategy", concept: "Four quadrants, each with an AI model icon and unique optimization tactics" },
  { slug: "ai-visibility-audit-five-pillars", category: "strategy", concept: "Five pillars standing in a row (citations, AI presence, entities, reviews, press) supporting a score arch" },
  { slug: "comparison-pages-ai-recommends-most", category: "strategy", concept: "A side-by-side comparison table being highlighted and extracted by AI models" },
  { slug: "eeat-ai-citations-complete-guide", category: "strategy", concept: "The four letters E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) as building blocks" },
  { slug: "what-is-eeat-framework-ai", category: "strategy", concept: "A framework diagram showing how trust signals flow into AI model calculations" },
  { slug: "build-eeat-signals-ai-models-use", category: "strategy", concept: "A construction scene — building trust signals piece by piece like a construction project" },
  { slug: "thought-leadership-ai-search", category: "strategy", concept: "A person at a podium with their expertise radiating outward into AI model knowledge bases" },
  { slug: "ceo-branding-ai-era", category: "strategy", concept: "A CEO silhouette with their personal brand signals connecting to company brand in AI models" },
  { slug: "brand-consensus-effect-ai", category: "strategy", concept: "Multiple independent sources all converging on the same brand recommendation — a consensus forming" },
  { slug: "human-vs-ai-content-ai-search", category: "strategy", concept: "A split composition — human-written authentic content on one side, AI-generated generic content on the other" },
  { slug: "online-reviews-strategy-ai-visibility", category: "strategy", concept: "Star ratings and review cards flowing into AI model recommendation outputs" },
  { slug: "how-ai-overviews-killed-ctr", category: "strategy", concept: "A search results page with an AI Overview box pushing down organic results into darkness" },
  { slug: "case-study-pages-ai-citations", category: "strategy", concept: "A case study document with results metrics being extracted and cited by AI models" },
  { slug: "statistics-pages-ai-models-cite", category: "strategy", concept: "A data-rich page with charts and prominent figures being referenced by AI model citation lines" },
  { slug: "entity-optimization-ai-understand-brand", category: "strategy", concept: "A brand entity node with clean, consistent information radiating to all platforms" },

  // === TECHNICAL ===
  { slug: "schema-markup-ai-search", category: "technical", concept: "Code structure with schema types highlighted, being read/parsed by AI crawlers" },
  { slug: "robots-txt-ai-crawlers", category: "technical", concept: "A configuration file as a gateway/door with AI crawler bots being allowed or blocked" },
  { slug: "entity-seo-knowledge-graph", category: "technical", concept: "An entity relationship diagram with brand, products, and attributes connected in a knowledge graph" },
  { slug: "what-is-information-gain-ai-search", category: "technical", concept: "A content piece with unique/novel information highlighted, standing out from generic competitor content" },
  { slug: "what-is-entity-authority-ai", category: "technical", concept: "An authority badge/certificate with entity signals (consistency, mentions, structured data) feeding into it" },
  { slug: "wikipedia-wikidata-strategy-ai", category: "technical", concept: "An encyclopedia page and data entry connected to AI model knowledge bases" },
  { slug: "google-knowledge-panel-optimization", category: "technical", concept: "A Knowledge Panel card being optimized with accurate, rich information" },
  { slug: "json-ld-schema-recipes-ai", category: "technical", concept: "A cookbook/recipe book but for schema markup — showing code snippets as recipe cards" },

  // === INDUSTRY ===
  { slug: "geo-for-agencies", category: "industry", concept: "An agency team managing multiple client dashboards with AI visibility metrics" },
  { slug: "geo-for-saas", category: "industry", concept: "A SaaS product interface with AI recommendation signals and review site integrations" },

  // === TOOLS ===
  { slug: "zero-click-search-data", category: "tools", concept: "A search results page where the answer is shown directly — no clicks needed, with traffic arrows being redirected" },
  { slug: "ai-visibility-tools-compared", category: "tools", concept: "A comparison matrix/grid of tool icons being evaluated with checkmarks and feature comparison" },

  // === MISSING FROM TABLE (20, 41) ===
  { slug: "perplexity-vs-google-business-traffic", category: "tools", concept: "A split view — a clean citation-rich AI search interface vs traditional search results, with business traffic arrows" },
  { slug: "quora-optimization-ai-citations", category: "strategy", concept: "A Q&A answer page with optimized structure that AI models are citing, showing red/orange accents" },
];

// ────────────────────────────────────────────────

async function generateImage(post) {
  const accent = ACCENT[post.category] || "";
  const prompt = `${STYLE_PREFIX} ${accent} ${post.concept}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "2K",
      },
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);

  if (!imagePart) {
    throw new Error(`No image returned for ${post.slug}. Response parts: ${JSON.stringify(parts.map(p => Object.keys(p)))}`);
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}

async function processPost(post, index, total) {
  const outPath = path.join(OUTPUT_DIR, `${post.slug}.png`);

  if (!FORCE && fs.existsSync(outPath)) {
    console.log(`  [${index}/${total}] SKIP ${post.slug} (exists)`);
    return { slug: post.slug, status: "skipped" };
  }

  console.log(`  [${index}/${total}] Generating ${post.slug}...`);
  const start = Date.now();

  try {
    const imgBuffer = await generateImage(post);
    fs.writeFileSync(outPath, imgBuffer);
    const sizeKB = Math.round(imgBuffer.length / 1024);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  [${index}/${total}] OK ${post.slug} (${sizeKB}KB, ${elapsed}s)`);
    return { slug: post.slug, status: "ok", sizeKB, elapsed };
  } catch (err) {
    console.error(`  [${index}/${total}] FAIL ${post.slug}: ${err.message}`);
    return { slug: post.slug, status: "error", error: err.message };
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Parse CLI args
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const batchIdx = args.indexOf("--batch");
const slugIdx = args.indexOf("--slug");

let postsToGenerate = POSTS;

if (slugIdx >= 0 && args[slugIdx + 1]) {
  const targetSlug = args[slugIdx + 1];
  postsToGenerate = POSTS.filter((p) => p.slug === targetSlug);
  if (postsToGenerate.length === 0) {
    console.error(`Slug not found: ${targetSlug}`);
    process.exit(1);
  }
}

if (batchIdx >= 0 && args[batchIdx + 1]) {
  const batchNum = parseInt(args[batchIdx + 1], 10);
  const BATCH_SIZE = 10;
  const start = (batchNum - 1) * BATCH_SIZE;
  const end = start + BATCH_SIZE;
  postsToGenerate = POSTS.slice(start, end);
  if (postsToGenerate.length === 0) {
    console.error(`Batch ${batchNum} is empty (max batch: ${Math.ceil(POSTS.length / BATCH_SIZE)})`);
    process.exit(1);
  }
}

console.log(`\n=== MentionLayer Blog Image Generator ===`);
console.log(`Posts to generate: ${postsToGenerate.length}`);
console.log(`Output: ${OUTPUT_DIR}`);
console.log(`Force overwrite: ${FORCE}\n`);

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const results = [];
for (let i = 0; i < postsToGenerate.length; i++) {
  const result = await processPost(postsToGenerate[i], i + 1, postsToGenerate.length);
  results.push(result);

  // Rate limit: wait 2s between requests to avoid hitting API limits
  if (i < postsToGenerate.length - 1 && result.status === "ok") {
    await sleep(2000);
  }
}

// Summary
const ok = results.filter((r) => r.status === "ok");
const skipped = results.filter((r) => r.status === "skipped");
const errors = results.filter((r) => r.status === "error");

console.log(`\n=== Summary ===`);
console.log(`Generated: ${ok.length}`);
console.log(`Skipped (existing): ${skipped.length}`);
console.log(`Errors: ${errors.length}`);
if (errors.length > 0) {
  console.log(`\nFailed slugs:`);
  errors.forEach((e) => console.log(`  - ${e.slug}: ${e.error}`));
}
