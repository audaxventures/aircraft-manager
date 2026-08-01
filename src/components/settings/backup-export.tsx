"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

function BackupExport() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="text-sm font-medium text-foreground">Full data export</h3>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Downloads every active record on the platform — trips, cost entries, duty logs, calendar events, weekly
        reports, pilots, vendors, categories, aircraft details, and regulatory thresholds — as a single Excel
        workbook, one sheet per record type. Keep a copy saved locally (a monthly download is a reasonable habit)
        so the data can be manually re-entered if it were ever lost.
      </p>
      <Button className="mt-4" asChild>
        <a href="/api/reports/full-export/xlsx">
          <Download /> Download full backup (.xlsx)
        </a>
      </Button>
    </div>
  );
}

export { BackupExport };
