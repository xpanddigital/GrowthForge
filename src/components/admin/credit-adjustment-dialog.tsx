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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CreditAdjustmentDialogProps {
  agencyId: string;
  agencyName: string;
  currentBalance: number;
  onSuccess: () => void;
}

export function CreditAdjustmentDialog({
  agencyId,
  agencyName,
  currentBalance,
  onSuccess,
}: CreditAdjustmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = typeof amount === "number" ? amount : 0;
  const newBalance = currentBalance + numericAmount;

  async function handleSubmit() {
    if (typeof amount !== "number" || amount === 0) {
      setError("Amount must be a non-zero number");
      return;
    }
    if (!reason.trim()) {
      setError("Reason is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/subscribers/${agencyId}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason: reason.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to adjust credits");
      }

      setAmount("");
      setReason("");
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
          Adjust Credits
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Credits - {agencyName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Current Balance
            </label>
            <p className="text-lg font-semibold">
              {currentBalance.toLocaleString()} credits
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Amount (positive to add, negative to deduct)
            </label>
            <Input
              type="number"
              placeholder="e.g. 500 or -200"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                setAmount(val === "" ? "" : Number(val));
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Input
              placeholder="e.g. Manual top-up, refund, bonus..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {typeof amount === "number" && amount !== 0 && (
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                New balance:{" "}
                <span
                  className={cn(
                    "font-semibold",
                    newBalance < 0 ? "text-red-500" : "text-foreground"
                  )}
                >
                  {newBalance.toLocaleString()} credits
                </span>
              </p>
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
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Adjusting..." : "Confirm Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
