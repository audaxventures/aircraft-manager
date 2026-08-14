import { formatDate } from "@/lib/format";
import { decimalHourTo12Hour } from "@/lib/flight-time";
import type { TripDto } from "@/lib/trips";

/** One clause per leg, e.g. "CYWG→KPSP (Aug 5, Dep 2:18 PM, 4.2 hrs); KPSP→CYWG (Aug 9)". */
function legsSummary(trip: TripDto): string {
  return trip.legs
    .map((leg) => {
      const parts = [formatDate(leg.date)];
      if (leg.departureTime !== null) parts.push(`Dep ${decimalHourTo12Hour(leg.departureTime)}`);
      if (leg.hours > 0) parts.push(`${leg.hours} hrs`);
      return `${leg.departureAirport}→${leg.arrivalAirport} (${parts.join(", ")})`;
    })
    .join("; ");
}

export function getTripColumnValue(trip: TripDto, key: string): string {
  switch (key) {
    case "date":
      return formatDate(trip.date);
    case "endDate":
      return trip.endDate ? formatDate(trip.endDate) : "";
    case "isSimulator":
      return trip.isSimulator ? "Yes" : "No";
    case "departureAirport":
      return trip.departureAirport;
    case "arrivalAirport":
      return trip.arrivalAirport;
    case "routeLabel":
      return trip.routeLabel ?? "";
    case "hours":
      return String(trip.hours);
    case "cycles":
      return String(trip.cycles);
    case "miles":
      return String(trip.miles);
    case "legs":
      return legsSummary(trip);
    case "pilotName":
      return trip.pilotName ?? "";
    case "secondPilotName":
      return trip.secondPilotName ?? "";
    case "passengers":
      return trip.passengers.map((p) => p.name).join("; ");
    case "purpose":
      return trip.purpose ?? "";
    case "notes":
      return trip.notes ?? "";
    default:
      return "";
  }
}
