"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Shield,
  ShieldCheck,
  Crown,
  Eye,
  UserPlus,
  Mail,
  MoreHorizontal,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import type { User, Agency } from "@/types/database";

interface TeamMember extends User {
  agency?: Agency;
}

const roleConfig: Record<
  string,
  { label: string; icon: typeof Crown; color: string; description: string }
> = {
  platform_admin: {
    label: "Platform Admin",
    icon: Crown,
    color: "text-amber-400 bg-amber-400/10",
    description: "Full platform access",
  },
  agency_owner: {
    label: "Owner",
    icon: ShieldCheck,
    color: "text-purple-400 bg-purple-400/10",
    description: "Full agency access + billing",
  },
  agency_admin: {
    label: "Admin",
    icon: Shield,
    color: "text-blue-400 bg-blue-400/10",
    description: "Full agency access",
  },
  member: {
    label: "Member",
    icon: Users,
    color: "text-emerald-400 bg-emerald-400/10",
    description: "Manage clients & campaigns",
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "text-muted-foreground bg-muted",
    description: "Read-only access",
  },
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function TeamPage() {
  useEffect(() => { document.title = "Team — MentionLayer"; }, []);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [agency, setAgency] = useState<Agency | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTeam() {
      // Get current user's agency
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!userData) return;

      // Fetch agency
      const { data: agencyData } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", userData.agency_id)
        .single();

      if (agencyData) setAgency(agencyData);

      // Fetch all team members for this agency
      const { data: teamData } = await supabase
        .from("users")
        .select("*")
        .eq("agency_id", userData.agency_id)
        .order("created_at", { ascending: true });

      if (teamData) setMembers(teamData);
      setLoading(false);
    }
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState(false);

  async function handleInvite() {
    if (!inviteEmail.trim() || !agency) return;
    setInviting(true);
    setInviteMessage("");
    setInviteError(false);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });

      const result = await res.json();

      if (!res.ok) {
        setInviteMessage(result.error || "Failed to send invite");
        setInviteError(true);
        setInviting(false);
        return;
      }

      setInviteMessage(
        result.data?.status === "added"
          ? `${inviteEmail} has been added to your team.`
          : `Invitation sent to ${inviteEmail}.`
      );
      setInviteError(false);
      setInviteEmail("");
      setInviteRole("member");
      setInviting(false);

      // Refresh team members list
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("agency_id")
          .eq("id", user.id)
          .single();
        if (userData) {
          const { data: teamData } = await supabase
            .from("users")
            .select("*")
            .eq("agency_id", userData.agency_id)
            .order("created_at", { ascending: true });
          if (teamData) setMembers(teamData);
        }
      }

      setTimeout(() => {
        setShowInvite(false);
        setInviteMessage("");
      }, 3000);
    } catch {
      setInviteMessage("Something went wrong. Please try again.");
      setInviteError(true);
      setInviting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-0"
            >
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Team</h2>
          <p className="text-sm text-muted-foreground">
            {agency?.name ? `Manage ${agency.name} team members.` : "Manage team members and access levels."}
            {" "}{members.length} member{members.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Button
          onClick={() => setShowInvite(!showInvite)}
          className="bg-primary hover:bg-primary/90"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <h3 className="mb-3 text-sm font-medium">Invite a team member</h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Email address
              </label>
              <Input
                type="email"
                placeholder="colleague@agency.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="w-44">
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Role
              </label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agency_admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {inviting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {inviting ? "Sending..." : "Send Invite"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowInvite(false);
                setInviteEmail("");
              }}
            >
              Cancel
            </Button>
          </div>
          {inviteMessage && (
            <p className={`mt-2 text-xs ${inviteError ? "text-destructive" : "text-emerald-400"}`}>
              {inviteMessage}
            </p>
          )}
          {!inviteMessage && (
            <p className="mt-2 text-xs text-muted-foreground">
              They&apos;ll receive an email with a link to join your agency workspace.
            </p>
          )}
        </div>
      )}

      {/* Team members table */}
      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members"
          description="Invite your first team member to get started."
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const config = roleConfig[member.role] || roleConfig.member;
                const RoleIcon = config.icon;
                const initials = member.full_name
                  ? member.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : member.email.slice(0, 2).toUpperCase();

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.avatar_url}
                            alt=""
                            className="h-9 w-9 rounded-full"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {member.full_name || "Unnamed"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`gap-1 ${config.color}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo(member.last_active_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Role descriptions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold">Role Permissions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(roleConfig)
            .filter(([key]) => key !== "platform_admin")
            .map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div
                  key={key}
                  className="rounded-md border border-border bg-background p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className={`rounded-md p-1.5 ${config.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
