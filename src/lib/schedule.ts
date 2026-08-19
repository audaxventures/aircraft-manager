import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";
import { decimalHourTo12Hour } from "@/lib/flight-time";

export interface CalendarItemDto {
  id: string;
  kind: "trip" | "event" | "stationary";
  title: string;
  subtitle: string | null;
  startDate: Date;
  endDate: Date;
  color: string;
  categoryLabel: string;
  categoryId: string | null;
  pilotId: string | null;
  pilotName: string | null;
  notes: string | null;
  tripStatus: "PLANNED" | "COMPLETED" | null;
}

const TRIP_COLOR = "#171717";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function getMonthRange(year: number, month: number) {
  // month is 0-indexed
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 1));
  return { start, end };
}

export async function getCalendarMonth(year: number, month: number): Promise<CalendarItemDto[]> {
  const { start, end } = getMonthRange(year, month);

  const [trips, events] = await Promise.all([
    prisma.trip.findMany({
      where: {
        archived: false,
        // Simulator sessions don't appear on the Schedule/calendar -- they're
        // not operational aircraft activity, just training tracked on Trips.
        isSimulator: false,
        date: { lt: end },
        OR: [{ endDate: { gte: start } }, { endDate: null, date: { gte: start } }],
      },
      include: { pilot: true, legs: { orderBy: { legOrder: "asc" } } },
      orderBy: { date: "asc" },
    }),
    prisma.calendarEvent.findMany({
      where: { archived: false, startDate: { lt: end }, endDate: { gte: start } },
      include: { category: true, pilot: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const tripItems: CalendarItemDto[] = [];
  for (const t of trips) {
    const legs = t.legs;
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      const routeText = `${leg.departureAirport} → ${leg.arrivalAirport}`;
      // The local departure time (as entered) is what shows here when set --
      // it's what a passenger/staff reading the Schedule actually cares
      // about, not the UTC time duty-day/currency math runs on.
      const displayTime =
        leg.localDepartureTime !== null
          ? toNumber(leg.localDepartureTime)
          : leg.departureTime !== null
            ? toNumber(leg.departureTime)
            : null;
      const title = displayTime !== null ? `${routeText} · Dep ${decimalHourTo12Hour(displayTime)}` : routeText;
      const hours = toNumber(leg.hours);

      tripItems.push({
        id: `${t.id}-leg-${leg.id}`,
        kind: "trip",
        title,
        subtitle: t.status === "PLANNED" ? "Planned trip" : hours > 0 ? `${hours} hrs` : null,
        startDate: leg.date,
        endDate: leg.date,
        color: TRIP_COLOR,
        categoryLabel: t.status === "PLANNED" ? "Planned trip" : "Trip",
        categoryId: null,
        pilotId: t.pilotId,
        pilotName: t.pilot?.name ?? null,
        notes: t.notes,
        tripStatus: t.status,
      });

      // Days strictly between this leg and the next are spent at this leg's
      // destination -- show a placeholder rather than repeating the trip's
      // full route label on every day it spans.
      const nextLeg = legs[i + 1];
      if (nextLeg) {
        for (let time = leg.date.getTime() + ONE_DAY_MS; time < nextLeg.date.getTime(); time += ONE_DAY_MS) {
          const day = new Date(time);
          tripItems.push({
            id: `${t.id}-stationary-${day.toISOString().slice(0, 10)}`,
            kind: "stationary",
            title: `At ${leg.arrivalAirport}`,
            subtitle: null,
            startDate: day,
            endDate: day,
            color: TRIP_COLOR,
            categoryLabel: "Stationary",
            categoryId: null,
            pilotId: t.pilotId,
            pilotName: t.pilot?.name ?? null,
            notes: null,
            tripStatus: t.status,
          });
        }
      }
    }
  }

  const eventItems: CalendarItemDto[] = events.map((e) => ({
    id: e.id,
    kind: "event",
    title: e.title,
    subtitle: e.notes,
    startDate: e.startDate,
    endDate: e.endDate,
    color: e.category.color,
    categoryLabel: e.category.name,
    categoryId: e.categoryId,
    pilotId: e.pilotId,
    pilotName: e.pilot?.name ?? null,
    notes: e.notes,
    tripStatus: null,
  }));

  return [...tripItems, ...eventItems].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
