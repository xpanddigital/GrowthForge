"use client";

import { AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface InsufficientCreditsProps {
  required: number;
  available: number;
  action?: string;
}

export function InsufficientCredits({
  required,
  available,
  action = "this action",
}: InsufficientCreditsProps) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-amber-500/10 p-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-500">Insufficient Credits</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {action} requires <strong>{required}</strong> credits, but you only
            have <strong>{available}</strong>. Upgrade your plan or purchase
            additional credits to continue.
          </p>
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/dashboard/settings?tab=billing">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
