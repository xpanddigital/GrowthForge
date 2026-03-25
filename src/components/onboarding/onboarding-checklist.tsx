"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const checklistItems = [
  { id: "add-client", label: "Add your first client", href: "/dashboard/clients/new" },
  { id: "add-keywords", label: "Add keywords", href: "/dashboard/clients" },
  { id: "run-audit", label: "Run an AI visibility audit", href: "/dashboard/audits" },
  { id: "citation-engine", label: "Explore the Citation Engine", href: "/dashboard/citations" },
  { id: "generate-responses", label: "Generate responses", href: "/dashboard/citations" },
  { id: "ai-monitor", label: "Set up AI Monitor", href: "/dashboard/monitor" },
];

const STORAGE_KEY = "gf-welcome-guide";

export function OnboardingChecklist() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        setCompleted(state.completed || []);
        setDismissed(state.checklistDismissed || false);
      } else {
        setDismissed(false);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const state = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, checklistDismissed: true })
      );
    } catch {
      // ignore
    }
  };

  const handleCheck = (id: string) => {
    const next = completed.includes(id)
      ? completed.filter((c) => c !== id)
      : [...completed, id];
    setCompleted(next);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const state = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, completed: next })
      );
    } catch {
      // ignore
    }
  };

  if (!mounted || dismissed) return null;

  const allDone = checklistItems.every((item) =>
    completed.includes(item.id)
  );

  if (allDone) return null;

  const doneCount = checklistItems.filter((item) =>
    completed.includes(item.id)
  ).length;

  return (
    <div className="mx-3 mb-3 rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          Setup Progress
        </span>
        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {/* Progress */}
      <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-[#6C5CE7] transition-all duration-300"
          style={{
            width: `${(doneCount / checklistItems.length) * 100}%`,
          }}
        />
      </div>

      <ul className="space-y-1">
        {checklistItems.map((item) => {
          const isDone = completed.includes(item.id);
          return (
            <li key={item.id} className="flex items-center gap-2">
              <button
                onClick={() => handleCheck(item.id)}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  isDone
                    ? "border-[#6C5CE7] bg-[#6C5CE7]"
                    : "border-border hover:border-[#6C5CE7]/50"
                }`}
              >
                {isDone && (
                  <svg
                    className="h-2.5 w-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <Link
                href={item.href}
                className={`text-xs transition-colors ${
                  isDone
                    ? "text-muted-foreground line-through"
                    : "text-foreground hover:text-[#6C5CE7]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
