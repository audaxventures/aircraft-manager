"use client";

import Image from "next/image";
import { AlertTriangle, CheckCircle2, Clock, EyeOff, Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { useHiddenPilots } from "@/hooks/use-hidden-pilots";
import { daysUntil, type PilotCurrency } from "@/lib/currency-shared";

const EXPIRING_SOON_DAYS = 30;

const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-pink-500", "bg-teal-500"];

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

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
          {sorted.map((c, i) => {
            const day = statusFor(c.day.current, c.day.lapseDate);
            const night = statusFor(c.night.current, c.night.lapseDate);
            const instrumentApproaches = statusFor(c.instrumentApproaches.current, c.instrumentApproaches.lapseDate);
            const flagged = day.tone !== "ok" || night.tone !== "ok" || instrumentApproaches.tone !== "ok";
            const accent = AVATAR_COLORS[i % AVATAR_COLORS.length];

            return (
              <div
                key={c.pilotId}
                className={cn("rounded-xl p-4 shadow-sm", flagged ? "border border-warning/40 bg-warning/5" : "border bg-card")}
              >
                <div className="flex items-start justify-between">
                  <div className="relative flex size-14 shrink-0 items-center justify-center">
                    <Image src="/images/wings-icon.png" alt="" width={92} height={33} className="absolute opacity-80" />
                    <div
                      className={cn(
                        "relative z-10 flex size-10 items-center justify-center rounded-full text-sm font-bold text-white shadow",
                        accent
                      )}
                    >
                      {initialsFor(c.pilotName)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full",
                        flagged ? "bg-warning/15 text-warning-foreground" : "bg-success/10 text-success"
                      )}
                    >
                      {flagged ? <AlertTriangle className="size-4" /> : <CheckCircle2 className="size-4" />}
                    </div>
                    <button
                      type="button"
                      onClick={() => hide(c.pilotId)}
                      title="Hide this pilot's card"
                      className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <EyeOff className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-base font-bold text-foreground">{c.pilotName}</div>
                <div className={cn("mt-1.5 mb-3 h-1 w-10 rounded-full", accent)} />

                <div className="space-y-2 text-sm">
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
