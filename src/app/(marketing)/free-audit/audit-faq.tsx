"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What exactly does the audit measure?",
    a: "The audit scores your brand across 5 pillars: AI Presence (how often ChatGPT, Perplexity, Gemini, and Claude recommend you), Citations (your presence in forum threads AI models reference), Entity Consistency (how consistent your brand identity is across platforms), Reviews (review signals AI models trust), and Press (earned media that builds authority). Each pillar gets a 0–100 score, rolled into a composite AI Visibility Score.",
  },
  {
    q: "How long does the audit take?",
    a: "Results are typically ready in under 5 minutes. Our system simultaneously probes multiple AI models, scans Google SERPs for citation opportunities, checks your entity data across directories, and analyzes your review and press footprint. You'll receive an email when your full report is ready.",
  },
  {
    q: "Is it really free? What's the catch?",
    a: "The audit is genuinely free — no credit card, no trial that auto-converts, no hidden fees. We offer it because the audit itself demonstrates the value of AI visibility optimization. When you see the gaps, you'll understand why agencies and brands invest in closing them.",
  },
  {
    q: "What do I need to get started?",
    a: "Just your name, email, company name, and website URL. We handle the rest — identifying your industry, generating relevant prompts, and running the full 5-pillar scan automatically.",
  },
  {
    q: "How is this different from an SEO audit?",
    a: "SEO audits measure how Google's search engine sees your website. Our audit measures how AI models — ChatGPT, Perplexity, Gemini, Claude — perceive and recommend your brand. These are fundamentally different systems. A business ranking #1 on Google can still be completely invisible to AI. Our research found 65.9% of businesses have zero AI visibility despite having traditional SEO in place.",
  },
  {
    q: "Will I get a competitor comparison?",
    a: "Yes. The audit identifies which competitors AI models recommend when users ask about your category. You'll see your Share of Model alongside theirs — and exactly where the gaps are.",
  },
];

export function AuditFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden transition-all"
          style={{
            background: open === i ? "var(--surface-raised)" : "transparent",
            border: `1px solid ${open === i ? "rgba(61,43,224,0.1)" : "rgba(26,26,46,0.06)"}`,
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between p-5 text-left"
          >
            <span
              className="text-[15px] font-medium pr-4"
              style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}
            >
              {faq.q}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink-tertiary)"
              strokeWidth="2"
              className="flex-shrink-0 transition-transform"
              style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 pb-5">
              <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink-secondary)" }}>
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
