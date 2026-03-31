"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface PlanChangeDialogProps {
  agencyId: string;
  agencyName: string;
  currentPlan: string;
  onSuccess: () => void;
}

const PLAN_OPTIONS = [
  { value: "solo", label: "Solo" },
  { value: "growth", label: "Growth" },
  { value: "agency", label: "Agency" },
  { value: "agency_pro", label: "Agency Pro" },
  { value: "agency_unlimited", label: "Unlimited" },
];

export function PlanChangeDialog({
  agencyId,
  agencyName,
  currentPlan,
  onSuccess,
}: PlanChangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (selectedPlan === currentPlan) {
      setError("Selected plan is the same as the current plan");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/subscribers/${agencyId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to change plan");
      }

      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Change Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Plan - {agencyName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Current Plan
            </label>
            <div className="mt-1">
              <Badge variant="outline" className="capitalize">
                {currentPlan.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Plan</label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan !== currentPlan && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
              <Badge variant="outline" className="capitalize">
                {currentPlan.replace("_", " ")}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="capitalize">
                {selectedPlan.replace("_", " ")}
              </Badge>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || selectedPlan === currentPlan}
          >
            {submitting ? "Changing..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
