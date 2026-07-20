import { PageHeader } from "@/components/shared/page-header";
import { CostFilters } from "@/components/costs/cost-filters";
import { CostsView } from "@/components/costs/costs-view";
import { CostSummaryPanel } from "@/components/costs/cost-summary-panel";
import { getCostEntries, getCostPerMetrics, getCostSummary } from "@/lib/costs";
import { getCostCategories, getVendors } from "@/lib/settings";
import { getMtdRange, getYtdRange } from "@/lib/date-ranges";
import { getPrimaryAircraft } from "@/lib/aircraft";

interface CostsPageProps {
  searchParams: Promise<{ range?: string; type?: string; from?: string; to?: string; vendor?: string }>;
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
  const vendorId = params.vendor || undefined;

  const [entries, metrics, summary, categories, vendors] = await Promise.all([
    getCostEntries({ from: range?.start, to: range?.end, type, vendorId }),
    getCostPerMetrics(range, vendorId),
    getCostSummary(range, vendorId),
    getCostCategories(),
    getVendors(),
  ]);

  const exportFrom = range?.start && range.start.getTime() > 0 ? range.start.toISOString().slice(0, 10) : undefined;
  const exportTo = range?.end ? new Date(range.end.getTime() - 86400000).toISOString().slice(0, 10) : undefined;

  return (
    <div>
      <PageHeader title="Costs" description="Fixed and direct operating costs for C-FPFX." />

      <CostSummaryPanel summary={summary} metrics={metrics} />

      <CostFilters vendors={vendors} />
      <CostsView
        entries={entries}
        categories={categories}
        vendors={vendors}
        exportFilters={{ from: exportFrom, to: exportTo, vendorId }}
      />
    </div>
  );
}
