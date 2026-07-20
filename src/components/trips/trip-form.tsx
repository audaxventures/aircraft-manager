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
import { MultiCombobox, type ComboboxOption } from "@/components/shared/multi-combobox";
import { saveTrip, deleteTrip, createPassenger } from "@/lib/actions/trips";
import { formatDate } from "@/lib/format";

export interface PilotOption {
  id: string;
  name: string;
}

export interface TripFormValue {
  id: string;
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  routeLabel: string;
  hours: string;
  cycles: string;
  miles: string;
  purpose: string;
  notes: string;
  pilotId: string;
  dayTakeoffs: string;
  dayLandings: string;
  nightTakeoffs: string;
  nightLandings: string;
  passengerIds: string[];
}

function emptyValue(): TripFormValue {
  return {
    id: "",
    date: new Date().toISOString().slice(0, 10),
    departureAirport: "",
    arrivalAirport: "",
    routeLabel: "",
    hours: "",
    cycles: "1",
    miles: "",
    purpose: "",
    notes: "",
    pilotId: "",
    dayTakeoffs: "1",
    dayLandings: "1",
    nightTakeoffs: "0",
    nightLandings: "0",
    passengerIds: [],
  };
}

interface TripFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pilots: PilotOption[];
  passengerOptions: ComboboxOption[];
  initial?: TripFormValue | null;
}

function TripForm({ open, onOpenChange, pilots, passengerOptions: initialPassengerOptions, initial }: TripFormProps) {
  const [value, setValue] = React.useState<TripFormValue>(initial ?? emptyValue());
  const [passengerOptions, setPassengerOptions] = React.useState(initialPassengerOptions);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setValue(initial ?? emptyValue());
      setPassengerOptions(initialPassengerOptions);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const isEditing = !!value.id;

  const cycles = parseInt(value.cycles || "0", 10);
  const takeoffSum = parseInt(value.dayTakeoffs || "0", 10) + parseInt(value.nightTakeoffs || "0", 10);
  const landingSum = parseInt(value.dayLandings || "0", 10) + parseInt(value.nightLandings || "0", 10);
  const takeoffMismatch = cycles > 0 && takeoffSum !== cycles;
  const landingMismatch = cycles > 0 && landingSum !== cycles;

  async function handleCreatePassenger(name: string) {
    const result = await createPassenger(name);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPassengerOptions((opts) => [...opts, { value: result.id, label: result.name }]);
    setValue((v) => ({ ...v, passengerIds: [...v.passengerIds, result.id] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (takeoffMismatch || landingMismatch) {
      setError("Day/night takeoff and landing counts must add up to the total cycles.");
      return;
    }
    setSaving(true);
    const result = await saveTrip({
      id: value.id || undefined,
      date: value.date,
      departureAirport: value.departureAirport,
      arrivalAirport: value.arrivalAirport,
      routeLabel: value.routeLabel,
      hours: value.hours,
      cycles: value.cycles,
      miles: value.miles,
      purpose: value.purpose,
      notes: value.notes,
      pilotId: value.pilotId,
      dayTakeoffs: value.dayTakeoffs,
      dayLandings: value.dayLandings,
      nightTakeoffs: value.nightTakeoffs,
      nightLandings: value.nightLandings,
      passengerIds: value.passengerIds,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEditing ? "Trip updated" : "Trip added");
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!value.id) return;
    setDeleting(true);
    await deleteTrip(value.id);
    setDeleting(false);
    toast.success("Trip deleted");
    onOpenChange(false);
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit trip" : "Add trip"}
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
          <Button type="submit" form="trip-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="trip-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="tr-date">Date</Label>
          <DateInput id="tr-date" value={value.date} onChange={(e) => setValue((v) => ({ ...v, date: e.target.value }))} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tr-dep">Departure</Label>
            <Input
              id="tr-dep"
              value={value.departureAirport}
              onChange={(e) => setValue((v) => ({ ...v, departureAirport: e.target.value }))}
              placeholder="Winnipeg, MB"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tr-arr">Arrival</Label>
            <Input
              id="tr-arr"
              value={value.arrivalAirport}
              onChange={(e) => setValue((v) => ({ ...v, arrivalAirport: e.target.value }))}
              placeholder="Palm Springs, CA"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tr-route">Route label</Label>
          <Input
            id="tr-route"
            value={value.routeLabel}
            onChange={(e) => setValue((v) => ({ ...v, routeLabel: e.target.value }))}
            placeholder="Auto-filled from departure/arrival if left blank"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tr-hours">Hours</Label>
            <Input id="tr-hours" type="number" step="0.1" min="0" value={value.hours} onChange={(e) => setValue((v) => ({ ...v, hours: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tr-cycles">Cycles</Label>
            <Input id="tr-cycles" type="number" step="1" min="0" value={value.cycles} onChange={(e) => setValue((v) => ({ ...v, cycles: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tr-miles">Miles</Label>
            <Input id="tr-miles" type="number" step="1" min="0" value={value.miles} onChange={(e) => setValue((v) => ({ ...v, miles: e.target.value }))} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tr-pilot">Pilot in command</Label>
          <Select value={value.pilotId} onValueChange={(pilotId) => setValue((v) => ({ ...v, pilotId }))}>
            <SelectTrigger id="tr-pilot">
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

        <div className="rounded-md border p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Takeoffs &amp; landings</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tr-day-to" className="text-xs font-normal">
                Day takeoffs
              </Label>
              <Input
                id="tr-day-to"
                type="number"
                min="0"
                value={value.dayTakeoffs}
                onChange={(e) => setValue((v) => ({ ...v, dayTakeoffs: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tr-night-to" className="text-xs font-normal">
                Night takeoffs
              </Label>
              <Input
                id="tr-night-to"
                type="number"
                min="0"
                value={value.nightTakeoffs}
                onChange={(e) => setValue((v) => ({ ...v, nightTakeoffs: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tr-day-ldg" className="text-xs font-normal">
                Day landings
              </Label>
              <Input
                id="tr-day-ldg"
                type="number"
                min="0"
                value={value.dayLandings}
                onChange={(e) => setValue((v) => ({ ...v, dayLandings: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tr-night-ldg" className="text-xs font-normal">
                Night landings
              </Label>
              <Input
                id="tr-night-ldg"
                type="number"
                min="0"
                value={value.nightLandings}
                onChange={(e) => setValue((v) => ({ ...v, nightLandings: e.target.value }))}
              />
            </div>
          </div>
          {(takeoffMismatch || landingMismatch) && (
            <p className="mt-2 text-xs text-destructive">
              Day + night must equal the {cycles} cycle{cycles === 1 ? "" : "s"} entered above
              {takeoffMismatch && ` (takeoffs: ${takeoffSum})`}
              {landingMismatch && ` (landings: ${landingSum})`}.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Passengers</Label>
          <MultiCombobox
            options={passengerOptions}
            value={value.passengerIds}
            onChange={(passengerIds) => setValue((v) => ({ ...v, passengerIds }))}
            onCreate={handleCreatePassenger}
            placeholder="Add passenger"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tr-purpose">Purpose</Label>
          <Input id="tr-purpose" value={value.purpose} onChange={(e) => setValue((v) => ({ ...v, purpose: e.target.value }))} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tr-notes">Notes</Label>
          <Textarea id="tr-notes" value={value.notes} onChange={(e) => setValue((v) => ({ ...v, notes: e.target.value }))} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { TripForm, emptyValue as emptyTripValue };
