import { formatDate } from "@/lib/format";
import { formatDecimalHour } from "@/lib/flight-time";
import type { TripDto } from "@/lib/trips";

export function getTripColumnValue(trip: TripDto, key: string): string {
  switch (key) {
    case "date":
      return formatDate(trip.date);
    case "endDate":
      return trip.endDate ? formatDate(trip.endDate) : "";
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
    case "takeoffTime":
      return trip.takeoffTime !== null ? formatDecimalHour(trip.takeoffTime) : "";
    case "landingTime":
      return trip.landingTime !== null ? formatDecimalHour(trip.landingTime) : "";
    case "pilotName":
      return trip.pilotName ?? "";
    case "secondPilotName":
      return trip.secondPilotName ?? "";
    case "dayTakeoffs":
      return String(trip.dayTakeoffs);
    case "nightTakeoffs":
      return String(trip.nightTakeoffs);
    case "dayLandings":
      return String(trip.dayLandings);
    case "nightLandings":
      return String(trip.nightLandings);
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
