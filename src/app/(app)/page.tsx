import { PageHeader } from "@/components/shared/page-header";
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

export default async function DashboardPage() {
  const aircraft = await getPrimaryAircraft();
  const fiscalStartMonth = aircraft?.fiscalYearStartMonth ?? 1;
  const now = new Date();
  const ytdRange = getYtdRange(now, fiscalStartMonth);
  const year = now.getUTCFullYear();

  const [metrics, grid, dutyStatuses, currencyThresholds, flying] = await Promise.all([
    getCostPerMetrics(ytdRange),
    getMonthlySummaryGrid(year),
    getAllPilotsDutyStatus(),
    getCurrencyThresholds(),
    getTripHoursAndMiles(ytdRange),
  ]);
  const currencies = await getAllPilotsCurrency(currencyThresholds);

  const trendData: MonthlyTrendPoint[] = grid.rows.map((r) => ({ month: r.monthLabel, fixed: r.fixedTotal, direct: r.directTotal }));

  return (
    <div>
      <PageHeader title="Dashboard" description={`${aircraft?.tailNumber ?? "C-FPFX"} operations at a glance.`} />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="YTD total cost"
          value={formatCurrency(metrics.total.CAD, { noDecimals: true })}
          sublabel={metrics.total.USD !== 0 ? `${formatCurrency(metrics.total.USD, { noDecimals: true })} USD` : undefined}
          accent="blue"
        />
        <KpiCard label="YTD hours flown" value={formatHours(metrics.hours)} accent="indigo" />
        <KpiCard label="Trips (YTD)" value={flying.tripCount} accent="violet" />
        <KpiCard
          label="Total cost / hour"
          value={metrics.totalCostPerHour.CAD !== null ? formatCurrency(metrics.totalCostPerHour.CAD) : "—"}
          accent="amber"
        />
        <KpiCard
          label="Total cost / mile"
          value={metrics.totalCostPerMile.CAD !== null ? formatCurrency(metrics.totalCostPerMile.CAD) : "—"}
          accent="teal"
        />
        <KpiCard label="YTD miles" value={formatNumber(metrics.miles)} accent="emerald" />
      </div>

      <DashboardStatusLinks dutyStatuses={dutyStatuses} currencies={currencies} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-foreground">Monthly trend — {year}</h2>
          <MonthlyTrendChart data={trendData} />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-foreground">Cost by category — {year}</h2>
          <CategoryBreakdown
            categories={grid.categories.map((c) => ({ name: c.name, type: c.type, total: grid.yearTotal.byCategory[c.id] ?? 0 }))}
          />
        </div>
      </section>
    </div>
  );
}
