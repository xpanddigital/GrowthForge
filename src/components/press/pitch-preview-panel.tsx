"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/status-badge";
import type { PressOutreachEmail, Journalist } from "@/types/database";

interface EmailWithJournalist extends PressOutreachEmail {
  journalists: Pick<Journalist, "name" | "email" | "publication">;
}

interface PitchPreviewPanelProps {
  emails: EmailWithJournalist[];
  onSend: (emailIds: string[]) => void;
  sending?: boolean;
}

function EmailCard({
  email,
  selected,
  onToggle,
}: {
  email: EmailWithJournalist;
  selected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSent = email.status !== "pending";

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        {!isSent && (
          <Checkbox checked={selected} onCheckedChange={onToggle} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{email.journalists.name}</p>
            <span className="text-xs text-muted-foreground">{email.journalists.publication}</span>
            <StatusBadge status={email.status} />
            <StatusBadge status={email.tier} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {email.subject_line}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {email.sent_at && <span>Sent {new Date(email.sent_at).toLocaleDateString("en-AU")}</span>}
          {email.opened_at && <span className="text-cyan-500">Opened</span>}
          {email.replied_at && <span className="text-emerald-500">Replied</span>}
          {email.bounced_at && <span className="text-red-500">Bounced</span>}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-border px-4 py-3">
          <div className="mb-2">
            <span className="text-xs font-medium text-muted-foreground">To: </span>
            <span className="text-xs">{email.journalists.email || "No email"}</span>
          </div>
          <div className="mb-2">
            <span className="text-xs font-medium text-muted-foreground">Subject: </span>
            <span className="text-xs">{email.subject_line}</span>
          </div>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
            {email.body}
          </div>
        </div>
      )}
    </div>
  );
}

export function PitchPreviewPanel({ emails, onSend, sending }: PitchPreviewPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pendingEmails = emails.filter((e) => e.status === "pending");

  function toggleEmail(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === pendingEmails.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingEmails.map((e) => e.id)));
    }
  }

  if (emails.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-primary/50 mb-3" />
        <h3 className="font-medium mb-1">No pitches generated yet</h3>
        <p className="text-sm text-muted-foreground">
          Select journalists and generate pitches from the Journalists tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      {pendingEmails.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.size === pendingEmails.length && pendingEmails.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} of {pendingEmails.length} pending selected
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => onSend(Array.from(selectedIds))}
            disabled={selectedIds.size === 0 || sending}
          >
            {sending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-3.5 w-3.5" />
            )}
            Send Selected ({selectedIds.size})
          </Button>
        </div>
      )}

      {/* Email list */}
      <div className="space-y-2">
        {emails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            selected={selectedIds.has(email.id)}
            onToggle={() => toggleEmail(email.id)}
          />
        ))}
      </div>
    </div>
  );
}
