import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";

export type TrashKind = "trip" | "cost" | "duty" | "event" | "weekly-report";

export interface TrashItem {
  kind: TrashKind;
  id: string;
  title: string;
  subtitle: string;
  deletedAt: Date;
}

export async function getRecentlyDeleted(): Promise<TrashItem[]> {
  const [trips, costs, dutyLogs, events, reports] = await Promise.all([
    prisma.trip.findMany({
      where: { archived: true },
      include: { pilot: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.costEntry.findMany({
      where: { archived: true },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.dutyDayLog.findMany({
      where: { archived: true },
      include: { pilot: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.calendarEvent.findMany({
      where: { archived: true },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.weeklyReport.findMany({
      where: { archived: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const items: TrashItem[] = [
    ...trips.map((t) => ({
      kind: "trip" as const,
      id: t.id,
      title: t.routeLabel || `${t.departureAirport} - ${t.arrivalAirport}`,
      subtitle: `Trip · ${t.pilot?.name ?? "No pilot"} · ${t.date.toISOString().slice(0, 10)}`,
      deletedAt: t.updatedAt,
    })),
    ...costs.map((c) => ({
      kind: "cost" as const,
      id: c.id,
      title: `${c.currency} ${toNumber(c.amount).toFixed(2)} — ${c.category.name}`,
      subtitle: `Cost entry · ${c.date.toISOString().slice(0, 10)}`,
      deletedAt: c.updatedAt,
    })),
    ...dutyLogs.map((d) => ({
      kind: "duty" as const,
      id: d.id,
      title: `${d.pilot.name} — ${d.dutyType === "FLIGHT" ? "Flight" : "Admin"} duty`,
      subtitle: `Duty log · ${d.date.toISOString().slice(0, 10)}`,
      deletedAt: d.updatedAt,
    })),
    ...events.map((e) => ({
      kind: "event" as const,
      id: e.id,
      title: e.title,
      subtitle: `${e.category.name} · ${e.startDate.toISOString().slice(0, 10)}`,
      deletedAt: e.updatedAt,
    })),
    ...reports.map((r) => ({
      kind: "weekly-report" as const,
      id: r.id,
      title: `Weekly report — ${r.reportDate.toISOString().slice(0, 10)}`,
      subtitle: "Weekly report",
      deletedAt: r.updatedAt,
    })),
  ];

  return items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
}
