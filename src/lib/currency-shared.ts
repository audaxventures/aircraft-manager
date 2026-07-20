// Pure types + helpers shared between server data-fetchers and client
// components. Deliberately has no dependency on @/lib/db (Prisma/pg pulls in
// Node built-ins that break the browser bundle if imported from a client
// component's module graph) — see lib/currency.ts for the server-only side.

export interface CurrencyThresholds {
  takeoffsRequired: number;
  landingsRequired: number;
  periodMonths: number;
}

export interface QualifyingCalc {
  current: boolean;
  qualifyingDate: Date | null;
  lapseDate: Date | null;
  qualifyingTrips: { tripId: string; date: Date; routeLabel: string | null; count: number }[];
  totalInPeriod: number;
}

export interface PilotCurrency {
  pilotId: string;
  pilotName: string;
  day: {
    takeoffs: QualifyingCalc;
    landings: QualifyingCalc;
    current: boolean;
    lapseDate: Date | null;
  };
  night: {
    takeoffs: QualifyingCalc;
    landings: QualifyingCalc;
    current: boolean;
    lapseDate: Date | null;
  };
}

export function daysUntil(date: Date, asOf = new Date()): number {
  return Math.round((date.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24));
}
