"use client";

import { User, Mic, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Spokesperson } from "@/types/database";

interface SpokespersonCardProps {
  spokesperson: Spokesperson;
  onEdit: () => void;
  onModelVoice: () => void;
}

export function SpokespersonCard({ spokesperson, onEdit, onModelVoice }: SpokespersonCardProps) {
  const hasVoice = !!spokesperson.voice_profile;
  const hasSamples = spokesperson.voice_samples && spokesperson.voice_samples.length >= 3;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{spokesperson.name}</h3>
            {spokesperson.is_primary && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Primary
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{spokesperson.title}</p>
          {spokesperson.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{spokesperson.bio}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            {hasVoice ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                <Mic className="h-3 w-3" />
                Voice profile ready
              </span>
            ) : hasSamples ? (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                {spokesperson.voice_samples.length} samples — ready to model
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {spokesperson.voice_samples.length}/3 voice samples
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
        {hasSamples && !hasVoice && (
          <Button size="sm" onClick={onModelVoice}>
            <Mic className="mr-1.5 h-3.5 w-3.5" />
            Model Voice
          </Button>
        )}
      </div>
    </div>
  );
}
