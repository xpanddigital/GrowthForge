import type { Metadata } from "next";
import Link from "next/link";
import { MLNav } from "@/components/marketing/ml-nav";
import { MLFooter } from "@/components/marketing/ml-footer";
import {
  RedditCollapseChart,
  TopCorrelationsChart,
  DAQuartileLiftChart,
  AddressabilityChart,
  VisibleVsInvisibleRadar,
  CitationLiftChart,
  SourceCategoryChart,
  CrossMarketChart,
  StrictIsolationChart,
} from "./charts";
import {
  study2Headline,
  faqAttacks,
  layer3,
  quotables,
  topCitedDirectories,
  visibleVsInvisible,
} from "@/lib/research/study2-data";

export const metadata: Metadata = {
  title:
    "The Off-Page AI Visibility Index | Q2 2026 Research | MentionLayer",
  description:
    "We tested 'you need to be on Reddit' across 2,729 businesses. Reddit's predictive power collapses from r=0.333 to r=0.000 once you control for general multi-platform presence. The largest cross-market controlled GEO study published anywhere — 14 industries, 4 markets, 278,000+ data points.",
  keywords: [
    "Generative Engine Optimization",
    "GEO research",
    "AI visibility study",
    "Reddit AI SEO",
    "Perplexity citations",
    "ChatGPT citations",
    "off-page SEO research",
    "AI visibility index",
    "Domain Authority AI",
    "MentionLayer",
  ],
  authors: [{ name: "Joel House" }],
  openGraph: {
    title: "Off-Page AI Visibility Index — Q2 2026",
    description:
      "Reddit's predictive power collapses to zero under proper controls. 2,729 businesses, 14 industries, 4 markets. The contrarian GEO study.",
    type: "article",
    publishedTime: "2026-04-27",
    authors: ["Joel House"],
    images: [
      "/api/og?title=Off-Page+AI+Visibility+Index&subtitle=Q2+2026+Research",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Off-Page AI Visibility Index — Q2 2026",
    description:
      "We tested 'you need to be on Reddit' across 2,729 businesses. The result will surprise you.",
  },
};

export default function Q22026OffPageDecomposition() {
  return (
    <div className="ml">
      <MLNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(61,43,224,0.08) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative max-w-[920px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 12H5m7 7l-7-7 7-7" />
              </svg>
              Research
            </Link>
            <span style={{ color: "var(--ink-tertiary)" }}>·</span>
            <span style={{ color: "var(--ink-tertiary)" }}>
              Study {study2Headline.studyNumber} · April 2026
            </span>
            <span style={{ color: "var(--ink-tertiary)" }}>·</span>
            <span style={{ color: "var(--ink-tertiary)" }}>
              ~22 min read
            </span>
          </div>

          <h1
            className="mt-6 text-[38px] sm:text-[52px] lg:text-[64px] leading-[1.04] tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            The Off-Page AI Visibility Index
          </h1>
          <p
            className="mt-5 text-[19px] sm:text-[22px] leading-[1.5] max-w-[720px]"
            style={{ color: "var(--ink-secondary)" }}
          >
            We tested &ldquo;you need to be on Reddit&rdquo; across 2,729 businesses, 14 industries, and 4 markets. Reddit&apos;s predictive power collapsed from r=0.333 to <strong style={{ color: "var(--ink)" }}>r=0.000</strong> once we controlled for general multi-platform presence.
          </p>
          <p
            className="mt-4 text-[16px] leading-relaxed max-w-[720px]"
            style={{ color: "var(--ink-tertiary)" }}
          >
            This is the largest cross-market controlled GEO study published anywhere — 278,000+ data points, 32 industry-city slots, 5 AI models. By Joel House, founder of MentionLayer.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#the-collapse"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
              style={{
                background: "var(--accent)",
                boxShadow: "0 2px 8px rgba(61,43,224,0.25)",
              }}
            >
              Jump to the Reddit collapse
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
            <Link
              href="/free-audit"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center gap-2"
              style={{
                border: "1px solid rgba(61,43,224,0.2)",
                color: "var(--accent)",
              }}
            >
              Run your brand against the benchmarks
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FORMAL PAPER CALLOUT ═══ */}
      <section className="py-4">
        <div className="max-w-[920px] mx-auto px-6">
          <a
            href="/research/papers/ai-visibility-index-combined-v1.1.docx"
            download
            className="block rounded-xl p-5 transition-transform hover:-translate-y-px"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--accent-subtle)",
              textDecoration: "none",
            }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--accent-subtle)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="15" y2="17" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: 2,
                  }}
                >
                  Academic-format white paper available
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: "var(--ink)",
                    lineHeight: 1.4,
                  }}
                >
                  Combined Phase 1 + 2 White Paper · v1.1 · ~38 pages · 8 sections, 20 tables, 6 figures, full methodology + references
                </div>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Download DOCX
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* ═══ HEADLINE STATS BAND ═══ */}
      <section
        className="py-10 sm:py-12"
        style={{ background: "var(--surface-raised)" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                v: study2Headline.totalBusinesses.toLocaleString(),
                l: "Businesses analysed",
                s: `Up from ${study2Headline.previousStudy.businesses.toLocaleString()} in Study 1`,
              },
              {
                v: study2Headline.industryCitySlots,
                l: "Industry × city slots",
                s: `${study2Headline.industries} industries × ${study2Headline.markets} markets`,
              },
              {
                v: `${(study2Headline.totalDataPoints / 1000).toFixed(0)}k+`,
                l: "Mention checks",
                s: `${study2Headline.aiModels} AI models tested`,
              },
              {
                v: "r=0.000",
                l: "Reddit isolated effect",
                s: "after full controls (n=2,545)",
                isHero: true,
              },
            ].map((stat) => (
              <div
                key={stat.l}
                className="rounded-2xl p-5"
                style={{
                  background: stat.isHero ? "var(--accent)" : "var(--surface)",
                  color: stat.isHero ? "#fff" : "var(--ink)",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="text-[34px] sm:text-[40px] font-semibold tracking-tight"
                  style={{
                    color: stat.isHero ? "#fff" : "var(--accent)",
                    fontFamily: "'Outfit', system-ui, sans-serif",
                  }}
                >
                  {stat.v}
                </div>
                <div
                  className="mt-1 text-[14px] font-medium"
                  style={{ color: stat.isHero ? "rgba(255,255,255,0.95)" : "var(--ink)" }}
                >
                  {stat.l}
                </div>
                <div
                  className="text-[12.5px]"
                  style={{ color: stat.isHero ? "rgba(255,255,255,0.75)" : "var(--ink-tertiary)" }}
                >
                  {stat.s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ARTICLE BODY ═══ */}
      <article className="py-16 sm:py-20">
        <div className="max-w-[760px] mx-auto px-6">

          {/* INTRO */}
          <Lede>
            Six weeks ago we said Domain Authority was the strongest predictor of AI visibility. Today we have proof a signal beats it.
          </Lede>

          <P>
            In the largest cross-market off-page GEO study published anywhere — 2,729 businesses, 14 industries, Los Angeles + Sydney + New York + Chicago + national, 278,000+ individual mention checks — <Strong>directory presence (r=0.391) outranks Domain Authority (r=0.338)</Strong>.
          </P>
          <P>
            That&apos;s the headline. But it&apos;s not the contrarian finding. The contrarian finding is what happened when we stress-tested the most-repeated piece of GEO advice on the internet:{" "}
            <em>&ldquo;You need to be on Reddit.&rdquo;</em>
          </P>
          <P>
            Reddit&apos;s raw correlation with AI visibility is real — r=0.333. Strong, statistically significant, the kind of number every GEO consultant is quoting at a conference right now.
          </P>
          <P>
            Then we added controls. Domain Authority. Google reviews. Then every other off-page signal we measured.
          </P>
          <P>
            By the time we&apos;d controlled for whether the brand also has Wikipedia, LinkedIn, BBB, Yelp, Crunchbase, Trustpilot, Google Business, YouTube, Quora and the rest, <Strong>Reddit&apos;s independent effect collapsed to zero. r = 0.000. n = 2,545.</Strong>
          </P>

          <PullQuote>
            AI visibility is a SYSTEM, not a SIGNAL. No single off-page channel — including the most-hyped one — has more than a small independent effect once everything else is controlled for.
          </PullQuote>

          {/* SECTION 2 */}
          <H2 id="what-study-1-missed">What Study 1 left unanswered</H2>
          <P>
            Six weeks ago we published the{" "}
            <a href="/research" style={linkStyle}>
              AI Visibility Index
            </a>{" "}
            — 1,004 businesses, 10 industries, 5 AI models, 95,392 mention checks. Headline: <Strong>66% of businesses are completely invisible to AI.</Strong> Top two predictors: Domain Authority (r=0.337) and Google review count (r=0.333).
          </P>
          <P>
            That study answered the question &ldquo;who&apos;s visible.&rdquo; It did not answer the question we actually needed for our clients: <em>what do we do about it?</em>
          </P>
          <P>
            DA and review count are lagging indicators. They take 12–18 months to move. If a business is invisible today and you tell them &ldquo;build authority,&rdquo; you&apos;re telling them to come back in a year and a half. That&apos;s not advice. That&apos;s an obituary.
          </P>
          <P>So we asked the harder question:</P>
          <Blockquote>
            What&apos;s <em>inside</em> Domain Authority? Can we decompose it into measurable, actionable, off-page signals — and prove that those signals predict AI visibility independently of DA itself?
          </Blockquote>

          {/* SECTION 3 — THE EXPANSION */}
          <H2 id="the-expansion">The expansion</H2>
          <Table
            head={["Dimension", "Study 1", "Study 2"]}
            rows={[
              ["Businesses", "1,004", "2,729"],
              ["Industries", "10", "14"],
              ["Markets", "1 (LA + national)", "4 — LA + Sydney + NYC + Chicago + national"],
              ["AI models tested", "5", "5"],
              ["Prompts per slot", "20", "20"],
              ["Total mention checks", "95,392", "278,000+"],
              ["Industry-city slots", "10", "32"],
            ]}
          />
          <P>
            For each of the 2,729 businesses we collected the Study 1 layer (Moz DA, Google reviews, schema, robots, citability, blogs, llms.txt, FAQ content) plus two new layers built specifically for this study:
          </P>
          <Bullets>
            <li>
              <Strong>Layer 2a — SpyFu enrichment.</Strong> Monthly organic clicks, organic keyword count, domain strength, 12-month organic growth rate.
            </li>
            <li>
              <Strong>Layer 2b — Off-page presence.</Strong> Twelve canonical platforms parsed via Apify SERP queries (<code style={codeStyle}>site:platform &quot;brand&quot;</code>) — Reddit, Quora, Wikipedia, LinkedIn, Crunchbase, GBP, BBB, Yelp, Trustpilot, G2, Capterra, YouTube. Plus 12-month press mentions via editorial-domain classifier.
            </li>
          </Bullets>
          <P>
            Then we did one thing nobody else has done: <Strong>we reverse-classified every URL</Strong> every AI model cited in Study 1&apos;s 95,000+ responses into 16 source-type categories. So when we ask &ldquo;where does Perplexity actually pull answers from?&rdquo; we have receipts.
          </P>

          {/* CHART 1 — TOP CORRELATIONS */}
          <ChartFrame>
            <TopCorrelationsChart />
          </ChartFrame>

          <H2 id="finding-1">Finding 1 — Off-page signals just dethroned DA</H2>
          <P>
            In Study 1, DA and Google review count occupied the top two slots. In Study 2 they&apos;re rank 5 and rank 14. Four off-page signals are now ahead of DA. <Strong>Six are ahead of Google review count.</Strong>
          </P>
          <P>
            The strongest is <Code>directory_count</Code> — a simple sum of how many of twelve canonical platforms a business shows up on. It outranks every authority metric Moz, Ahrefs, or SpyFu sells.
          </P>
          <Takeaway>
            A signal you didn&apos;t know existed last quarter just took the #1 slot.
          </Takeaway>

          {/* SECTION — REDDIT COLLAPSE */}
          <H2 id="the-collapse">Finding 2 — &ldquo;You need to be on Reddit&rdquo; doesn&apos;t survive scrutiny</H2>
          <P>
            This is the contrarian centerpiece. Read it carefully.
          </P>
          <P>
            The single most-repeated piece of GEO advice in 2026 is some version of &ldquo;AI models pull from Reddit, so you need to be on Reddit.&rdquo; It&apos;s the marketing pitch behind dozens of new GEO tools. Half the SEO conferences had a panel about it. We tested it directly.
          </P>

          <ChartFrame>
            <RedditCollapseChart />
          </ChartFrame>

          <P>
            Read the chart left to right. Reddit&apos;s predictive power doesn&apos;t degrade gracefully — <Strong>it falls off a cliff.</Strong>
          </P>
          <P>
            The raw correlation of +0.333 looks like a Reddit effect. It is not. Once you control for whether the same brand also shows up on Wikipedia, LinkedIn, BBB, Yelp, Trustpilot, GBP, YouTube, Crunchbase, and Quora, <Strong>Reddit&apos;s independent contribution to AI visibility is statistically zero.</Strong> r = 0.000 across 2,545 businesses.
          </P>
          <P>
            The honest read: Reddit mention count is a <em>proxy</em> for general multi-platform brand visibility. Brands that get mentioned on Reddit also tend to get mentioned everywhere else. The Reddit number was measuring the everywhere-else effect the whole time.
          </P>
          <Callout>
            <Strong>This isn&apos;t us saying &ldquo;don&apos;t post on Reddit.&rdquo;</Strong> Reddit is fine. We are saying: the case for Reddit as a special, irreplaceable, must-do AI visibility channel — the case being made on every GEO panel — is not in the data. The collapse from r=0.333 to r=0.000 is the entire ballgame.
          </Callout>
          <P>
            The same decomposition applied to <Code>directory_count</Code> tells the same story:
          </P>
          <Table
            head={["Control level", "directory_count r", "n"]}
            rows={[
              ["Raw (no controls)", "+0.391", "2,648"],
              ["Controlled for DA only", "+0.186", "998"],
              ["+DA + Reviews", "+0.154", "899"],
              ["+Study 1 controls", "+0.132", "847"],
              ["Controlled for ALL OTHER off-page signals", "+0.000", "2,545"],
              ["Strictest (everything measured)", "+0.000", "795"],
            ]}
          />
          <P>
            <Strong>No single off-page channel has independent predictive power once everything else is controlled for.</Strong> AI visibility is cumulative. It&apos;s a stack, not a switch.
          </P>
          <Takeaway>
            Reddit&apos;s predictive power is a proxy for general multi-platform brand visibility — not a Reddit-specific channel effect.
          </Takeaway>

          {/* SECTION — CITATION LIFT */}
          <H2 id="finding-3">Finding 3 — What does survive: be the URL the AI cites</H2>
          <P>
            There&apos;s a related claim adjacent to the Reddit hype: <em>&ldquo;Be in the threads ChatGPT pulls up as a reference.&rdquo;</em> That one we <em>can</em> test, but only for the models that actually return source URLs.
          </P>
          <Callout intent="warning">
            <Strong>ChatGPT, Claude, and Gemini APIs do not return source URLs.</Strong> The &ldquo;be in the threads ChatGPT cites&rdquo; claim is literally untestable for ChatGPT specifically with API data. Read that twice. Anyone showing you a chart of &ldquo;what ChatGPT cites&rdquo; built from the API is showing you something else — or making it up.
          </Callout>

          <ChartFrame>
            <CitationLiftChart />
          </ChartFrame>

          <P>
            For the models that <em>do</em> cite — Perplexity and Google AI Overview — being the cited URL within an AI response is a strong signal. <Strong>5.5x lift on Perplexity.</Strong> Per-business citation count vs visibility: Perplexity r=+0.194 (n=2,729). Google AIO r=+0.086 (n=2,729). ChatGPT, Claude, Gemini: zero source URL data, zero correlation possible.
          </P>
          <P>
            The actionable read is <em>not</em> &ldquo;post on Reddit.&rdquo; It is: <Strong>be the canonical URL the AI considers the right answer for your category.</Strong> Sometimes that&apos;s a Reddit thread. More often — and this is the part that matters — it&apos;s a directory page, an industry list, a review hub, a YouTube video, your own site. Where you need to be is wherever AI is already pulling from <em>in your specific vertical</em>.
          </P>
          <Takeaway>
            On the models that cite, being the cited URL gives you a 5.5x lift. The goal is to BE the source, not merely be near one.
          </Takeaway>

          {/* SECTION — WHERE AI ACTUALLY PULLS FROM */}
          <H2 id="where-from">Where AI actually pulls from (the receipts)</H2>
          <P>
            The discourse and the data have been disagreeing for a year. Reverse-classification of the actual URLs Perplexity and Google AIO cited in our 95,000+ Study 1 responses, by source type:
          </P>

          <ChartFrame>
            <SourceCategoryChart />
          </ChartFrame>

          <P>
            <Strong>Editorial blogs and publications carry 69% of citations.</Strong> Brand-owned websites carry another 18%. Industry directories: 6%. YouTube: 4%. News media: 2.5%. <strong style={{ color: "var(--warm)", fontWeight: 600 }}>Reddit: zero.</strong> Quora: 0.02%. Two Wikipedia citations across 95,000 responses.
          </P>
          <P>
            The top industry directories AI actually cites are vertical-specific gatekeepers — and these are the URLs to fight for:
          </P>
          <Table
            head={["Domain", "Citations", "Vertical"]}
            rows={topCitedDirectories.map((d) => [
              d.domain,
              d.count.toString(),
              d.vertical,
            ])}
          />
          <Takeaway>
            Editorial coverage and being the canonical own-site answer drive the bulk of AI citations. Vertical directories matter where they exist. Reddit is nearly invisible.
          </Takeaway>

          {/* SECTION — DA QUARTILE LIFT */}
          <H2 id="finding-4">Finding 4 — Directories as a force multiplier</H2>
          <P>
            We split the sample into Domain Authority quartiles and asked: within each quartile, what&apos;s the visibility difference between businesses with above-median directory presence versus below-median?
          </P>

          <ChartFrame>
            <DAQuartileLiftChart />
          </ChartFrame>

          <P>
            The Q4 row is the punchline. <Strong>For high-authority brands, the multi-platform presence stack is a force multiplier — +16 visibility points</Strong> between low- and high-directory peers in the same DA quartile.
          </P>
          <P>
            For low-authority brands (Q1, Q2, Q3), directory presence helps a little or not at all on its own. <Strong>The compounding only kicks in when you also have the underlying authority.</Strong> If you&apos;re a DA 12 startup, fixing your BBB profile won&apos;t put you on ChatGPT. If you&apos;re a DA 65 brand without it, you&apos;re leaving 16 points of visibility on the table.
          </P>
          <Takeaway>
            Directory presence is a force multiplier for already-credible brands and a partial fill-in for everyone else.
          </Takeaway>

          {/* SECTION — INDUSTRY ADDRESSABILITY */}
          <H2 id="finding-5">Finding 5 — Industry physics: 0% to 30%</H2>
          <P>
            The variance in off-page leverage between verticals is enormous.
          </P>

          <ChartFrame>
            <AddressabilityChart />
          </ChartFrame>

          <P>
            Off-page intervention has <Strong>roughly 30x more leverage in NYC plumbing than in Med Spa.</Strong> In Sydney professional services and Chicago accounting, it has <em>no</em> leverage — those models cite editorial blogs that an off-page program can&apos;t move.
          </P>
          <P>
            For MentionLayer specifically, this is a sales-targeting matrix: SaaS, home services and personal-finance apps are high-leverage. Med spa and Sydney professional services are low-leverage. <Strong>The product&apos;s value depends entirely on the vertical.</Strong> That&apos;s an honest admission, and it makes the pitch sharper, not weaker.
          </P>
          <Takeaway>
            Off-page leverage varies 30x across verticals. GEO playbooks should be vertical-AND-market specific — there is no universal one.
          </Takeaway>

          {/* SECTION — CROSS-MARKET */}
          <H2 id="finding-6">Finding 6 — The dominant signal changes per market</H2>
          <P>
            Some of the most striking findings only show up when you stratify by industry × city.
          </P>

          <ChartFrame>
            <CrossMarketChart />
          </ChartFrame>

          <Bullets>
            <li>
              <Strong>NYC home services:</Strong> off_page_composite r=<strong>0.683</strong>, directory_count r=<strong>0.679</strong>. The strongest off-page correlation in the entire study.
            </li>
            <li>
              <Strong>NYC accounting:</Strong> quora_mention_count r=<strong>0.674</strong> — Quora is the dominant signal, not Reddit. A Quora-led playbook would arguably outperform anything else.
            </li>
            <li>
              <Strong>LA real estate:</Strong> reddit_mention_count r=<strong>0.589</strong> — the one industry-city slot where the &ldquo;post on Reddit&rdquo; advice plausibly survives strict scrutiny.
            </li>
            <li>
              <Strong>Sydney slots collectively:</Strong> 0% addressable citation share. AI cites Sydney editorial blogs, not the directories or forums an off-page program touches. A Sydney dentist&apos;s GEO strategy should not look anything like an NYC dentist&apos;s.
            </li>
          </Bullets>
          <Takeaway>
            There is no universal GEO playbook. There is the specific playbook for your vertical in your market — and the rest is generic content with confident charts.
          </Takeaway>

          {/* SECTION — STRICT ISOLATION */}
          <H2 id="finding-7">Finding 7 — Strict isolation: what survives full controls</H2>
          <P>
            For every off-page signal, we ran an OLS-residual partial correlation controlling for all other measured features simultaneously. This is the cleanest per-signal effect size we can compute on an observational dataset.
          </P>

          <ChartFrame>
            <StrictIsolationChart />
          </ChartFrame>

          <P>
            <Strong>No single off-page signal exceeds r=0.10 in strict isolation.</Strong> Not Reddit. Not BBB. Not Wikipedia. Not LinkedIn. Not YouTube.
          </P>
          <P>
            The honest interpretation: AI visibility is not driven by any one channel. It is driven by <Strong>cumulative multi-platform presence</Strong>. Each platform contributes a small lift; together they create the visibility outcome. This is why the <em>composite</em> (off_page_composite_score, r=0.384) outperforms the strongest individual platform.
          </P>

          {/* SECTION — VISIBLE VS INVISIBLE PROFILE */}
          <H2 id="self-audit">The self-audit: visible vs invisible profile</H2>
          <P>
            What does a multi-model-visible business actually look like? We profiled the 401 businesses mentioned by ≥2 AI models and the 1,841 businesses mentioned by zero. The gap is striking.
          </P>

          <ChartFrame>
            <VisibleVsInvisibleRadar />
          </ChartFrame>

          <P>
            Run your own brand against these benchmarks. If you&apos;re below the visible profile on directory count, Wikipedia, Crunchbase and review platforms — <Strong>that is your work order for Q3.</Strong> If you&apos;re above on most metrics and still invisible, you have a Layer 1 (DA / authority) problem, not a Layer 2 problem.
          </P>
          <Takeaway>
            Visible brands run an off-page composite of {visibleVsInvisible.visible.avgComposite}. Invisible brands sit at {visibleVsInvisible.invisible.avgComposite}. Where do you sit?
          </Takeaway>

          {/* THESIS RECAP */}
          <H2 id="thesis">The unifying thesis</H2>
          <P>
            Three findings combine into one defensible claim.
          </P>
          <NumberedBullets>
            <li>
              No single off-page channel — including Reddit, the most-hyped one — has more than a small independent effect once everything else is controlled for. Reddit&apos;s strict isolated r is <Strong>zero</Strong>.
            </li>
            <li>
              The cumulative multi-platform presence stack drives visibility. BBB, Yelp, GBP, Wikipedia, LinkedIn, Crunchbase, Trustpilot, YouTube, Reddit, Quora — each adds a small individual lift. <Strong>Together they produce the outcome.</Strong>
            </li>
            <li>
              Where AI models <em>do</em> cite specific sources (Perplexity especially, in vertical-specific addressable categories), being THAT cited URL is a strong signal — <Strong>5.5x lift on Perplexity.</Strong>
            </li>
          </NumberedBullets>
          <PullQuote>
            AI visibility is a SYSTEM, not a SIGNAL. Stop optimising for one platform. Build the stack.
          </PullQuote>
          <P>
            The operational consequence: any GEO program priced around a single channel is, on this evidence, mispriced. A program that builds presence across 8–12 platforms simultaneously, weighted to your vertical&apos;s actual addressable surfaces, is what the data supports. That&apos;s the version we built.
          </P>

          {/* WHAT IT MEANS */}
          <H2 id="playbook">What this means for your business</H2>
          <P>
            Look up your vertical and your DA quartile. The right strategy is specific to both.
          </P>
          <PlaybookCards />

          {/* FAQ — COMMON ATTACKS */}
          <H2 id="faq">&ldquo;You&apos;re wrong about Reddit&rdquo; — and other expected attacks</H2>
          <P>
            Publishing &ldquo;Reddit doesn&apos;t do what you think it does&rdquo; will earn pushback. Here are the strongest available rebuttals to the study, with our responses. We have skin in the game on this — we&apos;d rather be corrected than wrong.
          </P>
          <FAQ items={faqAttacks} />

          {/* METHODOLOGY */}
          <H2 id="methodology">Methodology + reproducibility</H2>
          <P>
            For the people who care about how it was built. Skim if not.
          </P>
          <Bullets>
            <li>
              <Strong>Sample.</Strong> 2,729 businesses · 14 industries · 32 industry-city slots — six local categories replicated in LA + Sydney + NYC + Chicago, plus four national SaaS / professional categories carried from Study 1, plus four new national verticals.
            </li>
            <li>
              <Strong>Models.</Strong> ChatGPT (gpt-4o), Perplexity (sonar-pro), Gemini (2.5-flash), Claude (Sonnet), Google AI Overview (via SerpApi).
            </li>
            <li>
              <Strong>Prompts.</Strong> 20 unique buying-intent prompts per industry-city, six categories — direct recommendation, comparison, specific need, conversational, authority-seeking, decision. Identical to Study 1.
            </li>
            <li>
              <Strong>Mention detection.</Strong> Heuristic string matching (exact name, partial name, domain) plus AI-enhanced verification (Claude Sonnet at temperature 0).
            </li>
            <li>
              <Strong>Off-page collection.</Strong> 12 SERP queries per business via Apify <Code>google-search-scraper</Code>, parsed for canonical-platform URLs.
            </li>
            <li>
              <Strong>Citation classifier.</Strong> Every URL Perplexity and Google AIO cited in Study 1 was classified into 16 source-type categories.
            </li>
          </Bullets>
          <H3>The strict-isolation methodology</H3>
          <P>
            For each test feature <Code>X</Code> we compute an OLS-residual partial correlation against <Code>visibility_score</Code>, controlling for all other measured features simultaneously. Standardised features, residualised on full controls, Pearson on the residuals. Restricted to rows where every feature is non-null.
          </P>
          <P>
            We&apos;ve run six different model specifications — different control sets, restricted to different subsamples, with and without SpyFu/Layer 1 features. The directional findings are unchanged. Reddit&apos;s independent effect never exceeds r=0.05 in any specification we&apos;ve tried.
          </P>
          <Callout>
            <Strong>If you want to replicate or challenge this:</Strong> the underlying dataset is licensed to research partners under NDA. We&apos;ll review and publish rigorous independent replications against equivalent samples. <a href="mailto:joel@xpanddigital.io?subject=Layer%202%20research%20access" style={linkStyle}>Apply for research access →</a>
          </Callout>

          {/* LIMITATIONS */}
          <H2 id="limitations">Limitations — every one we know about</H2>
          <Bullets>
            <li>
              <Strong>LA bias in carry-over Study 1 sample.</Strong> Sydney/NYC/Chicago expansion only added local-services industries, not national SaaS or professional verticals.
            </li>
            <li>
              <Strong>Perplexity API skews toward editorial and own-site citations</Strong> — 0% Reddit citation rate. Consumer Perplexity surfaces Reddit far more visibly. Our findings apply to API behaviour, which is what 99% of GEO measurement actually uses.
            </li>
            <li>
              <Strong>ChatGPT API doesn&apos;t return source URLs.</Strong> The &ldquo;be in the threads ChatGPT cites&rdquo; claim is untestable from API data.
            </li>
            <li>
              <Strong>Reddit measurement is a SERP-based volume proxy.</Strong> Doesn&apos;t capture quality (subreddit authority, upvote weight, recency). A higher-quality measurement could find a stronger isolated effect.
            </li>
            <li>
              <Strong>Press mention count&apos;s negative coefficient is suspicious</Strong> — likely a measurement artifact from the press classifier&apos;s ~10–15% false-positive rate. Treat as inconclusive.
            </li>
            <li>
              <Strong>Correlation, not causation.</Strong> All findings are observational. Layer 3 (controlled intervention, May–July 2026) will provide causal evidence.
            </li>
            <li>
              <Strong>Some Sydney slots had ~80% enrichment coverage</Strong> due to one Apify batch failure mid-run. Affected slots are flagged in the dataset and disclosed to research-access partners.
            </li>
            <li>
              <Strong>Visibility scores are a point-in-time measurement</Strong> — April 2026, five specific AI models. Re-running this study quarterly is the plan.
            </li>
          </Bullets>

          {/* LAYER 3 */}
          <H2 id="layer-3">What&apos;s next: Layer 3 — the controlled intervention</H2>
          <P>
            Phase 2 is observational. Phase 3 is causal.
          </P>
          <Bullets>
            <li>
              <Strong>{layer3.participantsTarget.min}–{layer3.participantsTarget.max} businesses</Strong> · {layer3.durationDays}-day controlled intervention · launches {layer3.startWindow}.
            </li>
            <li>
              <Strong>Two dose groups.</Strong> Partial dose ({layer3.doseGroups[0].clients}): {layer3.doseGroups[0].scope.toLowerCase()}. Full dose ({layer3.doseGroups[1].clients}): {layer3.doseGroups[1].scope.toLowerCase()}.
            </li>
            <li>
              <Strong>Untouched control:</Strong> {layer3.controlGroup}.
            </li>
            <li>
              <Strong>Pre-registered success threshold:</Strong> {layer3.successRule}. Six metric deltas defined upfront. The bar is set before the experiment runs.
            </li>
            <li>
              <Strong>{layer3.publishCommitment}.</Strong> The first controlled before-and-after experiment in GEO.
            </li>
          </Bullets>

          <CTABlock />

          {/* ACCESS + CITE */}
          <H2 id="access">Run it on your brand · explore the data · cite the study</H2>
          <P>
            The findings, methodology, per-slot statistics, and individual brand lookup are public. The 2,729-row dataset is licensed to research partners under NDA — same posture as Pew, MIT Tech Review, Backlinko, GitHub Octoverse, and every other large-investment industry research program.
          </P>
          <AccessGrid />
          <P style={{ marginTop: 18, fontSize: 14, color: "var(--ink-tertiary)" }}>
            <Strong>Cite as:</Strong> House, J. (April 2026). <em>The Off-Page AI Visibility Index: A Q2 2026 Decomposition.</em> MentionLayer Research. <a href="https://mentionlayer.com/research/q2-2026-off-page-decomposition" style={linkStyle}>mentionlayer.com/research/q2-2026-off-page-decomposition</a> · Press / analyst inquiries: <a href="mailto:joel@xpanddigital.io" style={linkStyle}>joel@xpanddigital.io</a>.
          </P>

          {/* QUOTABLE */}
          <H2 id="quotable">Quotable summary</H2>
          <Bullets>
            {quotables.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </Bullets>

          <hr style={{ marginTop: 56, marginBottom: 32, border: 0, borderTop: `1px solid var(--accent-subtle)` }} />
          <P style={{ color: "var(--ink-tertiary)", fontSize: 14 }}>
            This is the second study in the AI Visibility Index research series.{" "}
            <a href="/research" style={linkStyle}>Study 1: AI Visibility Index, April 2026</a>. Study 3 (Layer 3 controlled intervention) ships Q3 2026.
          </P>
          <P style={{ color: "var(--ink-tertiary)", fontSize: 14, marginTop: 8 }}>
            — Joel House, founder of MentionLayer + Joel House Search Media · Forbes Agency Council · Sydney + Los Angeles, April 2026.
          </P>
        </div>
      </article>

      <MLFooter />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Typography + layout primitives
// ═══════════════════════════════════════════════════════════════════

const linkStyle: React.CSSProperties = {
  color: "var(--accent)",
  textDecoration: "underline",
  textDecorationColor: "rgba(61,43,224,0.3)",
  textUnderlineOffset: "3px",
};

const codeStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  fontSize: "0.9em",
  background: "var(--accent-subtle)",
  color: "var(--accent)",
  padding: "2px 6px",
  borderRadius: 4,
};

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[22px] sm:text-[26px] leading-[1.4]"
      style={{
        color: "var(--ink)",
        fontFamily: "'Instrument Serif', Georgia, serif",
        marginBottom: 28,
        fontStyle: "italic",
      }}
    >
      {children}
    </p>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p
      className="text-[17px] leading-[1.7]"
      style={{ color: "var(--ink-secondary)", marginBottom: 22, ...style }}
    >
      {children}
    </p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{children}</strong>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code style={codeStyle}>{children}</code>;
}

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-[28px] sm:text-[34px] leading-[1.15] tracking-tight"
      style={{
        color: "var(--ink)",
        marginTop: 56,
        marginBottom: 20,
        fontFamily: "'Instrument Serif', Georgia, serif",
        scrollMarginTop: 80,
      }}
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-[20px] sm:text-[22px] leading-[1.25] tracking-tight"
      style={{
        color: "var(--ink)",
        marginTop: 32,
        marginBottom: 14,
        fontFamily: "'Outfit', system-ui, sans-serif",
        fontWeight: 600,
      }}
    >
      {children}
    </h3>
  );
}

function Bullets({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className="text-[16.5px] leading-[1.65] space-y-2.5"
      style={{
        color: "var(--ink-secondary)",
        marginBottom: 24,
        listStyle: "none",
        paddingLeft: 0,
      }}
    >
      {wrapBullets(children, "circle")}
    </ul>
  );
}

function NumberedBullets({ children }: { children: React.ReactNode }) {
  return (
    <ol
      className="text-[16.5px] leading-[1.65] space-y-3"
      style={{
        color: "var(--ink-secondary)",
        marginBottom: 24,
        listStyle: "none",
        paddingLeft: 0,
        counterReset: "step",
      }}
    >
      {wrapBullets(children, "number")}
    </ol>
  );
}

function wrapBullets(children: React.ReactNode, kind: "circle" | "number") {
  const arr = Array.isArray(children) ? children : [children];
  return arr.map((child, i) => (
    <li
      key={i}
      style={{
        position: "relative",
        paddingLeft: kind === "number" ? 36 : 24,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: kind === "number" ? 0 : 12,
          width: kind === "number" ? 26 : 8,
          height: kind === "number" ? 26 : 8,
          borderRadius: "50%",
          background: kind === "number" ? "var(--accent)" : "var(--accent)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        {kind === "number" ? i + 1 : ""}
      </span>
      {(child as React.ReactElement)?.props?.children ?? child}
    </li>
  ));
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: "40px 0",
        padding: "28px 32px",
        background: "linear-gradient(135deg, var(--accent) 0%, #5443e8 100%)",
        borderRadius: 18,
        color: "#fff",
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: 24,
        lineHeight: 1.4,
        letterSpacing: "-0.01em",
        boxShadow: "0 10px 30px -10px rgba(61,43,224,0.4)",
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: 36,
          lineHeight: 0,
          marginTop: 8,
          marginBottom: 4,
          opacity: 0.5,
        }}
      >
        &ldquo;
      </span>
      {children}
    </div>
  );
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        margin: "20px 0 24px",
        padding: "12px 22px",
        borderLeft: "3px solid var(--accent)",
        background: "var(--accent-subtle)",
        borderRadius: "0 10px 10px 0",
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: 19,
        lineHeight: 1.5,
        color: "var(--ink)",
        fontStyle: "italic",
      }}
    >
      {children}
    </blockquote>
  );
}

