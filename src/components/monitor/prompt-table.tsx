"use client";

import { cn } from "@/lib/utils";
import { Loader2, Zap } from "lucide-react";

interface PromptRow {
  id: string;
  prompt_text: string;
  source: string;
  keyword?: string;
  test_models: string[];
  is_active: boolean;
  last_used_at: string | null;
  times_used: number;
  last_brand_mentioned: boolean | null;
}

interface PromptTableProps {
  prompts: PromptRow[];
  onToggleActive?: (promptId: string, active: boolean) => void;
  onDelete?: (promptId: string) => void;
  onQuickTest?: (promptText: string, model: string) => void;
  testingPromptId?: string | null;
}

const MODEL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  claude: "Claude",
  google_ai_overview: "AIO",
};

export function PromptTable({ prompts, onToggleActive, onDelete, onQuickTest, testingPromptId }: PromptTableProps) {
  if (prompts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No prompts configured. Enable keyword monitoring or add custom prompts.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Prompt</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Models</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Used</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Last Result</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((prompt) => {
              const isTesting = testingPromptId === prompt.id;
              return (
                <tr key={prompt.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 max-w-[300px]">
                    <p className="truncate text-foreground">{prompt.prompt_text}</p>
                    {prompt.keyword && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Keyword: {prompt.keyword}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        prompt.source === "ai_generated"
                          ? "bg-purple-500/10 text-purple-400"
                          : prompt.source === "template"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {prompt.source === "ai_generated" ? "AI" : prompt.source === "template" ? "Template" : "Manual"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {prompt.test_models.map((model) => (
                        <button
                          key={model}
                          onClick={() => onQuickTest?.(prompt.prompt_text, model)}
                          disabled={isTesting}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded transition-colors",
                            onQuickTest
                              ? "bg-muted/30 text-muted-foreground hover:bg-primary/20 hover:text-primary cursor-pointer"
                              : "bg-muted/30 text-muted-foreground"
                          )}
                          title={onQuickTest ? `Quick test on ${MODEL_LABELS[model] || model}` : undefined}
                        >
                          {MODEL_LABELS[model] || model}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {prompt.times_used}x
                  </td>
                  <td className="px-4 py-3 text-center">
                    {prompt.last_brand_mentioned === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : prompt.last_brand_mentioned ? (
                      <span className="text-emerald-400">Cited</span>
                    ) : (
                      <span className="text-red-400">Not cited</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onToggleActive?.(prompt.id, !prompt.is_active)}
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer transition-colors",
                        prompt.is_active
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {prompt.is_active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onQuickTest && (
                        <button
                          onClick={() => onQuickTest(prompt.prompt_text, "perplexity")}
                          disabled={isTesting}
                          className={cn(
                            "inline-flex items-center gap-1 text-xs transition-colors",
                            isTesting
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                          )}
                          title="Quick test on Perplexity"
                        >
                          {isTesting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Zap className="h-3 w-3" />
                          )}
                          {isTesting ? "Testing..." : "Test"}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(prompt.id)}
                          className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
