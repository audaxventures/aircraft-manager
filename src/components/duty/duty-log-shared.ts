import { dateToDecimalHour, formatDecimalHour } from "@/lib/flight-time";
import type { DutyDayLogDto } from "@/lib/duty";

export function formatUtcDecimalTime(d: Date) {
  return `${formatDecimalHour(dateToDecimalHour(d))} UTC`;
}

// "30day"/"rest" just describe why the routine 14->15 hr allowance applies --
// that's the default state for nearly every entry, not a notable action taken.
// Only split-duty and unforeseen circumstances are opt-in extensions worth
// flagging, so those are the only two with a real label here.
export const EXTENSION_LABELS: Partial<Record<DutyDayLogDto["extensionReason"], string>> = {
  split: "Split-duty",
  unforeseen: "Unforeseen circumstances",
};
