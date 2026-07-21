import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getTrips } from "@/lib/trips";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { TRIP_EXPORT_COLUMNS, DEFAULT_TRIP_EXPORT_COLUMNS } from "@/lib/trip-export-columns";
import { TripsReport } from "@/lib/pdf/trips-report";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(new Date(toParam).getTime() + 86400000) : undefined;
  const pilotId = searchParams.get("pilotId") || undefined;
  const search = searchParams.get("q") || undefined;

  const requestedKeys = searchParams.get("columns")?.split(",").filter(Boolean) ?? DEFAULT_TRIP_EXPORT_COLUMNS;
  const columns = TRIP_EXPORT_COLUMNS.filter((c) => requestedKeys.includes(c.key));

  const [trips, aircraft] = await Promise.all([getTrips({ from, to, pilotId, search }), getPrimaryAircraft()]);

  const buffer = await renderToBuffer(
    TripsReport({
      aircraftTailNumber: aircraft?.tailNumber ?? "—",
      from: from ?? null,
      to: toParam ? new Date(toParam) : null,
      columns: columns.length > 0 ? columns : TRIP_EXPORT_COLUMNS,
      trips,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="trip-log-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
