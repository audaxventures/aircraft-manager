import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { ReportsView } from "@/components/reports/reports-view";
import { ComplianceExportPanel } from "@/components/reports/compliance-export-panel";
import { ReportsVendorFilter } from "@/components/reports/reports-vendor-filter";
import { getMonthlySummaryGrid, getAvailableCostYears, type Currency } from "@/lib/costs";
import { getPilots, getVendors } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface ReportsPageProps {
  searchParams: Promise<{ year?: string; currency?: string; vendor?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const years = await getAvailableCostYears();
  const year = params.year ? parseInt(params.year, 10) : years[0] ?? new Date().getFullYear();
  const currency: Currency = params.currency === "USD" ? "USD" : "CAD";
  const vendorId = params.vendor || undefined;

  const [grid, pilots, vendors] = await Promise.all([
    getMonthlySummaryGrid(year, { currency, vendorId }),
    getPilots(),
    getVendors(),
  ]);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Monthly summary, trends, and exports."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {vendors.length > 0 && <ReportsVendorFilter vendors={vendors} />}
            <div className="flex items-center rounded-md border bg-card p-0.5">
              {(["CAD", "USD"] as const).map((c) => (
                <Link
                  key={c}
                  href={`/reports?year=${year}&currency=${c}${vendorId ? `&vendor=${vendorId}` : ""}`}
                  className={cn(
                    "rounded-sm px-2.5 py-1 text-sm font-medium transition-colors",
                    c === currency ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c}
                </Link>
              ))}
            </div>
            <div className="flex items-center rounded-md border bg-card p-0.5">
              {years.map((y) => (
                <Link
                  key={y}
                  href={`/reports?year=${y}&currency=${currency}${vendorId ? `&vendor=${vendorId}` : ""}`}
                  className={cn(
                    "rounded-sm px-2.5 py-1 text-sm font-medium transition-colors",
                    y === year ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {y}
                </Link>
              ))}
            </div>
          </div>
        }
      />

      <div className="mb-6">
        <ComplianceExportPanel pilots={pilots} />
      </div>

      <ReportsView year={year} grid={grid} currency={currency} vendorId={vendorId} />
    </div>
  );
}
