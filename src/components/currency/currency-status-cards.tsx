"use client";

import { AlertTriangle, CheckCircle2, Clock, EyeOff, Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { useHiddenPilots } from "@/hooks/use-hidden-pilots";
import { daysUntil, type PilotCurrency } from "@/lib/currency-shared";

const EXPIRING_SOON_DAYS = 30;

function statusFor(current: boolean, lapseDate: Date | null) {
  if (!lapseDate) return { label: "Not current", tone: "expired" as const };
  if (!current) return { label: "Expired", tone: "expired" as const };
  const days = daysUntil(lapseDate);
  if (days <= EXPIRING_SOON_DAYS) return { label: `Expires in ${days}d`, tone: "warning" as const };
  return { label: "Current", tone: "ok" as const };
}

function urgencyRank(currency: PilotCurrency): number {
  const dayDays = currency.day.lapseDate ? daysUntil(currency.day.lapseDate) : -9999;
  const nightDays = currency.night.lapseDate ? daysUntil(currency.night.lapseDate) : -9999;
  const iaDays = currency.instrumentApproaches.lapseDate ? daysUntil(currency.instrumentApproaches.lapseDate) : -9999;
  return Math.min(dayDays, nightDays, iaDays);
}

function CurrencyStatusCards({ currencies }: { currencies: PilotCurrency[] }) {
  const { hidden, hide, unhide } = useHiddenPilots();

  if (currencies.length === 0) return null;

  const visible = currencies.filter((c) => !hidden.has(c.pilotId));
  const hiddenHere = currencies.filter((c) => hidden.has(c.pilotId));

  const sorted = [...visible].sort((a, b) => urgencyRank(a) - urgencyRank(b));

  return (
    <div className="mb-6">
      {hiddenHere.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>Hidden:</span>
          {hiddenHere.map((c) => (
            <button
              key={c.pilotId}
              type="button"
              onClick={() => unhide(c.pilotId)}
              className="inline-flex items-center gap-1 rounded-full border bg-secondary/50 px-2 py-0.5 hover:bg-secondary hover:text-foreground"
            >
              {c.pilotName}
              <Eye className="size-3" />
            </button>
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((c) => {
            const day = statusFor(c.day.current, c.day.lapseDate);
            const night = statusFor(c.night.current, c.night.lapseDate);
            const instrumentApproaches = statusFor(c.instrumentApproaches.current, c.instrumentApproaches.lapseDate);
            const flagged = day.tone !== "ok" || night.tone !== "ok" || instrumentApproaches.tone !== "ok";

            return (
              <div key={c.pilotId} className={cn("rounded-lg border p-4", flagged ? "border-warning/40 bg-warning/5" : "bg-card")}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{c.pilotName}</span>
                  <div className="flex items-center gap-2">
                    {flagged ? (
                      <AlertTriangle className="size-4 text-warning-foreground" />
                    ) : (
                      <CheckCircle2 className="size-4 text-success" />
                    )}
                    <button
                      type="button"
                      onClick={() => hide(c.pilotId)}
                      title="Hide this pilot's card"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <EyeOff className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <CurrencyRow label="Day" status={day} lapseDate={c.day.lapseDate} />
                  <CurrencyRow label="Night" status={night} lapseDate={c.night.lapseDate} />
                  <CurrencyRow label="Instrument approaches" status={instrumentApproaches} lapseDate={c.instrumentApproaches.lapseDate} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CurrencyRow({
  label,
  status,
  lapseDate,
}: {
  label: string;
  status: { label: string; tone: "ok" | "warning" | "expired" };
  lapseDate: Date | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5">
        {status.tone === "warning" && <Clock className="size-3.5 text-warning-foreground" />}
        <span
          className={cn(
            "font-medium",
            status.tone === "ok" && "text-success",
            status.tone === "warning" && "text-warning-foreground",
            status.tone === "expired" && "text-destructive"
          )}
        >
          {status.label}
        </span>
        {lapseDate && status.tone !== "expired" && (
          <span className="text-xs text-muted-foreground">({formatDate(lapseDate)})</span>
        )}
      </span>
    </div>
  );
}

export { CurrencyStatusCards };
