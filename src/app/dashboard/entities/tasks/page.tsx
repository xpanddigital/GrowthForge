"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardList } from "lucide-react";
import { useClientContext } from "@/hooks/use-client-context";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskCard } from "@/components/entity/task-card";
import { Badge } from "@/components/ui/badge";

interface TaskData {
  id: string;
  taskType: string;
  description: string;
  instructions: string | null;
  generatedCode: string | null;
  platformDescription: string | null;
  platformCharLimit: number | null;
  platform: string | null;
  priority: string;
  priorityScore: number;
  status: string;
}

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function EntityTasksPage() {
  useEffect(() => { document.title = "Entity Sync — MentionLayer"; }, []);

  const { selectedClientId, selectedClientName } = useClientContext();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const loadData = useCallback(async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/entity/tasks?clientId=${selectedClientId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/entity/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: newStatus as TaskData["status"] } : t
          )
        );
      }
    } catch {
      // handle error
    }
  };

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Entity Tasks</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={ClipboardList}
            title="No client selected"
            description="Select a client to view their entity sync tasks."
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Entity Tasks</h2>
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Apply filters
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (platformFilter !== "all" && (t.platform || "") !== platformFilter) return false;
    return true;
  });

  // Group by priority
  const groupedTasks = filteredTasks.sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)
  );

  const priorityGroups = ["critical", "high", "medium", "low"].filter((p) =>
    groupedTasks.some((t) => t.priority === p)
  );

  // Stats
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  // Unique platforms for filter
  const platforms = Array.from(new Set(tasks.map((t) => t.platform).filter((p): p is string => p !== null))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Entity Tasks</h2>
        <p className="text-sm text-muted-foreground">
          Consistency tasks for {selectedClientName}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-amber-500">{pendingCount}</span> pending
        </span>
        <span className="text-border">|</span>
        <span>
          <span className="font-medium text-blue-500">{inProgressCount}</span> in progress
        </span>
        <span className="text-border">|</span>
        <span>
          <span className="font-medium text-emerald-500">{completedCount}</span> completed
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
        </select>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Platforms</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <EmptyState
            icon={ClipboardList}
            title="No tasks found"
            description={
              statusFilter !== "all" || platformFilter !== "all"
                ? "Try adjusting your filters to see more tasks."
                : "Run an entity scan to generate consistency tasks."
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {priorityGroups.map((priority) => {
            const priorityTasks = groupedTasks.filter((t) => t.priority === priority);
            if (priorityTasks.length === 0) return null;

            return (
              <div key={priority} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      priority === "critical"
                        ? "border-red-500/30 text-red-500"
                        : priority === "high"
                          ? "border-amber-500/30 text-amber-500"
                          : priority === "medium"
                            ? "border-blue-500/30 text-blue-500"
                            : "border-muted-foreground/30 text-muted-foreground"
                    }
                  >
                    {priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {priorityTasks.length} task{priorityTasks.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  {priorityTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
