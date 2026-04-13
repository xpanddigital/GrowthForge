import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { BrowserFrame } from "@/components/marketing/browser-frame";
import { MLNav } from "@/components/marketing/ml-nav";
import { MLFooter } from "@/components/marketing/ml-footer";
import { ServiceJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Done-for-You AI Visibility Services — MentionLayer",
  description:
    "Let our team run your AI visibility campaigns. Citation seeding, press, entity optimization, AI monitoring — fully managed. Results in 60 days.",
  openGraph: {
    title: "Done-for-You Services | MentionLayer",
    description:
      "Fully managed AI visibility for brands and agencies. We run MentionLayer on your behalf.",
    images: ["/api/og?title=Done-for-You+Services"],
  },
};

const faqs = [
  {
    q: "What's the difference between done-for-you and the SaaS platform?",
    a: "Our SaaS plans give you the tools to run GEO campaigns yourself. Done-for-you means our team operates those tools on your behalf — you get monthly reports and rising AI recommendations without lifting a finger.",
  },
  {
    q: "How quickly will I see results?",
    a: "Most clients see their first AI recommendation within 60 days. Citation seeding impact typically shows in AI model responses within 4-6 weeks. Your GEO Tracker dashboard updates weekly so you can watch the progress in real-time.",
  },
  {
    q: "Do I need to provide content or responses?",
    a: "No. We handle everything from keyword research and thread discovery to response writing and posting. You'll review a monthly report, and we'll adjust strategy based on your feedback — but the execution is entirely on us.",
  },
  {
    q: "How do you report on progress?",
    a: "Monthly executive reports with your GEO score trend, Share of Model data across ChatGPT, Perplexity, Gemini, and Claude, threads seeded, responses posted, and competitor benchmarking. Everything is also live in your MentionLayer dashboard.",
  },
  {
    q: "Can I switch from done-for-you to self-serve?",
    a: "Yes. Your account, keyword research, monitoring prompts, and all historical data transfer seamlessly to a self-serve SaaS plan. Many clients start done-for-you and bring it in-house once they see the playbook working.",
  },
  {
    q: "What's the minimum commitment?",
    a: "The Audit + Strategy is a one-time engagement. The Citation Sprint is 90 days. Full-Service is month-to-month after an initial 3-month onboarding period.",
  },
];

