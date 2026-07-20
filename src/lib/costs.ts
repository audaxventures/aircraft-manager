import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";
import { getTripHoursAndMiles } from "@/lib/trips";

export type Currency = "CAD" | "USD";
export const CURRENCIES: Currency[] = ["CAD", "USD"];

export type CurrencyAmounts = Record<Currency, number>;
export type CurrencyRates = Record<Currency, number | null>;

function zeroAmounts(): CurrencyAmounts {
  return { CAD: 0, USD: 0 };
}

export interface CostEntryDto {
  id: string;
  date: Date;
  categoryId: string;
  categoryName: string;
  categoryType: "FIXED" | "DIRECT";
  vendorId: string | null;
  vendorName: string | null;
  invoiceNumber: string | null;
  amount: number;
  currency: Currency;
  notes: string | null;
  attachmentCount: number;
}

export interface CostFilters {
  from?: Date;
  to?: Date;
  categoryId?: string;
  type?: "FIXED" | "DIRECT";
  vendorId?: string;
  currency?: Currency;
}

function buildWhere(filters: CostFilters) {
  return {
    ...(filters.from || filters.to
      ? {
          date: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lt: filters.to } : {}),
          },
        }
      : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.type ? { category: { type: filters.type } } : {}),
    ...(filters.vendorId ? { vendorId: filters.vendorId } : {}),
    ...(filters.currency ? { currency: filters.currency } : {}),
  };
}

export async function getCostEntries(filters: CostFilters = {}): Promise<CostEntryDto[]> {
  const entries = await prisma.costEntry.findMany({
    where: buildWhere(filters),
    include: { category: true, vendor: true, _count: { select: { attachments: true } } },
    orderBy: { date: "desc" },
  });

  return entries.map((e) => ({
    id: e.id,
    date: e.date,
    categoryId: e.categoryId,
    categoryName: e.category.name,
    categoryType: e.category.type,
    vendorId: e.vendorId,
    vendorName: e.vendor?.name ?? null,
    invoiceNumber: e.invoiceNumber,
    amount: toNumber(e.amount),
    currency: e.currency,
    notes: e.notes,
    attachmentCount: e._count.attachments,
  }));
}

export interface CostSummary {
  fixedTotal: CurrencyAmounts;
  directTotal: CurrencyAmounts;
  total: CurrencyAmounts;
  byCategory: { categoryId: string; name: string; type: "FIXED" | "DIRECT"; total: CurrencyAmounts }[];
}

