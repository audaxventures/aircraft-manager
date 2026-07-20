import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
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
  return Math.min(dayDays, nightDays);
}

function CurrencyStatusCards({ currencies }: { currencies: PilotCurrency[] }) {
  if (currencies.length === 0) return null;

  const sorted = [...currencies].sort((a, b) => urgencyRank(a) - urgencyRank(b));

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((c) => {
        const day = statusFor(c.day.current, c.day.lapseDate);
        const night = statusFor(c.night.current, c.night.lapseDate);
        const flagged = day.tone !== "ok" || night.tone !== "ok";

        return (
          <div key={c.pilotId} className={cn("rounded-lg border p-4", flagged ? "border-warning/40 bg-warning/5" : "bg-card")}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{c.pilotName}</span>
              {flagged ? <AlertTriangle className="size-4 text-warning-foreground" /> : <CheckCircle2 className="size-4 text-success" />}
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <CurrencyRow label="Day" status={day} lapseDate={c.day.lapseDate} />
              <CurrencyRow label="Night" status={night} lapseDate={c.night.lapseDate} />
            </div>
          </div>
        );
      })}
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
    <div className="flex items-center justify-between">
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
