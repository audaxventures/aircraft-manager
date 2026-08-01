import { NextResponse } from "next/server";

import { buildFullExportWorkbook } from "@/lib/full-export";

export async function GET() {
  const workbook = await buildFullExportWorkbook();
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="c-fpfx-full-export-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
