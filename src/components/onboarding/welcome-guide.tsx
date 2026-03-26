"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: { label: string; href: string };
}

const steps: WelcomeStep[] = [
  {
    id: "welcome",
    title: "Welcome to MentionLayer",
    description:
      "MentionLayer is an AI visibility platform that helps you get your brand recommended by ChatGPT, Perplexity, Gemini, and Claude. It discovers high-authority forum threads, generates authentic responses, monitors AI citations, and tracks your visibility score over time.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: "add-client",
    title: "Add Your First Client",
    description:
      "Create a client profile with a brand brief, tone guidelines, and target audience. The brand brief is the most important field — it drives all AI-generated content. Be specific about what the business does, who it serves, and what makes it different.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    ),
    action: { label: "Add Client", href: "/dashboard/clients/new" },
  },
  {
    id: "add-keywords",
    title: "Add Keywords",
    description:
      "Keywords power the discovery engine. Add 10-20 buying-intent terms like \"best [product]\", \"[product] alternatives\", or \"[competitor] vs\". MentionLayer can also suggest keywords based on your brand brief.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
    action: { label: "Manage Keywords", href: "/dashboard/clients" },
  },
  {
    id: "run-audit",
    title: "Run Your First AI Visibility Audit",
    description:
      "The audit scans 5 pillars — Citations, AI Presence, Entities, Reviews, and Press — to produce a baseline score. Most new clients score 15-35, which means massive opportunity. The audit takes 3-5 minutes.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    action: { label: "Run Audit", href: "/dashboard/audits" },
  },
  {
    id: "citation-engine",
    title: "Explore the Citation Engine",
    description:
      "The Citation Engine is your daily working screen. It shows discovered Reddit, Quora, and Facebook Group threads where you can place brand citations. Threads are ranked by opportunity score so you focus on the highest-value targets.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    action: { label: "Open Citation Engine", href: "/dashboard/citations" },
  },
  {
    id: "generate-responses",
    title: "Generate Your First Responses",
    description:
      "Click \"Generate\" on any thread to create 3 response variants — Casual Helper, Expert Authority, and Story-Based. Each is crafted to sound like a genuine community member. Copy, review, and post manually to the thread.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    action: { label: "Go to Citation Engine", href: "/dashboard/citations" },
  },
  {
    id: "ai-monitor",
    title: "Check AI Monitor",
    description:
      "Set up monitoring prompts to track whether AI models mention your brand. This is your north-star metric. Over time, as you seed citations and build authority, your share of model will increase.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    action: { label: "Open AI Monitor", href: "/dashboard/monitor" },
  },
];

const STORAGE_KEY = "gf-welcome-guide";

interface GuideState {
  dismissed: boolean;
  completed: string[];
  currentStep: number;
}

function getStoredState(): GuideState {
  if (typeof window === "undefined") {
    return { dismissed: false, completed: [], currentStep: 0 };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return { dismissed: false, completed: [], currentStep: 0 };
}

export function WelcomeGuide() {
  const [state, setState] = useState<GuideState>({
    dismissed: true, // default to dismissed to prevent flash
    completed: [],
    currentStep: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(getStoredState());
    setMounted(true);
  }, []);

  const persist = useCallback((next: GuideState) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const handleNext = () => {
    const next = {
      ...state,
      currentStep: Math.min(state.currentStep + 1, steps.length - 1),
    };
    persist(next);
  };

  const handlePrev = () => {
    const next = {
      ...state,
      currentStep: Math.max(state.currentStep - 1, 0),
    };
    persist(next);
  };

  const handleDismiss = () => {
    persist({ ...state, dismissed: true });
  };

  const handleComplete = () => {
    const stepId = steps[state.currentStep].id;
    const completed = state.completed.includes(stepId)
      ? state.completed
      : [...state.completed, stepId];
    const isLast = state.currentStep === steps.length - 1;
    persist({
      ...state,
      completed,
      currentStep: isLast ? state.currentStep : state.currentStep + 1,
      dismissed: isLast,
    });
  };

  if (!mounted || state.dismissed) return null;

  const step = steps[state.currentStep];
  const progress = ((state.currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 w-full overflow-hidden rounded-t-xl bg-muted">
          <div
            className="h-full bg-[#6C5CE7] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Step indicator */}
          <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {state.currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip guide
            </button>
          </div>

          {/* Icon */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7]">
            {step.icon}
          </div>

          {/* Content */}
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            {step.title}
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </p>

          {/* Action link */}
          {step.action && (
            <Link
              href={step.action.href}
              onClick={handleComplete}
              className="mb-4 inline-block rounded-md bg-[#6C5CE7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
            >
              {step.action.label} →
            </Link>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <button
              onClick={handlePrev}
              disabled={state.currentStep === 0}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              ← Previous
            </button>

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === state.currentStep
                      ? "bg-[#6C5CE7]"
                      : i < state.currentStep || state.completed.includes(steps[i].id)
                        ? "bg-[#6C5CE7]/40"
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {state.currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="text-sm font-medium text-[#6C5CE7] transition-colors hover:text-[#5A4BD1]"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleDismiss}
                className="text-sm font-medium text-[#6C5CE7] transition-colors hover:text-[#5A4BD1]"
              >
                Get Started →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
