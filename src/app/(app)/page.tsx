import { Wallet, Clock, PlaneTakeoff, Gauge, MapPin, Milestone } from "lucide-react";

import { auth } from "@/auth";
import { KpiCard } from "@/components/shared/kpi-card";
import { CategoryBreakdown } from "@/components/reports/category-breakdown";
import { MonthlyTrendChart, type MonthlyTrendPoint } from "@/components/reports/monthly-trend-chart";
import { DashboardStatusLinks } from "@/components/dashboard/status-links";
import { getCostPerMetrics, getMonthlySummaryGrid } from "@/lib/costs";
import { getYtdRange } from "@/lib/date-ranges";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { getAllPilotsDutyStatus } from "@/lib/duty";
import { getAllPilotsCurrency, getCurrencyThresholds } from "@/lib/currency";
import { getTripHoursAndMiles } from "@/lib/trips";
import { formatCurrency, formatHours, formatNumber } from "@/lib/format";

function shiftYearsUtc(d: Date, deltaYears: number) {
  return new Date(Date.UTC(d.getUTCFullYear() + deltaYears, d.getUTCMonth(), d.getUTCDate()));
}

function trendFor(current: number, prior: number) {
  if (!prior) return undefined;
  const pct = ((current - prior) / prior) * 100;
  if (Math.abs(pct) < 0.05) return { direction: "flat" as const, label: "No change vs prior year", tone: "neutral" as const };
  const direction = pct > 0 ? ("up" as const) : ("down" as const);
  const arrow = direction === "up" ? "↑" : "↓";
  return {
    direction,
    label: `${arrow} ${Math.abs(pct).toFixed(1)}% vs prior year`,
    tone: direction === "up" ? ("positive" as const) : ("negative" as const),
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const aircraft = await getPrimaryAircraft();
  const fiscalStartMonth = aircraft?.fiscalYearStartMonth ?? 1;
  const now = new Date();
  const ytdRange = getYtdRange(now, fiscalStartMonth);
  const priorYearRange = { start: shiftYearsUtc(ytdRange.start, -1), end: shiftYearsUtc(ytdRange.end, -1) };
  const year = now.getUTCFullYear();

  const [metrics, priorMetrics, grid, dutyStatuses, currencyThresholds, flying, priorFlying] = await Promise.all([
    getCostPerMetrics(ytdRange),
    getCostPerMetrics(priorYearRange),
    getMonthlySummaryGrid(year),
    getAllPilotsDutyStatus(),
    getCurrencyThresholds(),
    getTripHoursAndMiles(ytdRange),
    getTripHoursAndMiles(priorYearRange),
  ]);
  const currencies = await getAllPilotsCurrency(currencyThresholds);

  const trendData: MonthlyTrendPoint[] = grid.rows.map((r) => ({ month: r.monthLabel, fixed: r.fixedTotal, direct: r.directTotal }));

  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome back, {firstName}</h1>
        <div className="mt-3 mb-2 h-1 w-10 rounded-full bg-primary" />
        <p className="text-base text-muted-foreground">
          Here&apos;s how {aircraft?.tailNumber ?? "C-FPFX"} operations are performing.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="YTD total cost"
          value={formatCurrency(metrics.total.CAD, { noDecimals: true })}
          sublabel={metrics.total.USD !== 0 ? `${formatCurrency(metrics.total.USD, { noDecimals: true })} USD` : undefined}
          trend={trendFor(metrics.total.CAD, priorMetrics.total.CAD)}
          accent="blue"
          icon={Wallet}
        />
        <KpiCard
          label="YTD hours flown"
          value={formatHours(metrics.hours)}
          trend={trendFor(metrics.hours, priorFlying.hours)}
          accent="indigo"
          icon={Clock}
        />
        <KpiCard
          label="Trips (YTD)"
          value={flying.tripCount}
          trend={trendFor(flying.tripCount, priorFlying.tripCount)}
          accent="violet"
          icon={PlaneTakeoff}
        />
        <KpiCard
          label="Total cost / hour"
          value={metrics.totalCostPerHour.CAD !== null ? formatCurrency(metrics.totalCostPerHour.CAD) : "—"}
          trend={
            metrics.totalCostPerHour.CAD !== null && priorMetrics.totalCostPerHour.CAD !== null
              ? trendFor(metrics.totalCostPerHour.CAD, priorMetrics.totalCostPerHour.CAD)
              : undefined
          }
          accent="amber"
          icon={Gauge}
        />
        <KpiCard
          label="Total cost / mile"
          value={metrics.totalCostPerMile.CAD !== null ? formatCurrency(metrics.totalCostPerMile.CAD) : "—"}
          trend={
            metrics.totalCostPerMile.CAD !== null && priorMetrics.totalCostPerMile.CAD !== null
              ? trendFor(metrics.totalCostPerMile.CAD, priorMetrics.totalCostPerMile.CAD)
              : undefined
          }
          accent="teal"
          icon={MapPin}
        />
        <KpiCard
          label="YTD miles"
          value={formatNumber(metrics.miles)}
          trend={trendFor(metrics.miles, priorFlying.miles)}
          accent="emerald"
          icon={Milestone}
        />
      </div>

      <DashboardStatusLinks dutyStatuses={dutyStatuses} currencies={currencies} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-medium text-foreground">Monthly trend — {year}</h2>
          <MonthlyTrendChart data={trendData} />
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-medium text-foreground">Cost by category — {year}</h2>
          <CategoryBreakdown
            categories={grid.categories.map((c) => ({ name: c.name, type: c.type, total: grid.yearTotal.byCategory[c.id] ?? 0 }))}
            colorful
          />
        </div>
      </section>
    </div>
  );
}
