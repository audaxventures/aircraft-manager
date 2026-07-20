import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { ReportsView } from "@/components/reports/reports-view";
import { ComplianceExportPanel } from "@/components/reports/compliance-export-panel";
import { getMonthlySummaryGrid, getAvailableCostYears } from "@/lib/costs";
import { getPilots } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface ReportsPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const years = await getAvailableCostYears();
  const year = params.year ? parseInt(params.year, 10) : years[0] ?? new Date().getFullYear();

  const [grid, pilots] = await Promise.all([getMonthlySummaryGrid(year), getPilots()]);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Monthly summary, trends, and exports."
        action={
          <div className="flex items-center rounded-md border bg-card p-0.5">
            {years.map((y) => (
              <Link
                key={y}
                href={`/reports?year=${y}`}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-sm font-medium transition-colors",
                  y === year ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {y}
              </Link>
            ))}
          </div>
        }
      />

      <div className="mb-6">
        <ComplianceExportPanel pilots={pilots} />
      </div>

      <ReportsView year={year} grid={grid} />
    </div>
  );
}
