// Fiscal-year-aware date range helpers. Aircraft.fiscalYearStartMonth defaults
// to January, so these degrade to plain calendar-year ranges until/unless a
// different fiscal start is configured.

function startOfDayUtc(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function getFiscalYearRange(referenceDate: Date, fiscalYearStartMonth: number) {
  const startMonthIndex = fiscalYearStartMonth - 1; // 0-based
  const ref = startOfDayUtc(referenceDate);
  let fyStartYear = ref.getUTCFullYear();
  if (ref.getUTCMonth() < startMonthIndex) fyStartYear -= 1;

  const start = new Date(Date.UTC(fyStartYear, startMonthIndex, 1));
  const end = new Date(Date.UTC(fyStartYear + 1, startMonthIndex, 1));
  return { start, end };
}

export function getYtdRange(referenceDate: Date, fiscalYearStartMonth: number) {
  const { start } = getFiscalYearRange(referenceDate, fiscalYearStartMonth);
  const end = new Date(startOfDayUtc(referenceDate).getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function getMtdRange(referenceDate: Date) {
  const ref = startOfDayUtc(referenceDate);
  const start = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
  const end = new Date(ref.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function getTrailingDaysRange(referenceDate: Date, days: number) {
  const end = new Date(startOfDayUtc(referenceDate).getTime() + 24 * 60 * 60 * 1000);
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

export function getMonthRange(year: number, monthIndex0: number) {
  const start = new Date(Date.UTC(year, monthIndex0, 1));
  const end = new Date(Date.UTC(year, monthIndex0 + 1, 1));
  return { start, end };
}
