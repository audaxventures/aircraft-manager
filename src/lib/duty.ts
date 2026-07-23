import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";

export interface RegulatoryThresholds {
  maxFlightDutyHours: number;
  extendedMaxFlightDutyHours: number;
  rolling30DayFlightHoursLimit: number;
  extensionRestPeriodHours: number;
  minRestPeriodHours: number;
  restPeriodWindowDays: number;
  splitDutyMaxExtensionHours: number;
  splitDutyMinRestHours: number;
  currencyTakeoffsRequired: number;
  currencyLandingsRequired: number;
  currencyPeriodMonths: number;
  flightHours30DayLimit: number;
  flightHours90DayLimit: number;
  flightHours12MonthLimit: number;
}

export async function getRegulatoryThresholds(): Promise<RegulatoryThresholds & { id: string }> {
  const s = await prisma.regulatorySettings.findFirst();
  if (!s) {
    const created = await prisma.regulatorySettings.create({ data: {} });
    return toThresholds(created);
  }
  return toThresholds(s);
}

function toThresholds(s: {
  id: string;
  maxFlightDutyHours: unknown;
  extendedMaxFlightDutyHours: unknown;
  rolling30DayFlightHoursLimit: unknown;
  extensionRestPeriodHours: unknown;
  minRestPeriodHours: unknown;
  restPeriodWindowDays: number;
  splitDutyMaxExtensionHours: unknown;
  splitDutyMinRestHours: unknown;
  currencyTakeoffsRequired: number;
  currencyLandingsRequired: number;
  currencyPeriodMonths: number;
  flightHours30DayLimit: unknown;
  flightHours90DayLimit: unknown;
  flightHours12MonthLimit: unknown;
}) {
  return {
    id: s.id,
    maxFlightDutyHours: toNumber(s.maxFlightDutyHours),
    extendedMaxFlightDutyHours: toNumber(s.extendedMaxFlightDutyHours),
    rolling30DayFlightHoursLimit: toNumber(s.rolling30DayFlightHoursLimit),
    extensionRestPeriodHours: toNumber(s.extensionRestPeriodHours),
    minRestPeriodHours: toNumber(s.minRestPeriodHours),
    restPeriodWindowDays: s.restPeriodWindowDays,
    splitDutyMaxExtensionHours: toNumber(s.splitDutyMaxExtensionHours),
    splitDutyMinRestHours: toNumber(s.splitDutyMinRestHours),
    currencyTakeoffsRequired: s.currencyTakeoffsRequired,
    currencyLandingsRequired: s.currencyLandingsRequired,
    currencyPeriodMonths: s.currencyPeriodMonths,
    flightHours30DayLimit: toNumber(s.flightHours30DayLimit),
    flightHours90DayLimit: toNumber(s.flightHours90DayLimit),
    flightHours12MonthLimit: toNumber(s.flightHours12MonthLimit),
  };
}

export function computeFlightDutyHours(reportTime: Date, dutyEndTime: Date): number {
  return Math.max(0, (dutyEndTime.getTime() - reportTime.getTime()) / (1000 * 60 * 60));
}

/**
 * CARS 604 flight duty time is the total time on duty for the calendar day,
 * not per entry — a pilot's Flight and Admin duty log entries on the same
 * date combine into one duty-day total for limit checks and display.
 */
function combinedDutyHoursByPilotDate(
  logs: { pilotId: string; date: Date; reportTime: Date; dutyEndTime: Date }[]
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const log of logs) {
    const key = `${log.pilotId}:${log.date.getTime()}`;
    const hours = computeFlightDutyHours(log.reportTime, log.dutyEndTime);
    totals.set(key, (totals.get(key) ?? 0) + hours);
  }
  return totals;
}

export interface DutyEvaluation {
  flightDutyHours: number;
  rolling30DayHours: number;
  effectiveLimitHours: number;
  extensionReason: "none" | "30day" | "rest" | "split";
  withinLimit: boolean;
}

export function evaluateDutyEntry(
  entry: { restPeriodBeforeHours: number; splitDutyApplied: boolean; flightDutyHours: number },
  rolling30DayHours: number,
  thresholds: RegulatoryThresholds
): DutyEvaluation {
  const extendable =
    rolling30DayHours <= thresholds.rolling30DayFlightHoursLimit ||
    entry.restPeriodBeforeHours >= thresholds.extensionRestPeriodHours;

  let effectiveLimitHours = thresholds.maxFlightDutyHours;
  let extensionReason: DutyEvaluation["extensionReason"] = "none";

  if (extendable) {
    effectiveLimitHours = thresholds.extendedMaxFlightDutyHours;
    extensionReason = rolling30DayHours <= thresholds.rolling30DayFlightHoursLimit ? "30day" : "rest";
  }

  if (entry.splitDutyApplied) {
    effectiveLimitHours += thresholds.splitDutyMaxExtensionHours;
    extensionReason = "split";
  }

  return {
    flightDutyHours: entry.flightDutyHours,
    rolling30DayHours,
    effectiveLimitHours,
    extensionReason,
    withinLimit: entry.flightDutyHours <= effectiveLimitHours,
  };
}

