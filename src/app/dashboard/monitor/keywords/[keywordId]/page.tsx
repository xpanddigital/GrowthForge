"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useClientContext } from "@/hooks/use-client-context";
import { SomTrendChart } from "@/components/monitor/som-trend-chart";
import { ModelBreakdown } from "@/components/monitor/model-breakdown";
import { PromptTable } from "@/components/monitor/prompt-table";

interface KeywordDetail {
  keyword: string;
  som: number | null;
  tests: number;
  mentions: number;
  prompts: Array<{
    id: string;
    prompt_text: string;
    source: string;
    keyword?: string;
    test_models: string[];
    is_active: boolean;
    last_used_at: string | null;
    times_used: number;
    last_brand_mentioned: boolean | null;
  }>;
  modelBreakdown: Array<{
    model: string;
    som: number;
    tests: number;
    mentions: number;
  }>;
  trend: Array<{ week: string; som: number }>;
}

export default function KeywordDetailPage() {
  const params = useParams();
  const keywordId = params.keywordId as string;
  const { selectedClientId } = useClientContext();
  const [data, setData] = useState<KeywordDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedClientId || !keywordId) return;
    setLoading(true);

    const loadKeywordData = async () => {
      try {
        // Fetch results and keyword config in parallel
        const [resultsRes, configRes] = await Promise.all([
          fetch(`/api/monitor/results?clientId=${selectedClientId}&keywordId=${keywordId}&limit=200`),
          fetch(`/api/monitor/keywords?clientId=${selectedClientId}`),
        ]);

        const results = resultsRes.ok ? (await resultsRes.json()).results || [] : [];
        const configs = configRes.ok ? (await configRes.json()).keywords || [] : [];

        if (results.length === 0 && configs.length === 0) {
          setData(null);
          return;
        }

        // Find this keyword's config
        const kwConfig = configs.find(
          (c: { keyword_id: string }) => c.keyword_id === keywordId
        );

        // Aggregate by model
        const modelMap: Record<string, { tests: number; mentions: number }> = {};
        for (const r of results) {
          const m = r.ai_model as string;
          if (!modelMap[m]) modelMap[m] = { tests: 0, mentions: 0 };
          modelMap[m].tests++;
          if (r.brand_mentioned) modelMap[m].mentions++;
        }

        const modelBreakdown = Object.entries(modelMap).map(([model, stats]) => ({
          model,
          tests: stats.tests,
          mentions: stats.mentions,
          som: stats.tests > 0 ? Math.round((stats.mentions / stats.tests) * 100) : 0,
        }));

        // Build weekly trend from results
        const weekMap: Record<string, { tests: number; mentions: number }> = {};
        for (const r of results) {
          const date = new Date(r.tested_at as string);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split("T")[0];
          if (!weekMap[weekKey]) weekMap[weekKey] = { tests: 0, mentions: 0 };
          weekMap[weekKey].tests++;
          if (r.brand_mentioned) weekMap[weekKey].mentions++;
        }

        const trend = Object.entries(weekMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([week, stats]) => ({
            week,
            som: stats.tests > 0 ? Math.round((stats.mentions / stats.tests) * 100) : 0,
          }));

        // Overall stats
        const totalTests = results.length;
        const totalMentions = results.filter(
          (r: { brand_mentioned: boolean }) => r.brand_mentioned
        ).length;
        const overallSom = totalTests > 0 ? Math.round((totalMentions / totalTests) * 100) : null;

        setData({
          keyword: kwConfig?.keyword || "Unknown Keyword",
          som: overallSom,
          tests: totalTests,
          mentions: totalMentions,
          prompts: [],
          modelBreakdown,
          trend,
        });
      } catch {
        // handle
      } finally {
        setLoading(false);
      }
    };

    loadKeywordData();
  }, [selectedClientId, keywordId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted/30 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-48 rounded-lg border border-border bg-card animate-pulse" />
          <div className="h-48 rounded-lg border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <a href="/dashboard/monitor/keywords" className="hover:text-foreground">
            Keywords
          </a>
          <span>/</span>
        </div>
        <h2 className="text-lg font-semibold">
          {data?.keyword || "Keyword"} — Monitoring Detail
        </h2>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          {data?.som !== null && data?.som !== undefined && (
            <span>
              SoM: <strong className="text-foreground">{data.som}%</strong>
            </span>
          )}
          <span>{data?.tests || 0} tests</span>
          <span>{data?.mentions || 0} mentions</span>
        </div>
      </div>

      {/* Model Breakdown for this keyword */}
      {data?.modelBreakdown && (
        <ModelBreakdown
          breakdown={Object.fromEntries(
            data.modelBreakdown.map((m) => [
              m.model,
              { mentioned: m.mentions, total: m.tests, som: m.som },
            ])
          )}
        />
      )}

      {/* SoM trend for this keyword */}
      {data?.trend && data.trend.length > 0 && (
        <SomTrendChart
          data={data.trend.map((t) => ({
            date: t.week,
            score: t.som,
            som: t.som,
          }))}
        />
      )}

      {/* Prompts for this keyword */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Prompt Variations</h3>
        <PromptTable prompts={data?.prompts || []} />
      </div>
    </div>
  );
}
