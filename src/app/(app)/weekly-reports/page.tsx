import { PageHeader } from "@/components/shared/page-header";
import { WeeklyReportsList } from "@/components/weekly-reports/weekly-reports-list";
import { getWeeklyReports } from "@/lib/weekly-reports";

export default async function WeeklyReportsPage() {
  const reports = await getWeeklyReports();

  return (
    <div>
      <PageHeader title="Weekly Reports" description="Client status reports — saved, editable, and exportable as PDF." />
      <WeeklyReportsList reports={reports} />
    </div>
  );
}
