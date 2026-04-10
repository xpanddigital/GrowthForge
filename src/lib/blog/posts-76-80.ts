import type { BlogPost } from "./types";

export const posts76to80: BlogPost[] = [
  // ───────────────────────────────────────────────
  // ARTICLE 76: What Is a Knowledge Graph? (Glossary)
  // ───────────────────────────────────────────────
  {
    slug: "what-is-knowledge-graph",
    title:
      "What Is a Knowledge Graph? Why It Powers AI Recommendations",
    summary:
      "A knowledge graph is a structured database of entities and relationships that search engines and AI models use to understand the world. Learn how knowledge graphs power AI recommendations and why your brand\\'s presence in them matters.",
    metaTitle: "What Is a Knowledge Graph? AI Guide",
    metaDescription:
      "A knowledge graph is a database of entities and relationships that powers AI recommendations. Why your brand\\'s knowledge graph presence matters for AI visibility.",
    targetKeyword: "knowledge graph definition",
    publishedAt: "2026-07-29",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "fundamentals",
    buyingStage: "awareness",
    estimatedReadTime: 4,
    relatedSlugs: [
      "entity-optimization-ai-understand-brand",
      "what-is-entity-authority-ai",
      "entity-seo-knowledge-graph",
      "wikipedia-wikidata-strategy-ai",
      "schema-markup-ai-search",
    ],
    keyTakeaway:
      "A knowledge graph is a structured database of entities (people, organizations, concepts) and the relationships between them. Google\\'s Knowledge Graph, Wikidata, and similar systems are the factual backbone AI models reference when verifying brands. Brands with knowledge graph presence get cited more because AI models can verify their identity and relationships.",
    sections: [
      {
        id: "definition",
        title: "Knowledge Graphs: The Factual Backbone of AI Search",
        content:
          "A knowledge graph is a structured database that represents real-world entities — people, organizations, places, products, concepts — and the relationships between them. Google\\'s Knowledge Graph, launched in 2012, contains billions of these entities and powers the Knowledge Panels you see in search results. Wikidata, the structured data backbone of Wikipedia, is another major knowledge graph.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"Knowledge graphs are the identity layer of the internet. When AI models need to verify whether a brand is real, what it does, who runs it, and how it relates to its industry, they check knowledge graphs. [Wikipedia accounts for 47.9% of ChatGPT\\'s top-10 citations](/blog/ai-seo-statistics-2026) not because Wikipedia has the best marketing content — but because Wikidata provides the structured entity data that AI models trust for factual verification.\"\n\nFor brands, knowledge graph presence means your entity is **verified** — search engines and AI models recognize you as a distinct, real entity with defined attributes and relationships. This verification is the foundation of [entity authority](/blog/what-is-entity-authority-ai).",
      },
      {
        id: "how-ai-uses-them",
        title: "How AI Models Use Knowledge Graphs",
        content:
          "AI models interact with knowledge graphs at three stages:\n\n**1. Entity identification.** When a user asks about a brand, AI models check knowledge graphs to verify the entity exists and retrieve its basic attributes (what it is, what it does, who founded it). This is the identity verification step.\n\n**2. Relationship mapping.** Knowledge graphs define connections: \"Joel House → founded → MentionLayer → category → AI SEO platform.\" These relationships help AI models understand context and make appropriate recommendations.\n\n**3. Fact checking.** When AI models generate responses, they cross-reference claims against knowledge graph data. If your website says you were founded in 2024 but Wikidata says 2023, the inconsistency reduces citation confidence.\n\n| Knowledge Graph | Primary Use | AI Impact |\n| --- | --- | --- |\n| Google Knowledge Graph | Powers Knowledge Panels, entity verification | Highest — directly feeds Google\\'s AI systems |\n| Wikidata | Structured data for Wikipedia, open data | Very high — referenced by multiple AI models |\n| Crunchbase | Company and funding data | High for tech/startup entities |\n| LinkedIn Graph | Professional relationships | High for B2B entity verification |\n| DBpedia | Academic/structured Wikipedia data | Medium — used in research and some AI systems |\n\nThe practical implication: brands that exist in knowledge graphs have a verified identity that AI models trust. Brands absent from knowledge graphs must rely solely on content and mention signals — a weaker position for earning AI citations.\n\nFor the complete strategy on building knowledge graph presence, see the [entity SEO guide](/blog/entity-optimization-ai-understand-brand) and the [Wikipedia/Wikidata strategy](/blog/wikipedia-wikidata-strategy-ai). The [entity SEO technical guide](/blog/entity-seo-knowledge-graph) covers the [structured data](/blog/what-is-structured-data-ai) implementation that connects your website to knowledge graph entities.",
      },
      {
        id: "getting-in",
        title: "How to Get Your Brand Into Knowledge Graphs",
        content:
          "Knowledge graph presence is earned through a combination of structured signals and external validation.\n\n**Wikidata (most accessible):**\nAny notable entity can have a Wikidata entry. Create an entry with your brand\\'s key attributes: name, description, official website, founding date, founders, headquarters, industry. Wikidata entries require references — link to press articles, official registration records, or other verifiable sources.\n\n**Google Knowledge Panel (triggered by signals):**\nGoogle Knowledge Panels appear automatically when Google\\'s systems have enough entity signals. Key triggers: Wikidata entry, Wikipedia article, comprehensive [Organization schema](/blog/schema-markup-ai-search) on your website, consistent information across authoritative platforms, and sufficient search volume for your brand name.\n\n**Wikipedia (highest impact, highest bar):**\nWikipedia requires demonstrable notability — significant coverage in reliable, independent sources. This means press coverage, industry recognition, awards, or other third-party evidence that your brand warrants an encyclopedia entry. You cannot write your own Wikipedia article (conflict of interest). Focus on earning the press coverage and third-party recognition that makes a Wikipedia article defensible.\n\n\"Start with Wikidata — it is the foundation. Ensure your [structured data](/blog/schema-markup-ai-search) matches your Wikidata entry. Build [earned media](/blog/digital-pr-ai-era) for Wikipedia notability. The Knowledge Panel typically follows once these signals converge,\" says Joel House.\n\nThe [5-pillar audit](/blog/ai-visibility-audit-five-pillars) assesses knowledge graph presence as part of the entity pillar. [MentionLayer](/features) tracks whether AI models reference your knowledge graph data when mentioning your brand.",
      },
    ],
    faqs: [
      {
        question: "Does every brand need to be in a knowledge graph?",
        answer:
          "Not every brand can achieve Wikipedia-level knowledge graph presence, and that is fine. The minimum viable entity SEO involves Wikidata entry, comprehensive structured data on your website, and consistent profiles across major platforms. These signals give AI models enough entity data to verify your brand. Full knowledge graph inclusion (Wikipedia, Knowledge Panel) amplifies the effect but is not a prerequisite for AI citations.",
      },
      {
        question: "How is a knowledge graph different from a database?",
        answer:
          "A traditional database stores data in tables with fixed schemas. A knowledge graph stores data as entities and relationships in a flexible graph structure — \"Joel House founded MentionLayer\" and \"MentionLayer is an AI SEO platform\" are relationship statements. This graph structure allows AI models to traverse connections and understand context in ways that tabular databases cannot.",
      },
      {
        question: "Can I create my own knowledge graph?",
        answer:
          "You cannot add your brand to Google\\'s Knowledge Graph directly — Google builds it automatically from web signals. You can create a Wikidata entry and implement structured data on your website, which feeds into knowledge graph systems. The structured data on your site (Organization, Person, Product schema) is essentially your brand\\'s contribution to the knowledge graph ecosystem.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // ARTICLE 77: Wikipedia and Wikidata Strategy
  // ───────────────────────────────────────────────
  {
    slug: "wikipedia-wikidata-strategy-ai",
    title:
      "Wikipedia and Wikidata Strategy for AI Visibility: The Entity Authority Playbook",
    summary:
      "Wikipedia accounts for 47.9% of ChatGPT\\'s top-10 citations. This guide covers the ethical strategy for building Wikipedia and Wikidata presence — from establishing notability through earned media to creating Wikidata entries and navigating Wikipedia\\'s editorial requirements.",
    metaTitle: "Wikipedia Strategy for AI Visibility",
    metaDescription:
      "Wikipedia is 47.9% of ChatGPT\\'s top citations. The ethical strategy for Wikipedia and Wikidata presence — notability, Wikidata entries, and editorial requirements.",
    targetKeyword: "Wikipedia Wikidata AI visibility",
    publishedAt: "2026-07-31",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "technical",
    buyingStage: "consideration",
    estimatedReadTime: 9,
    relatedSlugs: [
      "what-is-knowledge-graph",
      "entity-optimization-ai-understand-brand",
      "what-is-entity-authority-ai",
      "digital-pr-ai-era",
      "entity-seo-knowledge-graph",
    ],
    keyTakeaway:
      "Wikipedia accounts for 47.9% of ChatGPT\\'s top-10 citations, making it the single most important domain for AI visibility. The ethical path to Wikipedia presence: build earned media coverage that establishes notability, create a Wikidata entry as the structured data foundation, and either support independent editors or use Wikipedia\\'s paid editing disclosure process.",
    sections: [
      {
        id: "the-wikipedia-advantage",
        title: "Wikipedia: The #1 AI Citation Source",
        content:
          "[Wikipedia accounts for 47.9% of ChatGPT\\'s top-10 citations](/blog/ai-seo-statistics-2026). No other domain comes close. This single statistic explains why Wikipedia and Wikidata presence is the highest-impact [entity SEO](/blog/entity-optimization-ai-understand-brand) investment a brand can make.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"Wikipedia\\'s dominance in AI citations is structural, not incidental. Wikipedia\\'s content is structured, factual, neutral, and comprehensively cross-referenced — exactly what AI models need for reliable information extraction. Wikidata, Wikipedia\\'s structured database, provides machine-readable entity data that AI models use for fact verification. A brand with a Wikipedia article and Wikidata entry has the strongest possible [entity authority](/blog/what-is-entity-authority-ai) signal.\"\n\nThe implication is clear: for any brand that can achieve Wikipedia presence, it should be a strategic priority. For brands that cannot yet meet Wikipedia\\'s notability requirements, building toward notability through earned media is a high-ROI investment with a clear endpoint.",
      },
      {
        id: "wikidata-first",
        title: "Start With Wikidata: The Structured Data Foundation",
        content:
          "Wikidata is Wikipedia\\'s structured database — a machine-readable collection of entities and their properties. Unlike Wikipedia, Wikidata does not require extensive notability evidence. It requires that the entity be real and verifiable.\n\n**Creating a Wikidata entry:**\n1. Go to wikidata.org and create an account\n2. Check if your brand already has an entry (search by name)\n3. If not, create a new item with:\n   - Label: Your brand name\n   - Description: Brief description (\"American AI SEO platform\")\n   - Aliases: Any alternative names\n4. Add key properties:\n   - Instance of: \"company\" or appropriate entity type\n   - Official website: Your URL\n   - Inception: Founding date\n   - Headquarters location: City/country\n   - Founder: Link to founder\\'s Wikidata entry (create one if needed)\n   - Industry: Link to the industry Wikidata item\n5. Add references for each claim (press articles, official documents)\n\n**Why Wikidata matters for AI:**\nAI models query Wikidata for structured entity verification. When ChatGPT encounters your brand name, it can check Wikidata for: Is this a real company? What does it do? Who founded it? Where is it based? These verified attributes increase citation confidence.\n\n**Connecting Wikidata to your website:**\nYour Organization schema\\'s `sameAs` property should include your Wikidata URL (e.g., `https://www.wikidata.org/wiki/Q12345`). This explicitly connects your website entity to your Wikidata entity, closing the verification loop.\n\n\"Wikidata is the single most underutilized entity SEO tactic. Creating an entry takes 30 minutes and provides a permanent, machine-readable entity reference that AI models trust,\" says Joel House.",
      },
      {
        id: "notability",
        title: "Building Notability for Wikipedia",
        content:
          "Wikipedia requires \"notability\" — significant coverage in reliable, independent sources. This is not optional or negotiable. Attempting to create a Wikipedia article without sufficient notability will result in deletion, and potentially a ban on future attempts.\n\n**What constitutes notability:**\n- Multiple in-depth articles in major publications (not press releases)\n- Coverage in trade publications specific to your industry\n- Awards, rankings, or recognition from independent organizations\n- Academic citations or research references\n- Significant financial milestones (funding rounds, acquisitions) covered by press\n\n**What does NOT constitute notability:**\n- Press releases (even if picked up by news outlets)\n- Social media following\n- Revenue or customer count (unless covered by independent sources)\n- Industry conference appearances\n- Blog mentions (unless from major publications)\n\n**The notability building strategy:**\n1. **[Digital PR campaigns](/blog/digital-pr-ai-era):** Pursue genuine press coverage in industry publications and mainstream media. Each article creates a reference that supports Wikipedia notability.\n2. **Award submissions:** Apply to relevant industry awards. Winners get covered in trade press, creating independent sources.\n3. **Original research publication:** Publish proprietary data or research that gets cited by journalists and industry analysts.\n4. **Expert commentary:** Provide expert quotes for journalist queries (HARO, Qwoted, industry reporters). Being quoted as a source creates independent references.\n\n**Timeline:** Building sufficient notability for a Wikipedia article typically takes 6-18 months of consistent earned media effort. This is not a quick win — it is a strategic investment with the highest possible entity authority payoff.\n\nThe press pillar of the [5-pillar audit](/blog/ai-visibility-audit-five-pillars) assesses your current earned media footprint and provides specific recommendations for building toward Wikipedia notability.",
      },
      {
        id: "wikipedia-best-practices",
        title: "Wikipedia Article Best Practices",
        content:
          "If your brand meets Wikipedia\\'s notability threshold, creating an article requires following specific guidelines:\n\n**Never write your own article.** Wikipedia\\'s conflict of interest policy prohibits people affiliated with a subject from creating or substantially editing its article. Options:\n- Support independent Wikipedia editors by making information easily accessible (comprehensive press page, clear company information)\n- Use Wikipedia\\'s paid editing disclosure process (declare your affiliation and propose edits for community review)\n- Hire a professional Wikipedia consultant who follows all disclosure rules\n\n**Article structure for AI extractability:**\n- Lead paragraph: Concise description of what the company does, when it was founded, and by whom\n- History section: Key milestones with dates and references\n- Products/Services section: Structured description of offerings\n- Reception section: Third-party evaluations, awards, criticism\n- References section: All claims cited to independent sources\n\n**Maintaining your Wikipedia presence:**\n- Monitor the article for vandalism or inaccurate edits\n- Add new information (via disclosure process) when significant events occur\n- Ensure all claims remain properly referenced\n- Never remove cited criticism — address it with additional context instead\n\n**Integration with broader entity strategy:**\nYour Wikipedia article should link to your Wikidata entry (automatic for properly structured articles). Your website\\'s [Organization schema](/blog/schema-markup-ai-search) should include `sameAs` links to both your Wikipedia article and Wikidata entry. This creates a three-way entity verification chain: your website ↔ Wikidata ↔ Wikipedia.\n\nFor brands not yet ready for Wikipedia, focus on the [Wikidata entry and entity SEO foundations](/blog/entity-optimization-ai-understand-brand) while building the earned media trail needed for notability. [MentionLayer\\'s audit](/features) tracks progress toward Wikipedia readiness as part of the entity and press pillar assessments.",
      },
    ],
    faqs: [
      {
        question: "Can I pay someone to create my Wikipedia article?",
        answer:
          "You can hire Wikipedia consultants who work within Wikipedia\\'s paid editing disclosure rules. They must declare their affiliation and propose edits for community review. Undisclosed paid editing violates Wikipedia\\'s terms of service and can result in the article being deleted and the brand being blacklisted. Always use disclosed, compliant approaches. The cost typically ranges from $2,000-$10,000 depending on the scope.",
      },
      {
        question: "What if my Wikipedia article gets deleted?",
        answer:
          "Deletion usually means insufficient notability evidence. Do not immediately recreate the article — this can result in a ban. Instead, spend 6-12 months building additional earned media coverage, then submit a draft through Wikipedia\\'s Articles for Creation process with the new references. Each deletion makes subsequent attempts harder, so ensure notability is well-established before trying again.",
      },
      {
        question: "Is a Wikidata entry enough without a Wikipedia article?",
        answer:
          "A Wikidata entry provides meaningful entity authority even without a Wikipedia article. It gives AI models a structured, machine-readable reference for your brand entity. While a Wikipedia article provides the strongest single citation signal, a Wikidata entry combined with comprehensive structured data on your website and consistent platform profiles creates functional entity authority for AI citation purposes.",
      },
      {
        question: "How important is Wikipedia for Perplexity and Gemini vs ChatGPT?",
        answer:
          "Wikipedia is most heavily cited by ChatGPT (47.9% of top-10 citations). Perplexity and Gemini also reference Wikipedia but weight real-time web content more heavily. The Wikidata structured data underlying Wikipedia is used across all major AI models for entity verification. A Wikipedia presence benefits AI visibility across all platforms, with the strongest impact on ChatGPT.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // ARTICLE 78: Google Knowledge Panel Optimization
  // ───────────────────────────────────────────────
  {
    slug: "google-knowledge-panel-optimization",
    title:
      "How to Optimize Your Google Knowledge Panel for AI Search",
    summary:
      "A Google Knowledge Panel signals that Google recognizes your brand as a verified entity — a trust signal AI models weight heavily. Learn how to trigger, claim, and optimize your Knowledge Panel for maximum AI citation impact.",
    metaTitle: "Google Knowledge Panel Optimization for AI",
    metaDescription:
      "Trigger and optimize your Google Knowledge Panel for AI search. The entity signals that create Knowledge Panels and how to maximize their AI citation impact.",
    targetKeyword: "Google Knowledge Panel optimization",
    publishedAt: "2026-08-02",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "technical",
    buyingStage: "consideration",
    estimatedReadTime: 8,
    relatedSlugs: [
      "entity-optimization-ai-understand-brand",
      "what-is-knowledge-graph",
      "wikipedia-wikidata-strategy-ai",
      "schema-markup-ai-search",
      "what-is-entity-authority-ai",
    ],
    keyTakeaway:
      "A Google Knowledge Panel is visible proof that Google recognizes your brand as a verified entity. AI models that use Google\\'s infrastructure inherit this entity recognition, making Knowledge Panel optimization a direct AI visibility investment. The triggers: consistent entity signals, Wikidata presence, comprehensive Organization schema, and sufficient brand search volume.",
    sections: [
      {
        id: "what-it-signals",
        title: "What a Knowledge Panel Means for AI Visibility",
        content:
          "A Google Knowledge Panel is the information box that appears on the right side of Google search results when you search for a recognized entity. For brands, it displays company name, description, logo, founding date, key people, social profiles, and related information.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"A Knowledge Panel is Google saying \\'\\'we know this entity is real and we have verified its key attributes.\\'\\'  AI models that use Google\\'s infrastructure — including Google\\'s own Gemini and AI Overviews — inherit this entity verification. A brand with a Knowledge Panel has an identity advantage that a brand without one cannot match. It is the difference between a verified account and an anonymous profile.\"\n\nThe Knowledge Panel is not just a visual element — it represents underlying entity data in Google\\'s [Knowledge Graph](/blog/what-is-knowledge-graph). This data feeds into Google\\'s AI systems and influences how other AI models (which often use Google\\'s index for retrieval) evaluate your brand\\'s credibility.",
      },
      {
        id: "triggering",
        title: "How to Trigger a Knowledge Panel",
        content:
          "Knowledge Panels are generated automatically by Google when it has enough entity signals to confidently represent your brand. You cannot directly create one — but you can build the signals that trigger one.\n\n**Required signals (all must be present):**\n- **[Organization schema](/blog/schema-markup-ai-search)** on your homepage with name, description, logo, founding date, `sameAs` links\n- **Consistent NAP** (Name, Address, Phone) across Google Business Profile, website, and directories\n- **Sufficient brand search volume** — enough people search for your brand name to warrant a panel\n- **Multiple corroborating sources** — Google must find consistent information about your brand across independent sources\n\n**Signals that accelerate triggering:**\n- [Wikidata entry](/blog/wikipedia-wikidata-strategy-ai) with matching entity data\n- Wikipedia article (strongest trigger)\n- Verified Google Business Profile\n- Active social media profiles linked via `sameAs`\n- Press coverage mentioning your brand with consistent details\n- [Crunchbase profile](/blog/what-is-entity-authority-ai) with complete company data\n\n**Common reasons for no Knowledge Panel:**\n- Brand name is too generic (shares name with common words)\n- Entity signals are inconsistent across platforms\n- Insufficient brand search volume\n- Missing or incomplete structured data\n- No Wikidata entry\n\n| Signal | Importance | How to Build |\n| --- | --- | --- |\n| Organization schema | Critical | Implement on homepage with all properties |\n| Wikidata entry | Very high | Create with verified attributes and references |\n| Google Business Profile | High (if applicable) | Claim, verify, and complete all fields |\n| Platform consistency | High | Audit and fix all profile inconsistencies |\n| Brand search volume | Medium | Grows naturally with brand awareness |\n| Press coverage | Medium | [Earned media campaigns](/blog/digital-pr-ai-era) |",
      },
      {
        id: "claiming-optimizing",
        title: "Claiming and Optimizing Your Knowledge Panel",
        content:
          "Once your Knowledge Panel appears, claim it to gain editing capabilities:\n\n**Claiming process:**\n1. Search for your brand on Google\n2. Click \"Claim this knowledge panel\" at the bottom of the panel\n3. Verify ownership through your official website, Google Search Console, or social profiles\n4. Once verified, you can suggest edits to panel information\n\n**Optimization for AI visibility:**\n\n**Description:** Ensure the Knowledge Panel description matches your [entity positioning](/blog/brand-consensus-effect-ai). If it is pulling from an inaccurate source, suggest an edit with your preferred description and supporting references.\n\n**Logo:** Upload a high-resolution current logo. Consistent visual identity across Google and other platforms strengthens entity recognition.\n\n**Social profiles:** Verify all social profile links are current and connected. These provide the `sameAs` verification chain AI models follow.\n\n**Key people:** If your Knowledge Panel shows key people (founders, CEO), ensure their own Person entities are well-established. Each connected person strengthens the organization\\'s entity authority.\n\n**Categories:** Verify Google has categorized your brand correctly. Incorrect categorization confuses both Google\\'s AI systems and other AI models that reference Google\\'s entity data.\n\n\"After claiming your Knowledge Panel, review every field for accuracy quarterly. Entity data degrades over time — team changes, address updates, description updates. Keeping your Knowledge Panel current maintains the entity verification signal that AI models rely on,\" says Joel House.\n\nThe [entity audit](/blog/entity-optimization-ai-understand-brand) within the [5-pillar framework](/blog/ai-visibility-audit-five-pillars) includes Knowledge Panel assessment. [MentionLayer](/features) monitors your Knowledge Panel for changes and inconsistencies as part of the ongoing entity health tracking.",
      },
      {
        id: "no-panel-strategy",
        title: "Strategy When You Don\\'t Have a Knowledge Panel",
        content:
          "If your brand does not yet have a Knowledge Panel, the priority is building the entity signals that trigger one while maintaining strong AI visibility through other channels.\n\n**Immediate actions (Week 1):**\n- Implement comprehensive [Organization schema](/blog/schema-markup-ai-search) on your homepage\n- Create a [Wikidata entry](/blog/wikipedia-wikidata-strategy-ai) with verified attributes\n- Audit and fix entity consistency across all platforms\n- Verify or create your Google Business Profile (if applicable)\n\n**Medium-term actions (Months 1-3):**\n- Build [earned media coverage](/blog/digital-pr-ai-era) that creates independent references\n- Grow brand search volume through [thought leadership](/blog/thought-leadership-ai-search) and [content marketing](/blog/content-marketing-strategy-2026-ai)\n- Establish [content seeding](/blog/content-seeding-strategy-ai-threads) presence that increases brand awareness\n- Ensure all new content includes author bylines with Person schema\n\n**Long-term actions (Months 3-12):**\n- Pursue [Wikipedia notability](/blog/wikipedia-wikidata-strategy-ai) through sustained earned media\n- Build [multi-source consensus](/blog/multi-source-consensus-ai-recommendations) across 5+ platform types\n- Monitor Knowledge Panel triggers quarterly\n\n**Without a Knowledge Panel, focus on:**\nStrong [structured data](/blog/schema-markup-ai-search), consistent entity information across platforms, and comprehensive content that establishes [topical authority](/blog/topical-authority-complete-guide). These signals build AI citation capability even without Knowledge Panel verification. The [90-day playbook](/blog/ninety-day-playbook) sequences entity building alongside content and seeding activities for maximum combined impact.",
      },
    ],
    faqs: [
      {
        question: "How long does it take to get a Google Knowledge Panel?",
        answer:
          "There is no guaranteed timeline. Brands with strong entity signals (Wikipedia article, Wikidata entry, comprehensive schema, consistent platform presence) can trigger panels within 2-6 months. Brands building from scratch typically need 6-12 months of entity signal building. The most reliable accelerator is a Wikidata entry plus comprehensive Organization schema — these provide the structured data Google\\'s systems need.",
      },
      {
        question: "Can I edit the information in my Knowledge Panel?",
        answer:
          "After claiming your panel, you can suggest edits. Google reviews suggestions and implements them if they are supported by reliable sources. You cannot directly write the description — Google pulls it from authoritative sources. To influence the description, ensure your website, Wikipedia article (if applicable), and Wikidata entry all contain accurate, consistent descriptions.",
      },
      {
        question: "My Knowledge Panel shows wrong information. How do I fix it?",
        answer:
          "Claim the panel first, then suggest corrections with supporting evidence. For persistent inaccuracies, check the source: if Google is pulling from an outdated Wikipedia article or incorrect Wikidata entry, fix the source directly. Update your Organization schema to match the correct information. Google typically updates panel data within 1-4 weeks of source corrections.",
      },
      {
        question: "Does a Google Business Profile count as a Knowledge Panel?",
        answer:
          "No. A Google Business Profile appears for local searches and shows location-specific information (map, reviews, hours). A Knowledge Panel appears for brand searches and shows entity-level information (description, founding, key people, social links). Some brands have both. A Google Business Profile is easier to obtain and still provides entity signals, but a Knowledge Panel represents stronger entity recognition.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // ARTICLE 79: JSON-LD Schema Recipes (Template)
  // ───────────────────────────────────────────────
  {
    slug: "json-ld-schema-recipes-ai",
    title:
      "JSON-LD Schema Recipes for AI Search: Copy-Paste Templates for Every Page Type",
    summary:
      "Ready-to-use JSON-LD schema templates for every page type that impacts AI visibility. Covers Organization, Person, Article, FAQPage, Product, Review, and BreadcrumbList schema with AI-specific optimizations explained.",
    metaTitle: "JSON-LD Schema Recipes for AI Search",
    metaDescription:
      "Copy-paste JSON-LD schema templates optimized for AI search. Organization, Person, Article, FAQ, Product, and Review schema with AI-specific properties.",
    targetKeyword: "JSON-LD schema AI search",
    publishedAt: "2026-08-04",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "technical",
    buyingStage: "consideration",
    estimatedReadTime: 7,
    relatedSlugs: [
      "schema-markup-ai-search",
      "entity-optimization-ai-understand-brand",
      "what-is-structured-data-ai",
      "structured-data-audit-checklist",
      "faq-optimization-ai-search",
    ],
    keyTakeaway:
      "JSON-LD is the preferred format for structured data that AI models read. These ready-to-use templates cover every major schema type for AI visibility — Organization, Person, Article, FAQPage, Product, and Review — with the specific properties that AI models use for entity verification and citation confidence.",
    sections: [
      {
        id: "why-json-ld",
        title: "Why JSON-LD Matters for AI Citations",
        content:
          "JSON-LD (JavaScript Object Notation for Linked Data) is the structured data format that Google recommends and that AI models process most effectively. [Content with schema has a 2.5x higher chance of AI citation](/blog/ai-seo-statistics-2026). JSON-LD provides the machine-readable entity data that AI models use for verification, relationship mapping, and citation confidence.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"Most brands treat structured data as a technical SEO checkbox — add it once and forget it. For AI visibility, structured data is a strategic asset. The properties you include in your JSON-LD directly influence how AI models understand your entity, verify your claims, and connect your content to your brand. Incomplete schema means incomplete entity signals. Complete, well-structured schema means AI models can confidently cite and recommend your brand.\"\n\nThe templates below include every property that impacts AI visibility — not just the minimum required by Google. Each template is annotated with which properties matter most for AI citations and why. For the conceptual foundation, see [What Is Structured Data](/blog/what-is-structured-data-ai). For the complete technical guide, see the [schema markup guide](/blog/schema-markup-ai-search).",
      },
      {
        id: "organization-person",
        title: "Organization and Person Schema Templates",
        content:
          "**Organization Schema (homepage):**\nThis is your brand\\'s core entity definition. Every property contributes to [entity authority](/blog/what-is-entity-authority-ai).\n\nKey properties for AI visibility:\n- `name`: Exact brand name (consistent everywhere)\n- `description`: 1-2 sentence positioning (matches other platforms)\n- `url`: Official website\n- `logo`: High-resolution logo URL\n- `foundingDate`: Year founded\n- `founder`: Reference to Person entity\n- `sameAs`: Array of ALL official profile URLs (LinkedIn, Twitter, Wikidata, Crunchbase, etc.)\n- `knowsAbout`: Array of expertise topics\n- `address`: Business address (if applicable)\n- `contactPoint`: Customer service contact\n\nThe `sameAs` array is the most important property for AI citation confidence — it explicitly connects all your platform identities into one verified entity.\n\n**Person Schema (author/team pages):**\nKey properties for AI:\n- `name`: Full professional name\n- `jobTitle`: Current role\n- `worksFor`: Reference to Organization entity\n- `sameAs`: Professional profile URLs (LinkedIn, personal site, Twitter)\n- `knowsAbout`: Expertise areas\n- `description`: Brief bio highlighting credentials\n- `url`: Canonical personal page (entity home)\n\nThe Person schema connects author [E-E-A-T](/blog/what-is-eeat-framework-ai) signals to your Organization entity. [First-person writing with author bylines yields 1.67x citation improvement](/blog/ai-seo-statistics-2026) — and this improvement increases further when the author has a well-defined Person entity.",
      },
      {
        id: "article-faq",
        title: "Article and FAQPage Schema Templates",
        content:
          "**Article Schema (every content page):**\nKey properties for AI:\n- `headline`: Article title\n- `description`: Article summary\n- `author`: Reference to Person entity (not just a name string)\n- `publisher`: Reference to Organization entity\n- `datePublished`: Publication date (ISO 8601)\n- `dateModified`: Last update date (triggers freshness signals)\n- `image`: Article image URL\n- `mainEntityOfPage`: The canonical URL\n\nThe `author` property should reference a full Person entity, not just a name string. This creates the author-to-article-to-organization chain that AI models follow for E-E-A-T evaluation. Update `dateModified` with every content refresh — [76.4% of cited pages were updated within 30 days](/blog/ai-seo-statistics-2026).\n\n**FAQPage Schema (any page with Q&A content):**\n[Pages with FAQPage schema are 3.2x more likely to appear in AI Overviews](/blog/schema-markup-ai-search). This is the highest-impact single schema type for AI citation.\n\nKey properties:\n- `mainEntity`: Array of Question entities\n- Each Question has: `name` (the question text) and `acceptedAnswer` with `text` (the answer)\n\nFAQPage schema guidelines:\n- Include ALL visible Q&A content in the schema (Google penalizes partial markup)\n- Answer text must match visible page content\n- Keep answers to 50-80 words for optimal AI extraction\n- Include on blog articles, product pages, service pages — any page with Q&A sections\n\nSee the [FAQ optimization guide](/blog/faq-optimization-ai-search) for the complete strategy on creating AI-optimized FAQ content.",
      },
      {
        id: "product-review",
        title: "Product, Review, and BreadcrumbList Templates",
        content:
          "**Product Schema (product/service pages):**\nKey properties for AI:\n- `name`: Product name\n- `description`: Product description\n- `brand`: Reference to Organization entity\n- `offers`: Pricing information (price, currency, availability)\n- `aggregateRating`: Star rating and review count\n- `review`: Individual review references\n\nProduct schema helps AI models understand what you sell, at what price point, and how customers rate it. When AI models receive product comparison queries, Product schema data feeds directly into their comparison synthesis.\n\n**Review / AggregateRating Schema:**\nKey properties:\n- `reviewRating`: Star rating value\n- `author`: Reviewer name\n- `reviewBody`: Review text excerpt\n- `datePublished`: Review date\n- `aggregateRating`: Overall rating with `ratingValue` and `reviewCount`\n\nReview schema surfaces customer evidence in structured format. AI models reference this data when evaluating the Trust component of [E-E-A-T](/blog/what-is-eeat-framework-ai).\n\n**BreadcrumbList Schema:**\nKey properties:\n- `itemListElement`: Array of breadcrumb items with `name` and `item` (URL)\n\nBreadcrumbList signals topical organization to AI models — it shows how your content is categorized and connected. A clear breadcrumb path (Home > Blog > AI SEO > This Article) tells AI models that your content exists within a structured [topical authority](/blog/topical-authority-complete-guide) framework.\n\nFor implementation validation, use the [structured data audit checklist](/blog/structured-data-audit-checklist). The [5-pillar audit](/blog/ai-visibility-audit-five-pillars) through [MentionLayer](/features) includes automated schema validation as part of the entity pillar assessment.",
      },
    ],
    faqs: [
      {
        question: "Where do I add JSON-LD on my website?",
        answer:
          "Add JSON-LD in a `<script type=\"application/ld+json\">` tag in the `<head>` section of each page. Most CMS platforms (WordPress, Shopify, Webflow) have plugins or settings that add schema automatically. For custom sites, add the script tag directly to your page templates. You can include multiple JSON-LD blocks on a single page — one for Organization, one for Article, one for FAQPage.",
      },
      {
        question: "Do I need different schema for every page?",
        answer:
          "Organization schema goes on your homepage (or every page with the same content). Person schema goes on author/team pages. Article schema goes on every blog post and content page. FAQPage schema goes on every page with Q&A content. Product schema goes on product pages. Each schema type targets different entity signals. Implement all relevant types for maximum AI citation impact.",
      },
      {
        question: "How do I test if my schema is working correctly?",
        answer:
          "Use Google\\'s Rich Results Test (search.google.com/test/rich-results) to validate your JSON-LD syntax and check for errors. Use Schema.org\\'s Markup Validator for comprehensive validation. Check Google Search Console for schema-related issues. After implementation, monitor whether rich results appear for your pages in Google search — this confirms Google is processing your schema correctly.",
      },
      {
        question: "Does schema implementation require a developer?",
        answer:
          "For CMS platforms with schema plugins (WordPress SEO plugins, Shopify apps), implementation can be done without developer help. For custom websites or advanced schema (connected Person-Organization entities, Product with nested reviews), developer assistance is recommended to ensure correct implementation. The templates above can be adapted by anyone comfortable editing HTML, but the entity relationship connections benefit from technical review.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // ARTICLE 80: What Is Structured Data? (Glossary)
  // ───────────────────────────────────────────────
  {
    slug: "what-is-structured-data-ai",
    title:
      "What Is Structured Data? The AI Visibility Advantage Explained",
    summary:
      "Structured data is machine-readable code added to web pages that tells search engines and AI models exactly what your content is about. It provides the entity verification and content classification signals that AI models use to decide which sources to cite.",
    metaTitle: "What Is Structured Data? AI Visibility Guide",
    metaDescription:
      "Structured data is machine-readable code that tells AI models what your content is about. Why it provides a 2.5x AI citation advantage and how to implement it.",
    targetKeyword: "structured data definition AI",
    publishedAt: "2026-08-06",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "fundamentals",
    buyingStage: "awareness",
    estimatedReadTime: 4,
    relatedSlugs: [
      "schema-markup-ai-search",
      "json-ld-schema-recipes-ai",
      "entity-optimization-ai-understand-brand",
      "what-is-knowledge-graph",
      "structured-data-audit-checklist",
    ],
    keyTakeaway:
      "Structured data is machine-readable code (typically JSON-LD) added to web pages that explicitly labels content for search engines and AI models. Pages with structured data have a 2.5x higher chance of being cited by AI models because structured data removes the ambiguity that makes AI systems hesitant to cite unverified sources.",
    sections: [
      {
        id: "definition",
        title: "Structured Data: Speaking the Language AI Models Understand",
        content:
          "Structured data is code added to your web pages that explicitly tells search engines and AI models what your content represents. Instead of making AI models infer that your page is about a company called MentionLayer that was founded in 2024 — structured data states this explicitly in a machine-readable format.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"Structured data is the difference between hoping AI models understand your content and telling them exactly what it is. [Content with schema has a 2.5x higher chance of AI citation](/blog/ai-seo-statistics-2026). That 2.5x advantage exists because structured data removes ambiguity. When your Organization schema says you are an AI SEO platform founded in 2024 by Joel House, the AI model does not need to parse your About page to figure that out. It knows — with machine-level certainty — what your brand is.\"\n\nThe most common structured data format is **JSON-LD** (JavaScript Object Notation for Linked Data), which Google recommends and AI models process most effectively. JSON-LD is added as a script block in your page\\'s `<head>` section — it is invisible to human readers but readable by every search engine and AI crawler.",
      },
      {
        id: "types-that-matter",
        title: "Structured Data Types That Impact AI Citations",
        content:
          "Not all structured data types are equally valuable for AI visibility. The types that matter most are those that provide [entity verification](/blog/what-is-entity-authority-ai), content classification, and trust signals.\n\n| Schema Type | AI Impact | What It Tells AI Models |\n| --- | --- | --- |\n| Organization | Very high | Who your brand is, what it does, where to verify |\n| Person | Very high | Who created the content, what their credentials are |\n| Article | High | What the content covers, who wrote it, when it was updated |\n| FAQPage | Very high ([3.2x AI Overview advantage](/blog/schema-markup-ai-search)) | Explicit question-answer pairs ready for extraction |\n| Product | High | What you sell, pricing, ratings |\n| Review/AggregateRating | High | Customer trust evidence |\n| BreadcrumbList | Medium | Content organization and topical structure |\n| HowTo | Medium | Step-by-step instructions ready for extraction |\n\nThe [JSON-LD schema recipes](/blog/json-ld-schema-recipes-ai) provide ready-to-use templates for each type. The [schema markup guide](/blog/schema-markup-ai-search) covers the full technical implementation strategy.\n\n\"If you implement only three schema types, make them Organization (entity identity), Article with Person reference ([E-E-A-T](/blog/what-is-eeat-framework-ai) chain), and FAQPage (AI Overview eligibility). These three cover the highest-impact signals for AI citation,\" says Joel House.",
      },
      {
        id: "getting-started",
        title: "Getting Started With Structured Data",
        content:
          "Implementing structured data follows a priority-based approach:\n\n**Priority 1: Organization schema on your homepage.** This establishes your entity identity. Include `name`, `description`, `url`, `logo`, `foundingDate`, `sameAs` (links to all official profiles). This single implementation provides the foundation for all other entity signals.\n\n**Priority 2: Person schema for your primary author.** Connect the author entity to the Organization via `worksFor`. Include credentials, expertise areas, and professional profile links.\n\n**Priority 3: Article schema on every content page.** Reference the Person and Organization entities. Include `datePublished` and `dateModified` for freshness signals.\n\n**Priority 4: FAQPage schema on every page with Q&A content.** This unlocks the [3.2x AI Overview advantage](/blog/schema-markup-ai-search). Apply to blog FAQ sections, product page FAQs, and dedicated FAQ pages.\n\n**Validation:** Test every implementation using Google\\'s Rich Results Test and Schema.org\\'s Markup Validator. Check Google Search Console for schema errors. The [structured data audit checklist](/blog/structured-data-audit-checklist) provides a complete validation workflow.\n\nFor the complete entity SEO strategy that structured data supports, see the [entity optimization guide](/blog/entity-optimization-ai-understand-brand). [MentionLayer\\'s audit](/features) includes automated structured data assessment as part of the entity pillar, identifying missing schema types and incorrect implementations across your site.",
      },
    ],
    faqs: [
      {
        question: "Is structured data the same as schema markup?",
        answer:
          "Schema markup is the most common form of structured data. \"Structured data\" is the broad concept of machine-readable code on web pages. \"Schema markup\" refers specifically to the Schema.org vocabulary that defines entity types and properties. JSON-LD is the format used to implement Schema.org markup. In practice, these terms are often used interchangeably — when someone says \"add structured data,\" they typically mean implementing Schema.org markup in JSON-LD format.",
      },
      {
        question: "Does structured data directly improve Google rankings?",
        answer:
          "Structured data is not a direct ranking factor, but it enables rich results (Knowledge Panels, FAQ dropdowns, star ratings in search) that improve click-through rates. For AI search, the impact is more direct — content with schema has a 2.5x higher AI citation chance because structured data provides the entity verification signals AI models use for citation decisions. The AI visibility impact is more significant than the traditional SEO impact.",
      },
      {
        question: "Can I add too much structured data?",
        answer:
          "You can add too much irrelevant or incorrect structured data, which can confuse search engines and AI models. Stick to schema types that accurately represent your page content. Do not add Product schema to a blog post or FAQPage schema to a page without visible FAQ content. More schema is better only when each type accurately represents real content on the page.",
      },
    ],
  },
];
