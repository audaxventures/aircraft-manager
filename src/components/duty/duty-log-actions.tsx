"use client";

import * as React from "react";
import { Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DutyLogForm, type PilotOption } from "@/components/duty/duty-log-form";
import { EXTENSION_LABELS, formatUtcDecimalTime } from "@/components/duty/duty-log-shared";
import { formatDate } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { DutyDayLogDto } from "@/lib/duty";

interface DutyLogActionsProps {
  logs: DutyDayLogDto[];
  pilots: PilotOption[];
}

function DutyLogActions({ logs, pilots }: DutyLogActionsProps) {
  const [open, setOpen] = React.useState(false);

  function exportCsv() {
    const csv = toCsv(logs, [
      { header: "Date", accessor: (l) => formatDate(l.date) },
      { header: "Pilot", accessor: (l) => l.pilotName },
      { header: "Duty type", accessor: (l) => (l.dutyType === "ADMIN" ? "Admin" : "Flight") },
      { header: "Report time", accessor: (l) => formatUtcDecimalTime(l.reportTime) },
      { header: "Duty end time", accessor: (l) => formatUtcDecimalTime(l.dutyEndTime) },
      { header: "Flight duty time (hrs)", accessor: (l) => l.flightDutyHours.toFixed(1) },
      { header: "Rest before (hrs)", accessor: (l) => l.restPeriodBeforeHours.toFixed(1) },
      { header: "30-day flight time (hrs)", accessor: (l) => l.rolling30DayHours.toFixed(1) },
      { header: "90-day flight time (hrs)", accessor: (l) => l.rolling90DayHours.toFixed(1) },
      { header: "12-month flight time (hrs)", accessor: (l) => l.rolling12MonthHours.toFixed(1) },
      { header: "Applicable limit (hrs)", accessor: (l) => l.effectiveLimitHours.toFixed(1) },
      { header: "Pass/Fail", accessor: (l) => (l.withinLimit ? "PASS" : "FAIL") },
      { header: "Extension applied", accessor: (l) => EXTENSION_LABELS[l.extensionReason] ?? "—" },
      { header: "Unforeseen circumstances", accessor: (l) => (l.unforeseenCircumstancesApplied ? "Yes" : "No") },
      { header: "Unforeseen circumstances note", accessor: (l) => l.unforeseenCircumstancesNote },
      { header: "Signed by", accessor: (l) => l.unforeseenSignedByName },
      { header: "Signed at", accessor: (l) => (l.unforeseenSignedAt ? l.unforeseenSignedAt.toISOString() : "") },
      { header: "Notes", accessor: (l) => l.notes },
    ]);
    downloadCsv(`duty-days-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="rounded-full" onClick={exportCsv} disabled={logs.length === 0}>
        <Download /> Export CSV
      </Button>
      <Button className="rounded-full" onClick={() => setOpen(true)}>
        <Plus /> Add duty log
      </Button>
      <DutyLogForm open={open} onOpenChange={setOpen} pilots={pilots} initial={null} />
    </div>
  );
}

export { DutyLogActions };
