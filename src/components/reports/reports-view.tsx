"use client";

import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MonthlySummaryGrid } from "@/components/reports/monthly-summary-grid";
import { MonthlyTrendChart, type MonthlyTrendPoint } from "@/components/reports/monthly-trend-chart";
import { CategoryBreakdown } from "@/components/reports/category-breakdown";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { MonthlyGrid } from "@/lib/costs";

interface ReportsViewProps {
  year: number;
  grid: MonthlyGrid;
}

function ReportsView({ year, grid }: ReportsViewProps) {
  const trendData: MonthlyTrendPoint[] = grid.rows.map((r) => ({ month: r.monthLabel, fixed: r.fixedTotal, direct: r.directTotal }));

  function exportCsv() {
    const rows = [...grid.rows, grid.yearTotal];
    const csv = toCsv(rows, [
      { header: "Month", accessor: (r) => r.monthLabel },
      { header: "Hours", accessor: (r) => r.hours.toFixed(1) },
      { header: "Miles", accessor: (r) => r.miles },
      ...grid.categories.map((c) => ({
        header: c.name,
        accessor: (r: (typeof rows)[number]) => (r.byCategory[c.id] ?? 0).toFixed(2),
      })),
      { header: "Fixed total", accessor: (r) => r.fixedTotal.toFixed(2) },
      { header: "Direct total", accessor: (r) => r.directTotal.toFixed(2) },
      { header: "Total", accessor: (r) => r.total.toFixed(2) },
    ]);
    downloadCsv(`monthly-cost-summary-${year}.csv`, csv);
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Monthly summary — {year}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download /> CSV
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/reports/monthly-summary/pdf?year=${year}`} target="_blank" rel="noreferrer">
                <FileText /> PDF
              </a>
            </Button>
          </div>
        </div>
        <MonthlySummaryGrid grid={grid} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-foreground">Monthly trend</h2>
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

export { ReportsView };
