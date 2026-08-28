"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { DutyLogForm, type PilotOption, type DutyLogFormValue } from "@/components/duty/duty-log-form";
import { EXTENSION_LABELS } from "@/components/duty/duty-log-shared";
import { formatDate, formatHours } from "@/lib/format";
import { dateToDecimalHour, formatDecimalHour } from "@/lib/flight-time";
import type { DutyDayLogDto } from "@/lib/duty";

interface DutyLogViewProps {
  logs: DutyDayLogDto[];
  pilots: PilotOption[];
}

function DutyLogView({ logs, pilots }: DutyLogViewProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DutyLogFormValue | null>(null);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(log: DutyDayLogDto) {
    setEditing({
      id: log.id,
      pilotId: log.pilotId,
      dutyType: log.dutyType,
      date: log.date.toISOString().slice(0, 10),
      reportTime: log.reportTime.toISOString().slice(11, 16),
      dutyEndTime: log.dutyEndTime.toISOString().slice(11, 16),
      endsNextDay: log.dutyEndTime.toISOString().slice(0, 10) !== log.date.toISOString().slice(0, 10),
      restPeriodBeforeHours: String(log.restPeriodBeforeHours),
      splitDutyApplied: log.splitDutyApplied,
      splitDutyNote: log.splitDutyNote ?? "",
      unforeseenCircumstancesApplied: log.unforeseenCircumstancesApplied,
      unforeseenCircumstancesNote: log.unforeseenCircumstancesNote ?? "",
      unforeseenSignedByName: log.unforeseenSignedByName ?? "",
      notes: log.notes ?? "",
    });
    setFormOpen(true);
  }

  const columns: ColumnDef<DutyDayLogDto>[] = [
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date), sortingFn: "datetime" },
    { accessorKey: "pilotName", header: "Pilot" },
    {
      accessorKey: "dutyType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.dutyType === "ADMIN" ? "warning" : "outline"}>
          {row.original.dutyType === "ADMIN" ? "Admin" : "Flight"}
        </Badge>
      ),
    },
    { accessorKey: "reportTime", header: "Report (UTC)", cell: ({ row }) => formatDecimalHour(dateToDecimalHour(row.original.reportTime)) },
    { accessorKey: "dutyEndTime", header: "Duty end (UTC)", cell: ({ row }) => formatDecimalHour(dateToDecimalHour(row.original.dutyEndTime)) },
    {
      accessorKey: "flightDutyHours",
      header: () => <div className="w-full text-right">FDT</div>,
      cell: ({ row }) => <div className="text-right tabular-nums">{formatHours(row.original.flightDutyHours)}</div>,
    },
    {
      accessorKey: "effectiveLimitHours",
      header: () => <div className="w-full text-right">Limit</div>,
      cell: ({ row }) => <div className="text-right tabular-nums text-muted-foreground">{formatHours(row.original.effectiveLimitHours)}</div>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.withinLimit ? "success" : "destructive"}>
          {row.original.withinLimit ? "Pass" : "Fail"}
        </Badge>
      ),
    },
    {
      accessorKey: "extensionReason",
      header: "Extension",
      cell: ({ row }) => {
        const label = EXTENSION_LABELS[row.original.extensionReason];
        if (!label) return <span className="text-muted-foreground">—</span>;
        return <Badge variant={row.original.extensionReason === "unforeseen" ? "warning" : "outline"}>{label}</Badge>;
      },
    },
  ];

  return (
    <div>
      <DataTable
        title="Duty Log"
        description="Recent flight duty time records"
        icon={Timer}
        columns={columns}
        data={logs}
        onRowClick={openEdit}
        initialSorting={[{ id: "date", desc: true }]}
        emptyState={
          <EmptyState
            icon={<Timer className="size-8" />}
            title="No duty logs yet"
            description="Log each pilot's report and duty end time to track CARS 604 compliance."
            action={
              <Button size="sm" onClick={openNew}>
                <Plus /> Add duty log
              </Button>
            }
          />
        }
      />

      <DutyLogForm open={formOpen} onOpenChange={setFormOpen} pilots={pilots} initial={editing} />
    </div>
  );
}

export { DutyLogView };
