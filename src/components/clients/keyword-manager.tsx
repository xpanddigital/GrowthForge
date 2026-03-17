"use client";

import { useState } from "react";
import type { Keyword } from "@/types/database";
import { IntentTag } from "@/components/shared/intent-tag";
import { Plus, Trash2, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";

interface KeywordManagerProps {
  clientId: string;
  keywords: Keyword[];
  maxKeywords: number;
  onKeywordsChange: (keywords: Keyword[]) => void;
}

export function KeywordManager({
  clientId,
  keywords,
  maxKeywords,
  onKeywordsChange,
}: KeywordManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeywordsText, setNewKeywordsText] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAddKeywords() {
    const lines = newKeywordsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    setAdding(true);

    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        keywords: lines.map((keyword) => ({ keyword })),
      }),
    });

    if (res.ok) {
      const { data } = await res.json();
      onKeywordsChange([...data, ...keywords]);
      setNewKeywordsText("");
      setShowAddModal(false);
    }
    setAdding(false);
  }

  async function toggleKeyword(id: string, isActive: boolean) {
    const res = await fetch(`/api/keywords?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });

    if (res.ok) {
      onKeywordsChange(
        keywords.map((k) =>
          k.id === id ? { ...k, is_active: !isActive } : k
        )
      );
    }
  }

  async function deleteKeyword(id: string) {
    if (!confirm("Delete this keyword?")) return;

    const res = await fetch(`/api/keywords?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      onKeywordsChange(keywords.filter((k) => k.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddModal(true)}
          disabled={keywords.length >= maxKeywords}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Keywords
        </button>
        <button
          disabled
          className="inline-flex h-9 items-center gap-2 rounded-md border border-input px-4 text-sm hover:bg-accent disabled:opacity-50"
          title="Coming soon"
        >
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </button>
      </div>

      {/* Add Keywords Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Add Keywords</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter one keyword per line (up to 100).
            </p>
            <textarea
              value={newKeywordsText}
              onChange={(e) => setNewKeywordsText(e.target.value)}
              placeholder={"music royalty companies\nbest spotify playlist promotion\nhow do artists get advances"}
              rows={8}
              className="mt-4 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewKeywordsText("");
                }}
                className="h-9 rounded-md border border-input px-4 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKeywords}
                disabled={adding || !newKeywordsText.trim()}
                className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add Keywords"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keywords Table */}
      {keywords.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No keywords yet. Add keywords to start discovering threads.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Keyword
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Tags
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Intent
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Source
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keywords.map((kw) => (
                <tr key={kw.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{kw.keyword}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {kw.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <IntentTag intent={kw.intent} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {kw.source}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs ${kw.is_active ? "text-emerald-500" : "text-muted-foreground"}`}
                    >
                      {kw.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleKeyword(kw.id, kw.is_active)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title={kw.is_active ? "Deactivate" : "Activate"}
                      >
                        {kw.is_active ? (
                          <ToggleRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteKeyword(kw.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
