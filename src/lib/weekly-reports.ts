import { prisma } from "@/lib/db";
import { toNumber, formatDate } from "@/lib/format";
import { getFiscalYearRange, getYtdRange } from "@/lib/date-ranges";
import { getPrimaryAircraft } from "@/lib/aircraft";

export interface MaintenanceItem {
  description: string;
  due: string;
}

export interface WeeklyReportListItem {
  id: string;
  reportDate: Date;
  createdAt: Date;
}

export async function getWeeklyReports(): Promise<WeeklyReportListItem[]> {
  return prisma.weeklyReport.findMany({
    select: { id: true, reportDate: true, createdAt: true },
    orderBy: { reportDate: "desc" },
  });
}

export interface WeeklyReportDto {
  id: string;
  reportDate: Date;
  ownerOperator: string | null;
  programManager: string | null;
  weekOverview: string;
  accomplishments: string[];
  newIssues: string[];
  toBeCompleted: string[];
  customerDecisions: string[];
  maintenanceItems: MaintenanceItem[];
}

export async function getWeeklyReport(id: string): Promise<WeeklyReportDto | null> {
  const r = await prisma.weeklyReport.findUnique({ where: { id } });
  if (!r) return null;
  return {
    id: r.id,
    reportDate: r.reportDate,
    ownerOperator: r.ownerOperator,
    programManager: r.programManager,
    weekOverview: r.weekOverview,
    accomplishments: r.accomplishments,
    newIssues: r.newIssues,
    toBeCompleted: r.toBeCompleted,
    customerDecisions: r.customerDecisions,
    maintenanceItems: (r.maintenanceItems as unknown as MaintenanceItem[]) ?? [],
  };
}

/** Most recent report before (or on) the given date, used to carry open items into a new draft. */
export async function getPreviousWeeklyReport(beforeDate: Date): Promise<WeeklyReportDto | null> {
  const r = await prisma.weeklyReport.findFirst({
    where: { reportDate: { lt: beforeDate } },
    orderBy: { reportDate: "desc" },
  });
  if (!r) return null;
  return getWeeklyReport(r.id);
}

export interface WeekOverviewStats {
  purchaseHours: number;
  purchaseCycles: number;
  currentTotalHours: number;
  currentTotalCycles: number;
  sincePurchaseHours: number;
  sincePurchaseCycles: number;
  ytdLabel: string;
  ytdHours: number;
  ytdCycles: number;
  priorFyLabel: string;
  priorFyHours: number;
  priorFyCycles: number;
  upcomingTrips: { label: string; date: Date }[];
}

export async function getWeekOverviewStats(reportDate: Date): Promise<WeekOverviewStats> {
  const aircraft = await getPrimaryAircraft();
  const fiscalYearStartMonth = aircraft?.fiscalYearStartMonth ?? 1;
  const purchaseHours = toNumber(aircraft?.purchaseTotalHours ?? 0);
  const purchaseCycles = aircraft?.purchaseTotalCycles ?? 0;

  const { start: fyStart } = getFiscalYearRange(reportDate, fiscalYearStartMonth);
  const priorFyStart = new Date(Date.UTC(fyStart.getUTCFullYear() - 1, fyStart.getUTCMonth(), 1));
  const ytdRange = getYtdRange(reportDate, fiscalYearStartMonth);

  const [allTime, ytd, priorFy, upcoming] = await Promise.all([
    prisma.trip.aggregate({ _sum: { hours: true, cycles: true } }),
    prisma.trip.aggregate({ where: { date: { gte: ytdRange.start, lt: ytdRange.end } }, _sum: { hours: true, cycles: true } }),
    prisma.trip.aggregate({ where: { date: { gte: priorFyStart, lt: fyStart } }, _sum: { hours: true, cycles: true } }),
    prisma.trip.findMany({
      where: { date: { gt: reportDate } },
      orderBy: { date: "asc" },
      take: 3,
      select: { arrivalAirport: true, date: true },
    }),
  ]);

  const sincePurchaseHours = toNumber(allTime._sum.hours);
  const sincePurchaseCycles = allTime._sum.cycles ?? 0;

  return {
    purchaseHours,
    purchaseCycles,
    currentTotalHours: purchaseHours + sincePurchaseHours,
    currentTotalCycles: purchaseCycles + sincePurchaseCycles,
    sincePurchaseHours,
    sincePurchaseCycles,
    ytdLabel: `${formatDate(ytdRange.start)} - ${formatDate(reportDate)}`,
    ytdHours: toNumber(ytd._sum.hours),
    ytdCycles: ytd._sum.cycles ?? 0,
    priorFyLabel: `${formatDate(priorFyStart)} - ${formatDate(new Date(fyStart.getTime() - 1))}`,
    priorFyHours: toNumber(priorFy._sum.hours),
    priorFyCycles: priorFy._sum.cycles ?? 0,
    upcomingTrips: upcoming.map((t) => ({ label: t.arrivalAirport, date: t.date })),
  };
}

export function buildOverviewDraft(stats: WeekOverviewStats, tailNumber: string): string {
  const round1 = (n: number) => n.toFixed(1);
  const nextTripText =
    stats.upcomingTrips.length > 0
      ? ` Next trip ${stats.upcomingTrips.map((t) => `${t.label} ${formatDate(t.date)}`).join(", then ")}.`
      : "";

  return (
    `(Purchased at ${round1(stats.purchaseHours)}/${stats.purchaseCycles} cycles) ` +
    `Current ${round1(stats.currentTotalHours)} total time, ${stats.currentTotalCycles} cycles. ` +
    `${tailNumber} has accumulated a total of ${round1(stats.sincePurchaseHours)} hrs / ${stats.sincePurchaseCycles} cycles since purchase. ` +
    `${stats.priorFyLabel} = ${round1(stats.priorFyHours)} hours ${stats.priorFyCycles} cycles. ` +
    `${stats.ytdLabel} = ${round1(stats.ytdHours)} hrs / ${stats.ytdCycles} cycles.` +
    nextTripText
  );
}

/** Upcoming Maintenance-category calendar events, offered as candidate rows for the report's maintenance table. */
export async function getMaintenanceCandidates(reportDate: Date): Promise<MaintenanceItem[]> {
  const events = await prisma.calendarEvent.findMany({
    where: {
      endDate: { gte: reportDate },
      category: { name: { equals: "Maintenance", mode: "insensitive" } },
    },
    orderBy: { startDate: "asc" },
    take: 10,
  });

  return events.map((e) => ({ description: e.title, due: formatDate(e.startDate) }));
}
