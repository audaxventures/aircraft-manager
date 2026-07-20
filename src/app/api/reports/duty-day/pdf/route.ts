import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getDutyDayLogs } from "@/lib/duty";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { prisma } from "@/lib/db";
import { DutyDayReport } from "@/lib/pdf/duty-day-report";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pilotId = searchParams.get("pilotId") || undefined;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(new Date(toParam).getTime() + 86400000) : undefined;

  const [logs, aircraft, pilot] = await Promise.all([
    getDutyDayLogs({ pilotId, from, to }),
    getPrimaryAircraft(),
    pilotId ? prisma.pilot.findUnique({ where: { id: pilotId } }) : Promise.resolve(null),
  ]);

  const buffer = await renderToBuffer(
    DutyDayReport({
      aircraftTailNumber: aircraft?.tailNumber ?? "—",
      pilotName: pilot?.name ?? "All pilots",
      from: from ?? null,
      to: toParam ? new Date(toParam) : null,
      logs,
      generatedAt: new Date(),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="duty-day-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
