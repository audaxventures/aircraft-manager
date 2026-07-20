import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getAllPilotsCurrency, getPilotCurrency, getCurrencyThresholds } from "@/lib/currency";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { CurrencyReport } from "@/lib/pdf/currency-report";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pilotId = searchParams.get("pilotId") || undefined;

  const thresholds = await getCurrencyThresholds();
  const aircraft = await getPrimaryAircraft();

  const currencies = pilotId
    ? [await getPilotCurrency(pilotId, thresholds)].filter((c) => c !== null)
    : await getAllPilotsCurrency(thresholds);

  const buffer = await renderToBuffer(
    CurrencyReport({
      aircraftTailNumber: aircraft?.tailNumber ?? "—",
      currencies,
      thresholds,
      generatedAt: new Date(),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pilot-currency-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
