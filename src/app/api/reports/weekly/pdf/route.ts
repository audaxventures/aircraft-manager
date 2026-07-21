import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getWeeklyReport } from "@/lib/weekly-reports";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { WeeklyReportPdf } from "@/lib/pdf/weekly-report";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });

  const [report, aircraft] = await Promise.all([getWeeklyReport(id), getPrimaryAircraft()]);
  if (!report) return new NextResponse("Report not found", { status: 404 });

  const buffer = await renderToBuffer(
    WeeklyReportPdf({
      aircraftTailNumber: aircraft?.tailNumber ?? "—",
      aircraftType: aircraft?.type ?? "—",
      serialNumber: aircraft?.serialNumber ?? "",
      report,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="weekly-status-report-${report.reportDate.toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
