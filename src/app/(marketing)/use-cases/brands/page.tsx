import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "For Brands | MentionLayer — Get Recommended by ChatGPT, Perplexity & Gemini",
  description:
    "Find out if AI recommends your brand. MentionLayer helps brands get cited in Reddit threads, recommended by ChatGPT, and tracked across all AI models.",
};

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.167 10h11.666M10.833 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 7l-8.5 8.5-5-5L2 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 7h6v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BrandsUseCasePage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#6C5CE7]/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#00D2D3]">
            For Brands
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Is AI Recommending Your Competitors{" "}
            <span className="text-[#6C5CE7]">Instead of You?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            When someone asks ChatGPT, Perplexity, or Gemini for the best
            option in your category, your brand either shows up or it
            doesn&apos;t. Right now, most brands have no idea which one it is.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[#6C5CE7] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5A4BD1]"
            >
              Run a Free AI Visibility Audit
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* The Shift */}
      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Search is splitting in two. Your brand needs to show up in both.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Google still matters. But a growing number of buying decisions now
              start with an AI conversation, not a search bar.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {/* Old world */}
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Traditional Search
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Google ranks pages
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                10 blue links. Your SEO team optimises meta tags, builds
                backlinks, and fights for page one. You&apos;ve been doing this
                for years.
              </p>
              <div className="mt-6 space-y-3 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 font-mono text-xs text-muted-foreground/60">
                    #1
                  </span>
                  <span>Your competitor&apos;s homepage</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 font-mono text-xs text-muted-foreground/60">
                    #2
                  </span>
                  <span>Reddit thread comparing options</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 font-mono text-xs text-muted-foreground/60">
                    #3
                  </span>
                  <span>Quora answer from 2024</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <span className="shrink-0 font-mono text-xs text-[#6C5CE7]">
                    #4
                  </span>
                  <span className="font-medium">Your homepage</span>
                </div>
              </div>
            </div>

            {/* New world */}
            <div className="rounded-xl border border-[#6C5CE7]/30 bg-card p-8">
              <div className="mb-4 inline-flex rounded-lg bg-[#6C5CE7]/10 px-3 py-1 text-xs font-medium text-[#6C5CE7]">
                AI-Powered Search
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                AI recommends brands
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                One answer. No scrolling. The AI picks who to recommend based on
                what it&apos;s learned from forums, reviews, and news. There is
                no page two.
              </p>
              <div className="mt-6 space-y-3 rounded-lg bg-[#6C5CE7]/5 p-4">
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;What&apos;s the best project management tool for remote
                  teams?&rdquo;
                </p>
                <div className="mt-3 rounded-lg border border-border bg-background p-3">
                  <p className="text-sm text-foreground">
                    Based on community discussions and user reviews, the top
                    options are{" "}
                    <span className="font-semibold text-[#00D2D3]">
                      Competitor A
                    </span>
                    ,{" "}
                    <span className="font-semibold text-[#00D2D3]">
                      Competitor B
                    </span>
                    , and{" "}
                    <span className="font-semibold text-[#00D2D3]">
                      Competitor C
                    </span>
                    .
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Your brand? Not mentioned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What happens when AI ignores you */}
      <section className="border-t border-border bg-card px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Every day AI doesn&apos;t recommend you, your competitor gets
              stronger
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              AI models learn from the same sources over and over. When your
              competitor is mentioned in 47 high-authority Reddit threads and you
              are in zero, that gap compounds.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <svg
                  className="h-6 w-6 text-red-400"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Invisible pipeline leak
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Potential customers ask AI for recommendations, get your
                competitor&apos;s name, and never google you. You don&apos;t
                even know the lead existed.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <svg
                  className="h-6 w-6 text-amber-400"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 17l5-5-5-5M6 17l5-5-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Compounding advantage
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                AI models reinforce what they already know. The more your
                competitor is cited across Reddit, Quora, and news sites, the
                more likely AI is to recommend them next time.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C5CE7]/10">
                <svg
                  className="h-6 w-6 text-[#6C5CE7]"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                The window is closing
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Right now most brands haven&apos;t figured this out. That
                won&apos;t last. The brands that build AI visibility now will be
                the ones AI recommends for years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How MentionLayer fixes it */}
      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Get your brand into the conversations AI is already reading
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              MentionLayer finds the exact threads and sources that AI models
              pull from, then helps you place your brand in them authentically.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10">
                <SearchIcon className="h-5 w-5 text-[#6C5CE7]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  1. Discover where AI looks
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We scan Google SERPs and probe ChatGPT, Perplexity, and Gemini
                  with your keywords. We find the Reddit threads, Quora answers,
                  and forum posts these models actually cite. Not guesswork
                  &mdash; data.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10">
                <TargetIcon className="h-5 w-5 text-[#6C5CE7]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  2. Seed authentic citations
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  For every high-value thread, MentionLayer generates three
                  response variants that read like a real community member. No
                  spam. No marketing speak. Genuine, helpful contributions that
                  naturally mention your brand.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10">
                <ShieldIcon className="h-5 w-5 text-[#6C5CE7]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  3. Build multi-signal authority
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  AI models don&apos;t trust a single source. MentionLayer
                  strengthens your presence across five pillars: forum
                  citations, AI model mentions, entity consistency, reviews, and
                  earned press coverage.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10">
                <TrendUpIcon className="h-5 w-5 text-[#6C5CE7]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  4. Measure share of model
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track how often AI recommends your brand vs. competitors
                  across every major model. Share of model is the new share of
                  voice &mdash; and MentionLayer makes it measurable for the
                  first time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The proof: audit score trajectory */}
      <section className="border-t border-border bg-card px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Measurable results, not promises
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every engagement starts with a baseline AI Visibility Audit. After
              90 days of targeted work, the numbers tell the story.
            </p>
          </div>

          {/* Score trajectory visualization */}
          <div className="mt-16 rounded-xl border border-border bg-background p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  AI Visibility Score
                </p>
                <p className="text-xs text-muted-foreground">
                  Example: SaaS brand, B2B category
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">Day 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#6C5CE7]" />
                  <span className="text-xs text-muted-foreground">Day 90</span>
                </div>
              </div>
            </div>

            {/* Before / After scores */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Baseline Audit
                </p>
                <p className="mt-3 text-5xl font-bold text-muted-foreground/50">
                  28
                </p>
                <p className="text-sm text-muted-foreground">/100</p>
                <div className="mx-auto mt-4 grid max-w-xs grid-cols-5 gap-2 text-center text-xs">
                  <div>
                    <p className="font-mono text-red-400">12</p>
                    <p className="text-muted-foreground">Citations</p>
                  </div>
                  <div>
                    <p className="font-mono text-red-400">5</p>
                    <p className="text-muted-foreground">AI</p>
                  </div>
                  <div>
                    <p className="font-mono text-amber-400">42</p>
                    <p className="text-muted-foreground">Entity</p>
                  </div>
                  <div>
                    <p className="font-mono text-amber-400">55</p>
                    <p className="text-muted-foreground">Reviews</p>
                  </div>
                  <div>
                    <p className="font-mono text-red-400">18</p>
                    <p className="text-muted-foreground">Press</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#6C5CE7]/30 bg-card p-6 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-[#00D2D3]">
                  After 90 Days
                </p>
                <p className="mt-3 text-5xl font-bold text-[#6C5CE7]">74</p>
                <p className="text-sm text-muted-foreground">/100</p>
                <div className="mx-auto mt-4 grid max-w-xs grid-cols-5 gap-2 text-center text-xs">
                  <div>
                    <p className="font-mono text-emerald-400">71</p>
                    <p className="text-muted-foreground">Citations</p>
                  </div>
                  <div>
                    <p className="font-mono text-emerald-400">68</p>
                    <p className="text-muted-foreground">AI</p>
                  </div>
                  <div>
                    <p className="font-mono text-emerald-400">82</p>
                    <p className="text-muted-foreground">Entity</p>
                  </div>
                  <div>
                    <p className="font-mono text-emerald-400">73</p>
                    <p className="text-muted-foreground">Reviews</p>
                  </div>
                  <div>
                    <p className="font-mono text-amber-400">58</p>
                    <p className="text-muted-foreground">Press</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What changed */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-[#00D2D3]">142</p>
                <p className="text-xs text-muted-foreground">
                  threads discovered
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-[#00D2D3]">38</p>
                <p className="text-xs text-muted-foreground">
                  citations placed
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-[#00D2D3]">5% &rarr; 68%</p>
                <p className="text-xs text-muted-foreground">
                  share of model
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-[#00D2D3]">+164%</p>
                <p className="text-xs text-muted-foreground">
                  score improvement
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything a brand needs to own AI recommendations
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              "AI Visibility Audit across 5 pillars with composite score",
              "Automated discovery of high-authority threads in your category",
              "Three response variants per thread: casual, expert, and story",
              "Share of model tracking across ChatGPT, Perplexity, Gemini, and Claude",
              "Competitor monitoring so you know exactly who AI recommends instead",
              "Prioritised action plan ranked by impact and effort",
              "Entity consistency checks across Google, LinkedIn, directories",
              "Monthly progress reports with before/after score comparison",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3">
                <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#00D2D3]" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find out if AI recommends you
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Run a free AI Visibility Audit. In under five minutes, you&apos;ll
            know your score, see where your competitors appear, and get a
            prioritised action plan to close the gap.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[#6C5CE7] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#5A4BD1]"
            >
              Run Your Free Audit
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/use-cases/agencies"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Are you an agency? See the agency use case
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required. Audit takes under 5 minutes.
          </p>
        </div>
      </section>
    </div>
  );
}
