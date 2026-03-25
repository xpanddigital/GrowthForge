import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | GrowthForge — AI Visibility Platform Plans",
  description:
    "GrowthForge pricing: Starter ($297/mo), Growth ($597/mo), and Agency Pro ($997/mo). All plans include Citation Engine and AI Monitor. Start free.",
};

const checkIcon = (
  <svg
    className="mt-0.5 h-4 w-4 shrink-0 text-[#00D2D3]"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const plans = [
  {
    name: "Starter",
    price: "$297",
    description: "For agencies getting started with AI visibility.",
    popular: false,
    features: [
      "3 clients",
      "30 keywords per client",
      "Citation Engine",
      "AI Monitor (weekly scans)",
      "1 free AI Visibility Audit per month",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$597",
    description: "Full platform access for growing agencies.",
    popular: true,
    features: [
      "10 clients",
      "100 keywords per client",
      "Citation Engine",
      "AI Monitor (daily scans)",
      "PressForge",
      "Entity Sync",
      "Review Engine",
      "Technical GEO",
      "YouTube GEO",
      "Mention Gap Analysis",
      "5 AI Visibility Audits per month",
      "Priority support",
    ],
  },
  {
    name: "Agency Pro",
    price: "$997",
    description: "Everything, unlimited, white-labeled.",
    popular: false,
    features: [
      "Unlimited clients",
      "Unlimited keywords",
      "All Growth features",
      "White-label reports",
      "GA4 attribution dashboard",
      "Competitor intelligence",
      "Unlimited AI Visibility Audits",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

const comparisonFeatures = [
  { feature: "Clients", starter: "3", growth: "10", agency: "Unlimited" },
  {
    feature: "Keywords per client",
    starter: "30",
    growth: "100",
    agency: "Unlimited",
  },
  { feature: "Citation Engine", starter: true, growth: true, agency: true },
  {
    feature: "AI Monitor",
    starter: "Weekly",
    growth: "Daily",
    agency: "Daily",
  },
  {
    feature: "AI Visibility Audits",
    starter: "1/mo",
    growth: "5/mo",
    agency: "Unlimited",
  },
  { feature: "PressForge", starter: false, growth: true, agency: true },
  { feature: "Entity Sync", starter: false, growth: true, agency: true },
  { feature: "Review Engine", starter: false, growth: true, agency: true },
  { feature: "Technical GEO", starter: false, growth: true, agency: true },
  { feature: "YouTube GEO", starter: false, growth: true, agency: true },
  {
    feature: "Mention Gap Analysis",
    starter: false,
    growth: true,
    agency: true,
  },
  {
    feature: "White-label reports",
    starter: false,
    growth: false,
    agency: true,
  },
  {
    feature: "GA4 attribution",
    starter: false,
    growth: false,
    agency: true,
  },
  {
    feature: "Competitor intelligence",
    starter: false,
    growth: false,
    agency: true,
  },
  {
    feature: "Custom integrations",
    starter: false,
    growth: false,
    agency: true,
  },
  {
    feature: "Support",
    starter: "Email",
    growth: "Priority",
    agency: "Dedicated AM",
  },
];

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Every plan includes a 14-day free trial with full access. No credit card required to start. Run your first AI Visibility Audit within minutes.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Upgrade or downgrade anytime. When you upgrade, you get immediate access to new features. When you downgrade, your current plan stays active until the end of your billing cycle.",
  },
  {
    question: "What counts as a 'client'?",
    answer:
      "A client is a single brand you manage. Each client has their own brand brief, keywords, threads, and audit history. If you manage 5 brands, you need a plan that supports 5 clients.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes. Pay annually and save 20%. That brings Starter to $237/mo, Growth to $477/mo, and Agency Pro to $797/mo. Contact us for enterprise pricing with custom terms.",
  },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <svg
        className="mx-auto h-5 w-5 text-[#00D2D3]"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <span className="mx-auto block h-5 text-center text-muted-foreground/40">
        &mdash;
      </span>
    );
  }
  return <span className="text-sm text-foreground">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="px-4 pb-16 pt-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Simple pricing. No hidden fees.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Every plan includes the Citation Engine and AI Monitor. Pick the one
          that matches your agency size, upgrade when you need more.
        </p>
      </section>

      {/* Plan Cards */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-8 ${
                plan.popular
                  ? "border-[#6C5CE7] bg-card shadow-lg shadow-[#6C5CE7]/10"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#6C5CE7] px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="mt-6">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <Link
                href="/signup"
                className={`mt-6 block rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                  plan.popular
                    ? "bg-[#6C5CE7] text-white hover:bg-[#5A4BD1]"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Start free trial
              </Link>
              <ul className="mt-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    {checkIcon}
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
          Compare plans
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                  Feature
                </th>
                <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                  Starter
                </th>
                <th className="px-6 py-4 text-center font-medium text-foreground">
                  Growth
                </th>
                <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                  Agency Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, i) => (
                <tr
                  key={row.feature}
                  className={
                    i < comparisonFeatures.length - 1
                      ? "border-b border-border"
                      : ""
                  }
                >
                  <td className="px-6 py-3.5 text-sm text-foreground">
                    {row.feature}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <ComparisonCell value={row.starter} />
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <ComparisonCell value={row.growth} />
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <ComparisonCell value={row.agency} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h3 className="font-medium text-foreground">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card px-4 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Ready to own your AI visibility?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Start with a free 14-day trial. Run your first AI Visibility Audit in
          under 5 minutes. No credit card required.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-[#6C5CE7] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Start free trial
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            See how it works
          </Link>
        </div>
      </section>
    </div>
  );
}
