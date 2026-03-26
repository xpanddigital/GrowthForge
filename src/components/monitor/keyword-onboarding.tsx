"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Keyword {
  id: string;
  keyword: string;
  tags: string[];
  is_active: boolean;
}

interface KeywordOnboardingProps {
  clientId: string;
  clientName: string;
  keywords: Keyword[];
  onEnable: (keywordIds: string[]) => Promise<void>;
  onClose: () => void;
}

export function KeywordOnboarding({
  clientName,
  keywords,
  onEnable,
  onClose,
}: KeywordOnboardingProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(keywords.filter((k) => k.is_active).map((k) => k.id))
  );
  const [, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "generating" | "done">("select");
  const [progress, setProgress] = useState(0);

  const toggleKeyword = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(keywords.map((k) => k.id)));
  };

  const selectNone = () => {
    setSelected(new Set());
  };

  const handleEnable = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    setStep("generating");

    // Simulate progress while the actual API call runs
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 500);

    try {
      await onEnable(Array.from(selected));
      clearInterval(interval);
      setProgress(100);
      setStep("done");
    } catch {
      clearInterval(interval);
      setLoading(false);
      setStep("select");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Enable AI Monitoring</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Select keywords to monitor across 5 AI models for {clientName}
          </p>
        </div>

        {step === "select" && (
          <>
            {/* Keyword selection */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  {selected.size} of {keywords.length} keywords selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Select all
                  </button>
                  <button
                    onClick={selectNone}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {keywords.map((kw) => (
                  <button
                    key={kw.id}
                    onClick={() => toggleKeyword(kw.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                      selected.has(kw.id)
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/10 border border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                        selected.has(kw.id)
                          ? "bg-primary border-primary"
                          : "border-border"
                      )}
                    >
                      {selected.has(kw.id) && (
                        <span className="text-[10px] text-primary-foreground">✓</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-foreground">{kw.keyword}</span>
                      {kw.tags.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {kw.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1 py-0 rounded bg-muted/30 text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {keywords.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No keywords found. Add keywords to the client first.
                  </p>
                </div>
              )}
            </div>

            {/* Info box */}
            <div className="mx-6 mb-4 rounded-md bg-muted/20 border border-border p-3">
              <p className="text-xs text-muted-foreground">
                For each keyword, MentionLayer will generate 5 prompt variations and test them across
                ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews. Cost: 5 credits per
                keyword for prompt generation + 3 credits per test.
              </p>
            </div>

            {/* Actions */}
            <div className="border-t border-border px-6 py-3 flex justify-between">
              <button
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnable}
                disabled={selected.size === 0}
                className={cn(
                  "px-4 py-1.5 text-sm rounded-md transition-colors",
                  selected.size > 0
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                Enable Monitoring ({selected.size} keywords)
              </button>
            </div>
          </>
        )}

        {step === "generating" && (
          <div className="px-6 py-12 text-center">
            <div className="w-48 h-2 bg-muted/30 rounded-full mx-auto mb-4 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-foreground mb-1">Generating prompt variations...</p>
            <p className="text-xs text-muted-foreground">
              Creating 5 AI-optimized prompts per keyword
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-base font-medium text-foreground mb-1">Monitoring Enabled</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {selected.size} keywords are now being monitored across 5 AI models.
              Your first AI Visibility Score will be available after the next scan.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
