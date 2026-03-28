"use client";

import { useEffect, useState, useCallback } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { KeywordOnboarding } from "@/components/monitor/keyword-onboarding";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface MonitorKeyword {
  id: string;
  keyword_id: string;
  keyword: string;
  is_monitored: boolean;
  prompts_generated: number;
  last_tested_at: string | null;
  som: number | null;
}

export default function MonitorKeywordsPage() {
  useEffect(() => { document.title = "AI Monitor — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [keywords, setKeywords] = useState<MonitorKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clientKeywords, setClientKeywords] = useState<
    Array<{ id: string; keyword: string; tags: string[]; is_active: boolean }>
  >([]);

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      // Load monitored keyword configs
      const configRes = await fetch(
        `/api/monitor/keywords?clientId=${selectedClientId}`
      );
      if (configRes.ok) {
        const result = await configRes.json();
        setKeywords(result.keywords || []);
      }

      // Load all client keywords for onboarding modal
      const kwRes = await fetch(
        `/api/keywords?client_id=${selectedClientId}`
      );
      if (kwRes.ok) {
        const result = await kwRes.json();
        const kwList = result.keywords || result.data || result;
        if (Array.isArray(kwList)) {
          setClientKeywords(kwList);
        }
      }
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <h2 className="text-lg font-semibold">Keyword Monitoring</h2>
        <EmptyState
          icon={Search}
          title="No client selected"
          description="Select a client to manage monitored keywords."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Keyword Monitoring</h2>
          <p className="text-sm text-muted-foreground">
            Manage which keywords are monitored across AI models for {selectedClientName}
          </p>
        </div>
        <button
          onClick={() => setShowOnboarding(true)}
          className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Add Keywords
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8">
          <EmptyState
            icon={Search}
            title="No keywords monitored"
            description="Enable keyword monitoring to track your brand's visibility for specific search terms."
          />
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Enable Monitoring
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Keyword</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Prompts</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">SoM</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Last Tested</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw) => (
                <tr key={kw.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <a
                      href={`/dashboard/monitor/keywords/${kw.keyword_id}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {kw.keyword}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {kw.prompts_generated}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {kw.som !== null ? (
                      <span className="font-medium text-foreground">{kw.som}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {kw.last_tested_at
                      ? new Date(kw.last_tested_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        kw.is_monitored
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {kw.is_monitored ? "Active" : "Paused"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
