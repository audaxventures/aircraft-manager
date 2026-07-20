import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";

export interface CalendarItemDto {
  id: string;
  kind: "trip" | "event";
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
        date: { lt: end },
        OR: [{ endDate: { gte: start } }, { endDate: null, date: { gte: start } }],
      },
      include: { pilot: true },
      orderBy: { date: "asc" },
    }),
    prisma.calendarEvent.findMany({
      where: { startDate: { lt: end }, endDate: { gte: start } },
      include: { category: true, pilot: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const tripItems: CalendarItemDto[] = trips.map((t) => ({
    id: t.id,
    kind: "trip",
    title: t.routeLabel || `${t.departureAirport} – ${t.arrivalAirport}`,
    subtitle: t.status === "PLANNED" ? "Planned trip" : toNumber(t.hours) > 0 ? `${toNumber(t.hours)} hrs` : null,
    startDate: t.date,
    endDate: t.endDate ?? t.date,
    color: TRIP_COLOR,
    categoryLabel: t.status === "PLANNED" ? "Planned trip" : "Trip",
    categoryId: null,
    pilotId: t.pilotId,
    pilotName: t.pilot?.name ?? null,
    notes: t.notes,
    tripStatus: t.status,
  }));

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
