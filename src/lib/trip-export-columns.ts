export interface TripExportColumn {
  key: string;
  label: string;
}

export const TRIP_EXPORT_COLUMNS: TripExportColumn[] = [
  { key: "date", label: "Date" },
  { key: "endDate", label: "End date" },
  { key: "isSimulator", label: "Simulator" },
  { key: "departureAirport", label: "Departure" },
  { key: "arrivalAirport", label: "Arrival" },
  { key: "routeLabel", label: "Route" },
  { key: "hours", label: "Hours" },
  { key: "cycles", label: "Cycles" },
  { key: "miles", label: "Miles" },
  { key: "legs", label: "Legs" },
  { key: "pilotName", label: "Pilot in command" },
  { key: "secondPilotName", label: "Second in command" },
  { key: "passengers", label: "Passengers" },
  { key: "purpose", label: "Purpose" },
  { key: "notes", label: "Notes" },
];

export const DEFAULT_TRIP_EXPORT_COLUMNS = TRIP_EXPORT_COLUMNS.map((c) => c.key);
