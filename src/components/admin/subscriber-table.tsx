"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Agency {
  id: string;
  name: string;
  owner_email: string;
  plan: string;
  subscription_status: string;
  credits_balance: number;
  client_count?: number;
  user_count?: number;
  last_active_at?: string;
  created_at: string;
}

interface SubscriberTableProps {
  agencies: Agency[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: {
    plan?: string;
    status?: string;
    search?: string;
  }) => void;
  loading?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  trialing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  past_due: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  canceled: "bg-red-500/10 text-red-500 border-red-500/20",
};

const PLAN_COLORS: Record<string, string> = {
  solo: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  growth: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  agency: "bg-purple-600/10 text-purple-400 border-purple-600/20",
  agency_pro: "bg-purple-700/10 text-purple-300 border-purple-700/20",
  agency_unlimited: "bg-purple-800/10 text-purple-300 border-purple-800/20",
};

export function SubscriberTable({
  agencies,
  total,
  page,
  limit,
  onPageChange,
  onFilterChange,
  loading = false,
}: SubscriberTableProps) {
  const [searchValue, setSearchValue] = useState("");

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);
  const totalPages = Math.ceil(total / limit);

  function handleSearchSubmit() {
    onFilterChange({ search: searchValue || undefined });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subscribers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            onValueChange={(value) =>
              onFilterChange({ plan: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="solo">Solo</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
              <SelectItem value="agency_pro">Agency Pro</SelectItem>
              <SelectItem value="agency_unlimited">Unlimited</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) =>
              onFilterChange({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agencies..."
              className="pl-9"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchSubmit();
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Clients</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : agencies.map((agency) => (
                    <TableRow
                      key={agency.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        /* parent handles navigation */
                      }}
                    >
                      <TableCell className="font-medium">
                        {agency.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {agency.owner_email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            PLAN_COLORS[agency.plan] ?? ""
                          )}
                        >
                          {agency.plan.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            STATUS_COLORS[agency.subscription_status] ??
                              "bg-gray-500/10 text-gray-500 border-gray-500/20"
                          )}
                        >
                          {agency.subscription_status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {agency.credits_balance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {agency.client_count ?? "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {agency.last_active_at
                          ? formatRelativeTime(agency.last_active_at)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatRelativeTime(agency.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex}-{endIndex} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
