"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Spokesperson } from "@/types/database";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface IdeaGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  spokespersons: Spokesperson[];
  onGenerated: () => void;
}

export function IdeaGenerationDialog({
  open,
  onOpenChange,
  clientId,
  spokespersons,
  onGenerated,
}: IdeaGenerationDialogProps) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [spokespersonId, setSpokespersonId] = useState("");
  const [count, setCount] = useState("5");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!spokespersonId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/press/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          spokesperson_id: spokespersonId,
          month: parseInt(month),
          year: parseInt(year),
          count: parseInt(count) || 5,
        }),
      });
      if (res.ok) {
        onOpenChange(false);
        // Ideas generate in background — caller should poll
        setTimeout(onGenerated, 5000);
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Campaign Ideas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[now.getFullYear(), now.getFullYear() + 1].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Spokesperson</Label>
            <Select value={spokespersonId} onValueChange={setSpokespersonId}>
              <SelectTrigger><SelectValue placeholder="Select spokesperson..." /></SelectTrigger>
              <SelectContent>
                {spokespersons.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} — {s.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="idea-count">Number of ideas</Label>
            <Input
              id="idea-count"
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-24"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={!spokespersonId || generating}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Ideas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
