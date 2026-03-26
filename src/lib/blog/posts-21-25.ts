import type { BlogPost } from "./types";

export const posts21to25: BlogPost[] = [
  // ───────────────────────────────────────────────
  // ARTICLE 21: How to Monitor What AI Models Say About Your Brand
  // ───────────────────────────────────────────────
  {
    slug: "monitor-what-ai-says-about-brand",
    title:
      "How to Monitor What AI Models Say About Your Brand",
    summary:
      "A step-by-step guide to tracking your brand\\'s presence across ChatGPT, Perplexity, Gemini, and Claude. Covers free manual methods, paid tools, prompt design, and building a monitoring cadence that catches changes before they cost you customers.",
    metaTitle: "How to Monitor What AI Says About Your Brand",
    metaDescription:
      "Track what ChatGPT, Perplexity, Gemini, and Claude say about your brand. Free and paid monitoring methods, prompt templates, and a weekly cadence that catches AI visibility changes early.",
    targetKeyword: "monitor AI brand mentions",
    publishedAt: "2026-04-21",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "tools",
    buyingStage: "consideration",
    estimatedReadTime: 9,
    relatedSlugs: [
      "share-of-model-metric",
      "what-is-ai-visibility-score",
      "ai-visibility-tools-compared",
      "brand-invisible-to-ai",
      "how-ai-models-choose",
    ],
    keyTakeaway:
      "Monitoring AI brand mentions requires testing at least 20 buying-intent prompts weekly across ChatGPT, Perplexity, Gemini, and Claude. Brands that monitor weekly catch visibility drops within 48 hours instead of losing months of traffic.",
    sections: [
      {
        id: "why-monitor",
        title: "Why AI Brand Monitoring Is Now Essential",
        content:
          "AI models are answering buying-intent questions about your category right now — and 37% of consumers start their product research with AI instead of Google. If you are not monitoring what those models say about you, you are flying blind in the fastest-growing search channel.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"We\\'ve seen brands lose 30% of their referral pipeline in a single week because an AI model updated its training data and dropped them from a key recommendation. The brands that caught it within 48 hours recovered. The ones that discovered it two months later had already lost the deals.\"\n\nThe core challenge is that [AI citation visibility can decay within 48-72 hours](/blog/how-ai-models-choose). Unlike Google rankings, which shift gradually, AI model outputs can change overnight when new training data is ingested or retrieval sources are re-indexed. A competitor publishes a single well-structured comparison page, and suddenly Perplexity starts citing them instead of you. Without monitoring, you would never know it happened.\n\nThe good news: monitoring is straightforward once you build the right system. You need a set of buying-intent prompts, a testing cadence, a tracking format, and a response plan for when things change. This guide covers all four.",
      },
      {
        id: "manual-monitoring",
        title: "The Free Method: Manual Prompt Testing",
        content:
          "You can start monitoring today with zero budget. Open ChatGPT, Perplexity, Gemini, and Claude. Type the same buying-intent question into each. Record whether your brand appears, how it is described, and which competitors get mentioned instead.\n\nThe key is **prompt design**. Generic prompts like \"tell me about [brand]\" test brand awareness, not buying-intent visibility. You need prompts that mirror how real customers ask for recommendations:\n\n- \"What are the best [category] services for [audience]?\"\n- \"Can you recommend a good [category] provider?\"\n- \"Compare the top [category] companies\"\n- \"I need [specific problem] — what are my options?\"\n- \"[Competitor] alternatives that are better for [use case]\"\n\nBuild a library of **20 prompts** covering your core keywords. Test each prompt across all four major models. Record results in a spreadsheet with columns for: date, prompt, model, brand mentioned (yes/no), brand recommended (yes/no), sentiment (positive/neutral/negative), competitors mentioned, and source URLs cited.\n\nRun this test weekly. The consistency matters more than the depth — testing 20 prompts every week beats testing 100 prompts once a quarter. You need the trend line, not just the snapshot. Track your [Share of Model](/blog/share-of-model-metric) percentage for each AI platform over time.",
      },
      {
        id: "paid-tools",
        title: "Paid Monitoring Tools: What to Look For",
        content:
          "Manual testing breaks down past 10-15 prompts because the time cost compounds weekly. At that scale, paid monitoring tools earn their cost.\n\nThe essential features are: **automated prompt testing** across at least four AI models (ChatGPT, Perplexity, Gemini, Claude), **competitor tracking** that shows share of model for your top 5 competitors alongside your own, **sentiment analysis** that distinguishes between a passing mention and a genuine recommendation, and **source attribution** that shows which URLs the AI model cited when mentioning you.\n\nOur [comprehensive tool comparison](/blog/ai-visibility-tools-compared) covers every option in detail. At a high level: Otterly ($29/month) handles basic monitoring for solo brands, Peec AI (EUR 89/month) adds deeper analytics and [AI brand sentiment](/blog/what-is-ai-brand-sentiment) tracking, and platforms like [MentionLayer](/features) combine monitoring with the action tools to actually improve your scores.\n\n\"The biggest mistake I see teams make with monitoring tools is testing the wrong prompts,\" says Joel House. \"They test branded queries — \\'\\'what is [brand name]\\'\\'  — instead of category queries. Nobody monitors \\'\\'what is Nike.\\'\\'  They monitor \\'\\'best running shoes for marathons\\'\\' to see if Nike appears in the answer. That is where the revenue lives.\"\n\nWhen evaluating tools, ask for a free trial and test it against your manual spreadsheet data. If the tool\\'s results diverge significantly from your manual tests, the tool may be using different prompt formats or model versions than what your customers actually use.",
      },
      {
        id: "building-cadence",
        title: "Building a Weekly Monitoring Cadence",
        content:
          "Effective monitoring is a habit, not a project. Here is the weekly cadence that works for brands managing their own AI visibility.\n\n**Monday: Run prompt tests.** Execute your full library of 20 prompts across all four models. If using a paid tool, review the automated results from the past week. If manual, block 60-90 minutes for testing and recording.\n\n**Tuesday: Analyze changes.** Compare this week\\'s results to last week. Flag any prompts where your brand dropped out, any new competitor mentions, or any sentiment changes. A single-week drop may be noise. Two consecutive weeks of decline is a signal.\n\n**Wednesday: Investigate drops.** For any significant changes, dig into why. Did a competitor publish new content that got cited? Did a source you were featured in get delisted? Did the AI model update its knowledge cutoff? Check the source URLs the model cites — they often reveal what changed.\n\n**Thursday-Friday: Take action.** If a drop is confirmed, execute the appropriate response. For [citation losses](/blog/citation-seeding-playbook), identify new threads to seed. For sentiment shifts, trace the source and address it. For competitor gains, analyze what they did and build your counter-strategy.\n\nThis cadence takes **2-3 hours per week** for manual monitoring or **30-45 minutes** with a paid tool. The ROI is immediate: catching a visibility drop within one week versus discovering it two months later can mean the difference between a quick recovery and a prolonged revenue impact.\n\nTrack your composite [AI visibility score](/blog/what-is-ai-visibility-score) month-over-month as the headline metric. Individual prompt results fluctuate, but the aggregate score reveals the true trend.",
      },
      {
        id: "what-to-do-with-data",
        title: "Turning Monitoring Data into Action",
        content:
          "Monitoring without action is just expensive watching. Every monitoring insight should map to a specific response.\n\n**Scenario 1: Brand not mentioned at all.** This is the most common starting point. Your [AI visibility audit](/blog/ai-visibility-audit-five-pillars) shows a low presence score. Action: launch a [citation seeding campaign](/blog/citation-seeding-playbook) targeting the threads and sources that AI models currently reference for your category.\n\n**Scenario 2: Brand mentioned but not recommended.** AI models know you exist but do not suggest you. This usually means insufficient third-party endorsement. Action: increase [Reddit](/blog/reddit-most-important-platform) and Quora activity with expert responses, and accelerate PR efforts to generate the earned media signals that drive recommendations. Remember, [90% of citations driving LLM visibility come from earned media](/blog/digital-pr-ai-era).\n\n**Scenario 3: Brand recommended but with incorrect information.** AI hallucinations about your brand — wrong pricing, outdated features, or incorrect comparisons — actively harm conversion. Action: update your website\\'s [structured data](/blog/schema-markup-ai-search), correct the factual errors on your key landing pages, and build content that directly addresses the misinformation.\n\n**Scenario 4: Competitor displaces you.** You were being recommended, but a competitor\\'s recent activity pushed them ahead. Action: analyze what they did (new content? PR coverage? review volume?) and execute a targeted response within the same channels.\n\nThe [MentionLayer platform](/how-it-works) automates the connection between monitoring insights and action workflows — when your score drops, the system identifies the specific threads and channels where intervention will have the highest impact.",
      },
    ],
    faqs: [
      {
        question: "How often should I check what AI says about my brand?",
        answer:
          "Weekly is the minimum effective cadence. AI model outputs can change within 48-72 hours when new training data or retrieval sources are updated. Testing 20 buying-intent prompts across four models weekly takes 2-3 hours manually or 30 minutes with a paid tool. Monthly testing is too infrequent to catch drops before they impact revenue.",
      },
      {
        question: "Which AI models should I monitor?",
        answer:
          "Monitor ChatGPT, Perplexity, Gemini, and Claude as your core four. ChatGPT has the largest user base, Perplexity averages 21.87 citations per response making it the most citation-rich, Gemini integrates with Google\\'s ecosystem, and Claude is growing rapidly in enterprise. If your audience skews toward any particular model, prioritize that one.",
      },
      {
        question:
          "What is the difference between AI monitoring and traditional brand monitoring?",
        answer:
          "Traditional brand monitoring tracks mentions on websites, social media, and news outlets — places where humans write about you. AI monitoring tracks what AI models say about you when users ask buying-intent questions. The signals are related but different: a brand can have strong traditional media presence but zero AI visibility if the content is not structured for AI citation.",
      },
      {
        question: "Can AI monitoring tools detect hallucinations about my brand?",
        answer:
          "Yes. Good monitoring tools flag when AI models make factually incorrect claims about your brand — wrong pricing, outdated features, or incorrect competitor comparisons. These hallucinations actively hurt conversion because users trust AI responses as accurate. Catching and correcting them quickly is one of the highest-ROI monitoring activities.",
      },
      {
        question: "How much does AI brand monitoring cost?",
        answer:
          "Free if you do it manually with a spreadsheet. Budget monitoring tools start at $29/month for basic tracking across major AI models. Mid-range tools with sentiment analysis and source attribution run $89-200/month. Full-stack platforms that combine monitoring with action capabilities start at agency pricing tiers. The right investment depends on how many keywords and competitors you need to track.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // ARTICLE 22: What Is an AI Visibility Score?
  // ───────────────────────────────────────────────
  {
    slug: "what-is-ai-visibility-score",
    title:
      "What Is an AI Visibility Score? How to Score Your Brand",
    summary:
      "An AI visibility score measures how often and how prominently your brand appears in AI-generated answers. This guide explains how scores are calculated, what benchmarks look like by industry, and how to improve a low score.",
    metaTitle: "What Is an AI Visibility Score? How to Score It",
    metaDescription:
      "An AI visibility score measures how often your brand appears in ChatGPT, Perplexity, and Gemini answers. Learn how it\\'s calculated, what good looks like, and how to improve.",
    targetKeyword: "AI visibility score definition",
    publishedAt: "2026-04-22",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "fundamentals",
    buyingStage: "awareness",
    estimatedReadTime: 4,
    relatedSlugs: [
      "share-of-model-metric",
      "ai-visibility-audit-five-pillars",
      "brand-invisible-to-ai",
      "monitor-what-ai-says-about-brand",
      "how-to-measure-ai-visibility",
    ],
    keyTakeaway:
      "An AI visibility score is a composite metric from 0-100 that measures how prominently your brand appears across AI model responses. Most brands score between 15-35 on their first audit, while category leaders average 65-80.",
    sections: [
      {
        id: "definition",
        title: "AI Visibility Score: The Metric That Replaced Rankings",
        content:
          "An AI visibility score is a composite metric that quantifies how well your brand performs across AI-generated search results. Scored from 0 to 100, it measures whether AI models like ChatGPT, Perplexity, Gemini, and Claude mention, recommend, or link to your brand when users ask buying-intent questions in your category.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"Rankings told you where you stood on a page. Your AI visibility score tells you whether you exist at all in the conversation. With 37% of consumers now starting product research with AI instead of Google, this number matters more than your position-one keyword count.\"\n\nThe score is not a single measurement — it is a weighted composite of multiple signals. At [MentionLayer](/features), the [5-pillar audit](/blog/ai-visibility-audit-five-pillars) calculates it from five dimensions: citation presence (25%), AI model mentions (30%), entity consistency (15%), review signals (15%), and press coverage (15%). Each pillar captures a different aspect of how AI models evaluate your brand\\'s authority and trustworthiness.",
      },
      {
        id: "how-calculated",
        title: "How the Score Is Calculated",
        content:
          "The calculation blends quantitative testing with structural analysis across five pillars.\n\n**Citation presence (25% weight):** How many high-authority threads in your category mention your brand versus competitors. If there are 100 Reddit and Quora threads ranking on Google\\'s first page for your keywords, and your competitor appears in 40 but you appear in 3, your citation pillar score is low.\n\n**AI model mentions (30% weight):** The [Share of Model metric](/blog/share-of-model-metric) — what percentage of buying-intent prompts result in your brand being mentioned across ChatGPT, Perplexity, Gemini, and Claude. This is tested against a library of category-relevant prompts and averaged across models.\n\n**Entity consistency (15% weight):** Whether your brand information is consistent across Google Business Profile, LinkedIn, Crunchbase, Wikipedia, and industry directories. AI models cross-reference these sources, and inconsistencies reduce trust. Proper [structured data](/blog/schema-markup-ai-search) boosts this pillar significantly.\n\n**Review signals (15% weight):** Total review volume, average rating, review velocity, and platform coverage across Google Reviews, G2, Capterra, Trustpilot, and industry-specific sites. Higher volume and freshness signal active brand usage.\n\n**Press coverage (15% weight):** Third-party media mentions in the last 12 months, publication authority, and whether mentions include backlinks. [Digital PR drives 90% of the citations](/blog/digital-pr-ai-era) that influence LLM visibility.\n\n| Score Range | Rating | What It Means |\n| --- | --- | --- |\n| 0-20 | Invisible | AI models rarely or never mention your brand |\n| 21-40 | Emerging | Occasional mentions, no consistent recommendations |\n| 41-60 | Visible | Regular mentions, starting to get recommended |\n| 61-80 | Strong | Frequently recommended, strong competitive position |\n| 81-100 | Dominant | Category leader in AI recommendations |",
      },
      {
        id: "benchmarks",
        title: "Industry Benchmarks: What Good Looks Like",
        content:
          "Most brands score between **15 and 35** on their first audit. This is not failure — it is the baseline for a channel that most companies have not optimized for yet. The category leaders who score 65-80 typically have strong brand recognition, extensive review presence, and active community participation.\n\n\"In our experience running AI visibility campaigns at MentionLayer, we\\'ve found that the average score improvement after 90 days of active GEO work is 25-35 points. A brand starting at 22 typically reaches 50-55 within one quarter,\" says Joel House.\n\nBenchmarks vary significantly by industry. SaaS companies tend to score higher because review platforms like G2 and Capterra are heavily cited by AI models. Local service businesses score lower because their citation footprint is geographically fragmented. E-commerce brands fall in the middle — strong review signals but inconsistent entity data across marketplaces.\n\nThe most important number is not your absolute score but your **gap versus the category leader**. If the top competitor scores 72 and you score 28, that 44-point gap represents the recommendation advantage they hold every time a customer asks AI for advice. Closing that gap is the purpose of a structured [90-day playbook](/blog/ninety-day-playbook).",
      },
      {
        id: "improving-score",
        title: "How to Improve a Low AI Visibility Score",
        content:
          "A low score is an opportunity, not a verdict. The fastest path to improvement follows the pillar priority order.\n\n**Quick wins (Weeks 1-2):** Fix entity inconsistencies. Update your [Google Business Profile](/blog/entity-seo-knowledge-graph), align descriptions across LinkedIn and Crunchbase, and ensure your website has proper Organization and Product [schema markup](/blog/schema-markup-ai-search). These are one-time fixes that lift your entity pillar by 15-25 points.\n\n**Medium-term gains (Weeks 3-8):** Launch [citation seeding](/blog/citation-seeding-playbook). Identify the high-authority threads where competitors are mentioned and you are not. Generate authentic, platform-native responses that naturally mention your brand. Target [Reddit threads](/blog/reddit-most-important-platform) first — Reddit appears in 68% of AI answers and delivers the highest citation impact per effort.\n\n**Sustained growth (Months 2-3+):** Build press coverage and review velocity. Publish [digital PR](/blog/digital-pr-ai-era) campaigns targeting publications in your vertical. Implement review generation workflows on the platforms your customers already use. These signals compound over time and create the multi-source consensus that AI models weight most heavily.\n\nRe-run the [audit](/help/ai-visibility-audit) monthly to track progress. The composite score should trend upward steadily. If a specific pillar stalls, it signals where to redirect effort.",
      },
    ],
    faqs: [
      {
        question: "Is AI visibility score the same as Share of Model?",
        answer:
          "No. Share of Model is one component that measures how often AI models mention your brand when asked category questions. The AI visibility score is a broader composite that also includes citation presence in forums, entity consistency across platforms, review signals, and press coverage. Share of Model is the single most important pillar at 30% weight, but it is not the whole picture.",
      },
      {
        question: "Can I check my AI visibility score for free?",
        answer:
          "You can approximate it manually by testing 20 prompts across four AI models and scoring each pillar yourself. This takes 3-4 hours and gives a rough estimate. For an automated, comprehensive audit with industry benchmarks and a prioritized action plan, platforms like MentionLayer run the full 5-pillar audit in under 5 minutes.",
      },
      {
        question: "How often should I re-run my AI visibility audit?",
        answer:
          "Monthly is the recommended cadence during active campaigns. The monthly comparison shows which pillars are improving, which are stalled, and where to redirect effort. After your score stabilizes above 60, you can shift to quarterly audits with weekly Share of Model monitoring as the lead indicator.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // ARTICLE 23: 25 AI SEO Statistics Every Marketer Needs
  // ───────────────────────────────────────────────
  {
    slug: "ai-seo-statistics-2026",
    title:
      "25 AI SEO Statistics Every Marketer Needs to Know in 2026",
    summary:
      "The definitive collection of AI SEO statistics for 2026. Covers AI search adoption rates, citation behavior, traffic conversion, platform preferences, and the metrics that define the new search landscape.",
    metaTitle: "25 AI SEO Statistics for 2026 | Data Roundup",
    metaDescription:
      "The 25 most important AI SEO statistics for 2026. AI adoption rates, citation data, conversion benchmarks, platform preferences, and what it all means for your search strategy.",
    targetKeyword: "AI SEO statistics 2026",
    publishedAt: "2026-04-23",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "fundamentals",
    buyingStage: "awareness",
    estimatedReadTime: 10,
    relatedSlugs: [
      "zero-click-search-data",
      "ai-citation-index",
      "what-is-geo-complete-guide",
      "ai-seo-vs-traditional-seo",
      "share-of-model-metric",
    ],
    keyTakeaway:
      "AI-referred sessions grew 527% year-over-year, 37% of consumers now start searches with AI, and AI referral traffic converts 4.4x better than organic. These 25 statistics define the new search landscape every marketer must navigate.",
    sections: [
      {
        id: "adoption-stats",
        title: "AI Search Adoption: The Shift Is Accelerating",
        content:
          "The transition from traditional search to AI-powered discovery is no longer a prediction — it is a measured reality. These statistics quantify the scale and speed of the shift.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"When we started tracking AI referral traffic for our clients in early 2025, it was a rounding error. Twelve months later, it accounts for 15-20% of qualified leads for brands that have optimized for it. The growth curve is steeper than anything I\\'ve seen in 15 years of digital marketing.\"\n\n**1. AI-referred sessions grew 527% year-over-year** across tracked websites, making it the fastest-growing traffic source in digital marketing history.\n\n**2. 37% of consumers now start their product research with AI** instead of Google, up from an estimated 15% in early 2025.\n\n**3. 60-83% of searches end with zero clicks** — 83% when Google AI Overviews appear. This means the AI-generated answer is the only touchpoint most users have with your brand.\n\n**4. AI Overviews reduce organic click-through rates by 61%** for queries where they appear, fundamentally changing the value proposition of traditional ranking.\n\n**5. AI referral traffic converts 4.4x better than organic search traffic** — users who arrive via AI recommendations have higher purchase intent because the AI has already pre-qualified the brand for their specific need. For B2B, LLM-referred visitors convert **5-9x higher** according to BrightEdge data.\n\nThese five statistics alone explain why [AI SEO is different from traditional SEO](/blog/ai-seo-vs-traditional-seo). The channel is smaller but growing explosively, and the traffic quality is dramatically higher.",
      },
      {
        id: "citation-stats",
        title: "Citation Behavior: How AI Models Choose Sources",
        content:
          "Understanding which sources AI models cite — and why — is the foundation of any [generative engine optimization](/blog/what-is-geo-complete-guide) strategy.\n\n**6. Perplexity averages 21.87 citations per response** while ChatGPT averages 7.92 citations per response (Qwairy Q3 2025 study). This makes Perplexity the most citation-rich AI platform and the best environment for brands seeking source attribution.\n\n**7. Wikipedia accounts for 47.9% of ChatGPT\\'s top-10 cited domains** (Profound study), making entity presence on Wikipedia a disproportionately valuable authority signal.\n\n**8. YouTube overtook Reddit as the most-cited social platform** with 39.2% of social citation share versus Reddit\\'s 20.3% (PikaSEO study). Video content is increasingly important for AI visibility.\n\n**9. Reddit appears in 68% of AI answers** to product and service queries, and shows up in **95% of product-review AI queries on Google** (Semrush study). For [buying-intent questions specifically](/blog/reddit-most-important-platform), Reddit remains dominant.\n\n**10. Only 11% of cited domains appear across multiple AI platforms.** Most sources get cited by one model but not others. This means optimizing for a single AI platform leaves you invisible on the rest — cross-platform strategy is essential.\n\n**11. 90% of citations driving LLM visibility come from earned media** rather than brand-owned content (PR on the Go). This validates the [digital PR approach](/blog/digital-pr-ai-era) to AI visibility.\n\n**12. Brand mentions correlate 3x more than backlinks with AI visibility.** The traditional SEO currency of backlinks matters less to AI models than the volume and quality of third-party brand mentions across the web.",
      },
      {
        id: "content-optimization-stats",
        title: "Content Optimization: What Makes Content Get Cited",
        content:
          "The GEO research from Princeton and Georgia Tech, combined with Kevin Indig\\'s analysis of 1.2 million ChatGPT citations, reveals specific content characteristics that increase AI citation probability.\n\n**13. Adding statistics to content improves AI visibility by 40.9%** — the single largest improvement of any GEO technique tested. Specific numbers with source context outperform vague claims by a wide margin.\n\n**14. Expert attribution (\"According to [Name]...\") improves AI citations by 28%.** Named sources with verifiable credentials signal trustworthiness to AI models.\n\n**15. 44.2% of all AI citations come from the first 30% of content.** Front-loading your direct answer, key statistic, and expert perspective is critical — AI models disproportionately extract from the [top of the page](/blog/first-30-percent-rule-ai-cites-top-content).\n\n**16. Content with H2/H3 heading hierarchy and bullet points gets cited 65% more frequently** than unstructured prose. AI models prefer content that is easy to parse and extract from.\n\n\"These numbers tell a clear story: AI models reward the same things readers reward — structured, specific, authoritative content that answers the question directly,\" says Joel House. \"The difference is that AI models are more ruthless about ignoring filler. Every sentence needs to earn its place.\"\n\n**17. Pages with FAQPage schema are 3.2x more likely to appear in AI Overviews.** [Structured data](/blog/schema-markup-ai-search) remains one of the highest-ROI technical optimizations for AI visibility.\n\n**18. 76.4% of ChatGPT\\'s cited pages were updated within 30 days.** Content freshness is a dominant signal — AI models strongly prefer recently updated sources over stale content.",
      },
      {
        id: "business-impact-stats",
        title: "Business Impact: Revenue and Brand Effects",
        content:
          "Beyond traffic, these statistics measure the actual business impact of AI visibility.\n\n**19. Only 6% of AI brand mentions result in actual recommendations** (Rand Fishkin / SparkToro). Most mentions are informational, not endorsements. The gap between being mentioned and being recommended is where the real competitive advantage lives.\n\n**20. First-person writing with an author byline yields 1.67x citation improvement** compared to anonymous or corporate-voiced content. AI models weight attributed expertise heavily.\n\n**21. Content with [schema markup](/blog/schema-markup-ai-search) has a 2.5x higher chance of AI citation** compared to content without structured data (Search Engine Land). This applies across Organization, Product, FAQ, and Article schema types.\n\n**22. AI citation visibility can decay within 48-72 hours.** Unlike Google rankings that shift gradually, AI model outputs can change rapidly when retrieval databases are updated. Weekly [monitoring](/blog/monitor-what-ai-says-about-brand) is essential.\n\n**23. Gemini cites brand-owned websites at the highest rate** — 52% of Gemini\\'s citations come from brand domains, versus lower rates for ChatGPT and Perplexity. This makes Gemini the most directly influenced by your own website content.\n\n**24. Sections of 120-180 words between headings receive 70% more ChatGPT citations** than shorter or longer sections. AI models extract self-contained sections that answer specific sub-questions — [citable content units](/blog/how-to-optimize-content-for-ai-search) are the building block of AI-optimized content.\n\n**25. The AI visibility gap is widening.** Early movers who began optimizing in 2025 hold compound advantages — their citation networks, review velocity, and entity authority create barriers that late entrants must spend significantly more to overcome.",
      },
      {
        id: "what-it-means",
        title: "What These Statistics Mean for Your Strategy",
        content:
          "These 25 data points paint a clear picture of priority. If you are building an AI visibility strategy, focus your resources on the highest-impact actions.\n\n**Highest ROI actions based on the data:**\n- Add statistics and expert attribution to your core content (40.9% + 28% improvement)\n- Implement [FAQ schema](/blog/schema-markup-ai-search) on your key pages (3.2x AI Overview appearance rate)\n- Front-load answers in the first 30% of every article (44.2% of citations come from here)\n- Update high-priority pages at least monthly (76.4% freshness preference)\n- Build [Reddit presence](/blog/reddit-most-important-platform) for buying-intent queries (68% of AI product answers cite Reddit)\n\n**Strategic shifts the data demands:**\n- Invest in earned media over link building (mentions correlate 3x more than backlinks)\n- Monitor weekly, not monthly (48-72 hour decay window)\n- Optimize for multiple AI platforms (only 11% of domains cited cross-platform)\n- Focus on recommendations, not just mentions (only 6% of mentions are recommendations)\n\nThe complete [GEO guide](/blog/what-is-geo-complete-guide) translates these statistics into a structured campaign framework. For agencies looking to build services around these opportunities, the [agency guide](/blog/geo-for-agencies) covers pricing, packaging, and scaling. And for a hands-on starting point, the [90-day playbook](/blog/ninety-day-playbook) breaks the strategy into weekly action items.",
      },
    ],
    faqs: [
      {
        question: "Where do these AI SEO statistics come from?",
        answer:
          "These statistics are sourced from multiple research institutions and industry studies including the Princeton/Georgia Tech GEO study, Kevin Indig\\'s analysis of 1.2 million ChatGPT citations, Qwairy\\'s Q3 2025 AI citation study, Semrush\\'s Reddit visibility analysis, PikaSEO\\'s social citation research, Profound\\'s Wikipedia citation study, BrightEdge\\'s conversion data, SparkToro\\'s recommendation analysis, and Search Engine Land\\'s schema markup research.",
      },
      {
        question: "How fast is AI search adoption growing?",
        answer:
          "AI-referred sessions grew 527% year-over-year, and 37% of consumers now start product research with AI instead of Google. The adoption curve is steeper than mobile search adoption was in 2015. For B2B categories specifically, AI-referred traffic is growing even faster because enterprise buyers increasingly rely on AI for vendor shortlisting.",
      },
      {
        question: "Which AI platform should I optimize for first?",
        answer:
          "Start with Perplexity and ChatGPT. Perplexity averages 21.87 citations per response — more than double ChatGPT\\'s 7.92 — making it the richest environment for earning source attribution. ChatGPT has the largest user base. Together they cover the majority of AI search volume. Add Gemini next since it favors brand-owned content at 52% citation rate from brand domains.",
      },
      {
        question: "Does AI search traffic actually convert better?",
        answer:
          "Yes, significantly. AI referral traffic converts 4.4x better than organic search traffic across all categories. For B2B specifically, LLM-referred visitors convert 5-9x higher according to BrightEdge data. The higher conversion rate exists because AI pre-qualifies the recommendation for the user\\'s specific need, filtering out casual browsers.",
      },
      {
        question: "What is the single most impactful AI SEO tactic?",
        answer:
          "Adding specific statistics with source attribution improves AI visibility by 40.9% — the largest single-technique gain measured in the GEO research. Combined with expert quotes (28% improvement) and proper heading structure (65% more citations), the data suggests that structured, fact-dense, attributed content is the foundation of AI visibility.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // ARTICLE 24: Why Your Brand Doesn\\'t Appear in AI Search
  // ───────────────────────────────────────────────
  {
    slug: "brand-not-appearing-ai-search-fix",
    title:
      "Why Your Brand Doesn\\'t Appear in AI Search Results (and How to Fix It)",
    summary:
      "If ChatGPT, Perplexity, and Gemini skip your brand when users ask about your category, there are specific, diagnosable reasons. This guide identifies the six most common causes and provides fix-by-fix action steps.",
    metaTitle: "Brand Not in AI Search? Here\\'s Why + How to Fix",
    metaDescription:
      "Six specific reasons AI models skip your brand when recommending products in your category, plus the exact fixes for each. Diagnose and resolve your AI invisibility in 30 days.",
    targetKeyword: "brand not appearing AI search",
    publishedAt: "2026-04-24",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "strategy",
    buyingStage: "decision",
    estimatedReadTime: 6,
    relatedSlugs: [
      "brand-invisible-to-ai",
      "what-is-ai-visibility-score",
      "citation-seeding-playbook",
      "schema-markup-ai-search",
      "chatgpt-recommends-competitors-not-you",
    ],
    keyTakeaway:
      "AI models skip brands for six diagnosable reasons: no third-party mentions, missing entity data, no citations in high-authority threads, poor content structure, weak review signals, and blocking AI crawlers. Each has a specific 30-day fix.",
    sections: [
      {
        id: "diagnosis",
        title: "The Six Reasons AI Models Skip Your Brand",
        content:
          "When someone asks ChatGPT \"what are the best [your category] services?\" and your brand is missing from the answer, it is not random. AI models follow specific patterns when deciding which brands to include, and there are six common failure points.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"Every brand we\\'ve audited that scores below 20 on their [AI visibility score](/blog/what-is-ai-visibility-score) has at least three of these six problems. The good news is that every one of them is fixable — most within 30 days.\"\n\nThe diagnostic process is straightforward. Run a set of 10 buying-intent prompts across ChatGPT, Perplexity, Gemini, and Claude. If your brand appears in fewer than 10% of responses, you have a systemic visibility problem. The question is *which* of the six root causes applies to you — and usually it is more than one.\n\nRather than guessing, run a [5-pillar AI visibility audit](/blog/ai-visibility-audit-five-pillars) to diagnose exactly where your gaps are. The audit scores each pillar independently, so you can prioritize fixes by the largest gap. Here are the six root causes, ranked by how frequently we see them.",
      },
      {
        id: "cause-1-no-mentions",
        title: "Cause 1: No Third-Party Brand Mentions",
        content:
          "This is the most common problem. AI models heavily weight what other sources say about you. If your brand appears only on your own website, AI has no external signal to validate your claims. [Brand mentions correlate 3x more than backlinks](/blog/ai-seo-statistics-2026) with AI visibility.\n\n**The fix:** Launch a [citation seeding campaign](/blog/citation-seeding-playbook). Identify high-authority Reddit threads, Quora questions, and Facebook Group discussions where your competitors get mentioned but you do not. Create authentic, platform-native responses that naturally reference your brand. Target 15-20 threads in your first month.\n\nSupplement seeding with [digital PR](/blog/digital-pr-ai-era). Pitch relevant publications in your vertical with newsworthy angles. Even 3-5 earned media placements in the first 90 days can meaningfully shift your AI mention rate. Remember: [90% of citations driving LLM visibility come from earned media](/blog/digital-pr-ai-era).",
      },
      {
        id: "cause-2-entity-gaps",
        title: "Cause 2: Fragmented or Missing Entity Data",
        content:
          "AI models cross-reference multiple sources to build an understanding of what your brand is. If your business description on LinkedIn says one thing, Google Business Profile says another, and your website says a third, the AI model cannot form a confident entity profile. Inconsistency equals uncertainty, and AI avoids recommending brands it is uncertain about.\n\n**The fix:** Audit your presence across key platforms: Google Business Profile, LinkedIn company page, Crunchbase, Wikipedia/Wikidata, G2, Capterra, and industry-specific directories. Align the business description, founding year, service category, and contact information across all profiles. Then implement [Organization and Product schema](/blog/schema-markup-ai-search) on your website — content with structured data has a **2.5x higher chance of AI citation**.\n\n\"The entity cleanup is the boring work that nobody wants to do, but it is also the fastest pillar to fix,\" says Joel House. \"We routinely see 15-25 point entity score improvements in the first two weeks just from aligning descriptions and adding schema markup. [Entity SEO](/blog/entity-seo-knowledge-graph) is foundational — everything else builds on it.\"",
      },
      {
        id: "cause-3-no-citations",
        title: "Cause 3: Missing from High-Authority Threads",
        content:
          "AI models like Perplexity and ChatGPT use retrieval-augmented generation, pulling from indexed web content to inform their answers. The threads that rank highest on Google for buying-intent queries are disproportionately likely to be cited. If your competitors are in those threads and you are not, AI will recommend them instead.\n\n**The fix:** Run a SERP scan for your top 20 keywords combined with site-specific queries (\"site:reddit.com [keyword]\", \"site:quora.com [keyword]\"). Identify threads ranking in positions 1-10 where competitors are mentioned. These are your highest-value seeding targets. Use the [platform-by-platform GEO guide](/blog/platform-by-platform-geo) for community-specific tactics.\n\n[Reddit appears in 68% of AI answers](/blog/reddit-most-important-platform) to product queries, making it the highest-priority platform for citation seeding. A single well-crafted Reddit response in a thread ranking #3 on Google can shift your visibility in that topic across multiple AI models.",
      },
      {
        id: "cause-4-content-structure",
        title: "Causes 4-6: Content Structure, Reviews, and Crawl Access",
        content:
          "**Cause 4: Poor content structure.** Your website content exists but is not formatted for AI extraction. AI models prefer content with clear H2/H3 hierarchy, sections of 120-180 words, specific statistics, and expert attribution. Unstructured walls of text get overlooked. Fix: restructure your top 10 pages following [GEO content optimization](/blog/how-to-optimize-content-for-ai-search) principles.\n\n**Cause 5: Weak review signals.** AI models weight review platforms heavily when making recommendations. If you have 5 Google reviews and your competitor has 500, the model will recommend them with higher confidence. Fix: implement a review generation workflow on Google, G2, Capterra, or your industry\\'s primary review platform. Focus on velocity — consistent monthly reviews matter more than a one-time burst.\n\n**Cause 6: Blocking AI crawlers.** Some brands inadvertently block AI model crawlers in their [robots.txt](/blog/robots-txt-ai-crawlers) configuration. If GPTBot, ClaudeBot, or PerplexityBot cannot access your site, those models literally cannot cite you. Fix: check your robots.txt file immediately and ensure AI crawlers have access to your key content pages.\n\n| Root Cause | Fix Timeline | Impact Level |\n| --- | --- | --- |\n| No third-party mentions | 30-60 days | High |\n| Fragmented entity data | 1-2 weeks | Medium |\n| Missing from high-authority threads | 30-45 days | High |\n| Poor content structure | 2-4 weeks | Medium |\n| Weak review signals | 60-90 days | Medium |\n| Blocking AI crawlers | 1 day | High |\n\nStart with the one-day fix (robots.txt), then the one-week fix (entity data), then the 30-day campaigns (mentions and citations). The [MentionLayer audit](/help/ai-visibility-audit) diagnoses all six causes automatically and prioritizes them by impact for your specific situation.",
      },
    ],
    faqs: [
      {
        question: "How do I check if AI models mention my brand at all?",
        answer:
          "Open ChatGPT, Perplexity, Gemini, and Claude. Ask each one: \"What are the best [your category] services?\" and \"Can you recommend a [your category] provider?\" If your brand does not appear in any of the responses, you have an AI visibility problem. For a comprehensive test, use 10-20 buying-intent prompts and track results in a spreadsheet or use a monitoring tool.",
      },
      {
        question: "How long does it take to start appearing in AI results?",
        answer:
          "The fastest fix — unblocking AI crawlers in robots.txt — can show results within days. Entity cleanup shows impact within 2-4 weeks. Citation seeding on Reddit and Quora typically takes 30-60 days to influence AI model outputs, depending on thread authority and engagement. A full 90-day campaign following the structured playbook typically moves brands from invisible to visible.",
      },
      {
        question: "My brand ranks well on Google but not in AI — why?",
        answer:
          "Google rankings and AI visibility use different signals. Google rewards backlinks, technical SEO, and on-page optimization. AI models reward third-party mentions, entity consistency, review signals, and content structure. A brand can rank #1 on Google for its keywords but score 15/100 on AI visibility because it lacks the forum mentions, reviews, and structured data that AI models prioritize.",
      },
      {
        question: "Should I fix all six causes at once?",
        answer:
          "No. Prioritize by speed and impact. Fix robots.txt access immediately (1 day). Clean up entity data next (1-2 weeks). Then launch citation seeding and PR campaigns simultaneously (30-60 days). Review generation runs as an ongoing background process. Content restructuring can happen in parallel with seeding. The 5-pillar audit tells you which causes are most severe for your specific brand.",
      },
    ],
  },

  // ───────────────────────────────────────────────
  // ARTICLE 25: Perplexity vs Google
  // ───────────────────────────────────────────────
  {
    slug: "perplexity-vs-google-business-traffic",
    title:
      "Perplexity vs Google: Which Drives Better Business Traffic?",
    summary:
      "A data-backed comparison of Perplexity AI and Google as sources of business traffic. Covers citation behavior, conversion rates, user intent differences, and how to optimize for both simultaneously.",
    metaTitle: "Perplexity vs Google: Which Drives Better Traffic?",
    metaDescription:
      "Perplexity averages 21.87 citations per response vs Google\\'s 10 blue links. Compare traffic quality, conversion rates, and optimization strategies for both search platforms.",
    targetKeyword: "Perplexity vs Google",
    publishedAt: "2026-04-25",
    author: { name: "Joel House", role: "Founder, MentionLayer" },
    category: "fundamentals",
    buyingStage: "consideration",
    estimatedReadTime: 8,
    relatedSlugs: [
      "chatgpt-vs-google-search-behavior",
      "ai-seo-vs-traditional-seo",
      "ai-citation-index",
      "how-ai-models-choose",
      "ai-seo-statistics-2026",
    ],
    keyTakeaway:
      "Perplexity delivers higher-intent traffic with 4.4x better conversion rates than Google organic, while Google delivers far more volume. The optimal strategy optimizes for both — and they share more ranking signals than you might expect.",
    sections: [
      {
        id: "the-comparison",
        title: "Two Search Paradigms, One Business Goal",
        content:
          "Google serves a list of links. Perplexity serves an answer with citations. This fundamental difference changes everything about how users discover, evaluate, and choose brands — and it changes what you need to do to be the brand that gets chosen.\n\nAccording to Joel House, founder of MentionLayer and author of AI for Revenue, \"The brands winning right now are not choosing between Google and Perplexity. They are optimizing for both because the traffic from each serves a different stage of the buyer journey. Google captures intent. Perplexity pre-qualifies the recommendation. Together, they create a compound effect that neither delivers alone.\"\n\nThe numbers frame the comparison. Google processes over 8.5 billion searches daily with a dominant market share. Perplexity is growing rapidly but remains a fraction of Google\\'s volume. However, [AI referral traffic converts 4.4x better](/blog/ai-seo-statistics-2026) than organic search traffic. For B2B, that multiplier reaches 5-9x according to BrightEdge data.\n\nThis means a brand getting 100 visitors per month from Perplexity may generate more revenue than 500 visitors from Google organic. The volume-versus-quality trade-off is the central tension of this comparison, and the right answer depends on your business model.",
      },
      {
        id: "citation-behavior",
        title: "How Each Platform Cites Sources",
        content:
          "Google shows 10 organic results per page, with the top 3 positions capturing roughly 55% of all clicks. Your optimization goal is clear: rank higher. The signal set is well-understood — backlinks, page authority, technical SEO, content relevance, and user engagement.\n\nPerplexity takes a fundamentally different approach. It generates a synthesized answer and cites an average of **21.87 sources per response** (Qwairy Q3 2025 study). Those sources are not ranked in a numbered list — they are woven into the answer as inline citations, much like an academic paper. The user can click through to any cited source for depth.\n\nThis citation density matters for two reasons. First, your chance of being included is higher — Perplexity cites 21+ sources versus Google\\'s 10 positions. Second, the citation comes with context. Google shows your title tag and meta description. Perplexity shows a sentence or paragraph describing why your source is relevant to the user\\'s specific question. That context acts as a pre-qualification filter.\n\n\"Perplexity is not just citing more sources — it is citing *different* sources than Google,\" says Joel House. \"We\\'ve tracked cases where a brand ranks position 15 on Google for a keyword but gets cited by Perplexity because Perplexity found the brand mentioned in a Reddit thread or industry report that Google\\'s algorithm ranked lower.\"\n\nThe [AI citation index](/blog/ai-citation-index) breaks down which sources each AI platform prefers. Perplexity leans heavily on Reddit (appearing in its citation lists far more than Google\\'s organic results do), expert forums, and comparison/review sites. Google favors high-domain-authority sites with strong backlink profiles.",
      },
      {
        id: "traffic-quality",
        title: "Traffic Quality: Conversion Rate Comparison",
        content:
          "Raw traffic numbers favor Google by orders of magnitude. Quality metrics favor Perplexity by a significant margin.\n\n| Metric | Google Organic | Perplexity AI |\n| --- | --- | --- |\n| Daily search volume | 8.5B+ | Growing rapidly |\n| Average citations/results | 10 per page | 21.87 per response |\n| Traffic conversion rate | Baseline | 4.4x higher |\n| B2B conversion rate | Baseline | 5-9x higher |\n| User intent clarity | Mixed (informational + transactional) | High (question-based, specific) |\n| Click-through behavior | Scans titles, clicks 1-3 results | Reads answer, clicks cited sources for depth |\n| Returning visitor rate | Moderate | Higher (AI-qualified visitors are more engaged) |\n\nThe conversion rate advantage exists because of how users arrive. A Google user types \"best CRM software,\" sees 10 results, and clicks through to compare several. A Perplexity user asks \"what CRM should a 50-person sales team use?\" and gets a specific answer that cites 3-4 relevant tools with reasoning. The Perplexity visitor arrives already knowing why your product was recommended for their use case.\n\nFor [SaaS companies](/blog/geo-for-saas), this intent-matching creates particularly strong conversion advantages. The AI response acts as a trusted pre-sales qualification layer. For local businesses, the effect is smaller but still positive because the AI response provides geographic and category context.",
      },
      {
        id: "optimization-overlap",
        title: "Optimization Strategies: More Overlap Than You Think",
        content:
          "The good news: optimizing for Perplexity does not require abandoning Google optimization. Many of the same signals drive visibility in both.\n\n**Shared optimization strategies:**\n- [Structured data and schema markup](/blog/schema-markup-ai-search) helps both Google and Perplexity understand your content (2.5x citation improvement)\n- Content freshness matters in both — [76.4% of ChatGPT and Perplexity\\'s cited pages](/blog/ai-seo-statistics-2026) were updated within 30 days\n- Topical authority signals transfer across platforms — deep, comprehensive coverage of your subject matter impresses both algorithms\n- Clear heading structure and information density help both discovery and citation\n\n**Perplexity-specific optimizations:**\n- Third-party mentions matter more than backlinks — Perplexity weights [brand mentions 3x more than backlinks](/blog/ai-seo-statistics-2026)\n- [Reddit and Quora presence](/blog/reddit-most-important-platform) feeds Perplexity\\'s citation pipeline directly\n- Expert attribution (\"According to [Name]...\") format improves Perplexity citations by 28%\n- Self-contained sections of 120-180 words get extracted and cited as standalone answers\n\n**Google-specific optimizations:**\n- Backlink quality and domain authority remain primary ranking factors\n- Technical SEO (page speed, core web vitals, mobile optimization) matters more for Google\n- Featured snippet optimization targets position zero\n- Local SEO signals (Google Business Profile, NAP consistency) drive local pack results\n\nThe strategy is not either/or — it is **Google for volume, Perplexity for quality**. Build your technical SEO foundation for Google, then layer on the [GEO optimizations](/blog/what-is-geo-complete-guide) that specifically boost Perplexity and other AI platforms. The content improvements (structured sections, statistics, expert attribution) benefit both channels simultaneously.",
      },
      {
        id: "strategic-recommendation",
        title: "Where to Focus: A Decision Framework",
        content:
          "Your optimal allocation between Google and Perplexity optimization depends on your business context.\n\n**Prioritize Google if:** You need high-volume top-of-funnel traffic, your category has low AI search adoption, your conversion funnel relies on comparison shopping across multiple visits, or you sell low-consideration products where the AI pre-qualification advantage is minimal.\n\n**Prioritize Perplexity and AI search if:** You sell high-consideration products or services (B2B SaaS, professional services, financial products), your competitors already have strong AI visibility and are capturing recommendation traffic, your category has high AI search adoption among your target audience, or your margins support a lower-volume but higher-conversion traffic model.\n\n**Optimize for both simultaneously if:** You have the resources to maintain strong technical SEO and add GEO optimizations — this is the ideal position and what most mid-market and enterprise brands should target.\n\nThe [MentionLayer platform](/how-it-works) tracks your visibility across both Google SERP positions and AI model citation rates, so you can measure the combined effect of your optimization efforts. The [5-pillar audit](/blog/ai-visibility-audit-five-pillars) includes both traditional citation presence (Google rankings) and AI presence (model mention rates) in its composite score.\n\nThe bottom line: Google is not going away, but the margin on Google traffic is compressing as AI Overviews [reduce organic CTR by 61%](/blog/ai-seo-statistics-2026). Perplexity traffic is smaller but growing at 527% year-over-year with dramatically better conversion rates. The smart play is to capture both while the competition is still focused exclusively on Google.",
      },
    ],
    faqs: [
      {
        question: "Is Perplexity replacing Google?",
        answer:
          "Not yet, and likely not entirely. Google processes 8.5 billion daily searches and has deep infrastructure advantages. But Perplexity and other AI search tools are capturing a growing share of buying-intent queries — the highest-value search segment. The shift is happening faster for B2B and high-consideration purchases where users want synthesized recommendations rather than link lists.",
      },
      {
        question: "Do I need different content for Perplexity vs Google?",
        answer:
          "You do not need completely different content, but you need to optimize differently. Google rewards backlinks and technical SEO. Perplexity rewards third-party mentions, expert attribution, and structured content sections. The best approach is to create content that satisfies both: technically optimized pages with clear structure, specific statistics, attributed expertise, and supported by third-party mentions across Reddit, Quora, and earned media.",
      },
      {
        question: "How do I track Perplexity traffic separately in analytics?",
        answer:
          "In Google Analytics 4, Perplexity traffic appears as referral traffic from perplexity.ai. Create a custom segment filtering for referral source containing \"perplexity\" to isolate it. Compare conversion rates against your organic Google segment to validate the quality differential. Most analytics platforms now support AI referral traffic as a distinct channel group.",
      },
      {
        question: "Does Perplexity cite the same sources as Google ranks?",
        answer:
          "There is overlap, but significant divergence. Only 11% of cited domains appear across multiple AI platforms. Perplexity draws heavily from Reddit, expert forums, and comparison sites — sources that may rank lower on Google but contain the authentic user discussions Perplexity values. A brand can rank on page 2 of Google but get cited frequently by Perplexity if it has strong community presence.",
      },
      {
        question: "Should small businesses focus on Perplexity?",
        answer:
          "Small businesses should maintain their Google presence (especially local SEO and Google Business Profile) while adding low-effort Perplexity optimizations. The highest-impact actions for small businesses are adding FAQ schema to key pages, ensuring entity consistency across directories, and building review volume on Google and industry platforms. These improvements help both Google and AI search visibility simultaneously.",
      },
    ],
  },
];
