"use client";

import { Mail, Eye, MousePointerClick, MessageSquare, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { PressOutreachEmail, Journalist } from "@/types/database";

interface EmailWithJournalist extends PressOutreachEmail {
  journalists: Pick<Journalist, "name" | "email" | "publication">;
}

interface OutreachTrackerProps {
  emails: EmailWithJournalist[];
}

export function OutreachTracker({ emails }: OutreachTrackerProps) {
  const sentEmails = emails.filter((e) => e.status !== "pending");

  if (sentEmails.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-primary/50 mb-3" />
        <h3 className="font-medium mb-1">No outreach sent yet</h3>
        <p className="text-sm text-muted-foreground">
          Send pitches from the Outreach tab to start tracking engagement.
        </p>
      </div>
    );
  }

  const totalSent = sentEmails.length;
  const totalOpened = sentEmails.filter((e) => e.opened_at).length;
  const totalClicked = sentEmails.filter((e) => e.clicked_at).length;
  const totalReplied = sentEmails.filter((e) => e.replied_at).length;
  const totalBounced = sentEmails.filter((e) => e.bounced_at).length;

  const stats = [
    { label: "Sent", value: totalSent, icon: Mail, className: "text-blue-500" },
    { label: "Opened", value: totalOpened, pct: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0, icon: Eye, className: "text-cyan-500" },
    { label: "Clicked", value: totalClicked, pct: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0, icon: MousePointerClick, className: "text-violet-500" },
    { label: "Replied", value: totalReplied, pct: totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0, icon: MessageSquare, className: "text-emerald-500" },
    { label: "Bounced", value: totalBounced, pct: totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0, icon: AlertTriangle, className: "text-red-500" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map(({ label, value, pct, icon: Icon, className }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
            <Icon className={`mx-auto h-4 w-4 mb-1 ${className}`} />
            <p className="text-xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">
              {label}
              {pct !== undefined && ` (${pct}%)`}
            </p>
          </div>
        ))}
      </div>

      {/* Email table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Journalist</TableHead>
              <TableHead>Publication</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Replied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sentEmails.map((email) => (
              <TableRow key={email.id}>
                <TableCell>
                  <p className="font-medium text-sm">{email.journalists.name}</p>
                  <p className="text-xs text-muted-foreground">{email.journalists.email}</p>
                </TableCell>
                <TableCell className="text-sm">{email.journalists.publication}</TableCell>
                <TableCell className="text-sm max-w-48 truncate">{email.subject_line}</TableCell>
                <TableCell><StatusBadge status={email.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {email.sent_at ? new Date(email.sent_at).toLocaleDateString("en-AU") : "-"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {email.opened_at ? new Date(email.opened_at).toLocaleDateString("en-AU") : "-"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {email.replied_at ? new Date(email.replied_at).toLocaleDateString("en-AU") : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
