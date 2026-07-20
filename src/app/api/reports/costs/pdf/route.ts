import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getCostEntries } from "@/lib/costs";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { prisma } from "@/lib/db";
import { CostEntriesReport } from "@/lib/pdf/cost-entries-report";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "FIXED" || searchParams.get("type") === "DIRECT" ? (searchParams.get("type") as "FIXED" | "DIRECT") : undefined;
  const vendorId = searchParams.get("vendor") || undefined;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(new Date(toParam).getTime() + 86400000) : undefined;

  const [entries, aircraft, vendor] = await Promise.all([
    getCostEntries({ from, to, type, vendorId }),
    getPrimaryAircraft(),
    vendorId ? prisma.vendor.findUnique({ where: { id: vendorId } }) : Promise.resolve(null),
  ]);

  const title = type === "FIXED" ? "Fixed Costs" : type === "DIRECT" ? "Direct / Operating Costs" : "All Costs";

  const buffer = await renderToBuffer(
    CostEntriesReport({
      aircraftTailNumber: aircraft?.tailNumber ?? "—",
      title,
      from: from ?? null,
      to: toParam ? new Date(toParam) : null,
      vendorName: vendor?.name ?? null,
      entries,
      generatedAt: new Date(),
    })
  );

  const slug = type ? type.toLowerCase() : "all";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}-costs-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
