import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";

export async function getTripHoursAndMiles(range?: { start: Date; end: Date }) {
  const agg = await prisma.trip.aggregate({
    where: range ? { date: { gte: range.start, lt: range.end } } : undefined,
    _sum: { hours: true, miles: true },
    _count: true,
  });

  return {
    hours: toNumber(agg._sum.hours),
    miles: agg._sum.miles ?? 0,
    tripCount: agg._count,
  };
}

export interface TripDto {
  id: string;
  date: Date;
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
  dayTakeoffs: number;
  dayLandings: number;
  nightTakeoffs: number;
  nightLandings: number;
  passengers: { id: string; name: string }[];
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
      ...(filters.from || filters.to
        ? { date: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lt: filters.to } : {}) } }
        : {}),
      ...(filters.pilotId ? { pilotId: filters.pilotId } : {}),
      ...(filters.passengerId ? { passengers: { some: { passengerId: filters.passengerId } } } : {}),
      ...(filters.search
        ? {
            OR: [
              { departureAirport: { contains: filters.search, mode: "insensitive" } },
              { arrivalAirport: { contains: filters.search, mode: "insensitive" } },
              { routeLabel: { contains: filters.search, mode: "insensitive" } },
              { purpose: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      pilot: true,
      passengers: { include: { passenger: true } },
    },
    orderBy: { date: "desc" },
  });

  return trips.map((t) => ({
    id: t.id,
    date: t.date,
    departureAirport: t.departureAirport,
    arrivalAirport: t.arrivalAirport,
    routeLabel: t.routeLabel,
    hours: toNumber(t.hours),
    cycles: t.cycles,
    miles: t.miles,
    purpose: t.purpose,
    notes: t.notes,
    pilotId: t.pilotId,
    pilotName: t.pilot?.name ?? null,
    dayTakeoffs: t.dayTakeoffs,
    dayLandings: t.dayLandings,
    nightTakeoffs: t.nightTakeoffs,
    nightLandings: t.nightLandings,
    passengers: t.passengers.map((p) => ({ id: p.passenger.id, name: p.passenger.name })),
  }));
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
        include: { trip: true },
        orderBy: { trip: { date: "desc" } },
      },
    },
  });
  if (!passenger) return null;

  return {
    passengerId: passenger.id,
    passengerName: passenger.name,
    trips: passenger.trips.map((tp) => ({
      id: tp.trip.id,
      date: tp.trip.date,
      routeLabel: tp.trip.routeLabel,
      departureAirport: tp.trip.departureAirport,
      arrivalAirport: tp.trip.arrivalAirport,
    })),
  };
}
