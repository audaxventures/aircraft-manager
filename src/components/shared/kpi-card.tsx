import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_CLASSES = {
  blue: "bg-blue-50 dark:bg-blue-950/30",
  indigo: "bg-indigo-50 dark:bg-indigo-950/30",
  violet: "bg-violet-50 dark:bg-violet-950/30",
  amber: "bg-amber-50 dark:bg-amber-950/30",
  teal: "bg-teal-50 dark:bg-teal-950/30",
  emerald: "bg-emerald-50 dark:bg-emerald-950/30",
} as const;

const ICON_CLASSES = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300",
} as const;

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "flat";
    label: string;
    tone?: "positive" | "negative" | "neutral";
  };
  accent?: keyof typeof ACCENT_CLASSES;
  icon?: LucideIcon;
  className?: string;
}

function KpiCard({ label, value, sublabel, trend, accent, icon: Icon, className }: KpiCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", accent ? ACCENT_CLASSES[accent] : "bg-card", className)}>
      {Icon && (
        <div
          className={cn(
            "mb-3 flex size-10 items-center justify-center rounded-full",
            accent ? ICON_CLASSES[accent] : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-5" />
        </div>
      )}
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
      {trend && (
        <div
          className={cn(
            "mt-1 text-xs font-medium",
            trend.tone === "positive" && "text-success",
            trend.tone === "negative" && "text-destructive",
            (!trend.tone || trend.tone === "neutral") && "text-muted-foreground"
          )}
        >
          {trend.label}
        </div>
      )}
    </div>
  );
}

export { KpiCard };
