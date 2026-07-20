"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Plus, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { DutyLogForm, type PilotOption, type DutyLogFormValue } from "@/components/duty/duty-log-form";
import { formatDate, formatHours, formatTime } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
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
      date: log.date.toISOString().slice(0, 10),
      reportTime: log.reportTime.toISOString().slice(11, 16),
      dutyEndTime: log.dutyEndTime.toISOString().slice(11, 16),
      endsNextDay: log.dutyEndTime.toISOString().slice(0, 10) !== log.date.toISOString().slice(0, 10),
      restPeriodBeforeHours: String(log.restPeriodBeforeHours),
      splitDutyApplied: log.splitDutyApplied,
      splitDutyNote: log.splitDutyNote ?? "",
      notes: log.notes ?? "",
    });
    setFormOpen(true);
  }

  function exportCsv() {
    const csv = toCsv(logs, [
      { header: "Date", accessor: (l) => formatDate(l.date) },
      { header: "Pilot", accessor: (l) => l.pilotName },
      { header: "Report time", accessor: (l) => formatTime(l.reportTime) },
      { header: "Duty end time", accessor: (l) => formatTime(l.dutyEndTime) },
      { header: "Flight duty time (hrs)", accessor: (l) => l.flightDutyHours.toFixed(1) },
      { header: "Rest before (hrs)", accessor: (l) => l.restPeriodBeforeHours.toFixed(1) },
      { header: "30-day flight time (hrs)", accessor: (l) => l.rolling30DayHours.toFixed(1) },
      { header: "Applicable limit (hrs)", accessor: (l) => l.effectiveLimitHours.toFixed(1) },
      { header: "Pass/Fail", accessor: (l) => (l.withinLimit ? "PASS" : "FAIL") },
      { header: "Notes", accessor: (l) => l.notes },
    ]);
    downloadCsv(`duty-days-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  const columns: ColumnDef<DutyDayLogDto>[] = [
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date), sortingFn: "datetime" },
    { accessorKey: "pilotName", header: "Pilot" },
    { accessorKey: "reportTime", header: "Report", cell: ({ row }) => formatTime(row.original.reportTime) },
    { accessorKey: "dutyEndTime", header: "Duty end", cell: ({ row }) => formatTime(row.original.dutyEndTime) },
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
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={logs.length === 0}>
          <Download /> Export CSV
        </Button>
        <Button size="sm" onClick={openNew}>
          <Plus /> Add duty log
        </Button>
      </div>

      <DataTable
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
