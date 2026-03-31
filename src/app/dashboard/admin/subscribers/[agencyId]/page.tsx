"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { KpiCard } from "@/components/admin/kpi-card";
import { CreditAdjustmentDialog } from "@/components/admin/credit-adjustment-dialog";
import { PlanChangeDialog } from "@/components/admin/plan-change-dialog";
import { RevenueEventFeed } from "@/components/admin/revenue-event-feed";
import { AdminNoteForm } from "@/components/admin/admin-note-form";
import {
  ArrowLeft,
  CreditCard,
  Users,
  FileText,
  Activity,
  MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  last_active_at: string | null;
  created_at: string;
}

interface CreditTransaction {
  id: string;
  amount: number;
  reason: string;
  balance_after: number;
  description: string | null;
  created_at: string;
}

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

interface AdminNote {
  id: string;
  text: string;
  created_by_email?: string;
  created_at: string;
}

interface AgencyDetail {
  agency: {
    id: string;
    name: string;
    slug: string;
    owner_email: string;
    plan: string;
    subscription_status: string;
    credits_balance: number;
    trial_ends_at: string | null;
    created_at: string;
  };
  users: User[];
  clients: Array<{ id: string; name: string; slug: string; is_active: boolean; created_at: string }>;
  creditTransactions: CreditTransaction[];
  subscriptionEvents: RevenueEvent[];
  adminNotes: AdminNote[];
  stats: {
    totalAudits: number;
    totalThreads: number;
    totalResponses: number;
  };
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  past_due: "destructive",
  canceled: "destructive",
  none: "outline",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SubscriberDetailPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = use(params);
  const [data, setData] = useState<AgencyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/subscribers/${agencyId}`);
      if (!res.ok) throw new Error("Failed to load subscriber details");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/admin/subscribers"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to subscribers
        </Link>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/admin/subscribers"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to subscribers
        </Link>
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const { agency, users, clients, creditTransactions, subscriptionEvents, adminNotes, stats } = data;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/admin/subscribers"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to subscribers
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{agency.name}</h1>
          <p className="text-sm text-muted-foreground">{agency.owner_email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{agency.plan}</Badge>
          <Badge variant={statusVariantMap[agency.subscription_status] ?? "outline"}>
            {agency.subscription_status}
          </Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Credits Balance"
          value={agency.credits_balance.toLocaleString()}
          icon={CreditCard}
          loading={false}
        />
        <KpiCard
          title="Clients"
          value={clients.length}
          icon={FileText}
          loading={false}
        />
        <KpiCard
          title="Users"
          value={users.length}
          icon={Users}
          loading={false}
        />
        <KpiCard
          title="Total Audits"
          value={stats.totalAudits}
          icon={Activity}
          loading={false}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <CreditAdjustmentDialog
          agencyId={agencyId}
          agencyName={agency.name}
          currentBalance={agency.credits_balance}
          onSuccess={fetchData}
        />
        <PlanChangeDialog
          agencyId={agencyId}
          agencyName={agency.name}
          currentPlan={agency.plan}
          onSuccess={fetchData}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="credits" className="gap-1.5">
            <CreditCard className="h-4 w-4" /> Credits
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5">
            <Activity className="h-4 w-4" /> Events
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5">
            <MessageSquare className="h-4 w-4" /> Notes
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name ?? "---"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.last_active_at
                          ? formatDate(user.last_active_at)
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Recent Credit Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell
                        className={
                          tx.amount > 0
                            ? "font-medium text-emerald-500"
                            : "font-medium text-red-400"
                        }
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.reason}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.description ?? "---"}
                      </TableCell>
                      <TableCell>{tx.balance_after.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(tx.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {creditTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No credit transactions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Events</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RevenueEventFeed events={subscriptionEvents} loading={false} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {adminNotes.length === 0 && (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              )}
              {adminNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <p className="text-sm">{note.text}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{note.created_by_email ?? "Admin"}</span>
                    <span>&middot;</span>
                    <span>{formatDateTime(note.created_at)}</span>
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4">
                <AdminNoteForm
                  agencyId={agencyId}
                  onNoteAdded={fetchData}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
