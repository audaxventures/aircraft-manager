import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_CLASSES = {
  blue: "bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-950/40 dark:to-blue-900/10",
  indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-indigo-900/10",
  violet: "bg-gradient-to-br from-violet-50 to-violet-100/60 dark:from-violet-950/40 dark:to-violet-900/10",
  amber: "bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/10",
  teal: "bg-gradient-to-br from-teal-50 to-teal-100/60 dark:from-teal-950/40 dark:to-teal-900/10",
  emerald: "bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/10",
} as const;

const ICON_CLASSES = {
  blue: "bg-blue-500 shadow-blue-500/30",
  indigo: "bg-indigo-500 shadow-indigo-500/30",
  violet: "bg-violet-500 shadow-violet-500/30",
  amber: "bg-amber-500 shadow-amber-500/30",
  teal: "bg-teal-500 shadow-teal-500/30",
  emerald: "bg-emerald-500 shadow-emerald-500/30",
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
  orientation?: "vertical" | "horizontal";
}

function KpiCard({ label, value, sublabel, trend, accent, icon: Icon, className, orientation = "vertical" }: KpiCardProps) {
  const iconEl = Icon && (
    <div
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg",
        orientation === "vertical" && "mb-3",
        accent ? cn(ICON_CLASSES[accent], "text-white") : "bg-muted text-muted-foreground shadow-none"
      )}
    >
      <Icon className="size-5" />
    </div>
  );

  const textEl = (
    <div className="min-w-0">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "font-semibold tracking-tight text-foreground tabular-nums",
          orientation === "horizontal" ? "mt-1 text-xl" : "mt-1.5 text-2xl"
        )}
      >
        {value}
      </div>
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

  if (orientation === "horizontal") {
    return (
      <div
        className={cn(
          accent ? cn("rounded-xl p-4 shadow-sm", ACCENT_CLASSES[accent]) : "rounded-lg border bg-card p-4",
          "flex items-center gap-3",
          className
        )}
      >
        {iconEl}
        {textEl}
      </div>
    );
  }

  return (
    <div
      className={cn(accent ? cn("rounded-xl p-5 shadow-sm", ACCENT_CLASSES[accent]) : "rounded-lg border bg-card p-4", className)}
    >
      {iconEl}
      {textEl}
    </div>
  );
}

export { KpiCard };
