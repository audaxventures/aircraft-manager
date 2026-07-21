export interface TripExportColumn {
  key: string;
  label: string;
}

export const TRIP_EXPORT_COLUMNS: TripExportColumn[] = [
  { key: "date", label: "Date" },
  { key: "endDate", label: "End date" },
  { key: "departureAirport", label: "Departure" },
  { key: "arrivalAirport", label: "Arrival" },
  { key: "routeLabel", label: "Route" },
  { key: "hours", label: "Hours" },
  { key: "cycles", label: "Cycles" },
  { key: "miles", label: "Miles" },
  { key: "takeoffTime", label: "Takeoff time (UTC)" },
  { key: "landingTime", label: "Landing time (UTC)" },
  { key: "pilotName", label: "Pilot in command" },
  { key: "secondPilotName", label: "Second in command" },
  { key: "dayTakeoffs", label: "Day takeoffs" },
  { key: "nightTakeoffs", label: "Night takeoffs" },
  { key: "dayLandings", label: "Day landings" },
  { key: "nightLandings", label: "Night landings" },
  { key: "passengers", label: "Passengers" },
  { key: "purpose", label: "Purpose" },
  { key: "notes", label: "Notes" },
];

export const DEFAULT_TRIP_EXPORT_COLUMNS = TRIP_EXPORT_COLUMNS.map((c) => c.key);
