"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PromptTemplate {
  id: string;
  template_name: string;
  template_text: string;
  vertical: string;
  prompt_type: string;
  is_system_template: boolean;
}

interface TemplatePickerProps {
  templates: PromptTemplate[];
  onSelect: (template: PromptTemplate) => void;
  onClose: () => void;
}

const VERTICALS = ["all", "general", "music", "legal", "home_services"] as const;
const PROMPT_TYPES = ["all", "recommendation", "comparison", "how_to", "cost", "review"] as const;

export function TemplatePicker({ templates, onSelect, onClose }: TemplatePickerProps) {
  const [verticalFilter, setVerticalFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = templates.filter((t) => {
    if (verticalFilter !== "all" && t.vertical !== verticalFilter) return false;
    if (typeFilter !== "all" && t.prompt_type !== typeFilter) return false;
    if (search && !t.template_name.toLowerCase().includes(search.toLowerCase()) && !t.template_text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[80vh] rounded-lg border border-border bg-card shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-medium text-foreground">Prompt Template Library</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="border-b border-border px-4 py-3 space-y-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Vertical:</span>
              <div className="flex gap-1">
                {VERTICALS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVerticalFilter(v)}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded transition-colors",
                      verticalFilter === v
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {v === "all" ? "All" : v.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Type:</span>
              <div className="flex gap-1">
                {PROMPT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded transition-colors",
                      typeFilter === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {t === "all" ? "All" : t.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No templates match your filters.
            </p>
          ) : (
            filtered.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="w-full text-left rounded-lg border border-border p-3 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {template.template_name}
                  </span>
                  <div className="flex gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                      {template.vertical}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                      {template.prompt_type.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {template.template_text}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""} available
        </div>
      </div>
    </div>
  );
}
