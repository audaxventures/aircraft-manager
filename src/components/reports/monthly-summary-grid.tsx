import { cn } from "@/lib/utils";
import { formatCurrency, formatHours, formatNumber } from "@/lib/format";
import type { MonthlyGrid } from "@/lib/costs";

function metrics(row: { hours: number; miles: number; fixedTotal: number; directTotal: number; total: number }) {
  const div = (n: number, d: number) => (d > 0 ? n / d : null);
  return {
    directCostPerHour: div(row.directTotal, row.hours),
    fixedCostPerHour: div(row.fixedTotal, row.hours),
    totalCostPerHour: div(row.total, row.hours),
    directCostPerMile: div(row.directTotal, row.miles),
    totalCostPerMile: div(row.total, row.miles),
  };
}

function MonthlySummaryGrid({ grid }: { grid: MonthlyGrid }) {
  const fixedCategories = grid.categories.filter((c) => c.type === "FIXED");
  const directCategories = grid.categories.filter((c) => c.type === "DIRECT");

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[1400px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b">
            <th className="sticky left-0 z-20 bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">Month</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Hours</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Miles</th>
            {fixedCategories.map((c) => (
              <th key={c.id} className="px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">
                {c.name}
              </th>
            ))}
            <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">Fixed total</th>
            {directCategories.map((c) => (
              <th key={c.id} className="px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">
                {c.name}
              </th>
            ))}
            <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">Direct total</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">Total</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">Direct $/hr</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">Fixed $/hr</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">Total $/hr</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">Direct $/mi</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">Total $/mi</th>
          </tr>
        </thead>
        <tbody>
          {grid.rows.map((row) => {
            const m = metrics(row);
            return (
              <tr key={row.monthIndex} className="border-b last:border-0 hover:bg-secondary/40">
                <td className="sticky left-0 z-10 bg-card px-3 py-2 font-medium">{row.monthLabel}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{formatNumber(row.hours)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{formatNumber(row.miles)}</td>
                {fixedCategories.map((c) => (
                  <td key={c.id} className="px-3 py-2 text-right tabular-nums">
                    {row.byCategory[c.id] ? formatCurrency(row.byCategory[c.id], { noDecimals: true }) : "—"}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-medium tabular-nums">{formatCurrency(row.fixedTotal, { noDecimals: true })}</td>
                {directCategories.map((c) => (
                  <td key={c.id} className="px-3 py-2 text-right tabular-nums">
                    {row.byCategory[c.id] ? formatCurrency(row.byCategory[c.id], { noDecimals: true }) : "—"}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-medium tabular-nums">{formatCurrency(row.directTotal, { noDecimals: true })}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatCurrency(row.total, { noDecimals: true })}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {m.directCostPerHour !== null ? formatCurrency(m.directCostPerHour) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {m.fixedCostPerHour !== null ? formatCurrency(m.fixedCostPerHour) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {m.totalCostPerHour !== null ? formatCurrency(m.totalCostPerHour) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {m.directCostPerMile !== null ? formatCurrency(m.directCostPerMile) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {m.totalCostPerMile !== null ? formatCurrency(m.totalCostPerMile) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {(() => {
            const row = grid.yearTotal;
            const m = metrics(row);
            return (
              <tr className={cn("bg-muted/50 font-semibold")}>
                <td className="sticky left-0 z-10 bg-muted/50 px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatNumber(row.hours)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatNumber(row.miles)}</td>
                {fixedCategories.map((c) => (
                  <td key={c.id} className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(row.byCategory[c.id] ?? 0, { noDecimals: true })}
                  </td>
                ))}
                <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(row.fixedTotal, { noDecimals: true })}</td>
                {directCategories.map((c) => (
                  <td key={c.id} className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(row.byCategory[c.id] ?? 0, { noDecimals: true })}
                  </td>
                ))}
                <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(row.directTotal, { noDecimals: true })}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(row.total, { noDecimals: true })}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.directCostPerHour !== null ? formatCurrency(m.directCostPerHour) : "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.fixedCostPerHour !== null ? formatCurrency(m.fixedCostPerHour) : "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.totalCostPerHour !== null ? formatCurrency(m.totalCostPerHour) : "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.directCostPerMile !== null ? formatCurrency(m.directCostPerMile) : "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.totalCostPerMile !== null ? formatCurrency(m.totalCostPerMile) : "—"}</td>
              </tr>
            );
          })()}
        </tfoot>
      </table>
    </div>
  );
}

export { MonthlySummaryGrid };
