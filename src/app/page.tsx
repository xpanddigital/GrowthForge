import Link from "next/link";

/* ─── Inline SVG Icon Components ─── */

function IconSearch({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  );
}

function IconMessageCircle({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

function IconNewspaper({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h10" />
    </svg>
  );
}

function IconStar({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconGlobe({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function IconBarChart({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  );
}

function IconCheck({ className = "w-5 h-5" }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconArrowRight({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconChevronDown({ className = "w-5 h-5" }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/* ─── Score Ring Component ─── */

function ScoreRing({ score, size = 160, label }: { score: number; size?: number; label?: string }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 60 ? "#10B981" : score >= 35 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 120 120" className="rotate-[-90deg]">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ animation: "score-fill 1.5s ease-out both" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
      {label && <span className="mt-2 text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

/* ─── Model Bar Component ─── */

function ModelBar({ model, percentage, color }: { model: string; percentage: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-24 text-right">{model}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-medium w-10" style={{ color }}>{percentage}%</span>
    </div>
  );
}

/* ─── Main Page ─── */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold tracking-tight">
                <span className="text-[#6C5CE7]">Mention</span>Layer
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/free-audit"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#6C5CE7] px-4 text-sm font-medium text-white hover:bg-[#5A4BD1] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#6C5CE7]/20 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#00D2D3]/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="max-w-2xl">
              <div className="animate-fade-up">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 px-4 py-1.5 text-sm text-[#6C5CE7] mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6C5CE7] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6C5CE7]" />
                  </span>
                  Generative Engine Optimization
                </span>
              </div>

              <h1 className="animate-fade-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Get Your Brand{" "}
                <span className="gradient-text">Recommended by AI</span>
              </h1>

              <p className="animate-fade-up-delay-2 text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                ChatGPT, Perplexity, and Gemini are replacing Google for millions of users.
                MentionLayer gets your brand into the answers — through forum citations,
                press coverage, reviews, and real-time AI visibility tracking.
              </p>

              <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/free-audit"
                  className="inline-flex h-12 items-center justify-center rounded-lg gradient-bg px-6 text-sm font-semibold text-white hover:opacity-90 transition-opacity gap-2"
                >
                  Start Free Audit
                  <IconArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 text-sm font-medium hover:bg-white/10 transition-colors gap-2"
                >
                  See How It Works
                  <IconChevronDown className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right: Visual — GEO Score mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="relative animate-float">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 animate-pulse-glow">
                  <div className="text-center mb-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">AI Visibility Score</p>
                    <p className="text-sm text-[#00D2D3] font-medium">Live GEO Tracker</p>
                  </div>
                  <div className="flex justify-center mb-6">
                    <ScoreRing score={72} size={180} />
                  </div>
                  <div className="space-y-3 min-w-[280px]">
                    <ModelBar model="ChatGPT" percentage={78} color="#10B981" />
                    <ModelBar model="Perplexity" percentage={65} color="#10B981" />
                    <ModelBar model="Gemini" percentage={42} color="#F59E0B" />
                    <ModelBar model="Claude" percentage={58} color="#10B981" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">vs. last month</span>
                    <span className="text-sm font-semibold text-[#10B981]">+18 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem Statement ─── */}
      <section className="border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Google Isn&apos;t the Only Search Engine Anymore
            </h2>
            <p className="text-lg text-muted-foreground">
              Millions of users now ask AI models for recommendations instead of searching Google.
              Traditional SEO doesn&apos;t influence what ChatGPT or Perplexity recommends.
              Your competitors are already in the answers. Are you?
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { stat: "4.9B+", label: "Monthly AI search queries across ChatGPT, Perplexity, and Gemini" },
              { stat: "68%", label: "Of users trust AI recommendations over traditional search results" },
              { stat: "0%", label: "Of traditional SEO strategies that directly improve AI visibility" },
            ].map(({ stat, label }) => (
              <div key={stat} className="text-center p-6 rounded-xl border border-white/5 bg-white/[0.02]">
                <p className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Before / After visual */}
          <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-400">Without GEO</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-muted-foreground mb-1 text-xs">User asks ChatGPT:</p>
                  <p className="italic">&quot;Best project management tools for agencies?&quot;</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-muted-foreground mb-1 text-xs">AI recommends:</p>
                  <p><span className="text-green-400 font-medium">Monday.com</span>, <span className="text-green-400 font-medium">Asana</span>, <span className="text-green-400 font-medium">ClickUp</span>...</p>
                  <p className="text-red-400 mt-1 text-xs">Your brand: not mentioned</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-400">With MentionLayer</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-muted-foreground mb-1 text-xs">User asks ChatGPT:</p>
                  <p className="italic">&quot;Best project management tools for agencies?&quot;</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-muted-foreground mb-1 text-xs">AI recommends:</p>
                  <p><span className="text-green-400 font-medium">Monday.com</span>, <span className="text-green-400 font-medium">Asana</span>, <span className="font-bold text-[#00D2D3]">YourBrand</span>...</p>
                  <p className="text-green-400 mt-1 text-xs">&quot;YourBrand is great for agencies because...&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features: The 5 Pillars ─── */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-medium text-[#6C5CE7] uppercase tracking-widest">The GEO Platform</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-4">
              Five Pillars of AI Visibility
            </h2>
            <p className="text-lg text-muted-foreground">
              MentionLayer attacks AI visibility from every angle that generative models use
              to form recommendations. Each pillar reinforces the others.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Citation Engine */}
            <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center mb-4 group-hover:bg-[#6C5CE7]/20 transition-colors">
                <IconMessageCircle className="w-6 h-6 text-[#6C5CE7]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Citation Engine</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover high-authority Reddit, Quora, and forum threads that AI models already cite in their answers.
                Generate human-quality contextual responses that naturally mention your brand.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs rounded-full bg-[#FF4500]/10 text-[#FF4500] px-2.5 py-1">Reddit</span>
                <span className="text-xs rounded-full bg-[#B92B27]/10 text-[#B92B27] px-2.5 py-1">Quora</span>
                <span className="text-xs rounded-full bg-[#1877F2]/10 text-[#1877F2] px-2.5 py-1">Facebook Groups</span>
              </div>
            </div>

            {/* PressForge */}
            <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-[#00D2D3]/30 hover:bg-[#00D2D3]/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-[#00D2D3]/10 flex items-center justify-center mb-4 group-hover:bg-[#00D2D3]/20 transition-colors">
                <IconNewspaper className="w-6 h-6 text-[#00D2D3]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">PressForge</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Launch press wire releases and earn media coverage that AI models reference.
                Control the narrative. When AI searches for your brand, it finds authority.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs rounded-full bg-white/5 text-muted-foreground px-2.5 py-1">Press Releases</span>
                <span className="text-xs rounded-full bg-white/5 text-muted-foreground px-2.5 py-1">Earned Media</span>
                <span className="text-xs rounded-full bg-white/5 text-muted-foreground px-2.5 py-1">Thought Leadership</span>
              </div>
            </div>

            {/* Review Engine */}
            <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-[#F59E0B]/30 hover:bg-[#F59E0B]/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/20 transition-colors">
                <IconStar className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Review Engine</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Boost UGC reviews across platforms that AI models trust — Google, Trustpilot, G2, and more.
                More authentic reviews means more AI recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs rounded-full bg-white/5 text-muted-foreground px-2.5 py-1">Google Reviews</span>
                <span className="text-xs rounded-full bg-white/5 text-muted-foreground px-2.5 py-1">Trustpilot</span>
                <span className="text-xs rounded-full bg-white/5 text-muted-foreground px-2.5 py-1">G2 / Capterra</span>
              </div>
            </div>

            {/* Entity Sync */}
            <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center mb-4 group-hover:bg-[#3B82F6]/20 transition-colors">
                <IconGlobe className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Entity Sync</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ensure your brand identity is consistent everywhere AI looks — directories,
                knowledge graphs, schema markup, and structured data. Consistency builds trust.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs rounded-full bg-white/5 text-muted-foreground px-2.5 py-1">Schema Markup</span>
                <span className="text-xs rounded-full bg-white/5 text-muted-foreground px-2.5 py-1">Knowledge Graph</span>
                <span className="text-xs rounded-full bg-white/5 text-muted-foreground px-2.5 py-1">Directory Sync</span>
              </div>
            </div>

            {/* GEO Tracker — spans 2 cols on larger screens */}
            <div className="group md:col-span-2 rounded-xl border border-[#6C5CE7]/20 bg-gradient-to-br from-[#6C5CE7]/5 to-[#00D2D3]/5 p-6 hover:border-[#6C5CE7]/40 transition-all duration-300">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                    <IconBarChart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">GEO Tracker</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The industry&apos;s first real-time Generative Engine Optimization tracker.
                    Monitor your AI visibility score across ChatGPT, Perplexity, Gemini, and Claude.
                    See exactly when AI starts recommending your brand — and track your competitors.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] px-2.5 py-1">Real-time Tracking</span>
                    <span className="text-xs rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] px-2.5 py-1">Share of Model</span>
                    <span className="text-xs rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] px-2.5 py-1">Competitor Intel</span>
                    <span className="text-xs rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] px-2.5 py-1">Trend Analysis</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <ScoreRing score={72} size={100} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GEO Tracker Spotlight ─── */}
      <section id="geo-tracker" className="border-y border-white/5 bg-white/[0.01] scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Mockup */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-lg font-semibold">Share of Model</p>
                    <p className="text-sm text-muted-foreground">Last 30 days across 40 test prompts</p>
                  </div>
                  <span className="text-xs rounded-full bg-[#10B981]/10 text-[#10B981] px-3 py-1 font-medium">Live</span>
                </div>

                {/* Your brand vs competitors */}
                <div className="space-y-4 mb-8">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#6C5CE7]">Your Brand</span>
                      <span className="text-sm font-bold text-[#6C5CE7]">72%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-[#6C5CE7]" style={{ width: "72%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Competitor A</span>
                      <span className="text-sm text-muted-foreground">58%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-white/20" style={{ width: "58%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Competitor B</span>
                      <span className="text-sm text-muted-foreground">35%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-white/20" style={{ width: "35%" }} />
                    </div>
                  </div>
                </div>

                {/* Model breakdown */}
                <div className="border-t border-white/5 pt-6">
                  <p className="text-sm font-medium mb-4">Your visibility by model</p>
                  <div className="space-y-3">
                    <ModelBar model="ChatGPT" percentage={78} color="#10B981" />
                    <ModelBar model="Perplexity" percentage={85} color="#10B981" />
                    <ModelBar model="Gemini" percentage={52} color="#F59E0B" />
                    <ModelBar model="Claude" percentage={68} color="#10B981" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy */}
            <div className="order-1 lg:order-2">
              <span className="text-sm font-medium text-[#00D2D3] uppercase tracking-widest">Proprietary Technology</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-6">
                The First Real-Time{" "}
                <span className="gradient-text">GEO Tracker</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop guessing whether your AI visibility strategy is working.
                MentionLayer continuously tests your brand against real prompts across
                every major AI model — and shows you exactly where you stand.
              </p>

              <div className="space-y-4">
                {[
                  "Track your Share of Model across ChatGPT, Perplexity, Gemini, and Claude",
                  "Monitor competitor visibility in real-time",
                  "See which forum posts and press mentions drive AI recommendations",
                  "Get alerts when your brand starts (or stops) being recommended",
                  "Month-over-month tracking proves campaign ROI",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-[#00D2D3]/10 flex items-center justify-center flex-shrink-0">
                      <IconCheck className="w-3 h-3 text-[#00D2D3]" />
                    </div>
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-medium text-[#6C5CE7] uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-4">
              Three Steps to AI Visibility
            </h2>
            <p className="text-lg text-muted-foreground">
              MentionLayer handles the complexity. You see the results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Audit",
                description: "We scan your AI visibility across all 5 pillars — citations, AI presence, entities, reviews, and press. You get a scored baseline and a prioritized action plan.",
                icon: IconSearch,
                color: "#6C5CE7",
              },
              {
                step: "02",
                title: "Execute",
                description: "AI-powered campaigns seed forum citations, launch press releases, boost reviews, and fix entity inconsistencies. Every action is human-approved before going live.",
                icon: IconArrowRight,
                color: "#00D2D3",
              },
              {
                step: "03",
                title: "Track",
                description: "Watch your GEO score climb in real-time. See which AI models recommend your brand, track competitors, and prove ROI with month-over-month reporting.",
                icon: IconBarChart,
                color: "#10B981",
              },
            ].map(({ step, title, description, icon: Icon, color }) => (
              <div key={step} className="relative text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-2">{step}</div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Results / Social Proof ─── */}
      <section id="results" className="border-y border-white/5 bg-white/[0.01] scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-medium text-[#00D2D3] uppercase tracking-widest">Proven Results</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-4">
              From Invisible to Recommended
            </h2>
            <p className="text-lg text-muted-foreground">
              Agencies use MentionLayer to take their clients from zero AI visibility
              to being the brand AI models recommend.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {[
              { value: "142+", label: "High-authority threads seeded per client", color: "#6C5CE7" },
              { value: "3.2x", label: "Average increase in AI mention rate", color: "#00D2D3" },
              { value: "36→72", label: "Average GEO score improvement in 90 days", color: "#10B981" },
              { value: "4", label: "AI models tracked in real-time", color: "#F59E0B" },
            ].map(({ value, label, color }) => (
              <div key={value} className="text-center p-6 rounded-xl border border-white/5 bg-white/[0.02]">
                <p className="text-3xl font-bold mb-2" style={{ color }}>{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial-style quote */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <p className="text-lg text-muted-foreground italic leading-relaxed mb-4">
                &quot;Our clients went from zero AI mentions to being recommended by ChatGPT
                for their primary keywords within 60 days. The GEO Tracker made it possible
                to show the ROI in real numbers — not just promises.&quot;
              </p>
              <p className="text-sm font-medium">Agency Director</p>
              <p className="text-xs text-muted-foreground">Digital Marketing Agency</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Who It's For ─── */}
      <section className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-medium text-[#6C5CE7] uppercase tracking-widest">Built For Growth</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-4">
              Whether You&apos;re an Agency or a Brand
            </h2>
            <p className="text-lg text-muted-foreground">
              MentionLayer works for both — with multi-client dashboards for agencies
              and streamlined workflows for in-house teams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Link href="/use-cases/agencies" className="group rounded-xl border border-white/5 bg-white/[0.02] p-8 hover:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center mb-4 group-hover:bg-[#6C5CE7]/20 transition-colors">
                <svg className="w-6 h-6 text-[#6C5CE7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Agencies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add AI visibility as a new service line. Multi-client dashboards, white-label reports,
                and a repeatable campaign workflow your team can run at scale. Agencies are adding
                $2,000-$5,000/month per client with GEO services.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#6C5CE7] group-hover:gap-2 transition-all">
                Learn more <IconArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link href="/use-cases/brands" className="group rounded-xl border border-white/5 bg-white/[0.02] p-8 hover:border-[#00D2D3]/30 hover:bg-[#00D2D3]/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-[#00D2D3]/10 flex items-center justify-center mb-4 group-hover:bg-[#00D2D3]/20 transition-colors">
                <svg className="w-6 h-6 text-[#00D2D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Brands</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Stop being invisible to AI. Run your own AI visibility campaigns with guided workflows,
                automated discovery, and real-time monitoring. Know exactly when ChatGPT starts
                recommending you — and why.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#00D2D3] group-hover:gap-2 transition-all">
                Learn more <IconArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Pricing Preview ─── */}
      <section className="border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-medium text-[#00D2D3] uppercase tracking-widest">Simple Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-4">
              Plans That Scale With You
            </h2>
            <p className="text-lg text-muted-foreground">
              Start with a free audit. Upgrade when you&apos;re ready to run campaigns.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Starter", price: "$297", period: "/mo", description: "For brands getting started with AI visibility", highlight: false },
              { name: "Growth", price: "$597", period: "/mo", description: "For brands running active GEO campaigns", highlight: true },
              { name: "Agency Pro", price: "$997", period: "/mo", description: "For agencies managing multiple clients", highlight: false },
            ].map(({ name, price, period, description, highlight }) => (
              <div key={name} className={`rounded-xl border p-6 text-center ${highlight ? "border-[#6C5CE7]/40 bg-[#6C5CE7]/5 ring-1 ring-[#6C5CE7]/20" : "border-white/5 bg-white/[0.02]"}`}>
                {highlight && <span className="inline-block text-xs font-medium text-[#6C5CE7] bg-[#6C5CE7]/10 rounded-full px-3 py-1 mb-3">Most Popular</span>}
                <h3 className="text-lg font-semibold">{name}</h3>
                <div className="mt-2 mb-3">
                  <span className="text-3xl font-bold">{price}</span>
                  <span className="text-sm text-muted-foreground">{period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-medium text-[#6C5CE7] hover:text-[#5A4BD1] transition-colors">
              See full plan comparison <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Latest from the Blog ─── */}
      <section className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-medium text-[#6C5CE7] uppercase tracking-widest">Resources</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3">
                Learn GEO Strategy
              </h2>
            </div>
            <Link href="/blog" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-[#6C5CE7] hover:text-[#5A4BD1] transition-colors">
              View all articles <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "What Is Generative Engine Optimization? The Complete Guide",
                description: "Everything you need to know about GEO — how it works, why it matters, and the 5-pillar framework for getting your brand recommended by AI.",
                slug: "what-is-geo-complete-guide",
                category: "Fundamentals",
                readTime: "16 min",
              },
              {
                title: "How AI Models Choose What to Cite",
                description: "AI models don't pick sources randomly. They use a consensus layer built from Reddit threads, press coverage, reviews, and structured data.",
                slug: "how-ai-models-choose",
                category: "Strategy",
                readTime: "10 min",
              },
              {
                title: "The Citation Seeding Playbook",
                description: "A step-by-step guide to finding high-authority threads, writing responses that get upvoted, and measuring the impact on AI visibility.",
                slug: "citation-seeding-playbook",
                category: "Playbook",
                readTime: "14 min",
              },
            ].map(({ title, description, slug, category, readTime }) => (
              <Link key={slug} href={`/blog/${slug}`} className="group rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/5 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-[#6C5CE7] bg-[#6C5CE7]/10 rounded-full px-2.5 py-0.5">{category}</span>
                  <span className="text-xs text-muted-foreground">{readTime} read</span>
                </div>
                <h3 className="text-base font-semibold mb-2 group-hover:text-[#6C5CE7] transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[#6C5CE7]">
              View all articles <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#6C5CE7]/10 blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Ready to Get{" "}
              <span className="gradient-text">Recommended by AI</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Run a free AI Visibility Audit and see exactly where your brand stands
              across every generative engine. Get a scored baseline, competitor comparison,
              and prioritized action plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/free-audit"
                className="inline-flex h-12 items-center justify-center rounded-lg gradient-bg px-8 text-sm font-semibold text-white hover:opacity-90 transition-opacity gap-2"
              >
                Run Free AI Visibility Audit
                <IconArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-8 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required. Results in under 5 minutes.</p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="text-lg font-bold tracking-tight">
                <span className="text-[#6C5CE7]">Mention</span>Layer
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                The AI SEO Platform for Generative Engine Optimization.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Use Cases</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/use-cases/agencies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Agencies</Link></li>
                <li><Link href="/use-cases/brands" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Brands</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Resources</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
                <li><a href="mailto:joel@xpanddigital.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} MentionLayer. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Generative Engine Optimization for brands that want to be recommended by AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
