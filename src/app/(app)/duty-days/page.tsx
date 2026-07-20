import { AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DutyStatusCards } from "@/components/duty/duty-status-cards";
import { DutyLogView } from "@/components/duty/duty-log-view";
import { getAllPilotsDutyStatus, getDutyDayLogs, getRegulatoryThresholds } from "@/lib/duty";
import { getPilots } from "@/lib/settings";

export default async function DutyDaysPage() {
  const [statuses, logs, pilots, thresholds] = await Promise.all([
    getAllPilotsDutyStatus(),
    getDutyDayLogs(),
    getPilots(),
    getRegulatoryThresholds(),
  ]);

  return (
    <div>
      <PageHeader title="Duty Days" description="CARS 604 flight duty time compliance." />

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Thresholds shown here are configurable in Settings and reflect CARS Subpart 604 as commonly applied.
          Verify against the current regulatory text before relying on this for compliance decisions.
        </p>
      </div>

      <DutyStatusCards statuses={statuses} rolling30DayLimit={thresholds.rolling30DayFlightHoursLimit} />
      <DutyLogView logs={logs} pilots={pilots} />
    </div>
  );
}
