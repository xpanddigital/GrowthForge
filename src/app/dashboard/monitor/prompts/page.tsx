"use client";

import { useEffect, useState, useCallback } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { PromptTable } from "@/components/monitor/prompt-table";
import { TemplatePicker } from "@/components/monitor/template-picker";
import { MessageSquare } from "lucide-react";

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

export default function MonitorPromptsPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [templates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPromptText, setNewPromptText] = useState("");
  const [saving, setSaving] = useState(false);

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
    // In production: PATCH the prompt
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
            Manage prompt variations for {selectedClientName}&apos;s AI monitoring
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
        />
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
