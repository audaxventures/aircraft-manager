import { KpiCard } from "@/components/shared/kpi-card";
import { formatCurrency, formatHours, formatNumber } from "@/lib/format";
import type { CostPerMetrics, CostSummary } from "@/lib/costs";

function amountLabel(amounts: { CAD: number; USD: number }) {
  const primary = formatCurrency(amounts.CAD, { noDecimals: true });
  const sublabel = amounts.USD !== 0 ? `${formatCurrency(amounts.USD, { noDecimals: true })} USD` : undefined;
  return { primary, sublabel };
}

function rateLabel(rates: { CAD: number | null; USD: number | null }) {
  const primary = rates.CAD !== null ? formatCurrency(rates.CAD) : "—";
  const sublabel = rates.USD ? `${formatCurrency(rates.USD)} USD` : undefined;
  return { primary, sublabel };
}

interface CostSummaryPanelProps {
  summary: CostSummary;
  metrics: CostPerMetrics;
}

function CostSummaryPanel({ summary, metrics }: CostSummaryPanelProps) {
  const grand = amountLabel(summary.total);
  const fixed = amountLabel(summary.fixedTotal);
  const direct = amountLabel(summary.directTotal);
  const perHour = rateLabel(metrics.totalCostPerHour);
  const perMile = rateLabel(metrics.totalCostPerMile);

  const fixedCategories = summary.byCategory.filter((c) => c.type === "FIXED");
  const directCategories = summary.byCategory.filter((c) => c.type === "DIRECT");

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Grand total" value={grand.primary} sublabel={grand.sublabel} />
        <KpiCard label="Fixed costs" value={fixed.primary} sublabel={fixed.sublabel} />
        <KpiCard label="Direct / operating" value={direct.primary} sublabel={direct.sublabel} />
        <KpiCard label="Total cost / hour" value={perHour.primary} sublabel={perHour.sublabel ?? `${formatHours(metrics.hours)} flown`} />
        <KpiCard label="Total cost / mile" value={perMile.primary} sublabel={perMile.sublabel ?? `${formatNumber(metrics.miles)} mi flown`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryGroup title="Fixed costs" total={fixed} categories={fixedCategories} />
        <CategoryGroup title="Direct / operating costs" total={direct} categories={directCategories} />
      </div>
    </div>
  );
}

function CategoryGroup({
  title,
  total,
  categories,
}: {
  title: string;
  total: { primary: string; sublabel?: string };
  categories: CostSummary["byCategory"];
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {total.primary}
          {total.sublabel && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{total.sublabel}</span>}
        </span>
      </div>
      <ul className="divide-y">
        {categories.map((c) => {
          const amt = amountLabel(c.total);
          return (
            <li key={c.categoryId} className="flex items-center justify-between gap-2 px-4 py-2 text-sm">
              <span className="text-foreground">{c.name}</span>
              <span className="tabular-nums">
                {amt.primary}
                {amt.sublabel && <span className="ml-1.5 text-xs text-muted-foreground">{amt.sublabel}</span>}
              </span>
            </li>
          );
        })}
        {categories.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No categories</li>}
      </ul>
    </div>
  );
}

export { CostSummaryPanel };
