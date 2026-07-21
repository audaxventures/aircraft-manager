import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { WeeklyReportEditor } from "@/components/weekly-reports/weekly-report-editor";
import { getWeeklyReport } from "@/lib/weekly-reports";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { formatDate } from "@/lib/format";

interface WeeklyReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function WeeklyReportPage({ params }: WeeklyReportPageProps) {
  const { id } = await params;
  const [report, aircraft] = await Promise.all([getWeeklyReport(id), getPrimaryAircraft()]);
  if (!report) notFound();

  return (
    <div>
      <PageHeader title="Weekly report" description={formatDate(report.reportDate)} />
      <WeeklyReportEditor
        reportId={report.id}
        aircraftHeader={{
          tailNumber: aircraft?.tailNumber ?? "",
          type: aircraft?.type ?? "",
          serialNumber: aircraft?.serialNumber ?? "",
        }}
        initial={{
          reportDate: report.reportDate.toISOString().slice(0, 10),
          ownerOperator: report.ownerOperator ?? "",
          programManager: report.programManager ?? "",
          weekOverview: report.weekOverview,
          accomplishments: report.accomplishments,
          newIssues: report.newIssues,
          toBeCompleted: report.toBeCompleted,
          customerDecisions: report.customerDecisions,
          maintenanceItems: report.maintenanceItems,
        }}
      />
    </div>
  );
}
