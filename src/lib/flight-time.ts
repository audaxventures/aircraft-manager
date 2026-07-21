/**
 * UTC decimal-hour time format used for takeoff/landing entry: each 0.1 is a
 * 6-minute increment (e.g. 14.3 = 14:18Z). Values are entered already rounded
 * up to the nearest 6 minutes, so parsing only validates the grid — it never
 * silently re-rounds a value the user typed.
 */
const DECIMAL_HOUR_PATTERN = /^([01]?[0-9]|2[0-3])\.[0-9]$/;

export function parseDecimalHour(input: string): number | null {
  const trimmed = input.trim();
  if (!DECIMAL_HOUR_PATTERN.test(trimmed)) return null;
  return Math.round(parseFloat(trimmed) * 10) / 10;
}

export function formatDecimalHour(value: number): string {
  return value.toFixed(1);
}

export function roundUpToSixMinutes(rawHour: number): number {
  return Math.ceil(rawHour * 10 - 1e-9) / 10;
}

/** Hours elapsed from takeoff to landing, wrapping past midnight if landing < takeoff. */
export function decimalHoursBetween(takeoffTime: number, landingTime: number): number {
  const diff = landingTime >= takeoffTime ? landingTime - takeoffTime : landingTime + 24 - takeoffTime;
  return Math.round(diff * 10) / 10;
}

/** Combines a calendar date with a UTC decimal-hour offset, rolling the date forward/back as needed. */
export function decimalHourToUtcDate(baseDate: Date, decimalHour: number): Date {
  const totalMinutes = Math.round(decimalHour * 60);
  return new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), 0, totalMinutes));
}

/** UTC hour-of-day as a decimal (e.g. 11:06Z -> 11.1), matching the trip takeoff/landing format. */
export function dateToDecimalHour(date: Date): number {
  const rawHour = date.getUTCHours() + date.getUTCMinutes() / 60;
  return roundUpToSixMinutes(rawHour);
}