async function getRollingFlightHours(pilotId: string, asOfDate: Date, days: number): Promise<number> {
  const start = new Date(asOfDate.getTime() - days * 24 * 60 * 60 * 1000);
  const agg = await prisma.trip.aggregate({
    where: { OR: [{ pilotId }, { secondPilotId: pilotId }], date: { gte: start, lte: asOfDate } },
    _sum: { hours: true },
  });
  return toNumber(agg._sum.hours);
}

export async function getRolling30DayFlightHours(pilotId: string, asOfDate: Date): Promise<number> {
  return getRollingFlightHours(pilotId, asOfDate, 30);
}

export async function getRolling90DayFlightHours(pilotId: string, asOfDate: Date): Promise<number> {
  return getRollingFlightHours(pilotId, asOfDate, 90);
}

/** Rolling 365-day window, not a calendar year — "12-month" here means the trailing 365 days from asOfDate. */
export async function getRolling12MonthFlightHours(pilotId: string, asOfDate: Date): Promise<number> {
  return getRollingFlightHours(pilotId, asOfDate, 365);
}

export type DutyLogType = "FLIGHT" | "ADMIN";

export interface DutyDayLogDto {
  id: string;
  pilotId: string;
  pilotName: string;
  date: Date;
  dutyType: DutyLogType;
  reportTime: Date;
  dutyEndTime: Date;
  flightDutyHours: number;
  restPeriodBeforeHours: number;
  splitDutyApplied: boolean;
  splitDutyNote: string | null;
  notes: string | null;
  rolling30DayHours: number;
  rolling90DayHours: number;
  rolling12MonthHours: number;
  effectiveLimitHours: number;
  extensionReason: DutyEvaluation["extensionReason"];
  withinLimit: boolean;
}

export interface DutyFilters {
  pilotId?: string;
  from?: Date;
  to?: Date;
}

export async function getDutyDayLogs(filters: DutyFilters = {}): Promise<DutyDayLogDto[]> {
  const thresholds = await getRegulatoryThresholds();
  const logs = await prisma.dutyDayLog.findMany({
    where: {
      ...(filters.pilotId ? { pilotId: filters.pilotId } : {}),
      ...(filters.from || filters.to
        ? { date: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lt: filters.to } : {}) } }
        : {}),
    },
    include: { pilot: true },
    orderBy: { date: "desc" },
  });

  const dailyTotals = combinedDutyHoursByPilotDate(logs);

  const result: DutyDayLogDto[] = [];
  for (const log of logs) {
    const flightDutyHours = dailyTotals.get(`${log.pilotId}:${log.date.getTime()}`)!;
    const [rolling30DayHours, rolling90DayHours, rolling12MonthHours] = await Promise.all([
      getRolling30DayFlightHours(log.pilotId, log.date),
      getRolling90DayFlightHours(log.pilotId, log.date),
      getRolling12MonthFlightHours(log.pilotId, log.date),
    ]);
    const restPeriodBeforeHours = toNumber(log.restPeriodBeforeHours);
    const evaluation = evaluateDutyEntry(
      { restPeriodBeforeHours, splitDutyApplied: log.splitDutyApplied, flightDutyHours },
      rolling30DayHours,
      thresholds
    );
    result.push({
      id: log.id,
      pilotId: log.pilotId,
      pilotName: log.pilot.name,
      date: log.date,
      dutyType: log.dutyType,
      reportTime: log.reportTime,
      dutyEndTime: log.dutyEndTime,
      flightDutyHours,
      restPeriodBeforeHours,
      splitDutyApplied: log.splitDutyApplied,
      splitDutyNote: log.splitDutyNote,
      notes: log.notes,
      rolling30DayHours,
      rolling90DayHours,
      rolling12MonthHours,
      effectiveLimitHours: evaluation.effectiveLimitHours,
      extensionReason: evaluation.extensionReason,
      withinLimit: evaluation.withinLimit,
    });
  }
  return result;
}

/**
 * Auto-creates or widens a pilot's FLIGHT duty day log for a trip date from
 * computed report/duty-end times. If the pilot already has a flight log for
 * that date (e.g. a second leg the same day), the window widens to cover both
 * instead of creating a conflicting second entry (DutyDayLog is unique per
 * pilot+date+dutyType, so a same-day Admin entry is unaffected).
 * The result stays editable afterward from the Duty Days page.
 */
