"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Download, FileSpreadsheet, FileText, Plus, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import {
  CostEntryForm,
  type CostCategoryOption,
  type CostEntryFormValue,
  type VendorOption,
} from "@/components/costs/cost-entry-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { CostEntryDto } from "@/lib/costs";

interface CostsViewProps {
  entries: CostEntryDto[];
  categories: CostCategoryOption[];
  vendors: VendorOption[];
  exportFilters: { from?: string; to?: string; vendorId?: string };
}

function CostsView({ entries, categories, vendors, exportFilters }: CostsViewProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CostEntryFormValue | null>(null);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(entry: CostEntryDto) {
    setEditing({
      id: entry.id,
      date: entry.date.toISOString().slice(0, 10),
      categoryId: entry.categoryId,
      vendorId: entry.vendorId ?? "",
      invoiceNumber: entry.invoiceNumber ?? "",
      amount: String(entry.amount),
      currency: entry.currency,
      notes: entry.notes ?? "",
      attachments: [],
    });
    setFormOpen(true);
  }

  function exportCsv() {
    const csv = toCsv(entries, [
      { header: "Date", accessor: (e) => formatDate(e.date) },
      { header: "Category", accessor: (e) => e.categoryName },
      { header: "Type", accessor: (e) => (e.categoryType === "FIXED" ? "Fixed" : "Direct") },
      { header: "Vendor", accessor: (e) => e.vendorName },
      { header: "Invoice #", accessor: (e) => e.invoiceNumber },
      { header: "Currency", accessor: (e) => e.currency },
      { header: "Amount", accessor: (e) => e.amount.toFixed(2) },
      { header: "Notes", accessor: (e) => e.notes },
    ]);
    downloadCsv(`cost-entries-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  function exportUrl(kind: "pdf" | "xlsx", type: "FIXED" | "DIRECT") {
    const params = new URLSearchParams({ type });
    if (exportFilters.from) params.set("from", exportFilters.from);
    if (exportFilters.to) params.set("to", exportFilters.to);
    if (exportFilters.vendorId) params.set("vendor", exportFilters.vendorId);
    return `/api/reports/costs/${kind}?${params.toString()}`;
  }

  const columns: ColumnDef<CostEntryDto>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
      sortingFn: "datetime",
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.categoryName}</span>
          <Badge variant="outline" className="text-[10px]">
            {row.original.categoryType === "FIXED" ? "Fixed" : "Direct"}
          </Badge>
        </div>
      ),
    },
    { accessorKey: "vendorName", header: "Vendor", cell: ({ row }) => row.original.vendorName || "—" },
    { accessorKey: "invoiceNumber", header: "Invoice #", cell: ({ row }) => row.original.invoiceNumber || "—" },
    {
      accessorKey: "amount",
      header: () => <div className="w-full text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {formatCurrency(row.original.amount)}{" "}
          <span className="text-xs text-muted-foreground">{row.original.currency}</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={entries.length === 0}>
          <Download /> Export CSV
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileText /> Fixed / Direct exports <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Fixed costs</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <a href={exportUrl("xlsx", "FIXED")}>
                <FileSpreadsheet /> Export XLSX
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={exportUrl("pdf", "FIXED")}>
                <FileText /> Export PDF
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Direct / operating costs</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <a href={exportUrl("xlsx", "DIRECT")}>
                <FileSpreadsheet /> Export XLSX
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={exportUrl("pdf", "DIRECT")}>
                <FileText /> Export PDF
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" onClick={openNew}>
          <Plus /> Add cost
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={entries}
        onRowClick={openEdit}
        initialSorting={[{ id: "date", desc: true }]}
        emptyState={
          <EmptyState
            icon={<Receipt className="size-8" />}
            title="No cost entries yet"
            description="Add fixed or direct costs as invoices come in, or adjust the filters above."
            action={
              <Button size="sm" onClick={openNew}>
                <Plus /> Add cost
              </Button>
            }
          />
        }
      />

      <CostEntryForm open={formOpen} onOpenChange={setFormOpen} categories={categories} vendors={vendors} initial={editing} />
    </div>
  );
}

export { CostsView };
