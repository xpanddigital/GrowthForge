"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VoiceSampleEditor } from "@/components/press/voice-sample-editor";
import type { Spokesperson } from "@/types/database";

interface SpokespersonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  spokesperson?: Spokesperson | null;
  onSaved: () => void;
}

export function SpokespersonFormDialog({
  open,
  onOpenChange,
  clientId,
  spokesperson,
  onSaved,
}: SpokespersonFormDialogProps) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [voiceSamples, setVoiceSamples] = useState<Array<{ quote: string; context: string; date: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (spokesperson) {
      setName(spokesperson.name);
      setTitle(spokesperson.title);
      setBio(spokesperson.bio || "");
      setEmail(spokesperson.email || "");
      setPhone(spokesperson.phone || "");
      setIsPrimary(spokesperson.is_primary);
      setVoiceSamples(spokesperson.voice_samples || []);
    } else {
      setName("");
      setTitle("");
      setBio("");
      setEmail("");
      setPhone("");
      setIsPrimary(false);
      setVoiceSamples([]);
    }
  }, [spokesperson, open]);

  async function handleSave() {
    if (!name.trim() || !title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/press/spokespersons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          name: name.trim(),
          title: title.trim(),
          bio: bio.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          is_primary: isPrimary,
          voice_samples: voiceSamples.filter((s) => s.quote.trim()),
        }),
      });
      if (res.ok) {
        onOpenChange(false);
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {spokesperson ? "Edit Spokesperson" : "Add Spokesperson"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sp-name">Name</Label>
              <Input id="sp-name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sp-title">Title</Label>
              <Input id="sp-title" placeholder="CEO, Founder, etc." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-bio">Bio</Label>
            <Textarea id="sp-bio" placeholder="Short bio..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sp-email">Email</Label>
              <Input id="sp-email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sp-phone">Phone</Label>
              <Input id="sp-phone" placeholder="+61..." value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Primary Spokesperson</p>
              <p className="text-xs text-muted-foreground">Used as the default for new campaigns</p>
            </div>
            <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
          </div>

          <VoiceSampleEditor samples={voiceSamples} onChange={setVoiceSamples} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim() || !title.trim() || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {spokesperson ? "Save Changes" : "Add Spokesperson"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
