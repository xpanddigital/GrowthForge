import { cn } from "@/lib/utils";
import { Info, Lightbulb, AlertTriangle } from "lucide-react";

interface CalloutBoxProps {
  type?: "tip" | "warning" | "info";
  children: React.ReactNode;
}

const config = {
  tip: {
    icon: Lightbulb,
    bg: "bg-emerald-500/10 border-emerald-500/30",
    iconColor: "text-emerald-500",
    title: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10 border-amber-500/30",
    iconColor: "text-amber-500",
    title: "Warning",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10 border-blue-500/30",
    iconColor: "text-blue-500",
    title: "Note",
  },
};

export function CalloutBox({ type = "info", children }: CalloutBoxProps) {
  const { icon: Icon, bg, iconColor, title } = config[type];

  return (
    <div className={cn("my-6 rounded-lg border p-4", bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColor)} />
        <div>
          <p className={cn("text-sm font-semibold mb-1", iconColor)}>
            {title}
          </p>
          <div className="text-sm text-muted-foreground [&>p]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
