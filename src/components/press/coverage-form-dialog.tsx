"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { COVERAGE_TYPES } from "@/types/enums";

interface CoverageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  campaignId?: string;
  onCreated: () => void;
}

export function CoverageFormDialog({
  open,
  onOpenChange,
  clientId,
  campaignId,
  onCreated,
}: CoverageFormDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [publication, setPublication] = useState("");
  const [author, setAuthor] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [coverageType, setCoverageType] = useState("mention");
  const [hasBacklink, setHasBacklink] = useState(false);
  const [backlinkUrl, setBacklinkUrl] = useState("");
  const [isDofollow, setIsDofollow] = useState(false);
  const [domainAuthority, setDomainAuthority] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim() || !url.trim() || !publication.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/press/coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          campaign_id: campaignId || undefined,
          title: title.trim(),
          url: url.trim(),
          publication: publication.trim(),
          author: author.trim() || undefined,
          publish_date: publishDate || undefined,
          coverage_type: coverageType,
          has_backlink: hasBacklink,
          backlink_url: hasBacklink ? backlinkUrl.trim() || undefined : undefined,
          is_dofollow: hasBacklink ? isDofollow : undefined,
          estimated_domain_authority: domainAuthority ? parseInt(domainAuthority) : undefined,
        }),
      });
      if (res.ok) {
        resetForm();
        onOpenChange(false);
        onCreated();
      }
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setTitle("");
    setUrl("");
    setPublication("");
    setAuthor("");
    setPublishDate("");
    setCoverageType("mention");
    setHasBacklink(false);
    setBacklinkUrl("");
    setIsDofollow(false);
    setDomainAuthority("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Coverage</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cov-title">Title</Label>
            <Input id="cov-title" placeholder="Article title..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cov-url">URL</Label>
            <Input id="cov-url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cov-pub">Publication</Label>
              <Input id="cov-pub" placeholder="Publication name" value={publication} onChange={(e) => setPublication(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cov-author">Author</Label>
              <Input id="cov-author" placeholder="Author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Coverage Type</Label>
              <Select value={coverageType} onValueChange={setCoverageType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COVERAGE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cov-date">Publish Date</Label>
              <Input id="cov-date" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="cov-backlink" checked={hasBacklink} onCheckedChange={(v) => setHasBacklink(v as boolean)} />
              <Label htmlFor="cov-backlink" className="text-sm">Has backlink</Label>
            </div>
            {hasBacklink && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1.5">
                  <Label htmlFor="cov-burl">Backlink URL</Label>
                  <Input id="cov-burl" placeholder="https://..." value={backlinkUrl} onChange={(e) => setBacklinkUrl(e.target.value)} />
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="cov-dofollow" checked={isDofollow} onCheckedChange={(v) => setIsDofollow(v as boolean)} />
                    <Label htmlFor="cov-dofollow" className="text-sm">Dofollow</Label>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cov-da">DA</Label>
                    <Input id="cov-da" type="number" min={0} max={100} placeholder="0-100" value={domainAuthority} onChange={(e) => setDomainAuthority(e.target.value)} className="w-20" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!title.trim() || !url.trim() || !publication.trim() || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Coverage
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
