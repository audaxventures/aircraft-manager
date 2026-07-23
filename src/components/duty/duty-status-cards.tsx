import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate, formatHours } from "@/lib/format";
import type { PilotDutyStatus } from "@/lib/duty";

function DutyStatusCards({
  statuses,
  flightHours30DayLimit,
  flightHours90DayLimit,
  flightHours12MonthLimit,
}: {
  statuses: PilotDutyStatus[];
  flightHours30DayLimit: number;
  flightHours90DayLimit: number;
  flightHours12MonthLimit: number;
}) {
  if (statuses.length === 0) return null;

  const sorted = [...statuses].sort((a, b) => {
    const aFlag = a.restViolation || a.activeFdtViolations > 0;
    const bFlag = b.restViolation || b.activeFdtViolations > 0;
    if (aFlag !== bFlag) return aFlag ? -1 : 1;
    return a.pilotName.localeCompare(b.pilotName);
  });

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((s) => {
        const flagged = s.restViolation || s.activeFdtViolations > 0;
        return (
          <div
            key={s.pilotId}
            className={cn(
              "rounded-lg border p-4",
              flagged ? "border-destructive/40 bg-destructive/5" : "bg-card"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{s.pilotName}</span>
              {flagged ? (
                <AlertTriangle className="size-4 text-destructive" />
              ) : (
                <CheckCircle2 className="size-4 text-success" />
              )}
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">30-day flight time</dt>
                <dd
                  className={cn(
                    "tabular-nums font-medium",
                    s.rolling30DayHours > flightHours30DayLimit ? "text-destructive" : "text-success"
                  )}
                >
                  {formatHours(s.rolling30DayHours)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">90-day flight time</dt>
                <dd
                  className={cn(
                    "tabular-nums font-medium",
                    s.rolling90DayHours > flightHours90DayLimit ? "text-destructive" : "text-success"
                  )}
                >
                  {formatHours(s.rolling90DayHours)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">12-month flight time</dt>
                <dd
                  className={cn(
                    "tabular-nums font-medium",
                    s.rolling12MonthHours > flightHours12MonthLimit ? "text-destructive" : "text-success"
                  )}
                >
                  {formatHours(s.rolling12MonthHours)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">FDT violations</dt>
                <dd className={cn("tabular-nums", s.activeFdtViolations > 0 && "font-medium text-destructive")}>
                  {s.activeFdtViolations}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last 36h+ rest</dt>
                <dd className="tabular-nums">{s.lastQualifyingRestDate ? formatDate(s.lastQualifyingRestDate) : "None on record"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{s.nextRestDueBy ? (s.restViolation ? "Rest overdue since" : "Next rest due by") : "Rest status"}</dt>
                <dd className={cn("tabular-nums", s.restViolation && "font-medium text-destructive")}>
                  {s.nextRestDueBy ? formatDate(s.nextRestDueBy) : "No 36h+ rest on record"}
                </dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}

export { DutyStatusCards };
