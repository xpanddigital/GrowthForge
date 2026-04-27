import type { Metadata } from "next";
import { MLNav } from "@/components/marketing/ml-nav";
import { MLFooter } from "@/components/marketing/ml-footer";
import { ExplorerClient } from "./explorer-client";
import { industries, markets, slotData } from "@/lib/research/study2-data";

export const metadata: Metadata = {
  title:
    "Explore the Off-Page AI Visibility Index | MentionLayer Research",
  description:
    "Pick your industry × market. See the top 5 predictors of AI visibility, the addressable citation share, the top cited domains, and the visible-vs-invisible profile for that exact slot. Browse the 32-slot dataset from the largest cross-market controlled GEO study published anywhere.",
  robots: { index: true, follow: false },
  openGraph: {
    title: "Explore the Off-Page AI Visibility Index",
    description:
      "Pick your industry × market — see your slot's top predictors, addressable share, and visible-vs-invisible profile from 2,729 businesses.",
    type: "website",
  },
};

export default function ExplorePage() {
  return (
    <div className="ml">
      <MLNav />

      {/* HEADER */}
      <section className="pt-28 pb-10 sm:pt-32">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-[13px] mb-5">
            <a
              href="/research/q2-2026-off-page-decomposition"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium"
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
              Back to Study 2
            </a>
            <span style={{ color: "var(--ink-tertiary)" }}>·</span>
            <span style={{ color: "var(--ink-tertiary)" }}>
              Q2 2026 · 32 industry-city slots · 2,729 businesses
            </span>
          </div>

          <h1
            className="text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.06] tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Explore the data — by industry × market
          </h1>
          <p
            className="mt-4 text-[17px] leading-[1.6] max-w-[680px]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Pick your slot. See the top 5 signals predicting AI visibility for that exact industry-city combination, the addressable citation share, the top domains AI cites, and the visible-vs-invisible profile. Drawn from the 32-slot Q2 2026 study.
          </p>
        </div>
      </section>

      {/* EXPLORER (CLIENT COMPONENT, EMAIL-GATED) */}
      <ExplorerClient
        industries={industries}
        markets={markets}
        slots={slotData}
      />

      <MLFooter />
    </div>
  );
}
