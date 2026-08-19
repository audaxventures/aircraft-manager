"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, PlaneTakeoff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { TripForm, type PilotOption, type TripFormValue } from "@/components/trips/trip-form";
import { TripExportPanel } from "@/components/trips/trip-export-panel";
import type { ComboboxOption } from "@/components/shared/multi-combobox";
import { formatDate, formatNumber } from "@/lib/format";
import { formatDecimalHour, decimalHourToHHMM } from "@/lib/flight-time";
import type { TripDto, TripExportPresetDto } from "@/lib/trips";
import type { TripLegFormValue } from "@/components/trips/trip-form";

interface TripsViewProps {
  trips: TripDto[];
  pilots: PilotOption[];
  passengerOptions: ComboboxOption[];
  exportPresets: TripExportPresetDto[];
}

function TripsView({ trips, pilots, passengerOptions, exportPresets }: TripsViewProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TripFormValue | null>(null);
  const [dateTab, setDateTab] = React.useState<"all" | "upcoming" | "past">("all");

  const filteredTrips = React.useMemo(() => {
    if (dateTab === "all") return trips;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return trips.filter((t) => (dateTab === "upcoming" ? t.date >= startOfToday : t.date < startOfToday));
  }, [trips, dateTab]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(trip: TripDto) {
    const legs: TripLegFormValue[] = trip.legs.map((leg, i) => ({
      key: `${trip.id}-leg-${i}`,
      date: leg.date.toISOString().slice(0, 10),
      departureAirport: leg.departureAirport,
      arrivalAirport: leg.arrivalAirport,
      departureTime: leg.departureTime !== null ? formatDecimalHour(leg.departureTime) : "",
      landingTime: leg.landingTime !== null ? formatDecimalHour(leg.landingTime) : "",
      localDepartureTime: leg.localDepartureTime !== null ? decimalHourToHHMM(leg.localDepartureTime) : "",
      hours: String(leg.hours),
      miles: String(leg.miles),
      dayTakeoffs: String(leg.dayTakeoffs),
      dayLandings: String(leg.dayLandings),
      nightTakeoffs: String(leg.nightTakeoffs),
      nightLandings: String(leg.nightLandings),
      pilotInstrumentApproaches: String(leg.pilotInstrumentApproaches),
      secondPilotInstrumentApproaches: String(leg.secondPilotInstrumentApproaches),
      passengerIds: leg.passengers.map((p) => p.id),
    }));
    setEditing({
      id: trip.id,
      isSimulator: trip.isSimulator,
      routeLabel: trip.routeLabel ?? "",
      purpose: trip.purpose ?? "",
      notes: trip.notes ?? "",
      pilotId: trip.pilotId ?? "",
      secondPilotId: trip.secondPilotId ?? "",
      legs,
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
          {row.original.isSimulator && (
            <Badge variant="outline" className="text-[10px]">
              Sim
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Tabs value={dateTab} onValueChange={(v) => setDateTab(v as typeof dateTab)}>
          <TabsList>
            <TabsTrigger value="all">All Trips</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Trips</TabsTrigger>
            <TabsTrigger value="past">Past Trips</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <TripExportPanel trips={filteredTrips} presets={exportPresets} />
          <Button size="sm" onClick={openNew}>
            <Plus /> Add trip
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTrips}
        onRowClick={openEdit}
        initialSorting={[{ id: "date", desc: true }]}
        emptyState={
          <EmptyState
            icon={<PlaneTakeoff className="size-8" />}
            title={dateTab === "all" ? "No trips logged yet" : `No ${dateTab} trips`}
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
