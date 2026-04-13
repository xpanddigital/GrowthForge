import type { Metadata } from "next";
import Link from "next/link";
import {
  PLANS,
  PUBLIC_PLANS,
  formatLimit,
  isUnlimited,
} from "@/lib/billing/plans";
import { PricingJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Pricing — AI Visibility Platform Plans",
  description:
    "MentionLayer pricing from $97/mo. Solo, Growth, Agency Light, and Agency Pro plans with full platform access, AI monitoring, and a 14-day free trial.",
  openGraph: {
    title: "Pricing — AI Visibility Platform Plans | MentionLayer",
    description:
      "Plans from $97/mo. Every feature on every plan. 14-day free trial included.",
    images: ["/api/og?title=Pricing"],
  },
};

const checkIcon = (
  <svg
    className="mt-0.5 h-4 w-4 shrink-0"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    style={{ color: "#059669" }}
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const checkIconGold = (
  <svg
    className="mt-0.5 h-4 w-4 shrink-0"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    style={{ color: "#fbbf24" }}
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
);

function planFeatures(planId: string): string[] {
  const p = PLANS[planId as keyof typeof PLANS];
  if (!p) return [];

  const clients = isUnlimited(p.maxClients)
    ? "Unlimited websites"
    : `${p.maxClients} website${p.maxClients === 1 ? "" : "s"}`;
  const keywords = isUnlimited(p.maxKeywordsPerClient)
    ? "Unlimited keywords per site"
    : `${p.maxKeywordsPerClient} keywords per site`;
  const audits = isUnlimited(p.maxAuditsPerMonth)
    ? "Unlimited AI Visibility Audits"
    : `${p.maxAuditsPerMonth} AI Visibility Audit${p.maxAuditsPerMonth === 1 ? "" : "s"} per month`;
  const credits = isUnlimited(p.monthlyCredits)
    ? "Unlimited credits"
    : `${p.monthlyCredits.toLocaleString()} credits per month`;

  const features = [
    clients,
    keywords,
    "All features included",
    "Citation Engine",
    "AI Monitor (weekly scans)",
    "PressForge",
    "Entity Sync",
    "Review Engine",
    "Technical GEO",
    audits,
    credits,
    "Client reports",
  ];

  if (p.whiteLabel) features.push("White-label reports");
  if (p.support === "dedicated_am") features.push("Dedicated account manager");
  else if (p.support === "priority") features.push("Priority support");
  else features.push("Email support");

  return features;
}

interface ComparisonRow {
  feature: string;
  solo: boolean | string;
  growth: boolean | string;
  agency: boolean | string;
  agencyPro: boolean | string;
}

const comparisonFeatures: ComparisonRow[] = [
  {
    feature: "Websites",
    solo: formatLimit(PLANS.solo.maxClients),
    growth: formatLimit(PLANS.growth.maxClients),
    agency: formatLimit(PLANS.agency.maxClients),
    agencyPro: formatLimit(PLANS.agency_pro.maxClients),
  },
  {
    feature: "Keywords per site",
    solo: formatLimit(PLANS.solo.maxKeywordsPerClient),
    growth: formatLimit(PLANS.growth.maxKeywordsPerClient),
    agency: formatLimit(PLANS.agency.maxKeywordsPerClient),
    agencyPro: formatLimit(PLANS.agency_pro.maxKeywordsPerClient),
  },
  {
    feature: "Monthly credits",
    solo: PLANS.solo.monthlyCredits.toLocaleString(),
    growth: PLANS.growth.monthlyCredits.toLocaleString(),
    agency: PLANS.agency.monthlyCredits.toLocaleString(),
    agencyPro: PLANS.agency_pro.monthlyCredits.toLocaleString(),
  },
  { feature: "Citation Engine", solo: true, growth: true, agency: true, agencyPro: true },
  { feature: "AI Monitor", solo: "Weekly", growth: "Weekly", agency: "Weekly", agencyPro: "Weekly" },
  { feature: "PressForge", solo: true, growth: true, agency: true, agencyPro: true },
  { feature: "Entity Sync", solo: true, growth: true, agency: true, agencyPro: true },
  { feature: "Review Engine", solo: true, growth: true, agency: true, agencyPro: true },
  { feature: "Technical GEO", solo: true, growth: true, agency: true, agencyPro: true },
  { feature: "YouTube GEO", solo: true, growth: true, agency: true, agencyPro: true },
  { feature: "Mention Gap Analysis", solo: true, growth: true, agency: true, agencyPro: true },
  {
    feature: "AI Visibility Audits",
    solo: `${PLANS.solo.maxAuditsPerMonth}/mo`,
    growth: `${PLANS.growth.maxAuditsPerMonth}/mo`,
    agency: `${PLANS.agency.maxAuditsPerMonth}/mo`,
    agencyPro: "Unlimited",
  },
  { feature: "Client reports", solo: true, growth: true, agency: true, agencyPro: true },
  {
    feature: "White-label reports",
    solo: PLANS.solo.whiteLabel,
    growth: PLANS.growth.whiteLabel,
    agency: PLANS.agency.whiteLabel,
    agencyPro: PLANS.agency_pro.whiteLabel,
  },
  {
    feature: "GA4 attribution",
    solo: false,
    growth: true,
    agency: true,
    agencyPro: true,
  },
  {
    feature: "Competitor intelligence",
    solo: "Basic",
    growth: "Full",
    agency: "Full",
    agencyPro: "Full",
  },
  {
    feature: "Credit overage rate",
    solo: `$${PLANS.solo.overageRatePerCredit.toFixed(2)}/cr`,
    growth: `$${PLANS.growth.overageRatePerCredit.toFixed(2)}/cr`,
    agency: `$${PLANS.agency.overageRatePerCredit.toFixed(2)}/cr`,
    agencyPro: `$${PLANS.agency_pro.overageRatePerCredit.toFixed(2)}/cr`,
  },
  {
    feature: "Support",
    solo: "Email",
    growth: "Priority",
    agency: "Priority",
    agencyPro: "Dedicated AM",
  },
];

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Every plan includes a 14-day free trial with full access. A credit card is required to start your trial, but you won\u2019t be charged until day 15. Run your first AI Visibility Audit within minutes.",
  },
  {
    question: "What are credits?",
    answer:
      "Credits power every action in MentionLayer. A SERP scan costs 1 credit per keyword, response generation costs 10 credits, and a full AI Visibility Audit costs 50 credits. Each plan comes with a monthly credit allocation. If you need more, credits are available at your plan\u2019s overage rate.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Upgrade or downgrade anytime. When you upgrade, you get immediate access to new features and credits. When you downgrade, your current plan stays active until the end of your billing cycle.",
  },
  {
    question: "What counts as a \u2018website\u2019?",
    answer:
      "A website is a single brand you manage. Each has its own brand brief, keywords, threads, and audit history. If you manage 5 brands, you need a plan that supports 5 websites.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes. Pay annually and save 20%. That brings Solo to $77/mo, Growth to $237/mo, Agency to $317/mo, and Agency Pro to $797/mo. Contact us for enterprise pricing with custom terms.",
  },
  {
    question: "Do all plans get all features?",
    answer:
      "Yes. Every plan includes the Citation Engine, AI Monitor, PressForge, Entity Sync, Review Engine, Technical GEO, YouTube GEO, and client reports. Plans differ by the number of websites, keywords, credits, and whether white-label reports are included.",
  },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <svg
        className="mx-auto h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        style={{ color: "#059669" }}
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <span className="mx-auto block h-5 text-center text-[14px]" style={{ color: "var(--ink-tertiary)" }}>
        &mdash;
      </span>
    );
  }
  return <span className="text-[14px]" style={{ color: "var(--ink)" }}>{value}</span>;
}

