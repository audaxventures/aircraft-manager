import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { WeeklyReportsList } from "@/components/weekly-reports/weekly-reports-list";
import { getWeeklyReports } from "@/lib/weekly-reports";

export default async function WeeklyReportsPage() {
  const reports = await getWeeklyReports();

  return (
    <div>
      <PageHeader
        title="Weekly Reports"
        description="Client status reports — saved, editable, and exportable as PDF."
        icon={ClipboardList}
        action={
          <Button asChild className="rounded-full">
            <Link href="/weekly-reports/new">
              <Plus /> New report
            </Link>
          </Button>
        }
      />
      <WeeklyReportsList reports={reports} />
    </div>
  );
}