export async function getCostSummary(range?: { start: Date; end: Date }, vendorId?: string): Promise<CostSummary> {
  const categories = await prisma.costCategory.findMany({
    include: {
      entries: {
        where: {
          ...(range ? { date: { gte: range.start, lt: range.end } } : {}),
          ...(vendorId ? { vendorId } : {}),
        },
        select: { amount: true, currency: true },
      },
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });

  const byCategory = categories.map((c) => {
    const total = zeroAmounts();
    for (const e of c.entries) total[e.currency] += toNumber(e.amount);
    return { categoryId: c.id, name: c.name, type: c.type, total };
  });

  const fixedTotal = zeroAmounts();
  const directTotal = zeroAmounts();
  for (const c of byCategory) {
    const target = c.type === "FIXED" ? fixedTotal : directTotal;
    target.CAD += c.total.CAD;
    target.USD += c.total.USD;
  }
  const total: CurrencyAmounts = { CAD: fixedTotal.CAD + directTotal.CAD, USD: fixedTotal.USD + directTotal.USD };

  return { fixedTotal, directTotal, total, byCategory };
}

export interface CostPerMetrics {
  hours: number;
  miles: number;
  fixedTotal: CurrencyAmounts;
  directTotal: CurrencyAmounts;
  total: CurrencyAmounts;
  fixedCostPerHour: CurrencyRates;
  directCostPerHour: CurrencyRates;
  totalCostPerHour: CurrencyRates;
  directCostPerMile: CurrencyRates;
  totalCostPerMile: CurrencyRates;
}

export async function getCostPerMetrics(range?: { start: Date; end: Date }, vendorId?: string): Promise<CostPerMetrics> {
  const [summary, flying] = await Promise.all([getCostSummary(range, vendorId), getTripHoursAndMiles(range)]);

  const div = (numerator: number, denominator: number) => (denominator > 0 ? numerator / denominator : null);
  const perHour = (amt: CurrencyAmounts): CurrencyRates => ({ CAD: div(amt.CAD, flying.hours), USD: div(amt.USD, flying.hours) });
  const perMile = (amt: CurrencyAmounts): CurrencyRates => ({ CAD: div(amt.CAD, flying.miles), USD: div(amt.USD, flying.miles) });

  return {
    hours: flying.hours,
    miles: flying.miles,
    fixedTotal: summary.fixedTotal,
    directTotal: summary.directTotal,
    total: summary.total,
    fixedCostPerHour: perHour(summary.fixedTotal),
    directCostPerHour: perHour(summary.directTotal),
    totalCostPerHour: perHour(summary.total),
    directCostPerMile: perMile(summary.directTotal),
    totalCostPerMile: perMile(summary.total),
  };
}

export interface MonthlyGridRow {
  monthIndex: number;
  monthLabel: string;
  hours: number;
  miles: number;
  byCategory: Record<string, number>;
  fixedTotal: number;
  directTotal: number;
  total: number;
}

export interface MonthlyGrid {
  categories: { id: string; name: string; type: "FIXED" | "DIRECT" }[];
  rows: MonthlyGridRow[];
  yearTotal: MonthlyGridRow;
  currency: Currency;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getMonthlySummaryGrid(
  year: number,
  options: { currency?: Currency; vendorId?: string } = {}
): Promise<MonthlyGrid> {
  const currency = options.currency ?? "CAD";
  const categories = await prisma.costCategory.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });

  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const [entries, trips] = await Promise.all([
    prisma.costEntry.findMany({
      where: { date: { gte: start, lt: end }, currency, ...(options.vendorId ? { vendorId: options.vendorId } : {}) },
      select: { date: true, categoryId: true, amount: true },
    }),
    prisma.trip.findMany({
      where: { date: { gte: start, lt: end } },
      select: { date: true, hours: true, miles: true },
    }),
  ]);

  const rows: MonthlyGridRow[] = MONTH_LABELS.map((label, i) => ({
    monthIndex: i,
    monthLabel: label,
    hours: 0,
    miles: 0,
    byCategory: Object.fromEntries(categories.map((c) => [c.id, 0])),
    fixedTotal: 0,
    directTotal: 0,
    total: 0,
  }));

  const categoryTypeById = new Map(categories.map((c) => [c.id, c.type]));

  for (const entry of entries) {
    const m = entry.date.getUTCMonth();
    const amount = toNumber(entry.amount);
    rows[m].byCategory[entry.categoryId] = (rows[m].byCategory[entry.categoryId] ?? 0) + amount;
    if (categoryTypeById.get(entry.categoryId) === "FIXED") rows[m].fixedTotal += amount;
    else rows[m].directTotal += amount;
    rows[m].total += amount;
  }

  for (const trip of trips) {
    const m = trip.date.getUTCMonth();
    rows[m].hours += toNumber(trip.hours);
    rows[m].miles += trip.miles;
  }

  const yearTotal: MonthlyGridRow = {
    monthIndex: -1,
    monthLabel: "Total",
    hours: rows.reduce((s, r) => s + r.hours, 0),
    miles: rows.reduce((s, r) => s + r.miles, 0),
    byCategory: Object.fromEntries(
      categories.map((c) => [c.id, rows.reduce((s, r) => s + (r.byCategory[c.id] ?? 0), 0)])
    ),
    fixedTotal: rows.reduce((s, r) => s + r.fixedTotal, 0),
    directTotal: rows.reduce((s, r) => s + r.directTotal, 0),
    total: rows.reduce((s, r) => s + r.total, 0),
  };

  return {
    categories: categories.map((c) => ({ id: c.id, name: c.name, type: c.type })),
    rows,
    yearTotal,
    currency,
  };
}

export async function getAvailableCostYears(): Promise<number[]> {
  const [entryYears, tripYears] = await Promise.all([
    prisma.$queryRaw<{ year: number }[]>`SELECT DISTINCT EXTRACT(YEAR FROM date)::int AS year FROM "CostEntry"`,
    prisma.$queryRaw<{ year: number }[]>`SELECT DISTINCT EXTRACT(YEAR FROM date)::int AS year FROM "Trip"`,
  ]);
  const years = new Set<number>([new Date().getUTCFullYear()]);
  for (const r of entryYears) years.add(r.year);
  for (const r of tripYears) years.add(r.year);
  return Array.from(years).sort((a, b) => b - a);
}
