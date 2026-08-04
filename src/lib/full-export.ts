import ExcelJS from "exceljs";

import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";

function isoDate(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

function isoDateTime(d: Date | null | undefined): string {
  return d ? d.toISOString() : "";
}

function boldHeader(sheet: ExcelJS.Worksheet) {
  sheet.getRow(1).font = { bold: true };
}

/**
 * Builds a single workbook with one sheet per table, covering every active
 * (non-archived) record in the database. Intended as a full, manually
 * triggered backup a human can read and re-key from if the platform's data
 * were ever lost — not a report, so every raw field is included rather than
 * a curated subset.
 */
export async function buildFullExportWorkbook(): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "C-FPFX Aircraft Manager";
  workbook.created = new Date();

  const [aircraft, pilots, vendors, costCategories, eventCategories, regulatorySettings, trips, costEntries, dutyLogs, calendarEvents, weeklyReports] =
    await Promise.all([
      prisma.aircraft.findMany(),
      prisma.pilot.findMany({ where: { archived: false }, orderBy: { name: "asc" } }),
      prisma.vendor.findMany({ where: { archived: false }, orderBy: { name: "asc" } }),
      prisma.costCategory.findMany({ where: { archived: false }, orderBy: [{ type: "asc" }, { sortOrder: "asc" }] }),
      prisma.eventCategory.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
      prisma.regulatorySettings.findMany(),
      prisma.trip.findMany({
        where: { archived: false },
        include: { pilot: true, secondPilot: true, passengers: { include: { passenger: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.costEntry.findMany({
        where: { archived: false },
        include: { category: true, vendor: true },
        orderBy: { date: "desc" },
      }),
      prisma.dutyDayLog.findMany({
        where: { archived: false },
        include: { pilot: true },
        orderBy: { date: "desc" },
      }),
      prisma.calendarEvent.findMany({
        where: { archived: false },
        include: { category: true, pilot: true },
        orderBy: { startDate: "desc" },
      }),
      prisma.weeklyReport.findMany({ where: { archived: false }, orderBy: { reportDate: "desc" } }),
    ]);

  // --- Aircraft ---
  const aircraftSheet = workbook.addWorksheet("Aircraft");
  aircraftSheet.columns = [
    { header: "Tail Number", key: "tailNumber", width: 14 },
    { header: "Type", key: "type", width: 16 },
    { header: "Base Airport", key: "baseAirport", width: 14 },
    { header: "Fiscal Year Start Month", key: "fyStart", width: 20 },
    { header: "Serial Number", key: "serial", width: 16 },
    { header: "Owner/Operator", key: "owner", width: 22 },
    { header: "Program Manager", key: "pm", width: 22 },
    { header: "Purchase Total Hours", key: "purchaseHours", width: 18 },
    { header: "Purchase Total Cycles", key: "purchaseCycles", width: 18 },
  ];
  boldHeader(aircraftSheet);
  for (const a of aircraft) {
    aircraftSheet.addRow({
      tailNumber: a.tailNumber,
      type: a.type,
      baseAirport: a.baseAirport,
      fyStart: a.fiscalYearStartMonth,
      serial: a.serialNumber ?? "",
      owner: a.ownerOperator ?? "",
      pm: a.programManager ?? "",
      purchaseHours: toNumber(a.purchaseTotalHours),
      purchaseCycles: a.purchaseTotalCycles,
    });
  }

  // --- Pilots ---
  const pilotSheet = workbook.addWorksheet("Pilots");
  pilotSheet.columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Added", key: "createdAt", width: 12 },
  ];
  boldHeader(pilotSheet);
  for (const p of pilots) pilotSheet.addRow({ name: p.name, createdAt: isoDate(p.createdAt) });

  // --- Vendors ---
  const vendorSheet = workbook.addWorksheet("Vendors");
  vendorSheet.columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Added", key: "createdAt", width: 12 },
  ];
  boldHeader(vendorSheet);
  for (const v of vendors) vendorSheet.addRow({ name: v.name, createdAt: isoDate(v.createdAt) });

  // --- Cost Categories ---
  const costCategorySheet = workbook.addWorksheet("Cost Categories");
  costCategorySheet.columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Type", key: "type", width: 10 },
    { header: "Sort Order", key: "sortOrder", width: 10 },
  ];
  boldHeader(costCategorySheet);
  for (const c of costCategories) costCategorySheet.addRow({ name: c.name, type: c.type, sortOrder: c.sortOrder });

  // --- Event Categories ---
  const eventCategorySheet = workbook.addWorksheet("Event Categories");
  eventCategorySheet.columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Color", key: "color", width: 10 },
    { header: "Sort Order", key: "sortOrder", width: 10 },
  ];
  boldHeader(eventCategorySheet);
  for (const c of eventCategories) eventCategorySheet.addRow({ name: c.name, color: c.color, sortOrder: c.sortOrder });

  // --- Regulatory Settings ---
  const regSheet = workbook.addWorksheet("Regulatory Settings");
  regSheet.columns = [
    { header: "Field", key: "field", width: 34 },
    { header: "Value", key: "value", width: 16 },
  ];
  boldHeader(regSheet);
  const reg = regulatorySettings[0];
  if (reg) {
    const fields: [string, string | number][] = [
      ["Max Flight Duty Hours", toNumber(reg.maxFlightDutyHours)],
      ["Extended Max Flight Duty Hours", toNumber(reg.extendedMaxFlightDutyHours)],
      ["Rolling 30-Day Flight Hours Limit (extension eligibility)", toNumber(reg.rolling30DayFlightHoursLimit)],
      ["Extension Rest Period Hours", toNumber(reg.extensionRestPeriodHours)],
      ["Min Rest Period Hours", toNumber(reg.minRestPeriodHours)],
      ["Rest Period Window Days", reg.restPeriodWindowDays],
      ["Split-Duty Max Extension Hours", toNumber(reg.splitDutyMaxExtensionHours)],
      ["Split-Duty Min Rest Hours", toNumber(reg.splitDutyMinRestHours)],
      ["Unforeseen Max Extension Hours", toNumber(reg.unforeseenMaxExtensionHours)],
      ["Unforeseen Max Duty Hours", toNumber(reg.unforeseenMaxDutyHours)],
      ["Currency Day Takeoffs Required", reg.currencyDayTakeoffsRequired],
      ["Currency Day Landings Required", reg.currencyDayLandingsRequired],
      ["Currency Night Takeoffs Required", reg.currencyNightTakeoffsRequired],
      ["Currency Night Landings Required", reg.currencyNightLandingsRequired],
      ["Currency Period Months", reg.currencyPeriodMonths],
      ["Instrument Approaches Required", reg.instrumentApproachesRequired],
      ["Instrument Approaches Period Months", reg.instrumentApproachesPeriodMonths],
      ["Flight Hours 30-Day Limit", toNumber(reg.flightHours30DayLimit)],
      ["Flight Hours 90-Day Limit", toNumber(reg.flightHours90DayLimit)],
      ["Flight Hours 12-Month Limit", toNumber(reg.flightHours12MonthLimit)],
    ];
    for (const [field, value] of fields) regSheet.addRow({ field, value });
  }

  // --- Trips ---
  const tripSheet = workbook.addWorksheet("Trips");
  tripSheet.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "End Date", key: "endDate", width: 12 },
    { header: "Status", key: "status", width: 10 },
    { header: "Simulator", key: "isSimulator", width: 10 },
    { header: "Departure", key: "departure", width: 12 },
    { header: "Arrival", key: "arrival", width: 12 },
    { header: "Route Label", key: "route", width: 22 },
    { header: "Hours", key: "hours", width: 10 },
    { header: "Cycles", key: "cycles", width: 8 },
    { header: "Miles", key: "miles", width: 10 },
    { header: "Pilot in Command", key: "pilot", width: 20 },
    { header: "Second in Command", key: "secondPilot", width: 20 },
    { header: "Takeoff Time (UTC)", key: "takeoffTime", width: 14 },
    { header: "Landing Time (UTC)", key: "landingTime", width: 14 },
    { header: "Day Takeoffs", key: "dayTakeoffs", width: 10 },
    { header: "Day Landings", key: "dayLandings", width: 10 },
    { header: "Night Takeoffs", key: "nightTakeoffs", width: 10 },
    { header: "Night Landings", key: "nightLandings", width: 10 },
    { header: "PIC Instrument Approaches", key: "picApproaches", width: 14 },
    { header: "SIC Instrument Approaches", key: "sicApproaches", width: 14 },
    { header: "Passengers", key: "passengers", width: 28 },
    { header: "Purpose", key: "purpose", width: 22 },
    { header: "Notes", key: "notes", width: 30 },
  ];
  boldHeader(tripSheet);
  for (const t of trips) {
    tripSheet.addRow({
      date: isoDate(t.date),
      endDate: isoDate(t.endDate),
      status: t.status,
      isSimulator: t.isSimulator ? "Yes" : "No",
      departure: t.departureAirport,
      arrival: t.arrivalAirport,
      route: t.routeLabel ?? "",
      hours: toNumber(t.hours),
      cycles: t.cycles,
      miles: t.miles,
      pilot: t.pilot?.name ?? "",
      secondPilot: t.secondPilot?.name ?? "",
      takeoffTime: t.takeoffTime !== null ? toNumber(t.takeoffTime) : "",
      landingTime: t.landingTime !== null ? toNumber(t.landingTime) : "",
      dayTakeoffs: t.dayTakeoffs,
      dayLandings: t.dayLandings,
      nightTakeoffs: t.nightTakeoffs,
      nightLandings: t.nightLandings,
      picApproaches: t.pilotInstrumentApproaches,
      sicApproaches: t.secondPilotInstrumentApproaches,
      passengers: t.passengers.map((p) => p.passenger.name).join("; "),
      purpose: t.purpose ?? "",
      notes: t.notes ?? "",
    });
  }

  // --- Cost Entries ---
  const costSheet = workbook.addWorksheet("Cost Entries");
  costSheet.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Category", key: "category", width: 20 },
    { header: "Type", key: "type", width: 10 },
    { header: "Vendor", key: "vendor", width: 22 },
    { header: "Invoice #", key: "invoice", width: 16 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Amount", key: "amount", width: 14 },
    { header: "Notes", key: "notes", width: 30 },
  ];
  boldHeader(costSheet);
  for (const c of costEntries) {
    costSheet.addRow({
      date: isoDate(c.date),
      category: c.category.name,
      type: c.category.type,
      vendor: c.vendor?.name ?? "",
      invoice: c.invoiceNumber ?? "",
      currency: c.currency,
      amount: toNumber(c.amount),
      notes: c.notes ?? "",
    });
  }
  costSheet.getColumn("amount").numFmt = "#,##0.00";

  // --- Duty Day Logs ---
  const dutySheet = workbook.addWorksheet("Duty Day Logs");
  dutySheet.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Pilot", key: "pilot", width: 20 },
    { header: "Duty Type", key: "dutyType", width: 10 },
    { header: "Report Time (UTC)", key: "reportTime", width: 20 },
    { header: "Duty End Time (UTC)", key: "dutyEndTime", width: 20 },
    { header: "Rest Before (hrs)", key: "restBefore", width: 14 },
    { header: "Split Duty Applied", key: "splitDuty", width: 14 },
    { header: "Split Duty Note", key: "splitDutyNote", width: 26 },
    { header: "Unforeseen Circumstances Applied", key: "unforeseen", width: 18 },
    { header: "Unforeseen Note", key: "unforeseenNote", width: 26 },
    { header: "Signed By", key: "signedBy", width: 18 },
    { header: "Signed At (UTC)", key: "signedAt", width: 20 },
    { header: "Notes", key: "notes", width: 30 },
  ];
  boldHeader(dutySheet);
  for (const d of dutyLogs) {
    dutySheet.addRow({
      date: isoDate(d.date),
      pilot: d.pilot.name,
      dutyType: d.dutyType,
      reportTime: isoDateTime(d.reportTime),
      dutyEndTime: isoDateTime(d.dutyEndTime),
      restBefore: toNumber(d.restPeriodBeforeHours),
      splitDuty: d.splitDutyApplied ? "Yes" : "No",
      splitDutyNote: d.splitDutyNote ?? "",
      unforeseen: d.unforeseenCircumstancesApplied ? "Yes" : "No",
      unforeseenNote: d.unforeseenCircumstancesNote ?? "",
      signedBy: d.unforeseenSignedByName ?? "",
      signedAt: isoDateTime(d.unforeseenSignedAt),
      notes: d.notes ?? "",
    });
  }

  // --- Calendar Events ---
  const eventSheet = workbook.addWorksheet("Calendar Events");
  eventSheet.columns = [
    { header: "Title", key: "title", width: 26 },
    { header: "Category", key: "category", width: 18 },
    { header: "Start Date", key: "startDate", width: 20 },
    { header: "End Date", key: "endDate", width: 20 },
    { header: "Pilot", key: "pilot", width: 20 },
    { header: "Notes", key: "notes", width: 30 },
  ];
  boldHeader(eventSheet);
  for (const e of calendarEvents) {
    eventSheet.addRow({
      title: e.title,
      category: e.category.name,
      startDate: isoDateTime(e.startDate),
      endDate: isoDateTime(e.endDate),
      pilot: e.pilot?.name ?? "",
      notes: e.notes ?? "",
    });
  }

  // --- Weekly Reports ---
  const weeklySheet = workbook.addWorksheet("Weekly Reports");
  weeklySheet.columns = [
    { header: "Report Date", key: "reportDate", width: 14 },
    { header: "Owner/Operator", key: "owner", width: 22 },
    { header: "Program Manager", key: "pm", width: 22 },
    { header: "Week Overview", key: "overview", width: 50 },
    { header: "Accomplishments", key: "accomplishments", width: 40 },
    { header: "New Issues", key: "newIssues", width: 40 },
    { header: "To Be Completed", key: "toBeCompleted", width: 40 },
    { header: "Customer Decisions", key: "customerDecisions", width: 40 },
    { header: "Maintenance Items", key: "maintenance", width: 40 },
  ];
  boldHeader(weeklySheet);
  for (const r of weeklyReports) {
    const maintenanceItems = (r.maintenanceItems as unknown as { description: string; due: string }[]) ?? [];
    weeklySheet.addRow({
      reportDate: isoDate(r.reportDate),
      owner: r.ownerOperator ?? "",
      pm: r.programManager ?? "",
      overview: r.weekOverview,
      accomplishments: r.accomplishments.join("; "),
      newIssues: r.newIssues.join("; "),
      toBeCompleted: r.toBeCompleted.join("; "),
      customerDecisions: r.customerDecisions.join("; "),
      maintenance: maintenanceItems.map((m) => `${m.description} (due ${m.due})`).join("; "),
    });
  }

  return workbook;
}
