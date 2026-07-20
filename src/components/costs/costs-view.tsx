"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Plus, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { CostEntryForm, type CostCategoryOption, type CostEntryFormValue } from "@/components/costs/cost-entry-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { CostEntryDto } from "@/lib/costs";

interface CostsViewProps {
  entries: CostEntryDto[];
  categories: CostCategoryOption[];
}

function CostsView({ entries, categories }: CostsViewProps) {
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
      vendor: entry.vendor ?? "",
      invoiceNumber: entry.invoiceNumber ?? "",
      amount: String(entry.amount),
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
      { header: "Vendor", accessor: (e) => e.vendor },
      { header: "Invoice #", accessor: (e) => e.invoiceNumber },
      { header: "Amount", accessor: (e) => e.amount.toFixed(2) },
      { header: "Notes", accessor: (e) => e.notes },
    ]);
    downloadCsv(`cost-entries-${new Date().toISOString().slice(0, 10)}.csv`, csv);
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
    { accessorKey: "vendor", header: "Vendor", cell: ({ row }) => row.original.vendor || "—" },
    { accessorKey: "invoiceNumber", header: "Invoice #", cell: ({ row }) => row.original.invoiceNumber || "—" },
    {
      accessorKey: "amount",
      header: () => <div className="w-full text-right">Amount</div>,
      cell: ({ row }) => <div className="text-right tabular-nums">{formatCurrency(row.original.amount)}</div>,
    },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={entries.length === 0}>
          <Download /> Export CSV
        </Button>
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

      <CostEntryForm open={formOpen} onOpenChange={setFormOpen} categories={categories} initial={editing} />
    </div>
  );
}

export { CostsView };
