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
  };
}

export function computeFlightDutyHours(reportTime: Date, dutyEndTime: Date): number {
  return Math.max(0, (dutyEndTime.getTime() - reportTime.getTime()) / (1000 * 60 * 60));
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

export async function getRolling30DayFlightHours(pilotId: string, asOfDate: Date): Promise<number> {
  const start = new Date(asOfDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const agg = await prisma.trip.aggregate({
    where: { pilotId, date: { gte: start, lte: asOfDate } },
    _sum: { hours: true },
  });
  return toNumber(agg._sum.hours);
}

export interface DutyDayLogDto {
  id: string;
  pilotId: string;
  pilotName: string;
  date: Date;
  reportTime: Date;
  dutyEndTime: Date;
  flightDutyHours: number;
  restPeriodBeforeHours: number;
  splitDutyApplied: boolean;
  splitDutyNote: string | null;
  notes: string | null;
  rolling30DayHours: number;
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

  const result: DutyDayLogDto[] = [];
  for (const log of logs) {
    const flightDutyHours = computeFlightDutyHours(log.reportTime, log.dutyEndTime);
    const rolling30DayHours = await getRolling30DayFlightHours(log.pilotId, log.date);
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
      reportTime: log.reportTime,
      dutyEndTime: log.dutyEndTime,
      flightDutyHours,
      restPeriodBeforeHours,
      splitDutyApplied: log.splitDutyApplied,
      splitDutyNote: log.splitDutyNote,
      notes: log.notes,
      rolling30DayHours,
      effectiveLimitHours: evaluation.effectiveLimitHours,
      extensionReason: evaluation.extensionReason,
      withinLimit: evaluation.withinLimit,
    });
  }
  return result;
}

export interface PilotDutyStatus {
  pilotId: string;
  pilotName: string;
  lastDutyDate: Date | null;
  rolling30DayHours: number;
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
    const logs = await prisma.dutyDayLog.findMany({
      where: { pilotId: pilot.id },
      orderBy: { date: "desc" },
    });

    if (logs.length === 0) {
      statuses.push({
        pilotId: pilot.id,
        pilotName: pilot.name,
        lastDutyDate: null,
        rolling30DayHours: 0,
        lastQualifyingRestDate: null,
        daysSinceQualifyingRest: null,
        restViolation: false,
        nextRestDueBy: null,
        activeFdtViolations: 0,
      });
      continue;
    }

    const rolling30DayHours = await getRolling30DayFlightHours(pilot.id, now);

    let activeFdtViolations = 0;
    for (const log of logs) {
      const flightDutyHours = computeFlightDutyHours(log.reportTime, log.dutyEndTime);
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
      lastQualifyingRestDate,
      daysSinceQualifyingRest,
      restViolation,
      nextRestDueBy,
      activeFdtViolations,
    });
  }

  return statuses;
}