function FAQ() {
  return (
    <div className="space-y-3">
      {faqs.map(({ q, a }, i) => (
        <details
          key={i}
          className="group rounded-xl"
          style={{ background: "var(--surface-raised)", border: "1px solid rgba(26,26,46,0.04)" }}
        >
          <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-[16px] font-semibold list-none" style={{ color: "var(--ink)" }}>
            {q}
            <svg className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--ink-tertiary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="px-6 pb-5 text-[15px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>{a}</p>
        </details>
      ))}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="ml">
      <ServiceJsonLd name="MentionLayer Done-for-You Services" description="Fully managed AI visibility campaigns — citation seeding, press, entity optimization, and AI monitoring." url="/services" />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Done for You", url: "/services" }]} />
      <FAQPageJsonLd questions={faqs.map(({ q, a }) => ({ question: q, answer: a }))} />

      <MLNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Image src="/images/hero-bg-texture.png" alt="" fill className="object-cover" priority />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
            <div className="max-w-[600px]">
              <p className="text-[14px] font-medium tracking-wide uppercase" style={{ color: "var(--warm)", letterSpacing: "0.08em" }}>
                Done-for-You Services
              </p>

              <h1 className="mt-6 text-[44px] sm:text-[58px] lg:text-[66px] leading-[1.04] tracking-tight" style={{ color: "var(--ink)" }}>
                Your AI visibility,{" "}
                <em className="not-italic" style={{ color: "var(--accent)" }}>handled</em>
              </h1>

              <p className="mt-7 text-[18px] sm:text-[20px] leading-[1.6] max-w-[520px]" style={{ color: "var(--ink-secondary)" }}>
                No learning curve. No hiring. Our team runs MentionLayer&apos;s
                entire GEO stack on your behalf — citation seeding, press campaigns,
                entity optimization, and real-time AI monitoring.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/services/inquiry" className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px" style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}>
                  Book a strategy call
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <a href="#process" className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center border-[1.5px]" style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}>
                  How it works
                </a>
              </div>
            </div>

            <div className="hidden lg:block">
              <Image
                src="/images/services/hero-illustration.png"
                alt="Expert team managing AI visibility campaigns on dashboards"
                width={600}
                height={338}
                className="w-full rounded-2xl"
                priority
                style={{ boxShadow: "0 12px 40px -8px rgba(15,23,42,0.08)" }}
              />
            </div>
          </div>

          {/* Metrics strip */}
          <div className="mt-16 flex flex-wrap gap-x-16 gap-y-6 border-t pt-10" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
            {[
              { n: "142+", sub: "threads seeded per client avg." },
              { n: "36 → 72", sub: "avg. GEO score in 90 days" },
              { n: "60 days", sub: "to first AI recommendation" },
              { n: "4 models", sub: "tracked in real-time" },
            ].map(({ n, sub }) => (
              <div key={n}>
                <span className="serif text-[32px]" style={{ color: "var(--ink)" }}>{n}</span>
                <p className="mt-0.5 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICE TIERS ═══ */}
      <section className="py-20 sm:py-28" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>Three engagement models</p>
          <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] max-w-[560px]" style={{ color: "var(--ink)" }}>
            Pick the right fit
          </h2>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {/* Full-Service — featured */}
            <div className="relative rounded-2xl p-8 text-white flex flex-col" style={{ background: "var(--accent)", boxShadow: "0 8px 40px -8px rgba(61,43,224,0.3)" }}>
              <span className="absolute -top-3 left-6 text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: "#fbbf24", color: "#1a1a2e" }}>Most popular</span>
              <div className="h-40 mb-6 rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <Image src="/images/services/tier-full-service.png" alt="Full-service command center" width={400} height={300} className="w-full h-full object-cover opacity-80" />
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ opacity: 0.6 }}>Ongoing</p>
              <h3 className="mt-1 text-[24px] leading-[1.12]">Full-Service AI Visibility</h3>
              <p className="mt-3 text-[14px] leading-[1.55]" style={{ opacity: 0.75 }}>
                We run every module for you — citation seeding, press, entity sync, reviews, and AI monitoring. Monthly reports show your brand climbing in AI recommendations.
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {["Dedicated AI visibility strategist", "Weekly citation seeding (Reddit, Quora, forums)", "Monthly press campaigns via PressForge", "Entity consistency audit + fixes", "Review generation campaigns", "Weekly AI Monitor tracking", "Monthly executive reports"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ opacity: 0.85 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={2.5} className="flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/services/inquiry" className="mt-8 h-11 rounded-lg text-[15px] font-semibold inline-flex items-center justify-center bg-white transition-all hover:bg-white/90" style={{ color: "var(--accent)" }}>
                Talk to us
              </Link>
            </div>

            {/* Citation Sprint */}
            <div className="rounded-2xl p-8 flex flex-col" style={{ background: "white", border: "1px solid rgba(26,26,46,0.06)" }}>
              <div className="h-40 mb-6 rounded-xl overflow-hidden" style={{ background: "#fef7f0" }}>
                <Image src="/images/services/tier-citation-sprint.png" alt="Citation seeding tree" width={400} height={300} className="w-full h-full object-cover" />
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "var(--warm)" }}>90-day sprint</p>
              <h3 className="mt-1 text-[24px] leading-[1.12]" style={{ color: "var(--ink)" }}>Citation Seeding Sprint</h3>
              <p className="mt-3 text-[14px] leading-[1.55]" style={{ color: "var(--ink-secondary)" }}>
                A focused 90-day engagement to build your citation foundation. We find the threads, write the responses, and prove the impact with before/after data.
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {["Full keyword research + thread discovery", "100+ hand-crafted responses", "Platform-specific tone matching", "Baseline and exit AI Visibility Audit", "Before/after Share of Model report"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "var(--ink-secondary)" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5} className="flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/services/inquiry" className="mt-8 h-11 rounded-lg text-[15px] font-semibold inline-flex items-center justify-center" style={{ background: "var(--accent)", color: "white" }}>
                Talk to us
              </Link>
            </div>

            {/* Audit + Strategy */}
            <div className="rounded-2xl p-8 flex flex-col" style={{ background: "white", border: "1px solid rgba(26,26,46,0.06)" }}>
              <div className="h-40 mb-6 rounded-xl overflow-hidden" style={{ background: "#f5f3ff" }}>
                <Image src="/images/services/tier-audit-strategy.png" alt="Audit analysis" width={400} height={300} className="w-full h-full object-cover" />
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "#7c3aed" }}>One-time diagnostic</p>
              <h3 className="mt-1 text-[24px] leading-[1.12]" style={{ color: "var(--ink)" }}>AI Visibility Audit + Strategy</h3>
              <p className="mt-3 text-[14px] leading-[1.55]" style={{ color: "var(--ink-secondary)" }}>
                Get a full diagnostic of your AI visibility across 5 pillars. We deliver a scored baseline, competitor benchmarking, and a prioritized action plan.
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {["Full 5-pillar AI Visibility Audit", "Competitor benchmarking (up to 5)", "Prioritized action plan", "60-minute strategy call", "PDF report for stakeholders"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "var(--ink-secondary)" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5} className="flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/services/inquiry" className="mt-8 h-11 rounded-lg text-[15px] font-semibold inline-flex items-center justify-center" style={{ background: "var(--accent)", color: "white" }}>
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="process" className="py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>The process</p>
          <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] max-w-[560px]" style={{ color: "var(--ink)" }}>
            How done-for-you works
          </h2>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Discovery Call", body: "We learn your brand, competitors, and goals. We run an initial AI Visibility Audit to establish your baseline score.", border: "var(--accent)", img: "/images/process-audit.png" },
              { n: "02", title: "Strategy & Setup", body: "We build your keyword universe, configure monitoring prompts, set up competitor tracking, and design your campaign calendar.", border: "var(--warm)", img: "/images/process-execute.png" },
              { n: "03", title: "Execute & Seed", body: "Our team runs weekly citation campaigns, publishes press, fixes entity inconsistencies, and manages review outreach — all human-approved.", border: "#059669", img: "/images/process-track.png" },
              { n: "04", title: "Report & Optimize", body: "Monthly executive reports show your GEO score climbing. We adjust strategy based on which AI models are responding.", border: "#7c3aed", img: "/images/process-audit.png" },
            ].map(({ n, title, body, border, img }) => (
              <div key={n} className="rounded-xl p-7" style={{ background: "var(--surface-raised)", borderLeft: `3px solid ${border}` }}>
                <div className="w-14 h-14 mb-5">
                  <Image src={img} alt={title} width={120} height={120} className="w-full h-full object-contain" />
                </div>
                <span className="text-[13px] font-semibold" style={{ color: "var(--ink-tertiary)" }}>{n}</span>
                <h3 className="mt-1.5 text-[20px] leading-[1.15]" style={{ color: "var(--ink)" }}>{title}</h3>
                <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: "var(--ink-secondary)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RESULTS — Dark band ═══ */}
      <section className="relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <Image src="/images/social-proof-bg.png" alt="" fill className="object-cover" />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-6 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
            <div>
              <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "#fbbf24", letterSpacing: "0.08em" }}>Results</p>
              <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] text-white">
                From invisible to recommended
              </h2>
              <p className="mt-5 text-[17px] leading-[1.6]" style={{ color: "#94a3b8" }}>
                Our done-for-you clients see measurable AI visibility gains within the first 90 days. Here&apos;s what the numbers look like.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-8">
                {[
                  { v: "36 → 72", l: "Avg. GEO score in 90 days" },
                  { v: "3.2×", l: "AI mention increase" },
                  { v: "100+", l: "Threads seeded per sprint" },
                  { v: "4 models", l: "Tracked in real-time" },
                ].map(({ v, l }) => (
                  <div key={v}>
                    <span className="serif text-[28px] text-white">{v}</span>
                    <p className="mt-1 text-[13px]" style={{ color: "#94a3b8" }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit results screenshot */}
            <div>
              <BrowserFrame url="app.mentionlayer.com/audits/result">
                <Image
                  src="/images/audit-results.png"
                  alt="AI Visibility Audit showing score improvement from 36 to 78 across 5 pillars"
                  width={600}
                  height={480}
                  className="w-full"
                />
              </BrowserFrame>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIAL ═══ */}
      <section className="py-20 sm:py-28" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <svg width="40" height="30" fill="var(--accent)" opacity="0.25" viewBox="0 0 32 24" className="mx-auto"><path d="M0 24V12C0 5.4 5.4 0 12 0h2v6h-2c-3.3 0-6 2.7-6 6v2h8v10H0zm18 0V12c0-6.6 5.4-12 12-12h2v6h-2c-3.3 0-6 2.7-6 6v2h8v10H18z" /></svg>
          <p className="mt-6 text-[22px] sm:text-[26px] leading-[1.5]" style={{ color: "var(--ink)", fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Our clients went from zero AI mentions to being recommended by ChatGPT
            for their primary keywords within 60 days. The GEO Tracker made it possible
            to show the ROI in real numbers — not just promises.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Image
              src="/authors/joel-house.jpg"
              alt="Joel House"
              width={56}
              height={56}
              className="rounded-full ring-2 ring-[var(--accent)]/30"
              style={{ objectFit: "cover" }}
            />
            <div className="text-left">
              <p className="text-[16px] font-semibold" style={{ color: "var(--ink)" }}>Joel House</p>
              <p className="text-[14px]" style={{ color: "var(--ink-tertiary)" }}>Founder, MentionLayer & Joel House Search Media</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[800px] mx-auto px-6">
          <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>FAQ</p>
          <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] mb-12" style={{ color: "var(--ink)" }}>
            Common questions
          </h2>
          <FAQ />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 sm:py-28" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <h2 className="text-[36px] sm:text-[48px] leading-[1.08]" style={{ color: "var(--ink)" }}>
            Ready to let AI recommend your brand?
          </h2>
          <p className="mt-5 text-[18px] leading-[1.6]" style={{ color: "var(--ink-secondary)" }}>
            Book a free strategy call. We&apos;ll review your current AI visibility,
            identify your biggest gaps, and tell you exactly what we&apos;d do.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/services/inquiry" className="h-12 px-8 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2" style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}>
              Book a strategy call
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/free-audit" className="h-12 px-8 rounded-lg text-[15px] font-semibold inline-flex items-center border-[1.5px]" style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}>
              Run a free audit first
            </Link>
          </div>
          <p className="mt-4 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>No commitment. No pressure. Just clarity.</p>
        </div>
      </section>

      <MLFooter />
    </div>
  );
}
