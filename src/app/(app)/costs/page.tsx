import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { CostFilters } from "@/components/costs/cost-filters";
import { CostsView } from "@/components/costs/costs-view";
import { getCostEntries, getCostPerMetrics } from "@/lib/costs";
import { getCostCategories } from "@/lib/settings";
import { getMtdRange, getYtdRange } from "@/lib/date-ranges";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { formatCurrency, formatHours, formatNumber } from "@/lib/format";

interface CostsPageProps {
  searchParams: Promise<{ range?: string; type?: string; from?: string; to?: string }>;
}

export default async function CostsPage({ searchParams }: CostsPageProps) {
  const params = await searchParams;
  const aircraft = await getPrimaryAircraft();
  const fiscalStartMonth = aircraft?.fiscalYearStartMonth ?? 1;
  const now = new Date();

  let range: { start: Date; end: Date } | undefined;
  if (params.from || params.to) {
    range = {
      start: params.from ? new Date(params.from) : new Date(0),
      end: params.to ? new Date(new Date(params.to).getTime() + 86400000) : new Date(now.getTime() + 86400000),
    };
  } else if (params.range === "mtd") {
    range = getMtdRange(now);
  } else if (params.range === "all") {
    range = undefined;
  } else {
    range = getYtdRange(now, fiscalStartMonth);
  }

  const type = params.type === "FIXED" || params.type === "DIRECT" ? params.type : undefined;

  const [entries, metrics, categories] = await Promise.all([
    getCostEntries({ from: range?.start, to: range?.end, type }),
    getCostPerMetrics(range),
    getCostCategories(),
  ]);

  return (
    <div>
      <PageHeader title="Costs" description="Fixed and direct operating costs for C-FPFX." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Fixed" value={formatCurrency(metrics.fixedTotal, { noDecimals: true })} />
        <KpiCard label="Direct" value={formatCurrency(metrics.directTotal, { noDecimals: true })} />
        <KpiCard label="Total" value={formatCurrency(metrics.total, { noDecimals: true })} />
        <KpiCard
          label="Total cost / hour"
          value={metrics.totalCostPerHour !== null ? formatCurrency(metrics.totalCostPerHour) : "—"}
          sublabel={`${formatHours(metrics.hours)} flown`}
        />
        <KpiCard
          label="Total cost / mile"
          value={metrics.totalCostPerMile !== null ? formatCurrency(metrics.totalCostPerMile) : "—"}
          sublabel={`${formatNumber(metrics.miles)} mi flown`}
        />
      </div>

      <CostFilters />
      <CostsView entries={entries} categories={categories} />
    </div>
  );
}
