import * as React from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "flat";
    label: string;
    tone?: "positive" | "negative" | "neutral";
  };
  className?: string;
}

function KpiCard({ label, value, sublabel, trend, className }: KpiCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
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
