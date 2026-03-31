"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AdminNoteFormProps {
  agencyId: string;
  onNoteAdded: () => void;
}

export function AdminNoteForm({ agencyId, onNoteAdded }: AdminNoteFormProps) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!note.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/subscribers/${agencyId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add note");
      }

      setNote("");
      onNoteAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Add an admin note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={submitting || !note.trim()}
      >
        {submitting ? "Adding..." : "Add Note"}
      </Button>
    </div>
  );
}
