"use client";

import { cn } from "@/lib/utils";

interface CompetitorDetail {
  name: string;
  mentioned: boolean;
  recommended: boolean;
  sentiment: string | null;
  context: string | null;
}

interface ResultDetailProps {
  result: {
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
    competitor_details: CompetitorDetail[];
    competitor_mentions: string[];
    full_response: string;
    response_hash: string | null;
    tested_at: string;
  };
  clientName: string;
  onClose?: () => void;
}

const MODEL_CONFIG: Record<string, { label: string; color: string }> = {
  chatgpt: { label: "ChatGPT", color: "text-green-400" },
  perplexity: { label: "Perplexity", color: "text-blue-400" },
  gemini: { label: "Gemini", color: "text-purple-400" },
  claude: { label: "Claude", color: "text-amber-400" },
  google_ai_overview: { label: "AI Overview", color: "text-red-400" },
};

export function ResultDetail({ result, onClose }: ResultDetailProps) {
  const modelCfg = MODEL_CONFIG[result.ai_model] || { label: result.ai_model, color: "text-foreground" };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={cn("text-sm font-medium", modelCfg.color)}>{modelCfg.label}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(result.tested_at).toLocaleDateString()} at{" "}
            {new Date(result.tested_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">
            ✕
          </button>
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border">
        <Badge positive={result.brand_mentioned}>
          {result.brand_mentioned ? "Brand Mentioned" : "Not Mentioned"}
        </Badge>
        {result.brand_mentioned && (
          <>
            <Badge positive={result.brand_recommended}>
              {result.brand_recommended ? "Recommended" : "Not Recommended"}
            </Badge>
            <Badge positive={result.brand_linked}>
              {result.brand_linked ? "Linked" : "No Link"}
            </Badge>
          </>
        )}
        {result.sentiment && (
          <Badge
            positive={result.sentiment === "positive"}
            neutral={result.sentiment === "neutral"}
          >
            {result.sentiment}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          Prominence: <strong className="text-foreground">{result.prominence_score}/100</strong>
        </span>
      </div>

      {/* Mention context */}
      {result.mention_context && (
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-xs font-medium text-muted-foreground mb-1">Mention Context</h4>
          <p className="text-sm text-foreground bg-emerald-500/5 rounded p-2 border border-emerald-500/20">
            {highlightBrand(result.mention_context)}
          </p>
          {result.mention_position && (
            <p className="text-xs text-muted-foreground mt-1">
              Position: {result.mention_position}
            </p>
          )}
        </div>
      )}

      {/* Competitor details */}
      {result.competitor_details && result.competitor_details.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Competitor Mentions</h4>
          <div className="space-y-1">
            {result.competitor_details.map((comp, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{comp.name}</span>
                <div className="flex items-center gap-2">
                  {comp.mentioned ? (
                    <span className="text-xs text-amber-400">Mentioned</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not mentioned</span>
                  )}
                  {comp.recommended && (
                    <span className="text-xs text-red-400">Recommended</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources cited */}
      {result.sources_cited && result.sources_cited.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Sources Cited ({result.sources_cited.length})
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {result.sources_cited.map((url, i) => {
              const isBrand = result.brand_source_urls?.includes(url);
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "block text-xs truncate hover:underline",
                    isBrand ? "text-emerald-400" : "text-blue-400"
                  )}
                >
                  {isBrand && "★ "}
                  {url}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Full response */}
      <div className="px-4 py-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Full Response</h4>
        <div className="text-sm text-foreground/80 bg-muted/20 rounded p-3 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
          {result.full_response || "(No response text)"}
        </div>
        {result.response_hash && (
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">
            Hash: {result.response_hash.substring(0, 16)}...
          </p>
        )}
      </div>
    </div>
  );
}

function Badge({
  children,
  positive,
  neutral,
}: {
  children: React.ReactNode;
  positive?: boolean;
  neutral?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        positive
          ? "bg-emerald-500/10 text-emerald-400"
          : neutral
            ? "bg-muted/30 text-muted-foreground"
            : "bg-red-500/10 text-red-400"
      )}
    >
      {children}
    </span>
  );
}

function highlightBrand(text: string): string {
  // Simple highlight — in a real implementation would use React nodes
  return text;
}
