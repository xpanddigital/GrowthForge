"use client";

import { useState } from "react";
import { Loader2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { RelevanceBar } from "@/components/shared/relevance-bar";
import type { PressCampaignJournalistScore, Journalist } from "@/types/database";

interface ScoreWithJournalist extends PressCampaignJournalistScore {
  journalists: Pick<Journalist, "name" | "email" | "publication" | "region" | "beats">;
}

interface JournalistScoreTableProps {
  scores: ScoreWithJournalist[];
  onSelectToggle: (scoreIds: string[], selected: boolean) => void;
  onDiscoverMore: () => void;
  onGeneratePitches: () => void;
  discovering?: boolean;
  generatingPitches?: boolean;
}

export function JournalistScoreTable({
  scores,
  onSelectToggle,
  onDiscoverMore,
  onGeneratePitches,
  discovering,
  generatingPitches,
}: JournalistScoreTableProps) {
  const [search, setSearch] = useState("");
  const selectedCount = scores.filter((s) => s.is_selected).length;

  const filtered = scores.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.journalists.name.toLowerCase().includes(q) ||
      s.journalists.publication.toLowerCase().includes(q) ||
      (s.journalists.email?.toLowerCase().includes(q) ?? false)
    );
  });

  const allSelected = filtered.length > 0 && filtered.every((s) => s.is_selected);

  function toggleAll() {
    const ids = filtered.map((s) => s.id);
    onSelectToggle(ids, !allSelected);
  }

  if (scores.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <Users className="mx-auto h-8 w-8 text-primary/50 mb-3" />
        <h3 className="font-medium mb-1">No journalists scored yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Discover and score journalists relevant to your press release.
        </p>
        <Button onClick={onDiscoverMore} disabled={discovering}>
          {discovering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Discover Journalists
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search journalists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {scores.length} selected
          </span>
          <Button variant="outline" size="sm" onClick={onDiscoverMore} disabled={discovering}>
            {discovering && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Discover More
          </Button>
          <Button size="sm" onClick={onGeneratePitches} disabled={selectedCount === 0 || generatingPitches}>
            {generatingPitches && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Generate Pitches ({selectedCount})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Publication</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="w-24">Score</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Why Selected</TableHead>
              <TableHead>Personalization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((score) => (
              <TableRow key={score.id}>
                <TableCell>
                  <Checkbox
                    checked={score.is_selected}
                    onCheckedChange={(checked) =>
                      onSelectToggle([score.id], checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{score.journalists.name}</p>
                    {score.journalists.email && (
                      <p className="text-xs text-muted-foreground">{score.journalists.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{score.journalists.publication}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {score.journalists.region || "-"}
                </TableCell>
                <TableCell>
                  <RelevanceBar score={score.total_score} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={score.tier} />
                </TableCell>
                <TableCell className="max-w-48">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {score.why_selected || "-"}
                  </p>
                </TableCell>
                <TableCell className="max-w-48">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {score.personalization_hook || "-"}
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
