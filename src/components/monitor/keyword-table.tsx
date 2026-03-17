"use client";

import { cn } from "@/lib/utils";

interface KeywordRow {
  keywordId: string;
  keyword: string;
  som: number;
  totalTests: number;
  bestModel: string | null;
}

interface KeywordTableProps {
  keywords: KeywordRow[];
}

const MODEL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  claude: "Claude",
  google_ai_overview: "AI Overviews",
};

export function KeywordTable({ keywords }: KeywordTableProps) {
  if (keywords.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Keywords Being Monitored
        </h3>
        <p className="text-sm text-muted-foreground">
          Enable keyword monitoring to start tracking AI visibility.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Keywords Being Monitored ({keywords.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                Keyword
              </th>
              <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                SoM
              </th>
              <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                Tests
              </th>
              <th className="text-right py-2 pl-4 font-medium text-muted-foreground">
                Best Model
              </th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw) => (
              <tr
                key={kw.keywordId}
                className="border-b border-border/50 hover:bg-muted/10"
              >
                <td className="py-2 pr-4 text-foreground">{kw.keyword}</td>
                <td className="py-2 px-4 text-right">
                  <span
                    className={cn(
                      "font-mono",
                      kw.som >= 50
                        ? "text-emerald-400"
                        : kw.som >= 20
                          ? "text-amber-400"
                          : "text-muted-foreground"
                    )}
                  >
                    {kw.som.toFixed(0)}%
                  </span>
                </td>
                <td className="py-2 px-4 text-right text-muted-foreground font-mono">
                  {kw.totalTests}
                </td>
                <td className="py-2 pl-4 text-right text-muted-foreground">
                  {kw.bestModel
                    ? MODEL_LABELS[kw.bestModel] || kw.bestModel
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
