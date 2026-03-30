import Link from "next/link";
import {
  Radar,
  MessageSquareQuote,
  Network,
  Newspaper,
  Star,
  ClipboardCheck,
} from "lucide-react";

const modules = {
  monitor: {
    label: "AI Monitor",
    href: "/dashboard/monitor",
    icon: Radar,
  },
  citations: {
    label: "Citation Engine",
    href: "/dashboard/citations",
    icon: MessageSquareQuote,
  },
  entities: {
    label: "Entity Sync",
    href: "/dashboard/entities",
    icon: Network,
  },
  press: {
    label: "PressForge",
    href: "/dashboard/press",
    icon: Newspaper,
  },
  reviews: {
    label: "Review Engine",
    href: "/dashboard/reviews",
    icon: Star,
  },
  audits: {
    label: "Audits",
    href: "/dashboard/audits",
    icon: ClipboardCheck,
  },
} as const;

interface ModuleLinkButtonProps {
  module: keyof typeof modules;
  label?: string;
}

export function ModuleLinkButton({ module, label }: ModuleLinkButtonProps) {
  const config = modules[module];
  const Icon = config.icon;

  return (
    <div className="my-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {label || `Try it in ${config.label}`}
          </p>
          <p className="text-xs text-muted-foreground">
            Open {config.label} in MentionLayer
          </p>
        </div>
        <Link
          href={config.href}
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
