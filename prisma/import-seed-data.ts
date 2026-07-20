/**
 * One-time historical data migration for C-FPFX.
 *
 * Imports:
 *   - PFX-trips-2026.csv        -> Trip, Passenger, TripPassenger
 *   - seed_data/{vendor}.csv    -> CostEntry (itemized, per invoice)
 *   - seed_data/Summary.csv     -> CostEntry (Fixed categories, monthly aggregates —
 *                                  no itemized ledger exists for these in the source data)
 *
 * Then cross-checks computed monthly totals against Summary.csv's own declared
 * totals and prints/writes a discrepancy report — this both validates the
 * import and surfaces the source spreadsheet's pre-existing errors.
 *
 * Usage:
 *   npx tsx prisma/import-seed-data.ts            # imports (aborts if data already present)
 *   npx tsx prisma/import-seed-data.ts --reset     # wipes prior Trip/CostEntry/Passenger data first
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import Papa from "papaparse";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const ROOT = path.resolve(__dirname, "..");
const SEED_DIR = path.join(ROOT, "seed_data");
const TRIPS_CSV = path.join(ROOT, "PFX-trips-2026.csv");

const MONTH_INDEX: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FISCAL_YEAR = 2026;

interface ReportEntry {
  source: string;
  row: number;
  issue: string;
  detail: string;
}

const report = {
  imported: [] as string[],
  skippedBlank: 0,
  flags: [] as ReportEntry[],
  discrepancies: [] as string[],
  assumptions: [] as string[],
};

// ---------- shared parsing helpers ----------

/** Vendor sheets mix "Jan"-style month abbreviations with full ISO datetimes. */
function parseVendorMonth(raw: string): Date | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));

  const key = trimmed.slice(0, 3).toLowerCase();
  if (key in MONTH_INDEX) return new Date(Date.UTC(FISCAL_YEAR, MONTH_INDEX[key], 1));

  return null;
}

/**
 * Coerces a raw cost cell to a number. Returns:
 *   - a finite number on success
 *   - null if the cell is blank/missing (nothing to import)
 *   - NaN if the cell has content that could not be parsed (must be flagged, never dropped silently)
 * Handles the source bug where at least one amount is stored as text with a
 * leading backtick/apostrophe (e.g. "`689.45"), which would otherwise drop
 * out of a SUM in the original spreadsheet.
 */
function parseCost(raw: string): number | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  const cleaned = trimmed.replace(/^[`']/, "").replace(/[$,]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function isRowBlank(cells: string[]): boolean {
  return cells.every((c) => (c ?? "").trim() === "");
}

function readCsvRows(filePath: string): string[][] {
  const text = fs.readFileSync(filePath, "utf-8");
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false });
  return parsed.data as string[][];
}

// ---------- trips ----------

async function importTrips() {
  const text = fs.readFileSync(TRIPS_CSV, "utf-8");
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });

  const passengerCache = new Map<string, string>(); // name -> id
  let tripCount = 0;
  let dayDefaultedCount = 0;

  for (const [i, row] of parsed.data.entries()) {
    const date = new Date(`${row.Date}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      report.flags.push({ source: "PFX-trips-2026.csv", row: i + 2, issue: "PARSE ERROR", detail: `Unparseable date: "${row.Date}"` });
      continue;
    }

    const hours = parseFloat(row.Hours);
    const cycles = parseInt(row.Cycles, 10) || 0;
    const miles = parseInt(row.Miles, 10) || 0;

    // Historical trips don't record a day/night takeoff/landing split — the
    // source CSV only has a single "Cycles" count. Defaulting to all-day
    // rather than fabricating a night figure; flagged once below so it's
    // easy to correct manually for any flights that were actually at night.
    if (cycles > 0) dayDefaultedCount++;

    const trip = await prisma.trip.create({
      data: {
        date,
        departureAirport: row.Departure || row.Route?.split(" - ")[0] || "Unknown",
        arrivalAirport: row.Arrival || row.Route?.split(" - ")[1] || "Unknown",
        routeLabel: row.Route || null,
        hours: Number.isFinite(hours) ? hours : 0,
        cycles,
        miles,
        purpose: row.Purpose || null,
        notes: row.Notes || null,
        dayTakeoffs: cycles,
        dayLandings: cycles,
        nightTakeoffs: 0,
        nightLandings: 0,
      },
    });
    tripCount++;

    const passengerNames = (row.Passengers ?? "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    for (const name of passengerNames) {
      let passengerId = passengerCache.get(name);
      if (!passengerId) {
        const passenger = await prisma.passenger.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        passengerId = passenger.id;
        passengerCache.set(name, passengerId);
      }
      await prisma.tripPassenger.create({ data: { tripId: trip.id, passengerId } });
    }
  }

  if (dayDefaultedCount > 0) {
    report.assumptions.push(
      `${dayDefaultedCount} imported trips had no day/night takeoff-landing breakdown in the source data and were defaulted to all-day cycles. Review and correct any that were actually flown at night — this affects night currency calculations.`
    );
  }

  report.imported.push(`${tripCount} trips imported from PFX-trips-2026.csv (${passengerCache.size} unique passengers)`);
}

