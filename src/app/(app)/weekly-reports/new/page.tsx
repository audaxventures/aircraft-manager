import { PageHeader } from "@/components/shared/page-header";
import { WeeklyReportEditor } from "@/components/weekly-reports/weekly-report-editor";
import { getWeekOverviewStats, buildOverviewDraft, getMaintenanceCandidates, getPreviousWeeklyReport } from "@/lib/weekly-reports";
import { getPrimaryAircraft } from "@/lib/aircraft";
import type { MaintenanceItem } from "@/lib/weekly-reports";

export default async function NewWeeklyReportPage() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [aircraft, stats, maintenanceCandidates, previous] = await Promise.all([
    getPrimaryAircraft(),
    getWeekOverviewStats(today),
    getMaintenanceCandidates(today),
    getPreviousWeeklyReport(today),
  ]);

  const carriedMaintenance = previous?.maintenanceItems ?? [];
  const existingKeys = new Set(carriedMaintenance.map((m) => `${m.description}|${m.due}`));
  const maintenanceItems: MaintenanceItem[] = [
    ...carriedMaintenance,
    ...maintenanceCandidates.filter((m) => !existingKeys.has(`${m.description}|${m.due}`)),
  ];

  return (
    <div>
      <PageHeader title="New weekly report" description="Auto-filled from current data — edit anything before saving." />
      <WeeklyReportEditor
        aircraftHeader={{
          tailNumber: aircraft?.tailNumber ?? "",
          type: aircraft?.type ?? "",
          serialNumber: aircraft?.serialNumber ?? "",
        }}
        initial={{
          reportDate: todayStr,
          ownerOperator: aircraft?.ownerOperator ?? "",
          programManager: aircraft?.programManager ?? "",
          weekOverview: buildOverviewDraft(stats, aircraft?.tailNumber ?? ""),
          accomplishments: [],
          newIssues: previous?.newIssues ?? [],
          toBeCompleted: previous?.toBeCompleted ?? [],
          customerDecisions: previous?.customerDecisions ?? [],
          maintenanceItems,
        }}
      />
    </div>
  );
}
