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
    <>
      <WebPageJsonLd
        title="For Agencies | MentionLayer"
        description="Add AI visibility as a service offering. MentionLayer gives agencies measurable AI visibility scores, white-label reports, and a multi-client dashboard."
        url="/use-cases/agencies"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Use Cases", url: "/use-cases/agencies" }, { name: "For Agencies", url: "/use-cases/agencies" }]} />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <p
            className="text-[13px] font-semibold tracking-wide uppercase"
            style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
          >
            For Agencies
          </p>
          <h1
            className="mt-4 max-w-3xl text-[36px] sm:text-[44px] leading-[1.08] font-bold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            The AI Visibility Service Your Clients Are About to Ask For
          </h1>
          <p
            className="mt-6 max-w-2xl text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Your clients&apos; competitors are getting recommended by ChatGPT,
            Perplexity, and Gemini. Your clients are invisible. MentionLayer
            gives you the tools to fix that — and a new revenue stream while
            you&apos;re at it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-lg text-[15px] font-semibold text-white transition-colors"
              style={{
                background: "var(--accent)",
                boxShadow: "0 2px 8px rgba(61,43,224,0.25)",
              }}
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
              className="inline-flex items-center gap-2 h-12 px-7 rounded-lg text-[15px] font-semibold transition-colors"
              style={{
                color: "var(--ink-secondary)",
                border: "1px solid rgba(26,26,46,0.12)",
              }}
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={{ background: "var(--surface-raised)" }} className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="text-[36px] sm:text-[44px] leading-[1.08] font-bold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              AI Is Changing Search. Your Service Offering Needs to Change Too.
            </h2>
            <p
              className="mt-6 text-[17px] leading-[1.65]"
              style={{ color: "var(--ink-secondary)" }}
            >
              When someone asks ChatGPT &ldquo;What&apos;s the best accounting
              firm in Sydney?&rdquo; — your client either shows up, or their
              competitor does. There is no page two. There is no &ldquo;we&apos;ll
              rank eventually.&rdquo; The AI either knows about them or it
              doesn&apos;t.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {/* Zero Visibility */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(220,38,38,0.04)",
                border: "1px solid rgba(220,38,38,0.10)",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(220,38,38,0.08)" }}
              >
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
                    stroke="#dc2626"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 7l6 6M13 7l-6 6"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3
                className="mt-4 text-[17px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Zero Visibility
              </h3>
              <p
                className="mt-2 text-[15px] leading-[1.65]"
                style={{ color: "var(--ink-secondary)" }}
              >
                Your client has 0 mentions in 142 high-authority threads where
                their competitors appear 47 times. AI models train on those
                threads. Your client doesn&apos;t exist to them.
              </p>
            </div>
            {/* Competitors Move Fast */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(217,119,6,0.04)",
                border: "1px solid rgba(217,119,6,0.10)",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(217,119,6,0.08)" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 3v7l4 4"
                    stroke="#d97706"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="#d97706"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3
                className="mt-4 text-[17px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Competitors Move Fast
              </h3>
              <p
                className="mt-2 text-[15px] leading-[1.65]"
                style={{ color: "var(--ink-secondary)" }}
              >
                DistroKid gets mentioned in 70% of AI responses about music
                distribution. TuneCore in 55%. Your client? 5%. By the time
                traditional SEO catches up, the gap is permanent.
              </p>
            </div>
            {/* Clients Will Ask */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(61,43,224,0.04)",
                border: "1px solid rgba(61,43,224,0.10)",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(61,43,224,0.08)" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 2a8 8 0 100 16 8 8 0 000-16z"
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 6v4M10 14h.01"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3
                className="mt-4 text-[17px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Clients Will Ask
              </h3>
              <p
                className="mt-2 text-[15px] leading-[1.65]"
                style={{ color: "var(--ink-secondary)" }}
              >
                It&apos;s not a question of if. Your clients will ask why they
                don&apos;t appear in AI answers. You can either have a service
                ready, or watch another agency win the conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution / Benefits */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <p
            className="text-[13px] font-semibold tracking-wide uppercase"
            style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
          >
            Built for Agencies
          </p>
          <h2
            className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] font-bold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Everything You Need to Deliver AI Visibility at Scale
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:gap-16">
            {/* Benefit 1 — New Revenue Stream */}
            <div className="flex gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(61,43,224,0.07)" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  New Revenue Stream
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.65]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  Add AI visibility as a standalone service or bundle it with
                  existing SEO packages. Most agencies charge $2,000-5,000/month
                  per client for AI visibility management. Your clients need this
                  whether they know it yet or not.
                </p>
              </div>
            </div>
            {/* Benefit 2 — Measurable ROI */}
            <div className="flex gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(5,150,105,0.07)" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 3v18h18"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 16l4-6 4 4 5-8"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  Measurable ROI With Before/After Scores
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.65]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  Run an AI Visibility Audit on day one. Get a composite score
                  out of 100 across five pillars: citations, AI presence,
                  entities, reviews, and press. Re-run it monthly. Show the
                  client their score went from 23 to 67. That&apos;s the
                  retention conversation you want to have.
                </p>
              </div>
            </div>
            {/* Benefit 3 — Multi-Client Dashboard */}
            <div className="flex gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(61,43,224,0.07)" }}
              >
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
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                  <rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  Multi-Client Dashboard
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.65]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  Manage 5 clients or 50 from a single dashboard. Switch between
                  clients in one click. Every thread, every response, every
                  audit is isolated per client. Your team sees only what they
                  need to see.
                </p>
              </div>
            </div>
            {/* Benefit 4 — White-Label Reports */}
            <div className="flex gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(5,150,105,0.07)" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M9 12h6M9 16h6M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 2v7h7"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  White-Label Reports
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.65]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  Export PDF reports with your agency branding. Each report
                  includes the AI Visibility Score, pillar breakdowns,
                  competitor comparison, and a prioritized action plan. Hand it
                  to a client and it looks like you built the whole thing.
                </p>
              </div>
            </div>
            {/* Benefit 5 — First-Mover Advantage */}
            <div className="flex gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(61,43,224,0.07)" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M22 11.08V12a10 10 0 11-5.93-9.14"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 4L12 14.01l-3-3"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  First-Mover Advantage
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.65]"
                  style={{ color: "var(--ink-secondary)" }}
                >
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
      <section style={{ background: "var(--surface-raised)" }} className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2
            className="text-[36px] sm:text-[44px] leading-[1.08] font-bold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Three Ways Agencies Use MentionLayer
          </h2>
          <p
            className="mt-4 max-w-2xl text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Whether you&apos;re onboarding a new client, running monthly
            campaigns, or pitching a prospect — the workflow fits.
          </p>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Scenario 1 */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: "white",
                border: "1px solid rgba(26,26,46,0.06)",
                boxShadow: "0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)",
              }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "var(--accent)" }}
              >
                1
              </div>
              <h3
                className="mt-6 text-[17px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Client Onboarding: Run the Audit
              </h3>
              <p
                className="mt-3 text-[15px] leading-[1.65]"
                style={{ color: "var(--ink-secondary)" }}
              >
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
            <div
              className="rounded-2xl p-8"
              style={{
                background: "white",
                border: "1px solid rgba(26,26,46,0.06)",
                boxShadow: "0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)",
              }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "var(--accent)" }}
              >
                2
              </div>
              <h3
                className="mt-6 text-[17px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Monthly Campaigns: Discover, Generate, Post
              </h3>
              <p
                className="mt-3 text-[15px] leading-[1.65]"
                style={{ color: "var(--ink-secondary)" }}
              >
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
            <div
              className="rounded-2xl p-8"
              style={{
                background: "white",
                border: "1px solid rgba(26,26,46,0.06)",
                boxShadow: "0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)",
              }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "var(--accent)" }}
              >
                3
              </div>
              <h3
                className="mt-6 text-[17px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Prospect Pitches: The Audit as a Sales Weapon
              </h3>
              <p
                className="mt-3 text-[15px] leading-[1.65]"
                style={{ color: "var(--ink-secondary)" }}
              >
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
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2
            className="text-center text-[36px] sm:text-[44px] leading-[1.08] font-bold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Agencies Using MentionLayer
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl text-center text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Early-access agencies are already adding AI visibility to their
            service offerings.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--accent-subtle)",
                border: "1px solid rgba(61,43,224,0.08)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: "rgba(61,43,224,0.12)",
                    color: "var(--accent)",
                  }}
                >
                  ML
                </div>
                <div>
                  <p
                    className="text-[15px] font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    MentionLayer
                  </p>
                  <p
                    className="text-[13px]"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    AI Visibility Platform
                  </p>
                </div>
              </div>
              <p
                className="mt-4 text-[15px] italic leading-[1.65]"
                style={{ color: "var(--ink-secondary)" }}
              >
                &ldquo;We took a client from an AI Visibility Score of 12 to 58
                in 90 days. They went from zero AI mentions to appearing in 40%
                of relevant ChatGPT responses. That&apos;s the kind of result
                that renews contracts.&rdquo;
              </p>
            </div>
            <div
              className="rounded-2xl p-6 flex items-center justify-center"
              style={{
                background: "rgba(61,43,224,0.02)",
                border: "1px dashed rgba(61,43,224,0.15)",
              }}
            >
              <p
                className="text-center text-[15px]"
                style={{ color: "var(--ink-tertiary)" }}
              >
                Your agency could be here.
                <br />
                <Link
                  href="/signup"
                  className="mt-2 inline-block font-semibold hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Join the early access program
                </Link>
              </p>
            </div>
            <div
              className="rounded-2xl p-6 flex items-center justify-center"
              style={{
                background: "rgba(61,43,224,0.02)",
                border: "1px dashed rgba(61,43,224,0.15)",
              }}
            >
              <p
                className="text-center text-[15px]"
                style={{ color: "var(--ink-tertiary)" }}
              >
                Your agency could be here.
                <br />
                <Link
                  href="/signup"
                  className="mt-2 inline-block font-semibold hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Join the early access program
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div
            className="rounded-2xl px-8 py-16 text-center sm:px-16"
            style={{ background: "var(--accent-subtle)" }}
          >
            <h2
              className="text-[36px] sm:text-[44px] leading-[1.08] font-bold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Start Offering AI Visibility Services This Week
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-[17px] leading-[1.65]"
              style={{ color: "var(--ink-secondary)" }}
            >
              Add your first client, run an audit, and see exactly what
              MentionLayer can do for your agency. No long onboarding. No
              complex setup. Add keywords, run the scan, deliver results.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-lg text-[15px] font-semibold text-white transition-colors"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 2px 8px rgba(61,43,224,0.25)",
                }}
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
                className="inline-flex items-center gap-2 h-12 px-7 rounded-lg text-[15px] font-semibold transition-colors"
                style={{
                  color: "var(--ink-secondary)",
                  border: "1px solid rgba(26,26,46,0.12)",
                }}
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
