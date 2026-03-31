import type { Metadata } from "next";
import Link from "next/link";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "For Agencies — Add AI Visibility Services",
  description:
    "Add AI visibility to your agency's services. Measurable visibility scores, white-label client reports, multi-client dashboard, and automated citation seeding.",
  openGraph: {
    title: "For Agencies — Add AI Visibility Services | MentionLayer",
    description:
      "Add AI visibility to your service offering with measurable scores, white-label reports, and multi-client management.",
    images: ["/api/og?title=For+Agencies"],
  },
};

export default function AgenciesUseCasePage() {
  return (
    <div className="bg-background text-foreground">
      <WebPageJsonLd
        title="For Agencies | MentionLayer"
        description="Add AI visibility as a service offering. MentionLayer gives agencies measurable AI visibility scores, white-label reports, and a multi-client dashboard."
        url="/use-cases/agencies"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Use Cases", url: "/use-cases/agencies" }, { name: "For Agencies", url: "/use-cases/agencies" }]} />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C5CE7]/10 via-transparent to-[#00D2D3]/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="text-sm font-medium uppercase tracking-widest text-[#6C5CE7]">
            For Agencies
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The AI Visibility Service Your Clients Are About to Ask For
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Your clients&apos; competitors are getting recommended by ChatGPT,
            Perplexity, and Gemini. Your clients are invisible. MentionLayer
            gives you the tools to fix that — and a new revenue stream while
            you&apos;re at it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-[#6C5CE7] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
            >
              Start Offering AI Visibility
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="ml-1"
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI Is Changing Search. Your Service Offering Needs to Change Too.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              When someone asks ChatGPT &ldquo;What&apos;s the best accounting
              firm in Sydney?&rdquo; — your client either shows up, or their
              competitor does. There is no page two. There is no &ldquo;we&apos;ll
              rank eventually.&rdquo; The AI either knows about them or it
              doesn&apos;t.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="#EF4444"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 7l6 6M13 7l-6 6"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Zero Visibility</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your client has 0 mentions in 142 high-authority threads where
                their competitors appear 47 times. AI models train on those
                threads. Your client doesn&apos;t exist to them.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 3v7l4 4"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="#F59E0B"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Competitors Move Fast</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                DistroKid gets mentioned in 70% of AI responses about music
                distribution. TuneCore in 55%. Your client? 5%. By the time
                traditional SEO catches up, the gap is permanent.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#6C5CE7]/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 2a8 8 0 100 16 8 8 0 000-16z"
                    stroke="#6C5CE7"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 6v4M10 14h.01"
                    stroke="#6C5CE7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Clients Will Ask</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                It&apos;s not a question of if. Your clients will ask why they
                don&apos;t appear in AI answers. You can either have a service
                ready, or watch another agency win the conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution / Benefits */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-[#00D2D3]">
            Built for Agencies
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Deliver AI Visibility at Scale
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:gap-16">
            {/* Benefit 1 */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    stroke="#6C5CE7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">New Revenue Stream</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Add AI visibility as a standalone service or bundle it with
                  existing SEO packages. Most agencies charge $2,000-5,000/month
                  per client for AI visibility management. Your clients need this
                  whether they know it yet or not.
                </p>
              </div>
            </div>
            {/* Benefit 2 */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#00D2D3]/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 3v18h18"
                    stroke="#00D2D3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 16l4-6 4 4 5-8"
                    stroke="#00D2D3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Measurable ROI With Before/After Scores
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Run an AI Visibility Audit on day one. Get a composite score
                  out of 100 across five pillars: citations, AI presence,
                  entities, reviews, and press. Re-run it monthly. Show the
                  client their score went from 23 to 67. That&apos;s the
                  retention conversation you want to have.
                </p>
              </div>
            </div>
            {/* Benefit 3 */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="#6C5CE7"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="#6C5CE7"
                    strokeWidth="2"
                  />
                  <rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="#6C5CE7"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="#6C5CE7"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Multi-Client Dashboard
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Manage 5 clients or 50 from a single dashboard. Switch between
                  clients in one click. Every thread, every response, every
                  audit is isolated per client. Your team sees only what they
                  need to see.
                </p>
              </div>
            </div>
            {/* Benefit 4 */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#00D2D3]/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M9 12h6M9 16h6M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z"
                    stroke="#00D2D3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 2v7h7"
                    stroke="#00D2D3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">White-Label Reports</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Export PDF reports with your agency branding. Each report
                  includes the AI Visibility Score, pillar breakdowns,
                  competitor comparison, and a prioritized action plan. Hand it
                  to a client and it looks like you built the whole thing.
                </p>
              </div>
            </div>
            {/* Benefit 5 */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M22 11.08V12a10 10 0 11-5.93-9.14"
                    stroke="#6C5CE7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 4L12 14.01l-3-3"
                    stroke="#6C5CE7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  First-Mover Advantage
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Most agencies are still figuring out what AI visibility even
                  means. You can be selling it next week. The agencies that move
                  first on this will own the category. The ones that wait will be
                  playing catch-up for years.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Agencies Use It */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Three Ways Agencies Use MentionLayer
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Whether you&apos;re onboarding a new client, running monthly
            campaigns, or pitching a prospect — the workflow fits.
          </p>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Scenario 1 */}
            <div className="rounded-lg border border-border bg-card p-8">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C5CE7] text-sm font-bold text-white">
                1
              </div>
              <h3 className="mt-6 text-lg font-semibold">
                Client Onboarding: Run the Audit
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                New client signs up. You add their brand brief and 20 target
                keywords. Hit &ldquo;Run Audit.&rdquo; Five minutes later you
                have a composite AI Visibility Score, five pillar breakdowns,
                and a prioritized action plan. The client sees exactly where
                they stand — usually somewhere between alarming and
                catastrophic. That baseline becomes your measuring stick for the
                entire engagement.
              </p>
            </div>
            {/* Scenario 2 */}
            <div className="rounded-lg border border-border bg-card p-8">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C5CE7] text-sm font-bold text-white">
                2
              </div>
              <h3 className="mt-6 text-lg font-semibold">
                Monthly Campaigns: Discover, Generate, Post
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The discovery engine scans Google SERPs and probes AI models
                twice a week. It surfaces high-authority Reddit, Quora, and
                Facebook threads where your client should be mentioned but
                isn&apos;t. You click &ldquo;Generate Replies,&rdquo; get three
                response variants written by AI that sound like a real person,
                pick the best one, and post it. 20 threads a month. Within 90
                days, the AI models start picking up the signal.
              </p>
            </div>
            {/* Scenario 3 */}
            <div className="rounded-lg border border-border bg-card p-8">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C5CE7] text-sm font-bold text-white">
                3
              </div>
              <h3 className="mt-6 text-lg font-semibold">
                Prospect Pitches: The Audit as a Sales Weapon
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Run a free audit for a prospect before the sales call. Walk in
                with a PDF that says their AI Visibility Score is 19/100, their
                top competitor scores 71, and there are 87 high-authority threads
                where they have zero presence. The action plan maps directly to
                your services. You&apos;re not selling anymore — you&apos;re
                showing them a problem they didn&apos;t know they had, with the
                exact playbook to fix it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Agencies Using MentionLayer
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Early-access agencies are already adding AI visibility to their
            service offerings.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6C5CE7]/20 text-sm font-bold text-[#6C5CE7]">
                  ML
                </div>
                <div>
                  <p className="text-sm font-semibold">MentionLayer</p>
                  <p className="text-xs text-muted-foreground">
                    AI Visibility Platform
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm italic leading-relaxed text-muted-foreground">
                &ldquo;We took a client from an AI Visibility Score of 12 to 58
                in 90 days. They went from zero AI mentions to appearing in 40%
                of relevant ChatGPT responses. That&apos;s the kind of result
                that renews contracts.&rdquo;
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-6">
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-muted-foreground">
                  Your agency could be here.
                  <br />
                  <Link
                    href="/signup"
                    className="mt-2 inline-block text-[#6C5CE7] hover:underline"
                  >
                    Join the early access program
                  </Link>
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-6">
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-muted-foreground">
                  Your agency could be here.
                  <br />
                  <Link
                    href="/signup"
                    className="mt-2 inline-block text-[#6C5CE7] hover:underline"
                  >
                    Join the early access program
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C5CE7]/10 via-transparent to-[#00D2D3]/10" />
            <div className="relative px-8 py-16 text-center sm:px-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Start Offering AI Visibility Services This Week
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Add your first client, run an audit, and see exactly what
                MentionLayer can do for your agency. No long onboarding. No
                complex setup. Add keywords, run the scan, deliver results.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-md bg-[#6C5CE7] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
                >
                  Start Free
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
