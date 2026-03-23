"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { PromptTable } from "@/components/monitor/prompt-table";
import { TemplatePicker } from "@/components/monitor/template-picker";
import { MessageSquare, X, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface PromptTemplate {
  id: string;
  template_name: string;
  template_text: string;
  vertical: string;
  prompt_type: string;
  is_system_template: boolean;
}

interface QuickTestResult {
  model: string;
  brandMentioned: boolean;
  brandRecommended: boolean;
  brandLinked: boolean;
  prominenceScore: number;
  sentiment: string | null;
  mentionContext: string | null;
  competitorsMentioned: string[];
  sourcesCited: string[];
  fullResponse: string;
}

const MODEL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  claude: "Claude",
  google_ai_overview: "AIO",
};

export default function MonitorPromptsPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [templates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPromptText, setNewPromptText] = useState("");
  const [saving, setSaving] = useState(false);

  // Quick test state
  const [testingPromptId, setTestingPromptId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<QuickTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testDuration, setTestDuration] = useState<number | null>(null);
  const [testPromptText, setTestPromptText] = useState<string>("");
  const [testModel, setTestModel] = useState<string>("");
  const resultPanelRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/monitor/prompts?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        setPrompts(data.prompts || []);
      }
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleActive = async (promptId: string, active: boolean) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === promptId ? { ...p, is_active: active } : p))
    );
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm("Delete this prompt?")) return;
    setPrompts((prev) => prev.filter((p) => p.id !== promptId));
  };

  const handleAddPrompt = async () => {
    if (!selectedClientId || !newPromptText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/monitor/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          promptText: newPromptText,
          source: "manual",
        }),
      });
      if (res.ok) {
        setNewPromptText("");
        setShowAddForm(false);
        await loadData();
      }
    } catch {
      // handle
    } finally {
      setSaving(false);
    }
  };

  const scrollToResult = useCallback(() => {
    // Small delay to let React render the panel first
    setTimeout(() => {
      resultPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleQuickTest = async (promptText: string, model: string) => {
    if (!selectedClientId) return;

    // Find the prompt row to set loading state
    const prompt = prompts.find((p) => p.prompt_text === promptText);
    setTestingPromptId(prompt?.id || "custom");
    setTestResult(null);
    setTestError(null);
    setTestDuration(null);
    setTestPromptText(promptText);
    setTestModel(model);

    try {
      const res = await fetch("/api/monitor/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, promptText, model }),
      });

      // Handle non-JSON responses (e.g. Vercel timeout returns HTML)
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setTestError(
          res.status === 504
            ? "Request timed out — the AI model took too long to respond. Try again."
            : `Server error (${res.status}). Check Vercel function logs.`
        );
        scrollToResult();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setTestError(data.details ? `${data.error}: ${data.details}` : data.error || "Test failed");
        scrollToResult();
        return;
      }

      setTestResult(data.result);
      setTestDuration(data.durationMs);
      scrollToResult();
    } catch (err) {
      setTestError(
        err instanceof Error
          ? `Request failed: ${err.message}`
          : "Test failed — check browser console for details"
      );
      scrollToResult();
    } finally {
      setTestingPromptId(null);
    }
  };

  const handleSelectTemplate = async (template: PromptTemplate) => {
    if (!selectedClientId) return;
    setShowTemplatePicker(false);
    setSaving(true);
    try {
      await fetch("/api/monitor/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          promptText: template.template_text,
          source: "template",
          templateId: template.id,
        }),
      });
      await loadData();
    } catch {
      // handle
    } finally {
      setSaving(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Custom Prompts</h2>
        <EmptyState
          icon={MessageSquare}
          title="No client selected"
          description="Select a client to manage monitoring prompts."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Custom Prompts</h2>
          <p className="text-sm text-muted-foreground">
            Manage prompt variations for {selectedClientName}&apos;s AI monitoring.
            Click any model badge to quick-test a prompt.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplatePicker(true)}
            className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground hover:bg-muted/20 transition-colors"
          >
            From Template
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Add Custom Prompt
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <textarea
            value={newPromptText}
            onChange={(e) => setNewPromptText(e.target.value)}
            placeholder="Enter a prompt to test across AI models..."
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPrompt}
              disabled={saving || !newPromptText.trim()}
              className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Prompt"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <PromptTable
          prompts={prompts}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          onQuickTest={handleQuickTest}
          testingPromptId={testingPromptId}
        />
      )}

      {/* Loading indicator while test is running */}
      {testingPromptId && (
        <div ref={resultPanelRef} className="rounded-lg border border-primary/30 bg-card p-6 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Testing on {MODEL_LABELS[testModel] || testModel}...
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This usually takes 10-30 seconds. The AI model is generating a response.
            </p>
          </div>
        </div>
      )}

      {/* Quick Test Result Panel — renders after the table so it's always visible */}
      {!testingPromptId && (testResult || testError) && (
        <div ref={resultPanelRef}>
          <QuickTestPanel
            result={testResult}
            error={testError}
            durationMs={testDuration}
            promptText={testPromptText}
            model={testModel}
            onClose={() => {
              setTestResult(null);
              setTestError(null);
            }}
          />
        </div>
      )}

      {showTemplatePicker && (
        <TemplatePicker
          templates={templates}
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}

// ---- Quick Test Result Panel ----

function QuickTestPanel({
  result,
  error,
  durationMs,
  promptText,
  model,
  onClose,
}: {
  result: QuickTestResult | null;
  error: string | null;
  durationMs: number | null;
  promptText: string;
  model: string;
  onClose: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Quick Test Result</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {MODEL_LABELS[model] || model}
          </span>
          {durationMs && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {(durationMs / 1000).toFixed(1)}s
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Prompt */}
      <div className="px-4 py-2 bg-muted/10 border-b border-border">
        <p className="text-xs text-muted-foreground">Prompt:</p>
        <p className="text-sm text-foreground">{promptText}</p>
      </div>

      {error ? (
        <div className="px-4 py-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : result ? (
        <div className="divide-y divide-border">
          {/* Key metrics */}
          <div className="px-4 py-3 flex flex-wrap gap-4">
            <MetricBadge
              label="Brand Mentioned"
              value={result.brandMentioned}
              icon={result.brandMentioned ? CheckCircle2 : XCircle}
            />
            <MetricBadge
              label="Recommended"
              value={result.brandRecommended}
              icon={result.brandRecommended ? CheckCircle2 : XCircle}
            />
            <MetricBadge
              label="Linked"
              value={result.brandLinked}
              icon={result.brandLinked ? CheckCircle2 : XCircle}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Prominence:</span>
              <span className={cn(
                "text-sm font-medium",
                result.prominenceScore >= 70 ? "text-emerald-400" :
                result.prominenceScore >= 40 ? "text-amber-400" : "text-red-400"
              )}>
                {result.prominenceScore}/100
              </span>
            </div>
            {result.sentiment && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Sentiment:</span>
                <span className={cn(
                  "text-sm font-medium",
                  result.sentiment === "positive" ? "text-emerald-400" :
                  result.sentiment === "negative" ? "text-red-400" : "text-muted-foreground"
                )}>
                  {result.sentiment}
                </span>
              </div>
            )}
          </div>

          {/* Mention context */}
          {result.mentionContext && (
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Mention Context:</p>
              <p className="text-sm text-foreground bg-muted/10 rounded p-2 italic">
                &ldquo;{result.mentionContext}&rdquo;
              </p>
            </div>
          )}

          {/* Competitors mentioned */}
          {result.competitorsMentioned.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Competitors Mentioned:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.competitorsMentioned.map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sources cited */}
          {result.sourcesCited.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Sources Cited ({result.sourcesCited.length}):</p>
              <div className="space-y-0.5 max-h-24 overflow-y-auto">
                {result.sourcesCited.map((url, i) => (
                  <p key={i} className="text-xs text-blue-400 truncate font-mono">{url}</p>
                ))}
              </div>
            </div>
          )}

          {/* Full response (collapsible) */}
          <details className="group">
            <summary className="px-4 py-3 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Full AI Response (click to expand)
            </summary>
            <div className="px-4 pb-4">
              <div className="text-sm text-foreground/80 bg-muted/10 rounded p-3 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {result.fullResponse}
              </div>
            </div>
          </details>
        </div>
      ) : null}
    </div>
  );
}

function MetricBadge({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn("h-4 w-4", value ? "text-emerald-400" : "text-red-400")} />
      <span className={cn("text-sm", value ? "text-emerald-400" : "text-red-400")}>
        {label}
      </span>
    </div>
  );
}
