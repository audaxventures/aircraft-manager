"use client";

import * as React from "react";
import { toast } from "sonner";
import { Paperclip, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateInput } from "@/components/ui/date-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideOver } from "@/components/shared/slide-over";
import { saveCostEntry, deleteCostEntry, uploadCostAttachment } from "@/lib/actions/costs";
import { formatDate } from "@/lib/format";

export interface CostCategoryOption {
  id: string;
  name: string;
  type: "FIXED" | "DIRECT";
}

export interface CostEntryFormValue {
  id: string;
  date: string; // yyyy-mm-dd
  categoryId: string;
  vendor: string;
  invoiceNumber: string;
  amount: string;
  notes: string;
  attachments: { id: string; filename: string; url: string }[];
}

function emptyValue(): CostEntryFormValue {
  return {
    id: "",
    date: new Date().toISOString().slice(0, 10),
    categoryId: "",
    vendor: "",
    invoiceNumber: "",
    amount: "",
    notes: "",
    attachments: [],
  };
}

interface CostEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CostCategoryOption[];
  initial?: CostEntryFormValue | null;
}

function CostEntryForm({ open, onOpenChange, categories, initial }: CostEntryFormProps) {
  const [value, setValue] = React.useState<CostEntryFormValue>(initial ?? emptyValue());
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setValue(initial ?? emptyValue());
      setError(null);
    }
  }, [open, initial]);

  const isEditing = !!value.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!value.categoryId) {
      setError("Select a category");
      return;
    }
    setSaving(true);
    const result = await saveCostEntry({
      id: value.id || undefined,
      date: value.date,
      categoryId: value.categoryId,
      vendor: value.vendor,
      invoiceNumber: value.invoiceNumber,
      amount: value.amount,
      notes: value.notes,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEditing ? "Cost entry updated" : "Cost entry added");
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!value.id) return;
    setDeleting(true);
    await deleteCostEntry(value.id);
    setDeleting(false);
    toast.success("Cost entry deleted");
    onOpenChange(false);
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !value.id) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadCostAttachment(value.id, formData);
    setUploading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Receipt attached");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit cost entry" : "Add cost entry"}
      description={isEditing ? `Recorded ${formatDate(value.date)}` : undefined}
      footer={
        <>
          {isEditing && (
            <Button type="button" variant="outline" className="mr-auto text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
              <Trash2 /> {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="cost-entry-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="cost-entry-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ce-date">Date</Label>
            <DateInput id="ce-date" value={value.date} onChange={(e) => setValue((v) => ({ ...v, date: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ce-amount">Amount</Label>
            <CurrencyInput
              id="ce-amount"
              value={value.amount}
              onChange={(amount) => setValue((v) => ({ ...v, amount }))}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ce-category">Category</Label>
          <Select value={value.categoryId} onValueChange={(categoryId) => setValue((v) => ({ ...v, categoryId }))}>
            <SelectTrigger id="ce-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((c) => c.type === "FIXED")
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} · Fixed
                  </SelectItem>
                ))}
              {categories
                .filter((c) => c.type === "DIRECT")
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} · Direct
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ce-vendor">Vendor</Label>
            <Input id="ce-vendor" value={value.vendor} onChange={(e) => setValue((v) => ({ ...v, vendor: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ce-invoice">Invoice #</Label>
            <Input
              id="ce-invoice"
              value={value.invoiceNumber}
              onChange={(e) => setValue((v) => ({ ...v, invoiceNumber: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ce-notes">Notes</Label>
          <Textarea id="ce-notes" value={value.notes} onChange={(e) => setValue((v) => ({ ...v, notes: e.target.value }))} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {isEditing && (
          <div className="space-y-2 border-t pt-4">
            <Label>Receipts</Label>
            {value.attachments.length > 0 && (
              <ul className="space-y-1.5">
                {value.attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Paperclip className="size-3.5" /> {a.filename}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <input ref={fileInputRef} type="file" onChange={handleFileSelected} className="hidden" id="ce-file" />
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              <Paperclip /> {uploading ? "Uploading…" : "Attach receipt"}
            </Button>
          </div>
        )}
      </form>
    </SlideOver>
  );
}

export { CostEntryForm, emptyValue as emptyCostEntryValue };
