"use client";

import { useState } from "react";
import { Check, X, RefreshCw, Loader2, ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PressRelease } from "@/types/database";

interface PressReleasePanelProps {
  releases: PressRelease[];
  onGenerate: () => void;
  onApprove: (releaseId: string) => void;
  onReject: (releaseId: string) => void;
  generating?: boolean;
  approving?: boolean;
}

export function PressReleasePanel({
  releases,
  onGenerate,
  onApprove,
  onReject,
  generating,
  approving,
}: PressReleasePanelProps) {
  const currentRelease = releases.find((r) => r.is_current);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);

  const displayRelease = selectedVersion
    ? releases.find((r) => r.id === selectedVersion)
    : currentRelease;

  if (releases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <h3 className="font-medium mb-1">No press release yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Go to the Setup tab and generate a press release first.
        </p>
        <Button onClick={onGenerate} disabled={generating}>
          {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Press Release
        </Button>
      </div>
    );
  }

  if (!displayRelease) return null;

  const qualityChecks = displayRelease.quality_checks as Record<string, boolean> | undefined;

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">{displayRelease.title}</h3>
          <StatusBadge status={displayRelease.status} />
          {releases.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors"
              >
                v{displayRelease.version}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showVersions && (
                <div className="absolute top-full left-0 z-10 mt-1 rounded-md border border-border bg-card p-1 shadow-md">
                  {releases.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedVersion(r.id);
                        setShowVersions(false);
                      }}
                      className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                    >
                      <span>v{r.version}</span>
                      {r.is_current && (
                        <span className="text-primary">(current)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {displayRelease.public_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={displayRelease.public_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Public URL
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Regenerate
          </Button>
          {displayRelease.status === "draft" && displayRelease.is_current && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(displayRelease.id)}
                className="text-red-500 hover:text-red-600"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove(displayRelease.id)}
                disabled={approving}
              >
                {approving ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                )}
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Subtitle */}
      {displayRelease.subtitle && (
        <p className="text-sm text-muted-foreground">{displayRelease.subtitle}</p>
      )}

      {/* Quality checks */}
      {qualityChecks && Object.keys(qualityChecks).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(qualityChecks).map(([key, passed]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                passed
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {key.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      {/* Release body */}
      <ScrollArea className="h-[500px] rounded-lg border border-border bg-card">
        <div
          className="prose prose-invert prose-sm max-w-none p-6"
          dangerouslySetInnerHTML={{ __html: displayRelease.body_html }}
        />
      </ScrollArea>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {displayRelease.word_count && <span>{displayRelease.word_count} words</span>}
        {displayRelease.target_region && <span>Region: {displayRelease.target_region}</span>}
        <span>Created: {new Date(displayRelease.created_at).toLocaleDateString("en-AU")}</span>
      </div>
    </div>
  );
}
