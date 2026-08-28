import * as React from "react";
import { cn } from "@/lib/utils";

const ACCENT_CLASSES = {
  blue: "bg-blue-50 dark:bg-blue-950/30",
  indigo: "bg-indigo-50 dark:bg-indigo-950/30",
  violet: "bg-violet-50 dark:bg-violet-950/30",
  amber: "bg-amber-50 dark:bg-amber-950/30",
  teal: "bg-teal-50 dark:bg-teal-950/30",
  emerald: "bg-emerald-50 dark:bg-emerald-950/30",
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
  className?: string;
}

function KpiCard({ label, value, sublabel, trend, accent, className }: KpiCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", accent ? ACCENT_CLASSES[accent] : "bg-card", className)}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</div>
      {(sublabel || trend) && (
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={cn(
                "font-medium",
                trend.tone === "positive" && "text-success",
                trend.tone === "negative" && "text-destructive",
                (!trend.tone || trend.tone === "neutral") && "text-muted-foreground"
              )}
            >
              {trend.label}
            </span>
          )}
          {sublabel && <span className="text-muted-foreground">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}

export { KpiCard };
