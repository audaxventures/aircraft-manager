import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getMonthlySummaryGrid } from "@/lib/costs";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { MonthlySummaryReport } from "@/lib/pdf/monthly-summary-report";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()), 10);

  const [grid, aircraft] = await Promise.all([getMonthlySummaryGrid(year), getPrimaryAircraft()]);

  const buffer = await renderToBuffer(
    MonthlySummaryReport({
      aircraftTailNumber: aircraft?.tailNumber ?? "—",
      year,
      grid,
      generatedAt: new Date(),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="monthly-cost-summary-${year}.pdf"`,
    },
  });
}
