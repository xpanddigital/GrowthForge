"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PrTypeBadge } from "@/components/press/pr-type-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PressCampaign } from "@/types/database";

interface CampaignWithRelations extends PressCampaign {
  spokespersons?: { name: string; title: string } | null;
  press_releases?: Array<{ id: string; title: string; status: string; is_current: boolean }>;
}

interface CampaignTableProps {
  campaigns: CampaignWithRelations[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CampaignTable({ campaigns, onDelete, loading }: CampaignTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {["Name", "Type", "Status", "Target Date", "Journalists", "Pitches", "Coverage", "Created"].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (campaigns.length === 0) return null;

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Target Date</TableHead>
            <TableHead className="text-right">Journalists</TableHead>
            <TableHead className="text-right">Pitches</TableHead>
            <TableHead className="text-right">Coverage</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="group">
              <TableCell>
                <Link
                  href={`/dashboard/press/${campaign.id}`}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {campaign.headline || campaign.name}
                </Link>
                {campaign.spokespersons && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {campaign.spokespersons.name}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <PrTypeBadge prType={campaign.pr_type} />
              </TableCell>
              <TableCell>
                <StatusBadge status={campaign.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(campaign.target_date)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {campaign.journalists_targeted}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {campaign.pitches_sent}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {campaign.coverage_count}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(campaign.created_at)}
              </TableCell>
              <TableCell>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm("Delete this campaign?")) onDelete(campaign.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
