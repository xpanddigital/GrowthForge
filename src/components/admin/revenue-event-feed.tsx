"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface RevenueEvent {
  id: string;
  event_type: string;
  agency_name?: string;
  previous_plan?: string;
  new_plan?: string;
  mrr_delta: number;
  amount_cents: number;
  occurred_at: string;
}

interface RevenueEventFeedProps {
  events: RevenueEvent[];
  loading?: boolean;
  showAgencyName?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const EVENT_BADGE_COLORS: Record<string, string> = {
  checkout_completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  subscription_updated: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  subscription_deleted: "bg-red-500/10 text-red-500 border-red-500/20",
  invoice_paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  invoice_payment_failed: "bg-red-500/10 text-red-500 border-red-500/20",
  trial_will_end: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

function formatEventType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function RevenueEventFeed({
  events,
  loading = false,
  showAgencyName = true,
}: RevenueEventFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {showAgencyName && <TableHead>Agency</TableHead>}
                <TableHead>Event</TableHead>
                <TableHead>Plan Change</TableHead>
                <TableHead className="text-right">MRR Impact</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({
                        length: showAgencyName ? 6 : 5,
                      }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(event.occurred_at)}
                      </TableCell>
                      {showAgencyName && (
                        <TableCell className="font-medium">
                          {event.agency_name ?? "-"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            EVENT_BADGE_COLORS[event.event_type] ??
                              "bg-gray-500/10 text-gray-500 border-gray-500/20"
                          )}
                        >
                          {formatEventType(event.event_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {event.previous_plan && event.new_plan ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="capitalize text-muted-foreground">
                              {event.previous_plan.replace("_", " ")}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="capitalize font-medium">
                              {event.new_plan.replace("_", " ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {event.mrr_delta !== 0 ? (
                          <span
                            className={cn(
                              "font-medium",
                              event.mrr_delta > 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            )}
                          >
                            {event.mrr_delta > 0 ? "+" : ""}
                            {currencyFormatter.format(event.mrr_delta / 100)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {currencyFormatter.format(event.amount_cents / 100)}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
