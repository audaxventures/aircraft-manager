import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getCalendarMonth } from "@/lib/schedule";
import { getEventCategories } from "@/lib/settings";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { ScheduleReport } from "@/lib/pdf/schedule-report";

function parseYearMonth(token: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{1,2})$/.exec(token.trim());
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  if (month < 0 || month > 11) return null;
  return { year, month };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const now = new Date();

  const monthsParam = searchParams.get("months");
  let targets: { year: number; month: number }[];
  if (monthsParam) {
    targets = monthsParam
      .split(",")
      .map(parseYearMonth)
      .filter((t): t is { year: number; month: number } => t !== null);
  } else {
    const year = parseInt(searchParams.get("year") ?? String(now.getUTCFullYear()), 10);
    const month = parseInt(searchParams.get("month") ?? String(now.getUTCMonth() + 1), 10) - 1;
    targets = [{ year, month }];
  }
  if (targets.length === 0) targets = [{ year: now.getUTCFullYear(), month: now.getUTCMonth() }];

  const [monthsData, categories, aircraft] = await Promise.all([
    Promise.all(targets.map(async (t) => ({ ...t, items: await getCalendarMonth(t.year, t.month) }))),
    getEventCategories(),
    getPrimaryAircraft(),
  ]);

  const buffer = await renderToBuffer(
    ScheduleReport({
      aircraftTailNumber: aircraft?.tailNumber ?? "—",
      months: monthsData,
      categoryLegend: categories.map((c) => ({ name: c.name, color: c.color })),
    })
  );

  const filenameSuffix =
    targets.length === 1
      ? `${targets[0].year}-${String(targets[0].month + 1).padStart(2, "0")}`
      : `${targets.length}-months`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="schedule-${filenameSuffix}.pdf"`,
    },
  });
}
