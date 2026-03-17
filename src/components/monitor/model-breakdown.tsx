"use client";

import { cn } from "@/lib/utils";

interface ModelData {
  model: string;
  label: string;
  som: number;
  mentioned: number;
  total: number;
}

const MODEL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  claude: "Claude",
  google_ai_overview: "AI Overviews",
};

const MODEL_COLORS: Record<string, string> = {
  chatgpt: "bg-emerald-500",
  perplexity: "bg-blue-500",
  gemini: "bg-purple-500",
  claude: "bg-orange-500",
  google_ai_overview: "bg-red-500",
};

interface ModelBreakdownProps {
  breakdown: Record<
    string,
    { mentioned: number; total: number; som?: number }
  >;
}

export function ModelBreakdown({ breakdown }: ModelBreakdownProps) {
  const models: ModelData[] = Object.entries(breakdown).map(
    ([model, data]) => ({
      model,
      label: MODEL_LABELS[model] || model,
      som: data.som ?? (data.total > 0 ? (data.mentioned / data.total) * 100 : 0),
      mentioned: data.mentioned,
      total: data.total,
    })
  );

  // Ensure all 5 models are shown
  for (const model of Object.keys(MODEL_LABELS)) {
    if (!models.find((m) => m.model === model)) {
      models.push({
        model,
        label: MODEL_LABELS[model],
        som: 0,
        mentioned: 0,
        total: 0,
      });
    }
  }

  // Sort by model order
  const order = Object.keys(MODEL_LABELS);
  models.sort((a, b) => order.indexOf(a.model) - order.indexOf(b.model));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Share of Model by Platform
      </h3>
      <div className="space-y-3">
        {models.map((m) => (
          <div key={m.model} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{m.label}</span>
              <span className="text-muted-foreground font-mono">
                {m.som.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  MODEL_COLORS[m.model] || "bg-primary"
                )}
                style={{ width: `${Math.min(100, m.som)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {m.mentioned}/{m.total} tests mentioned
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
