"use client";

import Image from "next/image";
import { AlertTriangle, CheckCircle2, EyeOff, Eye, Clock, Moon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate, formatHours } from "@/lib/format";
import { useHiddenPilots } from "@/hooks/use-hidden-pilots";
import type { PilotDutyStatus } from "@/lib/duty";

const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-pink-500", "bg-teal-500"];

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

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
  const { hidden, hide, unhide } = useHiddenPilots();

  if (statuses.length === 0) return null;

  const visible = statuses.filter((s) => !hidden.has(s.pilotId));
  const hiddenHere = statuses.filter((s) => hidden.has(s.pilotId));

  const sorted = [...visible].sort((a, b) => {
    const aFlag = a.restViolation || a.activeFdtViolations > 0;
    const bFlag = b.restViolation || b.activeFdtViolations > 0;
    if (aFlag !== bFlag) return aFlag ? -1 : 1;
    return a.pilotName.localeCompare(b.pilotName);
  });

  return (
    <div className="mb-6">
      {hiddenHere.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>Hidden:</span>
          {hiddenHere.map((s) => (
            <button
              key={s.pilotId}
              type="button"
              onClick={() => unhide(s.pilotId)}
              className="inline-flex items-center gap-1 rounded-full border bg-secondary/50 px-2 py-0.5 hover:bg-secondary hover:text-foreground"
            >
              {s.pilotName}
              <Eye className="size-3" />
            </button>
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((s, i) => {
            const flagged = s.restViolation || s.activeFdtViolations > 0;
            const accent = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div
                key={s.pilotId}
                className={cn(
                  "rounded-xl p-4 shadow-sm",
                  flagged ? "border border-destructive/30 bg-destructive/5" : "border bg-card"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="relative flex size-14 shrink-0 items-center justify-center">
                    <Image src="/images/wings-icon.png" alt="" width={72} height={26} className="absolute opacity-80" />
                    <div
                      className={cn(
                        "relative z-10 flex size-10 items-center justify-center rounded-full text-sm font-bold text-white shadow",
                        accent
                      )}
                    >
                      {initialsFor(s.pilotName)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full",
                        flagged ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      )}
                    >
                      {flagged ? <AlertTriangle className="size-4" /> : <CheckCircle2 className="size-4" />}
                    </div>
                    <button
                      type="button"
                      onClick={() => hide(s.pilotId)}
                      title="Hide this pilot's card"
                      className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <EyeOff className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-base font-bold text-foreground">{s.pilotName}</div>
                <div className={cn("mt-1.5 mb-3 h-1 w-10 rounded-full", accent)} />

                <dl className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" />
                      30-day flight time
                    </dt>
                    <dd
                      className={cn(
                        "tabular-nums font-medium",
                        s.rolling30DayHours > flightHours30DayLimit ? "text-destructive" : "text-success"
                      )}
                    >
                      {formatHours(s.rolling30DayHours)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" />
                      90-day flight time
                    </dt>
                    <dd
                      className={cn(
                        "tabular-nums font-medium",
                        s.rolling90DayHours > flightHours90DayLimit ? "text-destructive" : "text-success"
                      )}
                    >
                      {formatHours(s.rolling90DayHours)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" />
                      12-month flight time
                    </dt>
                    <dd
                      className={cn(
                        "tabular-nums font-medium",
                        s.rolling12MonthHours > flightHours12MonthLimit ? "text-destructive" : "text-success"
                      )}
                    >
                      {formatHours(s.rolling12MonthHours)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <AlertTriangle className="size-3.5" />
                      FDT violations
                    </dt>
                    <dd className={cn("tabular-nums", s.activeFdtViolations > 0 && "font-medium text-destructive")}>
                      {s.activeFdtViolations}
                    </dd>
                  </div>

                  <div className="my-2 border-t" />

                  <div className="flex items-center justify-between gap-2">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Moon className="size-3.5" />
                      Last 36h+ rest
                    </dt>
                    <dd className="tabular-nums">{s.lastQualifyingRestDate ? formatDate(s.lastQualifyingRestDate) : "None on record"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Moon className="size-3.5" />
                      {s.currentlyResting ? "Rest status" : s.nextRestDueBy ? (s.restViolation ? "Rest overdue since" : "Next rest due by") : "Rest status"}
                    </dt>
                    <dd
                      className={cn(
                        "tabular-nums",
                        s.restViolation && "font-medium text-destructive",
                        !s.restViolation && !s.currentlyResting && !s.nextRestDueBy && "font-medium text-warning-foreground"
                      )}
                    >
                      {s.currentlyResting
                        ? "Currently resting"
                        : s.nextRestDueBy
                          ? formatDate(s.nextRestDueBy)
                          : "No 36h+ rest on record"}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { DutyStatusCards };