// ---------- vendor cost ledgers ----------

const VENDOR_FILES: { file: string; category: string }[] = [
  { file: "Nav_Canada.csv", category: "Nav Canada" },
  { file: "Fuel.csv", category: "Fuel" },
  { file: "Maint.csv", category: "Maintenance" },
  { file: "WAA.csv", category: "WAA" },
  { file: "Fast_Air.csv", category: "Fast Air" },
  { file: "RRCC.csv", category: "RRCC" },
  { file: "Gogo.csv", category: "Gogo" },
];

async function importVendorSheet(fileName: string, categoryName: string) {
  const filePath = path.join(SEED_DIR, fileName);
  const rows = readCsvRows(filePath);
  const category = await prisma.costCategory.findUniqueOrThrow({ where: { name: categoryName } });

  let imported = 0;
  let skippedNoCost = 0;

  // Data starts at row index 3 (0-indexed): title, blank/pivot marker, header.
  for (let i = 3; i < rows.length; i++) {
    const cells = rows[i] ?? [];
    const [invoice, month, cost, notes] = cells;
    if (isRowBlank([invoice, month, cost, notes])) continue;

    const date = parseVendorMonth(month);
    if (!date) {
      report.flags.push({ source: fileName, row: i + 1, issue: "PARSE ERROR", detail: `Unparseable month/date: "${month}"` });
      continue;
    }

    const amount = parseCost(cost);
    if (amount === null) {
      skippedNoCost++;
      continue;
    }
    if (Number.isNaN(amount)) {
      report.flags.push({ source: fileName, row: i + 1, issue: "PARSE ERROR", detail: `Unparseable cost value: "${cost}"` });
      continue;
    }

    await prisma.costEntry.create({
      data: {
        date,
        categoryId: category.id,
        invoiceNumber: (invoice ?? "").trim() || null,
        amount,
        notes: (notes ?? "").trim() || null,
      },
    });
    imported++;
  }

  if (skippedNoCost > 0) {
    report.flags.push({
      source: fileName,
      row: 0,
      issue: "INFO",
      detail: `${skippedNoCost} row(s) had an invoice/date but no cost value — skipped, not imported as $0.`,
    });
  }

  report.imported.push(`${imported} cost entries imported from ${fileName} -> "${categoryName}"`);
}

// ---------- Summary.csv: fixed category aggregates + cross-check source ----------

interface SummaryData {
  fixed: Record<string, number[]>; // categoryName -> [12 months]
  direct: Record<string, number[]>;
}

function parseSummaryCsv(): SummaryData {
  const rows = readCsvRows(path.join(SEED_DIR, "Summary.csv"));
  // Row index 4 (0-indexed) is the header: ,Hours,Miles,Hangar,Pilot Salary,Insurance,Training,
  //   Publications,Total,,Nav Canada,Crew Exp.,Catering,Prk/cus/ldg,Maintenance,Fuel,WAA,Fast Air,RRCC,TOTAL
  const header = rows[4];
  const monthRows = rows.slice(5, 17); // Jan..Dec

  const colIndex = (label: string) => header.findIndex((h) => (h ?? "").trim() === label);

  const fixedCols: Record<string, number> = {
    Hangar: colIndex("Hangar"),
    "Pilot Salary": colIndex("Pilot Salary"),
    Insurance: colIndex("Insurance"),
    Training: colIndex("Training"),
    Publications: colIndex("Publications"),
  };
  const directCols: Record<string, number> = {
    "Nav Canada": colIndex("Nav Canada"),
    Maintenance: colIndex("Maintenance"),
    Fuel: colIndex("Fuel"),
    WAA: colIndex("WAA"),
    "Fast Air": colIndex("Fast Air"),
    RRCC: colIndex("RRCC"),
  };

  function extract(cols: Record<string, number>): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    for (const [name, idx] of Object.entries(cols)) {
      result[name] = monthRows.map((r) => {
        const raw = idx >= 0 ? r[idx] : "";
        const n = parseFloat((raw ?? "").trim());
        return Number.isFinite(n) ? n : 0;
      });
    }
    return result;
  }

  return { fixed: extract(fixedCols), direct: extract(directCols) };
}

