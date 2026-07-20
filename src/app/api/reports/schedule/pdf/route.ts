import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getCalendarMonth } from "@/lib/schedule";
import { getEventCategories } from "@/lib/settings";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { ScheduleReport } from "@/lib/pdf/schedule-report";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getUTCFullYear()), 10);
  const month = parseInt(searchParams.get("month") ?? String(now.getUTCMonth() + 1), 10) - 1;

  const [items, categories, aircraft] = await Promise.all([
    getCalendarMonth(year, month),
    getEventCategories(),
    getPrimaryAircraft(),
  ]);

  const buffer = await renderToBuffer(
    ScheduleReport({
      aircraftTailNumber: aircraft?.tailNumber ?? "—",
      year,
      month,
      items,
      categoryLegend: categories.map((c) => ({ name: c.name, color: c.color })),
      generatedAt: new Date(),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="schedule-${year}-${String(month + 1).padStart(2, "0")}.pdf"`,
    },
  });
}
