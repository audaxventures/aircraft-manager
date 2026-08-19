"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
      <Link
        href="/duty-days"
        className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-foreground/20"
      >
        <div className="flex items-center gap-3">
          {dutyFlags.length > 0 ? (
            <AlertTriangle className="size-5 shrink-0 text-destructive" />
          ) : (
            <Badge variant="success">OK</Badge>
          )}
          <div>
            <div className="text-sm font-medium text-foreground">Duty day compliance</div>
            <div className="text-sm text-muted-foreground">
              {dutyFlags.length > 0
                ? `${dutyFlags.length} pilot${dutyFlags.length === 1 ? "" : "s"} flagged`
                : "No active violations"}
            </div>
          </div>
        </div>
        <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>

      <Link
        href="/currency"
        className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-foreground/20"
      >
        <div className="flex items-center gap-3">
          {currencyFlags.length > 0 ? (
            <AlertTriangle className="size-5 shrink-0 text-warning-foreground" />
          ) : (
            <Badge variant="success">OK</Badge>
          )}
          <div>
            <div className="text-sm font-medium text-foreground">Pilot currency</div>
            <div className="text-sm text-muted-foreground">
              {currencyFlags.length > 0
                ? `${currencyFlags.length} pilot${currencyFlags.length === 1 ? "" : "s"} expiring or expired`
                : "All pilots current"}
            </div>
          </div>
        </div>
        <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    </div>
  );
}

export { DashboardStatusLinks };
