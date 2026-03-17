"use client";

import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function PressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">PressForge</h2>
        <p className="text-sm text-muted-foreground">
          Manage digital PR campaigns and press distribution.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <EmptyState
          icon={Newspaper}
          title="Coming soon"
          description="PressForge will help you create and distribute press campaigns to build the authority signals that AI models use to rank brands."
        />
      </div>
    </div>
  );
}
