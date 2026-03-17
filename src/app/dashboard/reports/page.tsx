"use client";

import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Unified reporting across all modules.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <EmptyState
          icon={BarChart3}
          title="Coming soon"
          description="Unified reporting will bring together data from all modules — citations, AI presence, entities, reviews, and press — into client-ready reports."
        />
      </div>
    </div>
  );
}
