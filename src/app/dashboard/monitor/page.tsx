"use client";

import { useEffect, useState, useCallback } from "react";
import { Radar, BookOpen } from "lucide-react";
import Link from "next/link";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { VisibilityScoreCard } from "@/components/monitor/visibility-score-card";
import { ModelBreakdown } from "@/components/monitor/model-breakdown";
import { CompetitorComparison } from "@/components/monitor/competitor-comparison";
import { SomTrendChart } from "@/components/monitor/som-trend-chart";
import { KeywordTable } from "@/components/monitor/keyword-table";
import { CorrelationTimeline } from "@/components/monitor/correlation-timeline";
import { FocusCompetitorSelector } from "@/components/monitor/focus-competitor-selector";
import { KeywordOnboarding } from "@/components/monitor/keyword-onboarding";

interface Snapshot {
  id: string;
  ai_visibility_score: number;
  overall_som: number;
  som_by_model: Record<string, number>;
  model_breakdown: Record<string, { mentioned: number; total: number; som: number }>;
  som_delta: number | null;
  score_delta: number | null;
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
  useEffect(() => { document.title = "AI Monitor — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [trendData, setTrendData] = useState<Array<{ date: string; score: number; som: number }>>([]);
  const [keywords, setKeywords] = useState<MonitorKeywordRow[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clientKeywords, setClientKeywords] = useState<Array<{ id: string; keyword: string; tags: string[]; is_active: boolean }>>([]);
  const [scanning, setScanning] = useState(false);
  const [competitors, setCompetitors] = useState<Array<{
    id: string;
    competitor_name: string;
    is_focus: boolean;
    is_active: boolean;
    som: number;
    discovered_via?: string;
  }>>([]);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const [snapshotsRes, timelineRes, keywordsRes, clientKwRes, competitorsRes] = await Promise.all([
        fetch(`/api/monitor/snapshots?clientId=${selectedClientId}&limit=12`),
        fetch(`/api/monitor/timeline?clientId=${selectedClientId}`),
        fetch(`/api/monitor/keywords?clientId=${selectedClientId}`),
        fetch(`/api/keywords?client_id=${selectedClientId}`),
        fetch(`/api/monitor/competitors?clientId=${selectedClientId}`),
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
          setSnapshot({ ...latest, som_by_model: somByModel, model_breakdown: breakdown });
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

      if (competitorsRes.ok) {
        const result = await competitorsRes.json();
        setCompetitors(
          (result.competitors || []).map((c: Record<string, unknown>) => ({
            id: c.id as string,
            competitor_name: c.competitor_name as string,
            is_focus: (c.is_focus as boolean) || false,
            is_active: (c.is_active as boolean) || true,
            som: (c.som as number) || 0,
            discovered_via: c.discovered_via as string | undefined,
          }))
        );
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

  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStartTime, setScanStartTime] = useState<number | null>(null);
  const ESTIMATED_SCAN_SECONDS = 180; // 3 minutes estimate

  // Progress bar timer
  useEffect(() => {
    if (!scanning || !scanStartTime) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - scanStartTime) / 1000;
      const progress = Math.min((elapsed / ESTIMATED_SCAN_SECONDS) * 100, 95);
      setScanProgress(progress);
    }, 500);
    return () => clearInterval(interval);
  }, [scanning, scanStartTime]);

  const handleRunScan = async () => {
    if (!selectedClientId || scanning) return;
    setScanning(true);
    setScanStatus(null);
    setScanProgress(0);
    setScanStartTime(Date.now());
    try {
      const res = await fetch("/api/monitor/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("[monitor] Scan failed:", data);
        setScanStatus(`Error: ${data.details || data.error || "Unknown error"}`);
        setScanning(false);
        setScanStartTime(null);
        setScanProgress(0);
      } else {
        setScanStatus("scanning");
        // Poll for results — when we get a snapshot, scan is done
        const pollInterval = setInterval(async () => {
          await loadData();
        }, 10000);
        // Auto-stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          if (scanning) {
            setScanning(false);
            setScanStartTime(null);
            setScanProgress(100);
            setScanStatus("Scan complete — loading results.");
            loadData();
          }
        }, 300000);
      }
    } catch (err) {
      console.error("[monitor] Scan request failed:", err);
      setScanStatus("Failed to reach server.");
      setScanning(false);
      setScanStartTime(null);
      setScanProgress(0);
    }
  };

  const handleEnableKeywords = async (keywordIds: string[]) => {
    if (!selectedClientId) return;
    await fetch("/api/monitor/keywords/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClientId, keywordIds }),
    });
    setShowOnboarding(false);
    await loadData();
  };

  const handleToggleFocus = async (competitorId: string, isFocus: boolean) => {
    // Optimistic update
    setCompetitors((prev) =>
      prev.map((c) => (c.id === competitorId ? { ...c, is_focus: isFocus } : c))
    );
    try {
      await fetch("/api/monitor/competitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorId, is_focus: isFocus }),
      });
    } catch {
      // Revert on failure
      setCompetitors((prev) =>
        prev.map((c) => (c.id === competitorId ? { ...c, is_focus: !isFocus } : c))
      );
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">AI Monitor<Link href="/dashboard/academy/ai-monitor-mastery" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
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
          <h2 className="text-lg font-semibold flex items-center gap-2">AI Monitor<Link href="/dashboard/academy/ai-monitor-mastery" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
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
    // Keywords enabled but no scan run yet — show ready state
    if (keywords.length > 0) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">AI Monitor<Link href="/dashboard/academy/ai-monitor-mastery" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
              <p className="text-sm text-muted-foreground">
                {selectedClientName}&apos;s AI monitoring is set up — run your first scan.
              </p>
            </div>
            <button
              onClick={handleRunScan}
              disabled={scanning}
              className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {scanning ? "Scanning..." : "Run First Scan"}
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Radar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Ready to scan</h3>
                <p className="text-xs text-muted-foreground">
                  {keywords.length} keyword{keywords.length !== 1 ? "s" : ""} enabled with AI-optimized prompts
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {keywords.map((kw) => (
                <div
                  key={kw.keywordId}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 text-sm"
                >
                  <span className="font-medium">{kw.keyword}</span>
                  <span className="text-xs text-muted-foreground">
                    {kw.totalTests} prompt{kw.totalTests !== 1 ? "s" : ""} generated
                  </span>
                </div>
              ))}
            </div>
            {scanning && scanStatus === "scanning" && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary font-medium flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Scanning across 5 AI models...
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(scanProgress)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Testing your brand against real prompts on ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews.
                  This typically takes 2–5 minutes. You can leave this page — results will be here when you return.
                </p>
              </div>
            )}
            {scanStatus && scanStatus !== "scanning" && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                scanStatus.startsWith("Error") || scanStatus.startsWith("Failed")
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}>
                {scanStatus}
              </div>
            )}
            {!scanStatus && !scanning && (
              <p className="text-xs text-muted-foreground mt-4">
                Click &quot;Run First Scan&quot; to test your brand across ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews.
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              + Add more keywords
            </button>
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

    // No keywords enabled yet — show onboarding
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">AI Monitor<Link href="/dashboard/academy/ai-monitor-mastery" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
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
          <h2 className="text-lg font-semibold flex items-center gap-2">AI Monitor<Link href="/dashboard/academy/ai-monitor-mastery" className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors"><BookOpen className="h-3 w-3" />Learn</Link></h2>
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

      {scanning && scanStatus === "scanning" && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary font-medium flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              Scanning across 5 AI models...
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(scanProgress)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Typically takes 2–5 minutes. You can leave this page — results will be here when you return.
          </p>
        </div>
      )}
      {scanStatus && scanStatus !== "scanning" && (
        <div className={`p-3 rounded-md text-sm ${
          scanStatus.startsWith("Error") || scanStatus.startsWith("Failed")
            ? "bg-red-500/10 text-red-400 border border-red-500/20"
            : "bg-primary/10 text-primary border border-primary/20"
        }`}>
          {scanStatus}
        </div>
      )}

      {/* Hero: AI Visibility Score + Model Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VisibilityScoreCard
          score={snapshot.ai_visibility_score}
          somPercent={snapshot.overall_som}
          scoreDelta={snapshot.score_delta ?? null}
          somDelta={snapshot.som_delta}
        />
        <div className="lg:col-span-2">
          <ModelBreakdown
            breakdown={snapshot.model_breakdown || {}}
          />
        </div>
      </div>

      {/* Trend + Competitor + Focus Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SomTrendChart data={trendData} />
        <CompetitorComparison
          clientName={selectedClientName || "You"}
          clientSom={snapshot.overall_som}
          competitors={snapshot.competitor_som || {}}
          focusCompetitors={new Set(competitors.filter((c) => c.is_focus).map((c) => c.competitor_name))}
        />
        <FocusCompetitorSelector
          competitors={competitors.filter((c) => c.is_active)}
          onToggleFocus={handleToggleFocus}
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
