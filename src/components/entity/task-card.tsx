"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CopyButton } from "@/components/citations/copy-button";
import { CodeBlock } from "./code-block";

interface TaskCardProps {
  task: {
    id: string;
    taskType: string;
    description: string;
    instructions: string | null;
    generatedCode: string | null;
    platformDescription: string | null;
    platformCharLimit: number | null;
    platform: string | null;
    priority: string;
    priorityScore: number;
    status: string;
  };
  onStatusChange?: (taskId: string, status: string) => void;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-500", label: "Critical" },
  high: { bg: "bg-orange-500/10", text: "text-orange-500", label: "High" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "Medium" },
  low: { bg: "bg-zinc-500/10", text: "text-zinc-400", label: "Low" },
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/10 text-blue-500",
  completed: "bg-emerald-500/10 text-emerald-500",
  skipped: "bg-zinc-500/10 text-zinc-400",
};

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const priorityStyle = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.low;
  const statusStyle = STATUS_STYLES[task.status] ?? STATUS_STYLES.pending;
  const charCount = task.platformDescription?.length ?? 0;
  const charLimit = task.platformCharLimit;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-0.5 shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority badge */}
            <span
              className={cn(
                "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                priorityStyle.bg,
                priorityStyle.text
              )}
            >
              {priorityStyle.label}
            </span>
            {/* Status badge */}
            <span
              className={cn(
                "inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium capitalize",
                statusStyle
              )}
            >
              {task.status.replace("_", " ")}
            </span>
            {/* Platform */}
            {task.platform && (
              <span className="text-xs text-muted-foreground">
                {task.platform}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-foreground">{task.description}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {task.taskType} &middot; Priority score: {task.priorityScore}
          </p>
        </div>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
          {/* Instructions */}
          {task.instructions && (
            <div>
              <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Instructions
              </h4>
              <p className="text-sm leading-relaxed text-foreground/90">
                {task.instructions}
              </p>
            </div>
          )}

          {/* Generated code */}
          {task.generatedCode && (
            <div>
              <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Generated Code
              </h4>
              <CodeBlock code={task.generatedCode} title="Copy Code" />
            </div>
          )}

          {/* Platform description */}
          {task.platformDescription && (
            <div>
              <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Platform Description
              </h4>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {task.platformDescription}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {charLimit && (
                      <>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              charCount / charLimit > 0.9
                                ? "bg-red-500"
                                : charCount / charLimit > 0.7
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            )}
                            style={{
                              width: `${Math.min((charCount / charLimit) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {charCount}/{charLimit}
                        </span>
                      </>
                    )}
                  </div>
                  <CopyButton text={task.platformDescription} />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => onStatusChange?.(task.id, "completed")}
              className="rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500 transition-colors hover:bg-emerald-500/20"
            >
              Mark Complete
            </button>
            <button
              type="button"
              onClick={() => onStatusChange?.(task.id, "skipped")}
              className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Skip
            </button>
            <button
              type="button"
              disabled
              className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground/50 cursor-not-allowed"
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
