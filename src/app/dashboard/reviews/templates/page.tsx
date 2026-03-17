"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Plus, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ReviewTemplate {
  id: string;
  name: string;
  sentiment_target: string;
  vertical: string;
  template_text: string;
  created_at: string;
}

const SENTIMENT_CONFIG: Record<string, { label: string; color: string }> = {
  positive: { label: "Positive", color: "border-emerald-500/30 text-emerald-500" },
  neutral: { label: "Neutral", color: "border-amber-500/30 text-amber-500" },
  negative: { label: "Negative", color: "border-red-500/30 text-red-400" },
};

const VERTICALS = [
  { value: "general", label: "General" },
  { value: "legal", label: "Legal" },
  { value: "music", label: "Music" },
  { value: "saas", label: "SaaS" },
  { value: "home_services", label: "Home Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "financial", label: "Financial" },
  { value: "hospitality", label: "Hospitality" },
];

const TEMPLATE_VARIABLES = [
  "{{business_name}}",
  "{{reviewer_name}}",
  "{{platform}}",
];

export default function ReviewTemplatesPage() {
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [sentimentTarget, setSentimentTarget] = useState("");
  const [vertical, setVertical] = useState("");
  const [templateText, setTemplateText] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setName("");
    setSentimentTarget("");
    setVertical("");
    setTemplateText("");
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!name.trim() || !sentimentTarget || !vertical || !templateText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          sentimentTarget,
          templateText: templateText.trim(),
          vertical,
        }),
      });
      if (res.ok) {
        resetForm();
        await loadData();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Response Templates</h2>
          <p className="text-sm text-muted-foreground">Loading templates...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 h-52 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Response Templates</h2>
          <p className="text-sm text-muted-foreground">
            Manage reusable review response templates across your agency.
          </p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Template
          </Button>
        )}
      </div>

      {/* Creation Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Create Template</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g. Positive Google Response"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sentiment-target">Sentiment Target</Label>
                <Select value={sentimentTarget} onValueChange={setSentimentTarget}>
                  <SelectTrigger id="sentiment-target">
                    <SelectValue placeholder="Select sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vertical">Vertical</Label>
                <Select value={vertical} onValueChange={setVertical}>
                  <SelectTrigger id="vertical">
                    <SelectValue placeholder="Select vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    {VERTICALS.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-text">Template Text</Label>
              <Textarea
                id="template-text"
                placeholder="Thank you for your feedback, {{reviewer_name}}! We're glad you had a great experience with {{business_name}}..."
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Available variables:{" "}
                {TEMPLATE_VARIABLES.map((v, i) => (
                  <span key={v}>
                    <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">
                      {v}
                    </code>
                    {i < TEMPLATE_VARIABLES.length - 1 && ", "}
                  </span>
                ))}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={submitting || !name.trim() || !sentimentTarget || !vertical || !templateText.trim()}
              >
                {submitting ? "Creating..." : "Create Template"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template List */}
      {templates.length === 0 && !showForm ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={FileText}
            title="No templates yet"
            description="Create reusable response templates for common review sentiments and verticals."
            action={
              <Button
                size="sm"
                onClick={() => setShowForm(true)}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Template
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const sentimentConfig = SENTIMENT_CONFIG[template.sentiment_target] ?? {
              label: template.sentiment_target,
              color: "border-muted-foreground/30 text-muted-foreground",
            };
            const verticalLabel =
              VERTICALS.find((v) => v.value === template.vertical)?.label ?? template.vertical;

            return (
              <Card key={template.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {template.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", sentimentConfig.color)}
                    >
                      {sentimentConfig.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-muted-foreground/30 text-muted-foreground"
                    >
                      {verticalLabel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                    {template.template_text}
                  </p>
                </CardContent>
                <div className="px-6 pb-4">
                  <p className="text-[10px] text-muted-foreground">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