export default function PricingPage() {
  const visiblePlans = PUBLIC_PLANS.map((id) => ({
    ...PLANS[id],
    features: planFeatures(id),
  }));

  return (
    <div>
      <PricingJsonLd
        plans={visiblePlans.map((p) => ({
          name: p.name,
          description: p.tagline,
          price: p.priceMonthly,
        }))}
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Pricing", url: "/pricing" }]} />

      {/* ═══ HERO ═══ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p
            className="text-[13px] font-semibold tracking-wide uppercase"
            style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
          >
            Pricing
          </p>
          <h1
            className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] mx-auto max-w-[700px]"
            style={{ color: "var(--ink)" }}
          >
            Every feature. Every plan.
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            All plans include the full MentionLayer platform — Citation Engine, AI
            Monitor, PressForge, and more. Pick the plan that matches your scale.
          </p>
        </div>
      </section>

      {/* ═══ PLAN CARDS ═══ */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {visiblePlans.map((plan) => {
              const pop = plan.popular;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-8 flex flex-col ${pop ? "text-white" : ""}`}
                  style={
                    pop
                      ? { background: "var(--accent)", boxShadow: "0 8px 40px -8px rgba(61,43,224,0.3)" }
                      : { background: "var(--surface-raised)", border: "1px solid rgba(26,26,46,0.06)" }
                  }
                >
                  {pop && (
                    <span
                      className="absolute -top-3 left-6 text-[12px] font-bold px-3 py-1 rounded-full"
                      style={{ background: "#fbbf24", color: "#1a1a2e" }}
                    >
                      Most popular
                    </span>
                  )}
                  <div>
                    <p
                      className={`text-[16px] font-semibold ${pop ? "text-white" : ""}`}
                      style={pop ? {} : { color: "var(--ink)" }}
                    >
                      {plan.name}
                    </p>
                    <p
                      className={`mt-1 text-[14px] ${pop ? "text-white/60" : ""}`}
                      style={pop ? {} : { color: "var(--ink-tertiary)" }}
                    >
                      {plan.tagline}
                    </p>
                  </div>
                  <div className="mt-6 mb-1">
                    <span
                      className={`serif text-[44px] ${pop ? "text-white" : ""}`}
                      style={pop ? {} : { color: "var(--ink)" }}
                    >
                      ${plan.priceMonthly}
                    </span>
                    <span
                      className={`text-[15px] ${pop ? "text-white/60" : ""}`}
                      style={pop ? {} : { color: "var(--ink-tertiary)" }}
                    >
                      /mo
                    </span>
                  </div>
                  <p
                    className={`text-[14px] mb-6 ${pop ? "text-white/60" : ""}`}
                    style={pop ? {} : { color: "var(--ink-tertiary)" }}
                  >
                    ${plan.priceAnnualMonthly}/mo billed annually
                  </p>
                  <Link
                    href="/signup/plan"
                    className={`h-11 rounded-lg text-[15px] font-semibold inline-flex items-center justify-center transition-all ${
                      pop
                        ? "bg-white hover:bg-white/90"
                        : "hover:-translate-y-px"
                    }`}
                    style={
                      pop
                        ? { color: "var(--accent)" }
                        : { background: "var(--accent)", color: "white" }
                    }
                  >
                    Start free trial
                  </Link>
                  <ul className="mt-8 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-2.5 text-[14px] ${pop ? "text-white/85" : ""}`}
                        style={pop ? {} : { color: "var(--ink-secondary)" }}
                      >
                        {pop ? checkIconGold : checkIcon}
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p
            className="mt-10 text-[14px] text-center"
            style={{ color: "var(--ink-tertiary)" }}
          >
            14-day free trial on all plans. No charge until it ends.{" "}
            <a
              href="mailto:joel@xpanddigital.io"
              className="font-medium underline"
              style={{ color: "var(--accent)" }}
            >
              Need enterprise?
            </a>
          </p>
        </div>
      </section>

      {/* ═══ FEATURE COMPARISON TABLE ═══ */}
      <section className="py-20 sm:py-28" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <p
              className="text-[13px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
            >
              Compare
            </p>
            <h2
              className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]"
              style={{ color: "var(--ink)" }}
            >
              Compare plans
            </h2>
          </div>
          <div
            className="overflow-x-auto rounded-2xl"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid rgba(26,26,46,0.06)",
            }}
          >
            <table className="w-full text-[14px]">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
                  <th
                    className="px-6 py-4 text-left text-[13px] font-semibold"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Feature
                  </th>
                  <th
                    className="px-4 py-4 text-center text-[13px] font-semibold"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Solo
                  </th>
                  <th
                    className="px-4 py-4 text-center text-[13px] font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    Growth
                  </th>
                  <th
                    className="px-4 py-4 text-center text-[13px] font-semibold"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Agency Light
                  </th>
                  <th
                    className="px-4 py-4 text-center text-[13px] font-semibold"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Agency Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={
                      i < comparisonFeatures.length - 1
                        ? { borderBottom: "1px solid rgba(26,26,46,0.06)" }
                        : {}
                    }
                  >
                    <td
                      className="px-6 py-3.5 text-[14px]"
                      style={{ color: "var(--ink)" }}
                    >
                      {row.feature}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.solo} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.growth} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.agency} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.agencyPro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 sm:py-28" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-14">
            <p
              className="text-[13px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
            >
              FAQ
            </p>
            <h2
              className="mt-4 text-[36px] sm:text-[44px] leading-[1.08]"
              style={{ color: "var(--ink)" }}
            >
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl p-6"
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid rgba(26,26,46,0.06)",
                }}
              >
                <h3
                  className="text-[16px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {faq.question}
                </h3>
                <p
                  className="mt-2 text-[15px] leading-[1.65]"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section
        className="py-20 sm:py-28"
        style={{
          background: "var(--surface-raised)",
          borderTop: "1px solid rgba(26,26,46,0.06)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2
            className="text-[36px] sm:text-[44px] leading-[1.08]"
            style={{ color: "var(--ink)" }}
          >
            Ready to own your AI visibility?
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-[17px] leading-[1.65]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Start with a free 14-day trial. Run your first AI Visibility Audit in
            under 5 minutes. Cancel anytime during your trial.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup/plan"
              className="h-12 rounded-lg px-8 text-[15px] font-semibold inline-flex items-center justify-center transition-all hover:-translate-y-px"
              style={{ background: "var(--accent)", color: "white" }}
            >
              Start free trial
            </Link>
            <Link
              href="/how-it-works"
              className="h-12 rounded-lg px-8 text-[15px] font-semibold inline-flex items-center justify-center transition-all hover:-translate-y-px"
              style={{
                color: "var(--ink-secondary)",
                border: "1px solid rgba(26,26,46,0.12)",
              }}
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
