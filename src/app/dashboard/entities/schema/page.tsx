"use client";

import { useEffect, useState, useCallback } from "react";
import { Code2, CheckCircle2, XCircle, AlertTriangle, Copy, Check, FileCode2 } from "lucide-react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { RobotsSummary } from "@/components/entity/robots-summary";
import { Badge } from "@/components/ui/badge";

interface SchemaResult {
  id: string;
  page_type: string;
  url: string;
  schemas_found: string[];
  schemas_missing: string[];
  score: number | null;
  robots_txt?: {
    score: number;
    crawlerAccess: Record<string, { allowed: boolean; rule: string | null }>;
  };
  llms_txt?: {
    exists: boolean;
    content: string | null;
    quality_score: number | null;
    issues: string[];
  };
}

interface GeneratedCode {
  schemaType: string;
  code: string;
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

export default function SchemaAuditPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [results, setResults] = useState<SchemaResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingSchema, setGeneratingSchema] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode[]>([]);
  const [generatingLlmsTxt, setGeneratingLlmsTxt] = useState(false);
  const [llmsTxtContent, setLlmsTxtContent] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/entity/schema?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateSchema = async (schemaType: string) => {
    if (!selectedClientId) return;
    setGeneratingSchema(schemaType);
    try {
      const res = await fetch("/api/entity/schema/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, schemaType }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedCode((prev) => [
          ...prev.filter((g) => g.schemaType !== schemaType),
          { schemaType, code: data.code || "" },
        ]);
      }
    } catch {
      // handle error
    } finally {
      setGeneratingSchema(null);
    }
  };

  const handleGenerateLlmsTxt = async () => {
    if (!selectedClientId) return;
    setGeneratingLlmsTxt(true);
    try {
      const res = await fetch("/api/entity/llmstxt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLlmsTxtContent(data.content || "");
      }
    } catch {
      // handle error
    } finally {
      setGeneratingLlmsTxt(false);
    }
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(key);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      // fallback
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Schema Audit</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Code2}
            title="No client selected"
            description="Select a client to view their schema audit results."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Schema Audit</h2>
          <p className="text-sm text-muted-foreground">Loading schema data...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Separate results by type
  const schemaResults = results.filter(
    (r) => r.page_type !== "robots_txt" && r.page_type !== "llms_txt"
  );
  const robotsResult = results.find((r) => r.page_type === "robots_txt" || r.robots_txt);
  const llmsResult = results.find((r) => r.page_type === "llms_txt" || r.llms_txt);

  // Overall schema score
  const schemaScores = schemaResults
    .filter((r) => r.score !== null)
    .map((r) => r.score as number);
  const overallScore =
    schemaScores.length > 0
      ? Math.round(schemaScores.reduce((a, b) => a + b, 0) / schemaScores.length)
      : null;

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Schema Audit</h2>
          <p className="text-sm text-muted-foreground">
            Schema markup audit for {selectedClientName}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Code2}
            title="No schema audit data"
            description="Run an entity scan with schema analysis to audit your site's structured data, robots.txt, and llms.txt."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Schema Audit</h2>
          <p className="text-sm text-muted-foreground">
            Structured data analysis for {selectedClientName}
          </p>
        </div>
        {overallScore !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Overall Score:</span>
            <span className={`text-2xl font-bold tabular-nums ${getScoreColor(overallScore)}`}>
              {overallScore}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        )}
      </div>

      {/* Section 1: Schema Markup */}
      {schemaResults.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Schema Markup</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Structured data found and missing on your site pages
            </p>
          </div>

          <div className="space-y-4">
            {schemaResults.map((result) => (
              <div
                key={result.id || result.page_type}
                className="rounded-md border border-border bg-background p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground capitalize">
                      {result.page_type.replace(/_/g, " ")}
                    </span>
                    {result.url && (
                      <span className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                        {result.url}
                      </span>
                    )}
                  </div>
                  {result.score !== null && (
                    <span className={`text-sm font-medium tabular-nums ${getScoreColor(result.score)}`}>
                      {result.score}/100
                    </span>
                  )}
                </div>

                {/* Found schemas */}
                {result.schemas_found.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Found
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.schemas_found.map((schema) => (
                        <div
                          key={schema}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {schema}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing schemas */}
                {result.schemas_missing.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Missing
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.schemas_missing.map((schema) => (
                        <div
                          key={schema}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20"
                        >
                          <XCircle className="h-3 w-3" />
                          {schema}
                          <button
                            onClick={() => handleGenerateSchema(schema)}
                            disabled={generatingSchema === schema}
                            className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
                          >
                            {generatingSchema === schema ? "..." : "Generate"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show generated code for this page's missing schemas */}
                {generatedCode
                  .filter((g) => result.schemas_missing.includes(g.schemaType))
                  .map((g) => (
                    <div key={g.schemaType} className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">
                          Generated: {g.schemaType}
                        </span>
                        <button
                          onClick={() => handleCopy(`schema-${g.schemaType}`, g.code)}
                          className="p-1 rounded hover:bg-muted/40 transition-colors"
                        >
                          {copiedItem === `schema-${g.schemaType}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <pre className="rounded-md bg-muted/50 p-3 text-xs text-foreground overflow-x-auto font-mono whitespace-pre-wrap">
                        {g.code}
                      </pre>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: robots.txt Audit */}
      {robotsResult?.robots_txt && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">robots.txt Audit</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI crawler access permissions
            </p>
          </div>
          <RobotsSummary
            score={robotsResult.robots_txt.score}
            crawlerAccess={robotsResult.robots_txt.crawlerAccess}
          />
        </div>
      )}

      {/* Section 3: llms.txt */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">llms.txt</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Machine-readable brand information for AI models
            </p>
          </div>
          {llmsResult?.llms_txt?.quality_score !== null && llmsResult?.llms_txt?.quality_score !== undefined && (
            <span className={`text-sm font-medium tabular-nums ${getScoreColor(llmsResult.llms_txt.quality_score)}`}>
              Quality: {llmsResult.llms_txt.quality_score}/100
            </span>
          )}
        </div>

        {llmsResult?.llms_txt ? (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center gap-2">
              {llmsResult.llms_txt.exists ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-500 font-medium">llms.txt found</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">llms.txt not found</span>
                </>
              )}
            </div>

            {/* Content preview */}
            {llmsResult.llms_txt.exists && llmsResult.llms_txt.content && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Content Preview
                  </span>
                  <button
                    onClick={() => handleCopy("llms-content", llmsResult.llms_txt?.content || "")}
                    className="p-1 rounded hover:bg-muted/40 transition-colors"
                  >
                    {copiedItem === "llms-content" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <pre className="rounded-md bg-muted/50 p-3 text-xs text-foreground overflow-x-auto font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {llmsResult.llms_txt.content}
                </pre>
              </div>
            )}

            {/* Issues */}
            {llmsResult.llms_txt.issues && llmsResult.llms_txt.issues.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Issues
                </span>
                <div className="space-y-1">
                  {llmsResult.llms_txt.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate button */}
            {!llmsResult.llms_txt.exists && (
              <button
                onClick={handleGenerateLlmsTxt}
                disabled={generatingLlmsTxt}
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Code2 className="h-3.5 w-3.5" />
                {generatingLlmsTxt ? "Generating..." : "Generate llms.txt"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground">Not scanned</Badge>
            </div>
            <button
              onClick={handleGenerateLlmsTxt}
              disabled={generatingLlmsTxt}
              className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Code2 className="h-3.5 w-3.5" />
              {generatingLlmsTxt ? "Generating..." : "Generate llms.txt"}
            </button>
          </div>
        )}

        {/* Generated llms.txt content */}
        {llmsTxtContent && (
          <div className="space-y-2 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Generated llms.txt</span>
              <button
                onClick={() => handleCopy("llms-generated", llmsTxtContent)}
                className="p-1 rounded hover:bg-muted/40 transition-colors"
              >
                {copiedItem === "llms-generated" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
            <pre className="rounded-md bg-muted/50 p-3 text-xs text-foreground overflow-x-auto font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
              {llmsTxtContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
