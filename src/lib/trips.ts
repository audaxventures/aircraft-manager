import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";

// Real aircraft utilization only -- simulator sessions are excluded since
// they burn no airframe time or fuel (they still show up in the Trips list
// itself, just not in stats meant to represent the aircraft's flying).
export async function getTripHoursAndMiles(range?: { start: Date; end: Date }) {
  const agg = await prisma.trip.aggregate({
    where: { archived: false, isSimulator: false, ...(range ? { date: { gte: range.start, lt: range.end } } : {}) },
    _sum: { hours: true, miles: true },
    _count: true,
  });

  return {
    hours: toNumber(agg._sum.hours),
    miles: agg._sum.miles ?? 0,
    tripCount: agg._count,
  };
}

export interface TripLegDto {
  id: string;
  legOrder: number;
  date: Date;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: number | null;
  landingTime: number | null;
  hours: number;
  cycles: number;
  miles: number;
  dayTakeoffs: number;
  dayLandings: number;
  nightTakeoffs: number;
  nightLandings: number;
  pilotInstrumentApproaches: number;
  secondPilotInstrumentApproaches: number;
}

export interface TripDto {
  id: string;
  status: "PLANNED" | "COMPLETED";
  date: Date;
  endDate: Date | null;
  isSimulator: boolean;
  // Convenience fields derived from the first/last leg, for places that just
  // need "where the trip starts/ends" without walking the full itinerary.
  departureAirport: string;
  arrivalAirport: string;
  routeLabel: string | null;
  hours: number;
  cycles: number;
  miles: number;
  purpose: string | null;
  notes: string | null;
  pilotId: string | null;
  pilotName: string | null;
  secondPilotId: string | null;
  secondPilotName: string | null;
  legs: TripLegDto[];
  passengers: { id: string; name: string }[];
}

function toLegDto(l: {
  id: string;
  legOrder: number;
  date: Date;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: unknown;
  landingTime: unknown;
  hours: unknown;
  cycles: number;
  miles: number;
  dayTakeoffs: number;
  dayLandings: number;
  nightTakeoffs: number;
  nightLandings: number;
  pilotInstrumentApproaches: number;
  secondPilotInstrumentApproaches: number;
}): TripLegDto {
  return {
    id: l.id,
    legOrder: l.legOrder,
    date: l.date,
    departureAirport: l.departureAirport,
    arrivalAirport: l.arrivalAirport,
    departureTime: l.departureTime !== null ? toNumber(l.departureTime) : null,
    landingTime: l.landingTime !== null ? toNumber(l.landingTime) : null,
    hours: toNumber(l.hours),
    cycles: l.cycles,
    miles: l.miles,
    dayTakeoffs: l.dayTakeoffs,
    dayLandings: l.dayLandings,
    nightTakeoffs: l.nightTakeoffs,
    nightLandings: l.nightLandings,
    pilotInstrumentApproaches: l.pilotInstrumentApproaches,
    secondPilotInstrumentApproaches: l.secondPilotInstrumentApproaches,
  };
}

export interface TripFilters {
  from?: Date;
  to?: Date;
  pilotId?: string;
  passengerId?: string;
  search?: string;
}

export async function getTrips(filters: TripFilters = {}): Promise<TripDto[]> {
  const trips = await prisma.trip.findMany({
    where: {
      archived: false,
      ...(filters.from || filters.to
        ? { date: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lt: filters.to } : {}) } }
        : {}),
      ...(filters.passengerId ? { passengers: { some: { passengerId: filters.passengerId } } } : {}),
      AND: [
        ...(filters.pilotId ? [{ OR: [{ pilotId: filters.pilotId }, { secondPilotId: filters.pilotId }] }] : []),
        ...(filters.search
          ? [
              {
                OR: [
                  { legs: { some: { departureAirport: { contains: filters.search, mode: "insensitive" as const } } } },
                  { legs: { some: { arrivalAirport: { contains: filters.search, mode: "insensitive" as const } } } },
                  { routeLabel: { contains: filters.search, mode: "insensitive" as const } },
                  { purpose: { contains: filters.search, mode: "insensitive" as const } },
                ],
              },
            ]
          : []),
      ],
    },
    include: {
      pilot: true,
      secondPilot: true,
      passengers: { include: { passenger: true } },
      legs: { orderBy: { legOrder: "asc" } },
    },
    orderBy: { date: "desc" },
  });

  return trips.map((t) => {
    const legs = t.legs.map(toLegDto);
    const first = legs[0];
    const last = legs[legs.length - 1];
    return {
      id: t.id,
      status: t.status,
      date: t.date,
      endDate: t.endDate,
      isSimulator: t.isSimulator,
      departureAirport: first?.departureAirport ?? "",
      arrivalAirport: last?.arrivalAirport ?? "",
      routeLabel: t.routeLabel,
      hours: toNumber(t.hours),
      cycles: t.cycles,
      miles: t.miles,
      purpose: t.purpose,
      notes: t.notes,
      pilotId: t.pilotId,
      pilotName: t.pilot?.name ?? null,
      secondPilotId: t.secondPilotId,
      secondPilotName: t.secondPilot?.name ?? null,
      legs,
      passengers: t.passengers.map((p) => ({ id: p.passenger.id, name: p.passenger.name })),
    };
  });
}

export interface TripExportPresetDto {
  id: string;
  name: string;
  columns: string[];
}

export async function getTripExportPresets(): Promise<TripExportPresetDto[]> {
  return prisma.tripExportPreset.findMany({ orderBy: { name: "asc" } });
}

export async function getPassengerOptions() {
  const passengers = await prisma.passenger.findMany({ orderBy: { name: "asc" } });
  return passengers.map((p) => ({ value: p.id, label: p.name }));
}

export interface PassengerHistoryEntry {
  passengerId: string;
  passengerName: string;
  trips: { id: string; date: Date; routeLabel: string | null; departureAirport: string; arrivalAirport: string }[];
}

export async function getPassengerHistory(passengerId: string): Promise<PassengerHistoryEntry | null> {
  const passenger = await prisma.passenger.findUnique({
    where: { id: passengerId },
    include: {
      trips: {
        where: { trip: { archived: false } },
        include: { trip: { include: { legs: { orderBy: { legOrder: "asc" } } } } },
        orderBy: { trip: { date: "desc" } },
      },
    },
  });
  if (!passenger) return null;

  return {
    passengerId: passenger.id,
    passengerName: passenger.name,
    trips: passenger.trips.map((tp) => {
      const legs = tp.trip.legs;
      return {
        id: tp.trip.id,
        date: tp.trip.date,
        routeLabel: tp.trip.routeLabel,
        departureAirport: legs[0]?.departureAirport ?? "",
        arrivalAirport: legs[legs.length - 1]?.arrivalAirport ?? "",
      };
    }),
  };
}
