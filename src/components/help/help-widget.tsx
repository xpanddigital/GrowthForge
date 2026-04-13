"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FAQ {
  question: string;
  answer: string;
  articleSlug: string;
  contexts: string[]; // path segments this FAQ is relevant to
}

const faqs: FAQ[] = [
  {
    question: "How do I add a new client?",
    answer:
      "Go to Clients in the sidebar, click 'Add Client', and fill in the brand name, website, brand brief, tone guidelines, and target audience. The brand brief is the most important field — it drives all AI-generated content.",
    articleSlug: "getting-started",
    contexts: ["clients", "dashboard"],
  },
  {
    question: "What should I put in the brand brief?",
    answer:
      "Describe what the business does, who it serves, and what makes it different — in 250 words or less. Be specific: include years in business, customer counts, and unique selling points. Avoid generic marketing fluff. This text gets injected into every AI prompt.",
    articleSlug: "getting-started",
    contexts: ["clients"],
  },
  {
    question: "How often does the discovery scan run?",
    answer:
      "Automatically twice per week (Tuesday and Friday). You can also trigger a manual scan anytime from the Citation Engine page.",
    articleSlug: "citation-engine",
    contexts: ["citations"],
  },
  {
    question: "What's the difference between the 3 response variants?",
    answer:
      "Casual Helper: short, personal experience. Expert Authority: deep knowledge, positions brand as one option. Story-Based: personal narrative where the brand mention feels incidental. Pick whichever matches the thread's tone.",
    articleSlug: "citation-engine",
    contexts: ["citations"],
  },
  {
    question: "How do I copy and post a response?",
    answer:
      "Click the copy icon on any variant to copy the text. Navigate to the thread on Reddit/Quora and paste it as a comment. Return to MentionLayer and click 'Mark as Posted' to track it.",
    articleSlug: "citation-engine",
    contexts: ["citations"],
  },
  {
    question: "What does the AI Visibility Score mean?",
    answer:
      "It's a composite score (0-100) measuring 5 pillars: Citations (25%), AI Presence (30%), Entities (15%), Reviews (15%), and Press (15%). Most new clients score 15-35. Above 75 means category leadership.",
    articleSlug: "ai-visibility-audit",
    contexts: ["audits", "dashboard"],
  },
  {
    question: "How is the opportunity score calculated?",
    answer:
      "Composite of: relevance to brand (35%), Google SERP position (25%), thread recency (20%), and engagement level (20%). Threads scoring 70+ auto-advance to your queue.",
    articleSlug: "citation-engine",
    contexts: ["citations"],
  },
  {
    question: "Which AI models does the monitor test?",
    answer:
      "ChatGPT (GPT-4o), Perplexity (Sonar Pro), Google Gemini, and Claude. Each is tested independently with the same prompts.",
    articleSlug: "ai-monitor",
    contexts: ["monitor"],
  },
  {
    question: "How often should I re-run the audit?",
    answer:
      "Monthly is ideal. Each audit is stored as a snapshot, giving you a trend line that proves ROI. The month-over-month comparison is how you demonstrate value to clients.",
    articleSlug: "ai-visibility-audit",
    contexts: ["audits"],
  },
  {
    question: "What is share-of-model?",
    answer:
      "The percentage of relevant AI prompts where your brand is mentioned or recommended. Like share of voice, but for AI recommendations. Test 40 prompts, appear in 8 = 20% share of model.",
    articleSlug: "ai-monitor",
    contexts: ["monitor"],
  },
  {
    question: "Why are some threads marked as 'expired'?",
    answer:
      "Threads get marked expired when they're locked, archived, or too old for new comments. Reddit archives threads after 6 months by default. MentionLayer checks during enrichment and marks stale threads automatically.",
    articleSlug: "citation-engine",
    contexts: ["citations"],
  },
  {
    question: "How does entity sync improve AI visibility?",
    answer:
      "AI models build understanding from multiple sources (LinkedIn, Google Business, Crunchbase, etc.). If those sources contradict each other, AI confidence drops. Entity Sync ensures all sources tell the same story.",
    articleSlug: "entity-sync",
    contexts: ["entities"],
  },
  {
    question: "What is llms.txt and do I need it?",
    answer:
      "A proposed standard (like robots.txt for AI) that tells AI crawlers key facts about your business. MentionLayer generates it from your canonical description. Not universally adopted yet, but early implementation signals AI-readiness.",
    articleSlug: "entity-sync",
    contexts: ["entities"],
  },
  {
    question: "How do I generate a press release?",
    answer:
      "Go to PressForge → Campaigns → New Campaign. Select a press idea, and MentionLayer drafts a full release using Claude Opus. Review, edit, add real quotes, then approve for distribution.",
    articleSlug: "pressforge",
    contexts: ["press"],
  },
  {
    question: "What platforms does the review engine scan?",
    answer:
      "Google Reviews, Trustpilot, G2, Capterra, Yelp, Product Hunt, and industry-specific platforms. The specific platforms depend on your business category.",
    articleSlug: "review-engine",
    contexts: ["reviews"],
  },
  {
    question: "How do I set up review request campaigns?",
    answer:
      "Review Engine → Campaigns → New Campaign. Choose target platform, customize the email template, select your audience, set drip schedule, and launch. Monitor open rates and actual reviews received.",
    articleSlug: "review-engine",
    contexts: ["reviews"],
  },
  {
    question: "What does the Technical GEO scan check?",
    answer:
      "Three things: your robots.txt (which AI crawlers are allowed), content freshness (staleness risk), and citability score (how easy it is for AI to extract citable info from your site).",
    articleSlug: "technical-geo",
    contexts: ["technical-geo"],
  },
  {
    question: "Why should I unblock AI crawlers in robots.txt?",
    answer:
      "If GPTBot, ClaudeBot, or PerplexityBot are blocked, those AI models can't read your site. They'll rely entirely on third-party sources which may be incomplete or inaccurate. Unblocking lets them access your authoritative content directly.",
    articleSlug: "technical-geo",
    contexts: ["technical-geo"],
  },
  {
    question: "What is a mention gap?",
    answer:
      "Any place where a competitor is mentioned or recommended and your brand is not — a Reddit thread, YouTube video, G2 page, or AI model response. Each gap is a missed visibility opportunity.",
    articleSlug: "mention-gaps",
    contexts: ["mentions"],
  },
  {
    question: "How do I export a client report?",
    answer:
      "Go to Reports → select a date range → click 'Export PDF.' The report includes audit scores, trends, citation placements, AI monitor results, and competitor comparison. White-labeled with your agency branding.",
    articleSlug: "roi-reporting",
    contexts: ["reports"],
  },
];

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  // Get current page context from pathname
  const currentContext = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments;
  }, [pathname]);

  // Filter and sort FAQs by context relevance and search
  const filteredFaqs = useMemo(() => {
    let results = faqs;

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (faq) =>
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q)
      );
    } else {
      // Sort context-relevant FAQs first
      results = [...results].sort((a, b) => {
        const aRelevant = a.contexts.some((c) =>
          currentContext.some((seg) => seg.includes(c))
        );
        const bRelevant = b.contexts.some((c) =>
          currentContext.some((seg) => seg.includes(c))
        );
        if (aRelevant && !bRelevant) return -1;
        if (!aRelevant && bRelevant) return 1;
        return 0;
      });
    }

    return results.slice(0, 8);
  }, [search, currentContext]);

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#6C5CE7] text-white shadow-lg transition-all hover:bg-[#5A4BD1] hover:shadow-xl"
        aria-label="Help"
      >
        {isOpen ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 0v.5m0-6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
          </svg>
        )}
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-40 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-2xl sm:w-96">
          {/* Header */}
          <div className="border-b border-border bg-[#6C5CE7]/5 p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Help & FAQ
            </h3>
            <div className="mt-2 relative">
              <svg
                className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search help articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#6C5CE7] focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>

          {/* FAQ List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredFaqs.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No matching questions found.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFaqs.map((faq, i) => (
                  <FAQItem key={i} faq={faq} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border p-3">
            <Link
              href="/help"
              className="text-xs text-[#6C5CE7] hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Browse all articles
            </Link>
            <a
              href="mailto:joel@xpanddigital.io"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Contact support
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function FAQItem({ faq }: { faq: FAQ }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-md border border-transparent hover:border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-2 p-2.5 text-left"
      >
        <svg
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-xs font-medium text-foreground">
          {faq.question}
        </span>
      </button>
      {expanded && (
        <div className="px-2.5 pb-2.5 pl-7">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {faq.answer}
          </p>
          <Link
            href={`/help/${faq.articleSlug}`}
            className="mt-1.5 inline-block text-xs text-[#6C5CE7] hover:underline"
          >
            Read full article →
          </Link>
        </div>
      )}
    </div>
  );
}
