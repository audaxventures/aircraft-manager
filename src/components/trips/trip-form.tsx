"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DateInput } from "@/components/ui/date-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideOver } from "@/components/shared/slide-over";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MultiCombobox, type ComboboxOption } from "@/components/shared/multi-combobox";
import { saveTrip, deleteTrip, createPassenger } from "@/lib/actions/trips";
import { formatDate } from "@/lib/format";
import { parseDecimalHour, decimalHoursBetween, formatDecimalHour } from "@/lib/flight-time";

export interface PilotOption {
  id: string;
  name: string;
}

export interface TripFormValue {
  id: string;
  date: string;
  endDate: string;
  isSimulator: boolean;
  departureAirport: string;
  arrivalAirport: string;
  routeLabel: string;
  hours: string;
  cycles: string;
  miles: string;
  purpose: string;
  notes: string;
  pilotId: string;
  secondPilotId: string;
  takeoffTime: string;
  landingTime: string;
  dayTakeoffs: string;
  dayLandings: string;
  nightTakeoffs: string;
  nightLandings: string;
  pilotInstrumentApproaches: string;
  secondPilotInstrumentApproaches: string;
  passengerIds: string[];
}

function emptyValue(): TripFormValue {
  return {
    id: "",
    date: new Date().toISOString().slice(0, 10),
    endDate: "",
    isSimulator: false,
    departureAirport: "",
    arrivalAirport: "",
    routeLabel: "",
    hours: "",
    cycles: "1",
    miles: "",
    purpose: "",
    notes: "",
    pilotId: "",
    secondPilotId: "",
    takeoffTime: "",
    landingTime: "",
    dayTakeoffs: "1",
    dayLandings: "1",
    nightTakeoffs: "0",
    nightLandings: "0",
    pilotInstrumentApproaches: "0",
    secondPilotInstrumentApproaches: "0",
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
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setValue(initial ?? emptyValue());
      setPassengerOptions(initialPassengerOptions);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const isEditing = !!value.id;
  const isPlanned = isEditing && (!value.hours || parseFloat(value.hours) === 0);

  const pilotName = pilots.find((p) => p.id === value.pilotId)?.name;
  const secondPilotName = pilots.find((p) => p.id === value.secondPilotId)?.name;

  // Cycles is derived from takeoffs, not separately entered — a trip can have
  // any number of takeoffs/landings (e.g. multiple touch-and-goes in training).
  const takeoffSum = parseInt(value.dayTakeoffs || "0", 10) + parseInt(value.nightTakeoffs || "0", 10);
  const landingSum = parseInt(value.dayLandings || "0", 10) + parseInt(value.nightLandings || "0", 10);
  const takeoffLandingMismatch = takeoffSum !== landingSum;

  const takeoffDecimal = value.takeoffTime ? parseDecimalHour(value.takeoffTime) : null;
  const landingDecimal = value.landingTime ? parseDecimalHour(value.landingTime) : null;
  const takeoffInvalid = value.takeoffTime !== "" && takeoffDecimal === null;
  const landingInvalid = value.landingTime !== "" && landingDecimal === null;
  const hoursAutoComputed = takeoffDecimal !== null && landingDecimal !== null;

  function applyComputedHours(v: TripFormValue): TripFormValue {
    const to = v.takeoffTime ? parseDecimalHour(v.takeoffTime) : null;
    const ld = v.landingTime ? parseDecimalHour(v.landingTime) : null;
    if (to !== null && ld !== null) {
      return { ...v, hours: formatDecimalHour(decimalHoursBetween(to, ld)) };
    }
    return v;
  }

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
    if (takeoffLandingMismatch) {
      setError("Total takeoffs and total landings must match.");
      return;
    }
    if (takeoffInvalid || landingInvalid) {
      setError("Takeoff/landing times must be in UTC decimal format, e.g. 14.3 for 14:18.");
      return;
    }
    setSaving(true);
    const result = await saveTrip({
      id: value.id || undefined,
      date: value.date,
      endDate: value.endDate || undefined,
      isSimulator: value.isSimulator,
      departureAirport: value.departureAirport,
      arrivalAirport: value.arrivalAirport,
      routeLabel: value.routeLabel,
      hours: value.hours,
      cycles: String(takeoffSum),
      miles: value.isSimulator ? "0" : value.miles,
      purpose: value.purpose,
      notes: value.notes,
      pilotId: value.pilotId,
      secondPilotId: value.secondPilotId,
      takeoffTime: value.takeoffTime || undefined,
      landingTime: value.landingTime || undefined,
      dayTakeoffs: value.dayTakeoffs,
      dayLandings: value.dayLandings,
      nightTakeoffs: value.nightTakeoffs,
      nightLandings: value.nightLandings,
      pilotInstrumentApproaches: value.pilotInstrumentApproaches,
      secondPilotInstrumentApproaches: value.secondPilotInstrumentApproaches,
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
    setConfirmDelete(false);
    toast.success("Trip deleted");
    onOpenChange(false);
  }

  return (
    <>
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit trip" : "Add trip"}
      description={
        isEditing
          ? `${formatDate(value.date)}${isPlanned ? " · Planned — add hours to mark as flown" : ""}`
          : undefined
      }
      footer={
        <>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              className="mr-auto text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
            >
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tr-date">Date</Label>
            <DateInput id="tr-date" value={value.date} onChange={(e) => setValue((v) => ({ ...v, date: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tr-end-date">End date (optional)</Label>
            <DateInput id="tr-end-date" value={value.endDate} onChange={(e) => setValue((v) => ({ ...v, endDate: e.target.value }))} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label htmlFor="tr-simulator">Simulator session</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Counts toward currency and duty-day/flight-hour tracking, but not toward the aircraft&apos;s hours or
              miles.
            </p>
          </div>
          <Switch
            id="tr-simulator"
            checked={value.isSimulator}
            onCheckedChange={(isSimulator) => setValue((v) => ({ ...v, isSimulator, miles: isSimulator ? "0" : v.miles }))}
          />
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
            <Label htmlFor="tr-hours">Hours{hoursAutoComputed && <span className="ml-1 font-normal text-muted-foreground">(auto)</span>}</Label>
            <Input
              id="tr-hours"
              type="number"
              step="0.1"
              min="0"
              value={value.hours}
              onChange={(e) => setValue((v) => ({ ...v, hours: e.target.value }))}
              readOnly={hoursAutoComputed}
              className={hoursAutoComputed ? "bg-secondary/50" : undefined}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tr-cycles">
              Cycles<span className="ml-1 font-normal text-muted-foreground">(auto)</span>
            </Label>
            <Input id="tr-cycles" type="number" value={takeoffSum} readOnly className="bg-secondary/50" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tr-miles">
              Miles{value.isSimulator && <span className="ml-1 font-normal text-muted-foreground">(n/a)</span>}
            </Label>
            <Input
              id="tr-miles"
              type="number"
              step="1"
              min="0"
              value={value.isSimulator ? "0" : value.miles}
              onChange={(e) => setValue((v) => ({ ...v, miles: e.target.value }))}
              disabled={value.isSimulator}
              className={value.isSimulator ? "bg-secondary/50" : undefined}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tr-pilot">Pilot in command</Label>
            <Select value={value.pilotId} onValueChange={(pilotId) => setValue((v) => ({ ...v, pilotId }))}>
              <SelectTrigger id="tr-pilot">
                <SelectValue placeholder="Select a pilot" />
              </SelectTrigger>
              <SelectContent>
                {pilots
                  .filter((p) => p.id !== value.secondPilotId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tr-second-pilot">Second in command</Label>
            <Select value={value.secondPilotId} onValueChange={(secondPilotId) => setValue((v) => ({ ...v, secondPilotId }))}>
              <SelectTrigger id="tr-second-pilot">
                <SelectValue placeholder="Select a pilot" />
              </SelectTrigger>
              <SelectContent>
                {pilots
                  .filter((p) => p.id !== value.pilotId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Takeoffs &amp; landings</div>
          <div className="mb-3 grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tr-takeoff-time" className="text-xs font-normal">
                Takeoff time (UTC decimal)
              </Label>
              <Input
                id="tr-takeoff-time"
                value={value.takeoffTime}
                onChange={(e) => setValue((v) => applyComputedHours({ ...v, takeoffTime: e.target.value }))}
                placeholder="e.g. 14.3"
              />
              {takeoffInvalid && <p className="text-xs text-destructive">Format: HH.T, e.g. 14.3 for 14:18</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tr-landing-time" className="text-xs font-normal">
                Landing time (UTC decimal)
              </Label>
              <Input
                id="tr-landing-time"
                value={value.landingTime}
                onChange={(e) => setValue((v) => applyComputedHours({ ...v, landingTime: e.target.value }))}
                placeholder="e.g. 16.5"
              />
              {landingInvalid && <p className="text-xs text-destructive">Format: HH.T, e.g. 16.5 for 16:30</p>}
            </div>
          </div>
          {hoursAutoComputed && (
            <p className="mb-3 text-xs text-muted-foreground">
              Duty day will default to {formatDecimalHour(((takeoffDecimal ?? 0) - 1 + 24) % 24)}–
              {formatDecimalHour(((landingDecimal ?? 0) + 0.5) % 24)} UTC for each pilot on this trip (editable on the Duty Days page).
            </p>
          )}
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
          {takeoffLandingMismatch && (
            <p className="mt-2 text-xs text-destructive">
              Total takeoffs ({takeoffSum}) must equal total landings ({landingSum}).
            </p>
          )}
        </div>

        <div className="rounded-md border p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Instrument approaches</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tr-pic-ia" className="text-xs font-normal">
                {pilotName ?? "Pilot in command"}
              </Label>
              <Input
                id="tr-pic-ia"
                type="number"
                min="0"
                value={value.pilotInstrumentApproaches}
                onChange={(e) => setValue((v) => ({ ...v, pilotInstrumentApproaches: e.target.value }))}
                disabled={!value.pilotId}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tr-sic-ia" className="text-xs font-normal">
                {secondPilotName ?? "Second in command"}
              </Label>
              <Input
                id="tr-sic-ia"
                type="number"
                min="0"
                value={value.secondPilotInstrumentApproaches}
                onChange={(e) => setValue((v) => ({ ...v, secondPilotInstrumentApproaches: e.target.value }))}
                disabled={!value.secondPilotId}
              />
            </div>
          </div>
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
    <ConfirmDialog
      open={confirmDelete}
      onOpenChange={setConfirmDelete}
      title="Delete this trip?"
      description="This trip will be moved to Recently deleted in Settings, where it can be restored."
      pending={deleting}
      onConfirm={handleDelete}
    />
    </>
  );
}

export { TripForm, emptyValue as emptyTripValue };
