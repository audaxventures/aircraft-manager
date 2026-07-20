"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Plus, PlaneTakeoff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { TripForm, type PilotOption, type TripFormValue } from "@/components/trips/trip-form";
import type { ComboboxOption } from "@/components/shared/multi-combobox";
import { formatDate, formatHours, formatNumber } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { TripDto } from "@/lib/trips";

interface TripsViewProps {
  trips: TripDto[];
  pilots: PilotOption[];
  passengerOptions: ComboboxOption[];
}

function TripsView({ trips, pilots, passengerOptions }: TripsViewProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TripFormValue | null>(null);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(trip: TripDto) {
    setEditing({
      id: trip.id,
      date: trip.date.toISOString().slice(0, 10),
      departureAirport: trip.departureAirport,
      arrivalAirport: trip.arrivalAirport,
      routeLabel: trip.routeLabel ?? "",
      hours: String(trip.hours),
      cycles: String(trip.cycles),
      miles: String(trip.miles),
      purpose: trip.purpose ?? "",
      notes: trip.notes ?? "",
      pilotId: trip.pilotId ?? "",
      dayTakeoffs: String(trip.dayTakeoffs),
      dayLandings: String(trip.dayLandings),
      nightTakeoffs: String(trip.nightTakeoffs),
      nightLandings: String(trip.nightLandings),
      passengerIds: trip.passengers.map((p) => p.id),
    });
    setFormOpen(true);
  }

  function exportCsv() {
    const csv = toCsv(trips, [
      { header: "Date", accessor: (t) => formatDate(t.date) },
      { header: "Departure", accessor: (t) => t.departureAirport },
      { header: "Arrival", accessor: (t) => t.arrivalAirport },
      { header: "Route", accessor: (t) => t.routeLabel },
      { header: "Hours", accessor: (t) => t.hours },
      { header: "Cycles", accessor: (t) => t.cycles },
      { header: "Miles", accessor: (t) => t.miles },
      { header: "Pilot", accessor: (t) => t.pilotName },
      { header: "Day T/O", accessor: (t) => t.dayTakeoffs },
      { header: "Night T/O", accessor: (t) => t.nightTakeoffs },
      { header: "Day LDG", accessor: (t) => t.dayLandings },
      { header: "Night LDG", accessor: (t) => t.nightLandings },
      { header: "Passengers", accessor: (t) => t.passengers.map((p) => p.name).join("; ") },
      { header: "Purpose", accessor: (t) => t.purpose },
      { header: "Notes", accessor: (t) => t.notes },
    ]);
    downloadCsv(`trips-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  const columns: ColumnDef<TripDto>[] = [
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date), sortingFn: "datetime" },
    {
      accessorKey: "routeLabel",
      header: "Route",
      cell: ({ row }) => row.original.routeLabel || `${row.original.departureAirport} - ${row.original.arrivalAirport}`,
    },
    {
      accessorKey: "hours",
      header: () => <div className="w-full text-right">Hours</div>,
      cell: ({ row }) => <div className="text-right tabular-nums">{formatNumber(row.original.hours)}</div>,
    },
    {
      accessorKey: "cycles",
      header: () => <div className="w-full text-right">Cycles</div>,
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.cycles}</div>,
    },
    {
      accessorKey: "miles",
      header: () => <div className="w-full text-right">Miles</div>,
      cell: ({ row }) => <div className="text-right tabular-nums">{formatNumber(row.original.miles)}</div>,
    },
    { accessorKey: "pilotName", header: "Pilot", cell: ({ row }) => row.original.pilotName || "—" },
    {
      accessorKey: "passengers",
      header: "Passengers",
      cell: ({ row }) => {
        const names = row.original.passengers.map((p) => p.name);
        if (names.length === 0) return "—";
        if (names.length <= 2) return names.join(", ");
        return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
      },
    },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={trips.length === 0}>
          <Download /> Export CSV
        </Button>
        <Button size="sm" onClick={openNew}>
          <Plus /> Add trip
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={trips}
        onRowClick={openEdit}
        initialSorting={[{ id: "date", desc: true }]}
        emptyState={
          <EmptyState
            icon={<PlaneTakeoff className="size-8" />}
            title="No trips logged yet"
            description="Add a trip after each flight to track hours, cycles, and passengers."
            action={
              <Button size="sm" onClick={openNew}>
                <Plus /> Add trip
              </Button>
            }
          />
        }
      />

      <TripForm open={formOpen} onOpenChange={setFormOpen} pilots={pilots} passengerOptions={passengerOptions} initial={editing} />
    </div>
  );
}

export { TripsView };
