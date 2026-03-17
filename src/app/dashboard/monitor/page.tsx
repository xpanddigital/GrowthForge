"use client";

import { useEffect, useState, useCallback } from "react";
import { Radar } from "lucide-react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { VisibilityScoreCard } from "@/components/monitor/visibility-score-card";
import { ModelBreakdown } from "@/components/monitor/model-breakdown";
import { CompetitorComparison } from "@/components/monitor/competitor-comparison";
import { SomTrendChart } from "@/components/monitor/som-trend-chart";
import { KeywordTable } from "@/components/monitor/keyword-table";
import { CorrelationTimeline } from "@/components/monitor/correlation-timeline";
import { KeywordOnboarding } from "@/components/monitor/keyword-onboarding";

interface Snapshot {
  id: string;
  ai_visibility_score: number;
  overall_som: number;
  som_by_model: Record<string, number>;
  som_delta: number | null;
  total_tests: number;
  total_mentions: number;
  competitor_som: Record<string, number>;
  week_start: string;
  created_at: string;
}

interface MonitorKeywordRow {
  keywordId: string;
  keyword: string;
  som: number;
  totalTests: number;
  bestModel: string | null;
}

interface TimelineEntry {
  week_start: string;
  responses_posted: number;
  ai_visibility_score: number | null;
  som_delta: number | null;
  correlation_notes: Array<{
    type: string;
    confidence: string;
    message: string;
  }>;
}

export default function MonitorPage() {
  const { selectedClientId, selectedClientName } = useClientContext();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [trendData, setTrendData] = useState<Array<{ date: string; score: number; som: number }>>([]);
  const [keywords, setKeywords] = useState<MonitorKeywordRow[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clientKeywords, setClientKeywords] = useState<Array<{ id: string; keyword: string; tags: string[]; is_active: boolean }>>([]);
  const [scanning, setScanning] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const [snapshotsRes, timelineRes, keywordsRes, clientKwRes] = await Promise.all([
        fetch(`/api/monitor/snapshots?clientId=${selectedClientId}&limit=12`),
        fetch(`/api/monitor/timeline?clientId=${selectedClientId}`),
        fetch(`/api/monitor/keywords?clientId=${selectedClientId}`),
        fetch(`/api/keywords?client_id=${selectedClientId}`),
      ]);

      if (snapshotsRes.ok) {
        const result = await snapshotsRes.json();
        const snapshots = result.snapshots || [];
        if (snapshots.length > 0) {
          const latest = snapshots[0];
          // Map model_breakdown to som_by_model for UI
          const somByModel: Record<string, number> = {};
          const breakdown = latest.model_breakdown || {};
          for (const [model, stats] of Object.entries(breakdown)) {
            const s = stats as { som?: number; mentioned?: number; total?: number };
            somByModel[model] = s.som ?? (s.total ? ((s.mentioned ?? 0) / s.total) * 100 : 0);
          }
          setSnapshot({ ...latest, som_by_model: somByModel });
          setTrendData(
            [...snapshots].reverse().map((s: Snapshot) => ({
              date: s.week_start || s.created_at,
              score: s.ai_visibility_score,
              som: s.overall_som,
            }))
          );
        }
      }

      if (timelineRes.ok) {
        const data = await timelineRes.json();
        setTimeline(Array.isArray(data) ? data : data.timeline || []);
      }

      if (keywordsRes.ok) {
        const result = await keywordsRes.json();
        const kwRows = (result.keywords || []).map(
          (kw: { keyword_id: string; keyword: string; som: number | null; prompts_generated: number; last_tested_at: string | null }) => ({
            keywordId: kw.keyword_id,
            keyword: kw.keyword,
            som: kw.som ?? 0,
            totalTests: kw.prompts_generated,
            bestModel: null,
          })
        );
        setKeywords(kwRows);
      }

      if (clientKwRes.ok) {
        const result = await clientKwRes.json();
        setClientKeywords(result.data || []);
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

  const handleRunScan = async () => {
    if (!selectedClientId) return;
    setScanning(true);
    try {
      await fetch("/api/monitor/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
    } catch {
      // handle error
    } finally {
      setScanning(false);
    }
  };

  const handleEnableKeywords = async (keywordIds: string[]) => {
    if (!selectedClientId) return;
    await fetch("/api/monitor/keywords/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClientId, keywordIds }),
    });
    await loadData();
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">AI Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Select a client to view AI visibility monitoring.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={Radar}
            title="No client selected"
            description="Select a client from the header to view their AI monitoring dashboard."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">AI Monitor</h2>
          <p className="text-sm text-muted-foreground">Loading monitoring data...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Monitor</h2>
            <p className="text-sm text-muted-foreground">
              Track {selectedClientName}&apos;s visibility across AI models.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-8">
          <EmptyState
            icon={Radar}
            title="No monitoring data yet"
            description="Enable keyword monitoring to start tracking your brand's AI visibility across ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews."
          />
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Enable AI Monitoring
            </button>
          </div>
        </div>

        {showOnboarding && (
          <KeywordOnboarding
            clientId={selectedClientId}
            clientName={selectedClientName || ""}
            keywords={clientKeywords}
            onEnable={handleEnableKeywords}
            onClose={() => setShowOnboarding(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Monitor</h2>
          <p className="text-sm text-muted-foreground">
            {selectedClientName}&apos;s AI visibility across 5 models
          </p>
        </div>
        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {scanning ? "Scanning..." : "Run Scan"}
        </button>
      </div>

      {/* Hero: AI Visibility Score + Model Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VisibilityScoreCard
          score={snapshot.ai_visibility_score}
          somPercent={snapshot.overall_som}
          scoreDelta={snapshot.som_delta}
          somDelta={snapshot.som_delta}
        />
        <div className="lg:col-span-2">
          <ModelBreakdown
            breakdown={Object.fromEntries(
              Object.entries(snapshot.som_by_model || {}).map(([model, som]) => [
                model,
                { mentioned: 0, total: 0, som: som as number },
              ])
            )}
          />
        </div>
      </div>

      {/* Trend + Competitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SomTrendChart data={trendData} />
        <CompetitorComparison
          clientName={selectedClientName || "You"}
          clientSom={snapshot.overall_som}
          competitors={snapshot.competitor_som || {}}
        />
      </div>

      {/* Correlation Timeline */}
      <CorrelationTimeline data={timeline} />

      {/* Keyword Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Keyword Performance</h3>
          <a
            href="/dashboard/monitor/keywords"
            className="text-xs text-primary hover:text-primary/80"
          >
            Manage Keywords →
          </a>
        </div>
        <KeywordTable keywords={keywords} />
      </div>
    </div>
  );
}
