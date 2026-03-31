import Link from "next/link";
import type { Metadata } from "next";
import { ServiceJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Done-for-You AI Visibility Services",
  description:
    "Let our team handle your entire AI visibility strategy. Citation seeding, press campaigns, entity optimization, and AI monitoring — fully managed for you.",
  openGraph: {
    title: "Done-for-You AI Visibility Services | MentionLayer",
    description:
      "Fully managed AI visibility. Citation seeding, press campaigns, entity optimization, and ongoing monitoring.",
    images: ["/api/og?title=Done-for-You+Services"],
  },
};

const services = [
  {
    name: "Full-Service AI Visibility",
    description:
      "We run every module for you — citation seeding, press campaigns, entity sync, review management, and AI monitoring. You get monthly reports showing your brand climbing in AI recommendations.",
    features: [
      "Dedicated AI visibility strategist",
      "Weekly citation seeding across Reddit, Quora, and forums",
      "Monthly press campaigns via PressForge",
      "Entity consistency audit and fixes",
      "Review generation campaigns",
      "Weekly AI Monitor tracking across ChatGPT, Perplexity, Gemini, and Claude",
      "Monthly executive reports with Share of Model trends",
    ],
    ideal: "Brands and agencies who want results without lifting a finger.",
    cta: "Talk to Us",
  },
  {
    name: "Citation Seeding Sprint",
    description:
      "A focused 90-day engagement to seed your brand into the high-authority threads that AI models already reference. We handle discovery, response writing, and posting.",
    features: [
      "Full keyword research and thread discovery",
      "100+ hand-crafted, community-native responses",
      "Platform-specific tone matching (Reddit, Quora, FB Groups)",
      "Baseline and exit AI visibility audit",
      "Final report with before/after Share of Model data",
    ],
    ideal: "Brands launching a new product or entering a new market.",
    cta: "Talk to Us",
  },
  {
    name: "AI Visibility Audit + Strategy",
    description:
      "Our team runs a comprehensive audit across all five pillars and delivers a prioritized action plan with specific next steps your team can execute.",
    features: [
      "Full 5-pillar AI Visibility Audit",
      "Competitor benchmarking (up to 5 competitors)",
      "Prioritized action plan ranked by impact and effort",
      "60-minute strategy call to walk through findings",
      "PDF report you can share with stakeholders",
    ],
    ideal: "Teams evaluating their AI visibility posture before committing to a campaign.",
    cta: "Talk to Us",
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <ServiceJsonLd
        name="Done-for-You AI Visibility Services"
        description="Let our team handle your entire AI visibility strategy. Citation seeding, press campaigns, entity optimization, and ongoing AI monitoring — fully managed."
        url="/services"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Services", url: "/services" }]} />
      {/* Hero */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Done-for-You
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          We&apos;ll Handle Everything
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Don&apos;t have the time or team to run AI visibility campaigns
          yourself? Our experts will do it for you — same platform, proven
          playbook, your brand growing in AI recommendations.
        </p>
      </div>

      {/* Services */}
      <div className="mt-16 space-y-8">
        {services.map((service) => (
          <div
            key={service.name}
            className="rounded-xl border border-border bg-card p-8"
          >
            <h2 className="text-xl font-bold">{service.name}</h2>
            <p className="mt-2 text-muted-foreground">{service.description}</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  What&apos;s included
                </h3>
                <ul className="mt-3 space-y-2">
                  {service.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 text-primary">&#x2713;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Ideal for
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {service.ideal}
                </p>
                <Link
                  href="/services/inquiry"
                  className="mt-6 inline-block rounded-md bg-[#6C5CE7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
                >
                  {service.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h2 className="text-2xl font-bold">Not sure which option is right?</h2>
        <p className="mt-2 text-muted-foreground">
          Start with a free AI Visibility Audit — we&apos;ll show you exactly
          where you stand and recommend the best path forward.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/free-audit"
            className="rounded-md bg-[#6C5CE7] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Get Your Free Audit
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            View SaaS Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
