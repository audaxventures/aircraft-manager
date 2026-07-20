import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { CategoryBreakdown } from "@/components/reports/category-breakdown";
import { MonthlyTrendChart, type MonthlyTrendPoint } from "@/components/reports/monthly-trend-chart";
import { Badge } from "@/components/ui/badge";
import { getCostPerMetrics, getMonthlySummaryGrid } from "@/lib/costs";
import { getYtdRange } from "@/lib/date-ranges";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { getAllPilotsDutyStatus } from "@/lib/duty";
import { getAllPilotsCurrency, getCurrencyThresholds } from "@/lib/currency";
import { daysUntil } from "@/lib/currency-shared";
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

  const dutyFlags = dutyStatuses.filter((s) => s.restViolation || s.activeFdtViolations > 0);
  const currencyFlags = currencies.filter((c) => {
    const dayExpiringSoon = c.day.lapseDate && daysUntil(c.day.lapseDate) <= 30;
    const nightExpiringSoon = c.night.lapseDate && daysUntil(c.night.lapseDate) <= 30;
    return !c.day.current || !c.night.current || dayExpiringSoon || nightExpiringSoon;
  });

  const trendData: MonthlyTrendPoint[] = grid.rows.map((r) => ({ month: r.monthLabel, fixed: r.fixedTotal, direct: r.directTotal }));

  return (
    <div>
      <PageHeader title="Dashboard" description={`${aircraft?.tailNumber ?? "C-FPFX"} operations at a glance.`} />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="YTD total cost"
          value={formatCurrency(metrics.total.CAD, { noDecimals: true })}
          sublabel={metrics.total.USD !== 0 ? `${formatCurrency(metrics.total.USD, { noDecimals: true })} USD` : undefined}
        />
        <KpiCard label="YTD hours flown" value={formatHours(metrics.hours)} />
        <KpiCard label="Trips (YTD)" value={flying.tripCount} />
        <KpiCard label="Total cost / hour" value={metrics.totalCostPerHour.CAD !== null ? formatCurrency(metrics.totalCostPerHour.CAD) : "—"} />
        <KpiCard label="Total cost / mile" value={metrics.totalCostPerMile.CAD !== null ? formatCurrency(metrics.totalCostPerMile.CAD) : "—"} />
        <KpiCard label="YTD miles" value={formatNumber(metrics.miles)} />
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <Link
          href="/duty-days"
          className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-foreground/20"
        >
          <div className="flex items-center gap-3">
            {dutyFlags.length > 0 ? (
              <AlertTriangle className="size-5 shrink-0 text-destructive" />
            ) : (
              <Badge variant="success">OK</Badge>
            )}
            <div>
              <div className="text-sm font-medium text-foreground">Duty day compliance</div>
              <div className="text-sm text-muted-foreground">
                {dutyFlags.length > 0
                  ? `${dutyFlags.length} pilot${dutyFlags.length === 1 ? "" : "s"} flagged`
                  : "No active violations"}
              </div>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        <Link
          href="/currency"
          className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-foreground/20"
        >
          <div className="flex items-center gap-3">
            {currencyFlags.length > 0 ? (
              <AlertTriangle className="size-5 shrink-0 text-warning-foreground" />
            ) : (
              <Badge variant="success">OK</Badge>
            )}
            <div>
              <div className="text-sm font-medium text-foreground">Pilot currency</div>
              <div className="text-sm text-muted-foreground">
                {currencyFlags.length > 0
                  ? `${currencyFlags.length} pilot${currencyFlags.length === 1 ? "" : "s"} expiring or expired`
                  : "All pilots current"}
              </div>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      </div>

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
