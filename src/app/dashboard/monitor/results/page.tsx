"use client";

import { useEffect, useState, useCallback } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { ResultDetail } from "@/components/monitor/result-detail";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

interface MonitorResult {
  id: string;
  ai_model: string;
  brand_mentioned: boolean;
  brand_recommended: boolean;
  brand_linked: boolean;
  brand_source_urls: string[];
  mention_context: string | null;
  mention_position: string | null;
  prominence_score: number;
  sentiment: string | null;
  sources_cited: string[];
  competitor_details: Array<{
    name: string;
    mentioned: boolean;
    recommended: boolean;
    sentiment: string | null;
    context: string | null;
  }>;
  competitor_mentions: string[];
  full_response: string;
  response_hash: string | null;
  tested_at: string;
  prompt_text?: string | null;
}

const MODELS = [
  { value: "all", label: "All Models" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "perplexity", label: "Perplexity" },
  { value: "gemini", label: "Gemini" },
  { value: "claude", label: "Claude" },
  { value: "google_ai_overview", label: "AI Overview" },
];

export default function MonitorResultsPage() {
  useEffect(() => { document.title = "AI Monitor — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [results, setResults] = useState<MonitorResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelFilter, setModelFilter] = useState("all");
  const [mentionFilter, setMentionFilter] = useState<"all" | "mentioned" | "not_mentioned">("all");
  const [selectedResult, setSelectedResult] = useState<MonitorResult | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ clientId: selectedClientId, limit: "50" });
      if (modelFilter !== "all") params.set("model", modelFilter);
      if (mentionFilter === "mentioned") params.set("brandMentioned", "true");
      if (mentionFilter === "not_mentioned") params.set("brandMentioned", "false");

      const res = await fetch(`/api/monitor/results?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : data.results || []);
      }
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, modelFilter, mentionFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Test Results</h2>
        <EmptyState
          icon={FileText}
          title="No client selected"
          description="Select a client to view monitoring results."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Test Results</h2>
        <p className="text-sm text-muted-foreground">
          All AI model test results for {selectedClientName}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1">
          {MODELS.map((m) => (
            <button
              key={m.value}
              onClick={() => setModelFilter(m.value)}
              className={cn(
                "text-xs px-2.5 py-1 rounded transition-colors",
                modelFilter === m.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {[
            { value: "all" as const, label: "All" },
            { value: "mentioned" as const, label: "Mentioned" },
            { value: "not_mentioned" as const, label: "Not Mentioned" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setMentionFilter(f.value)}
              className={cn(
                "text-xs px-2.5 py-1 rounded transition-colors",
                mentionFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No results yet"
          description="Run a monitoring scan to see test results."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Result list */}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => setSelectedResult(result)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  selectedResult?.id === result.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/10"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">
                    {MODELS.find((m) => m.value === result.ai_model)?.label || result.ai_model}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      result.brand_mentioned
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {result.brand_mentioned ? "Cited" : "Not Cited"}
                  </span>
                </div>
                {result.prompt_text && (
                  <p className="text-xs text-foreground/70 truncate italic mb-0.5">
                    &ldquo;{result.prompt_text}&rdquo;
                  </p>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {result.full_response?.substring(0, 100) || "(No response)"}...
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(result.tested_at).toLocaleDateString()} · Prominence: {result.prominence_score}
                </p>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="sticky top-4">
            {selectedResult ? (
              <ResultDetail
                result={selectedResult}
                clientName={selectedClientName || ""}
                onClose={() => setSelectedResult(null)}
              />
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Select a result to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
