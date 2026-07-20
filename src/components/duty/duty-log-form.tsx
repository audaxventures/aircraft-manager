"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateInput } from "@/components/ui/date-input";
import { TimeInput } from "@/components/ui/time-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideOver } from "@/components/shared/slide-over";
import { saveDutyDayLog, deleteDutyDayLog } from "@/lib/actions/duty";
import { formatDate } from "@/lib/format";

export interface PilotOption {
  id: string;
  name: string;
}

export interface DutyLogFormValue {
  id: string;
  pilotId: string;
  date: string;
  reportTime: string;
  dutyEndTime: string;
  endsNextDay: boolean;
  restPeriodBeforeHours: string;
  splitDutyApplied: boolean;
  splitDutyNote: string;
  notes: string;
}

function emptyValue(): DutyLogFormValue {
  return {
    id: "",
    pilotId: "",
    date: new Date().toISOString().slice(0, 10),
    reportTime: "07:00",
    dutyEndTime: "18:00",
    endsNextDay: false,
    restPeriodBeforeHours: "12",
    splitDutyApplied: false,
    splitDutyNote: "",
    notes: "",
  };
}

function combineDateTime(dateStr: string, timeStr: string, addDay: boolean): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + (addDay ? 1 : 0), hour, minute));
  return d;
}

interface DutyLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pilots: PilotOption[];
  initial?: DutyLogFormValue | null;
}

function DutyLogForm({ open, onOpenChange, pilots, initial }: DutyLogFormProps) {
  const [value, setValue] = React.useState<DutyLogFormValue>(initial ?? emptyValue());
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setValue(initial ?? emptyValue());
      setError(null);
    }
  }, [open, initial]);

  const isEditing = !!value.id;

  const flightDutyHours = React.useMemo(() => {
    if (!value.date || !value.reportTime || !value.dutyEndTime) return null;
    const report = combineDateTime(value.date, value.reportTime, false);
    const end = combineDateTime(value.date, value.dutyEndTime, value.endsNextDay);
    const hrs = (end.getTime() - report.getTime()) / (1000 * 60 * 60);
    return hrs > 0 ? hrs : null;
  }, [value.date, value.reportTime, value.dutyEndTime, value.endsNextDay]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!value.pilotId) {
      setError("Select a pilot");
      return;
    }
    const report = combineDateTime(value.date, value.reportTime, false);
    const end = combineDateTime(value.date, value.dutyEndTime, value.endsNextDay);
    if (end <= report) {
      setError("Duty end time must be after report time (check the “ends next day” box for overnight duty).");
      return;
    }

    setSaving(true);
    const result = await saveDutyDayLog({
      id: value.id || undefined,
      pilotId: value.pilotId,
      date: value.date,
      reportTime: report.toISOString(),
      dutyEndTime: end.toISOString(),
      restPeriodBeforeHours: value.restPeriodBeforeHours,
      splitDutyApplied: value.splitDutyApplied,
      splitDutyNote: value.splitDutyNote,
      notes: value.notes,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEditing ? "Duty log updated" : "Duty log added");
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!value.id) return;
    setDeleting(true);
    await deleteDutyDayLog(value.id);
    setDeleting(false);
    toast.success("Duty log deleted");
    onOpenChange(false);
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit duty log" : "Add duty log"}
      description={isEditing ? formatDate(value.date) : undefined}
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
          <Button type="submit" form="duty-log-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="duty-log-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="dl-pilot">Pilot</Label>
          <Select value={value.pilotId} onValueChange={(pilotId) => setValue((v) => ({ ...v, pilotId }))}>
            <SelectTrigger id="dl-pilot">
              <SelectValue placeholder="Select a pilot" />
            </SelectTrigger>
            <SelectContent>
              {pilots.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dl-date">Date</Label>
          <DateInput id="dl-date" value={value.date} onChange={(e) => setValue((v) => ({ ...v, date: e.target.value }))} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dl-report">Report time</Label>
            <TimeInput id="dl-report" value={value.reportTime} onChange={(e) => setValue((v) => ({ ...v, reportTime: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dl-end">Duty end time</Label>
            <TimeInput id="dl-end" value={value.dutyEndTime} onChange={(e) => setValue((v) => ({ ...v, dutyEndTime: e.target.value }))} required />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={value.endsNextDay} onCheckedChange={(c) => setValue((v) => ({ ...v, endsNextDay: c === true }))} />
          Duty ends the following calendar day
        </label>

        {flightDutyHours !== null && (
          <div className="rounded-md bg-secondary px-3 py-2 text-sm">
            Flight duty time: <span className="font-medium tabular-nums">{flightDutyHours.toFixed(1)} hrs</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="dl-rest">Rest period immediately before this duty</Label>
          <div className="flex items-center gap-2">
            <Input
              id="dl-rest"
              type="number"
              step="0.1"
              min="0"
              className="max-w-32"
              value={value.restPeriodBeforeHours}
              onChange={(e) => setValue((v) => ({ ...v, restPeriodBeforeHours: e.target.value }))}
              required
            />
            <span className="text-sm text-muted-foreground">hours</span>
          </div>
        </div>

        <div className="space-y-2 rounded-md border p-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.splitDutyApplied}
              onCheckedChange={(c) => setValue((v) => ({ ...v, splitDutyApplied: c === true }))}
            />
            Split-duty extension applied
          </label>
          {value.splitDutyApplied && (
            <Textarea
              placeholder="Note the suitable accommodation and rest provided to support this extension…"
              value={value.splitDutyNote}
              onChange={(e) => setValue((v) => ({ ...v, splitDutyNote: e.target.value }))}
            />
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dl-notes">Notes</Label>
          <Textarea id="dl-notes" value={value.notes} onChange={(e) => setValue((v) => ({ ...v, notes: e.target.value }))} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { DutyLogForm, emptyValue as emptyDutyLogValue };
