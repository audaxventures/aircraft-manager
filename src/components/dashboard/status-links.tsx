"use client";

import Link from "next/link";
import { ShieldCheck, AlertTriangle, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useHiddenPilots } from "@/hooks/use-hidden-pilots";
import { daysUntil, type PilotCurrency } from "@/lib/currency-shared";
import type { PilotDutyStatus } from "@/lib/duty";

interface DashboardStatusLinksProps {
  dutyStatuses: PilotDutyStatus[];
  currencies: PilotCurrency[];
}

// Hidden pilots (Currency/Duty Days "eye off") are a client-only preference
// (localStorage, see useHiddenPilots), so these flag counts can only be
// filtered client-side -- the server passes every pilot's status/currency
// and this component excludes whichever ones the user has hidden.
function DashboardStatusLinks({ dutyStatuses, currencies }: DashboardStatusLinksProps) {
  const { hidden } = useHiddenPilots();

  const dutyFlags = dutyStatuses
    .filter((s) => !hidden.has(s.pilotId))
    .filter((s) => s.restViolation || s.activeFdtViolations > 0);

  const currencyFlags = currencies
    .filter((c) => !hidden.has(c.pilotId))
    .filter((c) => {
      const dayExpiringSoon = c.day.lapseDate && daysUntil(c.day.lapseDate) <= 30;
      const nightExpiringSoon = c.night.lapseDate && daysUntil(c.night.lapseDate) <= 30;
      return !c.day.current || !c.night.current || dayExpiringSoon || nightExpiringSoon;
    });

  return (
    <div className="mb-6 grid gap-3 lg:grid-cols-2">
      <StatusCard
        href="/duty-days"
        title="Duty day compliance"
        description={
          dutyFlags.length > 0 ? `${dutyFlags.length} pilot${dutyFlags.length === 1 ? "" : "s"} flagged` : "All clear! No active violations"
        }
        ok={dutyFlags.length === 0}
      />
      <StatusCard
        href="/currency"
        title="Pilot currency"
        description={
          currencyFlags.length > 0
            ? `${currencyFlags.length} pilot${currencyFlags.length === 1 ? "" : "s"} expiring or expired`
            : "All pilots current"
        }
        ok={currencyFlags.length === 0}
      />
    </div>
  );
}

function StatusCard({ href, title, description, ok }: { href: string; title: string; description: string; ok: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between rounded-lg border p-4 transition-colors",
        ok
          ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "border-amber-200 bg-amber-50 hover:border-amber-300 dark:border-amber-900/50 dark:bg-amber-950/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            ok
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300"
              : "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300"
          )}
        >
          {ok ? <ShieldCheck className="size-5" /> : <AlertTriangle className="size-5" />}
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
      {ok ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
          <ShieldCheck className="size-4" />
        </div>
      ) : (
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          View details
          <ChevronRight className="size-4" />
        </span>
      )}
    </Link>
  );
}

export { DashboardStatusLinks };
