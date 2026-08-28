"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlideOver } from "@/components/shared/slide-over";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { saveHistoricalAnnualTotal, deleteHistoricalAnnualTotal } from "@/lib/actions/settings";
import { formatHours, formatNumber } from "@/lib/format";

interface HistoricalAnnualTotal {
  id: string;
  year: number;
  hours: number;
  cycles: number;
}

function HistoricalTotalsManager({ totals }: { totals: HistoricalAnnualTotal[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<HistoricalAnnualTotal | null>(null);
  const [deleting, setDeleting] = React.useState<HistoricalAnnualTotal | null>(null);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(t: HistoricalAnnualTotal) {
    setEditing(t);
    setOpen(true);
  }

  async function handleDelete() {
    if (!deleting) return;
    await deleteHistoricalAnnualTotal(deleting.id);
    toast.success(`${deleting.year} total removed`);
    setDeleting(null);
  }

  return (
    <div className="mt-6 max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-foreground">Historical annual totals</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Whole-year hours/cycles for years before trip tracking began here -- added to the Weekly Report&apos;s
            lifetime total and, when the year matches, its prior fiscal year figure.
          </p>
        </div>
      </div>
      <div className="rounded-lg border bg-card shadow-sm">
        <ul className="divide-y">
          {totals.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
              <button type="button" onClick={() => openEdit(t)} className="text-foreground hover:underline">
                {t.year}
              </button>
              <div className="flex items-center gap-3">
                <span className="tabular-nums text-muted-foreground">
                  {formatHours(t.hours)} · {formatNumber(t.cycles)} cycles
                </span>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(t)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleting(t)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
          {totals.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No historical totals added</li>}
        </ul>
      </div>
      <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={openNew}>
        <Plus /> Add year
      </Button>

      <HistoricalTotalForm open={open} onOpenChange={setOpen} total={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Remove ${deleting?.year ?? ""} total?`}
        description="This will no longer be included in the Weekly Report's lifetime and prior-year figures."
        onConfirm={handleDelete}
      />
    </div>
  );
}

function HistoricalTotalForm({
  open,
  onOpenChange,
  total,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: HistoricalAnnualTotal | null;
}) {
  const [year, setYear] = React.useState(String(total?.year ?? new Date().getUTCFullYear() - 1));
  const [hours, setHours] = React.useState(String(total?.hours ?? ""));
  const [cycles, setCycles] = React.useState(String(total?.cycles ?? ""));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setYear(String(total?.year ?? new Date().getUTCFullYear() - 1));
      setHours(String(total?.hours ?? ""));
      setCycles(String(total?.cycles ?? ""));
      setError(null);
    }
  }, [open, total]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await saveHistoricalAnnualTotal({ id: total?.id, year, hours, cycles });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(total ? "Total updated" : "Total added");
    onOpenChange(false);
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={total ? `Edit ${total.year}` : "Add historical total"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="historical-total-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="historical-total-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="hat-year">Year</Label>
          <Input id="hat-year" type="number" step="1" value={year} onChange={(e) => setYear(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="hat-hours">Total hours</Label>
            <Input
              id="hat-hours"
              type="number"
              step="0.1"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hat-cycles">Total cycles</Label>
            <Input
              id="hat-cycles"
              type="number"
              step="1"
              min="0"
              value={cycles}
              onChange={(e) => setCycles(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { HistoricalTotalsManager };