export async function upsertDutyDayLogFromTrip(
  pilotId: string,
  tripDate: Date,
  computedReportTime: Date,
  computedDutyEndTime: Date
): Promise<void> {
  const date = new Date(Date.UTC(tripDate.getUTCFullYear(), tripDate.getUTCMonth(), tripDate.getUTCDate()));

  const existing = await prisma.dutyDayLog.findUnique({
    where: { pilotId_date_dutyType: { pilotId, date, dutyType: "FLIGHT" } },
  });

  if (existing) {
    const reportTime = existing.reportTime < computedReportTime ? existing.reportTime : computedReportTime;
    const dutyEndTime = existing.dutyEndTime > computedDutyEndTime ? existing.dutyEndTime : computedDutyEndTime;
    if (reportTime.getTime() !== existing.reportTime.getTime() || dutyEndTime.getTime() !== existing.dutyEndTime.getTime()) {
      await prisma.dutyDayLog.update({ where: { id: existing.id }, data: { reportTime, dutyEndTime } });
    }
    return;
  }

  const priorLog = await prisma.dutyDayLog.findFirst({
    where: { pilotId, date: { lt: date } },
    orderBy: { date: "desc" },
  });
  const restPeriodBeforeHours = priorLog
    ? Math.max(0, (computedReportTime.getTime() - priorLog.dutyEndTime.getTime()) / (1000 * 60 * 60))
    : 0;

  await prisma.dutyDayLog.create({
    data: {
      pilotId,
      date,
      dutyType: "FLIGHT",
      reportTime: computedReportTime,
      dutyEndTime: computedDutyEndTime,
      restPeriodBeforeHours,
    },
  });
}

export interface PilotDutyStatus {
  pilotId: string;
  pilotName: string;
  lastDutyDate: Date | null;
  rolling30DayHours: number;
  rolling90DayHours: number;
  rolling12MonthHours: number;
  lastQualifyingRestDate: Date | null;
  daysSinceQualifyingRest: number | null;
  restViolation: boolean;
  nextRestDueBy: Date | null;
  activeFdtViolations: number;
}

export async function getAllPilotsDutyStatus(): Promise<PilotDutyStatus[]> {
  const thresholds = await getRegulatoryThresholds();
  const pilots = await prisma.pilot.findMany({ where: { archived: false }, orderBy: { name: "asc" } });
  const now = new Date();

  const statuses: PilotDutyStatus[] = [];
  for (const pilot of pilots) {
    const [logs, rolling30DayHours, rolling90DayHours, rolling12MonthHours] = await Promise.all([
      prisma.dutyDayLog.findMany({ where: { pilotId: pilot.id }, orderBy: { date: "desc" } }),
      getRolling30DayFlightHours(pilot.id, now),
      getRolling90DayFlightHours(pilot.id, now),
      getRolling12MonthFlightHours(pilot.id, now),
    ]);

    if (logs.length === 0) {
      statuses.push({
        pilotId: pilot.id,
        pilotName: pilot.name,
        lastDutyDate: null,
        rolling30DayHours,
        rolling90DayHours,
        rolling12MonthHours,
        lastQualifyingRestDate: null,
        daysSinceQualifyingRest: null,
        restViolation: false,
        nextRestDueBy: null,
        activeFdtViolations: 0,
      });
      continue;
    }

    const dailyTotals = combinedDutyHoursByPilotDate(logs);
    const evaluatedDates = new Set<number>();
    let activeFdtViolations = 0;
    for (const log of logs) {
      if (evaluatedDates.has(log.date.getTime())) continue;
      evaluatedDates.add(log.date.getTime());
      const flightDutyHours = dailyTotals.get(`${log.pilotId}:${log.date.getTime()}`)!;
      const logRolling30 = await getRolling30DayFlightHours(pilot.id, log.date);
      const evaluation = evaluateDutyEntry(
        { restPeriodBeforeHours: toNumber(log.restPeriodBeforeHours), splitDutyApplied: log.splitDutyApplied, flightDutyHours },
        logRolling30,
        thresholds
      );
      if (!evaluation.withinLimit) activeFdtViolations++;
    }

    const qualifyingRest = logs.find((l) => toNumber(l.restPeriodBeforeHours) >= thresholds.minRestPeriodHours);
    const lastQualifyingRestDate = qualifyingRest ? qualifyingRest.date : null;
    const daysSinceQualifyingRest = lastQualifyingRestDate
      ? (now.getTime() - lastQualifyingRestDate.getTime()) / (1000 * 60 * 60 * 24)
      : null;
    const restViolation = daysSinceQualifyingRest === null || daysSinceQualifyingRest > thresholds.restPeriodWindowDays;
    const nextRestDueBy = lastQualifyingRestDate
      ? new Date(lastQualifyingRestDate.getTime() + thresholds.restPeriodWindowDays * 24 * 60 * 60 * 1000)
      : null;

    statuses.push({
      pilotId: pilot.id,
      pilotName: pilot.name,
      lastDutyDate: logs[0].date,
      rolling30DayHours,
      rolling90DayHours,
      rolling12MonthHours,
      lastQualifyingRestDate,
      daysSinceQualifyingRest,
      restViolation,
      nextRestDueBy,
      activeFdtViolations,
    });
  }

  return statuses;
}
