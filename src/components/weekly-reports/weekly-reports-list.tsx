"use client";

import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { ClipboardList, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import type { WeeklyReportListItem } from "@/lib/weekly-reports";

interface WeeklyReportsListProps {
  reports: WeeklyReportListItem[];
}

function WeeklyReportsList({ reports }: WeeklyReportsListProps) {
  const router = useRouter();

  const columns: ColumnDef<WeeklyReportListItem>[] = [
    { accessorKey: "reportDate", header: "Report date", cell: ({ row }) => formatDate(row.original.reportDate), sortingFn: "datetime" },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button size="sm" onClick={() => router.push("/weekly-reports/new")}>
          <Plus /> New report
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        onRowClick={(r) => router.push(`/weekly-reports/${r.id}`)}
        initialSorting={[{ id: "reportDate", desc: true }]}
        emptyState={
          <EmptyState
            icon={<ClipboardList className="size-8" />}
            title="No weekly reports yet"
            description="Create your first weekly status report — hours, cycles, and upcoming trips pull in automatically."
            action={
              <Button size="sm" onClick={() => router.push("/weekly-reports/new")}>
                <Plus /> New report
              </Button>
            }
          />
        }
      />
    </div>
  );
}

export { WeeklyReportsList };
