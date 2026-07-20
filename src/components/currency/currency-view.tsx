"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SlideOver } from "@/components/shared/slide-over";
import { formatDate } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
import { daysUntil, type PilotCurrency } from "@/lib/currency-shared";

interface CurrencyViewProps {
  currencies: PilotCurrency[];
}

function statusLabel(current: boolean, lapseDate: Date | null): string {
  if (!lapseDate) return "Not current";
  if (!current) return `Expired ${formatDate(lapseDate)}`;
  const days = daysUntil(lapseDate);
  if (days <= 30) return `Expires in ${days}d (${formatDate(lapseDate)})`;
  return `Current until ${formatDate(lapseDate)}`;
}

function CurrencyView({ currencies }: CurrencyViewProps) {
  const [detail, setDetail] = React.useState<PilotCurrency | null>(null);

  function exportCsv() {
    const csv = toCsv(currencies, [
      { header: "Pilot", accessor: (c) => c.pilotName },
      { header: "Day status", accessor: (c) => (c.day.current ? "Current" : "Not current") },
      { header: "Day lapses/lapsed", accessor: (c) => (c.day.lapseDate ? formatDate(c.day.lapseDate) : "—") },
      {
        header: "Day qualifying takeoffs",
        accessor: (c) => c.day.takeoffs.qualifyingTrips.map((t) => formatDate(t.date)).join("; "),
      },
      {
        header: "Day qualifying landings",
        accessor: (c) => c.day.landings.qualifyingTrips.map((t) => formatDate(t.date)).join("; "),
      },
      { header: "Night status", accessor: (c) => (c.night.current ? "Current" : "Not current") },
      { header: "Night lapses/lapsed", accessor: (c) => (c.night.lapseDate ? formatDate(c.night.lapseDate) : "—") },
      {
        header: "Night qualifying takeoffs",
        accessor: (c) => c.night.takeoffs.qualifyingTrips.map((t) => formatDate(t.date)).join("; "),
      },
      {
        header: "Night qualifying landings",
        accessor: (c) => c.night.landings.qualifyingTrips.map((t) => formatDate(t.date)).join("; "),
      },
    ]);
    downloadCsv(`pilot-currency-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  const columns: ColumnDef<PilotCurrency>[] = [
    { accessorKey: "pilotName", header: "Pilot" },
    {
      id: "day",
      header: "Day currency",
      cell: ({ row }) => (
        <Badge variant={row.original.day.current ? "success" : "destructive"}>{statusLabel(row.original.day.current, row.original.day.lapseDate)}</Badge>
      ),
    },
    {
      id: "night",
      header: "Night currency",
      cell: ({ row }) => (
        <Badge variant={row.original.night.current ? "success" : "destructive"}>
          {statusLabel(row.original.night.current, row.original.night.lapseDate)}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={currencies.length === 0}>
          <Download /> Export CSV
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={currencies}
        onRowClick={setDetail}
        emptyState={
          <EmptyState
            icon={<BadgeCheck className="size-8" />}
            title="No pilots to track yet"
            description="Add pilots in Settings, then log trips with day/night takeoff and landing counts."
          />
        }
      />

      <SlideOver open={!!detail} onOpenChange={(o) => !o && setDetail(null)} title={detail?.pilotName ?? ""} description="Qualifying flights behind each currency calculation">
        {detail && (
          <div className="space-y-6">
            <CurrencyDetailSection title="Day takeoffs" calc={detail.day.takeoffs} />
            <CurrencyDetailSection title="Day landings" calc={detail.day.landings} />
            <CurrencyDetailSection title="Night takeoffs" calc={detail.night.takeoffs} />
            <CurrencyDetailSection title="Night landings" calc={detail.night.landings} />
          </div>
        )}
      </SlideOver>
    </div>
  );
}

function CurrencyDetailSection({ title, calc }: { title: string; calc: PilotCurrency["day"]["takeoffs"] }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <Badge variant={calc.current ? "success" : "destructive"}>{calc.current ? "Current" : "Not current"}</Badge>
      </div>
      {calc.qualifyingTrips.length > 0 ? (
        <ul className="space-y-1 rounded-md border text-sm">
          {calc.qualifyingTrips.map((t) => (
            <li key={t.tripId} className="flex justify-between border-b px-3 py-1.5 last:border-b-0">
              <span className="text-muted-foreground">{formatDate(t.date)}</span>
              <span>
                {t.routeLabel || "—"} · {t.count}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No qualifying flights on record.</p>
      )}
    </div>
  );
}

export { CurrencyView };