async function importFixedFromSummary(summary: SummaryData) {
  let imported = 0;
  for (const [categoryName, monthly] of Object.entries(summary.fixed)) {
    const category = await prisma.costCategory.findUniqueOrThrow({ where: { name: categoryName } });
    for (let m = 0; m < 12; m++) {
      const amount = monthly[m];
      if (!amount) continue; // no recorded aggregate for this month — nothing to enter
      await prisma.costEntry.create({
        data: {
          date: new Date(Date.UTC(FISCAL_YEAR, m, 1)),
          categoryId: category.id,
          amount,
          notes: "Imported from Summary sheet (monthly aggregate — no itemized invoices available in source data)",
        },
      });
      imported++;
    }
  }
  report.imported.push(`${imported} fixed-cost monthly aggregates imported from Summary.csv (Hangar, Pilot Salary, Insurance, Training, Publications)`);
  report.assumptions.push(
    "Fixed costs (Hangar, Pilot Salary, Insurance, Training, Publications) have no itemized source ledger — only Summary.csv's monthly totals. One aggregate CostEntry per non-zero month was created per category instead of itemized invoices."
  );
}

async function crossCheckAgainstSummary(summary: SummaryData) {
  const allCategories = { ...summary.fixed, ...summary.direct };

  for (const [categoryName, monthly] of Object.entries(allCategories)) {
    const category = await prisma.costCategory.findUnique({ where: { name: categoryName } });
    if (!category) continue;

    for (let m = 0; m < 12; m++) {
      const start = new Date(Date.UTC(FISCAL_YEAR, m, 1));
      const end = new Date(Date.UTC(FISCAL_YEAR, m + 1, 1));
      const agg = await prisma.costEntry.aggregate({
        where: { categoryId: category.id, date: { gte: start, lt: end } },
        _sum: { amount: true },
      });
      const computed = agg._sum.amount ? Number(agg._sum.amount) : 0;
      const expected = monthly[m];

      if (Math.abs(computed - expected) > 0.01) {
        report.discrepancies.push(
          `${MONTH_LABELS[m]} ${categoryName}: Summary sheet says ${expected.toFixed(2)}, computed from imported entries is ${computed.toFixed(2)} (diff ${(computed - expected).toFixed(2)})`
        );
      }
    }
  }

  report.assumptions.push(
    "Crew Expenses, Catering, and Parking/Customs/Landing have Summary.csv columns but no vendor ledger file was provided — Summary shows $0 for all months in these three categories, consistent with no entries being imported for them."
  );
  report.assumptions.push(
    'Gogo.csv\'s own internal title cell reads "Nav Canada" (apparently a copy-paste leftover in the source spreadsheet) but its filename and the shape of its data (small monthly subscription charges) match Gogo, not Nav Canada — mapped by filename per the migration spec. Verify the few Gogo entries if in doubt.'
  );
  report.assumptions.push(
    "Summary.csv's own Direct TOTAL column and the four cost-per-hour/cost-per-mile note rows were blank in the source spreadsheet (the bug this app replaces) — nothing to reconcile there; the app now computes these live."
  );
}

// ---------- orchestration ----------

async function alreadyImported(): Promise<boolean> {
  const [tripCount, costCount] = await Promise.all([prisma.trip.count(), prisma.costEntry.count()]);
  return tripCount > 0 || costCount > 0;
}

async function reset() {
  await prisma.tripPassenger.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.passenger.deleteMany({});
  await prisma.costEntry.deleteMany({});
  console.log("Reset: cleared existing Trip, Passenger, and CostEntry data.\n");
}

async function main() {
  const shouldReset = process.argv.includes("--reset");

  if (await alreadyImported()) {
    if (!shouldReset) {
      console.error("Trips or cost entries already exist. Re-run with --reset to wipe and re-import, or clear the database manually.");
      process.exit(1);
    }
    await reset();
  }

  console.log("Importing trips...");
  await importTrips();

  console.log("Importing vendor cost ledgers...");
  for (const { file, category } of VENDOR_FILES) {
    await importVendorSheet(file, category);
  }

  console.log("Importing fixed-cost aggregates from Summary.csv...");
  const summary = parseSummaryCsv();
  await importFixedFromSummary(summary);

  console.log("Cross-checking computed totals against Summary.csv...");
  await crossCheckAgainstSummary(summary);

  // ---- report ----
  const lines: string[] = [];
  lines.push(`# Import report — ${new Date().toISOString()}`, "");
  lines.push("## Imported", ...report.imported.map((l) => `- ${l}`), "");
  lines.push("## Flags (parse errors / skipped rows requiring review)");
  if (report.flags.length === 0) lines.push("- None");
  else lines.push(...report.flags.map((f) => `- [${f.issue}] ${f.source} row ${f.row}: ${f.detail}`));
  lines.push("");
  lines.push("## Discrepancies vs Summary.csv (validates import + surfaces source spreadsheet errors)");
  if (report.discrepancies.length === 0) lines.push("- None found");
  else lines.push(...report.discrepancies.map((d) => `- ${d}`));
  lines.push("");
  lines.push("## Assumptions & known limitations", ...report.assumptions.map((a) => `- ${a}`), "");

  const reportPath = path.join(ROOT, "import-report.md");
  fs.writeFileSync(reportPath, lines.join("\n"));

  console.log("\n" + lines.join("\n"));
  console.log(`\nFull report written to ${reportPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
