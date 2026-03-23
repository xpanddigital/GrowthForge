"use client";

import { useEffect, useState, useCallback } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { PromptTable } from "@/components/monitor/prompt-table";
import { TemplatePicker } from "@/components/monitor/template-picker";
import { MessageSquare, X, CheckCircle2, XCircle, Clock, Loader2, AlertTriangle } from "lucide-react";
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

  // Quick test modal state
  const [showTestModal, setShowTestModal] = useState(false);
  const [testingPromptId, setTestingPromptId] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<QuickTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testDuration, setTestDuration] = useState<number | null>(null);
  const [testPromptText, setTestPromptText] = useState<string>("");
  const [testModel, setTestModel] = useState<string>("");

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

  const handleQuickTest = async (promptText: string, model: string) => {
    if (!selectedClientId) return;

    // Find the prompt row to set loading state on the table
    const prompt = prompts.find((p) => p.prompt_text === promptText);
    setTestingPromptId(prompt?.id || "custom");

    // Open modal immediately with loading state
    setTestResult(null);
    setTestError(null);
    setTestDuration(null);
    setTestPromptText(promptText);
    setTestModel(model);
    setTestLoading(true);
    setShowTestModal(true);

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
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setTestError(data.details ? `${data.error}: ${data.details}` : data.error || "Test failed");
        return;
      }

      setTestResult(data.result);
      setTestDuration(data.durationMs);
    } catch (err) {
      setTestError(
        err instanceof Error
          ? `Request failed: ${err.message}`
          : "Test failed — check browser console for details"
      );
    } finally {
      setTestLoading(false);
      setTestingPromptId(null);
    }
  };

  const closeTestModal = () => {
    setShowTestModal(false);
    setTestResult(null);
    setTestError(null);
    setTestLoading(false);
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
            Click any model badge or the Test button to quick-test a prompt.
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

      {showTemplatePicker && (
        <TemplatePicker
          templates={templates}
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* ---- Quick Test Modal ---- */}
      {showTestModal && (
        <QuickTestModal
          loading={testLoading}
          result={testResult}
          error={testError}
          durationMs={testDuration}
          promptText={testPromptText}
          model={testModel}
          onClose={closeTestModal}
        />
      )}
    </div>
  );
}

// ============================================================
// Quick Test Modal — full-screen overlay, impossible to miss
// ============================================================

function QuickTestModal({
  loading,
  result,
  error,
  durationMs,
  promptText,
  model,
  onClose,
}: {
  loading: boolean;
  result: QuickTestResult | null;
  error: string | null;
  durationMs: number | null;
  promptText: string;
  model: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={loading ? undefined : onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold">Quick Test Result</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {MODEL_LABELS[model] || model}
            </span>
            {durationMs && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {(durationMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
          {!loading && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/30">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Prompt */}
        <div className="px-6 py-3 bg-muted/10 border-b border-border shrink-0">
          <p className="text-xs text-muted-foreground">Prompt:</p>
          <p className="text-sm text-foreground">{promptText}</p>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Testing on {MODEL_LABELS[model] || model}...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This usually takes 10-30 seconds
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AlertTriangle className="h-10 w-10 text-red-400" />
              <div className="text-center max-w-md">
                <p className="text-sm font-medium text-red-400">Test Failed</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
            </div>
          ) : result ? (
            <div className="divide-y divide-border">
              {/* Big verdict banner */}
              <div className={cn(
                "px-6 py-5",
                result.brandMentioned ? "bg-emerald-500/5" : "bg-red-500/5"
              )}>
                <div className="flex items-center gap-3">
                  {result.brandMentioned ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-400 shrink-0" />
                  )}
                  <div>
                    <p className={cn(
                      "text-lg font-semibold",
                      result.brandMentioned ? "text-emerald-400" : "text-red-400"
                    )}>
                      {result.brandMentioned
                        ? "Brand Found in Response"
                        : "Brand Not Found in Response"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {result.brandMentioned
                        ? result.brandRecommended
                          ? "Your brand was mentioned AND recommended by the AI model."
                          : "Your brand was mentioned but not explicitly recommended."
                        : "The AI model did not mention your brand for this prompt."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics row */}
              <div className="px-6 py-4 flex flex-wrap gap-6">
                <MetricBadge
                  label="Mentioned"
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
                    "text-sm font-semibold",
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
                      "text-sm font-semibold",
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
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">How your brand was mentioned:</p>
                  <p className="text-sm text-foreground bg-muted/10 rounded-lg p-3 italic border border-border">
                    &ldquo;{result.mentionContext}&rdquo;
                  </p>
                </div>
              )}

              {/* Competitors mentioned */}
              {result.competitorsMentioned.length > 0 && (
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Competitors mentioned ({result.competitorsMentioned.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.competitorsMentioned.map((c) => (
                      <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources cited */}
              {result.sourcesCited.length > 0 && (
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Sources cited ({result.sourcesCited.length}):
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.sourcesCited.map((url, i) => (
                      <p key={i} className="text-xs text-blue-400 truncate font-mono">{url}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Full response */}
              <div className="px-6 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Full AI Response:</p>
                <div className="text-foreground/80 bg-muted/10 rounded-lg p-4 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed border border-border">
                  {result.fullResponse}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-6 py-3 border-t border-border bg-muted/10 shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
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
      <span className={cn("text-sm font-medium", value ? "text-emerald-400" : "text-red-400")}>
        {label}
      </span>
    </div>
  );
}
