"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useClientContext } from "@/hooks/use-client-context";
import { createClient } from "@/lib/supabase/client";

interface AuditReport {
  id: string;
  audit_type: string;
  status: string;
  composite_score: number | null;
  completed_at: string | null;
  created_at: string;
}

function getScoreColor(score: number): string {
  if (score <= 30) return "text-red-400";
  if (score <= 60) return "text-amber-400";
  return "text-emerald-400";
}

export default function ReportsPage() {
  useEffect(() => { document.title = "Reports — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadReports() {
      if (!selectedClientId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("audits")
        .select("id, audit_type, status, composite_score, completed_at, created_at")
        .eq("client_id", selectedClientId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      setAudits((data as AuditReport[]) || []);
      setLoading(false);
    }

    setLoading(true);
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Download AI Visibility Audit reports for {selectedClientName || "your clients"}.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : audits.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description={
              selectedClientId
                ? "Run an AI Visibility Audit to generate your first report."
                : "Select a client to view their reports."
            }
          />
          {selectedClientId && (
            <div className="mt-4 flex justify-center">
              <Button onClick={() => router.push("/dashboard/audits")}>
                Go to Audits
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => (
            <div
              key={audit.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    AI Visibility Audit —{" "}
                    {audit.audit_type === "full"
                      ? "Full"
                      : audit.audit_type === "quick"
                        ? "Quick"
                        : audit.audit_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {audit.completed_at
                      ? new Date(audit.completed_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "Pending"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {audit.composite_score !== null && (
                  <Badge
                    variant="secondary"
                    className={getScoreColor(audit.composite_score)}
                  >
                    Score: {audit.composite_score}/100
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `/dashboard/audits/${audit.id}/report`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
