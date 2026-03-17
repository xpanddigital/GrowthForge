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
import { PR_TYPES } from "@/types/enums";
import type { Spokesperson } from "@/types/database";

interface CampaignCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  spokespersons: Spokesperson[];
  onCreated: (campaignId: string) => void;
}

export function CampaignCreateDialog({
  open,
  onOpenChange,
  clientId,
  spokespersons,
  onCreated,
}: CampaignCreateDialogProps) {
  const [headline, setHeadline] = useState("");
  const [angle, setAngle] = useState("");
  const [prType, setPrType] = useState("expert_commentary");
  const [spokespersonId, setSpokespersonId] = useState("");
  const [targetRegion, setTargetRegion] = useState("AU");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!headline.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/press/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          headline: headline.trim(),
          angle: angle.trim() || undefined,
          pr_type: prType,
          spokesperson_id: spokespersonId || undefined,
          target_region: targetRegion,
          target_date: targetDate || undefined,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        resetForm();
        onOpenChange(false);
        onCreated(data.id);
      }
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setHeadline("");
    setAngle("");
    setPrType("expert_commentary");
    setSpokespersonId("");
    setTargetRegion("AU");
    setTargetDate("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Press Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              placeholder="Campaign headline..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="angle">Angle</Label>
            <Input
              id="angle"
              placeholder="What makes this newsworthy..."
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>PR Type</Label>
              <Select value={prType} onValueChange={setPrType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PR_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Spokesperson</Label>
              <Select value={spokespersonId} onValueChange={setSpokespersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {spokespersons.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Target Region</Label>
              <Select value={targetRegion} onValueChange={setTargetRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="GLOBAL">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!headline.trim() || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Campaign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
