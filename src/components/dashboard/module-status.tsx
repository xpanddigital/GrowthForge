"use client";

import {
  MessageSquareQuote,
  Shield,
  Newspaper,
  Eye,
  Building2,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Module {
  name: string;
  status: "active" | "soon";
  description: string;
  icon: LucideIcon;
}

const modules: Module[] = [
  {
    name: "Citation Engine",
    status: "active",
    description: "Ready",
    icon: MessageSquareQuote,
  },
  {
    name: "AI Visibility Audit",
    status: "active",
    description: "Ready",
    icon: Shield,
  },
  {
    name: "PressForge",
    status: "soon",
    description: "Coming soon",
    icon: Newspaper,
  },
  {
    name: "AI Monitor",
    status: "soon",
    description: "Coming soon",
    icon: Eye,
  },
  {
    name: "Entity Sync",
    status: "soon",
    description: "Coming soon",
    icon: Building2,
  },
  {
    name: "Review Engine",
    status: "soon",
    description: "Coming soon",
    icon: Star,
  },
];

export function ModuleStatus() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-semibold">Modules</h3>
      </div>
      <div className="divide-y divide-border/50">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.name}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mod.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    mod.status === "active"
                      ? "bg-emerald-500"
                      : "bg-muted-foreground/30"
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {mod.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
