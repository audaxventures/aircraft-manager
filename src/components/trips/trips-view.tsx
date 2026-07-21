"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, PlaneTakeoff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { TripForm, type PilotOption, type TripFormValue } from "@/components/trips/trip-form";
import { TripExportPanel } from "@/components/trips/trip-export-panel";
import type { ComboboxOption } from "@/components/shared/multi-combobox";
import { formatDate, formatNumber } from "@/lib/format";
import { formatDecimalHour } from "@/lib/flight-time";
import type { TripDto, TripExportPresetDto } from "@/lib/trips";

interface TripsViewProps {
  trips: TripDto[];
  pilots: PilotOption[];
  passengerOptions: ComboboxOption[];
  exportPresets: TripExportPresetDto[];
}

function TripsView({ trips, pilots, passengerOptions, exportPresets }: TripsViewProps) {
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
      endDate: trip.endDate ? trip.endDate.toISOString().slice(0, 10) : "",
      departureAirport: trip.departureAirport,
      arrivalAirport: trip.arrivalAirport,
      routeLabel: trip.routeLabel ?? "",
      hours: String(trip.hours),
      cycles: String(trip.cycles),
      miles: String(trip.miles),
      purpose: trip.purpose ?? "",
      notes: trip.notes ?? "",
      pilotId: trip.pilotId ?? "",
      secondPilotId: trip.secondPilotId ?? "",
      takeoffTime: trip.takeoffTime !== null ? formatDecimalHour(trip.takeoffTime) : "",
      landingTime: trip.landingTime !== null ? formatDecimalHour(trip.landingTime) : "",
      dayTakeoffs: String(trip.dayTakeoffs),
      dayLandings: String(trip.dayLandings),
      nightTakeoffs: String(trip.nightTakeoffs),
      nightLandings: String(trip.nightLandings),
      passengerIds: trip.passengers.map((p) => p.id),
    });
    setFormOpen(true);
  }

  const columns: ColumnDef<TripDto>[] = [
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date), sortingFn: "datetime" },
    {
      accessorKey: "routeLabel",
      header: "Route",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.routeLabel || `${row.original.departureAirport} - ${row.original.arrivalAirport}`}</span>
          {row.original.status === "PLANNED" && (
            <Badge variant="outline" className="text-[10px]">
              Planned
            </Badge>
          )}
        </div>
      ),
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
    { accessorKey: "pilotName", header: "PIC", cell: ({ row }) => row.original.pilotName || "—" },
    { accessorKey: "secondPilotName", header: "SIC", cell: ({ row }) => row.original.secondPilotName || "—" },
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
        <TripExportPanel trips={trips} presets={exportPresets} />
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
