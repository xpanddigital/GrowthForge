"use client";

import { useEffect, useState, useCallback } from "react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertEventCard } from "@/components/monitor/alert-event-card";
import { AlertConfigForm } from "@/components/monitor/alert-config-form";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

interface AlertEvent {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

interface AlertRule {
  id: string;
  alert_type: string;
  threshold_value: number;
  threshold_direction: string;
  is_active: boolean;
}

export default function MonitorAlertsPage() {
  useEffect(() => { document.title = "AI Monitor — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [tab, setTab] = useState<"events" | "rules">("events");

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/monitor/alerts?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setRules(data.rules || []);
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

  const handleAcknowledge = async (eventId: string) => {
    try {
      await fetch(`/api/monitor/alerts/${eventId}/acknowledge`, {
        method: "POST",
      });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, is_acknowledged: true, acknowledged_at: new Date().toISOString() }
            : e
        )
      );
    } catch {
      // handle
    }
  };

  const handleCreateRule = async (config: {
    alert_type: string;
    threshold_value: number;
    threshold_direction: string;
  }) => {
    if (!selectedClientId) return;
    try {
      await fetch("/api/monitor/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, ...config }),
      });
      setShowCreateRule(false);
      await loadData();
    } catch {
      // handle
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Alerts</h2>
        <EmptyState
          icon={Bell}
          title="No client selected"
          description="Select a client to manage alerts."
        />
      </div>
    );
  }

  const unackCount = events.filter((e) => !e.is_acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alerts</h2>
          <p className="text-sm text-muted-foreground">
            Monitor alerts and notification rules for {selectedClientName}
          </p>
        </div>
        <button
          onClick={() => setShowCreateRule(true)}
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create Rule
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-px">
        <button
          onClick={() => setTab("events")}
          className={cn(
            "px-3 py-1.5 text-sm border-b-2 transition-colors",
            tab === "events"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Events
          {unackCount > 0 && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
              {unackCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("rules")}
          className={cn(
            "px-3 py-1.5 text-sm border-b-2 transition-colors",
            tab === "rules"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Rules ({rules.length})
        </button>
      </div>

      {/* Create rule form */}
      {showCreateRule && (
        <AlertConfigForm
          clientId={selectedClientId}
          onSave={handleCreateRule}
          onCancel={() => setShowCreateRule(false)}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : tab === "events" ? (
        events.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No alert events"
            description="Alert events will appear here when monitoring thresholds are triggered."
          />
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <AlertEventCard
                key={event.id}
                event={event}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </div>
        )
      ) : (
        /* Rules tab */
        rules.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No alert rules"
            description="Create alert rules to get notified when AI visibility changes."
          />
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Condition</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3 text-foreground capitalize">
                      {rule.alert_type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {rule.threshold_direction} {rule.threshold_value}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          rule.is_active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-muted/30 text-muted-foreground"
                        )}
                      >
                        {rule.is_active ? "Active" : "Paused"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