function Callout({
  children,
  intent = "info",
}: {
  children: React.ReactNode;
  intent?: "info" | "warning";
}) {
  const isWarning = intent === "warning";
  return (
    <div
      style={{
        margin: "24px 0",
        padding: "18px 22px",
        background: isWarning ? "#fdf3f1" : "var(--accent-subtle)",
        borderLeft: `3px solid ${isWarning ? "var(--warm)" : "var(--accent)"}`,
        borderRadius: "0 12px 12px 0",
        fontSize: 16,
        lineHeight: 1.6,
        color: "var(--ink)",
      }}
    >
      {children}
    </div>
  );
}

function Takeaway({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: "20px 0 36px",
        padding: "16px 22px",
        background: "var(--surface-raised)",
        borderRadius: 12,
        border: "1px solid var(--accent-subtle)",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--accent)",
          background: "var(--accent-subtle)",
          padding: "4px 10px",
          borderRadius: 6,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        Takeaway
      </div>
      <div
        style={{
          fontSize: 15.5,
          lineHeight: 1.55,
          color: "var(--ink)",
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: "italic",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div
      className="overflow-x-auto my-6"
      style={{
        background: "var(--surface-raised)",
        borderRadius: 12,
        border: "1px solid var(--accent-subtle)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14.5,
        }}
      >
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--ink-tertiary)",
                  borderBottom: "1px solid var(--accent-subtle)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "12px 16px",
                    color: j === 0 ? "var(--ink)" : "var(--ink-secondary)",
                    borderBottom:
                      i === rows.length - 1
                        ? "none"
                        : "1px solid var(--accent-subtle)",
                    fontFamily: j > 0 && /^[\d+\-.,()k%a-zA-Z\s]+$/.test(cell) && /\d/.test(cell)
                      ? "'JetBrains Mono', ui-monospace, monospace"
                      : "inherit",
                    fontSize: j > 0 ? 13.5 : 14.5,
                    fontWeight: j === 0 ? 500 : 400,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="my-10"
      style={{
        marginLeft: "calc(50% - min(50vw, 540px))",
        marginRight: "calc(50% - min(50vw, 540px))",
        maxWidth: "min(100vw, 1080px)",
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Access grid — the 3 epic moves that replace the CSV download
// ═══════════════════════════════════════════════════════════════════

function AccessGrid() {
  const cards = [
    {
      eyebrow: "Free · 60 seconds",
      title: "Run your brand against the benchmarks",
      body: "Enter your domain. We measure your directory count, off-page composite, top vertical signal, and visible-vs-invisible position — live, against the 2,729-business benchmark.",
      cta: "Run free audit →",
      href: "/free-audit",
      primary: true,
    },
    {
      eyebrow: "Email · 2 minutes",
      title: "Explore the data — by industry × market",
      body: "Pick your slot. See the top 5 predictors, addressable share of citations, the top cited domains, and the visible-vs-invisible profile for that exact slot. Browse-only — no bulk export.",
      cta: "Open the explorer →",
      href: "/research/explore",
      primary: false,
    },
    {
      eyebrow: "NDA · for researchers",
      title: "Apply for full dataset access",
      body: "Academic researchers, press / analysts, Layer 3 trial participants, and paying MentionLayer customers can request access to the underlying 2,729-row dataset under NDA. We review every request.",
      cta: "Apply for access →",
      href: "mailto:joel@xpanddigital.io?subject=Study%202%20research%20access%20request&body=Who%20you%20are%3A%0AHow%20you%27ll%20use%20it%3A%0AWhich%20slots%20you%20need%3A",
      primary: false,
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4 my-6">
      {cards.map((c) => (
        <a
          key={c.title}
          href={c.href}
          style={{
            display: "flex",
            flexDirection: "column",
            background: c.primary ? "var(--accent)" : "var(--surface-raised)",
            color: c.primary ? "#fff" : "var(--ink)",
            borderRadius: 14,
            border: c.primary ? "none" : "1px solid var(--accent-subtle)",
            padding: "22px 22px 20px",
            textDecoration: "none",
            transition: "transform 0.15s ease",
            boxShadow: c.primary
              ? "0 4px 16px -4px rgba(61,43,224,0.3)"
              : "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: c.primary ? "rgba(255,255,255,0.8)" : "var(--accent)",
              marginBottom: 10,
            }}
          >
            {c.eyebrow}
          </div>
          <h4
            style={{
              fontSize: 17,
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: 10,
              color: c.primary ? "#fff" : "var(--ink)",
              fontFamily: "'Outfit', system-ui, sans-serif",
            }}
          >
            {c.title}
          </h4>
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.55,
              color: c.primary ? "rgba(255,255,255,0.9)" : "var(--ink-secondary)",
              marginBottom: 14,
              flex: 1,
            }}
          >
            {c.body}
          </p>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: c.primary ? "#fff" : "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {c.cta}
          </div>
        </a>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  FAQ component (collapsible-style without JS for SSR-friendliness)
// ═══════════════════════════════════════════════════════════════════

function FAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3 my-6">
      {items.map((item, i) => (
        <details
          key={i}
          style={{
            background: "var(--surface-raised)",
            borderRadius: 12,
            border: "1px solid var(--accent-subtle)",
            padding: "18px 22px",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--ink)",
              listStyle: "none",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--accent)",
                background: "var(--accent-subtle)",
                padding: "3px 8px",
                borderRadius: 6,
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              Q{i + 1}
            </span>
            <span style={{ flex: 1 }}>{item.q}</span>
          </summary>
          <div
            style={{
              marginTop: 14,
              paddingLeft: 44,
              fontSize: 15.5,
              lineHeight: 1.65,
              color: "var(--ink-secondary)",
            }}
          >
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Playbook cards — what to do based on DA tier and vertical
// ═══════════════════════════════════════════════════════════════════

function PlaybookCards() {
  const cards = [
    {
      title: "If your DA is in the top quartile (54+)",
      body: "You are leaving roughly +16 visibility points on the table if your directory and off-page presence stack is below median. This is the highest-ROI work you can do this quarter. Audit the 12 platforms. Fix gaps in order of vertical relevance.",
      cta: "Run a free audit",
      href: "/free-audit",
    },
    {
      title: "If your DA is mid-tier (Q2–Q3)",
      body: "The directory lift is modest (~+1.4 in Q3). Your bigger lever is whichever specific signals dominate your vertical-market combination. NYC accounting? Quora. LA real estate? Reddit. NYC plumbing? Directories. Look up your slot in the per-industry data.",
      cta: "Check your slot",
      href: "/free-audit",
    },
    {
      title: "If your DA is low (Q1)",
      body: "The off-page stack helps a little (+2.1 in Q1) but it does not substitute for the underlying authority. You need both. Be patient on DA, work the stack in parallel, and don't pay anyone telling you off-page-alone fixes invisibility at low DA. It does not.",
      cta: "Read the strategy guide",
      href: "/blog",
    },
    {
      title: "Vertical in the 0–5% addressable bracket",
      body: "Med spa, Sydney professional services, accounting outside NYC, ecommerce DTC, boutique hospitality, insurance, digital marketing. Off-page seeding is low-leverage. Your dollars belong in editorial PR, owned content, and brand search behaviour. Diagnose first.",
      cta: "Talk to us",
      href: "/services",
    },
    {
      title: "Vertical in the 20%+ addressable bracket",
      body: "SaaS CRM/PM, home services, personal-finance apps, real estate. Off-page seeding is the single highest-leverage channel available to you. Build the stack across 8–12 platforms simultaneously. This is where MentionLayer was designed to operate.",
      cta: "See how MentionLayer works",
      href: "/how-it-works",
    },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-4 my-6">
      {cards.map((c) => (
        <div
          key={c.title}
          style={{
            background: "var(--surface-raised)",
            borderRadius: 14,
            border: "1px solid var(--accent-subtle)",
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h4
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 10,
              fontFamily: "'Outfit', system-ui, sans-serif",
            }}
          >
            {c.title}
          </h4>
          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--ink-secondary)",
              marginBottom: 16,
              flex: 1,
            }}
          >
            {c.body}
          </p>
          <Link
            href={c.href}
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              alignSelf: "flex-start",
            }}
          >
            {c.cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Layer 3 / Free audit CTA block
// ═══════════════════════════════════════════════════════════════════

function CTABlock() {
  return (
    <div
      style={{
        margin: "40px 0",
        padding: "32px",
        background: "linear-gradient(135deg, #1a1a2e 0%, #2a2547 100%)",
        borderRadius: 18,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(122,109,240,0.3) 0%, transparent 70%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#a59cf2",
            marginBottom: 10,
          }}
        >
          Apply to participate · Layer 3 · 25–30 spots
        </div>
        <h3
          style={{
            fontSize: 28,
            lineHeight: 1.2,
            fontFamily: "'Instrument Serif', Georgia, serif",
            marginBottom: 12,
          }}
        >
          Want causal proof for your business?
        </h3>
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.85)",
            marginBottom: 20,
            maxWidth: 580,
          }}
        >
          We&apos;re running a 60-day controlled intervention with 25–30 businesses across the high-leverage verticals. Pre-registered success thresholds. Before/after data. Result published either way. If you&apos;re in SaaS, home services, real estate, personal-finance apps, or personal injury law — apply.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/free-audit"
            className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center gap-2 transition-transform hover:-translate-y-px"
            style={{
              background: "#fff",
              color: "var(--accent)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            Get your free baseline audit
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="mailto:joel@xpanddigital.io?subject=Layer%203%20participation"
            className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center gap-2"
            style={{
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
            }}
          >
            Email Joel directly
          </a>
        </div>
      </div>
    </div>
  );
}
