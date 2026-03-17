"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Journalist } from "@/types/database";

interface JournalistTableProps {
  journalists: Journalist[];
  loading?: boolean;
}

export function JournalistTable({ journalists, loading }: JournalistTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {["Name", "Publication", "Region", "Beats", "Pitched", "Response Rate", "Score", ""].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
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

  if (journalists.length === 0) return null;

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Publication</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Beats</TableHead>
            <TableHead className="text-right">Pitched</TableHead>
            <TableHead className="text-right">Response Rate</TableHead>
            <TableHead className="text-right">Relationship</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {journalists.map((j) => (
            <TableRow key={j.id} className={j.is_blacklisted ? "opacity-50" : ""}>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{j.name}</p>
                  {j.email && <p className="text-xs text-muted-foreground">{j.email}</p>}
                </div>
              </TableCell>
              <TableCell className="text-sm">{j.publication}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{j.region || "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {j.beats.slice(0, 3).map((beat) => (
                    <Badge key={beat} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {beat}
                    </Badge>
                  ))}
                  {j.beats.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      +{j.beats.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm">{j.total_pitched}</TableCell>
              <TableCell className="text-right tabular-nums text-sm">
                {j.response_rate !== null ? `${Math.round(j.response_rate * 100)}%` : "-"}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm">
                {j.relationship_score !== null ? j.relationship_score : "-"}
              </TableCell>
              <TableCell>
                {j.is_blacklisted && (
                  <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-500">
                    Blacklisted
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
