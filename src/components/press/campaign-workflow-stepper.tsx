"use client";

import { cn } from "@/lib/utils";
import { Check, Settings, FileText, Users, Send, Trophy } from "lucide-react";

const STEPS = [
  { key: "setup", label: "Setup", icon: Settings },
  { key: "release", label: "Press Release", icon: FileText },
  { key: "journalists", label: "Journalists", icon: Users },
  { key: "outreach", label: "Outreach", icon: Send },
  { key: "coverage", label: "Coverage", icon: Trophy },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const STATUS_TO_STEP: Record<string, StepKey> = {
  draft: "setup",
  ideation_complete: "setup",
  press_release_draft: "release",
  press_release_approved: "release",
  journalists_found: "journalists",
  outreach_ready: "outreach",
  pitches_ready: "outreach",
  outreach_sent: "outreach",
  monitoring: "coverage",
  completed: "coverage",
  cancelled: "setup",
  archived: "coverage",
};

interface CampaignWorkflowStepperProps {
  currentStatus: string;
  activeTab: string;
  onStepClick: (step: string) => void;
}

export function CampaignWorkflowStepper({
  currentStatus,
  activeTab,
  onStepClick,
}: CampaignWorkflowStepperProps) {
  const currentStep = STATUS_TO_STEP[currentStatus] || "setup";
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = step.key === currentStep;
        const isActive = step.key === activeTab;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            {index > 0 && (
              <div
                className={cn(
                  "h-px w-8 mx-1",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <button
              onClick={() => onStepClick(step.key)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : isCompleted
                  ? "text-primary/70 hover:text-primary"
                  : isCurrent
                  ? "text-foreground hover:bg-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
