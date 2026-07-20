"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateInput } from "@/components/ui/date-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideOver } from "@/components/shared/slide-over";
import { saveCalendarEvent, deleteCalendarEvent } from "@/lib/actions/schedule";

export interface EventCategoryOption {
  id: string;
  name: string;
  color: string;
}

export interface PilotOption {
  id: string;
  name: string;
}

export interface EventFormValue {
  id: string;
  categoryId: string;
  title: string;
  startDate: string;
  endDate: string;
  pilotId: string;
  notes: string;
}

function emptyValue(defaultCategoryId: string, defaultDate?: string): EventFormValue {
  const date = defaultDate ?? new Date().toISOString().slice(0, 10);
  return { id: "", categoryId: defaultCategoryId, title: "", startDate: date, endDate: date, pilotId: "", notes: "" };
}

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: EventCategoryOption[];
  pilots: PilotOption[];
  initial?: EventFormValue | null;
  defaultDate?: string;
}

function EventForm({ open, onOpenChange, categories, pilots, initial, defaultDate }: EventFormProps) {
  const [value, setValue] = React.useState<EventFormValue>(initial ?? emptyValue(categories[0]?.id ?? "", defaultDate));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setValue(initial ?? emptyValue(categories[0]?.id ?? "", defaultDate));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, defaultDate]);

  const isEditing = !!value.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!value.categoryId) {
      setError("Select a category");
      return;
    }
    setSaving(true);
    const result = await saveCalendarEvent({
      id: value.id || undefined,
      categoryId: value.categoryId,
      title: value.title,
      startDate: value.startDate,
      endDate: value.endDate,
      pilotId: value.pilotId,
      notes: value.notes,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEditing ? "Event updated" : "Event added");
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!value.id) return;
    setDeleting(true);
    await deleteCalendarEvent(value.id);
    setDeleting(false);
    toast.success("Event deleted");
    onOpenChange(false);
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit event" : "Add event"}
      footer={
        <>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              className="mr-auto text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 /> {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="event-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ev-title">Title</Label>
          <Input id="ev-title" value={value.title} onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ev-category">Category</Label>
          <Select value={value.categoryId} onValueChange={(categoryId) => setValue((v) => ({ ...v, categoryId }))}>
            <SelectTrigger id="ev-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="mr-1.5 inline-block size-2.5 rounded-full align-middle" style={{ backgroundColor: c.color }} />
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ev-start">Start date</Label>
            <DateInput id="ev-start" value={value.startDate} onChange={(e) => setValue((v) => ({ ...v, startDate: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-end">End date</Label>
            <DateInput id="ev-end" value={value.endDate} onChange={(e) => setValue((v) => ({ ...v, endDate: e.target.value }))} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ev-pilot">Pilot (optional)</Label>
          <Select
            value={value.pilotId || "none"}
            onValueChange={(pilotId) => setValue((v) => ({ ...v, pilotId: pilotId === "none" ? "" : pilotId }))}
          >
            <SelectTrigger id="ev-pilot">
              <SelectValue placeholder="No pilot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {pilots.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ev-notes">Notes</Label>
          <Textarea id="ev-notes" value={value.notes} onChange={(e) => setValue((v) => ({ ...v, notes: e.target.value }))} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { EventForm, emptyValue as emptyEventValue };
