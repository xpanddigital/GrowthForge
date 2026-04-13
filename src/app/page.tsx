import Link from "next/link";
import Image from "next/image";
import { SoftwareApplicationJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

/* ═══════════════════════════════════════════════════════
   MentionLayer Homepage V3 — With Real Visuals
   ═══════════════════════════════════════════════════════ */

/* Browser Chrome Frame */
function BrowserFrame({ children, url, className = "" }: { children: React.ReactNode; url: string; className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{ boxShadow: "0 25px 60px -12px rgba(15,23,42,0.12), 0 8px 24px -8px rgba(15,23,42,0.06)" }}>
      <div className="flex items-center px-4 h-9" style={{ background: "#f1f0ee" }}>
        <div className="flex gap-1.5">
          <span className="h-[10px] w-[10px] rounded-full" style={{ background: "#ff5f57" }} />
          <span className="h-[10px] w-[10px] rounded-full" style={{ background: "#febc2e" }} />
          <span className="h-[10px] w-[10px] rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="mx-auto">
          <span className="text-[11px] px-6 py-0.5 rounded" style={{ color: "#999", background: "rgba(0,0,0,0.04)" }}>{url}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="ml">
      <SoftwareApplicationJsonLd />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }]} />

      {/* ─── Nav ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center" style={{ background: "rgba(252,251,249,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="7" fill="#3d2be0"/><text x="8" y="20" fill="white" fontFamily="Outfit" fontWeight="700" fontSize="16">M</text></svg>
            <span className="text-[17px] font-semibold tracking-tight" style={{ color: "var(--ink)" }}>MentionLayer</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "#platform" },
              { label: "How It Works", href: "#process" },
              { label: "Pricing", href: "#pricing" },
              { label: "Blog", href: "/blog" },
              { label: "Academy", href: "/academy" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-[14px]" style={{ color: "var(--ink-tertiary)" }}>{label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hidden sm:block text-[14px] font-medium" style={{ color: "var(--ink-secondary)" }}>Sign in</Link>
            <Link href="/free-audit" className="h-9 px-4 rounded-lg text-[14px] font-semibold text-white inline-flex items-center" style={{ background: "var(--accent)" }}>Start free audit</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-28">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Image src="/images/hero-bg-texture.png" alt="" fill className="object-cover" priority />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div className="max-w-[600px]">
              <p className="ml-enter text-[14px] font-medium tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>
                Generative Engine Optimization
              </p>

              <h1 className="ml-enter ml-d1 mt-6 text-[44px] sm:text-[58px] lg:text-[72px] leading-[1.04] tracking-tight" style={{ color: "var(--ink)" }}>
                Get your brand into{" "}
                <em className="not-italic" style={{ color: "var(--accent)" }}>every</em>{" "}
                AI answer
              </h1>

              <p className="ml-enter ml-d2 mt-7 text-[18px] sm:text-[20px] leading-[1.6] max-w-[520px]" style={{ color: "var(--ink-secondary)" }}>
                When someone asks ChatGPT, Perplexity, or Gemini for a recommendation,
                your brand either shows up — or it doesn&apos;t. We make sure it does.
              </p>

              <div className="ml-enter ml-d3 mt-9 flex flex-wrap gap-3">
                <Link href="/free-audit" className="h-12 px-7 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-transform hover:-translate-y-px" style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}>
                  Run free visibility audit
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/how-it-works" className="h-12 px-7 rounded-lg text-[15px] font-semibold inline-flex items-center border-[1.5px]" style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}>
                  How it works
                </Link>
              </div>
            </div>

            {/* Right — Dashboard Screenshot in Browser Frame */}
            <div className="ml-enter ml-d4 hidden lg:block">
              <BrowserFrame url="app.mentionlayer.com/monitor">
                <Image
                  src="/images/dashboard-hero.png"
                  alt="MentionLayer GEO Tracker showing AI Visibility Score of 78 with Share of Model breakdown across ChatGPT, Perplexity, Gemini, and Claude"
                  width={520}
                  height={680}
                  className="w-full"
                  priority
                />
              </BrowserFrame>
            </div>
          </div>

          {/* Metric strip */}
          <div className="ml-enter mt-16 flex flex-wrap gap-x-16 gap-y-6 border-t pt-10" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
            {[
              { n: "4.9B+", sub: "monthly AI queries" },
              { n: "68%", sub: "trust AI over Google" },
              { n: "142+", sub: "threads seeded per client" },
              { n: "3.2×", sub: "avg. mention increase" },
            ].map(({ n, sub }) => (
              <div key={n}>
                <span className="serif text-[32px]" style={{ color: "var(--ink)" }}>{n}</span>
                <p className="mt-0.5 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM — Before / After ═══ */}
      <section className="py-20 sm:py-28" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--warm)", letterSpacing: "0.08em" }}>The problem</p>
              <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]" style={{ color: "var(--ink)" }}>
                Your SEO is invisible to AI
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>
                Millions now ask ChatGPT for recommendations instead of Googling. Traditional SEO
                doesn&apos;t influence what AI models recommend.
                Your competitors are already in those answers — you&apos;re not.
              </p>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl p-6 sm:p-8" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <div className="flex items-center gap-2 mb-5">
                  <span className="h-2 w-2 rounded-full" style={{ background: "#dc2626" }} />
                  <span className="text-[13px] font-bold" style={{ color: "#dc2626" }}>Without GEO</span>
                </div>
                <div className="rounded-lg p-4 mb-3" style={{ background: "rgba(255,255,255,0.7)" }}>
                  <p className="text-[12px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#9ca3af" }}>User asks ChatGPT</p>
                  <p className="text-[15px] italic" style={{ color: "var(--ink)" }}>&quot;Best project management tools for agencies?&quot;</p>
                </div>
                <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.7)" }}>
                  <p className="text-[15px]" style={{ color: "var(--ink)" }}>Monday.com, Asana, ClickUp...</p>
                  <p className="mt-2 text-[14px] font-semibold" style={{ color: "#dc2626" }}>Your brand: not mentioned</p>
                </div>
              </div>

              <div className="rounded-xl p-6 sm:p-8" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                <div className="flex items-center gap-2 mb-5">
                  <span className="h-2 w-2 rounded-full" style={{ background: "#059669" }} />
                  <span className="text-[13px] font-bold" style={{ color: "#059669" }}>With MentionLayer</span>
                </div>
                <div className="rounded-lg p-4 mb-3" style={{ background: "rgba(255,255,255,0.7)" }}>
                  <p className="text-[12px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#9ca3af" }}>User asks ChatGPT</p>
                  <p className="text-[15px] italic" style={{ color: "var(--ink)" }}>&quot;Best project management tools for agencies?&quot;</p>
                </div>
                <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.7)" }}>
                  <p className="text-[15px]" style={{ color: "var(--ink)" }}>Monday.com, Asana, <strong style={{ color: "var(--accent)" }}>YourBrand</strong>...</p>
                  <p className="mt-2 text-[14px] font-semibold" style={{ color: "#059669" }}>&quot;YourBrand is great for agencies because...&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM — Five Pillars ═══ */}
      <section id="platform" className="py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>The platform</p>
          <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] max-w-[560px]" style={{ color: "var(--ink)" }}>
            Five pillars working together
          </h2>

          <div className="mt-14 grid lg:grid-cols-[1fr_1fr] gap-5">
            {/* Featured: Citation Engine — tall card */}
            <div className="rounded-2xl p-8 sm:p-10 flex flex-col justify-between min-h-[400px]" style={{ background: "var(--accent)", color: "white" }}>
              <div>
                <span className="inline-block text-[12px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>Core Module</span>
                <h3 className="mt-6 text-[28px] sm:text-[32px] leading-[1.12]">Citation Engine</h3>
                <p className="mt-4 text-[16px] leading-[1.6]" style={{ opacity: 0.8 }}>
                  Discover high-authority Reddit, Quora, and forum threads that AI models
                  already cite. Generate human-quality responses that naturally mention your brand.
                </p>
              </div>
              <div className="flex gap-3 mt-8">
                {["Reddit", "Quora", "Facebook"].map((p) => (
                  <span key={p} className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>{p}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { title: "PressForge", desc: "Launch press and earn media coverage that AI models reference as authority.", color: "#059669", bg: "#ecfdf5" },
                { title: "Review Engine", desc: "Boost UGC reviews across platforms AI models trust: Google, Trustpilot, G2.", color: "#d97706", bg: "#fffbeb" },
                { title: "Entity Sync", desc: "Keep your brand identity consistent everywhere AI looks — schema, directories, KGs.", color: "#2563eb", bg: "#eff6ff" },
                { title: "GEO Tracker", desc: "Real-time AI visibility score across ChatGPT, Perplexity, Gemini, and Claude.", color: "#7c3aed", bg: "#f5f3ff" },
              ].map(({ title, desc, color, bg }) => (
                <div key={title} className="rounded-xl p-6 flex flex-col justify-between min-h-[190px]" style={{ background: bg }}>
                  <div>
                    <h3 className="text-[17px] font-semibold" style={{ color }}>{title}</h3>
                    <p className="mt-2 text-[13px] leading-[1.55]" style={{ color: "var(--ink-secondary)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GEO TRACKER — Product Screenshot ═══ */}
      <section className="py-20 sm:py-28" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Screenshot in browser frame */}
            <div className="order-2 lg:order-1">
              <BrowserFrame url="app.mentionlayer.com/monitor" className="max-w-[520px]">
                <Image
                  src="/images/geo-tracker.png"
                  alt="GEO Tracker showing Share of Model rankings, 12-week upward trend, and real-time alert"
                  width={520}
                  height={720}
                  className="w-full"
                />
              </BrowserFrame>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--warm)", letterSpacing: "0.08em" }}>Proprietary technology</p>
              <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]" style={{ color: "var(--ink)" }}>
                Know exactly where you stand
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>
                The GEO Tracker tests your brand against real buying-intent prompts
                across every major AI model. You see exactly when AI starts recommending
                you — and when it stops.
              </p>
              <div className="mt-8 space-y-3.5">
                {[
                  "Share of Model across ChatGPT, Perplexity, Gemini & Claude",
                  "Competitor visibility tracked side-by-side",
                  "Alerts when your brand enters or exits recommendations",
                  "Month-over-month trends prove campaign ROI",
                ].map((t) => (
                  <div key={t} className="flex gap-3 items-start">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    <span className="text-[15px]" style={{ color: "var(--ink-secondary)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="process" className="py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-[560px]">
            <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>How it works</p>
            <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]" style={{ color: "var(--ink)" }}>
              Three steps. Measurable results.
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Audit", body: "We scan your AI visibility across 5 pillars: citations, AI presence, entities, reviews, and press. You get a scored baseline and prioritized action plan.", img: "/images/process-audit.png", border: "var(--accent)" },
              { n: "02", title: "Execute", body: "AI-powered campaigns seed forum citations, launch press releases, boost reviews, and fix entity inconsistencies. Every action is human-approved.", img: "/images/process-execute.png", border: "var(--warm)" },
              { n: "03", title: "Track", body: "Watch your GEO score climb in real-time. See which AI models recommend your brand, track competitors, and prove ROI monthly.", img: "/images/process-track.png", border: "#059669" },
            ].map(({ n, title, body, img, border }) => (
              <div key={n} className="rounded-xl p-8" style={{ background: "var(--surface-raised)", borderLeft: `3px solid ${border}` }}>
                <div className="w-16 h-16 mb-6 mx-auto">
                  <Image src={img} alt={title} width={120} height={120} className="w-full h-full object-contain" />
                </div>
                <span className="text-[13px] font-semibold" style={{ color: "var(--ink-tertiary)" }}>{n}</span>
                <h3 className="mt-2 text-[24px] leading-[1.12]" style={{ color: "var(--ink)" }}>{title}</h3>
                <p className="mt-3 text-[15px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF — Dark band ═══ */}
      <section className="relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <Image src="/images/social-proof-bg.png" alt="" fill className="object-cover" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
            <div>
              <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "#fbbf24", letterSpacing: "0.08em" }}>Results</p>
              <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] text-white">
                From invisible to recommended
              </h2>
              <div className="mt-10 grid grid-cols-2 gap-8">
                {[
                  { v: "36 → 72", l: "Avg. GEO score in 90 days" },
                  { v: "3.2×", l: "AI mention increase" },
                  { v: "60 days", l: "Time to first recommendation" },
                  { v: "4 models", l: "Tracked in real-time" },
                ].map(({ v, l }) => (
                  <div key={v}>
                    <span className="serif text-[28px] text-white">{v}</span>
                    <p className="mt-1 text-[13px]" style={{ color: "#94a3b8" }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial with Joel's headshot */}
            <div className="rounded-xl p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <svg width="32" height="24" fill="#6366f1" opacity="0.5" viewBox="0 0 32 24"><path d="M0 24V12C0 5.4 5.4 0 12 0h2v6h-2c-3.3 0-6 2.7-6 6v2h8v10H0zm18 0V12c0-6.6 5.4-12 12-12h2v6h-2c-3.3 0-6 2.7-6 6v2h8v10H18z"/></svg>
              <p className="mt-6 text-[20px] leading-[1.6] text-white" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                Our clients went from zero AI mentions to being recommended by ChatGPT
                for their primary keywords within 60 days. The GEO Tracker made it possible
                to show the ROI in real numbers — not just promises.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Image
                  src="/authors/joel-house.jpg"
                  alt="Joel House"
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-[#6366f1]/40"
                  style={{ objectFit: "cover" }}
                />
                <div>
                  <p className="text-[15px] font-semibold text-white">Joel House</p>
                  <p className="text-[13px]" style={{ color: "#94a3b8" }}>Founder, MentionLayer & Joel House Search Media</p>
                </div>
              </div>
            </div>
          </div>

          {/* Citation queue preview — floating screenshot */}
          <div className="mt-16 max-w-[640px] mx-auto">
            <BrowserFrame url="app.mentionlayer.com/citations">
              <Image
                src="/images/citation-queue.png"
                alt="Citation Engine showing discovered threads with relevance scores and AI-generated response preview"
                width={680}
                height={620}
                className="w-full"
              />
            </BrowserFrame>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-[560px]">
            <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--accent)", letterSpacing: "0.08em" }}>Pricing</p>
            <h2 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]" style={{ color: "var(--ink)" }}>
              Simple, credit-based pricing
            </h2>
            <p className="mt-5 text-[17px] leading-[1.65]" style={{ color: "var(--ink-secondary)" }}>
              Start with a free audit. Pick a plan when you&apos;re ready to run campaigns.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {[
              { name: "Starter", price: "$97", credits: "700 credits/mo", detail: "1 website · 20 keywords", features: ["Citation Engine", "AI Monitor", "Monthly Audit", "Email Support"], pop: false },
              { name: "Growth", price: "$297", credits: "2,000 credits/mo", detail: "3 websites · 50 keywords", features: ["Everything in Starter", "Entity Sync", "Review Engine", "3 Audits/month", "Priority Support"], pop: true },
              { name: "Agency Pro", price: "$497", credits: "5,000 credits/mo", detail: "15 websites · 100 keywords", features: ["Everything in Growth", "PressForge", "Full Audit Suite", "White-label Reports", "Dedicated Support"], pop: false },
            ].map(({ name, price, credits, detail, features, pop }) => (
              <div key={name} className={`rounded-2xl p-8 flex flex-col ${pop ? "text-white relative" : ""}`}
                style={pop
                  ? { background: "var(--accent)", boxShadow: "0 8px 40px -8px rgba(61,43,224,0.3)" }
                  : { background: "var(--surface-raised)", border: "1px solid rgba(26,26,46,0.06)" }
                }>
                {pop && <span className="absolute -top-3 left-6 text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: "#fbbf24", color: "#1a1a2e" }}>Most popular</span>}
                <p className={`text-[16px] font-semibold ${pop ? "text-white" : ""}`} style={pop ? {} : { color: "var(--ink)" }}>{name}</p>
                <div className="mt-4 mb-1">
                  <span className={`serif text-[44px] ${pop ? "text-white" : ""}`} style={pop ? {} : { color: "var(--ink)" }}>{price}</span>
                  <span className={`text-[15px] ${pop ? "text-white/60" : ""}`} style={pop ? {} : { color: "var(--ink-tertiary)" }}>/mo</span>
                </div>
                <p className={`text-[14px] ${pop ? "text-white/60" : ""}`} style={pop ? {} : { color: "var(--ink-tertiary)" }}>{credits}</p>
                <p className={`text-[14px] mb-6 ${pop ? "text-white/60" : ""}`} style={pop ? {} : { color: "var(--ink-tertiary)" }}>{detail}</p>
                <ul className="flex-1 space-y-2.5 mb-8">
                  {features.map((f) => (
                    <li key={f} className={`flex items-center gap-2.5 text-[14px] ${pop ? "text-white/85" : ""}`} style={pop ? {} : { color: "var(--ink-secondary)" }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={pop ? "#fbbf24" : "#059669"} strokeWidth={2.5} className="flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`h-11 rounded-lg text-[15px] font-semibold inline-flex items-center justify-center transition-all ${pop ? "bg-white hover:bg-white/90" : "hover:-translate-y-px"}`}
                  style={pop ? { color: "var(--accent)" } : { background: "var(--accent)", color: "white" }}>
                  Start 14-day free trial
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-10 text-[14px] text-center" style={{ color: "var(--ink-tertiary)" }}>
            14-day free trial on all plans. No charge until it ends.{" "}
            <a href="mailto:joel@xpanddigital.io" className="font-medium underline" style={{ color: "var(--accent)" }}>Need enterprise?</a>
          </p>
        </div>
      </section>

      {/* ═══ FINAL CTA with Audit Results Screenshot ═══ */}
      <section className="py-20 sm:py-28" style={{ background: "var(--surface-raised)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
            <div>
              <h2 className="text-[36px] sm:text-[48px] leading-[1.08]" style={{ color: "var(--ink)" }}>
                Ready to get recommended?
              </h2>
              <p className="mt-5 text-[18px] leading-[1.6]" style={{ color: "var(--ink-secondary)" }}>
                Run a free AI Visibility Audit. See where you stand, how you compare to competitors,
                and what to do about it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/free-audit" className="h-12 px-8 rounded-lg text-[15px] font-semibold text-white inline-flex items-center gap-2" style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}>
                  Run free audit
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/login" className="h-12 px-8 rounded-lg text-[15px] font-semibold inline-flex items-center border-[1.5px]" style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}>
                  Sign in
                </Link>
              </div>
              <p className="mt-4 text-[13px]" style={{ color: "var(--ink-tertiary)" }}>No credit card required. Results in under 5 minutes.</p>
            </div>

            {/* Audit results screenshot */}
            <div className="hidden lg:block">
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

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="7" fill="#3d2be0"/><text x="8" y="20" fill="white" fontFamily="Outfit" fontWeight="700" fontSize="16">M</text></svg>
                <span className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>MentionLayer</span>
              </Link>
              <span className="text-[13px] hidden sm:block" style={{ color: "var(--ink-tertiary)" }}>The AI Visibility Platform</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-[14px]" style={{ color: "var(--ink-tertiary)" }}>
              {["Features", "Pricing", "Blog", "Academy", "Done for You", "Sign In"].map((l) => (
                <Link key={l} href={l === "Done for You" ? "/services" : l === "Sign In" ? "/login" : `/${l.toLowerCase()}`} className="hover:text-[var(--ink)] transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div className="mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]" style={{ borderTop: "1px solid rgba(26,26,46,0.04)", color: "var(--ink-tertiary)" }}>
            <p>&copy; {new Date().getFullYear()} MentionLayer. Built by Xpand Digital.</p>
            <p>Generative Engine Optimization for brands that want to be recommended by AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
