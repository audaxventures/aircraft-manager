import { prisma } from "@/lib/db";
import type { CurrencyThresholds, PilotCurrency, QualifyingCalc } from "@/lib/currency-shared";

export type { CurrencyThresholds, PilotCurrency, QualifyingCalc } from "@/lib/currency-shared";

function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

interface TripEvent {
  tripId: string;
  date: Date;
  routeLabel: string | null;
  count: number;
}

/** Walks events most-recent-first, accumulating counts until `required` is reached. */
function computeFromEvents(events: TripEvent[], required: number, periodMonths: number, asOf: Date): QualifyingCalc {
  const sorted = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());

  let cumulative = 0;
  const contributing: TripEvent[] = [];
  let qualifyingDate: Date | null = null;

  for (const event of sorted) {
    if (event.count <= 0) continue;
    cumulative += event.count;
    contributing.push(event);
    if (cumulative >= required) {
      qualifyingDate = event.date;
      break;
    }
  }

  const periodStart = addMonths(asOf, -periodMonths);
  const totalInPeriod = sorted.filter((e) => e.date >= periodStart && e.date <= asOf).reduce((s, e) => s + e.count, 0);

  if (!qualifyingDate) {
    return { current: false, qualifyingDate: null, lapseDate: null, qualifyingTrips: [], totalInPeriod };
  }

  const lapseDate = addMonths(qualifyingDate, periodMonths);
  const current = lapseDate > asOf;

  return {
    current,
    qualifyingDate,
    lapseDate,
    qualifyingTrips: contributing.map((e) => ({ tripId: e.tripId, date: e.date, routeLabel: e.routeLabel, count: e.count })),
    totalInPeriod,
  };
}

function combine(takeoffs: QualifyingCalc, landings: QualifyingCalc): { current: boolean; lapseDate: Date | null } {
  const current = takeoffs.current && landings.current;
  let lapseDate: Date | null = null;
  if (takeoffs.lapseDate && landings.lapseDate) {
    lapseDate = takeoffs.lapseDate < landings.lapseDate ? takeoffs.lapseDate : landings.lapseDate;
  } else {
    lapseDate = takeoffs.lapseDate ?? landings.lapseDate;
  }
  return { current, lapseDate };
}

export async function getPilotCurrency(pilotId: string, thresholds: CurrencyThresholds, asOf = new Date()): Promise<PilotCurrency | null> {
  const pilot = await prisma.pilot.findUnique({ where: { id: pilotId } });
  if (!pilot) return null;

  const legs = await prisma.tripLeg.findMany({
    where: { trip: { archived: false, OR: [{ pilotId }, { secondPilotId: pilotId }] } },
    select: {
      id: true,
      date: true,
      departureAirport: true,
      arrivalAirport: true,
      dayTakeoffs: true,
      dayLandings: true,
      nightTakeoffs: true,
      nightLandings: true,
      pilotInstrumentApproaches: true,
      secondPilotInstrumentApproaches: true,
      trip: { select: { pilotId: true } },
    },
    orderBy: { date: "desc" },
  });
  const legRoute = (l: { departureAirport: string; arrivalAirport: string }) => `${l.departureAirport} → ${l.arrivalAirport}`;

  const dayTakeoffEvents = legs.map((l) => ({ tripId: l.id, date: l.date, routeLabel: legRoute(l), count: l.dayTakeoffs + l.nightTakeoffs }));
  const dayLandingEvents = legs.map((l) => ({ tripId: l.id, date: l.date, routeLabel: legRoute(l), count: l.dayLandings + l.nightLandings }));
  const nightTakeoffEvents = legs.map((l) => ({ tripId: l.id, date: l.date, routeLabel: legRoute(l), count: l.nightTakeoffs }));
  const nightLandingEvents = legs.map((l) => ({ tripId: l.id, date: l.date, routeLabel: legRoute(l), count: l.nightLandings }));
  const instrumentApproachEvents = legs.map((l) => ({
    tripId: l.id,
    date: l.date,
    routeLabel: legRoute(l),
    count: l.trip.pilotId === pilotId ? l.pilotInstrumentApproaches : l.secondPilotInstrumentApproaches,
  }));

  const dayTakeoffs = computeFromEvents(dayTakeoffEvents, thresholds.dayTakeoffsRequired, thresholds.periodMonths, asOf);
  const dayLandings = computeFromEvents(dayLandingEvents, thresholds.dayLandingsRequired, thresholds.periodMonths, asOf);
  const nightTakeoffs = computeFromEvents(nightTakeoffEvents, thresholds.nightTakeoffsRequired, thresholds.periodMonths, asOf);
  const nightLandings = computeFromEvents(nightLandingEvents, thresholds.nightLandingsRequired, thresholds.periodMonths, asOf);
  const instrumentApproaches = computeFromEvents(
    instrumentApproachEvents,
    thresholds.instrumentApproachesRequired,
    thresholds.instrumentApproachesPeriodMonths,
    asOf
  );

  return {
    pilotId: pilot.id,
    pilotName: pilot.name,
    day: { takeoffs: dayTakeoffs, landings: dayLandings, ...combine(dayTakeoffs, dayLandings) },
    night: { takeoffs: nightTakeoffs, landings: nightLandings, ...combine(nightTakeoffs, nightLandings) },
    instrumentApproaches,
  };
}

export async function getAllPilotsCurrency(thresholds: CurrencyThresholds, asOf = new Date()): Promise<PilotCurrency[]> {
  const pilots = await prisma.pilot.findMany({ where: { archived: false }, orderBy: { name: "asc" } });
  const results: PilotCurrency[] = [];
  for (const pilot of pilots) {
    const currency = await getPilotCurrency(pilot.id, thresholds, asOf);
    if (currency) results.push(currency);
  }
  return results;
}

function toCurrencyThresholds(s: {
  currencyDayTakeoffsRequired: number;
  currencyDayLandingsRequired: number;
  currencyNightTakeoffsRequired: number;
  currencyNightLandingsRequired: number;
  currencyPeriodMonths: number;
  instrumentApproachesRequired: number;
  instrumentApproachesPeriodMonths: number;
}): CurrencyThresholds {
  return {
    dayTakeoffsRequired: s.currencyDayTakeoffsRequired,
    dayLandingsRequired: s.currencyDayLandingsRequired,
    nightTakeoffsRequired: s.currencyNightTakeoffsRequired,
    nightLandingsRequired: s.currencyNightLandingsRequired,
    periodMonths: s.currencyPeriodMonths,
    instrumentApproachesRequired: s.instrumentApproachesRequired,
    instrumentApproachesPeriodMonths: s.instrumentApproachesPeriodMonths,
  };
}

export async function getCurrencyThresholds(): Promise<CurrencyThresholds> {
  const s = await prisma.regulatorySettings.findFirst();
  if (!s) {
    const created = await prisma.regulatorySettings.create({ data: {} });
    return toCurrencyThresholds(created);
  }
  return toCurrencyThresholds(s);
}
