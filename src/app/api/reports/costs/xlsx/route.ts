import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { getCostEntries } from "@/lib/costs";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { prisma } from "@/lib/db";

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

  const title = type === "FIXED" ? "Fixed Costs" : type === "DIRECT" ? "Direct-Operating Costs" : "All Costs";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "C-FPFX Aircraft Manager";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.slice(0, 31));

  sheet.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Category", key: "category", width: 20 },
    { header: "Type", key: "type", width: 10 },
    { header: "Vendor", key: "vendor", width: 22 },
    { header: "Invoice #", key: "invoice", width: 16 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Amount", key: "amount", width: 14 },
    { header: "Notes", key: "notes", width: 30 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const e of entries) {
    sheet.addRow({
      date: e.date.toISOString().slice(0, 10),
      category: e.categoryName,
      type: e.categoryType === "FIXED" ? "Fixed" : "Direct",
      vendor: e.vendorName ?? "",
      invoice: e.invoiceNumber ?? "",
      currency: e.currency,
      amount: e.amount,
      notes: e.notes ?? "",
    });
  }

  sheet.getColumn("amount").numFmt = "#,##0.00";

  const totalsByCurrency = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.currency] = (acc[e.currency] ?? 0) + e.amount;
    return acc;
  }, {});

  sheet.addRow({});
  for (const [currency, total] of Object.entries(totalsByCurrency)) {
    const row = sheet.addRow({ category: `Total (${currency})`, amount: total });
    row.font = { bold: true };
    row.getCell("amount").numFmt = "#,##0.00";
  }

  const metaRow = sheet.addRow({});
  metaRow.getCell("category").value = `${aircraft?.tailNumber ?? ""} · ${vendor ? `Vendor: ${vendor.name}` : "All vendors"} · Generated ${new Date().toISOString().slice(0, 10)}`;
  metaRow.font = { italic: true, size: 9, color: { argb: "FF737373" } };

  const buffer = await workbook.xlsx.writeBuffer();
  const slug = type ? type.toLowerCase() : "all";

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${slug}-costs-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
