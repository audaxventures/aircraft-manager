import { AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CurrencyStatusCards } from "@/components/currency/currency-status-cards";
import { CurrencyView } from "@/components/currency/currency-view";
import { getAllPilotsCurrency, getCurrencyThresholds } from "@/lib/currency";

export default async function CurrencyPage() {
  const thresholds = await getCurrencyThresholds();
  const currencies = await getAllPilotsCurrency(thresholds);

  return (
    <div>
      <PageHeader title="Currency" description="Pilot day and night takeoff/landing recency (CAR 401.05(2))." />

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Currently configured as {thresholds.takeoffsRequired} takeoffs and {thresholds.landingsRequired} landings within{" "}
          {thresholds.periodMonths} months (editable in Settings). Recency rules can change or vary by aircraft
          category and class — verify against the current CARs before relying on this for compliance decisions.
        </p>
      </div>

      <CurrencyStatusCards currencies={currencies} />
      <CurrencyView currencies={currencies} />
    </div>
  );
}
