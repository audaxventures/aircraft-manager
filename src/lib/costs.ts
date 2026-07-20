import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/format";
import { getTripHoursAndMiles } from "@/lib/trips";

export interface CostEntryDto {
  id: string;
  date: Date;
  categoryId: string;
  categoryName: string;
  categoryType: "FIXED" | "DIRECT";
  vendor: string | null;
  invoiceNumber: string | null;
  amount: number;
  notes: string | null;
  attachmentCount: number;
}

export interface CostFilters {
  from?: Date;
  to?: Date;
  categoryId?: string;
  type?: "FIXED" | "DIRECT";
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
  };
}

export async function getCostEntries(filters: CostFilters = {}): Promise<CostEntryDto[]> {
  const entries = await prisma.costEntry.findMany({
    where: buildWhere(filters),
    include: { category: true, _count: { select: { attachments: true } } },
    orderBy: { date: "desc" },
  });

  return entries.map((e) => ({
    id: e.id,
    date: e.date,
    categoryId: e.categoryId,
    categoryName: e.category.name,
    categoryType: e.category.type,
    vendor: e.vendor,
    invoiceNumber: e.invoiceNumber,
    amount: toNumber(e.amount),
    notes: e.notes,
    attachmentCount: e._count.attachments,
  }));
}

export interface CostSummary {
  fixedTotal: number;
  directTotal: number;
  total: number;
  byCategory: { categoryId: string; name: string; type: "FIXED" | "DIRECT"; total: number }[];
}

export async function getCostSummary(range?: { start: Date; end: Date }): Promise<CostSummary> {
  const categories = await prisma.costCategory.findMany({
    include: {
      entries: {
        where: range ? { date: { gte: range.start, lt: range.end } } : undefined,
        select: { amount: true },
      },
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });

  const byCategory = categories.map((c) => ({
    categoryId: c.id,
    name: c.name,
    type: c.type,
    total: c.entries.reduce((sum, e) => sum + toNumber(e.amount), 0),
  }));

  const fixedTotal = byCategory.filter((c) => c.type === "FIXED").reduce((s, c) => s + c.total, 0);
  const directTotal = byCategory.filter((c) => c.type === "DIRECT").reduce((s, c) => s + c.total, 0);

  return { fixedTotal, directTotal, total: fixedTotal + directTotal, byCategory };
}

export interface CostPerMetrics {
  hours: number;
  miles: number;
  fixedTotal: number;
  directTotal: number;
  total: number;
  fixedCostPerHour: number | null;
  directCostPerHour: number | null;
  totalCostPerHour: number | null;
  directCostPerMile: number | null;
  totalCostPerMile: number | null;
}

export async function getCostPerMetrics(range?: { start: Date; end: Date }): Promise<CostPerMetrics> {
  const [summary, flying] = await Promise.all([getCostSummary(range), getTripHoursAndMiles(range)]);

  const div = (numerator: number, denominator: number) => (denominator > 0 ? numerator / denominator : null);

  return {
    hours: flying.hours,
    miles: flying.miles,
    fixedTotal: summary.fixedTotal,
    directTotal: summary.directTotal,
    total: summary.total,
    fixedCostPerHour: div(summary.fixedTotal, flying.hours),
    directCostPerHour: div(summary.directTotal, flying.hours),
    totalCostPerHour: div(summary.total, flying.hours),
    directCostPerMile: div(summary.directTotal, flying.miles),
    totalCostPerMile: div(summary.total, flying.miles),
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
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getMonthlySummaryGrid(year: number): Promise<MonthlyGrid> {
  const categories = await prisma.costCategory.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });

  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const [entries, trips] = await Promise.all([
    prisma.costEntry.findMany({
      where: { date: { gte: start, lt: end } },
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
